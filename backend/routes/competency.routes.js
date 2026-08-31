


// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/competency.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/competency.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/competencies
router.get('/', auth, authorize('manage competencies'), controller.getAll);
router.get('/:id', auth, authorize('manage competencies'), controller.getById);
router.post('/', auth, authorize('create competencies'), controller.create);
router.put('/:id', auth, authorize('edit competencies'), controller.update);
router.delete('/:id', auth, authorize('delete competencies'), controller.delete);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/competency.controller');
// const auth = require('../middlewares/auth.middleware');
// const { authorize } = require('../middlewares/authorize.middleware');

// // Base: /api/competencies
// router.get( '/', auth, authorize('manage competencies'), controller.getAll );

// router.get( '/:id', auth, authorize('manage competencies'), controller.getById );

// router.post( '/', auth, authorize('create competencies'), controller.create );

// router.put( '/:id', auth, authorize('edit competencies'), controller.update );

// router.delete( '/:id', auth, authorize('delete competencies'), controller.delete );

// module.exports = router;
