const moment = require("moment");
const { Op } = require("sequelize");
const { sequelize } = require('../config/database');
const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const Attendance = require("../models/attendance.model");
const Allowance = require("../models/allowance.model");
const Branch = require("../models/branch.model");
const Skill = require("../models/skill.model");
const Designation = require("../models/designation.model");
const OTPayment = require("../models/otPayment.model");

const Department = require("../models/department.model");

/* =========================================================
   SIMPLIFIED HELPER FUNCTIONS
========================================================= */

async function getCompanyId(req) {
  try {
    if (!req.user) {
      console.error('❌ getCompanyId: No user in request');
      return null;
    }

    console.log('🔍 getCompanyId - User ID:', req.user.id, 'Type:', req.user.type);
    
    // Case 1: User is company/admin/super admin - return their own ID
    const type = (req.user.type || '').toLowerCase().trim();
    
    // Check if user type indicates they are a company user
    if (type === 'company' || type === 'admin' || type === 'super admin' || type.includes('company')) {
      console.log('✅ Company/Admin/Super Admin detected, returning user.id:', req.user.id);
      return req.user.id;
    }

    // Case 2: Check employee table for created_by
    console.log('🔍 Checking employee table for user_id:', req.user.id);
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });

    if (emp?.created_by) {
      console.log('✅ Found in employee table, created_by:', emp.created_by);
      return Number(emp.created_by);
    }
    
    // Case 3: Check users table for created_by
    console.log('🔍 Checking users table for user_id:', req.user.id);
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    if (userRecord?.created_by) {
      console.log('✅ Found in users table, created_by:', userRecord.created_by);
      return Number(userRecord.created_by);
    }
    
    // Case 4: Last resort - return user's own ID as company ID
    console.log('⚠️ No company found, using user.id as fallback:', req.user.id);
    return req.user.id;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    // Return user.id as fallback even on error
    return req?.user?.id || null;
  }
}

// 🟢 ROLE CHECKING FUNCTIONS
function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}

function isCompany(req) {
  const type = (req.user?.type || '').toLowerCase().trim();
  return type === 'company' || type.includes('company');
}

function isCompanyUser(req) {
  const type = (req.user?.type || "").toLowerCase().trim();
  return type === "company" || type === "admin" || type.includes('company');
}

function isEmployeeUser(req) {
  return (req.user?.type || "").toLowerCase().trim() === "employee";
}

