

// const express = require('express');
// const router = express.Router();
// const companyPolicyController = require('../controllers/companyPolicy.controller');
// const auth = require('../middlewares/auth.middleware');
// const upload = require('../middlewares/upload.middleware');

// // Get all & by ID
// router.get('/', auth, companyPolicyController.getAll);
// router.get('/:id', auth, companyPolicyController.getById);

// // Create & Update with file upload
// router.post('/', auth, upload.single('attachment'), companyPolicyController.create);
// router.put('/:id', auth, upload.single('attachment'), companyPolicyController.update);

// // Delete
// router.delete('/:id', auth, companyPolicyController.delete);

// module.exports = router;




const express = require("express");
const router = express.Router();
const companyPolicyController = require("../controllers/companyPolicy.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload.middleware");

// Base: /api/company-policies

// Manage all
router.get(
  "/",
  auth,
  authorize("manage company policy"),
  companyPolicyController.getAll
);

// View single
router.get(
  "/:id",
  auth,
  authorize("manage company policy"),
  companyPolicyController.getById
);

// Create
router.post(
  "/",
  auth,
  authorize("create company policy"),
  upload.single("attachment"),
  companyPolicyController.create
);

// Update
router.put(
  "/:id",
  auth,
  authorize("edit company policy"),
  upload.single("attachment"),
  companyPolicyController.update
);

// Delete
router.delete(
  "/:id",
  auth,
  authorize("delete company policy"),
  companyPolicyController.delete
);

module.exports = router;
