const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

async function createDB(db_name) {
    if (fs.existsSync(db_name)) {
        fs.unlinkSync(db_name);
        console.log(`${db_name} existed and it has been removed.`);
    }

    const db = new sqlite3.Database(db_name);
    console.log(`${db_name} created.`);
    await runQuery(db, "CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)");
    console.log('user table created.');
    return db;
}

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

function getUserByName(db, name) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE username = ?", [name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function checkLogin(db, username, password) {
    const row = await getUserByName(db, username);
    if (!row) {
        console.log("User not found.");
        return false;
    }

    const isMatch = await bcrypt.compare(password, row.password);
    if (isMatch) {
        console.log("Login successful!");
        return true;
    } else {
        console.log("Invalid password.");
        return false;
    }
}

function logAuthenticationResult(isValid) {
    console.log(isValid ? "User is authenticated" : "Authentication failed");
}

async function main(dbName, username, password) {
    const db = await createDB(dbName);

    try {
        await addUser(db, username, password);

        console.log("=====================================");
        console.log("Case 1: (wrong username)");
        logAuthenticationResult(await checkLogin(db, 'wrong_user', 'randompass'));

        console.log("=====================================");
        console.log("Case 2: (wrong password)");
        logAuthenticationResult(await checkLogin(db, username, 'randompass'));

        console.log("=====================================");
        console.log("Case 3: (correct username and password)");
        logAuthenticationResult(await checkLogin(db, username, password));

        console.log("=====================================");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main('./test_users.db', "test_user", "test_password");
