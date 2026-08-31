// routes/permissions.js

const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/permission.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/',auth, PermissionController.index);
router.post('/',auth, PermissionController.store);
router.delete('/:id',auth, PermissionController.destroy);

module.exports = router;
