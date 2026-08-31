
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Validation
const validateDocument = [
  body('name').notEmpty().withMessage('Name is required'),
  body('is_required').notEmpty().withMessage('is_required is required')
];

// Routes with permission checks
router.get('/', auth, authorize('manage document type'), documentController.getAllDocuments);
router.get('/:id', auth, authorize('manage document type'), documentController.getDocumentById);
router.post('/', auth, authorize('create document type'), validateDocument, documentController.createDocument);
router.put('/:id', auth, authorize('edit document type'), documentController.updateDocument);
router.delete('/:id', auth, authorize('delete document type'), documentController.deleteDocument);

module.exports = router;


