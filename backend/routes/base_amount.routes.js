const express = require('express');
const router = express.Router();
const controller = require('../controllers/base_amount.controller');
const auth = require('../middlewares/auth.middleware'); 
const authorize = require('../middlewares/authorize');


router.post('/', auth, authorize('create base amount'), controller.create);
router.get('/', auth,authorize('manage base amount'), controller.getAll);
router.get('/:id', auth,authorize('manage base amount'), controller.getById);
router.put('/:id', auth,authorize('edit base amount'), controller.update);
router.delete('/:id', auth,authorize('delete base amount'), controller.remove);
module.exports = router;



