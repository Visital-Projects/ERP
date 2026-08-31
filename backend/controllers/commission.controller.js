const { Op } = require('sequelize');
const Commission = require('../models/commission.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // 🟢 FIX: First check if user is company/admin
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin'].includes(type)) {
      return req.user.id;
    }

    // 🟢 FIX: For branchless users, get company ID from users table
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('🔍 User Record for Branchless User:', userRecord);
    
    if (userRecord?.created_by) {
      return Number(userRecord.created_by);
    }

    // 🟢 Fallback: Check if user has employee record
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    if (emp?.created_by) return Number(emp.created_by);

    return null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

function isCompanyUser(req) {
  const t = (req.user?.type || '').toLowerCase();
  return t === 'company' || t === 'admin';
}

function isEmployeeUser(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

function isSuper(req) {
  return Array.isArray(req.user?.roles) && req.user.roles.some(r => (r.name || '').toLowerCase() === 'super admin');
}


async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true
  });
  return emp?.branch_id || null;
}


async function getUserEmployeeRecord(userId) {
  return await Employee.findOne({
    where: { user_id: userId, deleted_at: null },
    attributes: ['branch_id', 'created_by'],
    raw: true,
  });
}


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
        // branch_id
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

function formatCommission(c) {
  if (!c) return null;
  const json = c.toJSON ? c.toJSON() : c;
  return {
    id: json.id,
    title: json.title,
    type: json.type,
    amount: json.amount,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at,
    employee_id: json.employee ? json.employee.employee_id : null,
    employee: json.employee
      ? { employee_id: json.employee.employee_id, name: json.employee.name }
      : null
  };
}

