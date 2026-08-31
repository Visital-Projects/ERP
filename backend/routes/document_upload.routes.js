const express = require('express');
const router = express.Router();
const controller = require('../controllers/document_upload.controller');
const upload = require('../middlewares/upload.middleware');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize')

router.get('/', auth, authorize('manage document'), controller.getAllDocuments);
router.get('/:id', auth,  authorize('manage document'), controller.getDocumentById);
router.post('/', auth,  authorize('create document'), upload.single('document'), controller.createDocument);
router.put('/:id', auth,  authorize('edit document'), upload.single('document'), controller.updateDocument);
router.delete('/:id', auth,  authorize('delete document'), controller.deleteDocument);

module.exports = router;
