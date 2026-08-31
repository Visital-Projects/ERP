

const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vender.controller");
const auth = require('../middlewares/auth.middleware');

// GET all vendors
router.get("/",auth, vendorController.getAll);

// GET vendor by ID
router.get("/:id",auth, vendorController.getById);

// CREATE vendor
router.post("/",auth, vendorController.create);

// UPDATE vendor
router.put("/:id",auth, vendorController.update);

// DELETE vendor (soft delete)
router.delete("/:id",auth, vendorController.delete);

module.exports = router;
