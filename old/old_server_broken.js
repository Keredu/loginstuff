const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./users.db');

// create a new table for users
db.run("CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE username = ?", [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: "The combination of username and password doesn't exist." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.json({ message: "Logged in!" });
        } else {
            return res.status(400).json({ message: "The combination of username and password doesn't exist." });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO user(username, password) VALUES(?, ?)`, [username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            return res.json({ message: "User registered successfully!" });
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error hashing password' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
