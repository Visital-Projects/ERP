

const moment = require('moment');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/user.model'); 
const Department = require('../models/department.model');
const PayslipType = require('../models/payslipType.model');
const ExcelJS = require("exceljs");
const Allowance = require('../models/allowance.model');
const Commission = require('../models/commission.model');
const Loan = require('../models/loan.model');
const SaturationDeduction = require('../models/saturationDeduction.model');
const OtherPayment = require('../models/otherPayment.model');
const Overtime = require('../models/overtime.model');
const Employee = require('../models/employee.model');
const Branch = require("../models/branch.model");
const ExpenseNew = require('../models/expenseNew.model');
const Skill = require('../models/skill.model');
const Designation = require('../models/designation.model');
const Attendance = require('../models/attendance.model');
const Leave = require('../models/leave.model');
const Payslip = require('../models/payslip.model');
const Holiday = require("../models/holiday.model");
const path = require("path");
const fs = require("fs");

const PDFDocument = require('pdfkit');

async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    return Number(userRecord?.created_by) || null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

// 🟢 ADD ALL ROLE CHECKING FUNCTIONS
function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}

function isCompany(req) {
  return (req.user?.type || '').toLowerCase() === 'company';
}

function isCompanyUser(req) {
  const t = (req.user?.type || "").toLowerCase();
  return t === "company" || t === "admin";
}

function isEmployeeUser(req) {
  return (req.user?.type || "").toLowerCase() === "employee";
}

function computeValue(itemAmount, itemType, baseSalary) {
  const amt = parseFloat(itemAmount || 0);
  if (!itemType) return amt;
  if (String(itemType).toLowerCase() === 'percentage') {
    return (amt / 100) * parseFloat(baseSalary || 0);
  }
  return amt;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ['user_id'],
      raw: true,
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}

