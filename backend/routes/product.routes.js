
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");
const upload = require('../middlewares/upload.middleware');


// Routes
router.get('/', auth, authorize('manage product & service'), productController.index);
router.get('/:id', auth, authorize('manage product & service'), productController.show);
router.post('/', auth, authorize('create product & service'), upload.single('pro_image'), productController.create);
router.put('/:id', auth, authorize('edit product & service'), upload.single('pro_image'), productController.update);
router.delete('/:id', auth, authorize('delete product & service'), productController.destroy);

module.exports = router;


