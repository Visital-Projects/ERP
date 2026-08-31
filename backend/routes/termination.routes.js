
/*
// const express = require('express');
// const router = express.Router();
// const terminationController = require('../controllers/termination.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base route: /api/terminations
// router.get('/', auth, terminationController.getAllTerminations);
// router.get('/:id', auth, terminationController.getTerminationById);
// router.post('/', auth, terminationController.createTermination);
// router.put('/:id', auth, terminationController.updateTermination);
// router.delete('/:id', auth, terminationController.deleteTermination);

// module.exports = router;

*/


const express = require('express');
const router = express.Router();
const terminationController = require('../controllers/termination.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize'); // assumes you have this middleware


router.get('/', auth, authorize('manage termination'), terminationController.getAllTerminations);
router.get('/:id', auth, authorize('manage termination'), terminationController.getTerminationById);
router.post('/', auth, authorize('create termination'), terminationController.createTermination);
router.put('/:id', auth, authorize('edit termination'), terminationController.updateTermination);
router.delete('/:id', auth, authorize('delete termination'), terminationController.deleteTermination);

module.exports = router;
