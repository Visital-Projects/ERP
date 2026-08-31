

// const bcrypt = require('bcrypt');
// const fs = require("fs");
// const path = require("path");
// const ExcelJS = require("exceljs");
// const dayjs = require("dayjs");
// const { Sequelize, Op } = require("sequelize");

// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const Department = require('../models/department.model');
// const Branch = require('../models/branch.model');
// const Designation = require('../models/designation.model');
// const PayslipType = require("../models/payslipType.model");
// const AttendanceEmployee = require("../models/attendance.model");
// const Overtime = require("../models/overtime.model");

// // 🧩 new models for salary components
// const Allowance = require("../models/allowance.model");
// const Commission = require("../models/commission.model");
// const Loan = require("../models/loan.model");
// const OtherPayment = require("../models/otherPayment.model");
// const SaturationDeduction = require("../models/saturationDeduction.model");
// const ExpenseNew = require("../models/expenseNew.model");
// const WorkOrder = require("../models/workOrder.model")
// const WorkOrderInvoice = require("../models/work_order_invoice.model")
// const PurchaseOrder = require("../models/purchase_order.model")
// const PurchaseOrderInvoice = require('../models/purchase_order_invoice.model');


// // ======================
// // 🔹 Utility Functions
// // ======================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//   });

//   return emp?.created_by || req.user.id;
// }

// function isSuper(req) {
//   const t = (req.user?.type || '').toLowerCase();
//   const roleNames = Array.isArray(req.user?.roles)
//     ? req.user.roles.map(r => (r.name || '').toLowerCase())
//     : [];
//   return t === 'super admin' || roleNames.includes('super admin');
// }

// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ["branch_id"],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ["id"],
//     raw: true,
//   });

//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];
//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId,
//       },
//       attributes: ["user_id"],
//       raw: true,
//     });
//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }




// exports.getAllEmployeesSummary = async (req, res) => {
//   try {
//     if (!req.user)
//       return res.status(401).json({ success: false, message: "Unauthorized" });

//     const companyId = await getCompanyId(req);
//     let employees;

//     // ============================
//     // 🧩 Role-Based Employee Visibility
//     // ============================
//     if (isSuper(req)) {
//       employees = await Employee.findAll({
//         where: { deleted_at: null, is_active: true },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else if (isEmployee(req)) {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id, deleted_at: null, is_active: true },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//       });
//       employees = emp ? [emp] : [];
//     } else if ((req.user?.type || "").toLowerCase() === "company") {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null, is_active: true },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId)
//         return res.status(403).json({ success: false, message: "No branch assigned" });

//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       employees = await Employee.findAll({
//         where: {
//           branch_id: branchId,
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null,
//           is_active: true,
//         },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     }

const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const { Sequelize, Op } = require("sequelize");

const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Department = require('../models/department.model');
const Branch = require('../models/branch.model');
const Designation = require('../models/designation.model');
const PayslipType = require("../models/payslipType.model");
const AttendanceEmployee = require("../models/attendance.model");
const Overtime = require("../models/overtime.model");
const Allowance = require("../models/allowance.model");
const Commission = require("../models/commission.model");
const Loan = require("../models/loan.model");
const OtherPayment = require("../models/otherPayment.model");
const SaturationDeduction = require("../models/saturationDeduction.model");
const ExpenseNew = require("../models/expenseNew.model");
const WorkOrder = require("../models/workOrder.model");
const WorkOrderInvoice = require("../models/work_order_invoice.model");
const PurchaseOrder = require("../models/purchase_order.model");
const PurchaseOrderInvoice = require('../models/purchase_order_invoice.model');


// ======================
// 🔹 Utility Functions
// ======================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });

  return emp?.created_by || req.user.id;
}

function isSuper(req) {
  const t = (req.user?.type || '').toLowerCase();
  const roleNames = Array.isArray(req.user?.roles)
    ? req.user.roles.map(r => (r.name || '').toLowerCase())
    : [];
  return t === 'super admin' || roleNames.includes('super admin');
}

function isEmployee(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ["branch_id"],
    raw: true,
  });
  return emp?.branch_id || null;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ["id"],
    raw: true,
  });

  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ["user_id"],
      raw: true,
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}


// ============================
// 🧩 Permission: Accountant/Company Full Access
// ============================
async function getAllowedUserIds(req) {
  if (!req.user) return [];

  const userType = (req.user.type || '').toLowerCase();

  if (userType === 'company' || userType === 'accountant') {
    // ✅ Company and Accountant can access ALL work orders/payments
    const allUsers = await User.findAll({ attributes: ['id'], raw: true });
    return allUsers.map(u => u.id);
  }

  // Other users (restricted)
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by'],
    raw: true
  });

  return [req.user.id, emp?.created_by].filter(Boolean);
}


