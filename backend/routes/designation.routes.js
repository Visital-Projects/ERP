// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/designation.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth,controller.getAllDesignations);
// router.get('/:id',auth, controller.getDesignationById);
// router.post('/', auth,controller.createDesignation);
// router.put('/:id',auth, controller.updateDesignation);
// router.delete('/:id', auth,controller.deleteDesignation);

// //get designation in department id
// router.get('/department/:departmentId', auth, controller.getDesignationsByDepartmentId);



// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/designation.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Manage (list)
router.get('/', auth, authorize('manage designation'), controller.getAllDesignations);


// View
router.get('/:id', auth, authorize('view designation'), controller.getDesignationById);

// Create
router.post('/', auth, authorize('create designation'), controller.createDesignation);

// Update
router.put('/:id', auth, authorize('edit designation'), controller.updateDesignation);

// Delete
router.delete('/:id', auth, authorize('delete designation'), controller.deleteDesignation);

// Get by department
router.get('/department/:departmentId', auth, authorize('manage designation'), controller.getDesignationsByDepartmentId);

module.exports = router;
