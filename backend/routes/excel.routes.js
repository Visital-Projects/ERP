const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadExcel } = require("../controllers/excel.controller");
const auth = require('../middlewares/auth.middleware');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route (field name = "excel")
router.post("/upload-excel",auth, upload.single("excel"), uploadExcel);

module.exports = router;
