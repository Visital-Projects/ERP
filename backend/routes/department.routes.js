// const express = require('express');
// const router = express.Router();
// const DepartmentController = require('../controllers/department.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/',auth, DepartmentController.getAllDepartments);
// router.get('/:id',auth, DepartmentController.getDepartmentById);
// router.post('/', auth,DepartmentController.createDepartment);
// router.put('/:id', auth,DepartmentController.updateDepartment);
// router.delete('/:id', auth,DepartmentController.deleteDepartment);

// //get department by branch id
// router.get('/branch/:branchId', auth, DepartmentController.getDepartmentsByBranchId); 


// module.exports = router;



const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// List departments (manage)
router.get('/', auth, authorize('manage department'), DepartmentController.getAllDepartments );


// Get single department (view)
router.get('/:id', auth, authorize('view department'), DepartmentController.getDepartmentById);

// Create department
router.post('/', auth, authorize('create department'), DepartmentController.createDepartment);

// Update department
router.put('/:id', auth, authorize('edit department'), DepartmentController.updateDepartment);

// Delete department
router.delete('/:id', auth, authorize('delete department'), DepartmentController.deleteDepartment);

// Get departments by branch
router.get('/branch/:branchId', auth, authorize('manage department'), DepartmentController.getDepartmentsByBranchId);


module.exports = router;
