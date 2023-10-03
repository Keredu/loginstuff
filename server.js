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
    console.log("User registered successfully!");
}

async function getUserByName(db, name) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE username = ?", [name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await getUserByName(db, username);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.json({ message: "Logged in!" });
        } else {
            return res.status(400).json({ message: "Invalid password." });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        await addUser(db, username, password);
        return res.json({ message: "User registered successfully!" });
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
