const db = require('./index');

const addLike = (stock, ip_hash) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          return reject('Failed to start transaction');
        }

        db.run(`INSERT INTO likes_ip (stock, ip_hash) VALUES (?, ?)`,
          [stock, ip_hash], function(err) {
          if (err) {
            if (!this.changes) {
              db.run("ROLLBACK", () => {});
              getLikes(stock)
              .then(likes => {
                resolve(likes);
              });
              return;
            } else {
              db.run("ROLLBACK", () => {
                reject('Failed to add like ip hash');
                return;
              });
            }
          }
          if (!this.lastID) {
            getLikes(stock)
              .then(likes => {
                resolve(likes);
              })
            return;
          }
          db.get(`INSERT INTO likes (stock, likes) VALUES (?, 1)
            ON CONFLICT DO UPDATE SET likes = likes + 1
            returning likes;`,
            [stock], (err, row) => {
            if (err) {
              db.run("ROLLBACK", () => reject('Failed to add like'));
              return;
            }
            db.run("COMMIT", (err) => {
              if (err) {
                reject('Failed to commit transaction');
                return;
              }
              resolve(row.likes);
            });
          });
        });

      });
    });
  });
};

const getLikes = (stock) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT likes FROM likes WHERE stock = ?`;
    db.get(sql, [stock], (err, row) => {
      if (err) {
        reject('Failed getting likes');
        return;
      }
      resolve(row ? row.likes : 0);
    });
  });
};

module.exports = {
  addLike,
  getLikes
};