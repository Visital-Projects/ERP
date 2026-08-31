// routes/bank_account.routes.js
const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bank_account.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// CRUD routes
router.get('/',auth, bankAccountController.getAll);
router.get('/:id',auth, bankAccountController.getById);
router.post('/',auth, bankAccountController.create);
router.patch('/:id',auth, bankAccountController.update);
router.delete('/:id',auth, bankAccountController.remove);

module.exports = router;
