

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { validateLeave } = require('../middlewares/validators/leaveValidator');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');


router.post('/', auth, authorize('create leave'), validateLeave, leaveController.createLeave);
router.get('/', auth, authorize('manage leave'), leaveController.getAllLeaves);
router.get('/:id', auth, authorize('manage leave'), leaveController.getLeaveById);
router.put('/:id', auth, authorize('edit leave'), validateLeave, leaveController.updateLeave);
router.delete('/:id', auth, authorize('delete leave'), leaveController.deleteLeave);

// NEW: approve/reject (company only — use appropriate permission for your app)
// router.patch('/:id/status', auth, authorize('manage leave'), leaveController.approveRejectLeave);

// 🆕 NEW ROUTE
router.get('/employee/:employee_id', auth, authorize('manage leave'), leaveController.getLeaveByEmployeeId);
// router.get('/employee/:employeeBusinessId', authorize('manage leave'), auth, leaveController.getLeavesByEmployeeId);



module.exports = router;
