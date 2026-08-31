

/*
// const DeductionOption = require("../models/deductionOption.model");
// const Employee = require("../models/employee.model");

// // ============================
// // 🔹 Helpers
// // ============================

// // Standardized getCompanyId
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

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

//   // fallback (admin/super)
//   return req.user.id;
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(
//     (r) => r.name?.toLowerCase() === "super admin"
//   );
// }

// // 🔹 Validate that option belongs to tenant
// async function validateDeductionOption(companyId, deductionOptionId) {
//   const option = await DeductionOption.findOne({
//     where: {
//       id: deductionOptionId,
//       created_by: companyId,
//     },
//   });

//   if (!option) {
//     throw new Error("Invalid deduction option: does not belong to your company");
//   }
//   return option;
// }

// // ============================
// // 🔹 Get all deduction options
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     let where = {};
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);

//       if (req.user?.type?.toLowerCase() === "employee") {
//         where.created_by = req.user.id; // Employee → only their own
//       } else {
//         where.created_by = companyId;   // Company → all under company
//       }
//     }

//     const data = await DeductionOption.findAll({
//       where,
//       order: [["id", "DESC"]],
//     });
//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("❌ Get Deduction Options Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Get deduction option by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       where.created_by = req.user?.type?.toLowerCase() === "employee"
//         ? req.user.id
//         : companyId;
//     }

//     const option = await DeductionOption.findOne({ where });
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     res.json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Get Deduction Option Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Create deduction option
// // ============================
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ success: false, message: "Name is required" });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const created_by = req.user?.type?.toLowerCase() === "employee"
//       ? req.user.id
//       : companyId;

//     const option = await DeductionOption.create({ name, created_by });
//     res.status(201).json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Create Deduction Option Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Update deduction option
// // ============================
// exports.update = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       where.created_by = req.user?.type?.toLowerCase() === "employee"
//         ? req.user.id
//         : companyId;
//     }

//     const option = await DeductionOption.findOne({ where });
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     option.name = req.body.name || option.name;
//     await option.save();

//     res.json({ success: true, message: "Deduction Option updated successfully", data: option });
//   } catch (err) {
//     console.error("❌ Update Deduction Option Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete deduction option
// // ============================
// exports.delete = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       where.created_by = req.user?.type?.toLowerCase() === "employee"
//         ? req.user.id
//         : companyId;
//     }

//     const option = await DeductionOption.findOne({ where });
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     await option.destroy();
//     res.json({ success: true, message: "Deduction Option deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Deduction Option Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };






// controllers/deductionOption.controller.js

const { Op } = require('sequelize'); // 🔹 UPDATED: used for IN queries
const DeductionOption = require("../models/deductionOption.model");
const Employee = require("../models/employee.model");
const User = require('../models/user.model'); // 🔹 UPDATED: to fetch subordinate users

// ============================
// 🔹 Helpers
// ============================

// Standardized getCompanyId (returns company owner id)
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
      raw: true,
    });
    if (emp?.created_by) return emp.created_by;
  } catch (err) {
    console.error("getCompanyId Employee lookup failed:", err.message);
  }

  // fallback (admin/super)
  return req.user.id;
}

function isSuper(req) {
  return (req.user?.roles || []).some(
    (r) => (r.name || '').toLowerCase() === "super admin"
  );
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// 🔹 UPDATED helper: returns array of user ids that belong to company (companyId + subordinate users)
async function getAllUserIdsUnderCompany(companyId) {
  if (!companyId) return [companyId];
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true
  });
  const ids = users.map(u => Number(u.id));
  if (!ids.includes(Number(companyId))) ids.unshift(Number(companyId));
  return ids;
}

// ============================
// 🔹 Get all deduction options
// ============================
exports.getAll = async (req, res) => {
  try {
    if (isSuper(req)) {
      const data = await DeductionOption.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company & employees see company scope (company + subordinate users)
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 role users see only their own created records
      where.created_by = req.user.id;
    }

    const data = await DeductionOption.findAll({
      where,
      order: [['id', 'DESC']],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Get Deduction Options Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Get deduction option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await DeductionOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });
      return res.json({ success: true, data: option });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 Company & employees allowed if created_by is company or subordinate user
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: "Deduction Option not found" });
      }
      return res.json({ success: true, data: option });
    }

    // 🔹 Role user: only if they created it
    if (String(option.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: "Deduction Option not found" });
    }

    return res.json({ success: true, data: option });
  } catch (err) {
    console.error("❌ Get Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Create deduction option
// ============================
exports.create = async (req, res) => {
  try {
    // 🔹 UPDATED: disallow employees from creating options
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create deduction options' });
    }

    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: record actual creator (req.user.id) so we can track who created it
    const creatorId = req.user.id;

    const option = await DeductionOption.create({
      name,
      created_by: creatorId
    });

    return res.status(201).json({ success: true, data: option });
  } catch (err) {
    console.error("❌ Create Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Update deduction option
// ============================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await DeductionOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });
      option.name = req.body.name ?? option.name;
      await option.save();
      return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update company + subordinate user records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
      }

      option.name = req.body.name ?? option.name;
      await option.save();
      return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update deduction options' });
    }

    // Role user → only their own
    if (String(option.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only update your own deduction options" });
    }

    option.name = req.body.name ?? option.name;
    await option.save();
    return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
  } catch (err) {
    console.error("❌ Update Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Delete deduction option
// ============================
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await DeductionOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });
      await option.destroy();
    //   return res.json({ success: true, message: "Deduction Option deleted successfully" });
    return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can delete company + subordinate user records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
      }
      await option.destroy();
    //   return res.json({ success: true, message: "Deduction Option deleted successfully" });
    return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete deduction options' });
    }

    // Role user → only their own
    if (String(option.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only delete your own deduction options" });
    }

    await option.destroy();
    // return res.json({ success: true, message: "Deduction Option deleted successfully" });
    return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
*/


