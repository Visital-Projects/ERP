// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.mobile.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/login-with-branch', AuthController.loginWithBranch);

module.exports = router;