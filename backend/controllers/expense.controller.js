// const { Op } = require("sequelize");
// const path = require("path");
// const Expense = require("../models/expense.model");
// const ExpenseItem = require("../models/expenseItem.model");
// const BranchWallet = require("../models/branchWallet.model");
// const Branch = require("../models/branch.model");
// const Employee = require("../models/employee.model");
// const User = require("../models/user.model");

// const ExcelJS = require("exceljs");
// const fs = require("fs");


// // -------------------- Helpers --------------------
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//       raw: true,
//     });
//     if (emp?.created_by) return emp.created_by;
//   } catch (err) {
//     console.error("getCompanyId Employee lookup failed:", err.message);
//   }

//   return req.user.id;
// }

// function hasPermission(req, perm) {
//   if (!req.user) return false;
//   const type = (req.user.type || "").toLowerCase();
//   if (["company", "admin", "super admin", "branch manager"].includes(type)) return true;
//   const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
//   return perms.some(p => (p?.toLowerCase?.() || "").trim() === perm.toLowerCase());
// }

// // ================================
// // CREATE EXPENSE
// // ================================
// exports.createExpense = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id)
//       return res.status(401).json({ success: false, message: "Unauthorized: user not found" });

//     if (!req.body) return res.status(400).json({ success: false, message: "Form-data not received" });

//     const userId = req.user.id;
//     const userName = req.user.name;
//     const userType = (req.user.type || "").toLowerCase();

//     let { branch_id, description } = req.body;
//     description = description || null;

//     // 🔹 Employees / Branch Managers: branch auto-pick
//     if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ["branch_id"],
//         raw: true,
//       });
//       if (!emp) return res.status(404).json({ success: false, message: "Employee record not found" });
//       branch_id = emp.branch_id;
//     }

//     // 🔹 Companies: must provide branch_id
//     if (userType === "company" && !branch_id) {
//       return res.status(400).json({ success: false, message: "branch_id is required for company" });
//     }

//     // 🔹 Validate branch
//     const branch = await Branch.findOne({ where: { id: branch_id } });
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // 🔹 RBAC check
//     if (userType === "company") {
//       if (branch.created_by !== userId) {
//         return res.status(403).json({ success: false, message: "This branch does not belong to your company" });
//       }
//     } else if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(branch_id)) {
//         return res.status(403).json({ success: false, message: "Not authorized for this branch" });
//       }
//     }
//     // super admin → no restriction

//     // 🔹 Parse items
//     let items;
//     try {
//       items = typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items;
//     } catch (err) {
//       return res.status(400).json({ success: false, message: "Invalid items format (must be JSON)" });
//     }

//     if (!branch_id || !items || items.length === 0)
//       return res.status(400).json({ success: false, message: "branch_id and items are required" });

//     let subtotal = 0, tax_total = 0, total_amount = 0;

//     // Create main expense
//     const expense = await Expense.create({
//       branch_id,
//       payment_date: new Date(),
//       subtotal: 0,
//       tax_total: 0,
//       total_amount: 0,
//       payments_status: "paid",
//       created_by: userId,
//       description
//     });

//     // Create items
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const base = item.quantity * item.price;
//       const tax = item.is_gst_applicable ? (base * item.gst_rate / 100) : 0;

//       subtotal += base;
//       tax_total += tax;
//       total_amount += base + tax;

//       let document_url = item.document_url || null;
//       if (req.files && req.files[`item_${i}`]) {
//         document_url = path.join("uploads", req.files[`item_${i}`][0].filename);
//       }

//       await ExpenseItem.create({
//         expense_id: expense.id,
//         quantity: item.quantity,
//         price: item.price,
//         is_gst_applicable: item.is_gst_applicable,
//         gst_rate: item.gst_rate,
//         gst_amount: tax,
//         line_total: base + tax,
//         document_url
//       });
//     }

//     // Update totals
//     await expense.update({ subtotal, tax_total, total_amount });

//     // Branch wallet update
//     const lastWallet = await BranchWallet.findOne({
//       where: { branch_id },
//       order: [["created_at", "DESC"]]
//     });

//     const balanceBefore = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
//     const balanceAfter = balanceBefore - total_amount;

//     await BranchWallet.create({
//       branch_id,
//       name: `Expense #${expense.id}`,
//       transaction_type: "debit",
//       amount: total_amount,
//       description: description || "Expense Deduction",
//       balance_after: balanceAfter,
//       created_by: userId
//     });

//     res.status(201).json({
//       success: true,
//       message: "Expense created with role-based access",
//       data: { expense_id: expense.id, subtotal, tax_total, total_amount, balanceBefore, balanceAfter, created_by: userName }
//     });

