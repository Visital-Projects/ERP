const express = require('express');
const router = express.Router();
const subTypeController = require('../controllers/chart_of_account_sub_type.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// fetch all sub-types
router.get('/',auth, subTypeController.getAll);

// fetch sub-type by id
router.get('/:id',auth, subTypeController.getById);
router.post('/',auth,subTypeController.create);
router.put('/:id',auth,subTypeController.update);
router.delete('/:id',auth,subTypeController.remove);

module.exports = router;
