// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/allowanceOption.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.remove);

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/allowanceOption.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Multi-tenancy + RBAC applied
router.get('/', auth, authorize('manage allowance option'), controller.getAll);

router.get('/:id', auth, authorize('manage allowance option'), controller.getById);

router.post('/', auth, authorize('create allowance option'), controller.create);
router.put('/:id', auth, authorize('edit allowance option'), controller.update);
router.delete('/:id', auth, authorize('delete allowance option'), controller.remove);

module.exports = router;