//   } catch (err) {
//     console.error("Expense creation failed:", err);
//     res.status(500).json({ success: false, message: "Failed to create expense", error: err.message });
//   }
// };





// // ================================
// // GET ALL EXPENSES (role-based)
// // ================================
// exports.getAllExpenses = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();

//     let branchIds = [];

//     if (userType === "company") {
//       // Get all branches created by this company
//       const branches = await Branch.findAll({ where: { created_by: userId }, attributes: ["id"] });
//       branchIds = branches.map(b => b.id);
//     } else if (userType === "branch manager" || userType === "employee") {
//       // Get branch assigned to employee
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp) return res.status(403).json({ success: false, message: "Employee record not found" });
//       branchIds = [emp.branch_id];
//     } else if (userType === "super admin") {
//       // Super admin → all expenses
//       const branches = await Branch.findAll({ attributes: ["id"] });
//       branchIds = branches.map(b => b.id);
//     }

//     if (branchIds.length === 0) {
//       return res.status(403).json({ success: false, message: "No branches authorized" });
//     }

//     const expenses = await Expense.findAll({
//       where: { branch_id: { [Op.in]: branchIds }, is_deleted: false },
//       include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
//       order: [["created_at", "DESC"]]
//     });

//     res.status(200).json({ success: true, data: expenses });
//   } catch (err) {
//     console.error("getAllExpenses failed:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch expenses", error: err.message });
//   }
// };


// // ================================
// // GET EXPENSES BY BRANCH (role-based)
// // ================================
// exports.getExpensesByBranch = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();
//     const branch_id = req.params.branch_id;

