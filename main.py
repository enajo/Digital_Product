from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

# Allow frontend JS to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB and table if not exists
conn = sqlite3.connect('db.sqlite')
conn.execute('CREATE TABLE IF NOT EXISTS clicks (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
conn.commit()

@app.post("/click")
async def record_click():
    conn = sqlite3.connect('db.sqlite')
    conn.execute('INSERT INTO clicks DEFAULT VALUES')
    conn.commit()
    return {"status": "Click recorded!"}
