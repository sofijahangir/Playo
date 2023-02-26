const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../../src/Model/v1/User");

exports.register = async (req, res) => {
  try {
    const db = req.con;
    const { username, password, email } = req.body;

    const emailExists = await User.checkEmailExists(db, email);

    if (emailExists) {
      return res.json({
        status: false,
        message: "Email already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.createAccount(db, username, hashedPassword, email);

    const token = jwt.sign({ email: email }, 'test', {
      expiresIn: 86400 // expires in 24 hours
    });

    res.json({
      status: true,
      message: "User registered successfully",
      data: {
        username: username,
        email: email,
        token: token
      }
    });
  } catch (err) {
    res.json({
      status: false,
      message: "Something went wrong",
      error: err
    })
  }
}


exports.login = async (req, res) => {
  try {
    const db = req.con;
    const { email, password } = req.body;

    let user = await User.checkEmailExists(db, email);

    if (!user) {
      return res.json({
        status: false,
        message: "Invalid email"
      });
    }

    user = await User.getByEmail(db, email);

    const passwordMatch = await bcrypt.compare(password, user.password);


    if (!passwordMatch) {
      return res.json({
        status: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign({ email: email }, 'test', {
      expiresIn: 86400 // expires in 24 hours
    });

    res.json({
      status: true,
      message: "User logged in successfully",
      data: {
        username: user.username,
        email: email,
        token: token
      }
    });
  } catch (err) {
    res.json({
      status: false,
      message: "Something went wrong",
      error: err
    })
  }
}