async function getUserBranchId(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
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

function computeValue(amount, type, baseSalary) {
  const val = parseFloat(amount) || 0;
  const normalizedType = (type || "").toLowerCase();
  return normalizedType === "percentage" ? (baseSalary * val) / 100 : val;
}


exports.generateOTPayment = async (req, res) => {
  try {
    console.log('🚀 ========== START generateOTPayment ==========');
    console.log('🔍 User Info - ID:', req.user?.id, 'Type:', req.user?.type);
    console.log('🔍 Requested Employee ID:', req.params.employeeId);
    console.log('📦 Request query:', req.query);

    const employeeBusinessId = req.params.employeeId;
    const { month, year } = req.query;

    // Validate employeeId
    if (!employeeBusinessId) {
      console.warn('❌ employeeId missing');
      return res.status(400).json({
        success: false,
        message: "employeeId required"
      });
    }

    // Get company ID
    const companyId = await getCompanyId(req);
    console.log('🏢 Resolved companyId:', companyId);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Unable to resolve company for current user'
      });
    }

    // Parse and validate month/year
    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    // Validate month and year
    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Must be between 1 and 12"
      });
    }

    if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    // Check if month is in future
    const currentDate = moment();
    const requestedDate = moment(`${targetYear}-${targetMonth}-01`);
    
    if (requestedDate.isAfter(currentDate, 'month')) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate OT payment for future months"
      });
    }

    const startOfMonth = moment(
      `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
    )
      .startOf("month")
      .format("YYYY-MM-DD");

    const endOfMonth = moment(
      `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
    )
      .endOf("month")
      .format("YYYY-MM-DD");

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    console.log('📅 Salary Period:', { startOfMonth, endOfMonth, salaryMonth });

    /* =========================================================
       EMPLOYEE ACCESS CONTROL (EXACT PATTERN AS GETSALARYBYEMPLOYEE)
    ========================================================= */

    let employee = null;

    // Case 1: Employee user - can only generate OT for themselves
    if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Generating own OT payment');
      
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
        attributes: ['employee_id', 'branch_id']
      });

      if (!self) {
        return res.status(403).json({ 
          success: false, 
          message: 'Employee profile not found' 
        });
      }

      if (String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are only allowed to generate OT payment for yourself' 
        });
      }

      employee = await Employee.findOne({
        where: {
          employee_id: self.employee_id,
          branch_id: self.branch_id,
          deleted_at: null
        },
        include: [
          {
            model: Skill,
            as: "skill",
            attributes: ["id", "name", "wages"]
          },
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "name", "working_hours"]
          },
          {
            model: Designation,
            as: "designation",
            attributes: ["id", "name", "overtime_rate"]
          }
        ]
      });

      if (!employee) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found in your branch' 
        });
      }

      console.log('🔍 Employee - Access granted to generate own OT payment');
    }
    // Case 2: Role users (HR, Branch Manager, Accountant, etc.)
    else {
      // Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can only generate OT for employees in their own branch
        console.log('🟡 Branch User Access - Generate OT Payment');
        const branchId = userEmployeeRecord.branch_id;

        // Fetch target employee with all required data
        const targetEmp = await Employee.findOne({
          where: { employee_id: employeeBusinessId, deleted_at: null },
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name", "wages"]
            },
            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name", "working_hours"]
            },
            {
              model: Designation,
              as: "designation",
              attributes: ["id", "name", "overtime_rate"]
            }
          ]
        });

        if (!targetEmp) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }

        // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
        if (Number(targetEmp.branch_id) !== Number(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: you can only generate OT payment for employees in your own branch'
          });
        }

        // ✅ Same branch → allow access
        employee = targetEmp;
        console.log('🔍 Branch User - OT payment access granted to employee in same branch');

      } else {
        // 🟢 BRANCHLESS USER: Can generate OT for ANY employee in the company
        console.log('🟡 Branchless User Access - Generate OT Payment (FULL ACCESS)');

        // Get all users under company (for created_by check)
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
        employee = await Employee.findOne({
          where: {
            employee_id: employeeBusinessId,
            created_by: { [Op.in]: allowedUserIds },
            deleted_at: null
          },
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name", "wages"]
            },
            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name", "working_hours"]
            },
            {
              model: Designation,
              as: "designation",
              attributes: ["id", "name", "overtime_rate"]
            }
          ]
        });

        if (!employee) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found in your company'
          });
        }
        console.log('🔍 Branchless User - OT payment access granted to company employee');
      }
    }

    /* =========================================================
       VALIDATE EMPLOYEE DATA
    ========================================================= */

    // Validate that employee has skill set
    if (!employee.skill_id || !employee.skill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee skill not set. Please set skill in employee details first.' 
      });
    }

    // Validate that employee has branch
    if (!employee.branch_id || !employee.branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee branch not found. Please check employee branch.' 
      });
    }

    // Validate that employee has designation (for overtime rate)
    if (!employee.designation_id || !employee.designation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee designation not set. Please set designation in employee details first.' 
      });
    }

    /* =========================================================
       FETCH ATTENDANCE DATA
    ========================================================= */

    console.log('🔍 Fetching attendance data for month:', salaryMonth);

    const attendanceData = await Attendance.findAll({
      where: {
        employee_id: employee.employee_id,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      attributes: ["id", "date", "overtime", "status"],
      raw: true,
    });

    console.log(`📊 Found ${attendanceData.length} attendance records`);

    /* =========================================================
       CALCULATE TOTAL OVERTIME HOURS
    ========================================================= */

    let totalOvertimeHours = 0;
    let overtimeRecords = [];

    attendanceData.forEach((r) => {
      if (r.overtime && r.overtime !== "00:00:00") {
        const [h, m, s] = r.overtime.split(":").map(Number);
        const hours = h + m / 60 + s / 3600;
        totalOvertimeHours += hours;
        
        overtimeRecords.push({
          date: r.date,
          overtime: r.overtime,
          hours: hours.toFixed(2)
        });
      }
    });

    console.log('⏰ Total Overtime Hours:', totalOvertimeHours.toFixed(2));

    if (totalOvertimeHours === 0) {
      return res.status(400).json({
        success: false,
        message: "No overtime hours found for this month"
      });
    }

    /* =========================================================
       FETCH ALLOWANCES
    ========================================================= */

    console.log('🔍 Fetching allowances for employee:', employee.employee_id);

    const allowances = await Allowance.findAll({
      where: {
        employee_id: employee.employee_id,
      },
      attributes: ["id", "title", "amount", "type"],
      raw: true,
    });

    console.log(`📊 Found ${allowances.length} allowances`);

    /* =========================================================
       CALCULATE OT PAYMENT
    ========================================================= */

    const skillWages = Number(employee.skill.wages || 0);
    const workingHours = Number(employee.branch.working_hours || 8);
    const overtimeRate = Number(employee.designation.overtime_rate || 1);

    console.log('💰 Calculation Parameters:', {
      skillWages,
      workingHours,
      overtimeRate
    });

    // Calculate allowance per day (handle percentage allowances)
    const allowancePerDay = allowances.reduce((sum, a) => {
      const amount = parseFloat(a.amount || 0);
      if (String(a.type || '').toLowerCase() === 'percentage') {
        return sum + (amount / 100 * skillWages);
      }
      return sum + amount;
    }, 0);

    console.log('💰 Allowance Per Day:', allowancePerDay);

    // Calculate per hour rates
    const basicPerHour = skillWages / workingHours;
    const allowancePerHour = allowancePerDay / workingHours;

    console.log('💰 Hourly Rates:', {
      basicPerHour: basicPerHour.toFixed(2),
      allowancePerHour: allowancePerHour.toFixed(2)
    });

    // Calculate final OT payment
    const finalOTPayment =
      (basicPerHour + allowancePerHour) *
      totalOvertimeHours *
      overtimeRate;

    console.log('💰 Final OT Payment:', finalOTPayment.toFixed(2));

    /* =========================================================
       CHECK FOR DUPLICATE OT PAYMENT
    ========================================================= */

    console.log('🔍 Checking for existing OT payment for month:', salaryMonth);

    const existingOT = await OTPayment.findOne({
      where: {
        employee_id: employee.employee_id,
        salary_month: salaryMonth,
        is_deleted: false,
      },
    });

    if (existingOT) {
      console.log('⚠️ Existing OT payment found');
      return res.status(400).json({
        success: false,
        message: "OT payment already generated for this month",
        data: existingOT
      });
    }

    /* =========================================================
       SAVE OT PAYMENT
    ========================================================= */

    console.log('💾 Saving OT payment to database...');

    const otPaymentData = {
      employee_id: employee.employee_id,
      salary_month: salaryMonth,
      basic_per_day: Number(skillWages.toFixed(2)),
      basic_per_hour: Number(basicPerHour.toFixed(2)),
      allowance_per_day: Number(allowancePerDay.toFixed(2)),
      allowance_per_hour: Number(allowancePerHour.toFixed(2)),
      ot_hour: Number(totalOvertimeHours.toFixed(2)),
      ot_rate: Number(overtimeRate.toFixed(2)),
      ot_payment: Number(finalOTPayment.toFixed(2)),
      created_by: req.user.id,
      created_at: new Date()
    };

    const otPayment = await OTPayment.create(otPaymentData);

    console.log('✅ OT Payment saved successfully with ID:', otPayment.id);

    /* =========================================================
       RETURN SUCCESS RESPONSE
    ========================================================= */

    return res.status(200).json({
      success: true,
      message: "OT Payment generated successfully",
      data: {
        id: otPayment.id,
        employee_id: otPayment.employee_id,
        employee_name: employee.name,
        salary_month: otPayment.salary_month,
        calculation_details: {
          skill_wages: skillWages,
          working_hours: workingHours,
          overtime_rate: overtimeRate,
          allowance_per_day: allowancePerDay,
          basic_per_hour: Number(basicPerHour.toFixed(2)),
          allowance_per_hour: Number(allowancePerHour.toFixed(2)),
          total_overtime_hours: Number(totalOvertimeHours.toFixed(2))
        },
        ot_payment: Number(finalOTPayment.toFixed(2)),
        calculation_note: `OT Payment = (Basic: ${basicPerHour.toFixed(2)}/hr + Allowance: ${allowancePerHour.toFixed(2)}/hr) × ${totalOvertimeHours.toFixed(2)} hrs × ${overtimeRate} rate`
      }
    });

  } catch (error) {
    console.error('❌ Generate OT Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// exports.bulkCreateOTSalaryForMonth = async (req, res) => {

//   const transaction = await sequelize.transaction();

//   try {

//     const { month, year } = req.query;

//     const companyId = await getCompanyId(req);

//     if (!companyId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unable to resolve company"
//       });
//     }

//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

//     const startOfMonth = moment(`${salaryMonth}-01`)
//       .startOf("month")
//       .format("YYYY-MM-DD");

//     const endOfMonth = moment(`${salaryMonth}-01`)
//       .endOf("month")
//       .format("YYYY-MM-DD");


//     /* ===============================
//       CHECK MONTH DUPLICATE
//     =============================== */

//     const existing = await OTPayment.findOne({
//       where: {
//         salary_month: salaryMonth,
//         created_by: companyId,
//         is_deleted: false
//       }
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "OT salary payslips already generated for this month"
//       });
//     }


//     /* ===============================
//       FETCH ATTENDANCE WITH REAL OT
//     =============================== */

//     const attendanceRecords = await Attendance.findAll({

//       attributes: ["employee_id", "overtime"],

//       where: {
//         date: { [Op.between]: [startOfMonth, endOfMonth] },
//         overtime: {
//           [Op.and]: [
//             { [Op.ne]: null },
//             { [Op.ne]: "00:00:00" }
//           ]
//         }
//       },

//       raw: true

//     });


//     if (!attendanceRecords.length) {

//       return res.status(200).json({
//         success: true,
//         message: "No overtime found for this month",
//         total_generated: 0,
//         data: []
//       });

//     }


//     /* ===============================
//       GROUP OT HOURS BY EMPLOYEE
//     =============================== */

//     const employeeOTMap = {};

//     attendanceRecords.forEach(row => {

//       if (!row.overtime) return;

//       const parts = row.overtime.split(":");

//       if (parts.length !== 3) return;

//       const h = Number(parts[0]);
//       const m = Number(parts[1]);
//       const s = Number(parts[2]);

//       if (isNaN(h) || isNaN(m) || isNaN(s)) return;

//       const hours = h + m / 60 + s / 3600;

//       if (hours <= 0) return;

//       if (!employeeOTMap[row.employee_id]) {
//         employeeOTMap[row.employee_id] = 0;
//       }

//       employeeOTMap[row.employee_id] += hours;

//     });


//     const employeeIds = Object.keys(employeeOTMap);

//     if (!employeeIds.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No valid overtime found",
//         total_generated: 0,
//         data: []
//       });
//     }


//     /* ===============================
//       FETCH EMPLOYEE DETAILS
//     =============================== */

//     const employees = await Employee.findAll({

//       where: {
//         employee_id: { [Op.in]: employeeIds },
//         deleted_at: null
//       },

//       include: [
//         { model: Skill, as: "skill" },
//         { model: Branch, as: "branch" },
//         { model: Designation, as: "designation" }
//       ]

//     });


//     const results = [];


//     /* ===============================
//       GENERATE OT SALARY
//     =============================== */

//     for (const employee of employees) {

//       const totalOvertimeHours = employeeOTMap[employee.employee_id] || 0;

//       if (!totalOvertimeHours || totalOvertimeHours <= 0) continue;

//       const allowances = await Allowance.findAll({
//         where: { employee_id: employee.employee_id },
//         raw: true
//       });


//       const skillWages = Number(employee.skill?.wages || 0);
//       const workingHours = Number(employee.branch?.working_hours || 8);
//       const overtimeRate = Number(employee.designation?.overtime_rate || 1);


//       const allowancePerDay = allowances.reduce((sum, a) => {
//         return sum + computeValue(a.amount, a.type, skillWages);
//       }, 0);


//       const basicPerHour = skillWages / workingHours;
//       const allowancePerHour = allowancePerDay / workingHours;


//       const finalOTPayment =
//         (basicPerHour + allowancePerHour) *
//         totalOvertimeHours *
//         overtimeRate;


//       const payment = await OTPayment.create({

//         employee_id: employee.employee_id,
//         salary_month: salaryMonth,

//         basic_per_day: skillWages,
//         basic_per_hour: basicPerHour,

//         ot_hour: Number(totalOvertimeHours.toFixed(2)),
//         ot_rate: overtimeRate,

//         ot_payment: Number(finalOTPayment.toFixed(2)),

//         created_by: req.user.id

//       }, { transaction });


//       results.push(payment);

//     }


//     await transaction.commit();


//     return res.status(200).json({

//       success: true,
//       message: "Bulk OT salary generated successfully",

//       total_generated: results.length,

//       data: results

//     });

//   } catch (error) {

//     await transaction.rollback();

//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });

//   }

// };

exports.bulkCreateOTSalaryForMonth = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const { month, year } = req.query;

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }

    /* ===============================
       ROLE BASED ACCESS
    =============================== */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to generate bulk OT salary"
      });
    }

    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id'],
      raw: true
    });

    let branchFilter = {};

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      branchFilter.branch_id = userEmployeeRecord.branch_id;
    }

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    const startOfMonth = moment(`${salaryMonth}-01`)
      .startOf("month")
      .format("YYYY-MM-DD");

    const endOfMonth = moment(`${salaryMonth}-01`)
      .endOf("month")
      .format("YYYY-MM-DD");


    /* ===============================
       CHECK MONTH DUPLICATE
    =============================== */

    const existing = await OTPayment.findOne({
      where: {
        salary_month: salaryMonth,
        created_by: companyId,
        is_deleted: false
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "OT salary payslips already generated for this month"
      });
    }


    /* ===============================
       FETCH ATTENDANCE WITH REAL OT
    =============================== */

    const attendanceRecords = await Attendance.findAll({

      attributes: ["employee_id", "overtime"],

      where: {
        date: { [Op.between]: [startOfMonth, endOfMonth] },
        overtime: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: "00:00:00" }
          ]
        }
      },

      raw: true

    });


    if (!attendanceRecords.length) {

      return res.status(200).json({
        success: true,
        message: "No overtime found for this month",
        total_generated: 0,
        data: []
      });

    }


    /* ===============================
       GROUP OT HOURS BY EMPLOYEE
    =============================== */

    const employeeOTMap = {};

    attendanceRecords.forEach(row => {

      if (!row.overtime) return;

      const parts = row.overtime.split(":");

      if (parts.length !== 3) return;

      const h = Number(parts[0]);
      const m = Number(parts[1]);
      const s = Number(parts[2]);

      if (isNaN(h) || isNaN(m) || isNaN(s)) return;

      const hours = h + m / 60 + s / 3600;

      if (hours <= 0) return;

      if (!employeeOTMap[row.employee_id]) {
        employeeOTMap[row.employee_id] = 0;
      }

      employeeOTMap[row.employee_id] += hours;

    });


    const employeeIds = Object.keys(employeeOTMap);

    if (!employeeIds.length) {
      return res.status(200).json({
        success: true,
        message: "No valid overtime found",
        total_generated: 0,
        data: []
      });
    }


    /* ===============================
       FETCH EMPLOYEE DETAILS
    =============================== */

    const employees = await Employee.findAll({

      where: {
        employee_id: { [Op.in]: employeeIds },
        deleted_at: null,
        ...branchFilter
      },

      include: [
        { model: Skill, as: "skill" },
        { model: Branch, as: "branch" },
        { model: Designation, as: "designation" }
      ]

    });


    const results = [];


    /* ===============================
       GENERATE OT SALARY
    =============================== */

    for (const employee of employees) {

      const totalOvertimeHours = employeeOTMap[employee.employee_id] || 0;

      if (!totalOvertimeHours || totalOvertimeHours <= 0) continue;

      const allowances = await Allowance.findAll({
        where: { employee_id: employee.employee_id },
        raw: true
      });


      const skillWages = Number(employee.skill?.wages || 0);
      const workingHours = Number(employee.branch?.working_hours || 8);
      const overtimeRate = Number(employee.designation?.overtime_rate || 1);


      const allowancePerDay = allowances.reduce((sum, a) => {
        return sum + computeValue(a.amount, a.type, skillWages);
      }, 0);


      const basicPerHour = skillWages / workingHours;
      const allowancePerHour = allowancePerDay / workingHours;


      const finalOTPayment =
        (basicPerHour + allowancePerHour) *
        totalOvertimeHours *
        overtimeRate;


      const payment = await OTPayment.create({

        employee_id: employee.employee_id,
        salary_month: salaryMonth,

        basic_per_day: skillWages,
        basic_per_hour: basicPerHour,

        ot_hour: Number(totalOvertimeHours.toFixed(2)),
        ot_rate: overtimeRate,

        ot_payment: Number(finalOTPayment.toFixed(2)),

        created_by: req.user.id

      }, { transaction });


      results.push(payment);

    }


    await transaction.commit();


    return res.status(200).json({

      success: true,
      message: "Bulk OT salary generated successfully",

      total_generated: results.length,

      data: results

    });

  } catch (error) {

    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });

  }

};