// ============================
// 🧮 Main Function: getAllEmployeesSummary
// ============================
// exports.getAllEmployeesSummary = async (req, res) => {
//   try {
//     if (!req.user)
//       return res.status(401).json({ success: false, message: "Unauthorized" });

//     const companyId = await getCompanyId(req);
//     const allowedUserIds = await getAllowedUserIds(req);
//     let employees;

//     // ============================
//     // 🧩 Role-Based Employee Visibility
//     // ============================
//     if (isSuper(req)) {
//       employees = await Employee.findAll({
//         where: { deleted_at: null, is_active: true },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else if (isEmployee(req)) {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id, deleted_at: null, is_active: true },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//       });
//       employees = emp ? [emp] : [];
//     } else {
//       employees = await Employee.findAll({
//         where: {
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null,
//           is_active: true
//         },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     }
    
//      // ============================
//     // 🧾 Excel Setup
//     // ============================
//     const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
//     const monthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

//     const folderPath = path.join(__dirname, "..", "excel");
//     if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Bank Payment");

//     worksheet.mergeCells("A1:Z1");
//     worksheet.getCell("A1").value = `Bank Payment Sheet - ${dayjs().format("MMMM YYYY")}`;
//     worksheet.getCell("A1").alignment = { horizontal: "center" };
//     worksheet.getCell("A1").font = { bold: true, size: 14 };
//     worksheet.addRow([]);

//     // ============================
//     // 💡 WO/PO Section (Formatted)
//     // ============================
//     worksheet.addRow(["Contract Period", "Invoice Raised", "Tax", "", "", "Total", "Payment Received"]);
//     worksheet.getRow(worksheet.lastRow.number).font = { bold: true };
//     worksheet.mergeCells(`C${worksheet.lastRow.number}:E${worksheet.lastRow.number}`);
//     worksheet.addRow(["PO/WO No", "Basic", "CGST", "SGST", "IGST", "GST Amount", "Total Amount"]);
//     worksheet.getRow(worksheet.lastRow.number).font = { bold: true };
//     worksheet.getRow(worksheet.lastRow.number).alignment = { horizontal: "center" };

//     // ============================
//     // 🏗 WO/PO Data Rows per Branch
//     // ============================
//     const branches = [...new Set(employees.map(e => e.branch_id))];
//     const branchNetPayMap = {};

//     for (const branchId of branches) {
//       if (!branchNetPayMap[branchId]) {
//         branchNetPayMap[branchId] = {
//           totalNetPayable: 0,
//           totalReceived: 0,
//           branchName: employees.find(e => e.branch_id === branchId)?.branch?.name || "N/A"
//         };
//       }

//       // ----- WO invoices -----
//       const workOrders = await WorkOrder.findAll({
//         where: { assigned_to: branchId, status: { [Op.ne]: "Cancelled" } },
//         attributes: ["wo_number"],
//         raw: true,
//       });

//       for (const wo of workOrders) {
//         const invoices = await WorkOrderInvoice.findAll({
//           where: { wo_number: wo.wo_number, status: 'Paid' },
//           attributes: [
//             "wo_number",
//             "base_amount",
//             "cgst",
//             "sgst",
//             "igst",
//             "gst_amount",
//             "total_amount",
//             "payment_amount",
//           ],
//           raw: true,
//         });

//         for (const inv of invoices) {
//           worksheet.addRow([
//             inv.wo_number,
//             inv.base_amount || 0,
//             inv.cgst || 0,
//             inv.sgst || 0,
//             inv.igst || 0,
//             inv.gst_amount || 0,
//             inv.total_amount || 0,
//           ]);
//           branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
//         }
//       }

//       // ----- PO invoices -----
//       const purchaseOrders = await PurchaseOrder.findAll({
//         where: { branch_id: branchId },
//         attributes: ["po_number"],
//         raw: true,
//       });

//       for (const po of purchaseOrders) {
//         const poInvoices = await PurchaseOrderInvoice.findAll({
//           where: { po_number: po.po_number },
//           attributes: [
//             "po_number",
//             "base_amount",
//             "cgst",
//             "sgst",
//             "igst",
//             "gst_amount",
//             "total_amount",
//             "payment_amount",
//           ],
//           raw: true,
//         });

//         for (const inv of poInvoices) {
//           worksheet.addRow([
//             inv.po_number,
//             inv.base_amount || 0,
//             inv.cgst || 0,
//             inv.sgst || 0,
//             inv.igst || 0,
//             inv.gst_amount || 0,
//             inv.total_amount || 0,
//           ]);
//           branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
//         }
//       }
    
// }
// //     // ============================
// //     // 🧾 Excel Setup
// //     // ============================
// //     const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
// //     const monthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

// //     const folderPath = path.join(__dirname, "..", "excel");
// //     if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

// //     const workbook = new ExcelJS.Workbook();
// //     const worksheet = workbook.addWorksheet("Bank Payment");

