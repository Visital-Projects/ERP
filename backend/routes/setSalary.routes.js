

// const express = require('express');
// const router = express.Router();
// const setSalaryController = require('../controllers/setSalary.controller');
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize');

// router.post('/:employeeId', auth, authorize('create set salary'), setSalaryController.setSalary);
// router.put('/:employeeId', auth, authorize('edit set salary'), setSalaryController.setSalary);
// router.get('/:employeeId', auth, authorize('manage set salary'), setSalaryController.getSalaryByEmployee);

// router.get('/:employeeId/net-salary', auth,  setSalaryController.calculateNetSalary);



// module.exports = router;


const express = require('express');
const router = express.Router();
const setSalaryController = require('../controllers/setSalary.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.post('/:employeeId', auth, authorize('create set salary'), setSalaryController.setSalary);
router.put('/:employeeId', auth, authorize('edit set salary'), setSalaryController.setSalary);
router.get('/:employeeId', auth, authorize('manage set salary'), setSalaryController.getSalaryByEmployee);

router.get('/:employeeId/net-salary', auth,  setSalaryController.calculateNetSalary);
router.get('/:employeeId/gross-salary', auth,  setSalaryController.calculateGrossSalary);
router.get('/export/excel', auth, authorize('manage set salary'), setSalaryController.exportEmployeesExcel);



module.exports = router;