// exports.getAllOTPayslips = async (req, res) => {
//   try {

//     const { month, year } = req.query;

//     const companyId = await getCompanyId(req);

//     if (!companyId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unable to resolve company"
//       });
//     }

//     /* ===============================
//       VALIDATE MONTH YEAR
//     =============================== */

//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

//     /* ===============================
//       GET COMPANY USERS
//     =============================== */

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//     /* ===============================
//       FETCH OT PAYSLIPS WITH EMPLOYEE
//     =============================== */

//     const otPayslips = await OTPayment.findAll({

//       where: {
//         salary_month: salaryMonth,
//         created_by: { [Op.in]: allowedUserIds },
//         is_deleted: false
//       },

//       include: [

//         {
//           model: Employee,
//           as: "employee",

//           attributes: [
//             "id",
//             "employee_id",
//             "name",
//             "phone",
//             "email",
//             "company_doj"
//           ],

//           include: [

//             {
//               model: Branch,
//               as: "branch",
//               attributes: ["id", "name"]
//             },

//             {
//               model: Designation,
//               as: "designation",
//               attributes: ["id", "name"]
//             },

//             {
//               model: Skill,
//               as: "skill",
//               attributes: ["id", "name"]
//             },
            
//             {
//             model: Department,
//             as:'department',
//             attributes: ['id', 'name']
//             }

