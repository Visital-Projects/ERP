const moment = require("moment");
const { Op } = require("sequelize");
const { sequelize }= require('../config/database');

const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const Attendance = require("../models/attendance.model");
const Branch = require("../models/branch.model");
const GrossSalary = require("../models/grossSalary.model");

const Department = require("../models/department.model");
const Designation = require("../models/designation.model");
const Skill = require("../models/skill.model");
const Holiday = require("../models/holiday.model");

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

/* =========================================================
   GROSS SALARY GENERATION
========================================================= */

// exports.generateGrossSalary = async (req, res) => {

//   try {

//     console.log("🚀 ========== START generateGrossSalary ==========");
//     console.log("🔍 User Info:", req.user?.id, req.user?.type);

//     const employeeBusinessId = req.params.employeeId;
//     const { month, year } = req.query;

//     if (!employeeBusinessId) {
//       return res.status(400).json({
//         success: false,
//         message: "employeeId required"
//       });
//     }

//     const companyId = await getCompanyId(req);

//     if (!companyId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unable to resolve company for current user"
//       });
//     }

//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const startOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     )
//       .startOf("month")
//       .format("YYYY-MM-DD");

//     const endOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     )
//       .endOf("month")
//       .format("YYYY-MM-DD");

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

//     console.log("📅 Salary Period:", startOfMonth, endOfMonth);

//     /* =========================================================
//       EMPLOYEE ACCESS CONTROL (SAME AS OT CONTROLLER)
//     ========================================================= */

//     let employee = null;

//     if (isEmployeeUser(req)) {

//       const self = await Employee.findOne({
//         where: { user_id: req.user.id, deleted_at: null },
//         attributes: ["employee_id", "branch_id"]
//       });

//       if (!self) {
//         return res.status(403).json({
//           success: false,
//           message: "Employee profile not found"
//         });
//       }

//       if (String(self.employee_id) !== String(employeeBusinessId)) {
//         return res.status(403).json({
//           success: false,
//           message: "You are only allowed to generate salary for yourself"
//         });
//       }

//       employee = await Employee.findOne({
//         where: {
//           employee_id: self.employee_id,
//           branch_id: self.branch_id,
//           deleted_at: null
//         },
//         include: [
//           {
//             model: Branch,
//             as: "branch",
//             attributes: ["id", "name", "working_days"]
//           }
//         ]
//       });

//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found in your branch"
//         });
//       }

//     } else {

//       const userEmployeeRecord = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ["branch_id", "created_by"],
//         raw: true
//       });

//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {

//         const branchId = userEmployeeRecord.branch_id;

//         const targetEmp = await Employee.findOne({
//           where: { employee_id: employeeBusinessId, deleted_at: null },
//           include: [
//             {
//               model: Branch,
//               as: "branch",
//               attributes: ["id", "name", "working_days"]
//             }
//           ]
//         });

//         if (!targetEmp) {
//           return res.status(404).json({
//             success: false,
//             message: "Employee not found"
//           });
//         }

//         if (Number(targetEmp.branch_id) !== Number(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: "Forbidden: employee not in your branch"
//           });
//         }

//         employee = targetEmp;

//       } else {

//         const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//         employee = await Employee.findOne({
//           where: {
//             employee_id: employeeBusinessId,
//             created_by: { [Op.in]: allowedUserIds },
//             deleted_at: null
//           },
//           include: [
//             {
//               model: Branch,
//               as: "branch",
//               attributes: ["id", "name", "working_days"]
//             }
//           ]
//         });

//         if (!employee) {
//           return res.status(404).json({
//             success: false,
//             message: "Employee not found in your company"
//           });
//         }

//       }

//     }

//     /* =========================================================
//       VALIDATE SALARY DATA
//     ========================================================= */

//     if (!employee.basic_salary) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee basic salary not set"
//       });
//     }

//     const basicSalary = Number(employee.basic_salary);
//     const branchWorkingDays = Number(employee.branch?.working_days || 26);

//     /* =========================================================
//       FETCH ATTENDANCE
//     ========================================================= */

//     const attendanceData = await Attendance.findAll({
//       where: {
//         employee_id: employee.employee_id,
//         date: { [Op.between]: [startOfMonth, endOfMonth] }
//       },
//       attributes: ["status"],
//       raw: true
//     });

