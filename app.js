const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const logger = require("morgan");

const user = require("./routes/v1/user.js");
const event = require("./routes/v1/event.js");

const db_credentials = require("./config/db_credentials.js");
const conn = mysql.createConnection(db_credentials);


conn.connect(function (err) {
  if (err) {
    console.log("Error connecting to DB", err);
    return;
  }
  console.log("Connection Established Playo DB");
});


const app = express();

const {PORT} = process.env || 3000;

app.use(cors());
app.options('*', cors());

// Get the MySQL db connection
app.use(function (req, res, next) {
  req.con = conn;
  next();
});

app.use(logger("dev"));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/v1/", user);
app.use("/v1/", event);


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
