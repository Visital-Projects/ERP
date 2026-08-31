// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/termination_type.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base: /api/termination-types
// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/termination_type.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');


// Base: /api/termination-types
router.get( '/', auth, authorize('manage termination type'), controller.getAll );

router.get( '/:id', auth, authorize('manage termination type'), controller.getById );

router.post( '/', auth, authorize('create termination type'), controller.create );

router.put( '/:id', auth, authorize('edit termination type'), controller.update );

router.delete( '/:id', auth, authorize('delete termination type'), controller.delete );

module.exports = router;