//     let actualWorkingDays = 0;

//     attendanceData.forEach(r => {

//       if (r.status === "Present") actualWorkingDays += 1;

//       if (r.status === "Half Day") actualWorkingDays += 0.5;

//     });

//     const nationalHoliday = 1;

//     const paidDays = actualWorkingDays + nationalHoliday;

//     const perDaySalary = basicSalary / branchWorkingDays;

//     const grossSalary = perDaySalary * paidDays;

//     /* =========================================================
//       CHECK DUPLICATE
//     ========================================================= */

//     const existing = await GrossSalary.findOne({
//       where: {
//         employee_id: employee.employee_id,
//         salary_month: salaryMonth,
//         is_deleted: false
//       }
//     });

//     if (existing) {

//       return res.status(400).json({
//         success: false,
//         message: "Gross salary already generated for this month",
//         data: existing
//       });

//     }

//     /* =========================================================
//       SAVE GROSS SALARY
//     ========================================================= */

//     const record = await GrossSalary.create({

//       employee_id: employee.employee_id,

//       salary_month: salaryMonth,

//       fixed_gross_per_month: basicSalary,

//       per_day_payment: Number(perDaySalary.toFixed(2)),

//       nh: nationalHoliday,

//       attendance: actualWorkingDays,

//       total: paidDays,

//       salary: Number(grossSalary.toFixed(2)),

//       created_by: req.user.id,

//       created_at: new Date()

//     });

//     console.log("✅ Gross salary generated successfully");

//     return res.status(200).json({

//       success: true,

//       message: "Gross salary generated successfully",

//       data: record

//     });

//   } catch (err) {

//     console.error("❌ Generate Gross Salary Error:", err);

//     return res.status(500).json({

//       success: false,

//       message: "Server error",

//       error: err.message

//     });

//   }

// };

