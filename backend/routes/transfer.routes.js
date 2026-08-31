// const express = require('express');
// const router = express.Router();
// const transferController = require('../controllers/transfer.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base Route: /api/transfers
// router.get('/', auth, transferController.getAllTransfers);
// router.get('/:id', auth, transferController.getTransferById);
// router.post('/', auth, transferController.createTransfer);
// router.put('/:id', auth, transferController.updateTransfer);
// router.delete('/:id', auth, transferController.deleteTransfer);

// module.exports = router;


const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base Route: /api/transfers

// Manage (list + view)
router.get('/',     auth, authorize('manage transfer'), transferController.getAllTransfers);
router.get('/:id',  auth, authorize('manage transfer'), transferController.getTransferById);

// Create
router.post('/',    auth, authorize('create transfer'), transferController.createTransfer);

// Edit
router.put('/:id',  auth, authorize('edit transfer'),   transferController.updateTransfer);

// Delete
router.delete('/:id', auth, authorize('delete transfer'), transferController.deleteTransfer);

module.exports = router;
