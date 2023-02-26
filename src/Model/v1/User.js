module.exports = class User {
  
  // create an Account
  static createAccount(db, name, password, email) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, password, email) VALUES (?, ?, ?);",
        [name, password, email],
        function (err, row) {
          if (!err) {
            resolve(row);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  static getByEmail(db, email) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM users WHERE email = '${email}'`,
        function (err, row) {
          if (!err) {
            resolve(row[0]);
          } else {
            reject(err);
          }
        }
      );
    });
  }

  static checkEmailExists(db, email) {
    return new Promise(function (resolve, reject) {
      db.query(`SELECT COUNT(*) AS count FROM users WHERE email = '${email}'`, function (err, rows) {
        if (!err) {
          resolve(rows[0].count > 0);
        } else {
          reject(err);
        }
      });
    });
  }
  
};
