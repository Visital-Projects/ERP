// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/deductionOption.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/deductionOption.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Routes with role/permission checks
router.get( '/', auth, authorize('manage deduction option'), controller.getAll );

router.get( '/:id', auth, authorize('manage deduction option'), controller.getById );

router.post( '/', auth, authorize('create deduction option'), controller.create );

router.put( '/:id', auth, authorize('edit deduction option'), controller.update );

router.delete( '/:id', auth, authorize('delete deduction option'), controller.delete );

module.exports = router;
