const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function createDB(db_name, callback) {
    if (fs.existsSync(db_name)) {
        fs.unlinkSync(db_name);
        console.log(`${db_name} existed and it has been removed.`);
    }
    const db = new sqlite3.Database(db_name, (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log(`${db_name} created.`);
        db.run("CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)", (err) => {
            if (err) {
                console.error('Error creating table:', err);
                return;
            }
            console.log('user table created.');
            callback(db);
        });
    });
}



function addUser(db, username, password, callback) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            callback(err);
            return;
        }
        db.run(`INSERT INTO user(username, password) VALUES(?, ?)`, [username, hashedPassword], (err) => {
            if (err) {
                console.error('Error adding user:', err.message);
                callback(err);
                return;
            }
            console.log("User registered successfully!");
            callback(null); // No error
        });
    });
}




function getUserByName(db, name) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE username = ?", [name], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}


async function checkLogin(db, username, password) {
    try {
        let row = await getUserByName(db, username);
        
        // If user doesn't exist
        if (!row) {
            console.log("User not found.");
            return false;
        }
        
        // Compare the provided password with the stored hashed password
        let isMatch = await bcrypt.compare(password, row.password);
        if (isMatch) {
            console.log("Login successful!");
            return true;
        } else {
            console.log("Invalid password.");
            return false;
        }
        
    } catch (error) {
        console.error("Error during login:", error);
        return false;
    }
}

function f(isValid) {
    if (isValid) {
        console.log("User is authenticated");
    } else {
        console.log("Authentication failed");
    }
}


const dbName = './test_users.db';

createDB(dbName, async (db) => {
    await new Promise((resolve, reject) => {
        addUser(db, "test_user", "test_password", (err) => {
            if (err) {
                console.error("Error during user registration:", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });

    console.log("=====================================");

    console.log("Case 1: (wrong username)");
    let isValid = await checkLogin(db, 'wrong_user', 'randompass');
    f(isValid);

    console.log("=====================================");

    console.log("Case 2: (wrong password)");
    isValid = await checkLogin(db, 'test_user', 'randompass');
    f(isValid);

    console.log("=====================================");

    console.log("Case 3: (correct username and password)");
    isValid = await checkLogin(db, 'test_user', 'test_password');
    f(isValid);

    console.log("=====================================");
});