//           ]

//         }

//       ],

//       order: [["created_at", "DESC"]]

//     });


//     if (!otPayslips.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No OT payslips found for this month"
//       });
//     }


//     /* ===============================
//       SUMMARY CALCULATION
//     =============================== */

//     const totalEmployees = otPayslips.length;

//     const totalOTAmount = otPayslips.reduce((sum, p) => {
//       return sum + Number(p.ot_payment || 0);
//     }, 0);

//     const totalPaidEmployees = otPayslips.filter(p => p.status === "paid").length;

//     const totalUnpaidEmployees = otPayslips.filter(p => p.status === "unpaid").length;


//     /* ===============================
//       RESPONSE
//     =============================== */

//     return res.status(200).json({

//       success: true,

//       message: "OT Payslips fetched successfully",

//       summary: {
//         salary_month: salaryMonth,
//         total_employees: totalEmployees,
//         total_paid: totalPaidEmployees,
//         total_unpaid: totalUnpaidEmployees,
//         total_ot_amount: Number(totalOTAmount.toFixed(2))
//       },

//       data: otPayslips

//     });

//   } catch (error) {

//     console.error("Get OT Payslips Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });

//   }
// };

exports.getAllOTPayslips = async (req, res) => {
  try {

    const { month, year } = req.query;

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }

    /* ===============================
       ROLE BASED ACCESS
    =============================== */

    let branchFilter = {};
    let employeeFilter = {};

    if (isEmployeeUser(req)) {

      const self = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ["employee_id"],
        raw: true
      });

      if (!self) {
        return res.status(403).json({
          success: false,
          message: "Employee profile not found"
        });
      }

      employeeFilter.employee_id = self.employee_id;

    } else {

      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ["branch_id"],
        raw: true
      });

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        branchFilter.branch_id = userEmployeeRecord.branch_id;
      }

    }

    /* ===============================
       VALIDATE MONTH YEAR
    =============================== */

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    /* ===============================
       GET COMPANY USERS
    =============================== */

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

    /* ===============================
       FETCH OT PAYSLIPS WITH EMPLOYEE
    =============================== */

    const otPayslips = await OTPayment.findAll({

      where: {
        salary_month: salaryMonth,
        created_by: { [Op.in]: allowedUserIds },
        is_deleted: false,
        ...employeeFilter
      },

      include: [

        {
          model: Employee,
          as: "employee",

          where: branchFilter,

          attributes: [
            "id",
            "employee_id",
            "name",
            "phone",
            "email",
            "company_doj"
          ],

          include: [

            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name"]
            },

            {
              model: Designation,
              as: "designation",
              attributes: ["id", "name"]
            },

            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name"]
            },
            
            {
            model: Department,
            as:'department',
            attributes: ['id', 'name']
            }

          ]

        }

      ],

      order: [["created_at", "DESC"]]

    });


    if (!otPayslips.length) {
      return res.status(404).json({
        success: false,
        message: "No OT payslips found for this month"
      });
    }


    /* ===============================
       SUMMARY CALCULATION
    =============================== */

    const totalEmployees = otPayslips.length;

    const totalOTAmount = otPayslips.reduce((sum, p) => {
      return sum + Number(p.ot_payment || 0);
    }, 0);

    const totalPaidEmployees = otPayslips.filter(p => p.status === "paid").length;

    const totalUnpaidEmployees = otPayslips.filter(p => p.status === "unpaid").length;


    /* ===============================
       RESPONSE
    =============================== */

    return res.status(200).json({

      success: true,

      message: "OT Payslips fetched successfully",

      summary: {
        salary_month: salaryMonth,
        total_employees: totalEmployees,
        total_paid: totalPaidEmployees,
        total_unpaid: totalUnpaidEmployees,
        total_ot_amount: Number(totalOTAmount.toFixed(2))
      },

      data: otPayslips

    });

  } catch (error) {

    console.error("Get OT Payslips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });

  }
};