//     const branch = await Branch.findOne({ where: { id: branch_id } });
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     if (userType === "company" && branch.created_by !== userId) {
//       return res.status(403).json({ success: false, message: "Not authorized for this branch" });
//     }

//     if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(branch_id)) {
//         return res.status(403).json({ success: false, message: "Not authorized for this branch" });
//       }
//     }

//     // super admin → no restriction

//     const expenses = await Expense.findAll({
//       where: { branch_id, is_deleted: false },
//       include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
//       order: [["created_at", "DESC"]]
//     });

//     res.status(200).json({ success: true, data: expenses });
//   } catch (err) {
//     console.error("getExpensesByBranch failed:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch expenses", error: err.message });
//   }
// };


// // ================================
// // UPDATE EXPENSE (role-based)
// // ================================
// exports.updateExpense = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();
//     const expenseId = req.params.id;

//     const expense = await Expense.findOne({
//       where: { id: expenseId, is_deleted: false },
//       include: [{ model: Branch }]
//     });

//     if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

//     // Role-based access
//     if (userType === "company" && expense.Branch.created_by !== userId) {
//       return res.status(403).json({ success: false, message: "Not authorized for this expense" });
//     }
//     if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(expense.branch_id)) {
//         return res.status(403).json({ success: false, message: "Not authorized for this branch" });
//       }
//     }
//     // super admin → allowed

//     // Update expense fields
//     const description = req.body.description || expense.description;
//     const payments_status = req.body.payments_status || expense.payments_status;
//     await expense.update({ description, payments_status });

//     // Update items if provided
//     if (req.body.items) {
//       let items;
//       try {
//         items = typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items;
//       } catch (err) {
//         return res.status(400).json({ success: false, message: "Invalid items format" });
//       }

//       for (let i = 0; i < items.length; i++) {
//         const item = items[i];
//         let document_url = item.document_url || null;
//         if (req.files && req.files[`item_${i}`]) {
//           document_url = path.join("uploads", req.files[`item_${i}`][0].filename);
//         }

//         await ExpenseItem.update(
//           {
//             quantity: item.quantity,
//             price: item.price,
//             is_gst_applicable: item.is_gst_applicable,
//             gst_rate: item.gst_rate,
//             line_total: item.quantity * item.price + (item.is_gst_applicable ? (item.quantity * item.price * item.gst_rate / 100) : 0),
//             document_url
//           },
//           { where: { id: item.id, expense_id: expense.id } }
//         );
//       }
//     }

//     res.status(200).json({ success: true, message: "Expense updated", data: expense });
//   } catch (err) {
//     console.error("updateExpense failed:", err);
//     res.status(500).json({ success: false, message: "Failed to update expense", error: err.message });
//   }
// };


// // ================================
// // SOFT DELETE EXPENSE (role-based)
// // ================================
// exports.softDeleteExpense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();
//     const expenseId = req.params.id;

//     const expense = await Expense.findOne({
//       where: { id: expenseId, is_deleted: false },
//       include: [{ model: Branch }]
//     });

//     if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

//     if (userType === "company" && expense.Branch.created_by !== userId) {
//       return res.status(403).json({ success: false, message: "Not authorized to delete this expense" });
//     }
//     if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(expense.branch_id)) {
//         return res.status(403).json({ success: false, message: "Not authorized to delete this branch expense" });
//       }
//     }
//     // super admin → allowed

//     await expense.update({ is_deleted: true });

//     res.status(200).json({ success: true, message: "Expense soft-deleted" });
//   } catch (err) {
//     console.error("softDeleteExpense failed:", err);
//     res.status(500).json({ success: false, message: "Failed to delete expense", error: err.message });
//   }
// };







// // ================================
// // EMPLOYEE ADVANCE PAYMENT (using employee_id, not id)
// // ================================
// exports.employeeAdvancePayment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userName = req.user.name;

//     const { branch_id, employee_id, advance_amount, description } = req.body;

//     if (!branch_id || !employee_id || !advance_amount) {
//       return res.status(400).json({ success: false, message: "branch_id, employee_id, and advance_amount are required" });
//     }

//     // 1️⃣ Branch check
//     const branch = await Branch.findOne({ where: { id: branch_id } });
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // 2️⃣ Employee check using employee_id (business identifier)
//     const employee = await Employee.findOne({
//       where: { employee_id: employee_id, branch_id }
//     });
//     if (!employee) return res.status(404).json({ success: false, message: "Employee not found in this branch" });

//     const netSalary = parseFloat(employee.salary || 0);

//     // 3️⃣ Calculate total previous advances by matching employee_id
//     const prevAdvances = await Expense.sum("total_amount", {
//       where: {
//         branch_id,
//         description: { [Op.like]: `%Advance to ${employee.employee_id}%` }
//       }
//     });
//     const totalPrevAdvance = parseFloat(prevAdvances || 0);

//     const balanceBefore = netSalary - totalPrevAdvance;
//     if (advance_amount > balanceBefore) {
//       return res.status(400).json({ success: false, message: "Advance amount cannot exceed employee salary balance" });
//     }

//     const balanceAfter = balanceBefore - advance_amount;

//     // 4️⃣ Create main expense
//     const expense = await Expense.create({
//       branch_id,
//       payment_date: new Date(),
//       subtotal: 0,
//       tax_total: 0,
//       total_amount: advance_amount,
//       payments_status: "paid",
//       created_by: userId,
//       description: description
//         ? `${description} | Advance to ${employee.employee_id} (${employee.name})`
//         : `Advance to ${employee.employee_id} (${employee.name})`
//     });

//     // 5️⃣ Update branch wallet
//     const lastWallet = await BranchWallet.findOne({
//       where: { branch_id },
//       order: [["created_at", "DESC"]]
//     });

//     const branchBalanceBefore = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
//     const branchBalanceAfter = branchBalanceBefore - advance_amount;

//     await BranchWallet.create({
//       branch_id,
//       name: `Advance Expense #${expense.id} - ${employee.employee_id}`,
//       transaction_type: "debit",
//       amount: advance_amount,
//       description: `Advance Payment to ${employee.employee_id} (${employee.name})`,
//       balance_after: branchBalanceAfter,
//       created_by: userId
//     });

//     res.status(201).json({
//       success: true,
//       message: "Employee advance payment recorded",
//       data: {
//         expense_id: expense.id,
//         employee_id: employee.employee_id,
//         employee_name: employee.name,
//         advanceAmount: advance_amount,
//         balanceBefore,
//         balanceAfter,
//         branchBalanceBefore,
//         branchBalanceAfter,
//         created_by: userName
//       }
//     });
//   } catch (err) {
//     console.error("Employee advance payment failed:", err);
//     res.status(500).json({ success: false, message: "Failed to record advance payment", error: err.message });
//   }
// };

// // ================================
// // GENERATE EXPENSE REPORT (branch-wise)
// // ================================
// // exports.generateExpenseReport = async (req, res) => {
// //   try {
// //     const { branch_id, period } = req.query;

// //     if (!branch_id || !period) {
// //       return res.status(400).json({ success: false, message: "branch_id and period are required" });
// //     }

// //     // Fetch branch details
// //     const branch = await Branch.findByPk(branch_id);
// //     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

// //     // Fetch expenses with items
// //     const expenses = await Expense.findAll({
// //       where: { branch_id, is_deleted: false },
// //       include: [
// //         { model: User, as: "creator", attributes: ["id", "name"] },
// //         { model: ExpenseItem, as: "items" }
// //       ],
// //       order: [["created_at", "ASC"]],
// //     });

// //     if (!expenses.length) {
// //       return res.status(404).json({ success: false, message: "No expenses found" });
// //     }

// //     const workbook = new ExcelJS.Workbook();
// //     const worksheet = workbook.addWorksheet("Expense Report");

// //     // Title
// //     worksheet.mergeCells("A1:F1");
// //     worksheet.getCell("A1").value = `${branch.name} Expense Report - ${period}`;
// //     worksheet.getCell("A1").font = { bold: true, size: 14 };
// //     worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

// //     // Header row
// //     const headerRow = worksheet.addRow([
// //       "Date",
// //       "Description",
// //       "Subtotal",
// //       "Tax Total",
// //       "Total Amount",
// //       "Created By",
// //     ]);
// //     headerRow.eachCell((cell) => {
// //       cell.font = { bold: true };
// //       cell.alignment = { horizontal: "center", vertical: "middle" };
// //       cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
// //     });

// //     // Column widths
// //     worksheet.getColumn(1).width = 14; // Date
// //     worksheet.getColumn(2).width = 40; // Description
// //     worksheet.getColumn(3).width = 14; // Subtotal
// //     worksheet.getColumn(4).width = 14; // Tax Total
// //     worksheet.getColumn(5).width = 16; // Total Amount
// //     worksheet.getColumn(6).width = 20; // Created By

// //     let currentMonth = null;

// //     for (const exp of expenses) {
// //       const expDate = exp.created_at ? new Date(exp.created_at) : null;
// //       if (!expDate) continue;

// //       const expMonth = expDate.toLocaleString("default", { month: "long" });
// //       if (expMonth !== currentMonth) {
// //         currentMonth = expMonth;
// //         const monthRow = worksheet.addRow([currentMonth]);
// //         monthRow.font = { bold: true };
// //         worksheet.mergeCells(`A${monthRow.number}:F${monthRow.number}`);
// //         monthRow.alignment = { horizontal: "left" };
// //       }

// //       // Subtotal: use total_amount for advance salary if subtotal is 0
// //       let subtotalValue = parseFloat(exp.subtotal || 0);
// //       if (exp.description && exp.description.toLowerCase().includes("advance to") && subtotalValue === 0) {
// //           subtotalValue = parseFloat(exp.total_amount || 0);
// //       }

// //       const dataRow = worksheet.addRow([
// //         expDate.toISOString().split("T")[0],
// //         exp.description || "",
// //         subtotalValue,
// //         parseFloat(exp.tax_total || 0),
// //         parseFloat(exp.total_amount || 0),
// //         exp.creator?.name || "System",
// //       ]);

// //       dataRow.eachCell((cell) => {
// //         cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
// //         cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
// //       });
// //     }

// //     const fileDir = path.join(__dirname, "../public/reports");
// //     fs.mkdirSync(fileDir, { recursive: true });
// //     const fileName = `expense_${branch_id}_${period}_${Date.now()}.xlsx`;
// //     const filePath = path.join(fileDir, fileName);
// //     await workbook.xlsx.writeFile(filePath);

// //     return res.json({ success: true, message: "Expense report generated", downloadUrl: `/reports/${fileName}` });
// //   } catch (error) {
// //     console.error("Error generating expense report:", error);
// //     return res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };


// exports.generateExpenseReport = async (req, res) => {
//   try {
//     const { branch_id, period } = req.query;

//     if (!branch_id || !period) {
//       return res.status(400).json({ success: false, message: "branch_id and period are required" });
//     }

//     // Fetch branch details
//     const branch = await Branch.findByPk(branch_id);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // Fetch expenses with items
//     const expenses = await Expense.findAll({
//       where: { branch_id, is_deleted: false },
//       include: [{ model: ExpenseItem, as: "items" }],
//       order: [["created_at", "ASC"]],
//     });

//     if (!expenses.length) {
//       return res.status(404).json({ success: false, message: "No expenses found" });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Expense Report");

//     // Title
//     worksheet.mergeCells("A1:E1");
//     worksheet.getCell("A1").value = `${branch.name} Expense Report - ${period}`;
//     worksheet.getCell("A1").font = { bold: true, size: 14 };
//     worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

//     // Header row
//     const headerRow = worksheet.addRow([
//       "Date",
//       "Description",
//       "Subtotal",
//       "Tax Total",
//       "Total Amount",
//     ]);
//     headerRow.eachCell((cell) => {
//       cell.font = { bold: true };
//       cell.alignment = { horizontal: "center", vertical: "middle" };
//       cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
//     });

//     // Column widths
//     worksheet.getColumn(1).width = 14; // Date
//     worksheet.getColumn(2).width = 40; // Description
//     worksheet.getColumn(3).width = 14; // Subtotal
//     worksheet.getColumn(4).width = 14; // Tax Total
//     worksheet.getColumn(5).width = 16; // Total Amount

//     let currentMonth = null;

//     for (const exp of expenses) {
//       const expDate = exp.created_at ? new Date(exp.created_at) : null;
//       if (!expDate) continue;

//       const expMonth = expDate.toLocaleString("default", { month: "long" });
//       if (expMonth !== currentMonth) {
//         currentMonth = expMonth;
//         const monthRow = worksheet.addRow([currentMonth]);
//         monthRow.font = { bold: true };
//         worksheet.mergeCells(`A${monthRow.number}:E${monthRow.number}`);
//         monthRow.alignment = { horizontal: "left" };
//       }

//       // Subtotal: use total_amount for advance salary if subtotal is 0
//       let subtotalValue = parseFloat(exp.subtotal || 0);
//       if (exp.description && exp.description.toLowerCase().includes("advance to") && subtotalValue === 0) {
//         subtotalValue = parseFloat(exp.total_amount || 0);
//       }

//       const dataRow = worksheet.addRow([
//         expDate.toISOString().split("T")[0],
//         exp.description || "",
//         subtotalValue,
//         parseFloat(exp.tax_total || 0),
//         parseFloat(exp.total_amount || 0),
//       ]);

//       dataRow.eachCell((cell) => {
//         cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
//         cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
//       });
//     }

//     const fileDir = path.join(__dirname, "../public/reports");
//     fs.mkdirSync(fileDir, { recursive: true });
//     const fileName = `expense_${branch_id}_${period}_${Date.now()}.xlsx`;
//     const filePath = path.join(fileDir, fileName);
//     await workbook.xlsx.writeFile(filePath);

//     return res.json({ success: true, message: "Expense report generated", downloadUrl: `/reports/${fileName}` });
//   } catch (error) {
//     console.error("Error generating expense report:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };












const { Op } = require("sequelize");
const path = require("path");
const Expense = require("../models/expense.model");
const ExpenseItem = require("../models/expenseItem.model");
const BranchWallet = require("../models/branchWallet.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

const ExcelJS = require("exceljs");
const fs = require("fs");


// -------------------- Helpers --------------------
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
      raw: true,
    });
    if (emp?.created_by) return emp.created_by;
  } catch (err) {
    console.error("getCompanyId Employee lookup failed:", err.message);
  }

  return req.user.id;
}

