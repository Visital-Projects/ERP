

const express = require('express');
const router = express.Router();
const controller = require('../controllers/employee_document.controller');
const upload = require('../middlewares/upload.middleware');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.post('/', auth, upload.fields([{ name: 'document_value', maxCount: 10 }]), controller.create);
router.put('/:id', auth, upload.single('document_value'), controller.update);


// <-- ADD THIS LINE (place before '/:id')
router.get('/employee/:employeeId', auth, controller.getByEmployeeId);




router.delete('/:id', auth, controller.remove);

module.exports = router;