exports.generateGrossSalary = async (req, res) => {

  try {

    console.log("🚀 ========== START generateGrossSalary ==========");
    console.log("🔍 User Info:", req.user?.id, req.user?.type);

    const employeeBusinessId = req.params.employeeId;
    const { month, year } = req.query;

    if (!employeeBusinessId) {
      return res.status(400).json({
        success: false,
        message: "employeeId required"
      });
    }

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company for current user"
      });
    }

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

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

    console.log("📅 Salary Period:", startOfMonth, endOfMonth);

    /* =========================================================
       EMPLOYEE ACCESS CONTROL (SAME AS OT CONTROLLER)
    ========================================================= */

    let employee = null;

    if (isEmployeeUser(req)) {

      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
        attributes: ["employee_id", "branch_id"]
      });

      if (!self) {
        return res.status(403).json({
          success: false,
          message: "Employee profile not found"
        });
      }

      if (String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({
          success: false,
          message: "You are only allowed to generate salary for yourself"
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
            model: Branch,
            as: "branch",
            attributes: ["id", "name", "working_days"]
          }
        ]
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found in your branch"
        });
      }

    } else {

      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ["branch_id", "created_by"],
        raw: true
      });

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {

        const branchId = userEmployeeRecord.branch_id;

        const targetEmp = await Employee.findOne({
          where: { employee_id: employeeBusinessId, deleted_at: null },
          include: [
            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name", "working_days"]
            }
          ]
        });

        if (!targetEmp) {
          return res.status(404).json({
            success: false,
            message: "Employee not found"
          });
        }

        if (Number(targetEmp.branch_id) !== Number(branchId)) {
          return res.status(403).json({
            success: false,
            message: "Forbidden: employee not in your branch"
          });
        }

        employee = targetEmp;

      } else {

        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

        employee = await Employee.findOne({
          where: {
            employee_id: employeeBusinessId,
            created_by: { [Op.in]: allowedUserIds },
            deleted_at: null
          },
          include: [
            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name", "working_days"]
            }
          ]
        });

        if (!employee) {
          return res.status(404).json({
            success: false,
            message: "Employee not found in your company"
          });
        }

      }

    }

    /* =========================================================
       VALIDATE SALARY DATA
    ========================================================= */

    if (!employee.basic_salary) {
      return res.status(400).json({
        success: false,
        message: "Employee basic salary not set"
      });
    }

    const basicSalary = Number(employee.basic_salary);
    const branchWorkingDays = Number(employee.branch?.working_days || 26);

    /* =========================================================
       FETCH ATTENDANCE
    ========================================================= */

    const attendanceData = await Attendance.findAll({
      where: {
        employee_id: employee.employee_id,
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: ["status", "date"],
      raw: true
    });

    let actualWorkingDays = 0;

    attendanceData.forEach(r => {

      if (r.status === "Present") actualWorkingDays += 1;

      if (r.status === "Half Day") actualWorkingDays += 0.5;

    });

    /* =========================================================
       FETCH HOLIDAYS
    ========================================================= */

    const holidays = await Holiday.findAll({
      where: {
        deleted_at: null,
        [Op.or]: [
          { date: { [Op.between]: [startOfMonth, endOfMonth] } },
          { end_date: { [Op.between]: [startOfMonth, endOfMonth] } }
        ]
      },
      attributes: ["date", "end_date"],
      raw: true
    });

    const holidayDates = [];

    holidays.forEach(h => {

      const start = moment(h.date);
      const end = moment(h.end_date);

      const diff = end.diff(start, "days");

      for (let i = 0; i <= diff; i++) {
        holidayDates.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
      }

    });

    /* =========================================================
       HOLIDAY PRESENT CALCULATION
    ========================================================= */

    const holidayAttendance = attendanceData.filter(a =>
      holidayDates.includes(a.date) && a.status === "Present"
    );

    const holidayPresentDays = holidayAttendance.length;

    const paidDays = actualWorkingDays + holidayPresentDays;

    const perDaySalary = basicSalary / branchWorkingDays;

    const grossSalary = perDaySalary * paidDays;

    /* =========================================================
       CHECK DUPLICATE
    ========================================================= */

    const existing = await GrossSalary.findOne({
      where: {
        employee_id: employee.employee_id,
        salary_month: salaryMonth,
        is_deleted: false
      }
    });

    if (existing) {

      return res.status(400).json({
        success: false,
        message: "Gross salary already generated for this month",
        data: existing
      });

    }

    /* =========================================================
       SAVE GROSS SALARY
    ========================================================= */

    const record = await GrossSalary.create({

      employee_id: employee.employee_id,

      salary_month: salaryMonth,

      fixed_gross_per_month: basicSalary,

      per_day_payment: Number(perDaySalary.toFixed(2)),

      nh: holidayPresentDays,

      attendance: actualWorkingDays,

      total: paidDays,

      salary: Number(grossSalary.toFixed(2)),

      created_by: req.user.id,

      created_at: new Date()

    });

    console.log("✅ Gross salary generated successfully");

    return res.status(200).json({

      success: true,

      message: "Gross salary generated successfully",

      data: record

    });

  } catch (err) {

    console.error("❌ Generate Gross Salary Error:", err);

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: err.message

    });

  }

};


// exports.bulkCreateGrossSalaryPayslips = async (req, res) => {

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

//     const startOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     ).startOf("month").format("YYYY-MM-DD");

//     const endOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     ).endOf("month").format("YYYY-MM-DD");

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//     /* =========================================================
//       STEP 1 : FETCH EMPLOYEES FROM attendance_employees TABLE
//       (These employees have NO OT)
//     ========================================================= */

//     const attendanceEmployees = await Attendance.findAll({

//       where: {
//         date: {
//           [Op.between]: [startOfMonth, endOfMonth]
//         }
//       },

//       attributes: ["employee_id"],

//       group: ["employee_id"],

//       raw: true

//     });

//     const employeeIdsWithoutOT = attendanceEmployees.map(
//       e => Number(e.employee_id)
//     );

//     if (!employeeIdsWithoutOT.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No employees found without OT for this month"
//       });
//     }

//     /* =========================================================
//       STEP 2 : FETCH EMPLOYEE DETAILS
//     ========================================================= */

//     const employees = await Employee.findAll({

//       where: {
//         employee_id: { [Op.in]: employeeIdsWithoutOT },
//         created_by: { [Op.in]: allowedUserIds },
//         deleted_at: null
//       },

