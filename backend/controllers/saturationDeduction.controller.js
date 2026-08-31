const { Op } = require('sequelize');
const SaturationDeduction = require('../models/saturationDeduction.model');
const Employee = require('../models/employee.model');
const DeductionOption = require('../models/deductionOption.model');
const User = require('../models/user.model');


async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    console.log('🔍 getCompanyId - User ID:', req.user.id, 'Type:', req.user.type, 'Creator ID:', req.user.creator_id);
    
    // 🟢 HIGHLIGHTED: First check if user is company/admin
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin'].includes(type)) {
      console.log('🔍 getCompanyId - Company/Admin user, returning:', req.user.id);
      return req.user.id;
    }

    // 🟢 HIGHLIGHTED: For branchless users, get company ID from users table
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'created_by', 'type'],
      raw: true,
    });
    
    console.log('🔍 getCompanyId - User Record from DB:', userRecord);
    
    if (userRecord?.created_by) {
      console.log('🔍 getCompanyId - Found created_by in user record:', userRecord.created_by);
      return Number(userRecord.created_by);
    }

    // 🟢 Fallback: Check if user has employee record
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['id', 'created_by', 'branch_id'],
      raw: true,
    });
    
    console.log('🔍 getCompanyId - Employee Record:', emp);
    
    if (emp?.created_by) {
      console.log('🔍 getCompanyId - Found created_by in employee record:', emp.created_by);
      return Number(emp.created_by);
    }

    console.log('🔍 getCompanyId - No company ID found, returning null');
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

async function getUserEmployeeRecord(userId) {
  return await Employee.findOne({
    where: { user_id: userId, deleted_at: null },
    attributes: ['branch_id', 'created_by'],
    raw: true,
  });
}


async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true
  });
  return emp?.branch_id || null;
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


function formatDeduction(r) {
  if (!r) return null;
  const json = typeof r.toJSON === 'function' ? r.toJSON() : r;
  return {
    id: json.id,
    employee_id: json.employee_id,
    deduction_option: json.deduction_option,
    title: json.title,
    amount: json.amount,
    type: json.type,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at,
    employee: json.employee
      ? {
          employee_id: json.employee.employee_id,
          name: json.employee.name,
          email: json.employee.email,
          branch_id: json.employee.branch_id,
        }
      : null,
    deductionOption: json.deductionOption || null,
  };
}

