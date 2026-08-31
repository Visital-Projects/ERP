// const Overtime = require('../models/overtime.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model'); // Import User
// const { Op } = require('sequelize');


// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || '').toLowerCase();

//   if (type === 'company' || type === 'admin') return req.user.id;
//   if (req.user.creator_id) return req.user.creator_id;

//   // If user is an employee, return the created_by of that employee
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ['created_by'],
//     raw: true
//   });
//   if (emp?.created_by) return Number(emp.created_by);

//   return req.user.id;
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || '').toLowerCase();
//   return t === 'company' || t === 'admin';
// }

// function isEmployeeUser(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// function isSuper(req) {
//   return Array.isArray(req.user?.roles) && req.user.roles.some(r => (r.name || '').toLowerCase() === 'super admin');
// }


// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true
//   });
//   return emp?.branch_id || null;
// }


// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true
//   });
//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         // branch_id
//         branch_id: branchId
//       },
//       attributes: ['user_id'],
//       raw: true
//     });

//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }


// function formatOvertime(r) {
//   if (!r) return null;
//   const json = typeof r.toJSON === 'function' ? r.toJSON() : r;
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     title: json.title,
//     number_of_days: json.number_of_days,
//     hours: json.hours,
//     rate: json.rate,
//     type: json.type,
    
//     // 🟢 NEWLY ADDED FIELDS
//     date: json.date, // ⬅️ Added date from model
//     ot_amount: json.ot_amount, // ⬅️ Added calculated overtime amount

    
//     total: json.total,
//     date_from: json.date_from,
//     date_to: json.date_to,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at,
//     employee: json.employee ? {
//       employee_id: json.employee.employee_id,
//       name: json.employee.name,
//       email: json.employee.email,
//       branch_id: json.employee.branch_id
//     } : null
//   };
// }

// // ========== Controller Methods ==========
// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const payload = { ...req.body };

//     if (req.user.type === 'Employee') {
//       const self = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!self) return res.status(404).json({ message: 'Employee record not found' });
//       payload.employee_id = self.employee_id;
//       payload.created_by = req.user.id;
//     } else {
//       if (!payload.employee_id)
//         return res.status(400).json({ message: 'employee_id is required' });

//       const emp = await Employee.findOne({
//         where: { employee_id: payload.employee_id, created_by: { [Op.in]: allowedUserIds } }
//       });
//       if (!emp) return res.status(400).json({ message: 'Employee not in your branch/company' });
//       payload.created_by = req.user.id;
//     }

//     const overtime = await Overtime.create(payload);
//     const full = await Overtime.findOne({
//       where: { id: overtime.id },
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
//     });

//     return res.status(201).json({ success: true, data: formatOvertime(full) });
//   } catch (err) {
//     console.error('Create Overtime Error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const where = { created_by: { [Op.in]: allowedUserIds } };

//     const rows = await Overtime.findAll({
//       where,
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }],
//       order: [['id', 'DESC']]
//     });

//     return res.json({ success: true, data: rows.map(formatOvertime) });
//   } catch (err) {
//     console.error('Get All Overtime Error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // exports.getByEmployeeId = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);
// //     const branchId = await getUserBranchId(req.user.id);
// //     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

// //     let employeeBusinessId = req.params.id;
// //     if (req.user.type === 'Employee') {
// //       const self = await Employee.findOne({ where: { user_id: req.user.id } });
// //       if (!self) return res.status(404).json({ message: 'Employee record not found' });
// //       employeeBusinessId = self.employee_id;
// //     }

// //     const empCheck = await Employee.findOne({
// //       where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedUserIds } }
// //     });
// //     if (!empCheck) return res.status(404).json({ message: 'Employee not in your branch/company' });

// //     const rows = await Overtime.findAll({
// //       where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedUserIds } },
// //       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }],
// //       order: [['id', 'DESC']]
// //     });

// //     return res.json({ success: true, data: rows.map(formatOvertime) });
// //   } catch (err) {
// //     console.error('Get Overtime By Employee Error:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };
// exports.getByEmployeeId = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let employeeBusinessId = req.params.id;
    
