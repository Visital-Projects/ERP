const OtherPayment = require('../models/otherPayment.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); 
const { Op } = require('sequelize');


async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    const type = (req.user.type || '').toLowerCase();

    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // If user is an employee (has employee record), resolve the employee.created_by
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });

    if (emp?.created_by) return Number(emp.created_by);
    
    // 🟢 HIGHLIGHTED: For branchless users, get the company ID from User table
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


function formatRecord(r) {
  if (!r) return null;
  const json = typeof r.toJSON === 'function' ? r.toJSON() : r;
  return {
    id: json.id,
    employee_id: json.employee_id,
    title: json.title,
    amount: json.amount,
    type: json.type,
    payment_date: json.payment_date,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at,
    employee: json.employee ? {
      employee_id: json.employee.employee_id,
      name: json.employee.name,
      branch_id: json.employee.branch_id
    } : null
  };
}


// exports.create = async (req, res) => {
//   try {
//     console.log('🎯 START create OtherPayment');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     const companyId = await getCompanyId(req);
//     console.log('🔍 Company ID:', companyId);
    
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
//     const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     const payload = { ...req.body, created_by: req.user.id };

//     // Employee user: force self
//     if (isEmployeeUser(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
//       payload.employee_id = self.employee_id;
//     } else {
//       if (!payload.employee_id)
//         return res.status(400).json({ success: false, message: 'employee_id is required' });

//       // 🟢 HIGHLIGHTED: UPDATED ACCESS CONTROL LOGIC
//       let allowedUserIds = [];
      
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 BRANCH USER: Restricted to own branch
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🟡 Branch User Access - Branch ID:', branchId);
//         allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       } else {
//         // 🟢 BRANCHLESS USER: Full company access - get ALL users under company
//         console.log('🟡 Branchless User Access (Company-wide)');
//         allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       }

//       console.log('🔍 Allowed User IDs:', allowedUserIds);

//       const emp = await Employee.findOne({
//         where: {
//           employee_id: payload.employee_id,
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null
//         }
//       });
      
//       console.log('🔍 Target Employee:', emp);

//       if (!emp) return res.status(404).json({ success: false, message: 'Employee not found in your branch/company' });

