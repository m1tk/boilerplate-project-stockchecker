const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./likes.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    stock TEXT PRIMARY KEY,
    likes INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes_ip (
    stock TEXT,
    ip_hash TEXT,
    PRIMARY KEY (stock, ip_hash),
    FOREIGN KEY (stock) REFERENCES likes(id)
  )`);
});

module.exports = db;