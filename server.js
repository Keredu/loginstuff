const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const sqlite3 = require('sqlite3').verbose();

// create a new database file 'users.db'
const db = new sqlite3.Database('./users.db');

// create a new table for users
db.run("CREATE TABLE IF NOT EXISTS user (name TEXT, password TEXT)");



app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



app.post('/login', (req, res) => {
    const { name, password } = req.body;

    db.get("SELECT name FROM user WHERE name = ? AND password = ?", [name, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            return res.json({ message: "Logged in!" });
        } else {
            return res.status(400).json({ message: "The combination of name and password doesn't exist." });
        }
    });
});



app.post('/register', (req, res) => {
    const { name, password } = req.body;

    // TODO: add password hashing here for security
    
    db.run(`INSERT INTO user(name, password) VALUES(?, ?)`, [name, password], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json({ message: "User registered successfully!" });
    });
});


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
