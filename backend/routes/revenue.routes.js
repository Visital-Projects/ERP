const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenue.controller');
const upload = require('../middlewares/upload.middleware'); // your multer middleware

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// ===============================
// REVENUE ROUTES
// ===============================

// GET all revenues
router.get('/', auth, revenueController.getAll);

// GET revenue by ID
router.get('/:id',auth, revenueController.getById);

// CREATE revenue with file upload
router.post('/', auth,upload.single('add_receipt'), revenueController.create);

// UPDATE revenue with file upload
router.put('/:id',auth, upload.single('add_receipt'), revenueController.update);

// DELETE revenue
router.delete('/:id', auth,revenueController.softdelete);

module.exports = router;
