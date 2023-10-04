from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import FileResponse
import bcrypt
import sqlite3
import os


app = FastAPI()

# Establish a connection to the database
DB_NAME = './users.db'
db = sqlite3.connect(DB_NAME, check_same_thread=False)

def run_query(query, params=()):
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    return cursor

async def addUser(username, password):
    hashedPassword = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    run_query("INSERT INTO user(username, password) VALUES (?, ?)", (username, hashedPassword.decode('utf-8')))

def getUserByName(name):
    cursor = run_query("SELECT * FROM user WHERE username = ?", (name,))
    return cursor.fetchone()

@app.post("/login")
async def login(username: str = Body(...), password: str = Body(...)):
    user = getUserByName(username)
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
    if bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
        return {"message": "Logged in!"}
    else:
        raise HTTPException(status_code=400, detail="Invalid password.")

@app.post("/register")
async def register(username: str = Body(...), password: str = Body(...)):
    try:
        await addUser(username, password)
        return {"message": "User registered successfully!"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already taken.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def serve_root():
    return FileResponse("index.html")

@app.get("/{filename:path}")
def serve_file(filename: str):
    return FileResponse(filename)

if __name__ == "__main__":
    if not os.path.exists(DB_NAME):
        try:
            run_query("CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)")
        except Exception as e:
            print(f"Failed to create table: {e}")
    else:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=3000)
