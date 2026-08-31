// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.getAuthenticatedUser);
router.put('/profile', auth, AuthController.updateProfile);

router.post('/refresh', AuthController.refreshToken);  // ✅ NEW
router.post('/logout', AuthController.logout);         // ✅ NEW



module.exports = router;
