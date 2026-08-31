// routes/bill.routes.js

const express = require("express");
const router = express.Router();
const billController = require("../controllers/bill.controller");


const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
// ===============================
// Bill Routes
// ===============================


// GET all bills
router.get("/", auth, billController.getAll);

// GET single bill by ID
router.get("/:id", auth, billController.getById);

// CREATE new bill
router.post("/", auth,billController.create);

// UPDATE bill by ID
router.put("/:id", auth,billController.update);

// DELETE bill by ID
router.delete("/:id",auth, billController.delete);

module.exports = router;