function hasPermission(req, perm) {
  if (!req.user) return false;
  const type = (req.user.type || "").toLowerCase();
  if (["company", "admin", "super admin", "branch manager"].includes(type)) return true;
  const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
  return perms.some(p => (p?.toLowerCase?.() || "").trim() === perm.toLowerCase());
}

// ================================
// CREATE EXPENSE
// ================================
exports.createExpense = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ success: false, message: "Unauthorized: user not found" });

    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();

    let { branch_id, amount, tax_rate, description } = req.body;
    description = description || null;
    tax_rate = tax_rate || 0;

    // 🔹 Employees / Branch Managers → branch auto-pick
    if (userType === "branch manager" || userType === "employee") {
      const emp = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ["branch_id"],
        raw: true,
      });
      if (!emp)
        return res.status(404).json({ success: false, message: "Employee record not found" });
      branch_id = emp.branch_id;
    }

    // 🔹 Company must provide branch_id
    if (userType === "company" && !branch_id) {
      return res.status(400).json({ success: false, message: "branch_id is required for company" });
    }

    // 🔹 Validate branch
    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch)
      return res.status(404).json({ success: false, message: "Branch not found" });

    // ✅ Calculate amounts
    const grand_total = parseFloat(amount);
    const subtotal = tax_rate > 0 ? (grand_total / (1 + tax_rate / 100)) : grand_total;
    const tax_total = grand_total - subtotal;

    // 🔹 Create expense
    const expense = await Expense.create({
      branch_id,
      payment_date: new Date(),
      subtotal: subtotal.toFixed(2),
      tax_total: tax_total.toFixed(2),
      total_amount: grand_total.toFixed(2),
      payments_status: "paid",
      created_by: userId,
      description
    });

    // 🔹 Update Branch Wallet
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id },
      order: [["created_at", "DESC"]],
    });

    const balanceBefore = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
    const balanceAfter = balanceBefore - grand_total;

    await BranchWallet.create({
      branch_id,
      name: `Expense #${expense.id}`,
      transaction_type: "debit",
      amount: grand_total,
      description: description || "Expense Deduction",
      balance_after: balanceAfter,
      created_by: userId,
    });

    // ✅ Response
    res.status(201).json({
      success: true,
      data: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_rate,
        tax_total: parseFloat(tax_total.toFixed(2)),
        grand_total: parseFloat(grand_total.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("Expense creation failed:", err);
    res.status(500).json({ success: false, message: "Failed to create expense", error: err.message });
  }
};




// ================================
// GET ALL EXPENSES (role-based)
// ================================
exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();

    let branchIds = [];

    if (userType === "company") {
      // Get all branches created by this company
      const branches = await Branch.findAll({ where: { created_by: userId }, attributes: ["id"] });
      branchIds = branches.map(b => b.id);
    } else if (userType === "branch manager" || userType === "employee") {
      // Get branch assigned to employee
      const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
      if (!emp) return res.status(403).json({ success: false, message: "Employee record not found" });
      branchIds = [emp.branch_id];
    } else if (userType === "super admin") {
      // Super admin → all expenses
      const branches = await Branch.findAll({ attributes: ["id"] });
      branchIds = branches.map(b => b.id);
    }

    if (branchIds.length === 0) {
      return res.status(403).json({ success: false, message: "No branches authorized" });
    }

    const expenses = await Expense.findAll({
      where: { branch_id: { [Op.in]: branchIds }, is_deleted: false },
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]]
    });

    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("getAllExpenses failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch expenses", error: err.message });
  }
};