// //     worksheet.mergeCells("A1:Z1");
// //     worksheet.getCell("A1").value = `Bank Payment Sheet - ${dayjs().format("MMMM YYYY")}`;
// //     worksheet.getCell("A1").alignment = { horizontal: "center" };
// //     worksheet.getCell("A1").font = { bold: true, size: 14 };
// //     worksheet.addRow([]);

// //     // ============================
// //     // 💡 WO/PO Header
// //     // ============================
// //     worksheet.addRow([
// //       "WO/PO Number", "Payment Amount", "Total Amount", "Base Amount",
// //       "CGST", "SGST", "IGST", "GST Amount"
// //     ]);
// //     worksheet.getRow(3).font = { bold: true };
// //     worksheet.getRow(3).alignment = { horizontal: "center" };

// //     // ============================
// //     // 🏗 WO/PO Data Rows per Branch
// //     // ============================
// //     const branches = [...new Set(employees.map(e => e.branch_id))];

// //     const branchNetPayMap = {}; // for branch summary

// //     for (const branchId of branches) {
// //       // Initialize branch summary
// //       if (!branchNetPayMap[branchId]) branchNetPayMap[branchId] = {
// //         totalNetPayable: 0,
// //         totalReceived: 0,
// //         branchName: employees.find(e => e.branch_id === branchId)?.branch?.name || "N/A"
// //       };


// // // ----- WO invoices -----
// // const workOrders = await WorkOrder.findAll({
// //   where: { assigned_to: branchId, status: { [Op.ne]: "Cancelled" } },
// //   attributes: ["wo_number"],
// //   raw: true,
// // });

// // for (const wo of workOrders) {
// //   const invoices = await WorkOrderInvoice.findAll({
// //     where: { wo_number: wo.wo_number, status: 'Paid' }, // ✅ Only Paid invoices
// //     attributes: [
// //       "wo_number",
// //       "payment_amount",
// //       "total_amount",
// //       "base_amount",
// //       "cgst",
// //       "sgst",
// //       "igst",
// //       "gst_amount"
// //     ],
// //     raw: true,
// //   });

// //   for (const inv of invoices) {
// //     worksheet.addRow([
// //       inv.wo_number,
// //       inv.payment_amount,
// //       inv.total_amount,
// //       inv.base_amount,
// //       inv.cgst,
// //       inv.sgst,
// //       inv.igst,
// //       inv.gst_amount
// //     ]);
// //     branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
// //   }
// // }

//     //   // ----- PO invoices -----
//     //   const purchaseOrders = await PurchaseOrder.findAll({
//     //     where: { branch_id: branchId },
//     //     attributes: ["po_number"],
//     //     raw: true,
//     //   });

//     //   for (const po of purchaseOrders) {
//     //     const poInvoices = await PurchaseOrderInvoice.findAll({
//     //       where: { po_number: po.po_number },
//     //       attributes: [
//     //         "po_number",
//     //         "payment_amount",
//     //         "total_amount",
//     //         "base_amount",
//     //         "cgst",
//     //         "sgst",
//     //         "igst",
//     //         "gst_amount"
//     //       ],
//     //       raw: true,
//     //     });

//     //     for (const inv of poInvoices) {
//     //       worksheet.addRow([
//     //         inv.po_number,
//     //         inv.payment_amount,
//     //         inv.total_amount,
//     //         inv.base_amount,
//     //         inv.cgst,
//     //         inv.sgst,
//     //         inv.igst,
//     //         inv.gst_amount
//     //       ]);
//     //       branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
//     //     }
//     //   }
//     // }

//     // ============================
//     // Employee salary section
//     // ============================
//     worksheet.addRow([]);
//     worksheet.addRow([
//       "S.No", "Employee Name", "Department", "Designation",
//       "Basic Salary", "Allowance", "Commission", "Present Days",
//       "Absent Days", "Total Attendance", "Overtime Days", "Overtime Amount",
//       "Other Payments", "Total Additions", "Loan", "Saturation Deduction",
//       "Advance", "Total Deductions", "Gross Salary", "Net Payable"
//     ]);
//     worksheet.getRow(worksheet.lastRow.number).font = { bold: true };
    
//         let totalNet = 0;
// for (let i = 0; i < employees.length; i++) {
//   const emp = employees[i].toJSON();
//   const empId = emp.employee_id || emp.id;
//   const employeeID = emp.id;