//     // 🟢 Check if user has employee record (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     // 🟢 Employee user: can only view their own overtime
//     if (isEmployeeUser(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
//       employeeBusinessId = self.employee_id;
      
//       // Employee can only access their own data
//       const empCheck = await Employee.findOne({
//         where: { employee_id: employeeBusinessId }
//       });
//       if (!empCheck) return res.status(404).json({ success: false, message: 'Employee not found' });
//     } else {
//       // 🟢 For non-employee users (branch users, branchless users, company)
//       const empCheck = await Employee.findOne({
//         where: { employee_id: employeeBusinessId, deleted_at: null }
//       });
      
//       if (!empCheck) return res.status(404).json({ success: false, message: 'Employee not found' });

//       // 🟢 BRANCH USER: Check if employee is in same branch
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         console.log('🟡 Branch User Access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', empCheck.branch_id);
//         if (String(empCheck.branch_id) !== String(userEmployeeRecord.branch_id)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: cannot access overtime for employee in another branch' 
//           });
//         }
//       }
//       // 🟢 BRANCHLESS USER & COMPANY: No additional checks (full access)
//     }

//     // 🟢 UPDATED AREA — Different query logic based on user type
//     let overtimeWhere = {
//       employee_id: employeeBusinessId
//     };

//     let includeWhere = {};

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 BRANCH USER: Filter by employee branch (not created_by)
//       includeWhere = {
//         model: Employee,
//         as: 'employee',
//         attributes: ['employee_id', 'name', 'email', 'branch_id'],
//         where: { branch_id: userEmployeeRecord.branch_id, deleted_at: null }
//       };
//     } else {
//       // 🟢 BRANCHLESS USER & COMPANY: No branch filter
//       includeWhere = {
//         model: Employee,
//         as: 'employee', 
//         attributes: ['employee_id', 'name', 'email', 'branch_id']
//       };
//     }

//     const rows = await Overtime.findAll({
//       where: overtimeWhere,
//       include: [includeWhere],
//       order: [['id', 'DESC']]
//     });

//     console.log(`🔍 Found ${rows.length} overtime records for employee: ${employeeBusinessId}`);

//     return res.json({ success: true, data: rows.map(formatOvertime) });
//   } catch (err) {
//     console.error('Get Overtime By Employee Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const overtime = await Overtime.findOne({
//       where: { id: req.params.id, created_by: { [Op.in]: allowedUserIds } }
//     });
//     if (!overtime) return res.status(404).json({ message: 'Overtime not found in your access scope' });

//     delete req.body.created_by; // prevent tampering

//     await overtime.update(req.body);
//     const updated = await Overtime.findOne({
//       where: { id: overtime.id },
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
//     });

//     return res.json({ success: true, data: formatOvertime(updated) });
//   } catch (err) {
//     console.error('Update Overtime Error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const overtime = await Overtime.findOne({
//       where: { id: req.params.id, created_by: { [Op.in]: allowedUserIds } }
//     });
//     if (!overtime) return res.status(404).json({ message: 'Overtime not found or no access' });

//     await overtime.destroy(); // ✅ Soft delete
//     return res.json({ success: true, message: 'Deleted successfully', data: { id: req.params.id } });
//   } catch (err) {
//     console.error('Delete Overtime Error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


















const Overtime = require('../models/overtime.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Skill = require('../models/skill.model');
const Branch = require('../models/branch.model');
const Designation = require('../models/designation.model');
const Allowance = require('../models/allowance.model');

const { Op } = require('sequelize');


// ================= HELPER FUNCTIONS =================

async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || '').toLowerCase();

  if (type === 'company' || type === 'admin') return req.user.id;
  if (req.user.creator_id) return req.user.creator_id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by'],
    raw: true
  });

  if (emp?.created_by) return Number(emp.created_by);

  return req.user.id;
}

