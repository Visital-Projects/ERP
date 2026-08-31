// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/employeeSalary.controller');

// router.get('/', controller.getAll);
// router.post('/', controller.create);
// // Add update/delete if needed

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeSalary.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/salaries
router.get('/', auth, authorize('manage set salary'), controller.getAllSalaries);
router.get('/:id', auth, authorize('manage set salary'), controller.getSalaryById);
router.post('/', auth, authorize('create set salary'), controller.createSalary);
router.put('/:id', auth, authorize('edit set salary'), controller.updateSalary);
router.delete('/:id', auth, controller.deleteSalary);

module.exports = router;
