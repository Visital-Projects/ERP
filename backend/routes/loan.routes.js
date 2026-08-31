


const express = require('express');
const router = express.Router();
const controller = require('../controllers/loan.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.use(auth);

router.post('/', auth, authorize('create loan'), controller.createLoan);
router.get('/', auth, controller.getAllLoans);
router.get('/employee/:id', auth, controller.getLoansByEmployeeId);
router.put('/:id', auth, authorize('edit loan'), controller.updateLoan);
router.delete('/:id', auth, authorize('delete loan'), controller.deleteLoan);

module.exports = router;