function isEmployeeUser(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

function isSuper(req) {
  return Array.isArray(req.user?.roles) &&
    req.user.roles.some(r => (r.name || '').toLowerCase() === 'super admin');
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


// ================= SALARY BASED OT CALCULATION =================

async function calculateOvertimeAmount(employeeBusinessId, overtimeHours) {

  const employee = await Employee.findOne({
    where: { employee_id: employeeBusinessId },
    include: [
      { model: Skill, as: 'skill', attributes: ['wages'] },
      { model: Branch, as: 'branch', attributes: ['working_hours'] },
      { model: Designation, as: 'designation', attributes: ['overtime_rate'] }
    ]
  });

  if (!employee) throw new Error("Employee not found");

  const skillWages = Number(employee.skill?.wages || 0);
  const branchWorkingHours = Number(employee.branch?.working_hours || 8);
  const overtimeRate = Number(employee.designation?.overtime_rate || 1);

  const baseHourlyRate = skillWages / branchWorkingHours;

  const allowances = await Allowance.findAll({
    where: { employee_id: employeeBusinessId }
  });

  let allowancesTotalPerDay = 0;

  allowances.forEach(a => {
    if (String(a.type).toLowerCase() === "percentage") {
      allowancesTotalPerDay += (parseFloat(a.amount) / 100) * skillWages;
    } else {
      allowancesTotalPerDay += parseFloat(a.amount);
    }
  });

  const allowanceHourlyRate =
    branchWorkingHours > 0
      ? allowancesTotalPerDay / branchWorkingHours
      : 0;

  const overtimeAmount =
    (baseHourlyRate + allowanceHourlyRate) *
    overtimeRate *
    overtimeHours;

  const convertedDays = parseFloat((overtimeHours / branchWorkingHours).toFixed(2));

  return {
    overtimeRate,
    overtimeAmount: Number(overtimeAmount.toFixed(2)),
    convertedDays
  };
}


// ================= FORMATTER =================

function formatOvertime(r) {
  if (!r) return null;
  const json = typeof r.toJSON === 'function' ? r.toJSON() : r;

  return {
    id: json.id,
    employee_id: json.employee_id,
    title: json.title,
    number_of_days: json.number_of_days,
    hours: json.hours,
    rate: json.rate,
    type: json.type,
    date: json.date,
    ot_amount: json.ot_amount,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at,
    employee: json.employee ? {
      employee_id: json.employee.employee_id,
      name: json.employee.name,
      email: json.employee.email,
      branch_id: json.employee.branch_id
    } : null
  };
}


// ================= CREATE =================

exports.create = async (req, res) => {
  try {

    const companyId = await getCompanyId(req);
    const branchId = await getUserBranchId(req.user.id);
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

    const payload = { ...req.body };

    if (!payload.employee_id)
      return res.status(400).json({ message: 'employee_id is required' });

    const emp = await Employee.findOne({
      where: { employee_id: payload.employee_id, created_by: { [Op.in]: allowedUserIds } }
    });

    if (!emp)
      return res.status(400).json({ message: 'Employee not in your branch/company' });

    if (!payload.hours)
      return res.status(400).json({ message: 'hours is required (HH:MM:SS)' });

    const [h, m, s] = payload.hours.split(":").map(Number);
    const overtimeHours = h + m / 60 + s / 3600;

    const calc = await calculateOvertimeAmount(payload.employee_id, overtimeHours);

    payload.rate = calc.overtimeRate;
    payload.ot_amount = calc.overtimeAmount;
    payload.number_of_days = calc.convertedDays;
    payload.created_by = req.user.id;

    const overtime = await Overtime.create(payload);

    const full = await Overtime.findOne({
      where: { id: overtime.id },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
    });

    return res.status(201).json({ success: true, data: formatOvertime(full) });

  } catch (err) {
    console.error('Create Overtime Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const branchId = await getUserBranchId(req.user.id);
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

    const where = { created_by: { [Op.in]: allowedUserIds } };

    const rows = await Overtime.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }],
      order: [['id', 'DESC']]
    });

    return res.json({ success: true, data: rows.map(formatOvertime) });
  } catch (err) {
    console.error('Get All Overtime Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// exports.getByEmployeeId = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(req.user.id);
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     let employeeBusinessId = req.params.id;
//     if (req.user.type === 'Employee') {
//       const self = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!self) return res.status(404).json({ message: 'Employee record not found' });
//       employeeBusinessId = self.employee_id;
//     }

//     const empCheck = await Employee.findOne({
//       where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedUserIds } }
//     });
//     if (!empCheck) return res.status(404).json({ message: 'Employee not in your branch/company' });

//     const rows = await Overtime.findAll({
//       where: { employee_id: employeeBusinessId, created_by: { [Op.in]: allowedUserIds } },
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }],
//       order: [['id', 'DESC']]
//     });