// exports.bulkOTPaymentForMonth = async (req, res) => {

//   const transaction = await sequelize.transaction();

//   try {

//     const { month, year } = req.query;

//     const companyId = await getCompanyId(req);

//     if (!companyId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unable to resolve company"
//       });
//     }


//     /* ===============================
//       VALIDATE MONTH YEAR
//     =============================== */

//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;


//     /* ===============================
//       ROLE BASED ACCESS
//     =============================== */

//     if (isEmployeeUser(req)) {
//       return res.status(403).json({
//         success: false,
//         message: "Employees are not allowed to perform bulk OT payment"
//       });
//     }


//     /* ===============================
//       GET COMPANY USER IDS
//     =============================== */

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);


//     /* ===============================
//       FETCH OT PAYSLIPS
//     =============================== */

//     const otPayslips = await OTPayment.findAll({

//       where: {
//         salary_month: salaryMonth,
//         created_by: { [Op.in]: allowedUserIds },
//         is_deleted: false
//       },

//       raw: true

//     });


//     if (!otPayslips.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No OT payslips found for this month"
//       });
//     }


//     /* ===============================
//       CALCULATE TOTAL OT EMPLOYEES
//     =============================== */

//     const totalOTEmployees = otPayslips.length;


//     /* ===============================
//       FILTER UNPAID PAYSLIPS
//     =============================== */

