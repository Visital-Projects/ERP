// const express = require('express');
// const router = express.Router();
// const complaintController = require('../controllers/complaint.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base: /api/complaints
// router.get('/', auth, complaintController.getAllComplaints);
// router.get('/:id', auth, complaintController.getComplaintById);
// router.post('/', auth, complaintController.createComplaint);
// router.put('/:id', auth, complaintController.updateComplaint);
// router.delete('/:id', auth, complaintController.deleteComplaint);

// module.exports = router;




const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/complaints
router.get('/', auth, authorize('manage complaint'), complaintController.getAllComplaints);
router.get('/:id', auth, authorize('manage complaint'), complaintController.getComplaintById);
router.post('/', auth, authorize('create complaint'), complaintController.createComplaint);
router.put('/:id', auth, authorize('edit complaint'), complaintController.updateComplaint);
router.delete('/:id', auth, authorize('delete complaint'), complaintController.deleteComplaint);

module.exports = router;
