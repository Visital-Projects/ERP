

// const PerformanceType = require('../models/performanceType.model');
// const Employee = require('../models/employee.model');

// // 🔹 Helper: Multi-tenancy isolation
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   // If logged-in user is employee, fetch company id from employee record
//   if (req.user?.type === 'Employee') {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by']
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // fallback → company login
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || '').toLowerCase();
//   return t === 'company' || t === 'admin';
// }

// // -----------------------------------------------------------
// // Get all performance types
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     let where = { created_by: companyId };

//     // Employees restricted to their company only
//     if (!isCompanyUser(req)) {
//       where.created_by = companyId;
//     }

//     const types = await PerformanceType.findAll({
//       where,
//       order: [['id', 'DESC']]
//     });

//     res.json({ success: true, data: types });
//   } catch (err) {
//     console.error('❌ Get Performance Types Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // -----------------------------------------------------------
// // Get performance type by ID
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await PerformanceType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Get Performance Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // -----------------------------------------------------------
// // Create
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     const companyId = await getCompanyId(req);
//     const type = await PerformanceType.create({
//       name: name.trim(),
//       created_by: companyId
//     });

//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Create Performance Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // -----------------------------------------------------------
// // Update
// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await PerformanceType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     const { name } = req.body;
//     if (!name?.trim()) {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     type.name = name.trim();
//     await type.save();

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Update Performance Type Error:', err);
//     res.status(500).json({ success: false, message: 'Update failed', error: err.message });
//   }
// };

// // -----------------------------------------------------------
// // Delete
// exports.delete = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await PerformanceType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     await type.destroy();
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Performance Type Error:', err);
//     res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
//   }
// };








const PerformanceType = require("../models/performanceType.model");
const Employee = require("../models/employee.model");

// ✅ Tenant isolation helper
async function getCompanyId(req) {
  if (req.user?.creator_id) return req.user.creator_id;

  if (req.user?.type === "Employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    return emp?.created_by;
  }

  return req.user?.id; // company login
}

function isCompanyUser(req) {
  const t = (req.user?.type || "").toLowerCase();
  return t === "company" || t === "admin";
}

// -----------------------------------------------------------
// Get all performance types
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const types = await PerformanceType.findAll({
      where: { created_by: companyId },
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: types });
  } catch (error) {
    console.error("❌ Get Performance Types Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// -----------------------------------------------------------
// Get performance type by ID
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const type = await PerformanceType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!type) return res.status(404).json({ success: false, message: "Performance type not found" });

    res.json({ success: true, data: type });
  } catch (error) {
    console.error("❌ Get Performance Type Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// -----------------------------------------------------------
// Create performance type
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const companyId = await getCompanyId(req);

    // prevent duplicate inside company
    const exists = await PerformanceType.findOne({
      where: { name: name.trim(), created_by: companyId },
    });
    if (exists) {
      return res.status(400).json({ success: false, message: "Performance type already exists" });
    }

    const type = await PerformanceType.create({
      name: name.trim(),
      created_by: companyId,
    });

    res.status(201).json({ success: true, data: type });
  } catch (error) {
    console.error("❌ Create Performance Type Error:", error);
    res.status(500).json({ success: false, message: "Create failed", error: error.message });
  }
};

// -----------------------------------------------------------
// Update performance type
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const type = await PerformanceType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!type) return res.status(404).json({ success: false, message: "Performance type not found" });

    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    // prevent duplicate on update
    const exists = await PerformanceType.findOne({
      where: { name: name.trim(), created_by: companyId },
    });
    if (exists && exists.id !== type.id) {
      return res.status(400).json({ success: false, message: "Performance type already exists" });
    }

    type.name = name.trim();
    await type.save();

    res.json({ success: true, data: type });
  } catch (error) {
    console.error("❌ Update Performance Type Error:", error);
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

// -----------------------------------------------------------
// Delete performance type
exports.delete = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const type = await PerformanceType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!type) return res.status(404).json({ success: false, message: "Performance type not found" });

    await type.destroy();
    res.json({ success: true, message: "Performance type deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Performance Type Error:", error);
    res.status(500).json({ success: false, message: "Delete failed", error: error.message });
  }
};

