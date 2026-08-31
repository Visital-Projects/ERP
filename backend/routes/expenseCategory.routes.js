const express = require("express");
const router = express.Router();
const expenseCategoryController = require("../controllers/expenseCategory.controller");
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Create a new category
router.post("/", auth, expenseCategoryController.createCategory);

// Get all categories
router.get("/", auth, expenseCategoryController.getAllCategories);
router.put("/:id", auth, expenseCategoryController.updateCategory);
// Soft delete a category
router.delete("/:id", auth, expenseCategoryController.softDeleteCategory);

module.exports = router;