//       include: [
//         {
//           model: Branch,
//           as: "branch",
//           attributes: ["id", "name", "working_days"]
//         }
//       ]

//     });

//     if (!employees.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No valid employees found"
//       });
//     }

//     const generatedPayslips = [];

//     /* =========================================================
//       STEP 3 : GENERATE GROSS SALARY
//     ========================================================= */

//     for (const employee of employees) {

//       if (!employee.basic_salary) continue;

//       const existing = await GrossSalary.findOne({

//         where: {
//           employee_id: employee.employee_id,
//           salary_month: salaryMonth,
//           is_deleted: false
//         }

//       });

//       if (existing) continue;

//       /* =========================================================
//          FETCH ATTENDANCE
//       ========================================================= */

//       const attendanceData = await Attendance.findAll({

//         where: {
//           employee_id: employee.employee_id,
//           date: {
//             [Op.between]: [startOfMonth, endOfMonth]
//           }
//         },

//         attributes: ["status"],

//         raw: true

//       });

//       let actualWorkingDays = 0;

//       attendanceData.forEach(r => {

//         if (r.status === "Present") actualWorkingDays += 1;

//         if (r.status === "Half Day") actualWorkingDays += 0.5;

//       });

//       const nationalHoliday = 1;

//       const paidDays = actualWorkingDays + nationalHoliday;

//       const basicSalary = Number(employee.basic_salary);

//       const branchWorkingDays = Number(employee.branch?.working_days || 26);

//       const perDaySalary = basicSalary / branchWorkingDays;

//       const grossSalary = perDaySalary * paidDays;

//       /* =========================================================
//          CREATE GROSS SALARY
//       ========================================================= */

//       const record = await GrossSalary.create({

//         employee_id: employee.employee_id,

//         salary_month: salaryMonth,

//         fixed_gross_per_month: basicSalary,

//         per_day_payment: Number(perDaySalary.toFixed(2)),

//         nh: nationalHoliday,

//         attendance: actualWorkingDays,

//         total: paidDays,

//         salary: Number(grossSalary.toFixed(2)),

//         created_by: req.user.id,

//         created_at: new Date()

//       }, { transaction });

//       generatedPayslips.push(record);

//     }

//     await transaction.commit();

//     return res.status(200).json({

//       success: true,

//       message: "Bulk gross salary payslips generated successfully",

//       total_generated: generatedPayslips.length,

//       data: generatedPayslips

//     });

//   } catch (err) {

//     await transaction.rollback();

//     console.error("❌ Bulk Gross Salary Error:", err);

//     return res.status(500).json({

//       success: false,

//       message: "Server error",

//       error: err.message

//     });

//   }

// };

// exports.bulkCreateGrossSalaryPayslips = async (req, res) => {

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

//     /* =========================================================
//       ROLE BASED ACCESS
//     ========================================================= */

//     if (isEmployeeUser(req)) {
//       return res.status(403).json({
//         success: false,
//         message: "Employees are not allowed to generate bulk gross salary"
//       });
//     }

//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["branch_id"],
//       raw: true
//     });

//     let branchFilter = {};

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       branchFilter.branch_id = userEmployeeRecord.branch_id;
//     }

//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();

//     const startOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     ).startOf("month").format("YYYY-MM-DD");

//     const endOfMonth = moment(
//       `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
//     ).endOf("month").format("YYYY-MM-DD");

//     const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//     /* =========================================================
//       STEP 1 : FETCH EMPLOYEES FROM attendance_employees TABLE
//       (These employees have NO OT)
//     ========================================================= */

//     const attendanceEmployees = await Attendance.findAll({

//       where: {
//         date: {
//           [Op.between]: [startOfMonth, endOfMonth]
//         }
//       },

//       attributes: ["employee_id"],

//       group: ["employee_id"],

//       raw: true

//     });

//     const employeeIdsWithoutOT = attendanceEmployees.map(
//       e => Number(e.employee_id)
//     );

//     if (!employeeIdsWithoutOT.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No employees found without OT for this month"
//       });
//     }

//     /* =========================================================
//       STEP 2 : FETCH EMPLOYEE DETAILS
//     ========================================================= */

//     const employees = await Employee.findAll({