// ================================
// GET EXPENSES BY BRANCH (role-based)
// ================================
exports.getExpensesByBranch = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();
    const branch_id = req.params.branch_id;

    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    if (userType === "company" && branch.created_by !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized for this branch" });
    }

    if (userType === "branch manager" || userType === "employee") {
      const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
      if (!emp || Number(emp.branch_id) !== Number(branch_id)) {
        return res.status(403).json({ success: false, message: "Not authorized for this branch" });
      }
    }

    // super admin → no restriction

    const expenses = await Expense.findAll({
      where: { branch_id, is_deleted: false },
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]]
    });

    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("getExpensesByBranch failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch expenses", error: err.message });
  }
};


// ================================
// UPDATE EXPENSE (role-based)
// ================================
exports.updateExpense = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();
    const expenseId = req.params.id;

    const expense = await Expense.findOne({
      where: { id: expenseId, is_deleted: false },
      include: [{ model: Branch }]
    });

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    // Role-based access
    if (userType === "company" && expense.Branch.created_by !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized for this expense" });
    }
    if (userType === "branch manager" || userType === "employee") {
      const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
      if (!emp || Number(emp.branch_id) !== Number(expense.branch_id)) {
        return res.status(403).json({ success: false, message: "Not authorized for this branch" });
      }
    }
    // super admin → allowed

    // Update expense fields
    const description = req.body.description || expense.description;
    const payments_status = req.body.payments_status || expense.payments_status;
    await expense.update({ description, payments_status });

    // Update items if provided
    if (req.body.items) {
      let items;
      try {
        items = typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid items format" });
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let document_url = item.document_url || null;
        if (req.files && req.files[`item_${i}`]) {
          document_url = path.join("uploads", req.files[`item_${i}`][0].filename);
        }

        await ExpenseItem.update(
          {
            quantity: item.quantity,
            price: item.price,
            is_gst_applicable: item.is_gst_applicable,
            gst_rate: item.gst_rate,
            line_total: item.quantity * item.price + (item.is_gst_applicable ? (item.quantity * item.price * item.gst_rate / 100) : 0),
            document_url
          },
          { where: { id: item.id, expense_id: expense.id } }
        );
      }
    }

    res.status(200).json({ success: true, message: "Expense updated", data: expense });
  } catch (err) {
    console.error("updateExpense failed:", err);
    res.status(500).json({ success: false, message: "Failed to update expense", error: err.message });
  }
};