//     const unpaidPayslips = otPayslips.filter(p => p.status === "unpaid");


//     if (!unpaidPayslips.length) {

//       return res.status(200).json({
//         success: true,
//         message: "All OT salaries already paid for this month",
//         total_ot_employees: totalOTEmployees,
//         total_paid_employees: totalOTEmployees,
//         final_total_ot_amount: otPayslips.reduce((sum, p) => sum + Number(p.ot_payment || 0), 0)
//       });

//     }


//     const unpaidIds = unpaidPayslips.map(p => p.id);


//     /* ===============================
//       CALCULATE TOTAL OT AMOUNT
//     =============================== */

//     const totalOTAmount = unpaidPayslips.reduce((sum, p) => {
//       return sum + Number(p.ot_payment || 0);
//     }, 0);


//     /* ===============================
//       UPDATE PAYMENTS
//     =============================== */

//     await OTPayment.update(
//       {
//         status: "paid",
//         paid_at: new Date()
//       },
//       {
//         where: {
//           id: { [Op.in]: unpaidIds }
//         },
//         transaction
//       }
//     );


//     await transaction.commit();


//     /* ===============================
//       RESPONSE
//     =============================== */

//     return res.status(200).json({

//       success: true,
//       message: "Bulk OT payment completed successfully",

