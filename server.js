const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const DB_NAME = './users.db';

if (fs.existsSync(DB_NAME)) {
    fs.unlinkSync(DB_NAME);
    console.log(`${DB_NAME} existed and it has been removed.`);
}

const db = new sqlite3.Database(DB_NAME);
console.log(`${DB_NAME} created.`);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function addUser(db, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await runQuery(db, `INSERT INTO user(username, password) VALUES(?, ?)`, [username, hashedPassword]);
}

async function getUserByName(db, name) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE username = ?", [name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function checkRegisterUsername(username) {
    let errors = [];
    if (username.length < 3) {
        errors.push('Username should be at least 3 characters long.');
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        errors.push('Username should contain only letters and numbers.');
    }

    return errors.join('\n');
}

function checkRegisterPassword(password) {
    let errors = [];

    if (password.length < 8) {
        errors.push('Password should be at least 8 characters long.');
    }
    if (!/[a-zA-Z]/.test(password)) {
        errors.push('Password should contain at least one letter.');
    }
    if (!/\d/.test(password)) {
        errors.push('Password should contain at least one number.');
    }
    if (!/[@$!%*?&#.]/.test(password)) {
        errors.push('Password should contain at least one of the special characters @$!%*?&#.');
    }
    
    return errors.join('\n');
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    usernameErrorMessage = checkRegisterUsername(username);
    if (!usernameErrorMessage) {
        const user = await getUserByName(db, username);
        if (user) {
            return res.status(400).json({ error: "Username already exists." });
        }
    }
    passwordErrorMessage = checkRegisterPassword(password);
    errorMessage = [usernameErrorMessage, passwordErrorMessage].filter(msg => msg !== '').join('\n');
    if (errorMessage) {
        return res.status(400).json({ error: errorMessage}); // Use 400 Bad Request
    }
    

    
    try {
        await addUser(db, username, password);
        return res.json({ message: "User registered successfully!" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: "Password field cannot be empty."}); // Use 400 Bad Request
    }
    
    try {
        const user = await getUserByName(db, username);
        if (user ? await bcrypt.compare(password, user.password) : false) {
            return res.json({ message: "Logged in!" });
        } else {
            return res.status(400).json({ error: "Invalid username/password." });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

db.run("CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)", [], (err) => {
    if (err) {
        console.error("Failed to create table: ", err.message);
    } else {
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
});
