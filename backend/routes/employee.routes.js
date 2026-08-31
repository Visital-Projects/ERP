
const express = require('express');
const router = express.Router();

const employeeController = require('../controllers/employee.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');   // ✅ ensure correct path
const upload = require('../middlewares/upload.middleware');


router.get('/summary', auth, authorize('manage employee'), employeeController.getAllEmployeesSummary);
router.get('/branch/:branchId', auth , employeeController.getEmployeesByBranch);
router.get('/', auth, authorize('manage employee'), employeeController.getAllEmployees);
router.get('/:id', auth, authorize('manage employee'), employeeController.getEmployeeById);
router.post('/', auth, authorize('create employee'), upload.any(), employeeController.createEmployee);
router.put('/:id', auth, authorize('edit employee'), upload.any(), employeeController.updateEmployee);
router.delete('/:id', auth, authorize('delete employee'), employeeController.deleteEmployee);

//aadhaar number check
router.post('/check-aadhaar', auth, employeeController.checkAadhaar);

//rejoin reason
router.post('/rejoin', auth, employeeController.rejoinEmployee);

router.patch('/biometric/:employee_id', auth, authorize('edit employee'), employeeController.updateEmbedding);


module.exports = router;