exports.createCommission = async (req, res) => {
  try {
    const { title, type, amount, employee_id } = req.body;
    if (!employee_id) return res.status(400).json({ success: false, message: 'employee_id is required' });

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    console.log('🔍 User ID:', req.user.id);
    console.log('🔍 User Type:', req.user.type);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
    console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

    const targetEmp = await Employee.findOne({
      where: { employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
    });

    console.log('🔍 Target Employee:', targetEmp);

    if (!targetEmp) return res.status(404).json({ success: false, message: 'Employee not found in your company' });

    // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      // Branch users can only create commissions for employees in their branch
      if (String(branchId) !== String(targetEmp.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot create commission for another branch' 
        });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless/Company User Access (Company-wide)');
      // No branch restrictions - can create commissions for any employee in company
    }

    // 🟢 Employee users can only create commissions for themselves
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(employee_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only create commissions for yourself' 
        });
      }
    }

    const createdBy = isCompanyUser(req) || isSuper(req) ? companyId : req.user.id;
    console.log('🔍 Created By:', createdBy);

    const commission = await Commission.create({
      title,
      type,
      amount,
      employee_id: targetEmp.id,
      created_by: createdBy
    });

    const result = await Commission.findByPk(commission.id, {
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }]
    });

    res.status(201).json({ success: true, message: 'Commission created', data: formatCommission(result) });

  } catch (error) {
    console.error('Create Commission Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAllCommissions = async (req, res) => {
  try {
    console.log('🎯 START getAllCommissions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const commissions = await Commission.findAll({
        where: { deleted_at: null },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }],
        order: [['id', 'DESC']]
      });
      console.log('🟡 Super Admin Commissions Count:', commissions.length);
      return res.json({ success: true, data: commissions.map(formatCommission) });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let commissions = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      const branchEmployees = await Employee.findAll({
        where: { created_by: { [Op.in]: allowedUserIds }, branch_id: branchId, deleted_at: null },
        attributes: ['id'],
        raw: true
      });
      const employeeIds = branchEmployees.map(e => e.id);

      commissions = await Commission.findAll({
        where: { 
          employee_id: { [Op.in]: employeeIds }, 
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null 
        },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }],
        order: [['id', 'DESC']]
      });

    } else if (isEmployeeUser(req)) {
      // 🟢 CASE 2: Employee user → self access only
      console.log('🟡 Employee User Access (Self only)');
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
      
      commissions = await Commission.findAll({
        where: { employee_id: emp.id, deleted_at: null },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }],
        order: [['id', 'DESC']]
      });

    } else {
      // 🟢 CASE 3: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless/Company User Access (FULL DATABASE)');
      
      // 🟢 HIGHLIGHTED: DIRECTLY GET ALL COMMISSIONS - no company filter
      commissions = await Commission.findAll({
        where: { deleted_at: null },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }],
        order: [['id', 'DESC']]
      });
    }

    console.log('🔍 Final Commissions Count:', commissions.length);
    return res.json({ success: true, data: commissions.map(formatCommission) });

  } catch (error) {
    console.error('Get All Commissions Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getCommissionsByEmployeeId = async (req, res) => {
  try {
    let employeeBusinessId = req.params.id;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);

    const targetEmp = await Employee.findOne({
      where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
    });

    if (!targetEmp) return res.status(404).json({ success: false, message: 'Employee not found in your company' });

    // 🟢 HIGHLIGHTED: ACCESS CONTROL LOGIC
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const branchId = userEmployeeRecord.branch_id;
      if (String(branchId) !== String(targetEmp.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: cannot view commissions from another branch' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      // No branch restrictions - can view commissions for any employee in company
    }

    // Employee self-access
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({ success: false, message: 'You can only view your own commissions' });
      }
    }

    const commissions = await Commission.findAll({
      where: { employee_id: targetEmp.id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name'] }],
      order: [['id', 'DESC']]
    });

    res.json({ success: true, data: commissions.map(formatCommission) });

  } catch (error) {
    console.error('Get Commissions By Employee ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateCommission = async (req, res) => {
  try {
    const commissionId = req.params.id;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);

    const commission = await Commission.findOne({
      where: { id: commissionId, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }]
    });

    if (!commission) return res.status(404).json({ success: false, message: 'Commission not found' });

    // 🟢 HIGHLIGHTED: ACCESS CONTROL LOGIC
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const branchId = userEmployeeRecord.branch_id;
      if (String(branchId) !== String(commission.employee.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: cannot update commission of another branch' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      // No branch restrictions - can update any commission in company
    }

    // Employee can't update employee_id and can only update their own commissions
    if (isEmployeeUser(req)) {
      delete req.body.employee_id;
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.id) !== String(commission.employee_id)) {
        return res.status(403).json({ success: false, message: 'You can only update your own commissions' });
      }
    }

    // If employee_id changed (branch users / company)
    if (req.body.employee_id && !isEmployeeUser(req)) {
      const newEmp = await Employee.findOne({
        where: { employee_id: req.body.employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
      });
      if (!newEmp) return res.status(404).json({ message: 'Employee not found in your company' });
      req.body.employee_id = newEmp.id;
    }

    await commission.update({ ...req.body, updated_at: new Date() });

    res.json({ success: true, message: 'Commission updated', data: formatCommission(commission) });

  } catch (error) {
    console.error('Update Commission Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);

    const commission = await Commission.findOne({
      where: { id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null },
      include: [{ model: Employee, as: 'employee', attributes: ['branch_id'] }]
    });

    if (!commission) return res.status(404).json({ success: false, message: 'Commission not found' });

    // 🟢 HIGHLIGHTED: ACCESS CONTROL LOGIC
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const branchId = userEmployeeRecord.branch_id;
      if (String(branchId) !== String(commission.employee.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: cannot delete commission from another branch' });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      // No branch restrictions - can delete any commission in company
    }

    // Employee self-check
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.id) !== String(commission.employee_id)) {
        return res.status(403).json({ success: false, message: 'You can only delete your own commissions' });
      }
    }

    await commission.destroy(); // soft delete
    res.json({ success: true, message: 'Commission deleted (soft)', data: { id } });

  } catch (error) {
    console.error('Delete Commission Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