//   const [
//     allowances,
//     commissions,
//     otherPayments,
//     loans,
//     deductions,
//     overtimeRecords,
//     advances,
//     attendanceRecords
//   ] = await Promise.all([
//     Allowance.findAll({ where: { employee_id: empId }, raw: true }),
//     Commission.findAll({ where: { employee_id: employeeID }, raw: true }),
//     OtherPayment.findAll({ where: { employee_id: empId }, raw: true }),
//     Loan.findAll({ where: { employee_id: empId }, raw: true }),
//     SaturationDeduction.findAll({ where: { employee_id: empId }, raw: true }),
//     Overtime.findAll({
//       where: { employee_id: empId, date: { [Op.between]: [monthStart, monthEnd] } },
//       raw: true,
//     }),
//     ExpenseNew.findAll({
//       where: {
//         employee_id: empId,
//         payment_date: { [Op.between]: [monthStart, monthEnd] },
//         is_deleted: false,
//       },
//       raw: true,
//     }),
//     AttendanceEmployee.findAll({
//       where: {
//         employee_id: empId,
//         date: { [Op.between]: [monthStart, monthEnd] },
//       },
//       raw: true,
//     }),
//   ]);

//   // ===== Attendance Summary =====
//   const presentDays = attendanceRecords.filter(a => a.status === "Present").length;
//   const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
//   const leaveDays = attendanceRecords.filter(a => a.status === "Leave").length;
//   const halfDays = attendanceRecords.filter(a => a.status === "Half Day").length;
//   const totalAttendance = presentDays + halfDays * 0.5;

//   // ===== Month-wise per-day salary =====
//   const daysInMonth = dayjs().daysInMonth(); // total days in current month
//   const perDaySalary = (parseFloat(emp.salary || 0)) / daysInMonth;

//   // ===== Absent deduction =====
//   const absentDeduction = perDaySalary * absentDays;

//   // ===== Allowance Calculation =====
//   let allowanceTotal = 0;
//   for (const al of allowances) {
//     const amount = parseFloat(al.amount || 0);
//     const type = (al.type || '').toLowerCase();
//     if (type === 'fixed') {
//       allowanceTotal += amount;
//     } else if (type === 'percentage') {
//       allowanceTotal += (parseFloat(emp.salary || 0) * amount) / 100;
//     }
//   }

//   // ===== Saturation Deduction Calculation =====
//   let saturationTotal = 0;
//   for (const ded of deductions) {
//     const amount = parseFloat(ded.amount || 0);
//     const type = (ded.type || '').toLowerCase();
//     if (type === 'fixed') {
//       saturationTotal += amount;
//     } else if (type === 'percentage') {
//       saturationTotal += (parseFloat(emp.salary || 0) * amount) / 100;
//     } else {
//       saturationTotal += amount;
//     }
//   }

//   const sum = (arr, key) => arr.reduce((acc, r) => acc + parseFloat(r[key] || 0), 0);

//   const commissionTotal = sum(commissions, "amount");
//   const otherPaymentTotal = sum(otherPayments, "amount");

//   // ===== OT Calculation month-wise =====
//   overtimeRecords.forEach(ot => {
//     ot.ot_amount = perDaySalary * ot.number_of_days;
//   });
//   const overtimeDays = sum(overtimeRecords, "number_of_days");
//   const overtimeAmount = sum(overtimeRecords, "ot_amount");

//   // ===== Loan Calculation =====
//   let loanTotal = 0;
//   for (const loan of loans) {
//     const amount = parseFloat(loan.amount || 0);
//     const type = (loan.type || '').trim().toLowerCase();

//     switch (type) {
//       case 'fixed':
//         loanTotal += amount;
//         break;

//       case 'percentage':
//         loanTotal += (parseFloat(emp.salary || 0) * amount) / 100;
//         break;

//       case 'enter amount':
//         loanTotal += amount;
//         break;

//       default:
//         loanTotal += amount;
//         break;
//     }
//   }

//   // ===== Advance Calculation =====
//   const advanceTotal = sum(advances, "total_amount");

//   // ===== Total Additions and Deductions =====
//   const totalAdditions = allowanceTotal + commissionTotal + otherPaymentTotal + overtimeAmount;
//   const totalDeductions = loanTotal + saturationTotal + advanceTotal + absentDeduction;

//   const grossSalary = Number(emp.salary || 0) + totalAdditions;
//   const netPayable = grossSalary - totalDeductions;
// //   totalNet += netPayable;

//       // Add to branch summary
// if (branchNetPayMap[emp.branch_id]) branchNetPayMap[emp.branch_id].totalNetPayable += netPayable;

//   worksheet.addRow([
//     i + 1,
//     emp.name || "",
//     emp.department?.name || "",
//     emp.designation?.name || "",
//     Number(emp.salary || 0),
//     allowanceTotal,
//     commissionTotal,
//     presentDays,
//     absentDays,
//     totalAttendance,
//     overtimeDays,
//     overtimeAmount,
//     otherPaymentTotal,
//     totalAdditions,
//     loanTotal,
//     saturationTotal,
//     advanceTotal,
//     totalDeductions,
//     grossSalary,
//     netPayable,
//   ]);
// }