exports.setSalary = async (req, res) => {
  try {
    const employeeBusinessId = req.params.employeeId;
    const { salary_type, employee_type, basic_salary } = req.body; // 🟢 REMOVED: skill_id

    // 🟢 UPDATED VALIDATION: Only salary_type is required
    if (!salary_type || !basic_salary) {
  return res.status(400).json({
    success: false,
    message: 'salary_type and basic_salary are required.'
  });
}

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
    }

    let employee = null;

    // --------------------------
    // Case 1: "employee" user => can only manage their own salary
    // --------------------------
    if (isEmployeeUser(req)) {
      employee = await Employee.findOne({
        where: {
          employee_id: employeeBusinessId,
          user_id: req.user.id,
          deleted_at: null
        },
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['working_days']
          },
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'wages']
          }
        ]
      });

      if (!employee) {
        return res.status(403).json({ success: false, message: 'You are only allowed to manage your own salary' });
      }
    }

    // 🟢 UPDATED AREA: Role users (HR, Branch Manager, Accountant, etc.)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can only set salary for employees in their own branch
        console.log('🟡 Branch User Access - Set Salary');
        const branchId = userEmployeeRecord.branch_id;
        console.log('🔍 Branch ID for Branch User:', branchId);

        // fetch target employee with branch and skill info
        const targetEmp = await Employee.findOne({
          where: { employee_id: employeeBusinessId, deleted_at: null },
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['working_days']
            },
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name', 'wages']
            }
          ]
        });

        if (!targetEmp) {
          return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
        if (Number(targetEmp.branch_id) !== Number(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: you can only set salary for employees in your own branch'
          });
        }

        // ✅ Same branch → allow access
        employee = targetEmp;
        console.log('🔍 Branch User - Set salary access granted to employee in same branch');

      } else {
        // 🟢 BRANCHLESS USER: Can set salary for ANY employee in the company
        console.log('🟡 Branchless User Access - Set Salary (FULL ACCESS)');

        // 🟢 Get all users under company (for created_by check)
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
        employee = await Employee.findOne({
          where: {
            employee_id: employeeBusinessId,
            created_by: { [Op.in]: allowedUserIds },
            deleted_at: null
          },
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['working_days']
            },
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name', 'wages']
            }
          ]
        });

        if (!employee) {
          return res.status(404).json({ success: false, message: 'Employee not found in your company' });
        }
        console.log('🔍 Branchless User - Set salary access granted to company employee');
      }
    }
    // 🟢 END UPDATED AREA
    
    // 🟢 UPDATED: Validate that employee has skill already set
    if (!employee.skill_id || !employee.skill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee skill not set. Please set skill in employee details first.' 
      });
    }

    // 🟢 UPDATED: Calculate salary based on EXISTING skill wages and branch working days
    let calculatedSalary = 0;
    if (employee.branch && employee.branch.working_days && employee.skill && employee.skill.wages) {
      calculatedSalary = Number(employee.skill.wages) * Number(employee.branch.working_days);
      console.log(`💰 Salary Calculation: ${employee.skill.wages} (existing skill wages) × ${employee.branch.working_days} (working days) = ${calculatedSalary}`);
    } else {
      // Missing required data
      if (!employee.skill || !employee.skill.wages) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee skill wages not found. Please set skill in employee details.' 
        });
      }
      if (!employee.branch || !employee.branch.working_days) {
        return res.status(400).json({ 
          success: false, 
          message: 'Branch working days not found. Please check employee branch.' 
        });
      }
    }

    // 🟢 UPDATED: Set employee fields (NO skill_id - it's already set)
    employee.salary_type = salary_type;
    employee.salary = calculatedSalary; // 🟢 Store calculated salary
    employee.basic_salary = basic_salary;

    if (typeof employee_type !== 'undefined') {
      employee.employee_type = employee_type;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Salary information updated successfully',
      data: {
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        salary_type: employee.salary_type,
        salary: employee.salary,
        basic_salary: employee.basic_salary,
        employee_type: employee.employee_type,
        created_by: employee.created_by,
        skill: employee.skill,
        branch_working_days: employee.branch?.working_days,
        calculation_note: `Salary calculated from existing skill: ${employee.skill.wages} (skill wages) × ${employee.branch?.working_days || 1} (working days)`
      }
    });

  } catch (err) {
    console.error('Set Salary Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getSalaryByEmployee = async (req, res) => {
  try {
    console.log('🎯 START getSalaryByEmployee');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', req.params.employeeId);

    const employeeBusinessId = req.params.employeeId;

    if (!employeeBusinessId) {
      return res.status(400).json({ success: false, message: 'employeeId required' });
    }

    // --------------------------
    // Employee user -> self-only
    // --------------------------
    if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Getting own salary');
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
        attributes: ['employee_id', 'branch_id'],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'wages']
          }
        ]
      });

      if (!self) {
        return res.status(403).json({ success: false, message: 'Employee profile not found' });
      }

      if (String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({ success: false, message: 'You are only allowed to view your own salary' });
      }

      const employee = await Employee.findOne({
        where: {
          employee_id: self.employee_id,
          branch_id: self.branch_id,
          deleted_at: null
        },
        attributes: ['employee_id', 'name', 'email', 'account', 'salary_type', 'salary','basic_salary', 'employee_type', 'skill_id'],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'wages']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'working_days', 'working_hours']
          }
        ]
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found in your branch' });
      }

      console.log('🔍 Employee - Access granted to own salary');
      return res.status(200).json({
        success: true,
        message: 'Salary fetched successfully',
        data: employee
      });
    }

    // 🟢 UPDATED AREA: Role users (HR, Branch Manager, Accountant, etc.)
    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
    }

    // 🔹 Check if logged-in user has an Employee record (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let employee = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Can only get salary for employees in their own branch
      console.log('🟡 Branch User Access - Get Salary');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID for Branch User:', branchId);

      // fetch target employee with skill and branch info
      const targetEmp = await Employee.findOne({
        where: { employee_id: employeeBusinessId, deleted_at: null },
        attributes: ['employee_id', 'name', 'email', 'account', 'salary_type', 'salary','basic_salary', 'branch_id', 'employee_type', 'skill_id'],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'wages']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'working_days', 'working_hours']
          }
        ]
      });

      if (!targetEmp) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
      if (Number(targetEmp.branch_id) !== Number(branchId)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: you can only view salary for employees in your own branch'
        });
      }

      // ✅ Same branch → allow access
      employee = targetEmp;
      console.log('🔍 Branch User - Get salary access granted to employee in same branch');

    } else {
      // 🟢 BRANCHLESS USER: Can get salary for ANY employee in the company
      console.log('🟡 Branchless User Access - Get Salary (FULL ACCESS)');

      // 🟢 Get all users under company (for created_by check)
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      
      employee = await Employee.findOne({
        where: {
          employee_id: employeeBusinessId,
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null
        },
        attributes: ['employee_id', 'name', 'email', 'account', 'salary_type', 'salary','basic_salary', 'branch_id', 'employee_type', 'skill_id'],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'wages']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'working_days', 'working_hours']
          }
        ]
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found in your company' });
      }
      console.log('🔍 Branchless User - Get salary access granted to company employee');
    }
    // 🟢 END UPDATED AREA

    return res.status(200).json({
      success: true,
      message: 'Salary fetched successfully',
      data: employee
    });

  } catch (err) {
    console.error('❌ Get Salary Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// exports.calculateNetSalary = async (req, res) => {
//   try {
//     console.log('================= START calculateNetSalary =================');

//     const employeeBusinessId = req.params.employeeId;
//     if (!employeeBusinessId) {
//       console.warn('❌ employeeId missing');
//       return res.status(400).json({ success: false, message: 'employeeId required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       console.warn('❌ companyId not resolved');
//       return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
//     }

//     // 🟢 Month / Year
//     const { month, year } = req.query;
//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const startOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
//       .startOf('month')
//       .format('YYYY-MM-DD');

//     const endOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
//       .endOf('month')
//       .format('YYYY-MM-DD');

//     console.log(`📅 Salary Period: ${startOfMonth} → ${endOfMonth}`);

//     // 🟢 Employee
//     const employee = await Employee.findOne({
//       where: { employee_id: employeeBusinessId, deleted_at: null },
//       attributes: [
//         'id','employee_id','name','email','branch_id',
//         'salary','salary_type','created_by','skill_id','designation_id'
//       ],
//       include: [
//         { model: Skill, as: 'skill', attributes: ['id','name','wages'] },
//         { model: Branch, as: 'branch', attributes: ['id','name','working_days','working_hours'] },
//         { model: Designation, as: 'designation', attributes: ['id','name','overtime_rate'] }
//       ]
//     });

//     if (!employee) {
//       console.warn('❌ Employee not found');
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }

//     // 🟢 Attendance
//     const attendanceData = await Attendance.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         date: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       attributes: ['status','overtime','early_leaving'],
//       raw: true
//     });

//     const skillWages = Number(employee.skill.wages || 0);
//     const branchWorkingDays = Number(employee.branch.working_days || 26);
//     const branchWorkingHours = Number(employee.branch.working_hours || 8);
//     const designationOvertimeRate = Number(employee.designation.overtime_rate || 1);

//     let actualWorkingDays = 0;
//     let attendanceOvertimeHours = 0;
//     let earlyLeavingHours = 0;

//     attendanceData.forEach(r => {
//       if (r.status === 'Present') actualWorkingDays += 1;
//       if (r.status === 'Half Day') actualWorkingDays += 0.5;

//       if (r.overtime && r.overtime !== '00:00:00') {
//         const [h,m,s] = r.overtime.split(':').map(Number);
//         attendanceOvertimeHours += h + m / 60 + s / 3600;
//       }

//       if (r.early_leaving && r.early_leaving !== '00:00:00') {
//         const [h,m,s] = r.early_leaving.split(':').map(Number);
//         earlyLeavingHours += h + m / 60 + s / 3600;
//       }
//     });

//     // ✅ WORKING DAYS LOGIC (AS REQUESTED)
//     const normalWorkingDays = Math.min(actualWorkingDays, branchWorkingDays);
//     const excessWorkingDays = Math.max(actualWorkingDays - branchWorkingDays, 0);
//     const workingDaysForSalary = actualWorkingDays;

//     console.log(
//       `📊 Working Days Summary → Actual: ${actualWorkingDays}, ` +
//       `Normal: ${normalWorkingDays}, Excess: ${excessWorkingDays}`
//     );

//     console.log(`⏱️ Attendance OT Hours: ${attendanceOvertimeHours}`);
//     console.log(`🚪 Early Leaving Hours: ${earlyLeavingHours}`);

//     // 🟢 Base Salary
//     const baseSalary = skillWages * workingDaysForSalary;
//     const baseHourlyRate = skillWages / branchWorkingHours;

//     console.log(`💰 Base Salary = ${skillWages} × ${workingDaysForSalary} = ${baseSalary}`);

//     // 🟢 Allowances (PERMANENT)
//     const allowances = await Allowance.findAll({
//       where: { employee_id: employee.employee_id }
//     });

//     const allowancesList = allowances.map(a => {
//       const computed =
//         String(a.type).toLowerCase() === 'percentage'
//           ? (parseFloat(a.amount) / 100) * baseSalary
//           : parseFloat(a.amount) * workingDaysForSalary;

//       return { ...a.toJSON(), computed_amount: Number(computed.toFixed(2)) };
//     });

//     const allowancesTotal = allowancesList.reduce((s,a)=>s+a.computed_amount,0);

//     console.log(`➕ Allowances Total: ${allowancesTotal}`);

//     const allowanceHourlyRate =
//       workingDaysForSalary > 0
//         ? (allowancesTotal / workingDaysForSalary) / branchWorkingHours
//         : 0;

//     // 🟢 Overtime
//     let overtimeTotal = 0;
//     if (attendanceOvertimeHours > 0) {
//       overtimeTotal =
//         designationOvertimeRate *
//         (baseHourlyRate + allowanceHourlyRate) *
//         attendanceOvertimeHours;
//     }

//     console.log(`⏰ Overtime Total: ${overtimeTotal}`);

//     // 🟢 Early Leaving Deduction (PF base se subtract hota hai)
//     const earlyLeavingDeductionTotal =
//       earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);

//     console.log(`➖ Early Leaving Deduction: ${earlyLeavingDeductionTotal}`);

//     // 🟢 Monthly Commission & Other Payments (ESI only)
//     const commissions = await Commission.findAll({
//       where: {
//         employee_id: employee.id,
//         created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       raw: true
//     });

//     const otherPayments = await OtherPayment.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       raw: true
//     });
//     const advancePayments = await ExpenseNew.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         payment_date: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       raw: true
//     });
    
//     const advancePaymentsTotal = advancePayments.reduce(
//       (sum, exp) => sum + (parseFloat(exp.total_amount) || 0),
//       0
//     );
    
//     console.log(`➖ Advance Payment Deduction: ${advancePaymentsTotal}`);
    
//     const commissionsTotal = commissions.reduce(
//       (s,c)=>s + (parseFloat(c.amount)||0), 0
//     );

//     const otherPaymentsTotal = otherPayments.reduce(
//       (s,o)=>s + (parseFloat(o.amount)||0), 0
//     );

//     console.log(`➕ Commission Total (monthly): ${commissionsTotal}`);
//     console.log(`➕ Other Payments Total (monthly): ${otherPaymentsTotal}`);

//     // 🟢 Loans (MONTHLY – NET DEDUCTION ONLY)
//     const loans = await Loan.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       raw: true
//     });

//     const loansTotal = loans.reduce(
//       (s,l)=>s + (parseFloat(l.amount)||0), 0
//     );

//     console.log(`➖ Loan Deduction Total: ${loansTotal}`);

//     // 🟢 Saturation (PF / ESI)
//     const saturationDeductions = await SaturationDeduction.findAll({
//       where: { employee_id: employee.employee_id }
//     });

//     const pfApplicableAmount =
//       baseSalary + overtimeTotal + allowancesTotal - earlyLeavingDeductionTotal;

//     const esiApplicableAmount =
//       baseSalary + allowancesTotal + commissionsTotal + otherPaymentsTotal;

//     console.log(`🧾 PF Applicable Amount: ${pfApplicableAmount}`);
//     console.log(`🧾 ESI Applicable Amount: ${esiApplicableAmount}`);

//     let totalPFDeduction = 0;
//     let totalESIDeduction = 0;

//     saturationDeductions.forEach(sd => {
//       if (String(sd.title).toUpperCase() === 'PF') {
//         totalPFDeduction += (parseFloat(sd.amount) / 100) * pfApplicableAmount;
//       }
//       if (String(sd.title).toUpperCase() === 'ESI') {
//         totalESIDeduction += (parseFloat(sd.amount) / 100) * esiApplicableAmount;
//       }
//     });

//     console.log(`➖ PF Deduction: ${totalPFDeduction}`);
//     console.log(`➖ ESI Deduction: ${totalESIDeduction}`);

//     // 🟢 Gross & Net
//     const gross =
//       baseSalary + allowancesTotal + overtimeTotal;

//     const deductionsTotal =
//       totalPFDeduction +
//       totalESIDeduction +
//       earlyLeavingDeductionTotal +
//       loansTotal +
//       advancePaymentsTotal;

//     const netSalary = Number((gross - deductionsTotal).toFixed(2));

//     console.log(`💰 Gross Salary: ${gross}`);
//     console.log(`💸 Total Deductions: ${deductionsTotal}`);
//     console.log(`✅ Net Salary: ${netSalary}`);
//     console.log('================= END calculateNetSalary =================');

//     return res.status(200).json({
//       success: true,
//       data: {
//         period: {
//           month: targetMonth,
//           year: targetYear,
//           start_date: startOfMonth,
//           end_date: endOfMonth,
//           display: moment(startOfMonth).format('MMMM YYYY')
//         },
//         employee: {
//           employee_id: employee.employee_id,
//           name: employee.name,
//           branch_id: employee.branch_id,
//           salary_type: employee.salary_type
//         },
//         breakdown: {
//           working_days_summary: {
//             actual: actualWorkingDays,
//             normal: normalWorkingDays,
//             excess: excessWorkingDays
//           },
//           base_salary: baseSalary,
//           allowances_total: allowancesTotal,
//           overtime_total: Number(overtimeTotal.toFixed(2)),
//           commissions_total: commissionsTotal,
//           other_payments_total: otherPaymentsTotal,
//           loan_deduction_total: loansTotal,
//           early_leaving_deduction: Number(earlyLeavingDeductionTotal.toFixed(2)),
//           advance_payment_deduction: advancePaymentsTotal,
//           saturation_deduction_breakdown: {
//             pf_applicable_amount: Number(pfApplicableAmount.toFixed(2)),
//             esi_applicable_amount: Number(esiApplicableAmount.toFixed(2)),
//             pf_total: Number(totalPFDeduction.toFixed(2)),
//             esi_total: Number(totalESIDeduction.toFixed(2))
//           },
//           totals: {
//             gross,
//             deductions: Number(deductionsTotal.toFixed(2)),
//             net: netSalary
//           }
//         }
//       }
//     });

//   } catch (err) {
//     console.error('❌ Calculate Net Salary Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: err.message
//     });
//   }
// };

exports.calculateNetSalary = async (req, res) => {
  try {
    console.log('================= START calculateNetSalary =================');

    const employeeBusinessId = req.params.employeeId;
    if (!employeeBusinessId) {
      console.warn('❌ employeeId missing');
      return res.status(400).json({ success: false, message: 'employeeId required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      console.warn('❌ companyId not resolved');
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
    }

    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const startOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
      .startOf('month')
      .format('YYYY-MM-DD');

    const endOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
      .endOf('month')
      .format('YYYY-MM-DD');

    console.log(`📅 Salary Period: ${startOfMonth} → ${endOfMonth}`);

    const employee = await Employee.findOne({
      where: { employee_id: employeeBusinessId, deleted_at: null },
      attributes: [
        'id',
        'employee_id',
        'name',
        'email',
        'branch_id',
        'salary_type',
        'created_by',
        'skill_id',
        'designation_id'
      ],
      include: [
        { model: Skill, as: 'skill', attributes: ['id','name','wages'] },
        { model: Branch, as: 'branch', attributes: ['id','name','working_days','working_hours'] },
        { model: Designation, as: 'designation', attributes: ['id','name','overtime_rate'] }
      ]
    });

    if (!employee) {
      console.warn('❌ Employee not found');
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const attendanceData = await Attendance.findAll({
      where: {
        employee_id: employee.employee_id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: ['overtime'],
      raw: true
    });

    const skillWages = Number(employee.skill?.wages || 0);
    const branchWorkingHours = Number(employee.branch?.working_hours || 8);
    const overtimeRate = Number(employee.designation?.overtime_rate || 1);

    let totalOvertimeHours = 0;

    attendanceData.forEach(r => {
      if (r.overtime && r.overtime !== '00:00:00') {
        const [h, m, s] = r.overtime.split(':').map(Number);
        totalOvertimeHours += h + m / 60 + s / 3600;
      }
    });

    console.log(`⏱️ Total Overtime Hours: ${totalOvertimeHours}`);

    const allowances = await Allowance.findAll({
      where: { employee_id: employee.employee_id }
    });

    const allowancePerDay = allowances.reduce((sum, a) => {
      return sum + (parseFloat(a.amount) || 0);
    }, 0);

    console.log(`➕ Allowance Per Day: ${allowancePerDay}`);

    const otSalaryPerHourRate = skillWages / branchWorkingHours;

    const otAllowancePerHourRate = allowancePerDay / branchWorkingHours;

    console.log(`💰 OT Salary Per Hour Rate: ${otSalaryPerHourRate}`);
    console.log(`💰 OT Allowance Per Hour Rate: ${otAllowancePerHourRate}`);

    const finalOTSalary =
      (otSalaryPerHourRate + otAllowancePerHourRate) *
      totalOvertimeHours *
      overtimeRate;

    console.log(`💰 Final OT Salary: ${finalOTSalary}`);

    console.log('================= END calculateNetSalary =================');

    return res.status(200).json({
      success: true,
      data: {
        period: {
          month: targetMonth,
          year: targetYear,
          start_date: startOfMonth,
          end_date: endOfMonth,
          display: moment(startOfMonth).format('MMMM YYYY')
        },
        employee: {
          employee_id: employee.employee_id,
          name: employee.name,
          branch_id: employee.branch_id,
          salary_type: employee.salary_type
        },
        overtime_breakdown: {
          overtime_hours: Number(totalOvertimeHours.toFixed(2)),
          overtime_rate: overtimeRate,
          wage_per_day: skillWages,
          allowance_per_day: allowancePerDay,
          ot_salary_per_hour_rate: Number(otSalaryPerHourRate.toFixed(2)),
          ot_allowance_per_hour_rate: Number(otAllowancePerHourRate.toFixed(2)),
          final_overtime_salary: Number(finalOTSalary.toFixed(2))
        }
      }
    });

  } catch (err) {
    console.error('❌ Calculate Net Salary Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// exports.calculateGrossSalary = async (req, res) => {
//   try {
//     console.log('================= START calculateGrossSalary =================');

//     const employeeBusinessId = req.params.employeeId;
//     if (!employeeBusinessId) {
//       console.warn('❌ employeeId missing');
//       return res.status(400).json({ success: false, message: 'employeeId required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       console.warn('❌ companyId not resolved');
//       return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
//     }

//     const { month, year } = req.query;
//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const startOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
//       .startOf('month')
//       .format('YYYY-MM-DD');

//     const endOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
//       .endOf('month')
//       .format('YYYY-MM-DD');

//     console.log(`📅 Salary Period: ${startOfMonth} → ${endOfMonth}`);

//     const employee = await Employee.findOne({
//       where: { employee_id: employeeBusinessId, deleted_at: null },
//       attributes: [
//         'id',
//         'employee_id',
//         'name',
//         'email',
//         'branch_id',
//         'basic_salary',
//         'salary_type',
//         'created_by'
//       ],
//       include: [
//         {
//           model: Branch,
//           as: 'branch',
//           attributes: ['id', 'name', 'working_days']
//         }
//       ]
//     });

//     if (!employee) {
//       console.warn('❌ Employee not found');
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }

//     if (!employee.basic_salary) {
//       console.warn('❌ basic_salary not set for employee');
//       return res.status(400).json({
//         success: false,
//         message: 'Employee basic salary not set'
//       });
//     }

//     const attendanceData = await Attendance.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         date: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       attributes: ['status'],
//       raw: true
//     });

//     const branchWorkingDays = Number(employee.branch?.working_days || 26);
//     const basicSalary = Number(employee.basic_salary || 0);

//     let actualWorkingDays = 0;

//     attendanceData.forEach(r => {
//       if (r.status === 'Present') actualWorkingDays += 1;
//       if (r.status === 'Half Day') actualWorkingDays += 0.5;
//     });

//     console.log(`📊 Actual Attendance Days: ${actualWorkingDays}`);

//     const nationalHoliday = 1;

//     const paidDays = actualWorkingDays + nationalHoliday;

//     console.log(`🎉 National Holiday Count: ${nationalHoliday}`);
//     console.log(`📅 Paid Days = Attendance + Holiday = ${paidDays}`);

//     const perDayGrossSalary = basicSalary / branchWorkingDays;

//     console.log(`💰 Per Day Gross Salary = ${basicSalary} / ${branchWorkingDays} = ${perDayGrossSalary}`);

//     const grossSalary = perDayGrossSalary * paidDays;

//     console.log(`💰 Gross Salary = ${perDayGrossSalary} × ${paidDays} = ${grossSalary}`);

//     console.log('================= END calculateGrossSalary =================');

//     return res.status(200).json({
//       success: true,
//       data: {
//         period: {
//           month: targetMonth,
//           year: targetYear,
//           start_date: startOfMonth,
//           end_date: endOfMonth,
//           display: moment(startOfMonth).format('MMMM YYYY')
//         },
//         employee: {
//           employee_id: employee.employee_id,
//           name: employee.name,
//           branch_id: employee.branch_id,
//           salary_type: employee.salary_type,
//           basic_salary: basicSalary
//         },
//         breakdown: {
//           working_days_summary: {
//             attendance_days: actualWorkingDays,
//             national_holiday: nationalHoliday,
//             paid_days: paidDays
//           },
//           per_day_gross_salary: Number(perDayGrossSalary.toFixed(2)),
//           gross_salary: Number(grossSalary.toFixed(2))
//         }
//       }
//     });

//   } catch (err) {
//     console.error('❌ Calculate Gross Salary Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: err.message
//     });
//   }
// };

exports.calculateGrossSalary = async (req, res) => {
  try {
    console.log('================= START calculateGrossSalary =================');

    const employeeBusinessId = req.params.employeeId;
    if (!employeeBusinessId) {
      console.warn('❌ employeeId missing');
      return res.status(400).json({ success: false, message: 'employeeId required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      console.warn('❌ companyId not resolved');
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
    }

    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const startOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
      .startOf('month')
      .format('YYYY-MM-DD');

    const endOfMonth = moment(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`)
      .endOf('month')
      .format('YYYY-MM-DD');

    console.log(`📅 Salary Period: ${startOfMonth} → ${endOfMonth}`);

    const employee = await Employee.findOne({
      where: { employee_id: employeeBusinessId, deleted_at: null },
      attributes: [
        'id',
        'employee_id',
        'name',
        'email',
        'branch_id',
        'basic_salary',
        'salary_type',
        'created_by'
      ],
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'working_days']
        }
      ]
    });

    if (!employee) {
      console.warn('❌ Employee not found');
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!employee.basic_salary) {
      console.warn('❌ basic_salary not set for employee');
      return res.status(400).json({
        success: false,
        message: 'Employee basic salary not set'
      });
    }

    const attendanceData = await Attendance.findAll({
      where: {
        employee_id: employee.employee_id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: ['status', 'date'],
      raw: true
    });

    const branchWorkingDays = Number(employee.branch?.working_days || 26);
    const basicSalary = Number(employee.basic_salary || 0);

    let actualWorkingDays = 0;

    attendanceData.forEach(r => {
      if (r.status === 'Present') actualWorkingDays += 1;
      if (r.status === 'Half Day') actualWorkingDays += 0.5;
    });

    console.log(`📊 Actual Attendance Days: ${actualWorkingDays}`);

    /* ===============================
       FETCH HOLIDAYS FROM DB
    =============================== */

    const holidays = await Holiday.findAll({
      where: {
        deleted_at: null,
        [Op.or]: [
          { date: { [Op.between]: [startOfMonth, endOfMonth] } },
          { end_date: { [Op.between]: [startOfMonth, endOfMonth] } }
        ]
      },
      attributes: ['date', 'end_date'],
      raw: true
    });

    console.log(`🎉 Holidays Found:`, holidays);

    /* ===============================
       EXPAND HOLIDAY DATE RANGE
    =============================== */

    const holidayDates = [];

    holidays.forEach(h => {

      const start = moment(h.date);
      const end = moment(h.end_date);

      const diff = end.diff(start, 'days');

      for (let i = 0; i <= diff; i++) {
        holidayDates.push(start.clone().add(i, 'days').format('YYYY-MM-DD'));
      }

    });

    console.log(`📅 Holiday Dates Expanded:`, holidayDates);

    /* ===============================
       CHECK EMPLOYEE PRESENT ON HOLIDAY
    =============================== */

    const holidayAttendance = attendanceData.filter(a =>
      holidayDates.includes(a.date) && a.status === 'Present'
    );

    const holidayPresentDays = holidayAttendance.length;

    console.log(`🎉 Holiday Present Days: ${holidayPresentDays}`);

    /* ===============================
       FINAL PAYABLE DAYS
    =============================== */

    const paidDays = actualWorkingDays + holidayPresentDays;

    console.log(`📅 Paid Days = Attendance (${actualWorkingDays}) + Holiday Present (${holidayPresentDays}) = ${paidDays}`);

    const perDayGrossSalary = basicSalary / branchWorkingDays;

    console.log(`💰 Per Day Gross Salary = ${basicSalary} / ${branchWorkingDays} = ${perDayGrossSalary}`);

    const grossSalary = perDayGrossSalary * paidDays;

    console.log(`💰 Gross Salary = ${perDayGrossSalary} × ${paidDays} = ${grossSalary}`);

    console.log('================= END calculateGrossSalary =================');

    return res.status(200).json({
      success: true,
      data: {
        period: {
          month: targetMonth,
          year: targetYear,
          start_date: startOfMonth,
          end_date: endOfMonth,
          display: moment(startOfMonth).format('MMMM YYYY')
        },
        employee: {
          employee_id: employee.employee_id,
          name: employee.name,
          branch_id: employee.branch_id,
          salary_type: employee.salary_type,
          basic_salary: basicSalary
        },
        breakdown: {
          working_days_summary: {
            attendance_days: actualWorkingDays,
            holiday_present_days: holidayPresentDays,
            paid_days: paidDays
          },
          per_day_gross_salary: Number(perDayGrossSalary.toFixed(2)),
          gross_salary: Number(grossSalary.toFixed(2))
        }
      }
    });

  } catch (err) {
    console.error('❌ Calculate Gross Salary Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

exports.exportEmployeesExcel = async (req, res) => {
  try {
    console.log('🎯 START exportEmployeePayrollData');
    
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
    }

    // 🟢 Get target month and year from query params with validation
    let { month, year, salary_month } = req.query;

    // Determine target month/year - prioritize salary_month if provided
    let targetMonth, targetYear;
    if (salary_month) {
      const [parsedYear, parsedMonth] = salary_month.split('-').map(Number);
      targetYear = parsedYear;
      targetMonth = parsedMonth;
    } else {
      targetMonth = month ? parseInt(month) : moment().month() + 1;
      targetYear = year ? parseInt(year) : moment().year();
    }

    // Validate month and year
    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month parameter. Must be between 1 and 12' });
    }
    if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year parameter' });
    }

    const salaryMonth = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
    const monthYearDisplay = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).format('MMMM YYYY');
    
    const startOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
    const startOfYear = moment(`${targetYear}-01-01`).startOf('year').format('YYYY-MM-DD');
    const endOfYear = moment(`${targetYear}-12-31`).endOf('year').format('YYYY-MM-DD');

    console.log(`📅 Exporting payroll data for: ${salaryMonth} (${monthYearDisplay})`);

    // 🟢 Access control check
    let allowedEmployeeIds = [];
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      const branchId = userEmployeeRecord.branch_id;
      const branchEmployees = await Employee.findAll({
        where: { branch_id: branchId, deleted_at: null },
        attributes: ['employee_id'],
        raw: true,
      });
      allowedEmployeeIds = branchEmployees.map(emp => emp.employee_id);
    } else {
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      const companyEmployees = await Employee.findAll({
        where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
        attributes: ['employee_id'],
        raw: true,
      });
      allowedEmployeeIds = companyEmployees.map(emp => emp.employee_id);
    }

    if (allowedEmployeeIds.length === 0) {
      return res.status(404).json({ success: false, message: 'No employees found for export' });
    }

    // 🟢 Fetch employees with all required data
    const employees = await Employee.findAll({
      where: { employee_id: { [Op.in]: allowedEmployeeIds }, deleted_at: null },
      attributes: [
        'id', 'employee_id', 'name', 'email', 'phone', 'gatepassno', 'aadhaar_number',
        'uan_number', 'ip_number', 'salary','basic_salary', 'salary_type', 'account_number', 'bank_name',
        'bank_identifier_code', 'company_doj', 'created_by', 'branch_id', 'department_id',
        'designation_id', 'skill_id', 'account_holder_name', 'is_active'
      ],
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name', 'working_days', 'working_hours'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name', 'overtime_rate'] },
        { model: Skill, as: 'skill', attributes: ['id', 'name', 'wages'] }
      ],
      order: [['employee_id', 'ASC']]
    });

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No employees found with complete data' });
    }

    // 🟢 Fetch payslip data for the target month
    const employeeIds = employees.map(emp => emp.employee_id);
    const payslips = await Payslip.findAll({
      where: { employee_id: { [Op.in]: employeeIds }, salary_month: salaryMonth },
      raw: true
    });

    console.log(`📊 Found ${payslips.length} payslips for ${salaryMonth}`);

    // Create a map for quick payslip lookup
    const payslipMap = {};
    payslips.forEach(payslip => {
      payslipMap[payslip.employee_id] = payslip;
    });

    // 🟢 Get user IDs for access control in bulk data fetching
    let userIds = [];
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      const branchId = userEmployeeRecord.branch_id;
      userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    } else {
      userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    }

    // =======================================================
    // 🔹 BULK DATA FETCHING (SAME LOGIC AS calculateNetSalary)
    // =======================================================

    // 🟢 Fetch all attendance data for all employees (WITH EARLY LEAVING)
    const allAttendanceData = await Attendance.findAll({
      where: {
        employee_id: { [Op.in]: employeeIds },
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: ['id', 'employee_id', 'date', 'status', 'clock_in', 'clock_out', 'total_rest', 'overtime', 'early_leaving'],
      order: [['date', 'ASC']],
      raw: true
    });

    // Group attendance by employee_id
    const attendanceByEmployee = {};
    allAttendanceData.forEach(record => {
      if (!attendanceByEmployee[record.employee_id]) {
        attendanceByEmployee[record.employee_id] = [];
      }
      attendanceByEmployee[record.employee_id].push(record);
    });

    // 🟢 Fetch all components (SAME AS calculateNetSalary)
    const [allAllowances, allSaturationDeductions, allCommissions, allLoans, allOtherPayments, allOvertimes, allAdvances] = await Promise.all([
      // Allowances (PERMANENT - no month filter)
      Allowance.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds }
        },
        raw: true
      }),
      // Saturation Deductions (PERMANENT - no month filter)
      SaturationDeduction.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds }
        },
        raw: true
      }),
      // Commissions (WITH month filter)
      Commission.findAll({
        where: {
          employee_id: { [Op.in]: employees.map(e => e.id) },
          created_by: { [Op.in]: userIds },
          created_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      }),
      // Loans (WITH month filter)
      Loan.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds },
          created_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      }),
      // Other Payments (WITH month filter)
      OtherPayment.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds },
          created_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      }),
      // Overtimes (WITH month filter)
      Overtime.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds },
          created_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      }),
      // Advances
      ExpenseNew.findAll({
        where: {
          employee_id: { [Op.in]: employeeIds },
          created_by: { [Op.in]: userIds },
          payments_status: 'paid',
          payment_date: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      })
    ]);

    // 🟢 Fetch leaves for progressive annual leave calculation
    const allLeaves = await Leave.findAll({
      where: {
        employee_id: { [Op.in]: employees.map(e => e.id) },
        status: 'Approved',
        [Op.or]: [
          { start_date: { [Op.between]: [startOfYear, endOfMonth] } },
          { end_date: { [Op.between]: [startOfYear, endOfMonth] } },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: startOfYear } },
              { end_date: { [Op.gte]: endOfMonth } }
            ]
          }
        ]
      },
      attributes: ['id', 'employee_id', 'start_date', 'end_date', 'total_leave_days'],
      raw: true
    });

    // Group components by employee
    const allowancesByEmployee = {};
    allAllowances.forEach(allowance => {
      if (!allowancesByEmployee[allowance.employee_id]) allowancesByEmployee[allowance.employee_id] = [];
      allowancesByEmployee[allowance.employee_id].push(allowance);
    });

    const saturationByEmployee = {};
    allSaturationDeductions.forEach(sd => {
      if (!saturationByEmployee[sd.employee_id]) saturationByEmployee[sd.employee_id] = [];
      saturationByEmployee[sd.employee_id].push(sd);
    });

    const commissionsByEmployee = {};
    allCommissions.forEach(c => {
      const empId = employees.find(e => e.id === c.employee_id)?.employee_id;
      if (empId) {
        if (!commissionsByEmployee[empId]) commissionsByEmployee[empId] = [];
        commissionsByEmployee[empId].push(c);
      }
    });

    const loansByEmployee = {};
    allLoans.forEach(l => {
      if (!loansByEmployee[l.employee_id]) loansByEmployee[l.employee_id] = [];
      loansByEmployee[l.employee_id].push(l);
    });

    const otherPaymentsByEmployee = {};
    allOtherPayments.forEach(op => {
      if (!otherPaymentsByEmployee[op.employee_id]) otherPaymentsByEmployee[op.employee_id] = [];
      otherPaymentsByEmployee[op.employee_id].push(op);
    });

    const overtimesByEmployee = {};
    allOvertimes.forEach(ot => {
      if (!overtimesByEmployee[ot.employee_id]) overtimesByEmployee[ot.employee_id] = [];
      overtimesByEmployee[ot.employee_id].push(ot);
    });

    const advancesByEmployee = {};
    allAdvances.forEach(adv => {
      if (!advancesByEmployee[adv.employee_id]) advancesByEmployee[adv.employee_id] = [];
      advancesByEmployee[adv.employee_id].push(adv);
    });

    const leavesByEmployee = {};
    allLeaves.forEach(leave => {
      const emp = employees.find(e => e.id === leave.employee_id);
      if (emp) {
        if (!leavesByEmployee[emp.employee_id]) leavesByEmployee[emp.employee_id] = [];
        leavesByEmployee[emp.employee_id].push(leave);
      }
    });

    // Helper function (SAME AS calculateNetSalary)
    const computeValue = (amount, type, base) => {
      const rawAmount = parseFloat(amount || 0);
      if (String(type || '').toLowerCase() === 'percentage') {
        return (rawAmount / 100) * base;
      }
      return rawAmount;
    };

    // =======================================================
    // 🔹 CREATE EXCEL WORKBOOK (SAME FORMAT AS BEFORE)
    // =======================================================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Payroll Data');

    // 🟢 Set column headers (SAME AS BEFORE - NO CHANGES)
    worksheet.columns = [
      { header: 'Sl No', key: 'sl_no', width: 8 },
      { header: 'Gatepass No', key: 'gatepass_no', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Aadhaar Number', key: 'aadhaar_number', width: 20 },
      { header: 'UAN Number', key: 'uan_number', width: 20 },
      { header: 'IP Number', key: 'ip_number', width: 15 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Skill', key: 'skill', width: 20 },
      { header: 'Wage Rate', key: 'wage_rate', width: 12 },
      { header: 'Basic Salary', key: 'basic_salary', width: 15 },
      { header: 'Gross Salary', key: 'gross_salary', width: 15 },
      { header: 'Allowance', key: 'allowance', width: 12 },
      { header: 'Commission', key: 'commission', width: 12 },
      { header: 'Overtime', key: 'overtime', width: 12 },
      { header: 'Other Payment', key: 'other_payment', width: 15 },
      { header: 'Loan', key: 'loan', width: 12 },
      { header: 'Saturation Deduction', key: 'saturation_deduction', width: 20 },
      { header: 'PF Deduction', key: 'pf_deduction', width: 15 },
      { header: 'ESI Deduction', key: 'esi_deduction', width: 15 },
      { header: 'Account Number', key: 'account_number', width: 25 },
      { header: 'Bank Name', key: 'bank_name', width: 25 },
      { header: 'IFSC Code', key: 'ifsc_code', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date of Joining', key: 'doj', width: 15 }
    ];

    // 🟢 Add title rows (SAME AS BEFORE)
    const exportDate = moment().format('DD/MM/YYYY, hh:mm:ss A');
    worksheet.insertRow(1, [`Exported on: ${exportDate}`]);
    worksheet.mergeCells('A1:AB1');
    worksheet.insertRow(2, [`Payroll Period: ${monthYearDisplay}`]);
    worksheet.mergeCells('A2:AB2');
    worksheet.insertRow(3, [`Total Employees: ${employees.length} | Total Payslips Found: ${payslips.length}`]);
    worksheet.mergeCells('A3:AB3');

    // Style title rows
    const titleRows = [1, 2, 3];
    titleRows.forEach(rowNum => {
      const titleRow = worksheet.getRow(rowNum);
      titleRow.font = { bold: true, size: rowNum === 1 ? 12 : 11 };
      titleRow.alignment = { horizontal: 'center' };
      if (rowNum === 1) {
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
      } else if (rowNum === 2) {
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
      } else {
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
      }
    });

    // 🟢 PROCESS EACH EMPLOYEE WITH calculateNetSalary LOGIC
    let slNo = 1;
    const rows = [];
    let hasPayslipData = false;

    for (const employee of employees) {
      const payslip = payslipMap[employee.employee_id] || {};
      const hasPayslip = !!payslip.employee_id;
      if (hasPayslip) hasPayslipData = true;

      // 🟢 Get employee data (SAME AS calculateNetSalary)
      const skillWages = Number(employee.skill?.wages || 0);
      const branchWorkingDays = Number(employee.branch?.working_days || 26);
      const branchWorkingHours = Number(employee.branch?.working_hours || 8);
      const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

      // 🟢 STEP 1: Calculate Actual Working Days from Attendance
      const attendanceData = attendanceByEmployee[employee.employee_id] || [];
      let actualWorkingDays = 0;
      let attendanceOvertimeHours = 0;
      let earlyLeavingHours = 0;

      if (attendanceData.length > 0) {
        attendanceData.forEach(record => {
          if (record.status === 'Present') {
            actualWorkingDays += 1;
          } else if (record.status === 'Half Day') {
            actualWorkingDays += 0.5;
          }
          
          // Overtime calculation
          if (record.overtime && record.overtime !== '00:00:00') {
            const [h, m, s] = String(record.overtime).split(':').map(Number);
            attendanceOvertimeHours += h + m / 60 + s / 3600;
          }
          
          // Early leaving calculation
          if (record.early_leaving && record.early_leaving !== '00:00:00') {
            const [h, m, s] = String(record.early_leaving).split(':').map(Number);
            earlyLeavingHours += h + m / 60 + s / 3600;
          }
        });
      }

      // Calculate working days for salary
      const workingDaysForSalary = actualWorkingDays;
      
      // 🟢 STEP 2: Calculate Base Salary = Skill Wages × Actual Working Days
      const baseSalary = skillWages * workingDaysForSalary;
      
      // Calculate hourly rate
      const baseHourlyRate = skillWages / branchWorkingHours;

      // 🟢 STEP 3: Calculate Allowances based on ACTUAL working days
      const employeeAllowances = allowancesByEmployee[employee.employee_id] || [];
      let allowancesTotal = 0;

      employeeAllowances.forEach(allowance => {
        const rawAmount = parseFloat(allowance.amount || 0);
        const type = String(allowance.type || '').toLowerCase();
        let computedAmount = 0;

        if (type === 'percentage') {
          computedAmount = (rawAmount / 100) * baseSalary;
        } else {
          computedAmount = rawAmount * workingDaysForSalary;
        }
        allowancesTotal += computedAmount;
      });

      // Calculate daily and hourly allowance rates for overtime
      const dailyAllowanceRate = workingDaysForSalary > 0 ? allowancesTotal / workingDaysForSalary : 0;
      const allowanceHourlyRate = dailyAllowanceRate / branchWorkingHours;

      // 🟢 STEP 4: Calculate Overtime (BASE + ALLOWANCES)
      const employeeOvertimes = overtimesByEmployee[employee.employee_id] || [];
      let overtimeTotal = 0;
      let baseOvertimeTotal = 0;
      let allowanceOvertimeTotal = 0;

      // Overtime from Overtime table
      employeeOvertimes.forEach(ot => {
        const otHours = parseFloat(ot.hours || ot.ot_hours || 0);
        if (otHours > 0) {
          const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * otHours;
          const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * otHours;
          baseOvertimeTotal += baseOvertimeAmount;
          allowanceOvertimeTotal += allowanceOvertimeAmount;
          overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
        }
      });

      // Overtime from Attendance records
      if (attendanceOvertimeHours > 0 && employeeOvertimes.length === 0) {
        const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * attendanceOvertimeHours;
        const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * attendanceOvertimeHours;
        baseOvertimeTotal += baseOvertimeAmount;
        allowanceOvertimeTotal += allowanceOvertimeAmount;
        overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
      }

      // 🟢 STEP 5: Early leaving deduction
      const earlyLeavingDeductionTotal = earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);

      // 🟢 STEP 6: Calculate Other Components
      const employeeCommissions = commissionsByEmployee[employee.employee_id] || [];
      const commissionsTotal = employeeCommissions.reduce((sum, c) => {
        return sum + computeValue(c.amount, c.type, baseSalary);
      }, 0);

      const employeeOtherPayments = otherPaymentsByEmployee[employee.employee_id] || [];
      const otherPaymentsTotal = employeeOtherPayments.reduce((sum, op) => {
        return sum + computeValue(op.amount, op.type, baseSalary);
      }, 0);

      const employeeLoans = loansByEmployee[employee.employee_id] || [];
      const loansTotal = employeeLoans.reduce((sum, l) => {
        return sum + computeValue(l.amount, l.type, baseSalary);
      }, 0);

      const employeeAdvances = advancesByEmployee[employee.employee_id] || [];
      const advancesTotal = employeeAdvances.reduce((sum, adv) => {
        return sum + Number(adv.total_amount || 0);
      }, 0);

      // 🟢 STEP 7: Progressive Annual Leave Calculation
      let leaveDeductionThisMonth = 0;
      const employeeLeaves = leavesByEmployee[employee.employee_id] || [];
      
      if (employeeLeaves.length > 0) {
        const cumulativeLeavesUpToCurrent = employeeLeaves.reduce((sum, leave) => {
          const days = parseFloat(leave.total_leave_days || 0);
          return sum + (isNaN(days) ? 0 : days);
        }, 0);
        
        let deductibleLeavesThisMonth = 0;
        if (cumulativeLeavesUpToCurrent > 18) {
          deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
        }
        
        const dailySalary = workingDaysForSalary > 0 ? baseSalary / workingDaysForSalary : 0;
        leaveDeductionThisMonth = deductibleLeavesThisMonth * dailySalary;
      }

      // 🟢 STEP 8: Calculate Saturation Deductions (PF/ESI) - SAME FORMULA AS calculateNetSalary
      const employeeSaturations = saturationByEmployee[employee.employee_id] || [];
      let totalPFDeduction = 0;
      let totalESIDeduction = 0;
      let otherDeductions = 0;

      // ✅ CORRECT PF & ESI BASES (from calculateNetSalary)
      const pfApplicableAmount = baseSalary + overtimeTotal + allowancesTotal - earlyLeavingDeductionTotal;
      const esiApplicableAmount = baseSalary + allowancesTotal;

      employeeSaturations.forEach(sd => {
        const deductionType = String(sd.title || '').toUpperCase();
        const rawAmount = parseFloat(sd.amount || 0);
        const type = String(sd.type || '').toLowerCase();
        
        if (deductionType === 'PF' || deductionType === 'ESI') {
          let applicableAmount = deductionType === 'PF' ? pfApplicableAmount : esiApplicableAmount;
          let computedAmount = 0;
          
          if (type === 'percentage') {
            computedAmount = (rawAmount / 100) * applicableAmount;
          } else {
            computedAmount = rawAmount;
          }
          
          if (deductionType === 'PF') {
            totalPFDeduction += computedAmount;
          } else if (deductionType === 'ESI') {
            totalESIDeduction += computedAmount;
          }
        } else {
          // Other saturation deductions
          let computedAmount = 0;
          if (type === 'percentage') {
            computedAmount = (rawAmount / 100) * baseSalary;
          } else {
            computedAmount = rawAmount;
          }
          otherDeductions += computedAmount;
        }
      });

      const saturationTotal = totalPFDeduction + totalESIDeduction + otherDeductions;

      // 🟢 STEP 9: Calculate Gross Salary
      const grossSalary = baseSalary + allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;

      // 🟢 STEP 10: Calculate Net Salary
      const totalDeductions = loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth + earlyLeavingDeductionTotal;
      const netSalary = Number((grossSalary - totalDeductions).toFixed(2));

      // 🟢 Add row data (SAME FORMAT AS BEFORE)
      rows.push({
        sl_no: slNo++,
        gatepass_no: employee.gatepassno || 'N/A',
        name: employee.name,
        email: employee.email,
        phone: employee.phone || 'N/A',
        aadhaar_number: employee.aadhaar_number || 'N/A',
        uan_number: employee.uan_number || 'N/A',
        ip_number: employee.ip_number || 'N/A',
        branch: employee.branch ? employee.branch.name : 'N/A',
        department: employee.department ? employee.department.name : 'N/A',
        designation: employee.designation ? employee.designation.name : 'N/A',
        skill: employee.skill ? employee.skill.name : 'N/A',
        wage_rate: (skillWages+12).toFixed(2),
        basic_salary: baseSalary.toFixed(2),
        gross_salary: grossSalary.toFixed(2),
        allowance: allowancesTotal.toFixed(2),
        commission: commissionsTotal.toFixed(2),
        overtime: overtimeTotal.toFixed(2),
        other_payment: otherPaymentsTotal.toFixed(2),
        loan: loansTotal.toFixed(2),
        saturation_deduction: saturationTotal.toFixed(2),
        pf_deduction: totalPFDeduction.toFixed(2),
        esi_deduction: totalESIDeduction.toFixed(2),
        account_number: employee.account_number || 'N/A',
        bank_name: employee.bank_name || 'N/A',
        ifsc_code: employee.bank_identifier_code || 'N/A',
        status: employee.is_active ? 'Active' : 'Inactive',
        doj: employee.company_doj ? moment(employee.company_doj).format('DD/MM/YYYY') : 'N/A'
      });
    }

    // 🟢 Add data rows starting from row 4
    worksheet.addRows(rows);

    // 🟢 Apply styling to header row (row 4)
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    headerRow.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    // 🟢 Apply styling to data rows
    const dataStartRow = 5;
    const dataEndRow = worksheet.rowCount;

    for (let i = dataStartRow; i <= dataEndRow; i++) {
      const row = worksheet.getRow(i);
      row.alignment = { vertical: 'middle' };
      row.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };

      const employeeId = row.getCell('B').value;
      const hasPayslipForRow = payslipMap[employeeId];

      if (hasPayslipForRow) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
      } else {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
      }

      // Number columns
      const numberColumns = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
      numberColumns.forEach(col => {
        const cell = row.getCell(col);
        if (cell.value && !isNaN(cell.value)) {
          cell.numFmt = '#,##0.00';
        }
      });
    }

    // 🟢 Auto-filter for headers
    worksheet.autoFilter = { from: 'A4', to: `AB${dataEndRow}` };

    // 🟢 Freeze header rows
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

    // 🟢 Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    const totalBasicSalary = rows.reduce((sum, row) => sum + parseFloat(row.basic_salary), 0);
    const totalGrossSalary = rows.reduce((sum, row) => sum + parseFloat(row.gross_salary), 0);
    const totalAllowance = rows.reduce((sum, row) => sum + parseFloat(row.allowance), 0);
    const totalDeductions = rows.reduce((sum, row) => 
      sum + parseFloat(row.saturation_deduction) + parseFloat(row.loan), 0);

    const summaryData = [
      { metric: 'Export Date', value: exportDate },
      { metric: 'Payroll Period', value: monthYearDisplay },
      { metric: 'Total Employees', value: employees.length },
      { metric: 'Employees with Payslips', value: payslips.length },
      { metric: 'Employees without Payslips', value: employees.length - payslips.length },
      { metric: 'Total Basic Salary', value: `₹${totalBasicSalary.toFixed(2)}` },
      { metric: 'Total Gross Salary', value: `₹${totalGrossSalary.toFixed(2)}` },
      { metric: 'Total Allowances', value: `₹${totalAllowance.toFixed(2)}` },
      { metric: 'Total Deductions', value: `₹${totalDeductions.toFixed(2)}` },
      { metric: 'Month', value: targetMonth },
      { metric: 'Year', value: targetYear },
      { metric: 'Salary Month (YYYY-MM)', value: salaryMonth }
    ];

    summarySheet.addRows(summaryData);

    // Style summary sheet
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    
    for (let i = 1; i <= summarySheet.rowCount; i++) {
      const row = summarySheet.getRow(i);
      row.alignment = { vertical: 'middle' };
      row.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }

    // 🟢 Set response headers
    const fileName = `Employee_Payroll_${salaryMonth}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // 🟢 Write to response
    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Excel export completed: ${rows.length} employees exported for ${monthYearDisplay}`);
    console.log(`📊 Payslip data available for: ${payslips.length} employees`);

  } catch (err) {
    console.error('❌ Export Employee Payroll Data Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during export',
      error: err.message
    });
  }
};



// exports.exportEmployeesExcel = async (req, res) => {
//   try {
//     console.log('🎯 START exportEmployeePayrollData');
    
//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });
//     }

//     // 🟢 Get target month, year and format from query params
//     let { month, year, salary_month, format = 'excel' } = req.query;

//     // Validate format parameter
//     const validFormats = ['excel', 'pdf'];
//     if (!validFormats.includes(format.toLowerCase())) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Invalid format parameter. Must be either "excel" or "pdf"' 
//       });
//     }

//     // Determine target month/year - prioritize salary_month if provided
//     let targetMonth, targetYear;
//     if (salary_month) {
//       const [parsedYear, parsedMonth] = salary_month.split('-').map(Number);
//       targetYear = parsedYear;
//       targetMonth = parsedMonth;
//     } else {
//       targetMonth = month ? parseInt(month) : moment().month() + 1;
//       targetYear = year ? parseInt(year) : moment().year();
//     }

//     // Validate month and year
//     if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
//       return res.status(400).json({ success: false, message: 'Invalid month parameter. Must be between 1 and 12' });
//     }
//     if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
//       return res.status(400).json({ success: false, message: 'Invalid year parameter' });
//     }

//     const salaryMonth = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
//     const monthYearDisplay = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).format('MMMM YYYY');
    
//     const startOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
//     const endOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
//     const startOfYear = moment(`${targetYear}-01-01`).startOf('year').format('YYYY-MM-DD');
//     const endOfYear = moment(`${targetYear}-12-31`).endOf('year').format('YYYY-MM-DD');

//     console.log(`📅 Exporting payroll data for: ${salaryMonth} (${monthYearDisplay}) in ${format.toUpperCase()} format`);

//     // 🟢 Access control check
//     let allowedEmployeeIds = [];
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       const branchId = userEmployeeRecord.branch_id;
//       const branchEmployees = await Employee.findAll({
//         where: { branch_id: branchId, deleted_at: null },
//         attributes: ['employee_id'],
//         raw: true,
//       });
//       allowedEmployeeIds = branchEmployees.map(emp => emp.employee_id);
//     } else {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       const companyEmployees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
//         attributes: ['employee_id'],
//         raw: true,
//       });
//       allowedEmployeeIds = companyEmployees.map(emp => emp.employee_id);
//     }

//     if (allowedEmployeeIds.length === 0) {
//       return res.status(404).json({ success: false, message: 'No employees found for export' });
//     }

//     // 🟢 Fetch employees with all required data
//     const employees = await Employee.findAll({
//       where: { employee_id: { [Op.in]: allowedEmployeeIds }, deleted_at: null },
//       attributes: [
//         'id', 'employee_id', 'name', 'email', 'phone', 'gatepassno', 'aadhaar_number',
//         'uan_number', 'ip_number', 'salary', 'salary_type', 'account_number', 'bank_name',
//         'bank_identifier_code', 'company_doj', 'created_by', 'branch_id', 'department_id',
//         'designation_id', 'skill_id', 'account_holder_name', 'is_active'
//       ],
//       include: [
//         { model: Branch, as: 'branch', attributes: ['id', 'name', 'working_days', 'working_hours'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name', 'overtime_rate'] },
//         { model: Skill, as: 'skill', attributes: ['id', 'name', 'wages'] }
//       ],
//       order: [['employee_id', 'ASC']]
//     });

//     if (employees.length === 0) {
//       return res.status(404).json({ success: false, message: 'No employees found with complete data' });
//     }

//     // 🟢 Fetch payslip data for the target month
//     const employeeIds = employees.map(emp => emp.employee_id);
//     const payslips = await Payslip.findAll({
//       where: { employee_id: { [Op.in]: employeeIds }, salary_month: salaryMonth },
//       raw: true
//     });

//     console.log(`📊 Found ${payslips.length} payslips for ${salaryMonth}`);

//     // Create a map for quick payslip lookup
//     const payslipMap = {};
//     payslips.forEach(payslip => {
//       payslipMap[payslip.employee_id] = payslip;
//     });

//     // 🟢 Get user IDs for access control in bulk data fetching
//     let userIds = [];
//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       const branchId = userEmployeeRecord.branch_id;
//       userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     } else {
//       userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     }

//     // =======================================================
//     // 🔹 BULK DATA FETCHING (SAME LOGIC AS calculateNetSalary)
//     // =======================================================

//     // 🟢 Fetch all attendance data for all employees (WITH EARLY LEAVING)
//     const allAttendanceData = await Attendance.findAll({
//       where: {
//         employee_id: { [Op.in]: employeeIds },
//         date: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       attributes: ['id', 'employee_id', 'date', 'status', 'clock_in', 'clock_out', 'total_rest', 'overtime', 'early_leaving'],
//       order: [['date', 'ASC']],
//       raw: true
//     });

//     // Group attendance by employee_id
//     const attendanceByEmployee = {};
//     allAttendanceData.forEach(record => {
//       if (!attendanceByEmployee[record.employee_id]) {
//         attendanceByEmployee[record.employee_id] = [];
//       }
//       attendanceByEmployee[record.employee_id].push(record);
//     });

//     // 🟢 Fetch all components (SAME AS calculateNetSalary)
//     const [allAllowances, allSaturationDeductions, allCommissions, allLoans, allOtherPayments, allOvertimes, allAdvances] = await Promise.all([
//       // Allowances (PERMANENT - no month filter)
//       Allowance.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds }
//         },
//         raw: true
//       }),
//       // Saturation Deductions (PERMANENT - no month filter)
//       SaturationDeduction.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds }
//         },
//         raw: true
//       }),
//       // Commissions (WITH month filter)
//       Commission.findAll({
//         where: {
//           employee_id: { [Op.in]: employees.map(e => e.id) },
//           created_by: { [Op.in]: userIds },
//           created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//         },
//         raw: true
//       }),
//       // Loans (WITH month filter)
//       Loan.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds },
//           created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//         },
//         raw: true
//       }),
//       // Other Payments (WITH month filter)
//       OtherPayment.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds },
//           created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//         },
//         raw: true
//       }),
//       // Overtimes (WITH month filter)
//       Overtime.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds },
//           created_at: { [Op.between]: [startOfMonth, endOfMonth] }
//         },
//         raw: true
//       }),
//       // Advances
//       ExpenseNew.findAll({
//         where: {
//           employee_id: { [Op.in]: employeeIds },
//           created_by: { [Op.in]: userIds },
//           payments_status: 'paid',
//           payment_date: { [Op.between]: [startOfMonth, endOfMonth] }
//         },
//         raw: true
//       })
//     ]);

//     // 🟢 Fetch leaves for progressive annual leave calculation
//     const allLeaves = await Leave.findAll({
//       where: {
//         employee_id: { [Op.in]: employees.map(e => e.id) },
//         status: 'Approved',
//         [Op.or]: [
//           { start_date: { [Op.between]: [startOfYear, endOfMonth] } },
//           { end_date: { [Op.between]: [startOfYear, endOfMonth] } },
//           {
//             [Op.and]: [
//               { start_date: { [Op.lte]: startOfYear } },
//               { end_date: { [Op.gte]: endOfMonth } }
//             ]
//           }
//         ]
//       },
//       attributes: ['id', 'employee_id', 'start_date', 'end_date', 'total_leave_days'],
//       raw: true
//     });

//     // Group components by employee
//     const allowancesByEmployee = {};
//     allAllowances.forEach(allowance => {
//       if (!allowancesByEmployee[allowance.employee_id]) allowancesByEmployee[allowance.employee_id] = [];
//       allowancesByEmployee[allowance.employee_id].push(allowance);
//     });

//     const saturationByEmployee = {};
//     allSaturationDeductions.forEach(sd => {
//       if (!saturationByEmployee[sd.employee_id]) saturationByEmployee[sd.employee_id] = [];
//       saturationByEmployee[sd.employee_id].push(sd);
//     });

//     const commissionsByEmployee = {};
//     allCommissions.forEach(c => {
//       const empId = employees.find(e => e.id === c.employee_id)?.employee_id;
//       if (empId) {
//         if (!commissionsByEmployee[empId]) commissionsByEmployee[empId] = [];
//         commissionsByEmployee[empId].push(c);
//       }
//     });

//     const loansByEmployee = {};
//     allLoans.forEach(l => {
//       if (!loansByEmployee[l.employee_id]) loansByEmployee[l.employee_id] = [];
//       loansByEmployee[l.employee_id].push(l);
//     });

//     const otherPaymentsByEmployee = {};
//     allOtherPayments.forEach(op => {
//       if (!otherPaymentsByEmployee[op.employee_id]) otherPaymentsByEmployee[op.employee_id] = [];
//       otherPaymentsByEmployee[op.employee_id].push(op);
//     });

//     const overtimesByEmployee = {};
//     allOvertimes.forEach(ot => {
//       if (!overtimesByEmployee[ot.employee_id]) overtimesByEmployee[ot.employee_id] = [];
//       overtimesByEmployee[ot.employee_id].push(ot);
//     });

//     const advancesByEmployee = {};
//     allAdvances.forEach(adv => {
//       if (!advancesByEmployee[adv.employee_id]) advancesByEmployee[adv.employee_id] = [];
//       advancesByEmployee[adv.employee_id].push(adv);
//     });

//     const leavesByEmployee = {};
//     allLeaves.forEach(leave => {
//       const emp = employees.find(e => e.id === leave.employee_id);
//       if (emp) {
//         if (!leavesByEmployee[emp.employee_id]) leavesByEmployee[emp.employee_id] = [];
//         leavesByEmployee[emp.employee_id].push(leave);
//       }
//     });

//     // Helper function (SAME AS calculateNetSalary)
//     const computeValue = (amount, type, base) => {
//       const rawAmount = parseFloat(amount || 0);
//       if (String(type || '').toLowerCase() === 'percentage') {
//         return (rawAmount / 100) * base;
//       }
//       return rawAmount;
//     };

//     // =======================================================
//     // 🔹 PROCESS EACH EMPLOYEE WITH calculateNetSalary LOGIC
//     // =======================================================
//     let slNo = 1;
//     const employeeData = [];

//     for (const employee of employees) {
//       const payslip = payslipMap[employee.employee_id] || {};
//       const hasPayslip = !!payslip.employee_id;

//       // 🟢 Get employee data (SAME AS calculateNetSalary)
//       const skillWages = Number(employee.skill?.wages || 0);
//       const branchWorkingDays = Number(employee.branch?.working_days || 26);
//       const branchWorkingHours = Number(employee.branch?.working_hours || 8);
//       const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

//       // 🟢 STEP 1: Calculate Actual Working Days from Attendance
//       const attendanceData = attendanceByEmployee[employee.employee_id] || [];
//       let actualWorkingDays = 0;
//       let attendanceOvertimeHours = 0;
//       let earlyLeavingHours = 0;

//       if (attendanceData.length > 0) {
//         attendanceData.forEach(record => {
//           if (record.status === 'Present') {
//             actualWorkingDays += 1;
//           } else if (record.status === 'Half Day') {
//             actualWorkingDays += 0.5;
//           }
          
//           // Overtime calculation
//           if (record.overtime && record.overtime !== '00:00:00') {
//             const [h, m, s] = String(record.overtime).split(':').map(Number);
//             attendanceOvertimeHours += h + m / 60 + s / 3600;
//           }
          
//           // Early leaving calculation
//           if (record.early_leaving && record.early_leaving !== '00:00:00') {
//             const [h, m, s] = String(record.early_leaving).split(':').map(Number);
//             earlyLeavingHours += h + m / 60 + s / 3600;
//           }
//         });
//       }

//       // Calculate working days for salary
//       const workingDaysForSalary = actualWorkingDays;
      
//       // 🟢 STEP 2: Calculate Base Salary = Skill Wages × Actual Working Days
//       const baseSalary = skillWages * workingDaysForSalary;
      
//       // Calculate hourly rate
//       const baseHourlyRate = skillWages / branchWorkingHours;

//       // 🟢 STEP 3: Calculate Allowances based on ACTUAL working days
//       const employeeAllowances = allowancesByEmployee[employee.employee_id] || [];
//       let allowancesTotal = 0;

//       employeeAllowances.forEach(allowance => {
//         const rawAmount = parseFloat(allowance.amount || 0);
//         const type = String(allowance.type || '').toLowerCase();
//         let computedAmount = 0;

//         if (type === 'percentage') {
//           computedAmount = (rawAmount / 100) * baseSalary;
//         } else {
//           computedAmount = rawAmount * workingDaysForSalary;
//         }
//         allowancesTotal += computedAmount;
//       });

//       // Calculate daily and hourly allowance rates for overtime
//       const dailyAllowanceRate = workingDaysForSalary > 0 ? allowancesTotal / workingDaysForSalary : 0;
//       const allowanceHourlyRate = dailyAllowanceRate / branchWorkingHours;

//       // 🟢 STEP 4: Calculate Overtime (BASE + ALLOWANCES)
//       const employeeOvertimes = overtimesByEmployee[employee.employee_id] || [];
//       let overtimeTotal = 0;
//       let baseOvertimeTotal = 0;
//       let allowanceOvertimeTotal = 0;

//       // Overtime from Overtime table
//       employeeOvertimes.forEach(ot => {
//         const otHours = parseFloat(ot.hours || ot.ot_hours || 0);
//         if (otHours > 0) {
//           const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * otHours;
//           const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * otHours;
//           baseOvertimeTotal += baseOvertimeAmount;
//           allowanceOvertimeTotal += allowanceOvertimeAmount;
//           overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
//         }
//       });

//       // Overtime from Attendance records
//       if (attendanceOvertimeHours > 0 && employeeOvertimes.length === 0) {
//         const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * attendanceOvertimeHours;
//         const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * attendanceOvertimeHours;
//         baseOvertimeTotal += baseOvertimeAmount;
//         allowanceOvertimeTotal += allowanceOvertimeAmount;
//         overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
//       }

//       // 🟢 STEP 5: Early leaving deduction
//       const earlyLeavingDeductionTotal = earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);

//       // 🟢 STEP 6: Calculate Other Components
//       const employeeCommissions = commissionsByEmployee[employee.employee_id] || [];
//       const commissionsTotal = employeeCommissions.reduce((sum, c) => {
//         return sum + computeValue(c.amount, c.type, baseSalary);
//       }, 0);

//       const employeeOtherPayments = otherPaymentsByEmployee[employee.employee_id] || [];
//       const otherPaymentsTotal = employeeOtherPayments.reduce((sum, op) => {
//         return sum + computeValue(op.amount, op.type, baseSalary);
//       }, 0);

//       const employeeLoans = loansByEmployee[employee.employee_id] || [];
//       const loansTotal = employeeLoans.reduce((sum, l) => {
//         return sum + computeValue(l.amount, l.type, baseSalary);
//       }, 0);

//       const employeeAdvances = advancesByEmployee[employee.employee_id] || [];
//       const advancesTotal = employeeAdvances.reduce((sum, adv) => {
//         return sum + Number(adv.total_amount || 0);
//       }, 0);

//       // 🟢 STEP 7: Progressive Annual Leave Calculation
//       let leaveDeductionThisMonth = 0;
//       const employeeLeaves = leavesByEmployee[employee.employee_id] || [];
      
//       if (employeeLeaves.length > 0) {
//         const cumulativeLeavesUpToCurrent = employeeLeaves.reduce((sum, leave) => {
//           const days = parseFloat(leave.total_leave_days || 0);
//           return sum + (isNaN(days) ? 0 : days);
//         }, 0);
        
//         let deductibleLeavesThisMonth = 0;
//         if (cumulativeLeavesUpToCurrent > 18) {
//           deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
//         }
        
//         const dailySalary = workingDaysForSalary > 0 ? baseSalary / workingDaysForSalary : 0;
//         leaveDeductionThisMonth = deductibleLeavesThisMonth * dailySalary;
//       }

//       // 🟢 STEP 8: Calculate Saturation Deductions (PF/ESI) - SAME FORMULA AS calculateNetSalary
//       const employeeSaturations = saturationByEmployee[employee.employee_id] || [];
//       let totalPFDeduction = 0;
//       let totalESIDeduction = 0;
//       let otherDeductions = 0;

//       // ✅ CORRECT PF & ESI BASES (from calculateNetSalary)
//       const pfApplicableAmount = baseSalary + overtimeTotal + allowancesTotal - earlyLeavingDeductionTotal;
//       const esiApplicableAmount = baseSalary + allowancesTotal;

//       employeeSaturations.forEach(sd => {
//         const deductionType = String(sd.title || '').toUpperCase();
//         const rawAmount = parseFloat(sd.amount || 0);
//         const type = String(sd.type || '').toLowerCase();
        
//         if (deductionType === 'PF' || deductionType === 'ESI') {
//           let applicableAmount = deductionType === 'PF' ? pfApplicableAmount : esiApplicableAmount;
//           let computedAmount = 0;
          
//           if (type === 'percentage') {
//             computedAmount = (rawAmount / 100) * applicableAmount;
//           } else {
//             computedAmount = rawAmount;
//           }
          
//           if (deductionType === 'PF') {
//             totalPFDeduction += computedAmount;
//           } else if (deductionType === 'ESI') {
//             totalESIDeduction += computedAmount;
//           }
//         } else {
//           // Other saturation deductions
//           let computedAmount = 0;
//           if (type === 'percentage') {
//             computedAmount = (rawAmount / 100) * baseSalary;
//           } else {
//             computedAmount = rawAmount;
//           }
//           otherDeductions += computedAmount;
//         }
//       });

//       const saturationTotal = totalPFDeduction + totalESIDeduction + otherDeductions;

//       // 🟢 STEP 9: Calculate Gross Salary
//       const grossSalary = baseSalary + allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;

//       // 🟢 STEP 10: Calculate Net Salary
//       const totalDeductions = loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth + earlyLeavingDeductionTotal;
//       const netSalary = Number((grossSalary - totalDeductions).toFixed(2));

//       // 🟢 Store employee data for export
//       employeeData.push({
//         sl_no: slNo++,
//         gatepass_no: employee.gatepassno || 'N/A',
//         name: employee.name,
//         email: employee.email,
//         phone: employee.phone || 'N/A',
//         aadhaar_number: employee.aadhaar_number || 'N/A',
//         uan_number: employee.uan_number || 'N/A',
//         ip_number: employee.ip_number || 'N/A',
//         branch: employee.branch ? employee.branch.name : 'N/A',
//         department: employee.department ? employee.department.name : 'N/A',
//         designation: employee.designation ? employee.designation.name : 'N/A',
//         skill: employee.skill ? employee.skill.name : 'N/A',
//         wage_rate: skillWages,
//         basic_salary: baseSalary,
//         gross_salary: grossSalary,
//         allowance: allowancesTotal,
//         commission: commissionsTotal,
//         overtime: overtimeTotal,
//         other_payment: otherPaymentsTotal,
//         loan: loansTotal,
//         saturation_deduction: saturationTotal,
//         pf_deduction: totalPFDeduction,
//         esi_deduction: totalESIDeduction,
//         account_number: employee.account_number || 'N/A',
//         bank_name: employee.bank_name || 'N/A',
//         ifsc_code: employee.bank_identifier_code || 'N/A',
//         status: employee.is_active ? 'Active' : 'Inactive',
//         doj: employee.company_doj ? moment(employee.company_doj).format('DD/MM/YYYY') : 'N/A',
//         has_payslip: hasPayslip
//       });
//     }

//     // =======================================================
//     // 🔹 EXPORT LOGIC BASED ON FORMAT
//     // =======================================================
//     if (format.toLowerCase() === 'excel') {
//       return await exportExcelFormat(res, employeeData, payslipMap, salaryMonth, monthYearDisplay, employees, payslips);
//     } else if (format.toLowerCase() === 'pdf') {
//       return await exportPDFFormat(res, employeeData, payslipMap, salaryMonth, monthYearDisplay, employees, payslips);
//     }
//   } catch (err) {
//     console.error('❌ Export Employee Payroll Data Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during export',
//       error: err.message
//     });
//   }
// };

// // =======================================================
// // 🔹 EXCEL EXPORT FUNCTION (SAME AS BEFORE)
// // =======================================================
// const exportExcelFormat = async (res, employeeData, payslipMap, salaryMonth, monthYearDisplay, employees, payslips) => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Employee Payroll Data');

//     // 🟢 Set column headers
//     worksheet.columns = [
//       { header: 'Sl No', key: 'sl_no', width: 8 },
//       { header: 'Gatepass No', key: 'gatepass_no', width: 15 },
//       { header: 'Name', key: 'name', width: 25 },
//       { header: 'Email', key: 'email', width: 30 },
//       { header: 'Phone', key: 'phone', width: 15 },
//       { header: 'Aadhaar Number', key: 'aadhaar_number', width: 20 },
//       { header: 'UAN Number', key: 'uan_number', width: 20 },
//       { header: 'IP Number', key: 'ip_number', width: 15 },
//       { header: 'Branch', key: 'branch', width: 20 },
//       { header: 'Department', key: 'department', width: 20 },
//       { header: 'Designation', key: 'designation', width: 20 },
//       { header: 'Skill', key: 'skill', width: 20 },
//       { header: 'Wage Rate', key: 'wage_rate', width: 12 },
//       { header: 'Basic Salary', key: 'basic_salary', width: 15 },
//       { header: 'Gross Salary', key: 'gross_salary', width: 15 },
//       { header: 'Allowance', key: 'allowance', width: 12 },
//       { header: 'Commission', key: 'commission', width: 12 },
//       { header: 'Overtime', key: 'overtime', width: 12 },
//       { header: 'Other Payment', key: 'other_payment', width: 15 },
//       { header: 'Loan', key: 'loan', width: 12 },
//       { header: 'Saturation Deduction', key: 'saturation_deduction', width: 20 },
//       { header: 'PF Deduction', key: 'pf_deduction', width: 15 },
//       { header: 'ESI Deduction', key: 'esi_deduction', width: 15 },
//       { header: 'Account Number', key: 'account_number', width: 25 },
//       { header: 'Bank Name', key: 'bank_name', width: 25 },
//       { header: 'IFSC Code', key: 'ifsc_code', width: 15 },
//       { header: 'Status', key: 'status', width: 12 },
//       { header: 'Date of Joining', key: 'doj', width: 15 }
//     ];

//     // 🟢 Add title rows
//     const exportDate = moment().format('DD/MM/YYYY, hh:mm:ss A');
//     worksheet.insertRow(1, [`Exported on: ${exportDate}`]);
//     worksheet.mergeCells('A1:AB1');
//     worksheet.insertRow(2, [`Payroll Period: ${monthYearDisplay}`]);
//     worksheet.mergeCells('A2:AB2');
//     worksheet.insertRow(3, [`Total Employees: ${employees.length} | Total Payslips Found: ${payslips.length}`]);
//     worksheet.mergeCells('A3:AB3');

//     // Style title rows
//     const titleRows = [1, 2, 3];
//     titleRows.forEach(rowNum => {
//       const titleRow = worksheet.getRow(rowNum);
//       titleRow.font = { bold: true, size: rowNum === 1 ? 12 : 11 };
//       titleRow.alignment = { horizontal: 'center' };
//       if (rowNum === 1) {
//         titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
//       } else if (rowNum === 2) {
//         titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
//       } else {
//         titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
//       }
//     });

//     // 🟢 Add data rows
//     employeeData.forEach(emp => {
//       worksheet.addRow({
//         sl_no: emp.sl_no,
//         gatepass_no: emp.gatepass_no,
//         name: emp.name,
//         email: emp.email,
//         phone: emp.phone,
//         aadhaar_number: emp.aadhaar_number,
//         uan_number: emp.uan_number,
//         ip_number: emp.ip_number,
//         branch: emp.branch,
//         department: emp.department,
//         designation: emp.designation,
//         skill: emp.skill,
//         wage_rate: emp.wage_rate.toFixed(2),
//         basic_salary: emp.basic_salary.toFixed(2),
//         gross_salary: emp.gross_salary.toFixed(2),
//         allowance: emp.allowance.toFixed(2),
//         commission: emp.commission.toFixed(2),
//         overtime: emp.overtime.toFixed(2),
//         other_payment: emp.other_payment.toFixed(2),
//         loan: emp.loan.toFixed(2),
//         saturation_deduction: emp.saturation_deduction.toFixed(2),
//         pf_deduction: emp.pf_deduction.toFixed(2),
//         esi_deduction: emp.esi_deduction.toFixed(2),
//         account_number: emp.account_number,
//         bank_name: emp.bank_name,
//         ifsc_code: emp.ifsc_code,
//         status: emp.status,
//         doj: emp.doj
//       });
//     });

//     // 🟢 Apply styling to header row (row 4)
//     const headerRow = worksheet.getRow(4);
//     headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
//     headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
//     headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
//     headerRow.height = 25;
//     headerRow.border = {
//       top: { style: 'thin' }, left: { style: 'thin' },
//       bottom: { style: 'thin' }, right: { style: 'thin' }
//     };

//     // 🟢 Apply styling to data rows
//     const dataStartRow = 5;
//     const dataEndRow = worksheet.rowCount;

//     for (let i = dataStartRow; i <= dataEndRow; i++) {
//       const row = worksheet.getRow(i);
//       row.alignment = { vertical: 'middle' };
//       row.border = {
//         top: { style: 'thin' }, left: { style: 'thin' },
//         bottom: { style: 'thin' }, right: { style: 'thin' }
//       };

//       const employeeId = row.getCell('B').value;
//       const hasPayslipForRow = payslipMap[employeeId];

//       if (hasPayslipForRow) {
//         row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
//       } else {
//         row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
//       }

//       // Number columns
//       const numberColumns = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
//       numberColumns.forEach(col => {
//         const cell = row.getCell(col);
//         if (cell.value && !isNaN(cell.value)) {
//           cell.numFmt = '#,##0.00';
//         }
//       });
//     }

//     // 🟢 Auto-filter for headers
//     worksheet.autoFilter = { from: 'A4', to: `AB${dataEndRow}` };

//     // 🟢 Freeze header rows
//     worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

//     // 🟢 Add summary sheet
//     const summarySheet = workbook.addWorksheet('Summary');
//     summarySheet.columns = [
//       { header: 'Metric', key: 'metric', width: 30 },
//       { header: 'Value', key: 'value', width: 30 }
//     ];

//     const totalBasicSalary = employeeData.reduce((sum, emp) => sum + emp.basic_salary, 0);
//     const totalGrossSalary = employeeData.reduce((sum, emp) => sum + emp.gross_salary, 0);
//     const totalAllowance = employeeData.reduce((sum, emp) => sum + emp.allowance, 0);
//     const totalDeductions = employeeData.reduce((sum, emp) => sum + emp.saturation_deduction + emp.loan, 0);

//     const summaryData = [
//       { metric: 'Export Date', value: exportDate },
//       { metric: 'Payroll Period', value: monthYearDisplay },
//       { metric: 'Total Employees', value: employees.length },
//       { metric: 'Employees with Payslips', value: payslips.length },
//       { metric: 'Employees without Payslips', value: employees.length - payslips.length },
//       { metric: 'Total Basic Salary', value: `₹${totalBasicSalary.toFixed(2)}` },
//       { metric: 'Total Gross Salary', value: `₹${totalGrossSalary.toFixed(2)}` },
//       { metric: 'Total Allowances', value: `₹${totalAllowance.toFixed(2)}` },
//       { metric: 'Total Deductions', value: `₹${totalDeductions.toFixed(2)}` },
//       { metric: 'Month', value: parseInt(salaryMonth.split('-')[1]) },
//       { metric: 'Year', value: parseInt(salaryMonth.split('-')[0]) },
//       { metric: 'Salary Month (YYYY-MM)', value: salaryMonth }
//     ];

//     summarySheet.addRows(summaryData);

//     // Style summary sheet
//     summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
//     summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    
//     for (let i = 1; i <= summarySheet.rowCount; i++) {
//       const row = summarySheet.getRow(i);
//       row.alignment = { vertical: 'middle' };
//       row.border = {
//         top: { style: 'thin' }, left: { style: 'thin' },
//         bottom: { style: 'thin' }, right: { style: 'thin' }
//       };
//     }

//     // 🟢 Set response headers
//     const fileName = `Employee_Payroll_${salaryMonth}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//     // 🟢 Write to response
//     await workbook.xlsx.write(res);
//     res.end();

//     console.log(`✅ Excel export completed: ${employeeData.length} employees exported for ${monthYearDisplay}`);
//     return;
//   } catch (error) {
//     console.error('❌ Excel export error:', error);
//     throw error;
//   }
// };


