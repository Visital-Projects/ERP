

/*

// const LoanOption = require("../models/loanOption.model");
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

// // ============================
// // 🔹 Get all loan options
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     let where = {};
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);

//       if (req.user?.type?.toLowerCase() === "employee") {
//         // Employee → see only their own loan options
//         where.created_by = req.user.id;
//       } else {
//         // Company → see all under that company
//         where.created_by = companyId;
//       }
//     }

//     const options = await LoanOption.findAll({
//       where,
//       order: [["id", "DESC"]],
//     });

//     res.json({ success: true, data: options });
//   } catch (err) {
//     console.error("❌ Get Loan Options Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Get loan option by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);

//       if (req.user?.type?.toLowerCase() === "employee") {
//         where.created_by = req.user.id;
//       } else {
//         where.created_by = companyId;
//       }
//     }

//     const option = await LoanOption.findOne({ where });
//     if (!option)
//       return res
//         .status(404)
//         .json({ success: false, message: "Loan Option not found" });

//     res.json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Get Loan Option Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Create loan option
// // ============================
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name)
//       return res
//         .status(400)
//         .json({ success: false, message: "Name is required" });

//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res
//         .status(403)
//         .json({ success: false, message: "Unauthorized" });

//     const created_by =
//       req.user?.type?.toLowerCase() === "employee"
//         ? req.user.id
//         : companyId;

//     const newOption = await LoanOption.create({ name, created_by });
//     res.status(201).json({ success: true, data: newOption });
//   } catch (err) {
//     console.error("❌ Create Loan Option Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Update loan option
// // ============================
// exports.update = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       where.created_by =
//         req.user?.type?.toLowerCase() === "employee"
//           ? req.user.id
//           : companyId;
//     }

//     const option = await LoanOption.findOne({ where });
//     if (!option)
//       return res
//         .status(404)
//         .json({ success: false, message: "Loan Option not found" });

//     const { name } = req.body;
//     option.name = name || option.name;
//     await option.save();

//     res.json({
//       success: true,
//       message: "Loan Option updated successfully",
//       data: option,
//     });
//   } catch (err) {
//     console.error("❌ Update Loan Option Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete loan option
// // ============================
// exports.delete = async (req, res) => {
//   try {
//     let where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       where.created_by =
//         req.user?.type?.toLowerCase() === "employee"
//           ? req.user.id
//           : companyId;
//     }

//     const option = await LoanOption.findOne({ where });
//     if (!option)
//       return res
//         .status(404)
//         .json({ success: false, message: "Loan Option not found" });

//     await option.destroy();
//     res.json({ success: true, message: "Loan Option deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Loan Option Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };










const { Op } = require('sequelize'); // 🔹 UPDATED: needed for IN queries
const LoanOption = require("../models/loanOption.model");
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); // 🔹 UPDATED: to lookup subordinate users

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
  const t = (req.user?.type || '').toLowerCase();
  const roleNames = Array.isArray(req.user?.roles) ? req.user.roles.map(r => (r.name || '').toLowerCase()) : [];
  return t === 'super admin' || roleNames.includes('super admin');
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
// 🔹 Get all loan options
// ============================
exports.getAll = async (req, res) => {
  try {
    if (isSuper(req)) {
      const options = await LoanOption.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: options });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company & employees see company scope (company + subordinate users)
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 role users see only what they created
      where.created_by = req.user.id;
    }

    const options = await LoanOption.findAll({
      where,
      order: [['id', 'DESC']]
    });

    res.json({ success: true, data: options });
  } catch (err) {
    console.error("❌ Get Loan Options Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Get loan option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await LoanOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });
      return res.json({ success: true, data: option });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await LoanOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 company and employees allowed if option.created_by is company or subordinate user
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: "Loan Option not found" });
      }
      return res.json({ success: true, data: option });
    }

    // 🔹 role user: only if they created it
    if (String(option.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: "Loan Option not found" });
    }

    return res.json({ success: true, data: option });
  } catch (err) {
    console.error("❌ Get Loan Option Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Create loan option
// ============================
exports.create = async (req, res) => {
  try {
    // Employees are not allowed to create
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create loan options' });
    }

    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: created_by is the actual creator (req.user.id)
    const creatorId = req.user.id;

    const newOption = await LoanOption.create({
      name,
      created_by: creatorId
    });

    res.status(201).json({ success: true, data: newOption });
  } catch (err) {
    console.error("❌ Create Loan Option Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Update loan option
// ============================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const opt = await LoanOption.findByPk(id);
      if (!opt) return res.status(404).json({ success: false, message: "Loan Option not found" });
      opt.name = req.body.name ?? opt.name;
      await opt.save();
      return res.json({ success: true, message: "Loan Option updated successfully", data: opt });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const opt = await LoanOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: "Loan Option not found" });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update its own + subordinate user's records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
      }

      opt.name = req.body.name ?? opt.name;
      await opt.save();
      return res.json({ success: true, message: "Loan Option updated successfully", data: opt });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update loan options' });
    }

    // role user -> only their own
    if (String(opt.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only update your own loan options" });
    }

    opt.name = req.body.name ?? opt.name;
    await opt.save();

    return res.json({ success: true, message: "Loan Option updated successfully", data: opt });
  } catch (err) {
    console.error("❌ Update Loan Option Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Delete loan option
// ============================
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const opt = await LoanOption.findByPk(id);
      if (!opt) return res.status(404).json({ success: false, message: "Loan Option not found" });
      await opt.destroy();
    //   return res.json({ success: true, message: "Loan Option deleted successfully" });
      return res.json({ success: true, message: "Loan Option soft deleted successfully" });

    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const opt = await LoanOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: "Loan Option not found" });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can delete created by company OR subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
      }
      await opt.destroy();
    //   return res.json({ success: true, message: "Loan Option deleted successfully" });
      return res.json({ success: true, message: "Loan Option soft deleted successfully" });

    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete loan options' });
    }

    // role user -> only their own
    if (String(opt.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only delete your own loan options" });
    }

    await opt.destroy();
    // return res.json({ success: true, message: "Loan Option deleted successfully" });
    return res.json({ success: true, message: "Loan Option soft deleted successfully" });

  } catch (err) {
    console.error("❌ Delete Loan Option Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
*/





