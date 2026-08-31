


/*
// const TerminationType = require('../models/termination_type.model');
// const Employee = require('../models/employee.model'); // ensure model exists

// // ============================
// // 🔹 Helper: resolve company id
// // ============================
// async function getCompanyId(req) {
//   if (!req.user) return null;

//   const type = (req.user.type || '').toLowerCase();

//   // Company/Admin/Super Admin → own id
//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

//   // Employee → resolve via employees table
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

//   // Fallback
//   return req.user.creator_id || req.user.id;
// }

// // ============================
// // 🔹 Helper: check if super admin
// // ============================
// function isSuper(req) {
//   return (req.user?.roles || []).some(r => r.name?.toLowerCase() === 'super admin');
// }

// // ============================
// // 🔹 Get all termination types
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     let where = {};
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
//       where.created_by = companyId;
//     }

//     const types = await TerminationType.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     res.json({ success: true, data: types });
//   } catch (error) {
//     console.error('❌ Get Termination Types Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // ============================
// // 🔹 Get termination type by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     const where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
//       where.created_by = companyId;
//     }

//     const type = await TerminationType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Termination type not found' });

//     res.json({ success: true, data: type });
//   } catch (error) {
//     console.error('❌ Get Termination Type Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // ============================
// // 🔹 Create termination type
// // ============================
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const type = await TerminationType.create({
//       name: name.trim(),
//       created_by: companyId,
//       user_id: req.user.id, // optional: track which employee created it
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ success: true, data: type });
//   } catch (error) {
//     console.error('❌ Create Termination Type Error:', error);
//     res.status(500).json({ success: false, message: 'Creation failed', error: error.message });
//   }
// };

// // ============================
// // 🔹 Update termination type
// // ============================
// exports.update = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const where = { id: req.params.id, created_by: companyId };
//     const type = await TerminationType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Termination type not found' });

//     type.name = name.trim();
//     type.updated_at = new Date();
//     await type.save();

//     res.json({ success: true, data: type });
//   } catch (error) {
//     console.error('❌ Update Termination Type Error:', error);
//     res.status(500).json({ success: false, message: 'Update failed', error: error.message });
//   }
// };

// // ============================
// // 🔹 Delete termination type
// // ============================
// exports.delete = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const where = { id: req.params.id, created_by: companyId };
//     const type = await TerminationType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Termination type not found' });

//     await type.destroy();
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (error) {
//     console.error('❌ Delete Termination Type Error:', error);
//     res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
//   }
// };



// controllers/terminationType.controller.js

const { Op } = require('sequelize');
const TerminationType = require('../models/termination_type.model');
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

// 🔹 Get all user ids under company (company + subordinate users)
async function getAllUserIdsUnderCompany(companyId) {
  if (!companyId) return [companyId];
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  const ids = users.map(u => Number(u.id));
  if (!ids.includes(Number(companyId))) ids.unshift(Number(companyId));
  return ids;
}

// ============================
// 🔹 Get all termination types
// ============================
exports.getAll = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await TerminationType.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      where.created_by = req.user.id; // role users only own
    }

    const types = await TerminationType.findAll({ where, order: [['id', 'DESC']] });
    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Termination Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get termination type by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const t = await TerminationType.findByPk(id);
      if (!t) return res.status(404).json({ success: false, message: 'Termination Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await TerminationType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Termination Type not found' });
      }
      return res.json({ success: true, data: type });
    }

    if (String(type.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Termination Type not found' });
    }

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create termination type
// ============================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const creatorId = req.user.id;

    const type = await TerminationType.create({
      name: name.trim(),
      created_by: creatorId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update termination type
// ============================
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    if (isSuper(req)) {
      const type = await TerminationType.findByPk(req.params.id);
      if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update termination types' });
    }

    if (String(type.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only update your own termination types' });
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete termination type
// ============================
exports.delete = async (req, res) => {
  try {
    if (isSuper(req)) {
      const type = await TerminationType.findByPk(req.params.id);
      if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });
      await type.destroy();
      return res.json({ success: true, message: 'Termination Type deleted successfully' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      await type.destroy();
      return res.json({ success: true, message: 'Termination Type deleted successfully' });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete termination types' });
    }

    if (String(type.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only delete your own termination types' });
    }

    await type.destroy();
    return res.json({ success: true, message: 'Termination Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/

/*

const { Op } = require('sequelize');
const TerminationType = require('../models/termination_type.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Branch = require('../models/branch.model'); // 🔹 UPDATED: added branch

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

// 🔹 NEW: Get branch of current user
async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

// 🔹 NEW: Get all user IDs under company + branch
// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];
//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });

//   const ids = [];
//   for (const u of users) {
//     const emp = await Employee.findOne({
//       where: { user_id: u.id },
//       attributes: ['branch_id'],
//       raw: true,
//     });
//     if (emp?.branch_id && String(emp.branch_id) === String(branchId)) {
//       ids.push(Number(u.id));
//     }
//   }
//   if (!ids.includes(Number(companyId))) ids.unshift(Number(companyId));
//   return ids;
// }



// 🔹 UPDATED: Get all user IDs under company (+ optional branch filtering)
async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  // 1) fetch all users that are directly created by the company
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });

  // map to numeric ids
  const userIds = users.map(u => Number(u.id));

  // always include the company id itself (so company-created records are covered)
  const baseSet = new Set([Number(companyId), ...userIds]);

  // 2) if a branchId is provided -> return only those subordinate users who belong to that branch
  if (branchId) {
    if (userIds.length === 0) {
      // only company exists — return company id
      return [Number(companyId)];
    }

    // find employees for those userIds who are in the requested branch
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId
      },
      attributes: ['user_id'],
      raw: true,
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    // include companyId as well to let company-created records be visible
    const result = [...new Set([Number(companyId), ...branchUserIds])];
    return result;
  }

  // 3) branchId === null -> return all subordinate user ids across all branches + companyId
  return Array.from(baseSet);
}



// ============================
// 🔹 Get all termination types
// ============================
exports.getAll = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await TerminationType.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req)) {
      // company can see all their subordinate + branch records
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null); // all branches
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 UPDATED: role users limited to branch
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    }

    const types = await TerminationType.findAll({ where, order: [['id', 'DESC']] });
    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Termination Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get termination type by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const t = await TerminationType.findByPk(id);
      if (!t) return res.status(404).json({ success: false, message: 'Termination Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await TerminationType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Termination Type not found' });
      }
      return res.json({ success: true, data: type });
    }

    // 🔹 UPDATED: branch role user check
    const branchId = await getUserBranchId(req.user.id);
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
      return res.status(404).json({ success: false, message: 'Termination Type not found' });
    }

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create termination type
// ============================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const branchId = await getUserBranchId(req.user.id); // 🔹 UPDATED
    if (!branchId && !isCompany(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Branch assignment required' });
    }

    const type = await TerminationType.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId || null, // 🔹 UPDATED
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update termination type
// ============================
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

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
    console.error('❌ Update Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete termination type
// ============================
exports.delete = async (req, res) => {
  try {
    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    if (isSuper(req)) {
      await type.destroy();
      return res.json({ success: true, message: 'Termination Type deleted successfully' });
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
    return res.json({ success: true, message: 'Termination Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/














const { Op } = require('sequelize');
const TerminationType = require('../models/termination_type.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// ============================
// 🔹 Helpers
// ============================
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
// 🔹 Get all termination types
// ============================
exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAllTerminationTypes');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const all = await TerminationType.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Termination Types Count:', all.length);
      return res.json({ success: true, data: all });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let types = [];

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

      types = await TerminationType.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL TERMINATION TYPES - no company filter
      types = await TerminationType.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Termination Types Count:', types.length);
    }

    console.log('🔍 Final Termination Types Count:', types.length);
    console.log('✅ END getAllTerminationTypes - Success');
    return res.json({ success: true, data: types });

  } catch (err) {
    console.error('❌ Get Termination Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get termination type by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await TerminationType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

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
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide termination types
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
      console.log('🔍 Termination Type created_by:', type.created_by);

      if (!allowedUserIds.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Termination Type not found' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full termination type access');
    }

    return res.json({ success: true, data: type });

  } catch (err) {
    console.error('❌ Get Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create termination type
// ============================
exports.create = async (req, res) => {
  try {
    console.log('🎯 START createTerminationType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating termination type');
      const type = await TerminationType.create({
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
      console.log('🟡 Branch User - Creating termination type');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating termination type');
      // No branch restriction for branchless users
    }

    const type = await TerminationType.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Termination Type created successfully');
    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update termination type
// ============================
exports.update = async (req, res) => {
  try {
    console.log('🎯 START updateTerminationType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating termination type');
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
      console.log('🟡 Branchless User - Updating termination type');
      // No additional checks needed - branchless users can update any termination type
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();

    console.log('✅ Termination Type updated successfully');
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete termination type
// ============================
exports.delete = async (req, res) => {
  try {
    console.log('🎯 START deleteTerminationType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const type = await TerminationType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Termination Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting termination type');
      await type.destroy();
      return res.json({ success: true, message: 'Termination Type deleted successfully' });
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
      console.log('🟡 Branchless User - Deleting termination type');
      // No additional checks needed - branchless users can delete any termination type
    }

    await type.destroy();
    console.log('✅ Termination Type deleted successfully');
    return res.json({ success: true, message: 'Termination Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Termination Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


