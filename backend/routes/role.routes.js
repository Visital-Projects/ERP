// routes/roles.js

const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth,RoleController.index);
router.get('/:id',auth, RoleController.show);
router.post('/', auth,RoleController.store);
router.put('/:id',auth, RoleController.update);
router.delete('/:id',auth, RoleController.destroy);

module.exports = router;



