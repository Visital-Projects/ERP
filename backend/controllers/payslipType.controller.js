


/*
// const PayslipType = require('../models/payslipType.model');
// const Employee = require('../models/employee.model'); 

// // =======================
// // Helper: getCompanyId
// // =======================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   // Always resolve through Employee table
//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//       raw: true,
//     });
//     if (emp?.created_by) return emp.created_by;
//   } catch (err) {
//     console.error("getCompanyId Employee lookup failed:", err.message);
//   }

//   // fallback (admin/super admin)
//   return req.user.id;
// }

// // ===============================
// // Get All Payslip Types
// // ===============================
// exports.getAllPayslipTypes = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const payslipTypes = await PayslipType.findAll({
//       where: { created_by: companyId },
//       order: [["id", "DESC"]],
//     });

//     res.json({ success: true, data: payslipTypes });
//   } catch (err) {
//     console.error("❌ Get Payslip Types Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ===============================
// // Get Payslip Type by ID
// // ===============================
// exports.getPayslipTypeById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const payslipType = await PayslipType.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!payslipType) {
//       return res.status(404).json({ success: false, message: "Payslip Type not found" });
//     }

//     res.json({ success: true, data: payslipType });
//   } catch (err) {
//     console.error("❌ Get Payslip Type Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ===============================
// // Create Payslip Type
// // ===============================
// exports.createPayslipType = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const { name } = req.body;
//     if (!name) return res.status(400).json({ success: false, message: "Name is required" });

//     const payslipType = await PayslipType.create({
//       name,
//       created_by: companyId,
//     });

//     res.status(201).json({ success: true, data: payslipType });
//   } catch (err) {
//     console.error("❌ Create Payslip Type Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ===============================
// // Update Payslip Type
// // ===============================
// exports.updatePayslipType = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const { id } = req.params;
//     const { name } = req.body;

//     const payslipType = await PayslipType.findOne({ where: { id, created_by: companyId } });
//     if (!payslipType) {
//       return res.status(404).json({ success: false, message: "Payslip Type not found" });
//     }

//     payslipType.name = name || payslipType.name;
//     await payslipType.save();

//     res.json({ success: true, message: "Payslip Type updated successfully", data: payslipType });
//   } catch (err) {
//     console.error("❌ Update Payslip Type Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ===============================
// // Delete Payslip Type
// // ===============================
// exports.deletePayslipType = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const { id } = req.params;
//     const payslipType = await PayslipType.findOne({ where: { id, created_by: companyId } });

//     if (!payslipType) {
//       return res.status(404).json({ success: false, message: "Payslip Type not found" });
//     }

//     await payslipType.destroy();
//     res.json({ success: true, message: "Payslip Type deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Payslip Type Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };












// controllers/payslipType.controller.js

const { Op } = require('sequelize'); // 🔹 UPDATED: needed for IN queries
const PayslipType = require('../models/payslipType.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); // 🔹 UPDATED: to find subordinate users

// =======================
// Helpers
// =======================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  // Resolve via Employee table (covers HR/Manager/Accountant/Employee)
  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
      raw: true
    });
    if (emp?.created_by) return emp.created_by;
  } catch (err) {
    console.error("getCompanyId lookup failed:", err.message);
  }

  // fallback (admin/super admin)
  return req.user.id;
}

function isSuper(req) {
  const t = (req.user?.type || '').toLowerCase();
  const roleNames = Array.isArray(req.user?.roles) ? req.user.roles.map(r => (r.name || '').toLowerCase()) : [];
  return t === 'super admin' || roleNames.includes('super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// 🔹 UPDATED helper: return [companyId, ...userIdsUnderCompany]
// Allows company to query resources created by itself or any subordinate users.
async function getAllUserIdsUnderCompany(companyId) {
  if (!companyId) return [companyId];
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true
  });
  const ids = users.map(u => u.id);
  if (!ids.includes(companyId)) ids.unshift(companyId);
  return ids;
}

// ===============================
// Get All Payslip Types
// ===============================
exports.getAllPayslipTypes = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await PayslipType.findAll({ order: [['id','DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company & employee => see company + subordinate users' records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 role users -> only their own created records
      where.created_by = req.user.id;
    }

    const types = await PayslipType.findAll({ where, order: [['id','DESC']] });
    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Payslip Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ===============================
// Get Payslip Type by ID
// ===============================
exports.getPayslipTypeById = async (req, res) => {
  try {
    if (isSuper(req)) {
      const t = await PayslipType.findByPk(req.params.id);
      if (!t) return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // fetch the record first
    const payslipType = await PayslipType.findByPk(req.params.id);
    if (!payslipType) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can access records created by company OR subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(payslipType.created_by))) {
        return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      }
      return res.json({ success: true, data: payslipType });
    }

    if (isEmployee(req)) {
      // employee can see company scope (company + sub users)
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(payslipType.created_by))) {
        return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      }
      return res.json({ success: true, data: payslipType });
    }

    // role user -> only their own
    if (String(payslipType.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Payslip Type not found' });
    }

    return res.json({ success: true, data: payslipType });
  } catch (err) {
    console.error('❌ Get Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ===============================
// Create Payslip Type
// ===============================
exports.createPayslipType = async (req, res) => {
  try {
    // Employees are not allowed to create
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create payslip types' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    // 🔹 UPDATED: set created_by to actual creator (req.user.id).
    // Company user -> created_by will be company id (req.user.id).
    // Role user -> created_by will be their own user id.
    const creatorId = req.user.id;

    const created = await PayslipType.create({
      name,
      created_by: creatorId,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('❌ Create Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ===============================
// Update Payslip Type
// ===============================
exports.updatePayslipType = async (req, res) => {
  try {
    const id = req.params.id;

    // Super admin -> full access
    if (isSuper(req)) {
      const p = await PayslipType.findByPk(id);
      if (!p) return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      p.name = req.body.name ?? p.name;
      p.updated_at = new Date();
      await p.save();
      return res.json({ success: true, message: 'Payslip Type updated successfully', data: p });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const p = await PayslipType.findByPk(id);
    if (!p) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update records created by company OR its subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(p.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      p.name = req.body.name ?? p.name;
      p.updated_at = new Date();
      await p.save();
      return res.json({ success: true, message: 'Payslip Type updated successfully', data: p });
    }

    if (isEmployee(req)) {
      // employees cannot update
      return res.status(403).json({ success: false, message: 'Employees cannot update payslip types' });
    }

    // role user -> only their own
    if (String(p.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only update your own payslip types' });
    }

    p.name = req.body.name ?? p.name;
    p.updated_at = new Date();
    await p.save();
    return res.json({ success: true, message: 'Payslip Type updated successfully', data: p });
  } catch (err) {
    console.error('❌ Update Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ===============================
// Delete Payslip Type
// ===============================
exports.deletePayslipType = async (req, res) => {
  try {
    const id = req.params.id;

    // Super admin -> full access
    if (isSuper(req)) {
      const p = await PayslipType.findByPk(id);
      if (!p) return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      await p.destroy();
    //   return res.json({ success: true, message: 'Payslip Type deleted successfully' });
      return res.json({ success: true, message: 'Payslip Type soft deleted successfully' });

    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const p = await PayslipType.findByPk(id);
    if (!p) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can delete records created by company OR subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(p.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      await p.destroy();
    //   return res.json({ success: true, message: 'Payslip Type deleted successfully' });
      return res.json({ success: true, message: 'Payslip Type soft deleted successfully' });

    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete payslip types' });
    }

    // role user -> only their own
    if (String(p.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only delete your own payslip types' });
    }

    await p.destroy();
    // return res.json({ success: true, message: 'Payslip Type deleted successfully' });
    return res.json({ success: true, message: 'Payslip Type soft deleted successfully' });

  } catch (err) {
    console.error('❌ Delete Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/

/*

const { Op } = require('sequelize');
const PayslipType = require('../models/payslipType.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// ============================
// 🔹 Helpers
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || '').toLowerCase();

  if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

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

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// 🔹 Get branch of current user
async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

// 🔹 Get all user IDs under company (+ optional branch filtering)
async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ['user_id'],
      raw: true,
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}

// ============================
// 🔹 Get all Payslip Types
// ============================
exports.getAllPayslipTypes = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await PayslipType.findAll({ order: [['id','DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};
    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    }

    const types = await PayslipType.findAll({ where, order: [['id','DESC']] });
    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Payslip Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get Payslip Type by ID
// ============================
exports.getPayslipTypeById = async (req, res) => {
  try {
    if (isSuper(req)) {
      const t = await PayslipType.findByPk(req.params.id);
      if (!t) return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await PayslipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      }
      return res.json({ success: true, data: type });
    }

    const branchId = await getUserBranchId(req.user.id);
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
      return res.status(404).json({ success: false, message: 'Payslip Type not found' });
    }

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create Payslip Type
// ============================
exports.createPayslipType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const branchId = await getUserBranchId(req.user.id);
    if (!branchId && !isCompany(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Branch assignment required' });
    }

    const type = await PayslipType.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId || null,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update Payslip Type
// ============================
exports.updatePayslipType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await PayslipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isSuper(req)) {
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
    } else {
      const branchId = await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete Payslip Type
// ============================
exports.deletePayslipType = async (req, res) => {
  try {
    const type = await PayslipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    if (isSuper(req)) {
      await type.destroy();
      return res.json({ success: true, message: 'Payslip Type deleted successfully' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
    } else {
      const branchId = await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    }

    await type.destroy();
    return res.json({ success: true, message: 'Payslip Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/



const { Op } = require('sequelize');
const PayslipType = require('../models/payslipType.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');


async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // 🟢 Pehle check karo user khud company hai ya nahi
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // 🟢 Agar employee hai (employees table mein entry hai)
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    // 🟢 FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('🔍 User Record created_by:', userRecord?.created_by);
    return Number(userRecord?.created_by) || null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });

  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];

    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId
      },
      attributes: ['user_id'],
      raw: true,
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}

exports.getAllPayslipTypes = async (req, res) => {
  try {
    console.log('🎯 START getAllPayslipTypes');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const all = await PayslipType.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Payslip Types Count:', all.length);
      return res.json({ success: true, data: all });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let payslipTypes = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get COMPANY USERS (branchless users) - users without employee records
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // Filter to get only branchless users (users without employee records)
      const branchlessUserIds = [];
      for (const user of allCompanyUsers) {
        const empRecord = await Employee.findOne({
          where: { user_id: user.id },
          attributes: ['id'],
          raw: true,
        });
        if (!empRecord) {
          branchlessUserIds.push(Number(user.id));
        }
      }

      // 🟢 STEP 2: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: branchId,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users: companyId + branchless users + current branch users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);

      payslipTypes = await PayslipType.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL PAYSLIP TYPES - no company filter
      payslipTypes = await PayslipType.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Payslip Types Count:', payslipTypes.length);
    }

    console.log('🔍 Final Payslip Types Count:', payslipTypes.length);
    console.log('✅ END getAllPayslipTypes - Success');
    return res.json({ success: true, data: payslipTypes });

  } catch (err) {
    console.error('❌ Get Payslip Types Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};


exports.getPayslipTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await PayslipType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      return res.json({ success: true, data: type });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide payslip types
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get COMPANY USERS (branchless users) - users without employee records
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // Filter to get only branchless users (users without employee records)
      const branchlessUserIds = [];
      for (const user of allCompanyUsers) {
        const empRecord = await Employee.findOne({
          where: { user_id: user.id },
          attributes: ['id'],
          raw: true,
        });
        if (!empRecord) {
          branchlessUserIds.push(Number(user.id));
        }
      }

      // 🟢 STEP 2: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users: companyId + branchless users + current branch users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);
      console.log('🔍 Payslip Type created_by:', type.created_by);

      if (!allowedUserIds.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Payslip Type not found' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full payslip type access');
    }

    return res.json({ success: true, data: type });

  } catch (err) {
    console.error('❌ Get Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createPayslipType = async (req, res) => {
  try {
    console.log('🎯 START createPayslipType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating payslip type');
      const type = await PayslipType.create({
        name: name.trim(),
        created_by: req.user.id,
        branch_id: null,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return res.status(201).json({ success: true, data: type });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Creating payslip type');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating payslip type');
      // No branch restriction for branchless users
    }

    const type = await PayslipType.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Payslip Type created successfully');
    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updatePayslipType = async (req, res) => {
  try {
    console.log('🎯 START updatePayslipType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await PayslipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating payslip type');
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = userEmployeeRecord.branch_id;
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Updating payslip type');
      // No additional checks needed - branchless users can update any payslip type
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();

    console.log('✅ Payslip Type updated successfully');
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deletePayslipType = async (req, res) => {
  try {
    console.log('🎯 START deletePayslipType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const type = await PayslipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Payslip Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting payslip type');
      await type.destroy();
      return res.json({ success: true, message: 'Payslip Type deleted successfully' });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = userEmployeeRecord.branch_id;
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Deleting payslip type');
      // No additional checks needed - branchless users can delete any payslip type
    }

    await type.destroy();
    console.log('✅ Payslip Type deleted successfully');
    return res.json({ success: true, message: 'Payslip Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Payslip Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