// ================================
// SOFT DELETE EXPENSE (role-based)
// ================================
exports.softDeleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();
    const expenseId = req.params.id;

    const expense = await Expense.findOne({
      where: { id: expenseId, is_deleted: false },
      include: [{ model: Branch }]
    });

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    if (userType === "company" && expense.Branch.created_by !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this expense" });
    }
    if (userType === "branch manager" || userType === "employee") {
      const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
      if (!emp || Number(emp.branch_id) !== Number(expense.branch_id)) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this branch expense" });
      }
    }
    // super admin → allowed

    await expense.update({ is_deleted: true });

    res.status(200).json({ success: true, message: "Expense soft-deleted" });
  } catch (err) {
    console.error("softDeleteExpense failed:", err);
    res.status(500).json({ success: false, message: "Failed to delete expense", error: err.message });
  }
};







// ================================
// EMPLOYEE ADVANCE PAYMENT (using employee_id, not id)
// ================================
exports.employeeAdvancePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;

    const { branch_id, employee_id, advance_amount, description } = req.body;

    if (!branch_id || !employee_id || !advance_amount) {
      return res.status(400).json({ success: false, message: "branch_id, employee_id, and advance_amount are required" });
    }

    // 1️⃣ Branch check
    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // 2️⃣ Employee check using employee_id (business identifier)
    const employee = await Employee.findOne({
      where: { employee_id: employee_id, branch_id }
    });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found in this branch" });

    const netSalary = parseFloat(employee.salary || 0);

    // 3️⃣ Calculate total previous advances by matching employee_id
    const prevAdvances = await Expense.sum("total_amount", {
      where: {
        branch_id,
        description: { [Op.like]: `%Advance to ${employee.employee_id}%` }
      }
    });
    const totalPrevAdvance = parseFloat(prevAdvances || 0);

    const balanceBefore = netSalary - totalPrevAdvance;
    if (advance_amount > balanceBefore) {
      return res.status(400).json({ success: false, message: "Advance amount cannot exceed employee salary balance" });
    }

    const balanceAfter = balanceBefore - advance_amount;

    // 4️⃣ Create main expense
    const expense = await Expense.create({
      branch_id,
      payment_date: new Date(),
      subtotal: 0,
      tax_total: 0,
      total_amount: advance_amount,
      payments_status: "paid",
      created_by: userId,
      description: description
        ? `${description} | Advance to ${employee.employee_id} (${employee.name})`
        : `Advance to ${employee.employee_id} (${employee.name})`
    });

    // 5️⃣ Update branch wallet
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id },
      order: [["created_at", "DESC"]]
    });

    const branchBalanceBefore = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
    const branchBalanceAfter = branchBalanceBefore - advance_amount;

    await BranchWallet.create({
      branch_id,
      name: `Advance Expense #${expense.id} - ${employee.employee_id}`,
      transaction_type: "debit",
      amount: advance_amount,
      description: `Advance Payment to ${employee.employee_id} (${employee.name})`,
      balance_after: branchBalanceAfter,
      created_by: userId
    });

    res.status(201).json({
      success: true,
      message: "Employee advance payment recorded",
      data: {
        expense_id: expense.id,
        employee_id: employee.employee_id,
        employee_name: employee.name,
        advanceAmount: advance_amount,
        balanceBefore,
        balanceAfter,
        branchBalanceBefore,
        branchBalanceAfter,
        created_by: userName
      }
    });
  } catch (err) {
    console.error("Employee advance payment failed:", err);
    res.status(500).json({ success: false, message: "Failed to record advance payment", error: err.message });
  }
};

