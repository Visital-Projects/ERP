// const express = require('express');
// const router = express.Router();
// const warningController = require('../controllers/warning.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base path: /api/warnings
// router.get('/', auth, warningController.getAllWarnings);
// router.get('/:id', auth, warningController.getWarningById);
// router.post('/', auth, warningController.createWarning);
// router.put('/:id', auth, warningController.updateWarning);
// router.delete('/:id', auth, warningController.deleteWarning);

// module.exports = router;



const express = require('express');
const router = express.Router();
const warningController = require('../controllers/warning.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base path: /api/warnings
router.get(
  '/',
  auth,
  authorize('manage warning'),
  warningController.getAllWarnings
);

router.get(
  '/:id',
  auth,
  authorize('view warning', 'manage warning'),
  warningController.getWarningById
);

router.post(
  '/',
  auth,
  authorize('create warning'),
  warningController.createWarning
);

router.put(
  '/:id',
  auth,
  authorize('edit warning'),
  warningController.updateWarning
);

router.delete(
  '/:id',
  auth,
  authorize('delete warning'),
  warningController.deleteWarning
);

module.exports = router;
