

/*
// const AllowanceOption = require('../models/allowanceOption.model');
// const Employee = require('../models/employee.model');

// // ============================
// // 🔹 Helper: Resolve true company id
// // ============================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (String(req.user.type || '')).toLowerCase();

//   if (['company', 'admin', 'super admin'].includes(type)) {
//     return req.user.id;
//   }

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
// // 🔹 Get All Allowance Options
// // ============================
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized: company context not found' });

//     const options = await AllowanceOption.findAll({
//       where: { created_by: companyId },
//       order: [['id', 'DESC']],
//     });

//     res.json({ success: true, data: options });
//   } catch (err) {
//     console.error('❌ Get Allowance Options Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Get Allowance Option by ID
// // ============================
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await AllowanceOption.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });
//     res.json({ success: true, data: option });
//   } catch (err) {
//     console.error('❌ Get Allowance Option Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Create Allowance Option
// // ============================
// exports.create = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await AllowanceOption.create({
//       name,
//       description: description || null,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ success: true, data: option });
//   } catch (err) {
//     console.error('❌ Create Allowance Option Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Update Allowance Option
// // ============================
// exports.update = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await AllowanceOption.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });

//     option.name = name || option.name;
//     option.description = description !== undefined ? description : option.description;
//     option.updated_at = new Date();
//     await option.save();

//     res.json({ success: true, data: option });
//   } catch (err) {
//     console.error('❌ Update Allowance Option Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ============================
// // 🔹 Delete Allowance Option
// // ============================
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const option = await AllowanceOption.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });

//     await option.destroy();
//     res.json({ success: true, message: 'Allowance option deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Allowance Option Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };



const { Op } = require('sequelize'); // 🔹 UPDATED: for IN queries
const AllowanceOption = require('../models/allowanceOption.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); // 🔹 UPDATED: to find subordinate users

// ============================
// 🔹 Helper: Resolve true company id
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (String(req.user.type || '')).toLowerCase();

  if (['company', 'admin', 'super admin'].includes(type)) {
    return req.user.id;
  }

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

// ============================
// 🔹 Helpers: role checks
// ============================
function isSuper(req) {
  const t = (req.user?.type || '').toLowerCase();
  const roleNames = Array.isArray(req.user?.roles) ? req.user.roles.map(r => (r.name || '').toLowerCase()) : [];
  return t === 'super admin' || roleNames.includes('super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// 🔹 UPDATED helper: return [companyId, ...idsOfUsersCreatedByCompany]
// (company sees records created by itself and by subordinate users)
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

// ============================
// 🔹 Get All Allowance Options
// ============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized: company context not found' });

    if (isSuper(req)) {
      const options = await AllowanceOption.findAll({ order: [['id','DESC']] });
      return res.json({ success: true, data: options });
    }

    let where = {};

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company and employees see company scope (company + subordinate users)
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // 🔹 role users see only what they created
      where.created_by = req.user.id;
    }

    const options = await AllowanceOption.findAll({
      where,
      order: [['id', 'DESC']]
    });

    res.json({ success: true, data: options });
  } catch (err) {
    console.error('❌ Get Allowance Options Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get Allowance Option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await AllowanceOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });
      return res.json({ success: true, data: option });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await AllowanceOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    if (isCompany(req) || isEmployee(req)) {
      // 🔹 UPDATED: company & employee can view if created_by in company or subordinate user's ids
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: 'Allowance option not found' });
      }
      return res.json({ success: true, data: option });
    }

    // 🔹 role users: only if they created it
    if (String(option.created_by) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Allowance option not found' });
    }

    return res.json({ success: true, data: option });
  } catch (err) {
    console.error('❌ Get Allowance Option Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create Allowance Option
// ============================
exports.create = async (req, res) => {
  try {
    // employees not allowed to create
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create allowance options' });
    }

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: created_by is the actual creator (req.user.id).
    // If company user creates, created_by will be company user id.
    // If role user creates, created_by will be their user id.
    const creatorId = req.user.id;

    const option = await AllowanceOption.create({
      name,
      description: description || null,
      created_by: creatorId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ success: true, data: option });
  } catch (err) {
    console.error('❌ Create Allowance Option Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update Allowance Option
// ============================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const opt = await AllowanceOption.findByPk(id);
      if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });
      opt.name = req.body.name ?? opt.name;
      opt.description = req.body.description !== undefined ? req.body.description : opt.description;
      opt.updated_at = new Date();
      await opt.save();
      return res.json({ success: true, data: opt });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update its own + subordinate user's created records
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }

      opt.name = req.body.name ?? opt.name;
      opt.description = req.body.description !== undefined ? req.body.description : opt.description;
      opt.updated_at = new Date();
      await opt.save();
      return res.json({ success: true, data: opt });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update allowance options' });
    }

    // role user -> only their own
    if (String(opt.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only update your own allowance options' });
    }

    opt.name = req.body.name ?? opt.name;
    opt.description = req.body.description !== undefined ? req.body.description : opt.description;
    opt.updated_at = new Date();
    await opt.save();

    return res.json({ success: true, data: opt });
  } catch (err) {
    console.error('❌ Update Allowance Option Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete Allowance Option
// ============================
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const opt = await AllowanceOption.findByPk(id);
      if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });
      await opt.destroy();
    //   return res.json({ success: true, message: 'Allowance option deleted successfully' });
    return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can delete created by company or subordinate users
      const allowedCreatedBy = await getAllUserIdsUnderCompany(companyId);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      await opt.destroy();
    //   return res.json({ success: true, message: 'Allowance option deleted successfully' });
    return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete allowance options' });
    }

    // role user -> only their own
    if (String(opt.created_by) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only delete your own allowance options' });
    }

    await opt.destroy();
    // return res.json({ success: true, message: 'Allowance option deleted successfully' });
    return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Allowance Option Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

*/