//       // 🟢 HIGHLIGHTED: Additional branch validation ONLY for branch users
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         if (String(emp.branch_id) !== String(userEmployeeRecord.branch_id)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: cannot create payment for employee in another branch' 
//           });
//         }
//       }
//       // 🟢 HIGHLIGHTED: Branchless users can create payments for ANY employee in the company
//       // No additional branch validation needed for branchless users
//     }

//     const created = await OtherPayment.create(payload);
//     const full = await OtherPayment.findOne({
//       where: { id: created.id },
//       include: [{ association: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }]
//     });

//     console.log('✅ OtherPayment created successfully');
//     return res.status(201).json({ success: true, data: formatRecord(full) });
//   } catch (err) {
//     console.error('Create OtherPayment Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
exports.create = async (req, res) => {
  try {
    console.log('🎯 START create OtherPayment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const payload = { ...req.body, created_by: req.user.id };

    // Employee user: force self
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
      payload.employee_id = self.employee_id;
    } else {
      if (!payload.employee_id)
        return res.status(400).json({ success: false, message: 'employee_id is required' });

      

      // 🟢 NEW CODE (Fixed):
      let employeeWhere = {
        employee_id: payload.employee_id,
        deleted_at: null
      };

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Search for employee by employee_id AND branch_id
        const branchId = userEmployeeRecord.branch_id;
        console.log('🟡 Branch User Access - Branch ID:', branchId);
        
        employeeWhere.branch_id = branchId;
        console.log('🔍 Employee Search Criteria for Branch User:', employeeWhere);
      } else {
        // 🟢 BRANCHLESS USER: Full company access - search ALL employees
        console.log('🟡 Branchless User Access (Company-wide)');
        // No additional filters for branchless users
      }

      const emp = await Employee.findOne({
        where: employeeWhere
      });
      
      console.log('🔍 Target Employee Found:', emp);

      if (!emp) {
        // Additional debugging to see what employees exist
        const allEmployees = await Employee.findAll({
          where: { deleted_at: null },
          attributes: ['employee_id', 'name', 'branch_id', 'created_by'],
          limit: 10,
          raw: true
        });
        console.log('🔍 First 10 Employees in System:', allEmployees);
        
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found in your branch/company' 
        });
      }

      // 🟢 HIGHLIGHTED: Additional branch validation for branch users
      // This is now redundant since we already filtered by branch_id, but keeping for clarity
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', emp.branch_id);
        if (String(emp.branch_id) !== String(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: cannot create payment for employee in another branch' 
          });
        }
      }
    }

    const created = await OtherPayment.create(payload);
    const full = await OtherPayment.findOne({
      where: { id: created.id },
      include: [{ association: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }]
    });

    console.log('✅ OtherPayment created successfully');
    return res.status(201).json({ success: true, data: formatRecord(full) });
  } catch (err) {
    console.error('Create OtherPayment Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAll OtherPayments');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let allowedUserIds = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: BRANCH USER - Can see payments from company + branchless users + own branch users
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
      allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);

    } else if (isEmployeeUser(req)) {
      // 🟢 CASE 2: Employee user → self access only
      console.log('🟡 Employee User Access (Self only)');
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
      
      allowedUserIds = [req.user.id];

    } else {
      // 🟢 CASE 3: BRANCHLESS/COMPANY USER - Can see ALL payments in company
      console.log('🟡 Branchless/Company User Access (FULL DATABASE)');
      allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed User IDs:', allowedUserIds);
    }

    const where = { created_by: { [Op.in]: allowedUserIds } };

    const records = await OtherPayment.findAll({
      where,
      include: [{ association: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }],
      order: [['id', 'DESC']]
    });

    console.log('🔍 Final Records Count:', records.length);
    console.log('🔍 Records Details:', records.map(r => ({ id: r.id, created_by: r.created_by, employee_id: r.employee_id })));
    return res.json({ success: true, data: records.map(formatRecord) });
  } catch (err) {
    console.error('Get All OtherPayments Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getByEmployeeId = async (req, res) => {
  try {
    const employeeBusinessId = req.params.id;
    console.log('🎯 START getByEmployeeId OtherPayments');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', employeeBusinessId);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let allowedUserIds = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: BRANCH USER - Can see payments from company + branchless users + own branch users
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
      allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);

    } else {
      // 🟢 CASE 2: BRANCHLESS/COMPANY USER - Can see ALL payments in company
      console.log('🟡 Branchless/Company User Access (Company-wide)');
      allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed User IDs:', allowedUserIds);
    }

    const empCheck = await Employee.findOne({
      where: {
        employee_id: employeeBusinessId,
        created_by: { [Op.in]: allowedUserIds },
        deleted_at: null
      }
    });
    
    console.log('🔍 Employee Check:', empCheck);

    if (!empCheck) return res.status(404).json({ success: false, message: 'Employee not found in your branch/company' });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', empCheck.branch_id);
      if (String(empCheck.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot view payments for employee in another branch' 
        });
      }
    }

    const records = await OtherPayment.findAll({
      where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedUserIds } },
      include: [{ association: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }],
      order: [['id', 'DESC']]
    });

    console.log('🔍 Found Records Count:', records.length);
    console.log('🔍 Records Details:', records.map(r => ({ id: r.id, created_by: r.created_by })));
    return res.json({ success: true, data: records.map(formatRecord) });
  } catch (err) {
    console.error('Get OtherPayments By Employee Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START update OtherPayment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Record ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let record;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Can update payments for employees in their branch (regardless of creator)
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      // 🟢 HIGHLIGHTED: UPDATED LOGIC - Find payment by ID and check if employee is in same branch
      record = await OtherPayment.findOne({
        where: { id: id },
        include: [{
          association: 'employee', 
          attributes: ['employee_id', 'branch_id'],
          where: { branch_id: branchId, deleted_at: null } // 🟢 KEY CHANGE: Filter by employee branch
        }]
      });

      console.log('🔍 Found Record for Branch User:', record ? {
        id: record.id,
        employee_id: record.employee_id,
        created_by: record.created_by,
        employee_branch: record.employee?.branch_id
      } : 'NOT FOUND IN YOUR BRANCH');

    } else {
      // 🟢 BRANCHLESS USER: Full company access - find by created_by
      console.log('🟡 Branchless User Access (Company-wide)');
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed User IDs:', allowedUserIds);

      record = await OtherPayment.findOne({
        where: { id: id, created_by: { [Op.in]: allowedUserIds } },
        include: [{ association: 'employee', attributes: ['employee_id', 'branch_id'] }]
      });

      console.log('🔍 Found Record for Branchless User:', record ? {
        id: record.id,
        employee_id: record.employee_id,
        created_by: record.created_by,
        employee_branch: record.employee?.branch_id
      } : 'NOT FOUND');
    }

    if (!record) return res.status(404).json({ success: false, message: 'Payment not found in your access scope' });

    // 🟢 HIGHLIGHTED: No additional branch validation needed for branch users since we already filtered by employee branch

    await record.update(req.body);

    const updated = await OtherPayment.findOne({
      where: { id: record.id },
      include: [{ association: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }]
    });

    console.log('✅ OtherPayment updated successfully');
    return res.json({ success: true, data: formatRecord(updated) });
  } catch (err) {
    console.error('Update OtherPayment Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START remove OtherPayment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Record ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let allowedUserIds = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Restricted to own branch
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      console.log('🔍 Allowed User IDs:', allowedUserIds);

    } else {
      // 🟢 BRANCHLESS USER: Full company access
      console.log('🟡 Branchless User Access (Company-wide)');
      allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed User IDs:', allowedUserIds);
    }

    const record = await OtherPayment.findOne({
      where: { id: id, created_by: { [Op.in]: allowedUserIds } },
      include: [{ association: 'employee', attributes: ['employee_id', 'branch_id'] }]
    });

    console.log('🔍 Found Record:', record ? {
      id: record.id,
      employee_id: record.employee_id,
      created_by: record.created_by,
      employee_branch: record.employee?.branch_id
    } : 'NOT FOUND');

    if (!record) return res.status(404).json({ success: false, message: 'Payment not found or no access' });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', record.employee?.branch_id);
      if (String(record.employee.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot delete payment for employee in another branch' 
        });
      }
    }

    await record.destroy(); // ✅ Soft delete
    console.log('✅ OtherPayment deleted successfully');
    return res.json({ success: true, message: 'Deleted successfully', data: { id: id } });
  } catch (err) {
    console.error('Delete OtherPayment Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

