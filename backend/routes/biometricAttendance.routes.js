const express = require("express");
const router = express.Router();
const biometricApiKey = require("../middlewares/biometricApiKey");
const controller = require("../controllers/biometricAttendance.controller");


router.post(
  "/attendance/biometric-ingest",
  biometricApiKey,
  controller.biometricIngest
);

module.exports = router;
