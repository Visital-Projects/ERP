// const express = require('express');
// const router = express.Router();
// const leaveTypeController = require('../controllers/leave_type.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base route: /api/leave-types
// router.get('/', auth, leaveTypeController.getAllLeaveTypes);
// router.get('/:id', auth, leaveTypeController.getLeaveTypeById);
// router.post('/', auth, leaveTypeController.createLeaveType);
// router.put('/:id', auth, leaveTypeController.updateLeaveType);
// router.delete('/:id', auth, leaveTypeController.deleteLeaveType);

// module.exports = router;

const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/leave_type.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base route: /api/leave-types

// Manage (list all)
router.get('/', auth, authorize('manage leave type'), leaveTypeController.getAllLeaveTypes);

// View single
router.get('/:id', auth, authorize('manage leave type'), leaveTypeController.getLeaveTypeById);

// Create
router.post('/', auth, authorize('create leave type'), leaveTypeController.createLeaveType);

// Edit
router.put('/:id', auth, authorize('edit leave type'), leaveTypeController.updateLeaveType);

// Delete
router.delete('/:id', auth, authorize('delete leave type'), leaveTypeController.deleteLeaveType);

module.exports = router;
