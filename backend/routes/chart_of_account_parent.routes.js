const express = require('express');
const router = express.Router();
const controller = require('../controllers/chart_of_account_parent.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// CRUD
router.get('/',auth, controller.getAll);
router.get('/:id',auth, controller.getById);
router.post('/',auth, controller.create);
router.put('/:id',auth, controller.update);
router.delete('/:id',auth, controller.remove);

module.exports = router;
