

const express = require('express');
const router = express.Router();
const controller = require('../controllers/allowance.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.post('/', auth, authorize('create allowance'), controller.create);
router.get('/', auth, controller.getAll);
router.get('/employee/:id', auth, controller.getByEmployeeId);
router.put('/:id', auth, authorize('edit allowance'), controller.update);
router.delete('/:id', auth, authorize('delete allowance'), controller.remove);

module.exports = router;












    