//     worksheet.addRow([]);
//     worksheet.addRow(["Branch Summary"]);
//     worksheet.getRow(worksheet.lastRow.number).font = { bold: true, size: 13 };
//     worksheet.addRow(["Branch Name", "Total Net Payable", "Total Received (WO+PO)", "Profit / Loss"]);
//     worksheet.getRow(worksheet.lastRow.number).font = { bold: true };

  
    
//     for (const branchId of Object.keys(branchNetPayMap)) {
//   const data = branchNetPayMap[branchId];

//   // 🧮 Calculate profit/loss value and type
//   let profitLossValue = data.totalReceived - data.totalNetPayable;
//   let profitLossType;

//   if (data.totalNetPayable < 0) {
//     profitLossType = "Loss";
//     profitLossValue = Math.abs(profitLossValue);
//   } else if (profitLossValue >= 0) {
//     profitLossType = "Profit";
//   } else {
//     profitLossType = "Loss";
//     profitLossValue = Math.abs(profitLossValue);
//   }

//   // 🧾 Add row to Excel (force text formatting for last cell)
//   const row = worksheet.addRow([
//     data.branchName,
//     data.totalNetPayable,
//     data.totalReceived,
//     `${profitLossValue.toFixed(2)} (${profitLossType})`
//   ]);

//   // 🎨 Apply color coding: green for Profit, red for Loss
//   if (profitLossType === "Profit") {
//     row.getCell(4).font = { color: { argb: "FF008000" }, bold: true }; // green
//   } else {
//     row.getCell(4).font = { color: { argb: "FFFF0000" }, bold: true }; // red
//   }

//   // ✨ Ensure Excel treats cell as text (so “(Profit)” / “(Loss)” stays visible)
//   row.getCell(4).numFmt = "@";
//   row.getCell(4).alignment = { horizontal: "center" };
// }




//     worksheet.columns = Array(24).fill({ width: 15 });

//     const fileName = `bank_payment_sheet_${Date.now()}.xlsx`;
//     const filePath = path.join(folderPath, fileName);
//     await workbook.xlsx.writeFile(filePath);

//     return res.json({
//       success: true,
//       count: employees.length,
//       month: `${dayjs().format("MMMM YYYY")}`,
//       downloadUrl: `/excel/${fileName}`,
//       message: "✅ Bank payment sheet generated successfully (WO/PO + Employee Salary + Branch Summary)",
//     });

//   } catch (err) {
//     console.error("❌ Error getAllEmployeesSummary:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