//       summary: {

//         salary_month: salaryMonth,

//         total_ot_employees: totalOTEmployees,

//         total_paid_employees: unpaidPayslips.length,

//         final_total_ot_amount: Number(totalOTAmount.toFixed(2))

//       }

//     });

//   } catch (error) {

//     await transaction.rollback();

//     console.error("Bulk OT Payment Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });

//   }

// };

exports.bulkOTPaymentForMonth = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const { month, year } = req.query;

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }


    /* ===============================
       VALIDATE MONTH YEAR
    =============================== */

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;


    /* ===============================
       ROLE BASED ACCESS
    =============================== */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to perform bulk OT payment"
      });
    }

    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id'],
      raw: true
    });

    let branchFilter = {};

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      branchFilter.branch_id = userEmployeeRecord.branch_id;
    }


    /* ===============================
       GET COMPANY USER IDS
    =============================== */

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);


    /* ===============================
       FETCH OT PAYSLIPS
    =============================== */

    const otPayslips = await OTPayment.findAll({

      where: {
        salary_month: salaryMonth,
        created_by: { [Op.in]: allowedUserIds },
        is_deleted: false
      },

      include: [
        {
          model: Employee,
          as: "employee",
          where: branchFilter,
          attributes: ["id", "employee_id", "branch_id"]
        }
      ],

      raw: true,
      nest: true

    });


    if (!otPayslips.length) {
      return res.status(404).json({
        success: false,
        message: "No OT payslips found for this month"
      });
    }


    /* ===============================
       CALCULATE TOTAL OT EMPLOYEES
    =============================== */

    const totalOTEmployees = otPayslips.length;


    /* ===============================
       FILTER UNPAID PAYSLIPS
    =============================== */

    const unpaidPayslips = otPayslips.filter(p => p.status === "unpaid");


    if (!unpaidPayslips.length) {

      return res.status(200).json({
        success: true,
        message: "All OT salaries already paid for this month",
        total_ot_employees: totalOTEmployees,
        total_paid_employees: totalOTEmployees,
        final_total_ot_amount: otPayslips.reduce((sum, p) => sum + Number(p.ot_payment || 0), 0)
      });

    }


    const unpaidIds = unpaidPayslips.map(p => p.id);


    /* ===============================
       CALCULATE TOTAL OT AMOUNT
    =============================== */

    const totalOTAmount = unpaidPayslips.reduce((sum, p) => {
      return sum + Number(p.ot_payment || 0);
    }, 0);


    /* ===============================
       UPDATE PAYMENTS
    =============================== */

    await OTPayment.update(
      {
        status: "paid",
        paid_at: new Date()
      },
      {
        where: {
          id: { [Op.in]: unpaidIds }
        },
        transaction
      }
    );


    await transaction.commit();


    /* ===============================
       RESPONSE
    =============================== */

    return res.status(200).json({

      success: true,
      message: "Bulk OT payment completed successfully",

      summary: {

        salary_month: salaryMonth,

        total_ot_employees: totalOTEmployees,

        total_paid_employees: unpaidPayslips.length,

        final_total_ot_amount: Number(totalOTAmount.toFixed(2))

      }

    });

  } catch (error) {

    await transaction.rollback();

    console.error("Bulk OT Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });

  }

};

