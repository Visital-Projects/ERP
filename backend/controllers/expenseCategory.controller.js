const ExpenseCategory = require("../models/expenseCategory.model");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name required" });

    const category = await ExpenseCategory.create({
      name,
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create category", error: err.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch categories", error: err.message });
  }
};

// Soft Delete Category
exports.softDeleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await ExpenseCategory.findOne({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await category.update({ is_deleted: true });
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete category", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Category name required" });

    const category = await ExpenseCategory.findOne({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await category.update({
      name,
      updated_by: req.user.id, // track who updated
    });

    res.status(200).json({ success: true, data: category, message: "Category updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update category", error: err.message });
  }
};