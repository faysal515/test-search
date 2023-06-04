const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(':memory:');

const run = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results);
      }
    });
  });
}

const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results);
      }
    });
  });
}

const addFriend = async (userId, friendId) => {
  const query = `INSERT INTO Friends (userId, friendId) VALUES (?, ?), (?, ?);`
  return await run(query, [userId, friendId, friendId, userId]);
}


const removeFriend = async (userId, friendId) => {
  const query = `DELETE FROM Friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?);`
  return await run(query, [userId, friendId, friendId, userId]);
}


module.exports = {
  run, all, addFriend, removeFriend
}