//       where: {
//         employee_id: { [Op.in]: employeeIdsWithoutOT },
//         created_by: { [Op.in]: allowedUserIds },
//         deleted_at: null,
//         ...branchFilter
//       },

//       include: [
//         {
//           model: Branch,
//           as: "branch",
//           attributes: ["id", "name", "working_days"]
//         }
//       ]

//     });

//     if (!employees.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No valid employees found"
//       });
//     }

//     const generatedPayslips = [];

//     /* =========================================================
//       STEP 3 : GENERATE GROSS SALARY
//     ========================================================= */

//     for (const employee of employees) {

//       if (!employee.basic_salary) continue;

//       const existing = await GrossSalary.findOne({

//         where: {
//           employee_id: employee.employee_id,
//           salary_month: salaryMonth,
//           is_deleted: false
//         }

//       });

//       if (existing) continue;

//       /* =========================================================
//          FETCH ATTENDANCE
//       ========================================================= */

//       const attendanceData = await Attendance.findAll({

//         where: {
//           employee_id: employee.employee_id,
//           date: {
//             [Op.between]: [startOfMonth, endOfMonth]
//           }
//         },

//         attributes: ["status"],

//         raw: true

//       });

//       let actualWorkingDays = 0;

//       attendanceData.forEach(r => {

//         if (r.status === "Present") actualWorkingDays += 1;

//         if (r.status === "Half Day") actualWorkingDays += 0.5;

//       });

//       const nationalHoliday = 1;

//       const paidDays = actualWorkingDays + nationalHoliday;

//       const basicSalary = Number(employee.basic_salary);

//       const branchWorkingDays = Number(employee.branch?.working_days || 26);

//       const perDaySalary = basicSalary / branchWorkingDays;

//       const grossSalary = perDaySalary * paidDays;

//       /* =========================================================
//          CREATE GROSS SALARY
//       ========================================================= */

//       const record = await GrossSalary.create({

//         employee_id: employee.employee_id,

//         salary_month: salaryMonth,

//         fixed_gross_per_month: basicSalary,

//         per_day_payment: Number(perDaySalary.toFixed(2)),

//         nh: nationalHoliday,

//         attendance: actualWorkingDays,

//         total: paidDays,

//         salary: Number(grossSalary.toFixed(2)),

//         created_by: req.user.id,

//         created_at: new Date()

//       }, { transaction });

//       generatedPayslips.push(record);

//     }

//     await transaction.commit();

//     return res.status(200).json({

//       success: true,

//       message: "Bulk gross salary payslips generated successfully",

//       total_generated: generatedPayslips.length,

//       data: generatedPayslips

//     });

//   } catch (err) {

//     await transaction.rollback();

//     console.error("❌ Bulk Gross Salary Error:", err);

//     return res.status(500).json({

//       success: false,

//       message: "Server error",

//       error: err.message

//     });

//   }

// };

