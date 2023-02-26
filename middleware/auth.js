const jwt = require('jsonwebtoken');
const User = require('../src/Model/v1/User');

exports.authenticate = async (req, res, next) => {
  const db = req.con;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized: missing or invalid token",
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'test');

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: token expired",
      });
    }

    const userEmail = decoded.email;
    const user = await User.getByEmail(db, userEmail);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: user not found",
      });
    }

    req.user_id = user.id;
    next();
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized: invalid token",
    });
  }
};