// const { Op } = require('sequelize'); // 🔹 UPDATED: used for IN queries
// const DeductionOption = require("../models/deductionOption.model");
// const Employee = require("../models/employee.model");
// const Branch = require("../models/branch.model"); // 🔹 NEW (optional, helpful)
// const User = require('../models/user.model');

// /*
//   Branch-scoped ownership rules:
//   - super admin -> full access
//   - company -> access to company + subordinate users (all branches)
//   - role users -> access only to records created by users in the same branch (company + branch's role users)
//   - employees -> cannot create/update/delete (view-only in get endpoints per earlier pattern)
// */

// // ============================
// // 🔹 Helpers
// // ============================

// // Standardized getCompanyId (returns company owner id)
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   // Company/Admin/Super Admin -> company id is req.user.id
//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
//   } catch (err) {
//     console.error('getCompanyId Employee lookup failed:', err.message);
//   }

//   // fallback
//   return req.user.creator_id || req.user.id;
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }
// function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
// function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// // 🔹 NEW: Get branch id for a user (returns null if not an employee/not found)
// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// // 🔹 UPDATED: Get all user IDs under company (+ optional branch filtering)
// // - branchId === null => return companyId + all subordinate user ids (all branches)
// // - branchId provided => return companyId + subordinate user ids that belong to that branch
// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   // 1) fetch all users that are directly created by the company
//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });

//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   // 2) branch filter requested -> return only subordinate users who are in that branch
//   if (branchId) {
//     if (userIds.length === 0) {
//       // only company exists — return company id
//       return [Number(companyId)];
//     }

//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId
//       },
//       attributes: ['user_id'],
//       raw: true,
//     });

//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   // 3) branchId === null -> return all subordinate user ids across all branches + companyId
//   return Array.from(baseSet);
// }

// // ============================
// // 🔹 Get all deduction options
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     if (isSuper(req)) {
//       const data = await DeductionOption.findAll({ order: [['id', 'DESC']] });
//       return res.json({ success: true, data });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let where = {};

//     // Company & Employee -> company-wide (company + subordinate users across all branches)
//     if (isCompany(req) || isEmployee(req)) {
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     } else {
//       // Role users -> branch-scoped (only created_by users in same branch + company)
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     }

//     const data = await DeductionOption.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("❌ Get Deduction Options Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Get deduction option by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     const id = req.params.id;

//     if (isSuper(req)) {
//       const option = await DeductionOption.findByPk(id);
//       if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });
//       return res.json({ success: true, data: option });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await DeductionOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     // Company & Employee -> company-wide
//     if (isCompany(req) || isEmployee(req)) {
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(404).json({ success: false, message: "Deduction Option not found" });
//       }
//       return res.json({ success: true, data: option });
//     }

//     // Role user -> branch-scoped check
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(404).json({ success: false, message: "Deduction Option not found" });
//     }

//     return res.json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Get Deduction Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Create deduction option
// // ============================
// exports.create = async (req, res) => {
//   try {
//     // 🔹 UPDATED: disallow plain employees from creating options
//     if (isEmployee(req) && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot create deduction options' });
//     }

//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // For branch-scoped role users we capture branch
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId && !isCompany(req) && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Branch assignment required' });
//     }

