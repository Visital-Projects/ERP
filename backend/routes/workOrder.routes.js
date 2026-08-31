const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrder.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload.middleware');

router.get('/drafts',auth, authorize('manage work order'),  workOrderController.getDraftWorkOrders);
router.post('/',auth,authorize('create work order'),upload.array("documents", 10), workOrderController.createWorkOrder);
router.get('/',auth, authorize('manage work order'),  workOrderController.getAllWorkOrders);
router.get('/:id',auth,authorize('manage work order'),  workOrderController.getWorkOrderById);
router.patch('/:id',auth,authorize('edit work order'),upload.array("documents", 10),workOrderController.updateWorkOrder);
router.delete('/:id',auth,authorize('delete work order'),  workOrderController.deleteWorkOrder);


module.exports = router;
