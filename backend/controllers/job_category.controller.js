


// const JobCategory = require("../models/job_category.model");
// const Employee = require("../models/employee.model");

// // ✅ Helper: Tenant isolation
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === "Employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // company login
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || "").toLowerCase();
//   return t === "company" || t === "admin";
// }

// // ---------------------------------------------------------
// // Get all job categories
// exports.getAllJobCategories = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { created_by: companyId };

//     // employees still see only company’s job categories (no cross-company leakage)
//     if (!isCompanyUser(req)) {
//       where.created_by = companyId;
//     }

//     const categories = await JobCategory.findAll({
//       where,
//       order: [["id", "DESC"]],
//     });
//     res.json({ success: true, data: categories });
//   } catch (error) {
//     console.error("❌ Get Job Categories Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ---------------------------------------------------------
// // Get single job category
// exports.getJobCategoryById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const category = await JobCategory.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });
//     if (!category) return res.status(404).json({ success: false, message: "Job category not found" });

//     res.json({ success: true, data: category });
//   } catch (error) {
//     console.error("❌ Get Job Category Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ---------------------------------------------------------
// // Create job category
// exports.createJobCategory = async (req, res) => {
//   try {
//     const { title } = req.body;
//     if (!title?.trim()) {
//       return res.status(400).json({ success: false, message: "Title is required" });
//     }

//     const companyId = await getCompanyId(req);

//     // optional: prevent duplicate titles inside same company
//     const exists = await JobCategory.findOne({ where: { title: title.trim(), created_by: companyId } });
//     if (exists) {
//       return res.status(400).json({ success: false, message: "Job category already exists" });
//     }

//     const newCategory = await JobCategory.create({
//       title: title.trim(),
//       created_by: companyId,
//     });

//     res.status(201).json({ success: true, data: newCategory });
//   } catch (error) {
//     console.error("❌ Create Job Category Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ---------------------------------------------------------
// // Update job category
// exports.updateJobCategory = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const category = await JobCategory.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!category) return res.status(404).json({ success: false, message: "Job category not found" });

//     const { title } = req.body;
//     if (title?.trim()) {
//       // check duplicate
//       const exists = await JobCategory.findOne({
//         where: { title: title.trim(), created_by: companyId },
//       });
//       if (exists && exists.id !== category.id) {
//         return res.status(400).json({ success: false, message: "Job category already exists" });
//       }
//       category.title = title.trim();
//     }

//     await category.save();

//     res.json({ success: true, data: category });
//   } catch (error) {
//     console.error("❌ Update Job Category Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ---------------------------------------------------------
// // Delete job category
// exports.deleteJobCategory = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const category = await JobCategory.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!category) return res.status(404).json({ success: false, message: "Job category not found" });

//     await category.destroy();
//     res.json({ success: true, message: "Job category deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete Job Category Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };





// controllers/job_category.controller.js
const JobCategory = require("../models/job_category.model");
const Employee = require("../models/employee.model");

// ============================
// 🔹 Helper: resolve company id
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = (req.user.type || "").toLowerCase();

  // Company/Admin → return own id
  if (["company", "admin", "super admin"].includes(type)) return req.user.id;

  // Employee → resolve via employees table
  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
  } catch (err) {
    console.error("getCompanyId Employee lookup failed:", err.message);
  }

  return req.user.creator_id || req.user.id;
}

// 🔹 Helper: super admin bypass
function isSuper(req) {
  return (req.user?.roles || []).some(r => r.name?.toLowerCase() === "super admin");
}

// ---------------------------------------------------------
// Get all job categories
exports.getAllJobCategories = async (req, res) => {
  try {
    let where = {};
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId)
        return res.status(403).json({ success: false, message: "Unauthorized" });
      where.created_by = companyId;
    }

    const categories = await JobCategory.findAll({
      where,
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("❌ Get Job Categories Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------
// Get single job category
exports.getJobCategoryById = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId)
        return res.status(403).json({ success: false, message: "Unauthorized" });
      where.created_by = companyId;
    }

    const category = await JobCategory.findOne({ where });
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Job category not found" });

    res.json({ success: true, data: category });
  } catch (error) {
    console.error("❌ Get Job Category Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------
// Create job category
exports.createJobCategory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    // prevent duplicate in same company
    const exists = await JobCategory.findOne({
      where: { title: title.trim(), created_by: companyId },
    });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Job category already exists" });
    }

    const newCategory = await JobCategory.create({
      title: title.trim(),
      created_by: companyId,
      user_id: req.user.id, // track who created it
    });

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("❌ Create Job Category Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------
// Update job category
exports.updateJobCategory = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const category = await JobCategory.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Job category not found" });

    const { title } = req.body;
    if (title?.trim()) {
      // check duplicate
      const exists = await JobCategory.findOne({
        where: { title: title.trim(), created_by: companyId },
      });
      if (exists && exists.id !== category.id) {
        return res
          .status(400)
          .json({ success: false, message: "Job category already exists" });
      }
      category.title = title.trim();
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("❌ Update Job Category Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------
// Delete job category
exports.deleteJobCategory = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const category = await JobCategory.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Job category not found" });

    await category.destroy();
    res.json({ success: true, message: "Job category deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Job Category Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


