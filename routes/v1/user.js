const express = require("express");
const router = express.Router();

const userController = require('../../controllers/v1/user');
const auth = require('../../middleware/auth');

router.post('/user/register', userController.register);
router.post('/user/login',auth.authenticate, userController.login);

module.exports = router;