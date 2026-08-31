const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.get('/',auth, categoryController.getAll);
router.get('/:id',auth, categoryController.getById);
router.post('/',auth, categoryController.create);
router.put('/:id',auth, categoryController.update);
router.delete('/:id',auth, categoryController.remove);

module.exports = router;
