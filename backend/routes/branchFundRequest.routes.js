const express = require("express");
const router = express.Router();
const fundRequestController = require("../controllers/branchFundRequest.controller");
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// ====================
// Branch Manager Routes
// ====================

// Create new fund request (branch manager)
router.post("/",auth,authorize('create fund request'), fundRequestController.createFundRequest);

// Get my branch's fund requests
router.get("/my",auth,authorize('manage fund request'), fundRequestController.getMyFundRequests);

// ====================
// Company / Head Routes
// ====================

// Get all fund requests (all branches)
router.get("/",auth,authorize('manage fund request'), fundRequestController.getAllFundRequests);

// Process fund request (approve or reject)
router.patch("/:id/process",auth,authorize('edit fund request'), auth, fundRequestController.processFundRequest);


module.exports = router;