//     return res.json({ success: true, data: rows.map(formatOvertime) });
//   } catch (err) {
//     console.error('Get Overtime By Employee Error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
exports.getByEmployeeId = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let employeeBusinessId = req.params.id;
    
    // 🟢 Check if user has employee record (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    // 🟢 Employee user: can only view their own overtime
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
      employeeBusinessId = self.employee_id;
      
      // Employee can only access their own data
      const empCheck = await Employee.findOne({
        where: { employee_id: employeeBusinessId }
      });
      if (!empCheck) return res.status(404).json({ success: false, message: 'Employee not found' });
    } else {
      // 🟢 For non-employee users (branch users, branchless users, company)
      const empCheck = await Employee.findOne({
        where: { employee_id: employeeBusinessId, deleted_at: null }
      });
      
      if (!empCheck) return res.status(404).json({ success: false, message: 'Employee not found' });

      // 🟢 BRANCH USER: Check if employee is in same branch
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        console.log('🟡 Branch User Access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', empCheck.branch_id);
        if (String(empCheck.branch_id) !== String(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: cannot access overtime for employee in another branch' 
          });
        }
      }
      // 🟢 BRANCHLESS USER & COMPANY: No additional checks (full access)
    }

    // 🟢 UPDATED AREA — Different query logic based on user type
    let overtimeWhere = {
      employee_id: employeeBusinessId
    };

    let includeWhere = {};

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Filter by employee branch (not created_by)
      includeWhere = {
        model: Employee,
        as: 'employee',
        attributes: ['employee_id', 'name', 'email', 'branch_id'],
        where: { branch_id: userEmployeeRecord.branch_id, deleted_at: null }
      };
    } else {
      // 🟢 BRANCHLESS USER & COMPANY: No branch filter
      includeWhere = {
        model: Employee,
        as: 'employee', 
        attributes: ['employee_id', 'name', 'email', 'branch_id']
      };
    }

    const rows = await Overtime.findAll({
      where: overtimeWhere,
      include: [includeWhere],
      order: [['id', 'DESC']]
    });

    console.log(`🔍 Found ${rows.length} overtime records for employee: ${employeeBusinessId}`);

    return res.json({ success: true, data: rows.map(formatOvertime) });
  } catch (err) {
    console.error('Get Overtime By Employee Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ================= UPDATE =================

exports.update = async (req, res) => {
  try {

    const companyId = await getCompanyId(req);
    const branchId = await getUserBranchId(req.user.id);
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

    const overtime = await Overtime.findOne({
      where: { id: req.params.id, created_by: { [Op.in]: allowedUserIds } }
    });

    if (!overtime)
      return res.status(404).json({ message: 'Overtime not found in your access scope' });

    if (req.body.hours) {
      const [h, m, s] = req.body.hours.split(":").map(Number);
      const overtimeHours = h + m / 60 + s / 3600;

      const calc = await calculateOvertimeAmount(overtime.employee_id, overtimeHours);

      req.body.rate = calc.overtimeRate;
      req.body.ot_amount = calc.overtimeAmount;
      req.body.number_of_days = calc.convertedDays;
    }

    delete req.body.created_by;

    await overtime.update(req.body);

    const updated = await Overtime.findOne({
      where: { id: overtime.id },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
    });

    return res.json({ success: true, data: formatOvertime(updated) });

  } catch (err) {
    console.error('Update Overtime Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ================= DELETE =================

exports.remove = async (req, res) => {
  try {

    const companyId = await getCompanyId(req);
    const branchId = await getUserBranchId(req.user.id);
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

    const overtime = await Overtime.findOne({
      where: { id: req.params.id, created_by: { [Op.in]: allowedUserIds } }
    });

    if (!overtime)
      return res.status(404).json({ message: 'Overtime not found or no access' });

    await overtime.destroy();

    return res.json({
      success: true,
      message: 'Deleted successfully',
      data: { id: req.params.id }
    });

  } catch (err) {
    console.error('Delete Overtime Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