exports.updateOTPaymentAmount = async (req, res) => {
  try {

    const { employee_id, salary_month, ot_payment, remark } = req.body;

    if (!employee_id || !salary_month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and salary_month are required"
      });
    }

    if (!ot_payment) {
      return res.status(400).json({
        success: false,
        message: "New OT payment amount required"
      });
    }

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }

    /* ===============================
       ROLE BASED ACCESS
    =============================== */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to update OT payment"
      });
    }

    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["branch_id"],
      raw: true
    });

    let branchFilter = {};

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      branchFilter.branch_id = userEmployeeRecord.branch_id;
    }

    /* ===============================
       FETCH OT PAYMENT
    =============================== */

    const otPayment = await OTPayment.findOne({
      where: {
        employee_id: employee_id,
        salary_month: salary_month,
        is_deleted: false
      },
      include: [
        {
          model: Employee,
          as: "employee",
          where: branchFilter,
          attributes: ["employee_id", "branch_id"]
        }
      ]
    });

    if (!otPayment) {
      return res.status(404).json({
        success: false,
        message: "OT payment record not found"
      });
    }

    if (otPayment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot update OT payment after salary is paid"
      });
    }

    const oldAmount = otPayment.ot_payment;

    /* ===============================
       UPDATE OT PAYMENT
    =============================== */

    otPayment.ot_payment = Number(ot_payment);
    otPayment.remark = remark || null;
    otPayment.updated_by = req.user.id;

    await otPayment.save();

    /* ===============================
       RESPONSE
    =============================== */

    return res.status(200).json({

      success: true,

      message: "OT payment updated successfully",

      data: {
        employee_id: otPayment.employee_id,
        salary_month: otPayment.salary_month,
        previous_amount: oldAmount,
        updated_amount: otPayment.ot_payment,
        remark: otPayment.remark
      }

    });

  } catch (error) {

    console.error("Update OT Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });

  }
};