// const { Op } = require('sequelize'); // 🔹 UPDATED: needed for IN queries
// const LoanOption = require("../models/loanOption.model");
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const Branch = require('../models/branch.model'); // 🔹 NEW (optional)

// /* Branch-scoped ownership rules:
//   - super admin -> full access
//   - company -> access to company + subordinate users (all branches)
//   - role users -> access only to records created by users in the same branch (company + that branch's role users)
//   - employees -> cannot create/update/delete (view-only)
// */

// // ============================
// // 🔹 Helpers
// // ============================

// // Standardized getCompanyId (returns company owner id)
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   // Company/Admin/Super Admin -> treat as company owner
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

// // 🔹 NEW: Get branch_id for the given user (returns null if not an employee/not found)
// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// // 🔹 UPDATED: Get all user IDs under company (+ optional branch filtering)
// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   // fetch all users created by company
//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });
//   const userIds = users.map(u => Number(u.id));

//   // always include company id
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   // if branchId provided -> return companyId + subordinate user ids who belong to that branch
//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

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

//   // branchId === null -> return company + all subordinate users
//   return Array.from(baseSet);
// }

// // ============================
// // 🔹 Get all loan options
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     if (isSuper(req)) {
//       const options = await LoanOption.findAll({ order: [['id', 'DESC']] });
//       return res.json({ success: true, data: options });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let where = {};

//     if (isCompany(req) || isEmployee(req)) {
//       // 🔹 UPDATED: company & employees see company scope (company + subordinate users)
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     } else {
//       // 🔹 Role users -> branch-scoped (share access within their branch)
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     }

//     const options = await LoanOption.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     return res.json({ success: true, data: options });
//   } catch (err) {
//     console.error("❌ Get Loan Options Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Get loan option by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     const id = req.params.id;

//     if (isSuper(req)) {
//       const option = await LoanOption.findByPk(id);
//       if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });
//       return res.json({ success: true, data: option });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await LoanOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

//     if (isCompany(req) || isEmployee(req)) {
//       // company & employees allowed if created_by belongs to company or subordinate user
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(404).json({ success: false, message: "Loan Option not found" });
//       }
//       return res.json({ success: true, data: option });
//     }

//     // role user: branch-scoped check
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(404).json({ success: false, message: "Loan Option not found" });
//     }

//     return res.json({ success: true, data: option });
//   } catch (err) {
//     console.error("❌ Get Loan Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Create loan option
// // ============================
// exports.create = async (req, res) => {
//   try {
//     // 🔹 UPDATED: disallow plain employees from creating options
//     if (isEmployee(req) && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot create loan options' });
//     }

//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // record branch for branch-scoped role users (company/super can pass null)
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId && !isCompany(req) && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Branch assignment required' });
//     }

//     // 🔹 UPDATED: created_by stores actual user id; record branch_id as well
//     const creatorId = req.user.id;

//     const newOption = await LoanOption.create({
//       name: name.trim(),
//       created_by: creatorId,
//       branch_id: branchId || null,
//       user_id: req.user.id || null,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     return res.status(201).json({ success: true, data: newOption });
//   } catch (err) {
//     console.error("❌ Create Loan Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Update loan option
// // ============================
// exports.update = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const option = await LoanOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

