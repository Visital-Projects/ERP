const express = require('express');
const router = express.Router();
const controller = require('../controllers/overtime.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');


router.use(auth);

router.get('/', auth, controller.getAll);
router.get('/employee/:id', auth, controller.getByEmployeeId);
router.post('/', auth, authorize('create overtime'), controller.create);
router.put('/:id', auth, authorize('edit overtime'), controller.update);
router.delete('/:id', auth, authorize('delete overtime'), controller.remove);

module.exports = router;
