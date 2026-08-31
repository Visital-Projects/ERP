
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/training.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/training.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.use(auth);

router.get('/', authorize('manage training'), controller.getAll);
router.get('/:id', authorize('show training'), controller.getById);
router.post('/', authorize('create training'), controller.create);
router.put('/:id', authorize('edit training'), controller.update);
router.delete('/:id', authorize('delete training'), controller.delete);

module.exports = router;
