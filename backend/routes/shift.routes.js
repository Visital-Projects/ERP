

// routes/shift.routes.js
const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shift.controller");
const auth = require('../middlewares/auth.middleware');

// Create
router.post("/", auth,shiftController.createShift);

// Read all
router.get("/",auth, shiftController.getAllShifts);

// Read one
router.get("/:id",auth, shiftController.getShiftById);

// Update
router.put("/:id", auth,shiftController.updateShift);

// Delete
router.delete("/:id", auth,shiftController.deleteShift);

module.exports = router;
