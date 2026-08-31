

// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/performanceType.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/performanceType.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/performance-types
router.get( '/', auth, authorize('manage performance type'), controller.getAll );

router.get('/:id', auth, authorize('manage performance type'), controller.getById);


router.post( '/', auth, authorize('create performance type'), controller.create );

router.put( '/:id', auth, authorize('edit performance type'), controller.update );

router.delete( '/:id', auth, authorize('delete performance type'), controller.delete );

module.exports = router;