//     // 🔹 UPDATED: record actual creator (req.user.id) and branch_id
//     const creatorId = req.user.id;

//     const option = await DeductionOption.create({
//       name: name.trim(),
//       created_by: creatorId,
//       branch_id: branchId || null,
//       user_id: req.user.id || null,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     return res.status(201).json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Create Deduction Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Update deduction option
// // ============================
// exports.update = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const option = await DeductionOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     if (isSuper(req)) {
//       option.name = req.body.name ?? option.name;
//       option.updated_at = new Date();
//       await option.save();
//       return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     if (isCompany(req)) {
//       // 🔹 UPDATED: company can update company + subordinate user records (across branches)
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
//       }

//       option.name = req.body.name ?? option.name;
//       option.updated_at = new Date();
//       await option.save();
//       return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
//     }

//     if (isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot update deduction options' });
//     }

//     // Role user -> branch-scoped: only records created by users in same branch
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(403).json({ success: false, message: "Forbidden: you can only update branch records" });
//     }

//     option.name = req.body.name ?? option.name;
//     option.updated_at = new Date();
//     await option.save();
//     return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
//   } catch (err) {
//     console.error("❌ Update Deduction Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete deduction option
// // ============================
// exports.delete = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const option = await DeductionOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

//     if (isSuper(req)) {
//       await option.destroy();
//       return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     if (isCompany(req)) {
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
//       }

//       await option.destroy();
//       return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
//     }

//     if (isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot delete deduction options' });
//     }

//     // Role user -> branch-scoped delete
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(403).json({ success: false, message: "Forbidden: you can only delete branch records" });
//     }

//     await option.destroy();
//     return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Deduction Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

const { Op } = require('sequelize');
const DeductionOption = require("../models/deductionOption.model");
const Employee = require("../models/employee.model");
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

// ============================
// 🔹 Get all deduction options
// ============================
exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAllDeductionOptions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const data = await DeductionOption.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Deduction Options Count:', data.length);
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let data = [];

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

      data = await DeductionOption.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL DEDUCTION OPTIONS - no company filter
      data = await DeductionOption.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Deduction Options Count:', data.length);
    }

    console.log('🔍 Final Deduction Options Count:', data.length);
    console.log('✅ END getAllDeductionOptions - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error("❌ Get Deduction Options Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Get deduction option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      return res.json({ success: true, data: option });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide deduction options
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
      console.log('🔍 Deduction Option created_by:', option.created_by);

      if (!allowedUserIds.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: "Deduction Option not found" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full deduction option access');
    }

    return res.json({ success: true, data: option });

  } catch (err) {
    console.error("❌ Get Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Create deduction option
// ============================
exports.create = async (req, res) => {
  try {
    console.log('🎯 START createDeductionOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    // 🔹 UPDATED: disallow plain employees from creating options
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create deduction options' });
    }

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating deduction option');
      const option = await DeductionOption.create({
        name: name.trim(),
        created_by: req.user.id,
        branch_id: null,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return res.status(201).json({ success: true, data: option });
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
      console.log('🟡 Branch User - Creating deduction option');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating deduction option');
      // No branch restriction for branchless users
    }

    const option = await DeductionOption.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Deduction Option created successfully');
    return res.status(201).json({ success: true, data: option });
  } catch (err) {
    console.error("❌ Create Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Update deduction option
// ============================
exports.update = async (req, res) => {
  try {
    console.log('🎯 START updateDeductionOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating deduction option');
      option.name = req.body.name ?? option.name;
      option.updated_at = new Date();
      await option.save();
      return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
    }

    // 🔹 UPDATED: disallow plain employees from updating options
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update deduction options' });
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

      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your branch record" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Updating deduction option');
      // No additional checks needed - branchless users can update any deduction option
    }

    option.name = req.body.name ?? option.name;
    option.updated_at = new Date();
    await option.save();

    console.log('✅ Deduction Option updated successfully');
    return res.json({ success: true, message: "Deduction Option updated successfully", data: option });
  } catch (err) {
    console.error("❌ Update Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Delete deduction option
// ============================
exports.delete = async (req, res) => {
  try {
    console.log('🎯 START deleteDeductionOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const option = await DeductionOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Deduction Option not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting deduction option');
      await option.destroy();
      return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
    }

    // 🔹 UPDATED: disallow plain employees from deleting options
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete deduction options' });
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

      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your branch record" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Deleting deduction option');
      // No additional checks needed - branchless users can delete any deduction option
    }

    await option.destroy();
    console.log('✅ Deduction Option deleted successfully');
    return res.json({ success: true, message: "Deduction Option soft deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Deduction Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};







