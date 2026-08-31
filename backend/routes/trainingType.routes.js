



// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/trainingType.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/trainingType.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Training Type routes with RBAC + multi-tenancy
router.get('/', auth, authorize('manage training type'), controller.getAll);
router.get('/:id', auth, authorize('manage training type'), controller.getById);
router.post('/', auth, authorize('create training type'), controller.create);
router.put('/:id', auth, authorize('edit training type'), controller.update);
router.delete('/:id', auth, authorize('delete training type'), controller.delete);

module.exports = router;
