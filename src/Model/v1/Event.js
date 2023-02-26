module.exports = class Event {
  static createEvent(db, title, description, location, eventTime, maxPlayers, organizerId) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO events (title, description, location, start_time, max_players, organizer_id) VALUES (?, ?, ?, ?, ?, ?);",
        [title, description, location, eventTime, maxPlayers, organizerId],
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

  static getByUserAndEvent(db, userId, eventId) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM event_join WHERE user_id = ${userId} AND event_id = ${eventId}`,
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

  static createJoinRequest(db, userId, eventId) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO event_join (user_id, event_id, status ) VALUES (?, ?, ?);",
        [userId, eventId, 'pending'],
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

  static updateStatus(db, joinId, status) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE event_join SET status = ? WHERE id = ?;",
        [status, joinId],
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

  static getEventById(db, eventId) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM events WHERE id = ${eventId}`,
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

  static getEventByJoinId(db, joinId) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM event_join WHERE id = ${joinId}`,
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

  static getAllUpcomingSortedByTime(db) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM events WHERE start_time > NOW() ORDER BY start_time ASC`,
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

  static getJoinRequest(db, user_id, event_id) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM event_join WHERE user_id = ${user_id} AND event_id = ${event_id}`,
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

  static cancelJoinRequest(db, user_id, event_id) {
    return new Promise(function (resolve, reject) {
      db.query(
        `DELETE FROM event_join WHERE user_id = ${user_id} AND event_id = ${event_id}`,
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

  static getTotalJoined(db, event_id) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT COUNT(*) as total FROM event_join WHERE event_id = ${event_id} AND status = 'accepted'`,
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

  static acceptJoinRequest(db, user_id, event_id) {
    return new Promise(function (resolve, reject) {
      db.query(
        `UPDATE event_join SET status = 'accepted' WHERE user_id = ${user_id} AND event_id = ${event_id}`,
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

  static getEventPlayers(db, event_id) {
    return new Promise(function (resolve, reject) {
      db.query(
        `SELECT event_join.*,
        users.name,
        users.email
        FROM event_join
        INNER JOIN users ON users.id = event_join.user_id
        WHERE event_join.event_id = ${event_id} AND event_join.status = 'accepted'`,
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
};