/*
const { Op } = require('sequelize'); // 🔹 UPDATED: needed for IN queries
const AllowanceOption = require('../models/allowanceOption.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Branch = require('../models/branch.model'); // optional, kept for parity with other controllers

// ============================
// 🔹 Helpers
// ============================

async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || '').toLowerCase();

  // company/admin/super admin -> own id
  if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true
    });
    if (emp?.created_by) return Number(emp.created_by);
  } catch (err) {
    console.error('getCompanyId Employee lookup failed:', err.message);
  }

  // fallback
  return req.user.creator_id || req.user.id;
}

function isSuper(req) {
  const t = (req.user?.type || '').toLowerCase();
  const roleNames = Array.isArray(req.user?.roles) ? req.user.roles.map(r => (r.name || '').toLowerCase()) : [];
  return t === 'super admin' || roleNames.includes('super admin');
}
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// 🔹 NEW: get branch id for a user (returns null if not found)
async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true
  });
  return emp?.branch_id || null;
}

// 🔹 UPDATED: return companyId + subordinate user ids (optionally filtered by branch)
// - branchId === null => company + all subordinate users (company-wide view)
// - branchId provided => company + subordinate users that belong to that branch (branch-scoped)
async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  // fetch users created by company
  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true
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
      raw: true
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  // branchId === null -> return all subordinate user ids + companyId
  return Array.from(baseSet);
}

// ============================
// 🔹 Get all allowance options
// ============================
exports.getAll = async (req, res) => {
  try {
    if (isSuper(req)) {
      const options = await AllowanceOption.findAll({ order: [['id','DESC']] });
      return res.json({ success: true, data: options });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    // Company & Employee -> company-wide (company + subordinate users across branches)
    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      where.created_by = { [Op.in]: allowedCreatedBy };
    } else {
      // Role users -> branch-scoped: only created_by users in same branch + company
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      where.created_by = { [Op.in]: allowedCreatedBy };
    }

    const options = await AllowanceOption.findAll({ where, order: [['id','DESC']] });
    return res.json({ success: true, data: options });
  } catch (err) {
    console.error('❌ Get Allowance Options Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get allowance option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isSuper(req)) {
      const option = await AllowanceOption.findByPk(id);
      if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });
      return res.json({ success: true, data: option });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const option = await AllowanceOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    // Company & Employee -> allowed if created_by is company or subordinate user (all branches)
    if (isCompany(req) || isEmployee(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: 'Allowance option not found' });
      }
      return res.json({ success: true, data: option });
    }

    // Role user -> branch-scoped check
    const branchId = await getUserBranchId(req.user.id);
    if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(option.created_by))) {
      return res.status(404).json({ success: false, message: 'Allowance option not found' });
    }

    return res.json({ success: true, data: option });
  } catch (err) {
    console.error('❌ Get Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create allowance option
// ============================
exports.create = async (req, res) => {
  try {
    // 🔹 UPDATED: disallow plain employees from creating
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create allowance options' });
    }

    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // capture branch for branch-scoped role users
    const branchId = await getUserBranchId(req.user.id);
    if (!branchId && !isCompany(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Branch assignment required' });
    }

    // store actual creator user id so company later can include subordinate users
    const creatorId = req.user.id;

    const option = await AllowanceOption.create({
      name: name.trim(),
      description: description || null,
      created_by: creatorId,       // 🔹 UPDATED: creator user id
      branch_id: branchId || null, // 🔹 UPDATED: store branch if applicable
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(201).json({ success: true, data: option });
  } catch (err) {
    console.error('❌ Create Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update allowance option
// ============================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    if (isSuper(req)) {
      opt.name = req.body.name ?? opt.name;
      opt.description = req.body.description !== undefined ? req.body.description : opt.description;
      opt.updated_at = new Date();
      await opt.save();
      return res.json({ success: true, data: opt });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isCompany(req)) {
      // 🔹 UPDATED: company can update company + subordinate user records (all branches)
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }

      opt.name = req.body.name ?? opt.name;
      opt.description = req.body.description !== undefined ? req.body.description : opt.description;
      opt.updated_at = new Date();
      await opt.save();
      return res.json({ success: true, data: opt });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update allowance options' });
    }

    // Role user -> branch-scoped update
    const branchId = await getUserBranchId(req.user.id);
    if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only update branch records' });
    }

    opt.name = req.body.name ?? opt.name;
    opt.description = req.body.description !== undefined ? req.body.description : opt.description;
    opt.updated_at = new Date();
    await opt.save();
    return res.json({ success: true, data: opt });
  } catch (err) {
    console.error('❌ Update Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete allowance option
// ============================
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    if (isSuper(req)) {
      await opt.destroy();
      return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isCompany(req)) {
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
      }
      await opt.destroy();
      return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
    }

    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete allowance options' });
    }

    // Role user -> branch-scoped delete
    const branchId = await getUserBranchId(req.user.id);
    if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
      return res.status(403).json({ success: false, message: 'Forbidden: you can only delete branch records' });
    }

    await opt.destroy();
    return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
*/






