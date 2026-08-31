const express = require('express');
const router = express.Router();
const billPaidController = require('../controllers/bill_paid.controller');
const auth = require('../middlewares/auth.middleware');

// CRUD
router.post('/',auth, billPaidController.create);
router.get('/',auth, billPaidController.getAll);
router.get('/:id',auth, billPaidController.getById);
router.patch('/:id',auth, billPaidController.update);
router.delete('/:id',auth, billPaidController.remove);

module.exports = router;
