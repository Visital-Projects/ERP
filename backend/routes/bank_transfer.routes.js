// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/bank_transfer.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base route: /api/bank-transfers
// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;



// routes/bank_transfer.routes.js
const express = require('express');
const router = express.Router();
const bankTransferController = require('../controllers/bank_transfer.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, bankTransferController.getAll);
router.get('/:id', auth, bankTransferController.getById);
router.post('/', auth, bankTransferController.create);
router.patch('/:id', auth, bankTransferController.update);
router.delete('/:id', auth, bankTransferController.remove);

module.exports = router;
