// const express = require('express');
// const router = express.Router();
// const vendorNameController = require('../controllers/vendorName.controller');
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize');

// router.post(
//     '/',
//     auth,
//     authorize('create vendor'),
//     vendorNameController.createVendorName
// );

// router.get(
//     '/',
//     auth,
//     authorize('manage vendor'),
//     vendorNameController.getAllVendorNames
// );

// router.get(
//     '/:id',
//     auth,
//     authorize('manage vendor'),
//     vendorNameController.getVendorNameById
// );

// router.put(
//     '/:id',
//     auth,
//     authorize('edit vendor'),
//     vendorNameController.updateVendorName
// );

// router.delete(
//     '/:id',
//     auth,
//     authorize('delete vendor'),
//     vendorNameController.deleteVendorName
// );

// module.exports = router;





const express = require('express');
const router = express.Router();
const vendorNameController = require('../controllers/vendorName.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.post(
    '/',
    auth,
    authorize('create vendor'),
    vendorNameController.create
);

router.get(
    '/',
    auth,
    authorize('manage vendor'),
    vendorNameController.getAll
);

router.get(
    '/:id',
    auth,
    authorize('manage vendor'),
    vendorNameController.getById
);

router.put(
    '/:id',
    auth,
    authorize('edit vendor'),
    vendorNameController.update
);

router.delete(
    '/:id',
    auth,
    authorize('delete vendor'),
    vendorNameController.remove
);

module.exports = router;