exports.bulkCreateGrossSalaryPayslips = async (req, res) => {

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

    /* =========================================================
       ROLE BASED ACCESS
    ========================================================= */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to generate bulk gross salary"
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

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const startOfMonth = moment(
      `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
    ).startOf("month").format("YYYY-MM-DD");

    const endOfMonth = moment(
      `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
    ).endOf("month").format("YYYY-MM-DD");

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

    /* =========================================================
       FETCH HOLIDAYS
    ========================================================= */

    const holidays = await Holiday.findAll({
      where: {
        deleted_at: null,
        [Op.or]: [
          { date: { [Op.between]: [startOfMonth, endOfMonth] } },
          { end_date: { [Op.between]: [startOfMonth, endOfMonth] } }
        ]
      },
      attributes: ["date", "end_date"],
      raw: true
    });

    const holidayDates = [];

    holidays.forEach(h => {

      const start = moment(h.date);
      const end = moment(h.end_date);

      const diff = end.diff(start, "days");

      for (let i = 0; i <= diff; i++) {
        holidayDates.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
      }

    });

    /* =========================================================
       STEP 1 : FETCH EMPLOYEES FROM attendance_employees TABLE
       (These employees have NO OT)
    ========================================================= */

    const attendanceEmployees = await Attendance.findAll({

      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },

      attributes: ["employee_id"],

      group: ["employee_id"],

      raw: true

    });

    const employeeIdsWithoutOT = attendanceEmployees.map(
      e => Number(e.employee_id)
    );

    if (!employeeIdsWithoutOT.length) {
      return res.status(404).json({
        success: false,
        message: "No employees found without OT for this month"
      });
    }

    /* =========================================================
       STEP 2 : FETCH EMPLOYEE DETAILS
    ========================================================= */

    const employees = await Employee.findAll({

      where: {
        employee_id: { [Op.in]: employeeIdsWithoutOT },
        created_by: { [Op.in]: allowedUserIds },
        deleted_at: null,
        ...branchFilter
      },

      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "working_days"]
        }
      ]

    });

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: "No valid employees found"
      });
    }

    const generatedPayslips = [];

    /* =========================================================
       STEP 3 : GENERATE GROSS SALARY
    ========================================================= */

    for (const employee of employees) {

      if (!employee.basic_salary) continue;

      const existing = await GrossSalary.findOne({

        where: {
          employee_id: employee.employee_id,
          salary_month: salaryMonth,
          is_deleted: false
        }

      });

      if (existing) continue;

      /* =========================================================
         FETCH ATTENDANCE
      ========================================================= */

      const attendanceData = await Attendance.findAll({

        where: {
          employee_id: employee.employee_id,
          date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },

        attributes: ["status", "date"],

        raw: true

      });

      let actualWorkingDays = 0;

      attendanceData.forEach(r => {

        if (r.status === "Present") actualWorkingDays += 1;

        if (r.status === "Half Day") actualWorkingDays += 0.5;

      });

      /* =========================================================
         HOLIDAY PRESENT CALCULATION
      ========================================================= */

      const holidayAttendance = attendanceData.filter(a =>
        holidayDates.includes(a.date) && a.status === "Present"
      );

      const holidayPresentDays = holidayAttendance.length;

      const paidDays = actualWorkingDays + holidayPresentDays;

      const basicSalary = Number(employee.basic_salary);

      const branchWorkingDays = Number(employee.branch?.working_days || 26);

      const perDaySalary = basicSalary / branchWorkingDays;

      const grossSalary = perDaySalary * paidDays;

      /* =========================================================
         CREATE GROSS SALARY
      ========================================================= */

      const record = await GrossSalary.create({

        employee_id: employee.employee_id,

        salary_month: salaryMonth,

        fixed_gross_per_month: basicSalary,

        per_day_payment: Number(perDaySalary.toFixed(2)),

        nh: holidayPresentDays,

        attendance: actualWorkingDays,

        total: paidDays,

        salary: Number(grossSalary.toFixed(2)),

        created_by: req.user.id,

        created_at: new Date()

      }, { transaction });

      generatedPayslips.push(record);

    }

    await transaction.commit();

    return res.status(200).json({

      success: true,

      message: "Bulk gross salary payslips generated successfully",

      total_generated: generatedPayslips.length,

      data: generatedPayslips

    });

  } catch (err) {

    await transaction.rollback();

    console.error("❌ Bulk Gross Salary Error:", err);

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: err.message

    });

  }

};


// exports.getAllGrossSalaryMonthwise = async (req, res) => {

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

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//     /* =========================================================
//       FETCH GROSS SALARY WITH EMPLOYEE DETAILS
//     ========================================================= */

//     const grossSalaries = await GrossSalary.findAll({

//       where: {
//         salary_month: salaryMonth,
//         is_deleted: false
//       },

//       include: [
//         {
//           model: Employee,
//           as: "employee",
//           required: true,

//           where: {
//             created_by: { [Op.in]: allowedUserIds },
//             deleted_at: null
//           },

//           attributes: [
//             "employee_id",
//             "name",
//             "phone",
//             "email",
//             "company_doj",
//             "employee_type",
//             "basic_salary"
//           ],

//           include: [

//             {
//               model: Branch,
//               as: "branch",
//               attributes: ["id", "name"]
//             },

//             {
//               model: Department,
//               as: "department",
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
//               attributes: ["id", "name"],
//               required: false
//             }

//           ]

//         }

//       ],

//       order: [["created_at", "DESC"]]

//     });

//     return res.status(200).json({

//       success: true,

//       message: "Gross salary fetched successfully",

//       total_records: grossSalaries.length,

//       data: grossSalaries

