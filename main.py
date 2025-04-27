from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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

@app.get("/", response_class=HTMLResponse)
async def home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>One Button App</title>
    </head>
    <body>
      <h1>Simple Button</h1>
      <button onclick="clickButton()">Click me!</button>

      <script>
        async function clickButton() {
          await fetch('/click', { method: 'POST' });
          alert('Click recorded!');
        }
      </script>
    </body>
    </html>
    """

@app.post("/click")
async def record_click():
    conn = sqlite3.connect('db.sqlite')
    conn.execute('INSERT INTO clicks DEFAULT VALUES')
    conn.commit()
    return {"status": "Click recorded!"}

@app.get("/count")
async def get_click_count():
    conn = sqlite3.connect('db.sqlite')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM clicks')
    (count,) = cursor.fetchone()
    return {"click_count": count}
