// routes/accounts.routes.js
const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');

// =======================
// Accounts Routes
// =======================

// Get all accounts
router.get('/', auth, AccountController.getAllAccounts);

// Get account by ID
router.get('/:id', auth, AccountController.getAccountById);

// Create new account
router.post('/', auth, AccountController.createAccount);

// Update account by ID
router.put('/:id', auth, AccountController.updateAccount);

// Delete account by ID
router.delete('/:id', auth, AccountController.deleteAccount);

module.exports = router;