//     });

//   } catch (err) {

//     console.error("❌ Get Gross Salary Error:", err);

//     return res.status(500).json({

//       success: false,

//       message: "Server error",

//       error: err.message

//     });

//   }

// };

exports.getAllGrossSalaryMonthwise = async (req, res) => {

  try {

    const { month, year } = req.query;

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }

    /* =========================================================
       ROLE BASED ACCESS
    ========================================================= */

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

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

    /* =========================================================
       FETCH GROSS SALARY WITH EMPLOYEE DETAILS
    ========================================================= */

    const grossSalaries = await GrossSalary.findAll({

      where: {
        salary_month: salaryMonth,
        is_deleted: false
      },

      include: [
        {
          model: Employee,
          as: "employee",
          required: true,

          where: {
            created_by: { [Op.in]: allowedUserIds },
            deleted_at: null,
            ...branchFilter,
            ...employeeFilter
          },

          attributes: [
            "employee_id",
            "name",
            "phone",
            "email",
            "company_doj",
            "employee_type",
            "basic_salary"
          ],

          include: [

            {
              model: Branch,
              as: "branch",
              attributes: ["id", "name"]
            },

            {
              model: Department,
              as: "department",
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
              attributes: ["id", "name"],
              required: false
            }

          ]

        }

      ],

      order: [["created_at", "DESC"]]

    });

    return res.status(200).json({

      success: true,

      message: "Gross salary fetched successfully",

      total_records: grossSalaries.length,

      data: grossSalaries

    });

  } catch (err) {

    console.error("❌ Get Gross Salary Error:", err);

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: err.message

    });

  }

};


// exports.bulkGrossSalaryPayment = async (req, res) => {

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

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

//     /* =========================================================
//       STEP 1 : FETCH GROSS SALARIES
//     ========================================================= */

//     const grossSalaries = await GrossSalary.findAll({

//       where: {
//         salary_month: salaryMonth,
//         is_deleted: false
//       },

//       include: [
//         {
//           model: Employee,
//           as: "employee",
//           required: true,
//           attributes: ["employee_id", "name"],
//           where: {
//             created_by: { [Op.in]: allowedUserIds },
//             deleted_at: null
//           }
//         }
//       ],

//       transaction

//     });

//     if (!grossSalaries.length) {

//       await transaction.rollback();

//       return res.status(404).json({
//         success: false,
//         message: "No gross salary records found for this month"
//       });

//     }

//     /* =========================================================
//       STEP 2 : CALCULATE SUMMARY
//     ========================================================= */

//     let totalEmployees = grossSalaries.length;
//     let totalPaidEmployees = 0;
//     let totalGrossPaidAmount = 0;
//     let totalGrossBalance = 0;

//     for (const record of grossSalaries) {

//       const salaryAmount = Number(record.salary) || 0;

//       if (record.status === "paid") {

//         totalPaidEmployees++;
//         totalGrossPaidAmount += salaryAmount;

//       } else {

//         totalGrossBalance += salaryAmount;

//       }

//     }

//     /* =========================================================
//       STEP 3 : UPDATE UNPAID → PAID
//     ========================================================= */

//     const unpaidRecords = grossSalaries.filter(r => r.status === "unpaid");

//     for (const record of unpaidRecords) {

//       totalGrossPaidAmount += Number(record.salary);

//     }

//     const [updatedCount] = await GrossSalary.update(

//       {
//         status: "paid",
//         paid_at: new Date()
//       },

//       {
//         where: {
//           salary_month: salaryMonth,
//           status: "unpaid",
//           is_deleted: false
//         },
//         transaction
//       }

//     );

//     totalPaidEmployees += updatedCount;

//     totalGrossBalance = 0;

//     await transaction.commit();

//     return res.status(200).json({

//       success: true,

//       message: "Bulk gross salary payment completed successfully",

//       data: {

//         salary_month: salaryMonth,

//         total_employees: totalEmployees,

//         total_paid_employees: totalPaidEmployees,

//         total_gross_paid_amount: Number(totalGrossPaidAmount.toFixed(2)),

//         total_gross_balance: totalGrossBalance

//       }

//     });

//   } catch (err) {

//     await transaction.rollback();

