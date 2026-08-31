const express = require("express");
const router = express.Router();
const itemController = require("../controllers/invoiceItem.controller");
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// ✅ Only authorized users can create/update/delete
router.post("/", auth, authorize(), itemController.createItem);
router.get("/:invoice/:Id", auth, itemController.getItemsByInvoice);
router.put("/:id", auth, authorize(), itemController.updateItem);
router.delete("/:id", auth, authorize(), itemController.deleteItem);
// Get ALL items
router.get("/",auth, itemController.getAllItems);
// Get single item by ID
router.get("/:id", auth,itemController.getItemById);


module.exports = router;