// ================================
// GENERATE EXPENSE REPORT (branch-wise)
// ================================
// exports.generateExpenseReport = async (req, res) => {
//   try {
//     const { branch_id, period } = req.query;

//     if (!branch_id || !period) {
//       return res.status(400).json({ success: false, message: "branch_id and period are required" });
//     }

//     // Fetch branch details
//     const branch = await Branch.findByPk(branch_id);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // Fetch expenses with items
//     const expenses = await Expense.findAll({
//       where: { branch_id, is_deleted: false },
//       include: [
//         { model: User, as: "creator", attributes: ["id", "name"] },
//         { model: ExpenseItem, as: "items" }
//       ],
//       order: [["created_at", "ASC"]],
//     });

//     if (!expenses.length) {
//       return res.status(404).json({ success: false, message: "No expenses found" });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Expense Report");

//     // Title
//     worksheet.mergeCells("A1:F1");
//     worksheet.getCell("A1").value = `${branch.name} Expense Report - ${period}`;
//     worksheet.getCell("A1").font = { bold: true, size: 14 };
//     worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

//     // Header row
//     const headerRow = worksheet.addRow([
//       "Date",
//       "Description",
//       "Subtotal",
//       "Tax Total",
//       "Total Amount",
//       "Created By",
//     ]);
//     headerRow.eachCell((cell) => {
//       cell.font = { bold: true };
//       cell.alignment = { horizontal: "center", vertical: "middle" };
//       cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
//     });

//     // Column widths
//     worksheet.getColumn(1).width = 14; // Date
//     worksheet.getColumn(2).width = 40; // Description
//     worksheet.getColumn(3).width = 14; // Subtotal
//     worksheet.getColumn(4).width = 14; // Tax Total
//     worksheet.getColumn(5).width = 16; // Total Amount
//     worksheet.getColumn(6).width = 20; // Created By

