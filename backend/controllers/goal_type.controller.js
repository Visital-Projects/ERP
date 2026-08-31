


// const GoalType = require("../models/goal_type.model");

// exports.getAll = async (req, res) => {
//   try {
//     const createdBy = req.user?.created_by || req.user?.id;
//     const types = await GoalType.findAll({ where: { created_by: createdBy } });
//     res.json(types);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const type = await GoalType.findByPk(req.params.id);
//     if (!type) return res.status(404).json({ message: "Not found" });
//     res.json(type);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const createdBy = req.user?.created_by || req.user?.id;
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }

//     const type = await GoalType.create({ name, created_by: createdBy });
//     res.status(201).json(type);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const type = await GoalType.findByPk(req.params.id);
//     if (!type) return res.status(404).json({ message: "Not found" });

//     const { name } = req.body;
//     type.name = name || type.name;
//     await type.save();
//     res.json(type);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.remove = async (req, res) => {
//   try {
//     const type = await GoalType.findByPk(req.params.id);
//     if (!type) return res.status(404).json({ message: "Not found" });
//     await type.destroy();
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };





// const GoalType = require("../models/goal_type.model");

// function getCompanyId(req) {
//   return req.user?.creator_id || req.user?.id;
// }

// // Get all goal types
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const types = await GoalType.findAll({ where: { created_by: companyId } });
//     res.json({ success: true, data: types });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Get goal type by ID
// exports.getById = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const type = await GoalType.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });
//     res.json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Create goal type
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const companyId = getCompanyId(req);

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Name is required" });
//     }

//     // Prevent duplicate name in same company
//     const exists = await GoalType.findOne({ where: { name, created_by: companyId } });
//     if (exists) {
//       return res.status(400).json({ success: false, message: "Goal type already exists" });
//     }

//     const type = await GoalType.create({ name, created_by: companyId });
//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Update goal type
// exports.update = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const type = await GoalType.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });

//     const { name } = req.body;
//     if (name) type.name = name;

//     await type.save();
//     res.json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Delete goal type
// exports.remove = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const type = await GoalType.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });

//     await type.destroy();
//     res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// // controllers/goal_type.controller.js
// const GoalType = require("../models/goal_type.model");
// const Employee = require("../models/employee.model"); // make sure you have this model

// // --- Helpers ---
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === "Employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // fallback for company login
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || "").toLowerCase();
//   return t === "company" || t === "admin";
// }

// // --- Controller Methods ---

// // Get all goal types
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { created_by: companyId };

//     // If employee, only fetch their own records
//     if (!isCompanyUser(req)) {
//       where = { ...where, created_by: req.user.id };
//     }

//     const types = await GoalType.findAll({ where });
//     res.json({ success: true, data: types });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Get goal type by ID
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { id: req.params.id, created_by: companyId };

//     if (!isCompanyUser(req)) {
//       where = { ...where, created_by: req.user.id };
//     }

//     const type = await GoalType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });

//     res.json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Create goal type
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const companyId = await getCompanyId(req);

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Name is required" });
//     }

//     // Prevent duplicate name in same scope
//     const exists = await GoalType.findOne({
//       where: { name, created_by: isCompanyUser(req) ? companyId : req.user.id },
//     });
//     if (exists) {
//       return res.status(400).json({ success: false, message: "Goal type already exists" });
//     }

//     const type = await GoalType.create({
//       name,
//       created_by: isCompanyUser(req) ? companyId : req.user.id,
//     });

//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Update goal type
// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { id: req.params.id, created_by: companyId };
//     if (!isCompanyUser(req)) {
//       where = { id: req.params.id, created_by: req.user.id };
//     }

//     const type = await GoalType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });

//     const { name } = req.body;
//     if (name) type.name = name;

//     await type.save();
//     res.json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Delete goal type
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { id: req.params.id, created_by: companyId };
//     if (!isCompanyUser(req)) {
//       where = { id: req.params.id, created_by: req.user.id };
//     }

//     const type = await GoalType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: "Not found" });

//     await type.destroy();
//     res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };




const GoalType = require("../models/goal_type.model");
const Employee = require("../models/employee.model");

// ============================
// 🔹 Helper: resolve company id
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (String(req.user.type || '')).toLowerCase();

  // Company/Admin/Super Admin → own user id
  if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

  // Employee → resolve via employees table
  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
  } catch (err) {
    console.error('getCompanyId Employee lookup failed:', err.message);
  }

  return req.user.creator_id || req.user.id;
}

// ============================
// 🔹 Helper: check if super admin
// ============================
function isSuper(req) {
  return (req.user?.roles || []).some(r => r.name?.toLowerCase() === 'super admin');
}

// ============================
// 🔹 Get All Goal Types
// ============================
exports.getAll = async (req, res) => {
  try {
    let where = {};
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
      where.created_by = companyId;
    }

    const types = await GoalType.findAll({ where });
    res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Goal Types Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get Goal Type by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
      where.created_by = companyId;
    }

    const type = await GoalType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Goal type not found' });

    res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Goal Type Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create Goal Type
// ============================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Prevent duplicate name in the same company
    const exists = await GoalType.findOne({ where: { name, created_by: companyId } });
    if (exists) return res.status(400).json({ success: false, message: 'Goal type already exists' });

    const type = await GoalType.create({ name, created_by: companyId });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Goal Type Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update Goal Type
// ============================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const where = { id: req.params.id, created_by: companyId };
    const type = await GoalType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Goal type not found' });

    const { name } = req.body;
    if (name) type.name = name;
    await type.save();

    res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Goal Type Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete Goal Type
// ============================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const where = { id: req.params.id, created_by: companyId };
    const type = await GoalType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Goal type not found' });

    await type.destroy();
    res.json({ success: true, message: 'Goal type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Goal Type Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
