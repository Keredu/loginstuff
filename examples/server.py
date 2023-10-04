from fastapi import FastAPI, HTTPException, Form
import bcrypt
import sqlite3
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# This will allow serving of any static file from the current directory
app.mount("/", StaticFiles(directory="."), name="static")

db = sqlite3.connect('./users.db', check_same_thread=False)

def run_query(db, query, params=()):
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    return cursor

async def addUser(username, password):
    hashedPassword = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    run_query(db, "INSERT INTO user(username, password) VALUES (?, ?)", (username, hashedPassword.decode('utf-8')))

def getUserByName(name):
    cursor = run_query(db, "SELECT * FROM user WHERE username = ?", (name,))
    return cursor.fetchone()

@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    user = getUserByName(username)
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
    if bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
        return {"message": "Logged in!"}
    else:
        raise HTTPException(status_code=400, detail="Invalid password.")

@app.post("/register")
async def register(username: str = Form(...), password: str = Form(...)):
    try:
        await addUser(username, password)
        return {"message": "User registered successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    DB_NAME = './users.db'
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    try:
        run_query(db, "CREATE TABLE IF NOT EXISTS user (username TEXT, password TEXT)")
    except Exception as e:
        print(f"Failed to create table: {e}")
    else:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=3000)

    # NOTE: Not working 100% (the alerts show undefined)
