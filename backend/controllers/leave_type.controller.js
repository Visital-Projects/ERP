

/*
const { Op } = require('sequelize');
const LeaveType = require('../models/leave_type.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');


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


// exports.getAllLeaveTypes = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let where = {};

//     if (!isSuper(req)) {
//       if (isCompany(req)) {
//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       } else {
//         const branchId = await getUserBranchId(req.user.id);
//         if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });
//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       }
//     }

//     const types = await LeaveType.findAll({ where, order: [['id', 'DESC']] });
//     return res.json({ success: true, data: types });
//   } catch (err) {
//     console.error('❌ Get Leave Types Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
exports.getAllLeaveTypes = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    let where = {};

    if (!isSuper(req)) {
      if (isCompany(req)) {
        // 🟩 CASE 1: Company user → full access to all branches
        const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
        where.created_by = { [Op.in]: allowedCreatedBy };

      } else if (isEmployee(req)) {
        // 🟩 CASE 2: Employee → access only to their branch leave types
        const branchId = await getUserBranchId(req.user.id);
        if (!branchId)
          return res.status(403).json({ success: false, message: 'No branch assigned' });

        const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
        where.created_by = { [Op.in]: allowedCreatedBy };
        where.branch_id = branchId;

      } else {
        // 🟩 CASE 3: Direct company-created role user (not employee)
        // These users have access to all branches under the same company
        const userRecord = await User.findOne({
          where: { id: req.user.id },
          attributes: ['created_by'],
          raw: true,
        });

        const creatorId = userRecord?.created_by || companyId;
        const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(creatorId, null);
        where.created_by = { [Op.in]: allowedCreatedBy };
        // 🟩 No branch restriction applied — company-wide access
      }
    }

    const types = await LeaveType.findAll({
      where,
      order: [['id', 'DESC']],
    });

    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Leave Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



exports.getLeaveTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await LeaveType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Leave Type not found' });
      }
    }

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createLeaveType = async (req, res) => {
  try {
    const { title, days } = req.body;
    if (!title?.trim() || days === undefined) return res.status(400).json({ success: false, message: 'Title and Days are required' });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const branchId = await getUserBranchId(req.user.id);
    if (!branchId && !isCompany(req) && !isSuper(req)) return res.status(403).json({ success: false, message: 'Branch assignment required' });

    const type = await LeaveType.create({
      title: title.trim(),
      days,
      created_by: req.user.id,
      branch_id: branchId || null,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updateLeaveType = async (req, res) => {
  try {
    const { title, days } = req.body;
    if (!title?.trim() || days === undefined) return res.status(400).json({ success: false, message: 'Title and Days are required' });

    const type = await LeaveType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
      }
    }

    type.title = title.trim();
    type.days = days;
    type.updated_at = new Date();
    await type.save();

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deleteLeaveType = async (req, res) => {
  try {
    const type = await LeaveType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
      }
    }

    await type.destroy();
    return res.json({ success: true, message: 'Leave Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

*/




const { Op } = require('sequelize');
const LeaveType = require('../models/leave_type.model');
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


exports.getAllLeaveTypes = async (req, res) => {
  try {
    console.log('🎯 START getAllLeaveTypes');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const types = await LeaveType.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Leave Types Count:', types.length);
      return res.json({ success: true, data: types });
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

      types = await LeaveType.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL LEAVE TYPES - no company filter
      types = await LeaveType.findAll({
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Leave Types Count:', types.length);
    }

    console.log('🔍 Final Leave Types Count:', types.length);
    console.log('✅ END getAllLeaveTypes - Success');
    return res.json({ success: true, data: types });

  } catch (err) {
    console.error('❌ Get Leave Types Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getLeaveTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await LeaveType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

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
      // 🟢 CASE 1: User has employee record with branch → branch-level access + company-wide leave types
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
      console.log('🔍 Leave Type created_by:', type.created_by);

      if (!allowedUserIds.map(String).includes(String(type.created_by))) {
        return res.status(404).json({ success: false, message: 'Leave Type not found' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full leave type access');
    }

    return res.json({ success: true, data: type });

  } catch (err) {
    console.error('❌ Get Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createLeaveType = async (req, res) => {
  try {
    console.log('🎯 START createLeaveType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { title, days } = req.body;
    if (!title?.trim() || days === undefined) return res.status(400).json({ success: false, message: 'Title and Days are required' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating leave type');
      const type = await LeaveType.create({
        title: title.trim(),
        days,
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
      console.log('🟡 Branch User - Creating leave type');
      branchId = userEmployeeRecord.branch_id;
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating leave type');
      // No branch restriction for branchless users
    }

    const type = await LeaveType.create({
      title: title.trim(),
      days,
      created_by: req.user.id,
      branch_id: branchId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Leave Type created successfully');
    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updateLeaveType = async (req, res) => {
  try {
    console.log('🎯 START updateLeaveType');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { title, days } = req.body;
    if (!title?.trim() || days === undefined) return res.status(400).json({ success: false, message: 'Title and Days are required' });

    const type = await LeaveType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating leave type');
      type.title = title.trim();
      type.days = days;
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
      console.log('🟡 Branchless User - Updating leave type');
      // No additional checks needed - branchless users can update any leave type
    }

    type.title = title.trim();
    type.days = days;
    type.updated_at = new Date();
    await type.save();

    console.log('✅ Leave Type updated successfully');
    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deleteLeaveType = async (req, res) => {
  try {
    const type = await LeaveType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Leave Type not found' });

    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
      const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      if (!allowedCreatedBy.map(String).includes(String(type.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
      }
    }

    await type.destroy();
    return res.json({ success: true, message: 'Leave Type deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Leave Type Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