//     if (isSuper(req)) {
//       option.name = req.body.name ?? option.name;
//       option.updated_at = new Date();
//       await option.save();
//       return res.json({ success: true, message: "Loan Option updated successfully", data: option });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     if (isCompany(req)) {
//       // 🔹 UPDATED: company can update company + subordinate user records (all branches)
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
//       }

//       option.name = req.body.name ?? option.name;
//       option.updated_at = new Date();
//       await option.save();
//       return res.json({ success: true, message: "Loan Option updated successfully", data: option });
//     }

//     if (isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot update loan options' });
//     }

//     // Role user -> branch-scoped update
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(403).json({ success: false, message: "Forbidden: you can only update branch records" });
//     }

//     option.name = req.body.name ?? option.name;
//     option.updated_at = new Date();
//     await option.save();

//     return res.json({ success: true, message: "Loan Option updated successfully", data: option });
//   } catch (err) {
//     console.error("❌ Update Loan Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete loan option
// // ============================
// exports.delete = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const option = await LoanOption.findByPk(id);
//     if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

//     if (isSuper(req)) {
//       await option.destroy();
//       return res.json({ success: true, message: "Loan Option soft deleted successfully" });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     if (isCompany(req)) {
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your company record" });
//       }

//       await option.destroy();
//       return res.json({ success: true, message: "Loan Option soft deleted successfully" });
//     }

//     if (isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'Employees cannot delete loan options' });
//     }

//     // Role user -> branch-scoped delete
//     const branchId = await getUserBranchId(req.user.id);
//     if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
//       return res.status(403).json({ success: false, message: "Forbidden: you can only delete branch records" });
//     }

//     await option.destroy();
//     return res.json({ success: true, message: "Loan Option soft deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Loan Option Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };





const { Op } = require('sequelize');
const LoanOption = require("../models/loanOption.model");
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

// ============================
// 🔹 Get all loan options
// ============================
exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAllLoanOptions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const options = await LoanOption.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Loan Options Count:', options.length);
      return res.json({ success: true, data: options });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let options = [];

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

      options = await LoanOption.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL LOAN OPTIONS - no company filter
      options = await LoanOption.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Loan Options Count:', options.length);
    }

    console.log('🔍 Final Loan Options Count:', options.length);
    console.log('✅ END getAllLoanOptions - Success');
    return res.json({ success: true, data: options });

  } catch (err) {
    console.error("❌ Get Loan Options Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Get loan option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const option = await LoanOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

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
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide loan options
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
      console.log('🔍 Loan Option created_by:', option.created_by);

      if (!allowedUserIds.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: "Loan Option not found" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full loan option access');
    }

    return res.json({ success: true, data: option });

  } catch (err) {
    console.error("❌ Get Loan Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Create loan option
// ============================
exports.create = async (req, res) => {
  try {
    console.log('🎯 START createLoanOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    // 🔹 UPDATED: disallow plain employees from creating options
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create loan options' });
    }

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating loan option');
      const newOption = await LoanOption.create({
        name: name.trim(),
        created_by: req.user.id,
        branch_id: null,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return res.status(201).json({ success: true, data: newOption });
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
      console.log('🟡 Branch User - Creating loan option');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating loan option');
      // No branch restriction for branchless users
    }

    const newOption = await LoanOption.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Loan Option created successfully');
    return res.status(201).json({ success: true, data: newOption });
  } catch (err) {
    console.error("❌ Create Loan Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Update loan option
// ============================
exports.update = async (req, res) => {
  try {
    console.log('🎯 START updateLoanOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const option = await LoanOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating loan option');
      option.name = req.body.name ?? option.name;
      option.updated_at = new Date();
      await option.save();
      return res.json({ success: true, message: "Loan Option updated successfully", data: option });
    }

    // 🔹 UPDATED: disallow plain employees from updating options
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update loan options' });
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
      console.log('🟡 Branchless User - Updating loan option');
      // No additional checks needed - branchless users can update any loan option
    }

    option.name = req.body.name ?? option.name;
    option.updated_at = new Date();
    await option.save();

    console.log('✅ Loan Option updated successfully');
    return res.json({ success: true, message: "Loan Option updated successfully", data: option });
  } catch (err) {
    console.error("❌ Update Loan Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ============================
// 🔹 Delete loan option
// ============================
exports.delete = async (req, res) => {
  try {
    console.log('🎯 START deleteLoanOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const option = await LoanOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: "Loan Option not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting loan option');
      await option.destroy();
      return res.json({ success: true, message: "Loan Option soft deleted successfully" });
    }

    // 🔹 UPDATED: disallow plain employees from deleting options
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete loan options' });
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
      console.log('🟡 Branchless User - Deleting loan option');
      // No additional checks needed - branchless users can delete any loan option
    }

    await option.destroy();
    console.log('✅ Loan Option deleted successfully');
    return res.json({ success: true, message: "Loan Option soft deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Loan Option Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};







