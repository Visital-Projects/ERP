

/*
// const AwardType = require('../models/award_type.model');
// const Employee = require('../models/employee.model');

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

//   // fallback
//   return req.user.creator_id || req.user.id;
// }

// // ============================
// // 🔹 Helper: super admin check
// // ============================
// function isSuper(req) {
//   return (req.user?.roles || []).some(r => r.name?.toLowerCase() === 'super admin');
// }

// // ============================
// // 🔹 Get all award types
// // ============================
// exports.getAllAwardTypes = async (req, res) => {
//   try {
//     const where = {};
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
//       where.created_by = companyId;
//     }

//     const types = await AwardType.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     res.json({ success: true, data: types });
//   } catch (err) {
//     console.error('❌ Get Award Types Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Get award type by ID
// // ============================
// exports.getAwardTypeById = async (req, res) => {
//   try {
//     const where = { id: req.params.id };
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
//       where.created_by = companyId;
//     }

//     const type = await AwardType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Get Award Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Create award type
// // ============================
// exports.createAwardType = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const type = await AwardType.create({
//       name: name.trim(),
//       created_by: companyId,
//       user_id: req.user.id, // optional: track which employee created it
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Create Award Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Update award type
// // ============================
// exports.updateAwardType = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const where = { id: req.params.id, created_by: companyId };
//     const type = await AwardType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

//     type.name = name.trim();
//     type.updated_at = new Date();
//     await type.save();

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Update Award Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete award type
// // ============================
// exports.deleteAwardType = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const where = { id: req.params.id, created_by: companyId };
//     const type = await AwardType.findOne({ where });
//     if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

//     await type.destroy();
//     res.json({ success: true, message: 'Award Type deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Award Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };







const { Op } = require('sequelize'); // 🔹 UPDATED
const AwardType = require('../models/award_type.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); // 🔹 UPDATED - to list subordinate users

// ============================
// 🔹 Helper: resolve company id
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = (req.user.type || '').toLowerCase();

  // Company/Admin/Super Admin → own id
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

  // fallback
  return req.user.creator_id || req.user.id;
}

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; } // 🔹 UPDATED helper
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; } // 🔹 UPDATED helper

// 🔹 UPDATED helper: returns array of user ids under company (companyId + subordinate users)
// This allows company queries to check created_by IN (company + subordinate user ids)
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
// 🔹 Get all award types
// ============================
exports.getAllAwardTypes = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await AwardType.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company (and employees viewing) can see award types created by company AND subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 Role users can only see award types they personally created
      where.created_by = req.user.id;
    }

    const types = await AwardType.findAll({
      where,
      order: [['id', 'DESC']],
    });

    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Award Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get award type by ID
// ============================
exports.getAwardTypeById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const t = await AwardType.findByPk(id);
      if (!t) return res.status(404).json({ success: false, message: 'Award Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const award = await AwardType.findByPk(id);
    if (!award) return res.status(404).json({ success: false, message: 'Award Type not found' });

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 Company/Employee: allowed if created_by belongs to company or subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(award.created_by))) {
        return res.status(404).json({ success: false, message: 'Award Type not found' });
      }
      return res.json({ success: true, data: award });
    }

    // 🔹 Role user: allowed only if they created it
    if (String(award.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Award Type not found' });
    }

    return res.json({ success: true, data: award });
  } catch (err) {
    console.error('❌ Get Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create award type
// ============================
exports.createAwardType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: record actual creator (user id) as created_by so ownership is tracked per-user.
    //           company queries later will include subordinate users.
    const creatorId = req.user.id;

    const type = await AwardType.create({
      name: name.trim(),
      created_by: creatorId,        // 🔹 UPDATED: creator user id
      user_id: req.user.id || null, // keep user_id if model supports it
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update award type
// ============================
exports.updateAwardType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    if (isSuper(req)) {
      const type = await AwardType.findByPk(req.params.id);
      if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update its own and subordinate users' award types
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
      // Employees are view-only
      return res.status(403).json({ success: false, message: 'Employees cannot update award types' });
    }

    // Role user → only their own creation can be updated
    if (String(type.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only update your own award types' });
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete award type
// ============================
exports.deleteAwardType = async (req, res) => {
  try {
    if (isSuper(req)) {
      const type = await AwardType.findByPk(req.params.id);
      if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });
      await type.destroy();
    //   return res.json({ success: true, message: 'Award Type deleted successfully' });
    return res.json({ success: true, message: 'Award Type soft deleted successfully' });

    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can delete company + subordinate user records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      await type.destroy();
    //   return res.json({ success: true, message: 'Award Type deleted successfully' });
    return res.json({ success: true, message: 'Award Type soft deleted successfully' });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete award types' });
    }

    // Role user → only their own
    if (String(type.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only delete your own award types' });
    }

    await type.destroy();
    // return res.json({ success: true, message: 'Award Type deleted successfully' });
    return res.json({ success: true, message: 'Award Type soft deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/


/*
const { Op } = require('sequelize'); // 🔹 UPDATED
const AwardType = require('../models/award_type.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Branch = require('../models/branch.model'); // 🔹 ADDED (optional, useful if you need branch lookups)

// ============================
// 🔹 Helpers
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || '').toLowerCase();

  // Company/Admin/Super Admin -> own id
  if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

  // Otherwise resolve by employee record
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

// 🔹 NEW: get branch id for a user (returns null when not an employee or not found)
async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

// 🔹 UPDATED: Get all user IDs under company (+ optional branch filter)
// If branchId is null => return companyId + all subordinate user ids
// If branchId is provided => return companyId + subordinate user ids that belong to that branch
async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  // Fetch all users created by company
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });

  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  // If branchId provided → filter subordinate users by branch
  if (branchId) {
    if (userIds.length === 0) {
      // no subordinate users, only company
      return [Number(companyId)];
    }

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

  // branchId === null => return all subordinate user ids + company
  return Array.from(baseSet);
}

// ============================
// 🔹 Get all award types
// ============================
exports.getAllAwardTypes = async (req, res) => {
  try {
    if (isSuper(req)) {
      const all = await AwardType.findAll({ order: [['id', 'DESC']] });
      return res.json({ success: true, data: all });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    // Company & Employee -> company-wide (company + subordinate users)
    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null); // all branches
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // Role users -> branch-scoped (only created_by users in same branch + company)
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    }

    const types = await AwardType.findAll({ where, order: [['id', 'DESC']] });
    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Award Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get award type by ID
// ============================
exports.getAwardTypeById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const t = await AwardType.findByPk(id);
      if (!t) return res.status(404).json({ success: false, message: 'Award Type not found' });
      return res.json({ success: true, data: t });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const award = await AwardType.findByPk(id);
    if (!award) return res.status(404).json({ success: false, message: 'Award Type not found' });

    // Company & Employee -> allowed if created_by in company/subordinates (all branches)
    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(award.created_by))) {
        return res.status(404).json({ success: false, message: 'Award Type not found' });
      }
      return res.json({ success: true, data: award });
    }

    // Role user -> branch-scoped check
    const branchId = await getUserBranchId(req.user.id);
    if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(award.created_by))) {
      return res.status(404).json({ success: false, message: 'Award Type not found' });
    }

    return res.json({ success: true, data: award });
  } catch (err) {
    console.error('❌ Get Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create award type
// ============================
exports.createAwardType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // For branch-scoped role users we must know their branch
    const branchId = await getUserBranchId(req.user.id); // 🔹 UPDATED: capture branch
    if (!branchId && !isCompany(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Branch assignment required' });
    }

    const creatorId = req.user.id;

    const type = await AwardType.create({
      name: name.trim(),
      created_by: creatorId,        // 🔹 UPDATED: keep actual creator user id
      branch_id: branchId || null,  // 🔹 UPDATED: record branch_id (useful for queries)
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update award type
// ============================
exports.updateAwardType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    if (isSuper(req)) {
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Company -> can update company + subordinate user records across branches
    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
    } else if (isEmployee(req)) {
      // Employees are view-only
      return res.status(403).json({ success: false, message: 'Employees cannot update award types' });
    } else {
      // Role user -> branch-scoped update
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

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
    console.error('❌ Update Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete award type
// ============================
exports.deleteAwardType = async (req, res) => {
  try {
    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    if (isSuper(req)) {
      await type.destroy();
      return res.json({ success: true, message: 'Award Type deleted successfully' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
    } else if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete award types' });
    } else {
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    }

    await type.destroy();
    return res.json({ success: true, message: 'Award Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/





const { Op } = require('sequelize');
const AwardType = require('../models/award_type.model');
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


exports.getAllAwardTypes = async (req, res) => {
  try {
    console.log('🎯 START getAllAwardTypes');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const all = await AwardType.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Award Types Count:', all.length);
      return res.json({ success: true, data: all });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let awardTypes = [];

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

      awardTypes = await AwardType.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL AWARD TYPES - no company filter
      awardTypes = await AwardType.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Award Types Count:', awardTypes.length);
    }

    console.log('🔍 Final Award Types Count:', awardTypes.length);
    console.log('✅ END getAllAwardTypes - Success');
    return res.json({ success: true, data: awardTypes });

  } catch (err) {
    console.error('❌ Get All Award Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getAwardTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const award = await AwardType.findByPk(id);
    if (!award) return res.status(404).json({ success: false, message: 'Award Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      return res.json({ success: true, data: award });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide award types
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
      console.log('🔍 Award Type created_by:', award.created_by);

      if (!allowedUserIds.map(String).includes(String(award.created_by))) {
        return res.status(404).json({ success: false, message: 'Award Type not found' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full award type access');
    }

    return res.json({ success: true, data: award });

  } catch (err) {
    console.error('❌ Get Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createAwardType = async (req, res) => {
  try {
    console.log('🎯 START createAwardType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating award type');
      const type = await AwardType.create({
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
      console.log('🟡 Branch User - Creating award type');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating award type');
      // No branch restriction for branchless users
    }

    const type = await AwardType.create({
      name: name.trim(),
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Award Type created successfully');
    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updateAwardType = async (req, res) => {
  try {
    console.log('🎯 START updateAwardType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating award type');
      type.name = name.trim();
      type.updated_at = new Date();
      await type.save();
      return res.json({ success: true, data: type });
    }

    // 🔹 UPDATED: disallow plain employees from updating award types
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update award types' });
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
      console.log('🟡 Branchless User - Updating award type');
      // No additional checks needed - branchless users can update any award type
    }

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();

    console.log('✅ Award Type updated successfully');
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deleteAwardType = async (req, res) => {
  try {
    console.log('🎯 START deleteAwardType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const type = await AwardType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Award Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting award type');
      await type.destroy();
      return res.json({ success: true, message: 'Award Type deleted successfully' });
    }

    // 🔹 UPDATED: disallow plain employees from deleting award types
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete award types' });
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
      console.log('🟡 Branchless User - Deleting award type');
      // No additional checks needed - branchless users can delete any award type
    }

    await type.destroy();
    console.log('✅ Award Type deleted successfully');
    return res.json({ success: true, message: 'Award Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Award Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

