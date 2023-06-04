const db = require('./database');

const init = async () => {
  try {
    await db.run('CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(32));');
    await db.run('CREATE TABLE Friends (id INTEGER PRIMARY KEY AUTOINCREMENT, userId int, friendId int);');
    await db.run('CREATE INDEX idx_users_name ON Users(name);')
    await db.run('CREATE UNIQUE INDEX idx_friends_userid_friendid ON Friends(userId, friendId);')

    const users = [];
    const names = ['foo', 'bar', 'baz'];
    for (i = 0; i < 27000; ++i) {
      let n = i;
      let name = '';
      for (j = 0; j < 3; ++j) {
        name += names[n % 3];
        n = Math.floor(n / 3);
        name += n % 10;
        n = Math.floor(n / 10);
      }
      users.push(name);
    }

    const friends = users.map(() => []);
    for (i = 0; i < friends.length; ++i) {
      const n = 10 + Math.floor(90 * Math.random());
      const list = [...Array(n)].map(() => Math.floor(friends.length * Math.random()));
      list.forEach((j) => {
        if (i === j) {
          return;
        }
        if (friends[i].indexOf(j) >= 0 || friends[j].indexOf(i) >= 0) {
          return;
        }
        friends[i].push(j);
        friends[j].push(i);
      });
    }
    console.log("Init Users Table...");
    await Promise.all(users.map((un) => db.run(`INSERT INTO Users (name) VALUES ('${un}');`)));
    console.log("Init Friends Table...");
    await Promise.all(friends.map((list, i) => {
      return Promise.all(list.map((j) => db.run(`INSERT INTO Friends (userId, friendId) VALUES (${i + 1}, ${j + 1});`)));
    }));
    console.log("Ready.");
  } catch(e) {
    console.error('Unexpected error', e)
    process.exit(1)
  }
  
}

const search = async (req, res) => {
  const name = req.params.query;
  const userId = parseInt(req.params.userId);
  
  const sqlQuery = `
  SELECT U.id, U.name,
  CASE
      WHEN F1.friendId IS NOT NULL THEN 1
      WHEN EXISTS (
          SELECT 1 FROM Friends F2
          WHERE F2.userId = U.id AND 
                F2.friendId IN (SELECT friendId FROM Friends WHERE userId = ?)
      ) THEN 2
      ELSE 0
  END as connection
  FROM Users U
  LEFT JOIN Friends F1 ON U.id = F1.friendId AND F1.userId = ?
  WHERE U.name LIKE ? and U.id != ?
  LIMIT 20;
  `
 

  db.all(sqlQuery, [userId, userId, `${name}%`, userId]).then((results) => {
    res.statusCode = 200;
    res.json({
      success: true,
      users: results
    });
  }).catch((err) => {
    res.statusCode = 500;
    res.json({ success: false, error: err });
  });
}


const makeFriend = async (req, res) => {
  const {userId, friendId} = req.params
  db.addFriend(userId, friendId)
  .then(() => {
    res.statusCode = 200;
    res.json({
      success: true,
    });
  })
  .catch(err => {
    res.statusCode = 500;
    res.json({ success: false, error: err });
  })
}

const makeUnFriend = async (req, res) => {
  const {userId, friendId} = req.params
  db.removeFriend(userId, friendId)
  .then(() => {
    res.statusCode = 200;
    res.json({
      success: true,
    });
  })
  .catch(err => {
    res.statusCode = 500;
    res.json({ success: false, error: err });
  })
}

module.exports = {
  init,
  search,
  makeFriend,
  makeUnFriend
}