exports.create = async (req, res) => {
  try {
    console.log('🎯 START create Saturation Deduction');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Request Body:', req.body);

    const companyId = await getCompanyId(req);
    console.log('🔍 Final Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const payload = { ...req.body, created_by: req.user.id };

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      if (!self)
        return res
          .status(404)
          .json({ success: false, message: 'Employee not found' });
      payload.employee_id = self.employee_id;
    } else {
      if (!payload.employee_id)
        return res
          .status(400)
          .json({ success: false, message: 'employee_id is required' });

    //   // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
    //   let employeeWhere = {
    //     employee_id: payload.employee_id,
    //     deleted_at: null,
    //   };

    //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
    //     // 🟢 BRANCH USER: Restricted to own branch
    //     const branchId = userEmployeeRecord.branch_id;
    //     console.log('🟡 Branch User Access - Branch ID:', branchId);
        
    //     const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(
    //       companyId,
    //       branchId
    //     );
    //     console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

    //     employeeWhere.created_by = { [Op.in]: allowedCreatedByAll };
    //   } else {
    //     // 🟢 BRANCHLESS USER: Full company access - search ALL employees
    //     console.log('🟡 Branchless User Access (Company-wide)');
    //     // No created_by filter for branchless users - they can access any employee
    //   }
    
    // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
    let employeeWhere = {
      employee_id: payload.employee_id,
      deleted_at: null,
    };
    
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Restricted to own branch - check by BRANCH_ID, not created_by
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      // 🟩 FIX: Search for employee by employee_id AND branch_id
      employeeWhere.branch_id = branchId;
      
      console.log('🔍 Employee Search Criteria for Branch User:', employeeWhere);
    } else {
      // 🟢 BRANCHLESS USER: Full company access - search ALL employees
      console.log('🟡 Branchless User Access (Company-wide)');
      // No additional filters for branchless users - they can access any employee
    }

      console.log('🔍 Employee Search Criteria:', employeeWhere);

      const emp = await Employee.findOne({
        where: employeeWhere
      });
      
      console.log('🔍 Target Employee Found:', emp);

      if (!emp) {
        // 🟢 HIGHLIGHTED: Additional debugging to see what employees exist
        const allEmployees = await Employee.findAll({
          where: { deleted_at: null },
          attributes: ['employee_id', 'name', 'created_by', 'branch_id'],
          limit: 10,
          raw: true
        });
        console.log('🔍 First 10 Employees in System:', allEmployees);
        
        return res.status(404).json({
          success: false,
          message: 'Employee not found in your branch/company',
        });
      }

      // 🟢 HIGHLIGHTED: Additional branch validation for branch users
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', emp.branch_id);
        if (String(emp.branch_id) !== String(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: cannot create deduction for employee in another branch' 
          });
        }
      }
    }

    const created = await SaturationDeduction.create(payload);
    const full = await SaturationDeduction.findOne({
      where: { id: created.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name', 'email', 'branch_id'],
        },
        { model: DeductionOption, as: 'deductionOption' },
      ],
    });

    console.log('✅ Saturation Deduction created successfully');
    res.status(201).json({
      success: true,
      message: 'Saturation Deduction created',
      data: formatDeduction(full),
    });
  } catch (error) {
    console.error('Create Saturation Deduction Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAll Saturation Deductions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let records = [];
    let allowedCreatedByAll = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: BRANCH USER - Can see deductions from company + branchless users + own branch users
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      // 🟢 HIGHLIGHTED: Get COMPANY USERS (company + branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // 🟢 HIGHLIGHTED: Filter to get only branchless users (users without employee records)
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

      // 🟢 HIGHLIGHTED: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: branchId,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 HIGHLIGHTED: Combined allowed users: companyId + branchless users + current branch users
      allowedCreatedByAll = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedCreatedByAll);

    } else if (isEmployeeUser(req)) {
      // 🟢 CASE 2: Employee user → self access only
      console.log('🟡 Employee User Access (Self only)');
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      if (!self)
        return res
          .status(404)
          .json({ success: false, message: 'Employee record not found' });
      
      allowedCreatedByAll = [Number(companyId), req.user.id];

    } else {
      // 🟢 CASE 3: BRANCHLESS/COMPANY USER - Can see ALL deductions in company
      console.log('🟡 Branchless/Company User Access (FULL DATABASE)');
      allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed Created By All:', allowedCreatedByAll);
    }

    let where = { created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null };

    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      if (!self)
        return res
          .status(404)
          .json({ success: false, message: 'Employee record not found' });
      where.employee_id = self.employee_id;
    }

    records = await SaturationDeduction.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name', 'email', 'branch_id'],
        },
        { model: DeductionOption, as: 'deductionOption' },
      ],
      order: [['id', 'DESC']],
    });

    console.log('🔍 Final Records Count:', records.length);
    console.log('🔍 Records Details:', records.map(r => ({ id: r.id, created_by: r.created_by, employee_id: r.employee_id })));
    res.json({ success: true, data: records.map(formatDeduction) });
  } catch (error) {
    console.error('Get All Saturation Deductions Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getByEmployeeId = async (req, res) => {
  try {
    const employeeBusinessId = req.params.id;
    console.log('🎯 START getByEmployeeId Saturation Deductions');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', employeeBusinessId);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let allowedCreatedByAll = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: BRANCH USER - Can see deductions from company + branchless users + own branch users
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      // 🟢 HIGHLIGHTED: Get COMPANY USERS (company + branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // 🟢 HIGHLIGHTED: Filter to get only branchless users (users without employee records)
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

      // 🟢 HIGHLIGHTED: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: branchId,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 HIGHLIGHTED: Combined allowed users: companyId + branchless users + current branch users
      allowedCreatedByAll = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedCreatedByAll);

    } else {
      // 🟢 CASE 2: BRANCHLESS/COMPANY USER - Can see ALL deductions in company
      console.log('🟡 Branchless/Company User Access (Company-wide)');
      allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed Created By All:', allowedCreatedByAll);
    }

    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      if (!self)
        return res
          .status(404)
          .json({ success: false, message: 'Employee profile not found' });

      if (String(self.employee_id) !== String(employeeBusinessId))
        return res.status(403).json({
          success: false,
          message: 'Forbidden: can view only your own deductions',
        });
    }

    // 🟢 HIGHLIGHTED: Enhanced employee search for branchless users
    let employeeWhere = {
      employee_id: employeeBusinessId,
      deleted_at: null,
    };

    // Only add created_by filter for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      employeeWhere.created_by = { [Op.in]: allowedCreatedByAll };
    }

    const targetEmp = await Employee.findOne({
      where: employeeWhere
    });
    
    console.log('🔍 Target Employee:', targetEmp);

    if (!targetEmp)
      return res.status(404).json({
        success: false,
        message: 'Employee not found in your branch/company',
      });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', targetEmp.branch_id);
      if (String(targetEmp.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot view deductions for employee in another branch' 
        });
      }
    }

    // 🟢 HIGHLIGHTED: Enhanced loan search for branchless users
    let loanWhere = {
      employee_id: targetEmp.employee_id,
      deleted_at: null,
    };

    // Only add created_by filter for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      loanWhere.created_by = { [Op.in]: allowedCreatedByAll };
    }

    const records = await SaturationDeduction.findAll({
      where: loanWhere,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name', 'email', 'branch_id'],
        },
        { model: DeductionOption, as: 'deductionOption' },
      ],
      order: [['id', 'DESC']],
    });

    console.log('🔍 Found Records Count:', records.length);
    console.log('🔍 Records Details:', records.map(r => ({ id: r.id, created_by: r.created_by })));
    res.json({ success: true, data: records.map(formatDeduction) });
  } catch (error) {
    console.error('Get Deductions By Employee Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START update Saturation Deduction');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Record ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let record;


    // 🟢 NEW CODE (Fixed):
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Find record by ID and check if employee is in same branch
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      record = await SaturationDeduction.findOne({
        where: { id, deleted_at: null },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'branch_id'],
            where: { branch_id: branchId, deleted_at: null } // 🟢 KEY FIX: Filter by employee branch
          },
        ],
      });

      console.log('🔍 Found Record for Branch User:', record ? {
        id: record.id,
        employee_id: record.employee_id,
        created_by: record.created_by,
        employee_branch: record.employee?.branch_id
      } : 'NOT FOUND IN YOUR BRANCH');

    } else {
      // 🟢 BRANCHLESS USER: Full company access - find record without branch filter
      console.log('🟡 Branchless User Access (Company-wide)');
      
      record = await SaturationDeduction.findOne({
        where: { id, deleted_at: null },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'branch_id'],
          },
        ],
      });

      console.log('🔍 Found Record for Branchless User:', record ? {
        id: record.id,
        employee_id: record.employee_id,
        created_by: record.created_by,
        employee_branch: record.employee?.branch_id
      } : 'NOT FOUND');
    }

    if (!record)
      return res.status(404).json({ success: false, message: 'Record not found' });


    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      console.log('🔍 Employee Self Check - Self Employee ID:', self?.employee_id, 'Record Employee ID:', record.employee_id);
      if (!self || self.employee_id !== record.employee_id)
        return res.status(403).json({
          success: false,
          message: 'Forbidden: cannot update others deduction',
        });
    }

    await record.update({ ...req.body, updated_at: new Date() });

    const updated = await SaturationDeduction.findOne({
      where: { id: record.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name', 'email', 'branch_id'],
        },
        { model: DeductionOption, as: 'deductionOption' },
      ],
    });

    console.log('✅ Saturation Deduction updated successfully');
    res.json({
      success: true,
      message: 'Saturation Deduction updated',
      data: formatDeduction(updated),
    });
  } catch (error) {
    console.error('Update Saturation Deduction Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START remove Saturation Deduction');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Record ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let record;

    // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Restricted to own branch
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(
        companyId,
        branchId
      );
      console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

      record = await SaturationDeduction.findOne({
        where: { id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'branch_id'],
          },
        ],
      });

    } else {
      // 🟢 BRANCHLESS USER: Full company access - find record without created_by filter
      console.log('🟡 Branchless User Access (Company-wide)');
      
      record = await SaturationDeduction.findOne({
        where: { id, deleted_at: null },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'branch_id'],
          },
        ],
      });
    }

    console.log('🔍 Found Record:', record ? {
      id: record.id,
      employee_id: record.employee_id,
      created_by: record.created_by,
      employee_branch: record.employee?.branch_id
    } : 'NOT FOUND');

    if (!record)
      return res.status(404).json({ success: false, message: 'Record not found' });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', record.employee?.branch_id);
      if (String(record.employee.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot delete deduction for employee in another branch' 
        });
      }
    }

    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      console.log('🔍 Employee Self Check - Self Employee ID:', self?.employee_id, 'Record Employee ID:', record.employee_id);
      if (!self || self.employee_id !== record.employee_id)
        return res.status(403).json({
          success: false,
          message: 'Forbidden: cannot delete others deduction',
        });
    }

    await record.destroy(); // ✅ soft delete
    console.log('✅ Saturation Deduction deleted successfully');
    res.json({
      success: true,
      message: 'Saturation Deduction deleted (soft)',
      data: { id },
    });
  } catch (error) {
    console.error('Delete Saturation Deduction Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};



