const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");

// CRUD Routes
router.post("/", auth, authorize("create_customer"), customerController.createCustomer);
router.get("/", auth, authorize("read_customer"), customerController.getAllCustomers);
router.get("/:id", auth, authorize("read_customer"), customerController.getCustomerById);
router.put("/:id", auth, authorize("update_customer"), customerController.updateCustomer);
router.delete("/:id", auth, authorize("delete_customer"), customerController.deleteCustomer);

module.exports = router;