//     console.error("❌ Bulk Gross Payment Error:", err);

//     return res.status(500).json({

//       success: false,
//       message: "Server error",
//       error: err.message

//     });

//   }

// };

exports.bulkGrossSalaryPayment = async (req, res) => {

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

    /* =========================================================
       ROLE BASED ACCESS
    ========================================================= */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to perform bulk gross salary payment"
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

    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();

    const salaryMonth = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId);

    /* =========================================================
       STEP 1 : FETCH GROSS SALARIES
    ========================================================= */

    const grossSalaries = await GrossSalary.findAll({

      where: {
        salary_month: salaryMonth,
        is_deleted: false
      },

      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          attributes: ["employee_id", "name"],
          where: {
            created_by: { [Op.in]: allowedUserIds },
            deleted_at: null,
            ...branchFilter
          }
        }
      ],

      transaction

    });

    if (!grossSalaries.length) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "No gross salary records found for this month"
      });

    }

    /* =========================================================
       STEP 2 : CALCULATE SUMMARY
    ========================================================= */

    let totalEmployees = grossSalaries.length;
    let totalPaidEmployees = 0;
    let totalGrossPaidAmount = 0;
    let totalGrossBalance = 0;

    for (const record of grossSalaries) {

      const salaryAmount = Number(record.salary) || 0;

      if (record.status === "paid") {

        totalPaidEmployees++;
        totalGrossPaidAmount += salaryAmount;

      } else {

        totalGrossBalance += salaryAmount;

      }

    }

    /* =========================================================
       STEP 3 : UPDATE UNPAID → PAID
    ========================================================= */

    const unpaidRecords = grossSalaries.filter(r => r.status === "unpaid");

    for (const record of unpaidRecords) {

      totalGrossPaidAmount += Number(record.salary);

    }

    const [updatedCount] = await GrossSalary.update(

      {
        status: "paid",
        paid_at: new Date()
      },

      {
        where: {
          salary_month: salaryMonth,
          status: "unpaid",
          is_deleted: false
        },
        transaction
      }

    );

    totalPaidEmployees += updatedCount;

    totalGrossBalance = 0;

    await transaction.commit();

    return res.status(200).json({

      success: true,

      message: "Bulk gross salary payment completed successfully",

      data: {

        salary_month: salaryMonth,

        total_employees: totalEmployees,

        total_paid_employees: totalPaidEmployees,

        total_gross_paid_amount: Number(totalGrossPaidAmount.toFixed(2)),

        total_gross_balance: totalGrossBalance

      }

    });

  } catch (err) {

    await transaction.rollback();

    console.error("❌ Bulk Gross Payment Error:", err);

    return res.status(500).json({

      success: false,
      message: "Server error",
      error: err.message

    });

  }

};

exports.updateGrossSalary = async (req, res) => {

  try {

    const { employee_id, salary_month, salary, remark } = req.body;

    if (!employee_id || !salary_month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and salary_month are required"
      });
    }

    if (!salary) {
      return res.status(400).json({
        success: false,
        message: "salary amount required"
      });
    }

    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve company"
      });
    }

    /* =========================================================
       ROLE BASED ACCESS
    ========================================================= */

    if (isEmployeeUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Employees are not allowed to update salary"
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

    /* =========================================================
       FETCH GROSS SALARY RECORD
    ========================================================= */

    const grossSalary = await GrossSalary.findOne({

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

    if (!grossSalary) {
      return res.status(404).json({
        success: false,
        message: "Gross salary record not found"
      });
    }

    if (grossSalary.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot update salary after payment is completed"
      });
    }

    const previousAmount = grossSalary.salary;

    /* =========================================================
       UPDATE SALARY
    ========================================================= */

    grossSalary.salary = Number(salary);
    grossSalary.remark = remark || null;
    grossSalary.updated_by = req.user.id;

    await grossSalary.save();

    return res.status(200).json({

      success: true,

      message: "Gross salary updated successfully",

      data: {
        employee_id: grossSalary.employee_id,
        salary_month: grossSalary.salary_month,
        previous_salary: previousAmount,
        updated_salary: grossSalary.salary,
        remark: grossSalary.remark
      }

    });

  } catch (err) {

    console.error("Update Gross Salary Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });

  }

};



