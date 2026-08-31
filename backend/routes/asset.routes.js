
// const express = require('express');
// const router = express.Router();
// const assetController = require('../controllers/asset.controller');
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize');

// // Manage all assets
// router.get('/', auth, authorize('manage assets'), assetController.getAllAssets);

// // View single asset (allowed if manage assets or assigned employee later logic)
// router.get('/:id', auth, authorize('manage assets'), assetController.getAssetById);

// // Create asset
// router.post('/', auth, authorize('create assets'), assetController.createAsset);

// // Update asset
// router.put('/:id', auth, authorize('edit assets'), assetController.updateAsset);

// // Delete asset
// router.delete('/:id', auth, authorize('delete assets'), assetController.deleteAsset);

// module.exports = router;


const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize'); // your role/permission middleware

// Apply auth + role check for all routes
router.get('/', auth, authorize('manage assets'), assetController.getAllAssets);
router.get('/:id', auth, authorize('manage assets'), assetController.getAssetById);
router.post('/', auth, authorize('manage assets'), assetController.createAsset);
router.put('/:id', auth, authorize('manage assets'), assetController.updateAsset);
router.delete('/:id', auth, authorize('manage assets'), assetController.deleteAsset);

module.exports = router;
