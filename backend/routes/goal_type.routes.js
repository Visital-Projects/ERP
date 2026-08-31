

// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/goal_type.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.remove);

// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/goal_type.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Permissions:
// - manage goal type
// - create goal type
// - edit goal type
// - delete goal type

router.get( '/', auth, authorize('manage goal type'), controller.getAll );

router.get( '/:id', auth, authorize('manage goal type'), controller.getById );

router.post( '/', auth, authorize('create goal type'), controller.create );

router.put( '/:id', auth, authorize('edit goal type'), controller.update );

router.delete( '/:id', auth, authorize('delete goal type'), controller.remove );

module.exports = router;