// ============================
// 🧮 Main Function
// ============================
exports.getAllEmployeesSummary = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const companyId = await getCompanyId(req);
    const allowedUserIds = await getAllowedUserIds(req);
    let employees;

    // 🧩 Employee visibility
    if (isSuper(req)) {
      employees = await Employee.findAll({
        where: { deleted_at: null, is_active: true },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    } else if (isEmployee(req)) {
      const emp = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null, is_active: true },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
      });
      employees = emp ? [emp] : [];
    } else {
      employees = await Employee.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null,
          is_active: true
        },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    }

    // ============================
    // 🗓 Day/Month/Year filter logic
    // ============================
    const { date, month, year } = req.query;
    let startDate, endDate, reportType;

    if (date) {
      startDate = dayjs(date, "DD-MM-YYYY").format("YYYY-MM-DD");
      endDate = startDate;
      reportType = "day";
    } else if (month) {
      const [m, y] = month.split("-");
      startDate = dayjs(`${y}-${m}-01`).startOf("month").format("YYYY-MM-DD");
      endDate = dayjs(`${y}-${m}-01`).endOf("month").format("YYYY-MM-DD");
      reportType = "month";
    } else if (year) {
      startDate = dayjs(`${year}-01-01`).startOf("year").format("YYYY-MM-DD");
      endDate = dayjs(`${year}-12-31`).endOf("year").format("YYYY-MM-DD");
      reportType = "year";
    } else {
      startDate = dayjs().startOf("month").format("YYYY-MM-DD");
      endDate = dayjs().endOf("month").format("YYYY-MM-DD");
      reportType = "month";
    }

    // ============================
    // 🧾 Excel setup
    // ============================
    const folderPath = path.join(__dirname, "..", "excel");
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bank Payment");

    worksheet.mergeCells("A1:Z1");
    worksheet.getCell("A1").value = `Bank Payment Sheet - ${reportType === 'day' ? dayjs(startDate).format("DD MMM YYYY (dddd)") : reportType === 'month' ? dayjs(startDate).format("MMMM YYYY") : year}`;
    worksheet.getCell("A1").alignment = { horizontal: "center" };
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.addRow([]);

    // ============================
    // 💡 WO/PO Section
    // ============================
    worksheet.addRow(["Contract Period", "Invoice Raised", "Tax", "", "", "Total", "Payment Received"]);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true };
    worksheet.mergeCells(`C${worksheet.lastRow.number}:E${worksheet.lastRow.number}`);
    worksheet.addRow(["PO/WO No", "Basic", "CGST", "SGST", "IGST", "GST Amount", "Total Amount"]);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true };
    worksheet.getRow(worksheet.lastRow.number).alignment = { horizontal: "center" };

    // ============================
    // 🏗 WO/PO Data Rows
    // ============================
    const branches = [...new Set(employees.map(e => e.branch_id))];
    const branchNetPayMap = {};

    for (const branchId of branches) {
      if (!branchNetPayMap[branchId]) {
        branchNetPayMap[branchId] = {
          totalNetPayable: 0,
          totalReceived: 0,
          branchName: employees.find(e => e.branch_id === branchId)?.branch?.name || "N/A"
        };
      }

      // Work Orders
      const workOrders = await WorkOrder.findAll({
        where: { assigned_to: branchId, status: { [Op.ne]: "Cancelled" } },
        attributes: ["wo_number"],
        raw: true,
      });

      for (const wo of workOrders) {
        const invoices = await WorkOrderInvoice.findAll({
          where: { wo_number: wo.wo_number, status: 'Paid', created_at: { [Op.between]: [startDate, endDate] } },
          attributes: ["wo_number","base_amount","cgst","sgst","igst","gst_amount","total_amount","payment_amount"],
          raw: true,
        });

        for (const inv of invoices) {
          worksheet.addRow([
            inv.wo_number,
            inv.base_amount || 0,
            inv.cgst || 0,
            inv.sgst || 0,
            inv.igst || 0,
            inv.gst_amount || 0,
            inv.total_amount || 0,
          ]);
          branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
        }
      }

      // Purchase Orders
      const purchaseOrders = await PurchaseOrder.findAll({ where: { branch_id: branchId }, attributes: ["po_number"], raw: true });
      for (const po of purchaseOrders) {
        const poInvoices = await PurchaseOrderInvoice.findAll({
          where: { po_number: po.po_number, status: 'Paid', created_at: { [Op.between]: [startDate, endDate] } },
          attributes: ["po_number","base_amount","cgst","sgst","igst","gst_amount","total_amount","payment_amount"],
          raw: true,
        });
        for (const inv of poInvoices) {
          worksheet.addRow([
            inv.po_number,
            inv.base_amount || 0,
            inv.cgst || 0,
            inv.sgst || 0,
            inv.igst || 0,
            inv.gst_amount || 0,
            inv.total_amount || 0,
          ]);
          branchNetPayMap[branchId].totalReceived += parseFloat(inv.total_amount || 0);
        }
      }
    }

    // ============================
    // 🧾 Employee Salary Section
    // ============================
    worksheet.addRow([]);
    worksheet.addRow(["S.No","Employee Name","Department","Designation","Basic Salary","Allowance","Commission","Present Days","Absent Days","Total Attendance","Overtime Days","Overtime Amount","Other Payments","Total Additions","Loan","Saturation Deduction","Advance","Total Deductions","Gross Salary","Net Payable"]);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true };

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i].toJSON();
      const empId = emp.employee_id || emp.id;
      const employeeID = emp.id;

      const [
        allowances, commissions, otherPayments, loans, deductions,
        overtimeRecords, advances, attendanceRecords
      ] = await Promise.all([
        Allowance.findAll({ where: { employee_id: empId }, raw: true }),
        Commission.findAll({ where: { employee_id: employeeID }, raw: true }),
        OtherPayment.findAll({ where: { employee_id: empId }, raw: true }),
        Loan.findAll({ where: { employee_id: empId }, raw: true }),
        SaturationDeduction.findAll({ where: { employee_id: empId }, raw: true }),
        Overtime.findAll({ where: { employee_id: empId, date: { [Op.between]: [startDate, endDate] } }, raw: true }),
        ExpenseNew.findAll({ where: { employee_id: empId, payment_date: { [Op.between]: [startDate, endDate] }, is_deleted: false }, raw: true }),
        AttendanceEmployee.findAll({ where: { employee_id: empId, date: { [Op.between]: [startDate, endDate] } }, raw: true }),
      ]);

      // --- Attendance Summary ---
      const presentDays = attendanceRecords.filter(a => a.status === "Present").length;
      const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
      const halfDays = attendanceRecords.filter(a => a.status === "Half Day").length;
      const totalAttendance = presentDays + halfDays * 0.5;

      const daysInPeriod = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
      const perDaySalary = (parseFloat(emp.salary || 0)) / daysInPeriod;
      const absentDeduction = perDaySalary * absentDays;

      let allowanceTotal = 0;
      for (const al of allowances) {
        const amount = parseFloat(al.amount || 0);
        const type = (al.type || '').toLowerCase();
        if (type === 'fixed') allowanceTotal += amount;
        else if (type === 'percentage') allowanceTotal += (parseFloat(emp.salary || 0) * amount) / 100;
      }

      let saturationTotal = 0;
      for (const ded of deductions) {
        const amount = parseFloat(ded.amount || 0);
        const type = (ded.type || '').toLowerCase();
        if (type === 'fixed') saturationTotal += amount;
        else if (type === 'percentage') saturationTotal += (parseFloat(emp.salary || 0) * amount) / 100;
        else saturationTotal += amount;
      }

      const sum = (arr, key) => arr.reduce((acc, r) => acc + parseFloat(r[key] || 0), 0);
      const commissionTotal = sum(commissions, "amount");
      const otherPaymentTotal = sum(otherPayments, "amount");

      overtimeRecords.forEach(ot => { ot.ot_amount = perDaySalary * ot.number_of_days; });
      const overtimeDays = sum(overtimeRecords, "number_of_days");
      const overtimeAmount = sum(overtimeRecords, "ot_amount");

      let loanTotal = 0;
      for (const loan of loans) {
        const amount = parseFloat(loan.amount || 0);
        const type = (loan.type || '').trim().toLowerCase();
        if (type === 'fixed' || type === 'enter amount') loanTotal += amount;
        else if (type === 'percentage') loanTotal += (parseFloat(emp.salary || 0) * amount) / 100;
      }

      const advanceTotal = sum(advances, "total_amount");
      const totalAdditions = allowanceTotal + commissionTotal + otherPaymentTotal + overtimeAmount;
      const totalDeductions = loanTotal + saturationTotal + advanceTotal + absentDeduction;
      const grossSalary = Number(emp.salary || 0) + totalAdditions;
      const netPayable = grossSalary - totalDeductions;

      if (branchNetPayMap[emp.branch_id]) branchNetPayMap[emp.branch_id].totalNetPayable += netPayable;

      worksheet.addRow([
        i + 1,
        emp.name || "",
        emp.department?.name || "",
        emp.designation?.name || "",
        Number(emp.salary || 0),
        allowanceTotal,
        commissionTotal,
        presentDays,
        absentDays,
        totalAttendance,
        overtimeDays,
        overtimeAmount,
        otherPaymentTotal,
        totalAdditions,
        loanTotal,
        saturationTotal,
        advanceTotal,
        totalDeductions,
        grossSalary,
        netPayable,
      ]);
    }

    // ============================
    // 🏦 Branch Summary
    // ============================
    worksheet.addRow([]);
    worksheet.addRow(["Branch Summary"]);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true, size: 13 };
    worksheet.addRow(["Branch Name", "Total Net Payable", "Total Received (WO+PO)", "Profit / Loss"]);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true };

    for (const branchId of Object.keys(branchNetPayMap)) {
      const data = branchNetPayMap[branchId];
      let profitLossValue = data.totalReceived - data.totalNetPayable;
      let profitLossType = profitLossValue >= 0 ? "Profit" : "Loss";
      profitLossValue = Math.abs(profitLossValue);

      const row = worksheet.addRow([
        data.branchName,
        data.totalNetPayable,
        data.totalReceived,
        `${profitLossType}: ${profitLossValue}`
      ]);

      row.eachCell((cell, colNumber) => { if (colNumber === 4) cell.font = { bold: true }; });
    }

    // ============================
    // 📝 Save Excel
    // ============================
    const fileName = `BankPayment_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
    const filePath = path.join(folderPath, fileName);
    await workbook.xlsx.writeFile(filePath);

    return res.json({ success: true, file: `/excel/${fileName}` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};




exports.getAllEmployeesSalary = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const companyId = await getCompanyId(req);
    let employees;

    // ============================
    // 🧩 Role-Based Visibility
    // ============================
    if (isSuper(req)) {
      employees = await Employee.findAll({
        where: { deleted_at: null, is_active: true },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    } else if (isEmployee(req)) {
      const emp = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null, is_active: true },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
      });
      employees = emp ? [emp] : [];
    } else if ((req.user?.type || "").toLowerCase() === "company") {
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      employees = await Employee.findAll({
        where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null, is_active: true },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    } else {
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId)
        return res.status(403).json({ success: false, message: "No branch assigned" });

      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      employees = await Employee.findAll({
        where: {
          branch_id: branchId,
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null,
          is_active: true,
        },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    }

    // ============================
    // 🧾 Salary Summary
    // ============================
    const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
    const monthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

    const salarySummary = [];
    let totalNet = 0;

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i].toJSON();
      const empId = emp.employee_id || emp.id;
      const employeeID = emp.id;

      const [
        allowances,
        commissions,
        otherPayments,
        loans,
        deductions,
        overtimeRecords,
        advances,
        attendanceRecords
      ] = await Promise.all([
        Allowance.findAll({ where: { employee_id: empId }, raw: true }),
        Commission.findAll({ where: { employee_id: employeeID }, raw: true }),
        OtherPayment.findAll({ where: { employee_id: empId }, raw: true }),
        Loan.findAll({ where: { employee_id: empId }, raw: true }),
        SaturationDeduction.findAll({ where: { employee_id: empId }, raw: true }),
        Overtime.findAll({
          where: { employee_id: empId, date: { [Op.between]: [monthStart, monthEnd] } },
          raw: true,
        }),
        ExpenseNew.findAll({
          where: {
            employee_id: empId,
            payment_date: { [Op.between]: [monthStart, monthEnd] },
            is_deleted: false,
          },
          raw: true,
        }),
        AttendanceEmployee.findAll({
          where: {
            employee_id: empId,
            date: { [Op.between]: [monthStart, monthEnd] },
          },
          raw: true,
        }),
      ]);

      // ===== Attendance =====
      const presentDays = attendanceRecords.filter(a => a.status === "Present").length;
      const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
      const leaveDays = attendanceRecords.filter(a => a.status === "Leave").length;
      const halfDays = attendanceRecords.filter(a => a.status === "Half Day").length;
      const totalAttendance = presentDays + halfDays * 0.5;

      // ===== Salary & Per Day =====
      const daysInMonth = dayjs().daysInMonth();
      const perDaySalary = (parseFloat(emp.salary || 0)) / daysInMonth;
      const absentDeduction = perDaySalary * absentDays;

      // ===== Allowance =====
      let allowanceTotal = 0;
      for (const al of allowances) {
        const amount = parseFloat(al.amount || 0);
        const type = (al.type || '').toLowerCase();
        if (type === 'fixed') allowanceTotal += amount;
        else if (type === 'percentage') allowanceTotal += (parseFloat(emp.salary || 0) * amount) / 100;
      }

      // ===== Deductions =====
      let saturationTotal = 0;
      for (const ded of deductions) {
        const amount = parseFloat(ded.amount || 0);
        const type = (ded.type || '').toLowerCase();
        if (type === 'fixed') saturationTotal += amount;
        else if (type === 'percentage') saturationTotal += (parseFloat(emp.salary || 0) * amount) / 100;
        else saturationTotal += amount;
      }

      const sum = (arr, key) => arr.reduce((acc, r) => acc + parseFloat(r[key] || 0), 0);

      const commissionTotal = sum(commissions, "amount");
      const otherPaymentTotal = sum(otherPayments, "amount");

      // ===== Overtime =====
      overtimeRecords.forEach(ot => {
        ot.ot_amount = perDaySalary * ot.number_of_days;
      });
      const overtimeDays = sum(overtimeRecords, "number_of_days");
      const overtimeAmount = sum(overtimeRecords, "ot_amount");

      // ===== Loan =====
      let loanTotal = 0;
      for (const loan of loans) {
        const amount = parseFloat(loan.amount || 0);
        const type = (loan.type || '').trim().toLowerCase();
        switch (type) {
          case 'fixed':
            loanTotal += amount; break;
          case 'percentage':
            loanTotal += (parseFloat(emp.salary || 0) * amount) / 100; break;
          case 'enter amount':
            loanTotal += amount; break;
          default:
            loanTotal += amount; break;
        }
      }

      // ===== Advance =====
      const advanceTotal = sum(advances, "total_amount");

      // ===== Totals =====
      const totalAdditions = allowanceTotal + commissionTotal + otherPaymentTotal + overtimeAmount;
      const totalDeductions = loanTotal + saturationTotal + advanceTotal + absentDeduction;
      const grossSalary = Number(emp.salary || 0) + totalAdditions;
      const netPayable = grossSalary - totalDeductions;
      totalNet += netPayable;

      // ===== Final JSON Row =====
      salarySummary.push({
        id: emp.id,
        name: emp.name || "",
        department: emp.department?.name || "",
        designation: emp.designation?.name || "",
        basicSalary: Number(emp.salary || 0),
        allowance: allowanceTotal,
        commission: commissionTotal,
        presentDays,
        absentDays,
        leaveDays,
        halfDays,
        totalAttendance,
        overtimeDays,
        overtimeAmount,
        otherPayments: otherPaymentTotal,
        totalAdditions,
        loan: loanTotal,
        saturationDeduction: saturationTotal,
        advance: advanceTotal,
        absentDeduction,
        totalDeductions,
        grossSalary,
        netPayable,
      });
    }

    // ✅ JSON Response
    return res.json({
      success: true,
      month: dayjs().format("MMMM YYYY"),
      count: employees.length,
      totalNetPay: totalNet,
      employees: salarySummary,
    });

  } catch (err) {
    console.error("❌ Error getAllEmployeesSummary:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
