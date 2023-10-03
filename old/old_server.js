const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

const sqlite3 = require('sqlite3').verbose();

// create a new database file 'users.db'
const db = new sqlite3.Database('./users.db');

// create a new table for users
db.run("CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)");



app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT name FROM user WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            return res.json({ message: "Logged in!" });
        } else {
            return res.status(400).json({ message: "The combination of username and password doesn't exist." });
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM user WHERE username = ?", [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            bcrypt.compare(password, row.password, (err, result) => {
                if(err) {
                    return res.status(500).json({ error: 'Error comparing password' });
                }
                if(result) {
                    return res.json({ message: "Logged in!" });
                } else {
                    return res.status(400).json({ message: "The combination of username and password doesn't exist." });
                }
            });
        } else {
            return res.status(400).json({ message: "The combination of username and password doesn't exist." });
        }
    });
});



app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {  // 10 is the saltRounds, you can adjust as necessary
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        db.run(`INSERT INTO user(username, password) VALUES(?, ?)`, [username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            return res.json({ message: "User registered successfully!" });
        });
    });
});






const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