//     let currentMonth = null;

//     for (const exp of expenses) {
//       const expDate = exp.created_at ? new Date(exp.created_at) : null;
//       if (!expDate) continue;

//       const expMonth = expDate.toLocaleString("default", { month: "long" });
//       if (expMonth !== currentMonth) {
//         currentMonth = expMonth;
//         const monthRow = worksheet.addRow([currentMonth]);
//         monthRow.font = { bold: true };
//         worksheet.mergeCells(`A${monthRow.number}:F${monthRow.number}`);
//         monthRow.alignment = { horizontal: "left" };
//       }

//       // Subtotal: use total_amount for advance salary if subtotal is 0
//       let subtotalValue = parseFloat(exp.subtotal || 0);
//       if (exp.description && exp.description.toLowerCase().includes("advance to") && subtotalValue === 0) {
//           subtotalValue = parseFloat(exp.total_amount || 0);
//       }

//       const dataRow = worksheet.addRow([
//         expDate.toISOString().split("T")[0],
//         exp.description || "",
//         subtotalValue,
//         parseFloat(exp.tax_total || 0),
//         parseFloat(exp.total_amount || 0),
//         exp.creator?.name || "System",
//       ]);

//       dataRow.eachCell((cell) => {
//         cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
//         cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
//       });
//     }

//     const fileDir = path.join(__dirname, "../public/reports");
//     fs.mkdirSync(fileDir, { recursive: true });
//     const fileName = `expense_${branch_id}_${period}_${Date.now()}.xlsx`;
//     const filePath = path.join(fileDir, fileName);
//     await workbook.xlsx.writeFile(filePath);

//     return res.json({ success: true, message: "Expense report generated", downloadUrl: `/reports/${fileName}` });
//   } catch (error) {
//     console.error("Error generating expense report:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };


exports.generateExpenseReport = async (req, res) => {
  try {
    const { branch_id, period } = req.query;

    if (!branch_id || !period) {
      return res.status(400).json({ success: false, message: "branch_id and period are required" });
    }

    // Fetch branch details
    const branch = await Branch.findByPk(branch_id);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // Fetch expenses with items
    const expenses = await Expense.findAll({
      where: { branch_id, is_deleted: false },
      include: [{ model: ExpenseItem, as: "items" }],
      order: [["created_at", "ASC"]],
    });

    if (!expenses.length) {
      return res.status(404).json({ success: false, message: "No expenses found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expense Report");

    // Title
    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = `${branch.name} Expense Report - ${period}`;
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

    // Header row
    const headerRow = worksheet.addRow([
      "Date",
      "Description",
      "Subtotal",
      "Tax Total",
      "Total Amount",
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    // Column widths
    worksheet.getColumn(1).width = 14; // Date
    worksheet.getColumn(2).width = 40; // Description
    worksheet.getColumn(3).width = 14; // Subtotal
    worksheet.getColumn(4).width = 14; // Tax Total
    worksheet.getColumn(5).width = 16; // Total Amount

    let currentMonth = null;

    for (const exp of expenses) {
      const expDate = exp.created_at ? new Date(exp.created_at) : null;
      if (!expDate) continue;

      const expMonth = expDate.toLocaleString("default", { month: "long" });
      if (expMonth !== currentMonth) {
        currentMonth = expMonth;
        const monthRow = worksheet.addRow([currentMonth]);
        monthRow.font = { bold: true };
        worksheet.mergeCells(`A${monthRow.number}:E${monthRow.number}`);
        monthRow.alignment = { horizontal: "left" };
      }

      // Subtotal: use total_amount for advance salary if subtotal is 0
      let subtotalValue = parseFloat(exp.subtotal || 0);
      if (exp.description && exp.description.toLowerCase().includes("advance to") && subtotalValue === 0) {
        subtotalValue = parseFloat(exp.total_amount || 0);
      }

      const dataRow = worksheet.addRow([
        expDate.toISOString().split("T")[0],
        exp.description || "",
        subtotalValue,
        parseFloat(exp.tax_total || 0),
        parseFloat(exp.total_amount || 0),
      ]);

      dataRow.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      });
    }

    const fileDir = path.join(__dirname, "../public/reports");
    fs.mkdirSync(fileDir, { recursive: true });
    const fileName = `expense_${branch_id}_${period}_${Date.now()}.xlsx`;
    const filePath = path.join(fileDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return res.json({ success: true, message: "Expense report generated", downloadUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error("Error generating expense report:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