const { Op } = require('sequelize');
const AllowanceOption = require('../models/allowanceOption.model');
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

// 🔹 Get branch id for a user (returns null if not found)
async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true
  });
  return emp?.branch_id || null;
}

// 🔹 Get all user IDs under company (+ optional branch filtering)
async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true
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
      raw: true
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}

// ============================
// 🔹 Get all allowance options
// ============================
exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAllAllowanceOptions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const options = await AllowanceOption.findAll({ 
        order: [['id','DESC']] 
      });
      console.log('🟡 Super Admin Allowance Options Count:', options.length);
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

      options = await AllowanceOption.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id','DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL ALLOWANCE OPTIONS - no company filter
      options = await AllowanceOption.findAll({
        order: [['id','DESC']],
      });
      
      console.log('🔍 Branchless User - All Allowance Options Count:', options.length);
    }

    console.log('🔍 Final Allowance Options Count:', options.length);
    console.log('✅ END getAllAllowanceOptions - Success');
    return res.json({ success: true, data: options });

  } catch (err) {
    console.error('❌ Get Allowance Options Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get allowance option by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const option = await AllowanceOption.findByPk(id);
    if (!option) return res.status(404).json({ success: false, message: 'Allowance option not found' });

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
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide allowance options
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
      console.log('🔍 Allowance Option created_by:', option.created_by);

      if (!allowedUserIds.map(String).includes(String(option.created_by))) {
        return res.status(404).json({ success: false, message: 'Allowance option not found' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full allowance option access');
    }

    return res.json({ success: true, data: option });

  } catch (err) {
    console.error('❌ Get Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create allowance option
// ============================
exports.create = async (req, res) => {
  try {
    console.log('🎯 START createAllowanceOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    // 🔹 UPDATED: disallow plain employees from creating
    if (isEmployee(req) && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create allowance options' });
    }

    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating allowance option');
      const option = await AllowanceOption.create({
        name: name.trim(),
        description: description || null,
        created_by: req.user.id,
        branch_id: null,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date()
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
      console.log('🟡 Branch User - Creating allowance option');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating allowance option');
      // No branch restriction for branchless users
    }

    const option = await AllowanceOption.create({
      name: name.trim(),
      description: description || null,
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Allowance Option created successfully');
    return res.status(201).json({ success: true, data: option });
  } catch (err) {
    console.error('❌ Create Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Update allowance option
// ============================
exports.update = async (req, res) => {
  try {
    console.log('🎯 START updateAllowanceOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating allowance option');
      opt.name = req.body.name ?? opt.name;
      opt.description = req.body.description !== undefined ? req.body.description : opt.description;
      opt.updated_at = new Date();
      await opt.save();
      return res.json({ success: true, data: opt });
    }

    // 🔹 UPDATED: disallow plain employees from updating
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update allowance options' });
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

      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Updating allowance option');
      // No additional checks needed - branchless users can update any allowance option
    }

    opt.name = req.body.name ?? opt.name;
    opt.description = req.body.description !== undefined ? req.body.description : opt.description;
    opt.updated_at = new Date();
    await opt.save();

    console.log('✅ Allowance Option updated successfully');
    return res.json({ success: true, data: opt });
  } catch (err) {
    console.error('❌ Update Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Delete allowance option
// ============================
exports.remove = async (req, res) => {
  try {
    console.log('🎯 START deleteAllowanceOption');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const opt = await AllowanceOption.findByPk(id);
    if (!opt) return res.status(404).json({ success: false, message: 'Allowance option not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting allowance option');
      await opt.destroy();
      return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
    }

    // 🔹 UPDATED: disallow plain employees from deleting
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete allowance options' });
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

      if (!allowedCreatedBy.map(String).includes(String(opt.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Deleting allowance option');
      // No additional checks needed - branchless users can delete any allowance option
    }

    await opt.destroy();
    console.log('✅ Allowance Option deleted successfully');
    return res.json({ success: true, message: 'Allowance option soft deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Allowance Option Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
