

const express = require('express');
const router = express.Router();
const controller = require('../controllers/resignation.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/resignations
router.get('/', auth, authorize('manage resignation'), controller.getAllResignations);
router.get('/:id', auth, authorize('manage resignation'), controller.getResignationById);
router.post('/', auth, authorize('create resignation'), controller.createResignation);
router.put('/:id', auth, authorize('edit resignation'), controller.updateResignation);
router.delete('/:id', auth, authorize('delete resignation'), controller.deleteResignation);

module.exports = router;
