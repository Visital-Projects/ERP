const express = require("express");
const router = express.Router();
const productStockController = require("../controllers/productstock.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");


router.get("/", auth, authorize('edit product & service'), productStockController.index);
router.put("/:id", auth, authorize('edit product & service'), productStockController.update);

module.exports = router;
