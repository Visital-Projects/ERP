// const { Op } = require("sequelize");
// const PurchaseOrder = require("../models/purchase_order.model");
// const WorkOrder = require("../models/workOrder.model");
// const PurchaseOrderInvoice = require("../models/purchase_order_invoice.model");
// const WorkOrderInvoice = require("../models/work_order_invoice.model");
// const Invoice = require("../models/invoice_wo_po.model");

// // Helper: GST Calculation
// function calculateGST(baseAmount, cgst, sgst, igst, gstType) {
//   const totalTaxPercent = Number(cgst) + Number(sgst) + Number(igst);
//   let gstAmount = 0, totalAmount = baseAmount;

//   if (gstType === "Exclusive") {
//     gstAmount = (baseAmount * totalTaxPercent) / 100;
//     totalAmount = baseAmount + gstAmount;
//   } else if (gstType === "Inclusive") {
//     gstAmount = (baseAmount * totalTaxPercent) / (100 + totalTaxPercent);
//     baseAmount = baseAmount - gstAmount;
//     totalAmount = baseAmount + gstAmount;
//   }

//   return { baseAmount, gstAmount, totalAmount };
// }


// exports.raiseInvoice = async (req, res) => {
//   try {
//     const { number, cgst = 0, sgst = 0, igst = 0, gst_type = "Exclusive" } = req.body;
//     const created_by = req.user?.id || null;

//     if (!number) {
//       return res.status(400).json({ success: false, message: "number is required" });
//     }

//     // 🔹 Check if invoice already exists (include soft-deleted)
//     let existingInvoice = await Invoice.findOne({
//       where: { number },
//       paranoid: false,
//     });

//     // 🛑 If invoice exists and not deleted — reject creation
//     if (existingInvoice && !existingInvoice.deleted_at) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice already exists for this number. Duplicate not allowed.",
//       });
//     }

//     // 🔁 If soft-deleted, restore it
//     if (existingInvoice && existingInvoice.deleted_at) {
//       await existingInvoice.restore();
//       return res.status(200).json({
//         success: true,
//         message: "Invoice restored successfully",
//         data: existingInvoice,
//       });
//     }

//     // 🔍 Detect automatically: Purchase Order or Work Order
//     let record = await PurchaseOrder.findOne({
//       where: { po_number: number },
//       include: [
//         {
//           model: require("../models/purchase_order_item.model"),
//           as: "line_items",
//           attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//         },
//         {
//           model: require("../models/branch.model"),
//           as: "branch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//       ],
//     });

//     let type = "PO";
//     let baseAmount = 0;

//     if (!record) {
//       record = await WorkOrder.findOne({
//         where: { wo_number: number },
//         include: [
//           {
//             association: "services",
//             attributes: [
//               "id",
//               "service_code",
//               "description",
//               "unit",
//               "quantity",
//               "rate",
//               "amount",
//             ],
//           },
//         ],
//       });
//       if (!record)
//         return res.status(404).json({
//           success: false,
//           message: "No matching Work Order or Purchase Order found for this number",
//         });

//       type = "WO";
//       baseAmount = parseFloat(record.amount || 0);
//     } else {
//       baseAmount = parseFloat(record.total_amount || 0);
//     }

//     const { gstAmount, totalAmount } = calculateGST(baseAmount, cgst, sgst, igst, gst_type);

//     // ✅ Create new invoice
//     const newInvoice = await Invoice.create({
//       number,
//       payment_amount: baseAmount,
//       base_amount: baseAmount,
//       gst_amount: gstAmount,
//       cgst,
//       sgst,
//       igst,
//       total_amount: totalAmount,
//       remaining_amount: totalAmount,
//       gst_type,
//       created_by,
//     });

//     // 🔹 Fetch full invoice details with associations
//     const fullInvoice = await Invoice.findOne({
//       where: { id: newInvoice.id },
//       include:
//         type === "WO"
//           ? [
//               {
//                 model: WorkOrder,
//                 as: "workOrder",
//                 include: [
//                   {
//                     association: "services",
//                     attributes: [
//                       "id",
//                       "service_code",
//                       "description",
//                       "unit",
//                       "quantity",
//                       "rate",
//                       "amount",
//                     ],
//                   },
//                 ],
//               },
//             ]
//           : [
//               {
//                 model: PurchaseOrder,
//                 as: "purchaseOrder",
//                 include: [
//                   {
//                     model: require("../models/purchase_order_item.model"),
//                     as: "line_items",
//                     attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//                   },
//                   {
//                     model: require("../models/branch.model"),
//                     as: "branch",
//                     attributes: ["id", "name", "branch_address", "contact_number"],
//                   },
//                 ],
//               },
//             ],
//     });

//     return res.status(201).json({
//       success: true,
//       message: `${type === "PO" ? "Purchase Order" : "Work Order"} Invoice created successfully`,
//       data: fullInvoice,
//     });
//   } catch (err) {
//     console.error("Invoice Raise Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };
// exports.getInvoices = async (req, res) => {
//   try {
//     const { number, status } = req.query;

//     const where = {};
//     if (number) where.number = number;
//     if (status) where.status = status;

//     const invoices = await Invoice.findAll({
//       where,
//       order: [["created_at", "DESC"]],
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           include: [
//             {
//               association: "services",
//               attributes: [
//                 "id",
//                 "service_code",
//                 "description",
//                 "unit",
//                 "quantity",
//                 "rate",
//                 "amount",
//               ],
//             },
//             {
//               association: "assignedBranch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           include: [
//             {
//               model: require("../models/purchase_order_item.model"),
//               as: "line_items",
//               attributes: [
//                 "id",
//                 "item_name",
//                 "quantity",
//                 "unit_price",
//                 "line_total",
//                 "unit_id",
//               ],
//             },
//             {
//               model: require("../models/branch.model"),
//               as: "branch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//       ],
//     });

//     return res.json({ success: true, data: invoices });
//   } catch (err) {
//     console.error("Get Invoices Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };
// exports.getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const invoice = await Invoice.findByPk(id, {
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           include: [
//             {
//               association: "services",
//               attributes: [
//                 "id",
//                 "service_code",
//                 "description",
//                 "unit",
//                 "quantity",
//                 "rate",
//                 "amount",
//               ],
//             },
//             {
//               association: "assignedBranch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           include: [
//             {
//               model: require("../models/purchase_order_item.model"),
//               as: "line_items",
//               attributes: [
//                 "id",
//                 "item_name",
//                 "quantity",
//                 "unit_price",
//                 "line_total",
//                 "unit_id",
//               ],
//             },
//             {
//               model: require("../models/branch.model"),
//               as: "branch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Invoice not found" });
//     }

//     return res.json({ success: true, data: invoice });
//   } catch (err) {
//     console.error("Get Invoice Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };
// exports.updateInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { payment_amount, cgst, sgst, igst, gst_type, status } = req.body;

//     const invoice = await Invoice.findByPk(id);
//     if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

//     let baseAmount = parseFloat(payment_amount || invoice.base_amount);
//     const { gstAmount, totalAmount } = calculateGST(baseAmount, cgst || invoice.cgst, sgst || invoice.sgst, igst || invoice.igst, gst_type || invoice.gst_type);

//     invoice.payment_amount = baseAmount;
//     invoice.base_amount = baseAmount;
//     invoice.cgst = cgst || invoice.cgst;
//     invoice.sgst = sgst || invoice.sgst;
//     invoice.igst = igst || invoice.igst;
//     invoice.gst_amount = gstAmount;
//     invoice.total_amount = totalAmount;
//     invoice.remaining_amount = totalAmount;
//     invoice.gst_type = gst_type || invoice.gst_type;
//     invoice.status = status || invoice.status;

//     await invoice.save();

//     return res.json({ success: true, message: "Invoice updated successfully", data: invoice });
//   } catch (err) {
//     console.error("Update Invoice Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };
// exports.deleteInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const invoice = await Invoice.findByPk(id);
//     if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

//     await invoice.destroy();
//     return res.json({ success: true, message: "Invoice deleted successfully" });
//   } catch (err) {
//     console.error("Delete Invoice Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };






// const ExpensesNew = require("../models/expenseNew.model");
// const ExpenseCategory = require("../models/expenseCategory.model");
// const Employee = require("../models/employee.model");
// const Payslip = require("../models/payslip.model");
// const Branch = require("../models/branch.model");
// const Department = require("../models/department.model");
// const Designation = require("../models/designation.model");
// const PurchaseOrderItem = require("../models/purchase_order_item.model");
// const Unit = require("../models/unit.model");

// exports.getWorkOrderInvoiceDetails = async (req, res) => {
//   try {
//     const { wo_number } = req.params;
//     const { branch_id } = req.query;

//     if (!wo_number)
//       return res.status(400).json({ success: false, message: "wo_number is required" });

//     // 🔹 Find Work Order
//     const workOrder = await WorkOrder.findOne({ where: { wo_number } });
//     if (!workOrder)
//       return res.status(404).json({ success: false, message: "Work order not found" });

//     const activeBranch = branch_id || workOrder.assigned_to;

//     // ============================
//     // 🔹 Work Order Invoices
//     // ============================
//     const invoices = await WorkOrderInvoice.findAll({
//       where: { wo_number },
//       order: [["created_at", "ASC"]],
//       raw: true,
//     });

//     let totalBaseReceived = 0,
//       totalGSTReceived = 0,
//       totalInvoiceAmount = 0;

//     invoices.forEach((inv) => {
//       const baseAmt = parseFloat(inv.base_amount || inv.payment_amount || 0);
//       const gstAmt = parseFloat(inv.gst_amount || 0);
//       const totalAmt = parseFloat(inv.total_amount || baseAmt + gstAmt);

//       totalBaseReceived += baseAmt;
//       totalGSTReceived += gstAmt;
//       totalInvoiceAmount += totalAmt;

//       inv.base_amount = baseAmt.toFixed(2);
//       inv.gst_amount = gstAmt.toFixed(2);
//       inv.total_amount = totalAmt.toFixed(2);
//     });

//     const workOrderAmount = parseFloat(workOrder.amount || 0);
//     const remainingAmount = Math.max(workOrderAmount - totalBaseReceived, 0);

//     const gstRate = invoices.length
//       ? (parseFloat(invoices[0].cgst || 0) +
//           parseFloat(invoices[0].sgst || 0) +
//           parseFloat(invoices[0].igst || 0)) / 100
//       : 0;

//     const baseAmountWithGST = (workOrderAmount * (1 + gstRate)).toFixed(2);

//     // ============================
//     // 🔹 Branch-wise Expenses
//     // ============================
//     const expenses = await ExpensesNew.findAll({
//       where: { branch_id: activeBranch, is_deleted: 1 },
//       attributes: [
//         "id",
//         "payment_date",
//         "subtotal",
//         "tax_total",
//         "total_amount",
//         "payments_status",
//         "description",
//         "category_id",
//         "document",
//       ],
//       order: [["payment_date", "DESC"]],
//       raw: true,
//     });

//     const taxableExpenses = expenses.filter(
//       (exp) => parseFloat(exp.tax_total || 0) > 0
//     );
//     const nonTaxableExpenses = expenses.filter(
//       (exp) => parseFloat(exp.tax_total || 0) === 0
//     );

//     const totalTaxable = taxableExpenses.reduce(
//       (sum, exp) => sum + parseFloat(exp.total_amount || 0),
//       0
//     );
//     const totalNonTaxable = nonTaxableExpenses.reduce(
//       (sum, exp) => sum + parseFloat(exp.total_amount || 0),
//       0
//     );
//     const totalExpenses = totalTaxable + totalNonTaxable;

//     // ============================
//     // 🔹 Payslips
//     // ============================
//     const employees = await Employee.findAll({
//       where: { branch_id: activeBranch },
//       include: [
//         { model: Branch, as: "branch", attributes: ["id", "name"] },
//         { model: Department, as: "department", attributes: ["id", "name"] },
//         { model: Designation, as: "designation", attributes: ["id", "name"] },
//       ],
//       attributes: ["id", "name", "employee_id", "salary", "salary_type"],
//       raw: false,
//     });

//     const employeeBusinessIds = employees.map((e) => e.employee_id);

//     const payslipsData = await Payslip.findAll({
//       where: {
//         employee_id: { [Op.in]: employeeBusinessIds.length ? employeeBusinessIds : [0] },
//         is_deleted: 0,
//       },
//       attributes: [
//         "id",
//         "employee_id",
//         "salary_month",
//         "basic_salary",
//         "allowance",
//         "commission",
//         "overtime",
//         "other_payment",
//         "loan",
//         "saturation_deduction",
//         "net_payble",
//         "status",
//         "created_at",
//       ],
//       order: [["created_at", "DESC"]],
//       raw: true,
//     });

//     let totalSalaries = 0;

//     const payslips = employees.map((emp) => {
//       const empPayslip = payslipsData.find((p) => p.employee_id === emp.employee_id);
      
//       let netSalary = 0;
//       let basicSalary = 0;
//       let totalAdditions = 0;
//       let totalDeductions = 0;
      
//       if (empPayslip) {
//         basicSalary = parseFloat(empPayslip.basic_salary || 0);
//         const allowance = parseFloat(empPayslip.allowance || 0);
//         const commission = parseFloat(empPayslip.commission || 0);
//         const overtime = parseFloat(empPayslip.overtime || 0);
//         const otherPayment = parseFloat(empPayslip.other_payment || 0);
//         const loan = parseFloat(empPayslip.loan || 0);
//         const saturationDeduction = parseFloat(empPayslip.saturation_deduction || 0);
        
//         totalAdditions = allowance + commission + overtime + otherPayment;
//         totalDeductions = loan + saturationDeduction;
//         netSalary = parseFloat(empPayslip.net_payble || 0);
//       } else {
//         basicSalary = parseFloat(emp.salary || 0);
//         netSalary = basicSalary;
//       }
      
//       totalSalaries += netSalary;

//       return {
//         employee_id: emp.employee_id,
//         employee_name: emp.name,
//         branch: emp.branch ? emp.branch.name : null,
//         department: emp.department ? emp.department.name : null,
//         designation: emp.designation ? emp.designation.name : null,
//         salary_month: empPayslip ? empPayslip.salary_month : "Current",
//         basic_salary: basicSalary,
//         allowance: empPayslip ? parseFloat(empPayslip.allowance || 0) : 0,
//         commission: empPayslip ? parseFloat(empPayslip.commission || 0) : 0,
//         overtime: empPayslip ? parseFloat(empPayslip.overtime || 0) : 0,
//         other_payment: empPayslip ? parseFloat(empPayslip.other_payment || 0) : 0,
//         loan: empPayslip ? parseFloat(empPayslip.loan || 0) : 0,
//         saturation_deduction: empPayslip ? parseFloat(empPayslip.saturation_deduction || 0) : 0,
//         net_payble: netSalary.toFixed(2),
//         status: empPayslip
//           ? empPayslip.status == 1
//             ? "paid"
//             : "unpaid"
//           : "no_payslip",
//         salary_type: emp.salary_type,
//         has_payslip: !!empPayslip,
//         calculation: {
//           total_additions: totalAdditions,
//           total_deductions: totalDeductions,
//           net_salary: netSalary
//         }
//       };
//     });

//     // ============================
//     // 🔹 Dynamic Purchase Order Income (by branch)
//     // ============================
//     const purchaseOrderInvoices = await PurchaseOrderInvoice.findAll({
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: [],
//           where: { branch_id: activeBranch },
//         },
//       ],
//       attributes: ["total_amount"],
//       raw: true,
//     });

//     const purchaseOrderIncome = purchaseOrderInvoices.reduce(
//       (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//       0
//     );

//     const workOrderIncome = totalInvoiceAmount;
//     const totalBranchIncome = workOrderIncome + purchaseOrderIncome;

//     // 🟢 Profit Calculation
//     const totalIncome = totalBranchIncome;
//     const totalCosts = totalExpenses + totalSalaries;
//     const netProfit = totalIncome - totalCosts;
//     const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

//     // ============================
//     // ✅ Final Response (format unchanged)
//     // ============================
//     return res.json({
//       success: true,
//       data: {
//         wo_number: workOrder.wo_number,
//         branch_id: activeBranch,
//         workOrder: {
//           id: workOrder.id,
//           title: workOrder.title,
//           amount: workOrderAmount.toFixed(2),
//         },
//         base_amount_with_gst: baseAmountWithGST,
//         total_received: totalBaseReceived.toFixed(2),
//         remaining_amount: remainingAmount.toFixed(2),
//         total_invoice_amount: totalInvoiceAmount.toFixed(2),
//         total_expenses: totalExpenses.toFixed(2),
//         total_taxable_expenses: totalTaxable.toFixed(2),
//         total_non_taxable_expenses: totalNonTaxable.toFixed(2),
//         total_salaries: totalSalaries.toFixed(2),

//         profit_calculation: {
//           total_income: totalIncome.toFixed(2),
//           total_costs: totalCosts.toFixed(2),
//           net_profit: netProfit.toFixed(2),
//           profit_margin: profitMargin.toFixed(2) + '%',
//           formula: `Income(${totalIncome}) - Expenses(${totalExpenses}) - Salaries(${totalSalaries}) = ${netProfit}`
//         },

//         // // ✅ Added dynamic branch income summary
//         // branch_income_summary: {
//         //   [activeBranch]: {
//         //     branch_id: activeBranch,
//         //     work_order_income: workOrderIncome,
//         //     purchase_order_income: purchaseOrderIncome,
//         //     total_branch_income: totalBranchIncome
//         //   }
//         // },
//         // ✅ Added dynamic branch income summary (with branch name)
// branch_wise_income: {
//   [ (await Branch.findByPk(activeBranch, { attributes: ["name"], raw: true }) )?.name || `Branch_${activeBranch}` ]: {
//     branch_id: activeBranch,
//     purchase_order_income: purchaseOrderIncome,
//     work_order_income: workOrderIncome,
//     total_branch_income: totalBranchIncome
//   }
// },


//         invoices,
//         taxable_expenses: taxableExpenses,
//         non_taxable_expenses: nonTaxableExpenses,
//         payslips,
//       },
//     });
//   } catch (error) {
//     console.error("Get Work Order Invoice Details Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch work order details",
//       error: error.message,
//     });
//   }
// };
// exports.getPurchaseOrderInvoiceDetails = async (req, res) => {
//   try {
//     const { po_number } = req.params;
//     const { branch_id } = req.query;

//     if (!po_number)
//       return res.status(400).json({ success: false, message: "po_number is required" });

//     // 🔹 Find Purchase Order
//     const purchaseOrder = await PurchaseOrder.findOne({ 
//       where: { po_number },
//       include: [
//         {
//           model: PurchaseOrderItem,
//           as: "line_items",
//           include: [
//             {
//               model: Unit,
//               as: "unit",
//               attributes: ["id", "name"]
//             }
//           ]
//         }
//       ]
//     });
    
//     if (!purchaseOrder)
//       return res.status(404).json({ success: false, message: "Purchase order not found" });

//     const activeBranch = branch_id || purchaseOrder.branch_id;

//     // ============================
//     // 🔹 Purchase Order Invoices
//     // ============================
//     const invoices = await PurchaseOrderInvoice.findAll({
//       where: { po_number },
//       order: [["created_at", "ASC"]],
//       raw: true,
//     });

//     let totalBaseReceived = 0,
//       totalGSTReceived = 0,
//       totalInvoiceAmount = 0;

//     invoices.forEach((inv) => {
//       const baseAmt = parseFloat(inv.base_amount || inv.payment_amount || 0);
//       const gstAmt = parseFloat(inv.gst_amount || 0);
//       const totalAmt = parseFloat(inv.total_amount || baseAmt + gstAmt);

//       totalBaseReceived += baseAmt;
//       totalGSTReceived += gstAmt;
//       totalInvoiceAmount += totalAmt;

//       inv.base_amount = baseAmt.toFixed(2);
//       inv.gst_amount = gstAmt.toFixed(2);
//       inv.total_amount = totalAmt.toFixed(2);
//     });

//     const purchaseOrderAmount = parseFloat(purchaseOrder.total_amount || 0);
//     const remainingAmount = Math.max(purchaseOrderAmount - totalBaseReceived, 0);

//     const gstRate = invoices.length
//       ? (parseFloat(invoices[0].cgst || 0) +
//           parseFloat(invoices[0].sgst || 0) +
//           parseFloat(invoices[0].igst || 0)) / 100
//       : 0;

//     const baseAmountWithGST = (purchaseOrderAmount * (1 + gstRate)).toFixed(2);

//     // ============================
//     // 🔹 Branch-wise Expenses
//     // ============================
//     const expenses = await ExpensesNew.findAll({
//       where: { branch_id: activeBranch, is_deleted: 1 },
//       attributes: [
//         "id",
//         "payment_date",
//         "subtotal",
//         "tax_total",
//         "total_amount",
//         "payments_status",
//         "description",
//         "category_id",
//         "document",
//       ],
//       order: [["payment_date", "DESC"]],
//       raw: true,
//     });

//     const taxableExpenses = expenses.filter(
//       (exp) => parseFloat(exp.tax_total || 0) > 0
//     );
//     const nonTaxableExpenses = expenses.filter(
//       (exp) => parseFloat(exp.tax_total || 0) === 0
//     );

//     const totalTaxable = taxableExpenses.reduce(
//       (sum, exp) => sum + parseFloat(exp.total_amount || 0),
//       0
//     );
//     const totalNonTaxable = nonTaxableExpenses.reduce(
//       (sum, exp) => sum + parseFloat(exp.total_amount || 0),
//       0
//     );
//     const totalExpenses = totalTaxable + totalNonTaxable;

//     // ============================
//     // 🔹 Payslips with full breakdown
//     // ============================
//     const employees = await Employee.findAll({
//       where: { branch_id: activeBranch },
//       include: [
//         { model: Branch, as: "branch", attributes: ["id", "name"] },
//         { model: Department, as: "department", attributes: ["id", "name"] },
//         { model: Designation, as: "designation", attributes: ["id", "name"] },
//       ],
//       attributes: ["id", "name", "employee_id", "salary", "salary_type"],
//       raw: false,
//     });

//     const employeeBusinessIds = employees.map((e) => e.employee_id);

//     const payslipsData = await Payslip.findAll({
//       where: {
//         employee_id: { [Op.in]: employeeBusinessIds.length ? employeeBusinessIds : [0] },
//         is_deleted: 0,
//       },
//       attributes: [
//         "id",
//         "employee_id",
//         "salary_month",
//         "basic_salary",
//         "allowance",
//         "commission",
//         "overtime",
//         "other_payment",
//         "loan",
//         "saturation_deduction",
//         "net_payble",
//         "status",
//         "created_at",
//       ],
//       order: [["created_at", "DESC"]],
//       raw: true,
//     });

//     let totalSalaries = 0;

//     const payslips = employees.map((emp) => {
//       const empPayslip = payslipsData.find((p) => p.employee_id === emp.employee_id);
      
//       let netSalary = 0;
//       let basicSalary = 0;
//       let totalAdditions = 0;
//       let totalDeductions = 0;
      
//       if (empPayslip) {
//         basicSalary = parseFloat(empPayslip.basic_salary || 0);
//         const allowance = parseFloat(empPayslip.allowance || 0);
//         const commission = parseFloat(empPayslip.commission || 0);
//         const overtime = parseFloat(empPayslip.overtime || 0);
//         const otherPayment = parseFloat(empPayslip.other_payment || 0);
//         const loan = parseFloat(empPayslip.loan || 0);
//         const saturationDeduction = parseFloat(empPayslip.saturation_deduction || 0);
        
//         totalAdditions = allowance + commission + overtime + otherPayment;
//         totalDeductions = loan + saturationDeduction;
//         netSalary = parseFloat(empPayslip.net_payble || 0);
//       } else {
//         basicSalary = parseFloat(emp.salary || 0);
//         netSalary = basicSalary;
//       }
      
//       totalSalaries += netSalary;

//       return {
//         employee_id: emp.employee_id,
//         employee_name: emp.name,
//         branch: emp.branch ? emp.branch.name : null,
//         department: emp.department ? emp.department.name : null,
//         designation: emp.designation ? emp.designation.name : null,
//         salary_month: empPayslip ? empPayslip.salary_month : "Current",
//         basic_salary: basicSalary,
//         allowance: empPayslip ? parseFloat(empPayslip.allowance || 0) : 0,
//         commission: empPayslip ? parseFloat(empPayslip.commission || 0) : 0,
//         overtime: empPayslip ? parseFloat(empPayslip.overtime || 0) : 0,
//         other_payment: empPayslip ? parseFloat(empPayslip.other_payment || 0) : 0,
//         loan: empPayslip ? parseFloat(empPayslip.loan || 0) : 0,
//         saturation_deduction: empPayslip ? parseFloat(empPayslip.saturation_deduction || 0) : 0,
//         net_payble: netSalary.toFixed(2),
//         status: empPayslip
//           ? empPayslip.status == 1
//             ? "paid"
//             : "unpaid"
//           : "no_payslip",
//         salary_type: emp.salary_type,
//         has_payslip: !!empPayslip,
//         calculation: {
//           total_additions: totalAdditions,
//           total_deductions: totalDeductions,
//           net_salary: netSalary
//         }
//       };
//     });

//     // ============================
//     // 🔹 Dynamic Work Order Income (by branch)
//     // ============================
//     const workOrderInvoices = await WorkOrderInvoice.findAll({
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           attributes: [],
//           where: { assigned_to: activeBranch },
//         },
//       ],
//       attributes: ["total_amount"],
//       raw: true,
//     });

//     const workOrderIncome = workOrderInvoices.reduce(
//       (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//       0
//     );

//     const purchaseOrderIncome = totalInvoiceAmount;
//     const totalBranchIncome = workOrderIncome + purchaseOrderIncome;

//     // 🟢 CALCULATE PROFIT
//     const totalIncome = totalBranchIncome;
//     const totalCosts = totalExpenses + totalSalaries;
//     const netProfit = totalIncome - totalCosts;
//     const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

//     // ============================
//     // ✅ Final Response
//     // ============================
//     return res.json({
//       success: true,
//       data: {
//         po_number: purchaseOrder.po_number,
//         branch_id: activeBranch,
//         purchaseOrder: {
//           id: purchaseOrder.id,
//           title: purchaseOrder.title,
//           vendor_name: purchaseOrder.vendor_name,
//           total_amount: purchaseOrderAmount.toFixed(2),
//           items: purchaseOrder.line_items ? purchaseOrder.line_items.map(item => ({
//             id: item.id,
//             item_name: item.item_name,
//             quantity: item.quantity,
//             unit_price: item.unit_price,
//             total_price: item.total_price,
//             unit: item.unit ? item.unit.name : null
//           })) : []
//         },

//         // Income
//         base_amount_with_gst: baseAmountWithGST,
//         total_received: totalBaseReceived.toFixed(2),
//         remaining_amount: remainingAmount.toFixed(2),
//         total_invoice_amount: totalInvoiceAmount.toFixed(2),

//         // Expenses
//         total_expenses: totalExpenses.toFixed(2),
//         total_taxable_expenses: totalTaxable.toFixed(2),
//         total_non_taxable_expenses: totalNonTaxable.toFixed(2),

//         // Salaries (NET)
//         total_salaries: totalSalaries.toFixed(2),

//         // ✅ Profit Calculation
//         profit_calculation: {
//           total_income: totalIncome.toFixed(2),
//           total_costs: totalCosts.toFixed(2),
//           net_profit: netProfit.toFixed(2),
//           profit_margin: profitMargin.toFixed(2) + '%',
//           formula: `Income(${totalIncome}) - Expenses(${totalExpenses}) - Salaries(${totalSalaries}) = ${netProfit}`
//         },

//         // ✅ Added dynamic branch income summary
//         branch_income_summary: {
//           [activeBranch]: {
//             branch_id: activeBranch,
//             purchase_order_income: purchaseOrderIncome,
//             work_order_income: workOrderIncome,
//             total_branch_income: totalBranchIncome
//           }
//         },

//         // Detailed Lists
//         invoices,
//         taxable_expenses: taxableExpenses,
//         non_taxable_expenses: nonTaxableExpenses,
//         payslips,
//       },
//     });
//   } catch (error) {
//     console.error("Get Purchase Order Invoice Details Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch purchase order details",
//       error: error.message,
//     });
//   }
// };



const { Op } = require("sequelize");
const PurchaseOrder = require("../models/purchase_order.model");
const WorkOrder = require("../models/workOrder.model");
const PurchaseOrderInvoice = require("../models/purchase_order_invoice.model");
const WorkOrderInvoice = require("../models/work_order_invoice.model");
const Invoice = require("../models/invoice_wo_po.model");


function calculateGST(baseAmount, cgst, sgst, igst, gstType) {
  const totalTaxPercent = Number(cgst) + Number(sgst) + Number(igst);
  let gstAmount = 0, totalAmount = baseAmount;

  if (gstType === "Exclusive") {
    gstAmount = (baseAmount * totalTaxPercent) / 100;
    totalAmount = baseAmount + gstAmount;
  } else if (gstType === "Inclusive") {
    gstAmount = (baseAmount * totalTaxPercent) / (100 + totalTaxPercent);
    baseAmount = baseAmount - gstAmount;
    totalAmount = baseAmount + gstAmount;
  }

  return { baseAmount, gstAmount, totalAmount };
}
function calculateExcessWithGST(excessBaseAmount, cgst, sgst, igst, gstType) {
  if (excessBaseAmount <= 0) {
    return {
      excess_base_amount: 0,
      excess_gst_amount: 0,
      excess_total_amount: 0,
    };
  }

  const { gstAmount, totalAmount } = calculateGST(
    excessBaseAmount,
    cgst,
    sgst,
    igst,
    gstType
  );

  return {
    excess_base_amount: Number(excessBaseAmount.toFixed(2)),
    excess_gst_amount: Number(gstAmount.toFixed(2)),
    excess_total_amount: Number(totalAmount.toFixed(2)),
  };
}


async function getPaymentBreakdown(invoiceNumber, isWO = true) {
  if (isWO) {
    // Get ALL payments for the invoice
    const allPayments = await WorkOrderInvoice.findAll({
      where: { wo_number: invoiceNumber },
      order: [["created_at", "DESC"]]
    });
    
    // Get only PAID payments for calculation
    const paidPayments = await WorkOrderInvoice.findAll({
      where: { 
        wo_number: invoiceNumber,
        status: 'paid'  // Only count paid payments
      }
    });
    
    // Calculate total received from ONLY paid payments
    const totalReceived = paidPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.total_amount || payment.payment_amount || 0), 0
    );
    
    // Calculate total base amount from ONLY paid payments (for excess calculation)
    const totalPaidBaseAmount = paidPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.base_amount || 0), 0
    );
    
    return {
      total_received: totalReceived,
      total_paid_base_amount: totalPaidBaseAmount, // For excess calculation
      payment_count: allPayments.length,
      paid_count: paidPayments.length,
      pending_count: allPayments.filter(p => p.status === 'pending').length,
      payments: allPayments.map(p => ({
        id: p.id,
        amount: p.total_amount || p.payment_amount,
        base_amount: p.base_amount,
        gst_amount: p.gst_amount,
        cgst: p.cgst,
        sgst: p.sgst,
        igst: p.igst,
        gst_type: p.gst_type,
        payment_date: p.created_at,
        status: p.status,
        created_by: p.created_by
      })),
      paid_payments: paidPayments.map(p => ({
        id: p.id,
        amount: p.total_amount || p.payment_amount,
        base_amount: p.base_amount,
        gst_amount: p.gst_amount,
        payment_date: p.created_at
      }))
    };
  } else {
    // For Purchase Order
    const allPayments = await PurchaseOrderInvoice.findAll({
      where: { po_number: invoiceNumber },
      order: [["created_at", "DESC"]]
    });
    
    const paidPayments = await PurchaseOrderInvoice.findAll({
      where: { 
        po_number: invoiceNumber,
        status: 'paid'  // Only count paid payments
      }
    });
    
    const totalReceived = paidPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.total_amount || payment.payment_amount || 0), 0
    );
    
    const totalPaidBaseAmount = paidPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.base_amount || 0), 0
    );
    
    return {
      total_received: totalReceived,
      total_paid_base_amount: totalPaidBaseAmount,
      payment_count: allPayments.length,
      paid_count: paidPayments.length,
      pending_count: allPayments.filter(p => p.status === 'pending').length,
      payments: allPayments.map(p => ({
        id: p.id,
        amount: p.total_amount || p.payment_amount,
        base_amount: p.base_amount,
        gst_amount: p.gst_amount,
        cgst: p.cgst,
        sgst: p.sgst,
        igst: p.igst,
        gst_type: p.gst_type,
        payment_date: p.created_at,
        status: p.status,
        created_by: p.created_by
      })),
      paid_payments: paidPayments.map(p => ({
        id: p.id,
        amount: p.total_amount || p.payment_amount,
        base_amount: p.base_amount,
        gst_amount: p.gst_amount,
        payment_date: p.created_at
      }))
    };
  }
}


async function calculateExcessAmount(
  workOrder,
  paymentBreakdown,
  gstMeta = { cgst: 0, sgst: 0, igst: 0, gst_type: "Exclusive" } // ✅ default
) {
  const workOrderAmount = parseFloat(workOrder.work_order_amount || 0);
  const totalPaidBaseAmount = paymentBreakdown.total_paid_base_amount || 0;

  let excessBaseAmount = 0;
  let isExcess = false;

  if (totalPaidBaseAmount > workOrderAmount) {
    excessBaseAmount = totalPaidBaseAmount - workOrderAmount;
    isExcess = true;
  }

  const excessWithGST = calculateExcessWithGST(
    excessBaseAmount,
    Number(gstMeta.cgst || 0),
    Number(gstMeta.sgst || 0),
    Number(gstMeta.igst || 0),
    gstMeta.gst_type || "Exclusive"
  );

  return {
    work_order_amount: workOrderAmount,
    total_paid_base_amount: totalPaidBaseAmount,

    excess_amount: excessBaseAmount, // base
    ...excessWithGST,               // base + gst + total

    is_excess: isExcess,
    excess_percentage: workOrderAmount > 0
      ? ((excessBaseAmount / workOrderAmount) * 100).toFixed(2)
      : "0.00",

    breakdown: {
      original_work_order: workOrderAmount,
      total_paid_so_far: totalPaidBaseAmount,
      difference: totalPaidBaseAmount - workOrderAmount,
      status:
        totalPaidBaseAmount > workOrderAmount
          ? "over_invoiced"
          : totalPaidBaseAmount === workOrderAmount
          ? "fully_invoiced"
          : "under_invoiced",
    },
  };
}


exports.raiseInvoice = async (req, res) => {
  try {
    const { number, cgst = 0, sgst = 0, igst = 0, gst_type = "Exclusive" } = req.body;
    const created_by = req.user?.id || null;

    if (!number) {
      return res.status(400).json({ success: false, message: "number is required" });
    }

    // 🔍 Detect automatically: Purchase Order or Work Order FIRST
    let record = await PurchaseOrder.findOne({
      where: { po_number: number },
      include: [
        {
          model: require("../models/purchase_order_item.model"),
          as: "line_items",
          attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
        },
        {
          model: require("../models/branch.model"),
          as: "branch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
      ],
    });

    let type = "PO";
    let baseAmount = 0;

    if (!record) {
      record = await WorkOrder.findOne({
        where: { wo_number: number },
        include: [
          {
            association: "services",
            attributes: [
              "id",
              "service_code",
              "description",
              "unit",
              "quantity",
              "rate",
              "amount",
            ],
          },
        ],
      });
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "No matching Work Order or Purchase Order found for this number",
        });
      }

      type = "WO";
      baseAmount = parseFloat(record.work_order_amount || record.amount || 0);
    } else {
      baseAmount = parseFloat(record.total_amount || 0);
    }

    // Get payment breakdown BEFORE calculating GST
    const paymentBreakdown = await getPaymentBreakdown(number, type === "WO");
    
    // ============================================
    // IMPORTANT: If payments already exist, use their GST rates
    // ============================================
    let finalCgst = cgst;
    let finalSgst = sgst;
    let finalIgst = igst;
    let finalGstType = gst_type;

    if (paymentBreakdown.payments.length > 0) {
      // Use GST rates from the first payment (assuming all payments have same rates)
      const firstPayment = paymentBreakdown.payments[0];
      
      // Only override if no GST rates were provided in request
      if (cgst === 0 && sgst === 0 && igst === 0) {
        finalCgst = parseFloat(firstPayment.cgst || 0);
        finalSgst = parseFloat(firstPayment.sgst || 0);
        finalIgst = parseFloat(firstPayment.igst || 0);
        finalGstType = firstPayment.gst_type || "Exclusive";
      }
      
      console.log(`Using GST rates from existing payments: CGST=${finalCgst}%, SGST=${finalSgst}%, IGST=${finalIgst}%, Type=${finalGstType}`);
    }

    // Calculate GST based on the base amount with correct rates
    const { gstAmount, totalAmount } = calculateGST(baseAmount, finalCgst, finalSgst, finalIgst, finalGstType);

    // Calculate remaining amount
    const totalReceived = paymentBreakdown.total_received;
    const remainingAmount = Math.max(0, totalAmount - totalReceived);

    // Calculate excess for Purchase Orders too
    let excessSummary = {};
    if (type === "PO") {
      const poTotal = baseAmount;
      const totalPaidBaseAmount = paymentBreakdown.total_paid_base_amount || 0;
      
      let excessAmount = 0;
      let isExcess = false;
      
      if (totalPaidBaseAmount > poTotal) {
        excessAmount = totalPaidBaseAmount - poTotal;
        isExcess = true;
      }
      
      const excessWithGST = calculateExcessWithGST(
  excessAmount,
  finalCgst,
  finalSgst,
  finalIgst,
  finalGstType
);

excessSummary = {
  purchase_order_amount: poTotal,
  total_paid_base_amount: totalPaidBaseAmount,

  excess_amount: excessAmount, // base
  ...excessWithGST,            // ✅ base + gst + total

  is_excess: isExcess,
  excess_percentage: poTotal > 0
    ? ((excessAmount / poTotal) * 100).toFixed(2)
    : "0.00",

  breakdown: {
    original_purchase_order: poTotal,
    total_paid_so_far: totalPaidBaseAmount,
    difference: totalPaidBaseAmount - poTotal,
    status:
      totalPaidBaseAmount > poTotal
        ? "over_invoiced"
        : totalPaidBaseAmount === poTotal
        ? "fully_invoiced"
        : "under_invoiced",
  },
};

    } else if (type === "WO") {
      // For Work Orders
      excessSummary = await calculateExcessAmount(record, paymentBreakdown, {
  cgst: finalCgst,
  sgst: finalSgst,
  igst: finalIgst,
  gst_type: finalGstType,
});

    }

    // 🔹 Check if invoice already exists (include soft-deleted)
    let existingInvoice = await Invoice.findOne({
      where: { number },
      paranoid: false,
    });

    // 🛑 If invoice exists and not deleted — just return it with payment breakdown
    if (existingInvoice && !existingInvoice.deleted_at) {
      // Update remaining amount based on actual payments
      await existingInvoice.update({
        remaining_amount: remainingAmount,
        base_amount: baseAmount,
        gst_amount: gstAmount,
        cgst: finalCgst,
        sgst: finalSgst,
        igst: finalIgst,
        total_amount: totalAmount,
        gst_type: finalGstType
      });

      // 🔹 Fetch the full invoice with associations
      const fullInvoice = await Invoice.findOne({
        where: { id: existingInvoice.id },
        include:
          type === "WO"
            ? [
                {
                  model: WorkOrder,
                  as: "workOrder",
                  include: [
                    {
                      association: "services",
                      attributes: [
                        "id",
                        "service_code",
                        "description",
                        "unit",
                        "quantity",
                        "rate",
                        "amount",
                      ],
                    },
                  ],
                },
              ]
            : [
                {
                  model: PurchaseOrder,
                  as: "purchaseOrder",
                  include: [
                    {
                      model: require("../models/purchase_order_item.model"),
                      as: "line_items",
                      attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
                    },
                    {
                      model: require("../models/branch.model"),
                      as: "branch",
                      attributes: ["id", "name", "branch_address", "contact_number"],
                    },
                  ],
                },
              ],
      });

      // Prepare response data
      const responseData = {
        ...fullInvoice.toJSON(),
        payment_summary: {
          ...paymentBreakdown,
          remaining_amount: remainingAmount,
          invoice_total: totalAmount,
          balance_status: remainingAmount === 0 ? 'paid' : 
                        remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
        }
      };

      // Add excess amount information
      if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
        responseData.excess_summary = excessSummary;
      }

      return res.status(200).json({
        success: true,
        message: "Invoice updated with latest calculations",
        data: responseData
      });
    }

    // 🔁 If soft-deleted, restore AND UPDATE it with fresh values
    if (existingInvoice && existingInvoice.deleted_at) {
      await existingInvoice.restore();
      
      // Update with current values (considering payments already made)
      await existingInvoice.update({
        payment_amount: baseAmount,
        base_amount: baseAmount,
        gst_amount: gstAmount,
        cgst: finalCgst,
        sgst: finalSgst,
        igst: finalIgst,
        total_amount: totalAmount,
        remaining_amount: remainingAmount,
        gst_type: finalGstType,
        updated_by: created_by,
        deleted_at: null,
      });

      // 🔹 Fetch the updated invoice with associations
      const updatedInvoice = await Invoice.findOne({
        where: { id: existingInvoice.id },
        include:
          type === "WO"
            ? [
                {
                  model: WorkOrder,
                  as: "workOrder",
                  include: [
                    {
                      association: "services",
                      attributes: [
                        "id",
                        "service_code",
                        "description",
                        "unit",
                        "quantity",
                        "rate",
                        "amount",
                      ],
                    },
                  ],
                },
              ]
            : [
                {
                  model: PurchaseOrder,
                  as: "purchaseOrder",
                  include: [
                    {
                      model: require("../models/purchase_order_item.model"),
                      as: "line_items",
                      attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
                    },
                    {
                      model: require("../models/branch.model"),
                      as: "branch",
                      attributes: ["id", "name", "branch_address", "contact_number"],
                    },
                  ],
                },
              ],
      });

      // Prepare response data
      const responseData = {
        ...updatedInvoice.toJSON(),
        payment_summary: {
          ...paymentBreakdown,
          remaining_amount: remainingAmount,
          invoice_total: totalAmount,
          balance_status: remainingAmount === 0 ? 'paid' : 
                        remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
        }
      };

      // Add excess amount information
      if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
        responseData.excess_summary = excessSummary;
      }

      return res.status(200).json({
        success: true,
        message: "Invoice restored and updated successfully",
        data: responseData
      });
    }

    // ✅ Create new invoice (only if it doesn't exist at all)
    const newInvoice = await Invoice.create({
      number,
      payment_amount: baseAmount,
      base_amount: baseAmount,
      gst_amount: gstAmount,
      cgst: finalCgst,
      sgst: finalSgst,
      igst: finalIgst,
      total_amount: totalAmount,
      remaining_amount: remainingAmount,
      gst_type: finalGstType,
      created_by,
    });

    // 🔹 Fetch full invoice details with associations
    const fullInvoice = await Invoice.findOne({
      where: { id: newInvoice.id },
      include:
        type === "WO"
          ? [
              {
                model: WorkOrder,
                as: "workOrder",
                include: [
                  {
                    association: "services",
                    attributes: [
                      "id",
                      "service_code",
                      "description",
                      "unit",
                      "quantity",
                      "rate",
                      "amount",
                    ],
                  },
                ],
              },
            ]
          : [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                include: [
                  {
                    model: require("../models/purchase_order_item.model"),
                    as: "line_items",
                    attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
                  },
                  {
                    model: require("../models/branch.model"),
                    as: "branch",
                    attributes: ["id", "name", "branch_address", "contact_number"],
                  },
                ],
              },
            ],
    });

    // Prepare response data
    const responseData = {
      ...fullInvoice.toJSON(),
      payment_summary: {
        ...paymentBreakdown,
        remaining_amount: remainingAmount,
        invoice_total: totalAmount,
        balance_status: remainingAmount === 0 ? 'paid' : 
                      remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
      }
    };

    // Add excess amount information
    if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
      responseData.excess_summary = excessSummary;
    }

    return res.status(201).json({
      success: true,
      message: `${type === "PO" ? "Purchase Order" : "Work Order"} Invoice created successfully`,
      data: responseData,
    });
  } catch (err) {
    console.error("Invoice Raise Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { number, status, type, start_date, end_date } = req.query;

    const where = {};
    if (number) where.number = { [Op.like]: `%${number}%` };
    if (status) where.status = status;
    
    // Date filtering
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const invoices = await Invoice.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: WorkOrder,
          as: "workOrder",
          required: false,
          include: [
            {
              association: "services",
              attributes: [
                "id",
                "service_code",
                "description",
                "unit",
                "quantity",
                "rate",
                "amount",
              ],
            },
            {
              association: "assignedBranch",
              attributes: ["id", "name", "branch_address", "contact_number"],
            },
          ],
        },
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          required: false,
          include: [
            {
              model: require("../models/purchase_order_item.model"),
              as: "line_items",
              attributes: [
                "id",
                "item_name",
                "quantity",
                "unit_price",
                "line_total",
                "unit_id",
              ],
            },
            {
              model: require("../models/branch.model"),
              as: "branch",
              attributes: ["id", "name", "branch_address", "contact_number"],
            },
          ],
        },
      ],
    });

    // Add payment breakdown and excess amount to each invoice
    const invoicesWithPayments = await Promise.all(
      invoices.map(async (invoice) => {
        // Determine if it's WO or PO
        const isWO = invoice.number.startsWith('WO-') || (invoice.workOrder && !invoice.purchaseOrder);
        const paymentBreakdown = await getPaymentBreakdown(invoice.number, isWO);
        
        const totalReceived = paymentBreakdown.total_received;
        const remainingAmount = Math.max(0, parseFloat(invoice.total_amount) - totalReceived);
        
        // Prepare basic response
        const response = {
          ...invoice.toJSON(),
          payment_summary: {
            ...paymentBreakdown,
            remaining_amount: remainingAmount,
            invoice_total: invoice.total_amount,
            balance_status: remainingAmount === 0 ? 'paid' : 
                          remainingAmount === parseFloat(invoice.total_amount) ? 'unpaid' : 'partially_paid'
          }
        };

        // Add excess amount information ONLY for Work Orders with excess from PAID payments
        if (isWO && invoice.workOrder) {
        //   const excessSummary = await calculateExcessAmount(invoice.workOrder, paymentBreakdown);
          const excessSummary = await calculateExcessAmount(
  invoice.workOrder,
  paymentBreakdown,
  {
    cgst: invoice.cgst,
    sgst: invoice.sgst,
    igst: invoice.igst,
    gst_type: invoice.gst_type,
  }
);

          // Only show excess_summary if there's actual excess from PAID payments
          if (excessSummary.is_excess) {
            response.excess_summary = excessSummary;
          }
        }

        return response;
      })
    );

    return res.json({ success: true, data: invoicesWithPayments });
  } catch (err) {
    console.error("Get Invoices Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// async function calculateExcessAmount(workOrder, paymentBreakdown) {
//   const workOrderAmount = parseFloat(workOrder.work_order_amount || 0);
//   const totalPaidBaseAmount = paymentBreakdown.total_paid_base_amount || 0;
  
//   // Calculate excess amount based ONLY on paid payments
//   let excessAmount = 0;
//   let isExcess = false;
  
//   if (totalPaidBaseAmount > workOrderAmount) {
//     excessAmount = totalPaidBaseAmount - workOrderAmount;
//     isExcess = true;
//   }
  
//   return {
//     work_order_amount: workOrderAmount,
//     total_paid_base_amount: totalPaidBaseAmount, // Only paid amount
//     excess_amount: excessAmount,
//     is_excess: isExcess,
//     excess_percentage: workOrderAmount > 0 
//       ? ((excessAmount / workOrderAmount) * 100).toFixed(2)
//       : "0.00",
//     breakdown: {
//       original_work_order: workOrderAmount,
//       total_paid_so_far: totalPaidBaseAmount,
//       difference: totalPaidBaseAmount - workOrderAmount,
//       status: totalPaidBaseAmount > workOrderAmount ? 'over_invoiced' : 
//              totalPaidBaseAmount === workOrderAmount ? 'fully_invoiced' : 'under_invoiced'
//     }
//   };
// }

// exports.raiseInvoice = async (req, res) => {
//   try {
//     const { number, cgst = 0, sgst = 0, igst = 0, gst_type = "Exclusive" } = req.body;
//     const created_by = req.user?.id || null;

//     if (!number) {
//       return res.status(400).json({ success: false, message: "number is required" });
//     }

//     // 🔍 Detect automatically: Purchase Order or Work Order FIRST
//     let record = await PurchaseOrder.findOne({
//       where: { po_number: number },
//       include: [
//         {
//           model: require("../models/purchase_order_item.model"),
//           as: "line_items",
//           attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//         },
//         {
//           model: require("../models/branch.model"),
//           as: "branch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//       ],
//     });

//     let type = "PO";
//     let baseAmount = 0;

//     if (!record) {
//       record = await WorkOrder.findOne({
//         where: { wo_number: number },
//         include: [
//           {
//             association: "services",
//             attributes: [
//               "id",
//               "service_code",
//               "description",
//               "unit",
//               "quantity",
//               "rate",
//               "amount",
//             ],
//           },
//         ],
//       });
//       if (!record) {
//         return res.status(404).json({
//           success: false,
//           message: "No matching Work Order or Purchase Order found for this number",
//         });
//       }

//       type = "WO";
//       baseAmount = parseFloat(record.work_order_amount || record.amount || 0);
//     } else {
//       baseAmount = parseFloat(record.total_amount || 0);
//     }

//     // Get payment breakdown BEFORE calculating GST
//     const paymentBreakdown = await getPaymentBreakdown(number, type === "WO");
    
//     // ============================================
//     // IMPORTANT: If payments already exist, use their GST rates
//     // ============================================
//     let finalCgst = cgst;
//     let finalSgst = sgst;
//     let finalIgst = igst;
//     let finalGstType = gst_type;

//     if (paymentBreakdown.payments.length > 0) {
//       // Use GST rates from the first payment (assuming all payments have same rates)
//       const firstPayment = paymentBreakdown.payments[0];
      
//       // Only override if no GST rates were provided in request
//       if (cgst === 0 && sgst === 0 && igst === 0) {
//         finalCgst = parseFloat(firstPayment.cgst || 0);
//         finalSgst = parseFloat(firstPayment.sgst || 0);
//         finalIgst = parseFloat(firstPayment.igst || 0);
//         finalGstType = firstPayment.gst_type || "Exclusive";
//       }
      
//       console.log(`Using GST rates from existing payments: CGST=${finalCgst}%, SGST=${finalSgst}%, IGST=${finalIgst}%, Type=${finalGstType}`);
//     }

//     // Calculate GST based on the base amount with correct rates
//     const { gstAmount, totalAmount } = calculateGST(baseAmount, finalCgst, finalSgst, finalIgst, finalGstType);

//     // Calculate remaining amount
//     const totalReceived = paymentBreakdown.total_received;
//     const remainingAmount = Math.max(0, totalAmount - totalReceived);

//     // Calculate excess for Purchase Orders too
//     let excessSummary = {};
//     if (type === "PO") {
//       const poTotal = baseAmount;
//       const totalPaidBaseAmount = paymentBreakdown.total_paid_base_amount || 0;
      
//       let excessAmount = 0;
//       let isExcess = false;
      
//       if (totalPaidBaseAmount > poTotal) {
//         excessAmount = totalPaidBaseAmount - poTotal;
//         isExcess = true;
//       }
      
//       excessSummary = {
//         purchase_order_amount: poTotal,
//         total_paid_base_amount: totalPaidBaseAmount,
//         excess_amount: excessAmount,
//         is_excess: isExcess,
//         excess_percentage: poTotal > 0 
//           ? ((excessAmount / poTotal) * 100).toFixed(2)
//           : "0.00",
//         breakdown: {
//           original_purchase_order: poTotal,
//           total_paid_so_far: totalPaidBaseAmount,
//           difference: totalPaidBaseAmount - poTotal,
//           status: totalPaidBaseAmount > poTotal ? 'over_invoiced' : 
//                  totalPaidBaseAmount === poTotal ? 'fully_invoiced' : 'under_invoiced'
//         }
//       };
//     } else if (type === "WO") {
//       // For Work Orders
//       excessSummary = await calculateExcessAmount(record, paymentBreakdown);
//     }

//     // 🔹 Check if invoice already exists (include soft-deleted)
//     let existingInvoice = await Invoice.findOne({
//       where: { number },
//       paranoid: false,
//     });

//     // 🛑 If invoice exists and not deleted — just return it with payment breakdown
//     if (existingInvoice && !existingInvoice.deleted_at) {
//       // Update remaining amount based on actual payments
//       await existingInvoice.update({
//         remaining_amount: remainingAmount,
//         base_amount: baseAmount,
//         gst_amount: gstAmount,
//         cgst: finalCgst,
//         sgst: finalSgst,
//         igst: finalIgst,
//         total_amount: totalAmount,
//         gst_type: finalGstType
//       });

//       // 🔹 Fetch the full invoice with associations
//       const fullInvoice = await Invoice.findOne({
//         where: { id: existingInvoice.id },
//         include:
//           type === "WO"
//             ? [
//                 {
//                   model: WorkOrder,
//                   as: "workOrder",
//                   include: [
//                     {
//                       association: "services",
//                       attributes: [
//                         "id",
//                         "service_code",
//                         "description",
//                         "unit",
//                         "quantity",
//                         "rate",
//                         "amount",
//                       ],
//                     },
//                   ],
//                 },
//               ]
//             : [
//                 {
//                   model: PurchaseOrder,
//                   as: "purchaseOrder",
//                   include: [
//                     {
//                       model: require("../models/purchase_order_item.model"),
//                       as: "line_items",
//                       attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//                     },
//                     {
//                       model: require("../models/branch.model"),
//                       as: "branch",
//                       attributes: ["id", "name", "branch_address", "contact_number"],
//                     },
//                   ],
//                 },
//               ],
//       });

//       // Prepare response data
//       const responseData = {
//         ...fullInvoice.toJSON(),
//         payment_summary: {
//           ...paymentBreakdown,
//           remaining_amount: remainingAmount,
//           invoice_total: totalAmount,
//           balance_status: remainingAmount === 0 ? 'paid' : 
//                         remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
//         }
//       };

//       // Add excess amount information
//       if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
//         responseData.excess_summary = excessSummary;
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Invoice updated with latest calculations",
//         data: responseData
//       });
//     }

//     // 🔁 If soft-deleted, restore AND UPDATE it with fresh values
//     if (existingInvoice && existingInvoice.deleted_at) {
//       await existingInvoice.restore();
      
//       // Update with current values (considering payments already made)
//       await existingInvoice.update({
//         payment_amount: baseAmount,
//         base_amount: baseAmount,
//         gst_amount: gstAmount,
//         cgst: finalCgst,
//         sgst: finalSgst,
//         igst: finalIgst,
//         total_amount: totalAmount,
//         remaining_amount: remainingAmount,
//         gst_type: finalGstType,
//         updated_by: created_by,
//         deleted_at: null,
//       });

//       // 🔹 Fetch the updated invoice with associations
//       const updatedInvoice = await Invoice.findOne({
//         where: { id: existingInvoice.id },
//         include:
//           type === "WO"
//             ? [
//                 {
//                   model: WorkOrder,
//                   as: "workOrder",
//                   include: [
//                     {
//                       association: "services",
//                       attributes: [
//                         "id",
//                         "service_code",
//                         "description",
//                         "unit",
//                         "quantity",
//                         "rate",
//                         "amount",
//                       ],
//                     },
//                   ],
//                 },
//               ]
//             : [
//                 {
//                   model: PurchaseOrder,
//                   as: "purchaseOrder",
//                   include: [
//                     {
//                       model: require("../models/purchase_order_item.model"),
//                       as: "line_items",
//                       attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//                     },
//                     {
//                       model: require("../models/branch.model"),
//                       as: "branch",
//                       attributes: ["id", "name", "branch_address", "contact_number"],
//                     },
//                   ],
//                 },
//               ],
//       });

//       // Prepare response data
//       const responseData = {
//         ...updatedInvoice.toJSON(),
//         payment_summary: {
//           ...paymentBreakdown,
//           remaining_amount: remainingAmount,
//           invoice_total: totalAmount,
//           balance_status: remainingAmount === 0 ? 'paid' : 
//                         remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
//         }
//       };

//       // Add excess amount information
//       if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
//         responseData.excess_summary = excessSummary;
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Invoice restored and updated successfully",
//         data: responseData
//       });
//     }

//     // ✅ Create new invoice (only if it doesn't exist at all)
//     const newInvoice = await Invoice.create({
//       number,
//       payment_amount: baseAmount,
//       base_amount: baseAmount,
//       gst_amount: gstAmount,
//       cgst: finalCgst,
//       sgst: finalSgst,
//       igst: finalIgst,
//       total_amount: totalAmount,
//       remaining_amount: remainingAmount,
//       gst_type: finalGstType,
//       created_by,
//     });

//     // 🔹 Fetch full invoice details with associations
//     const fullInvoice = await Invoice.findOne({
//       where: { id: newInvoice.id },
//       include:
//         type === "WO"
//           ? [
//               {
//                 model: WorkOrder,
//                 as: "workOrder",
//                 include: [
//                   {
//                     association: "services",
//                     attributes: [
//                       "id",
//                       "service_code",
//                       "description",
//                       "unit",
//                       "quantity",
//                       "rate",
//                       "amount",
//                     ],
//                   },
//                 ],
//               },
//             ]
//           : [
//               {
//                 model: PurchaseOrder,
//                 as: "purchaseOrder",
//                 include: [
//                   {
//                     model: require("../models/purchase_order_item.model"),
//                     as: "line_items",
//                     attributes: ["id", "item_name", "quantity", "unit_price", "line_total", "unit_id"],
//                   },
//                   {
//                     model: require("../models/branch.model"),
//                     as: "branch",
//                     attributes: ["id", "name", "branch_address", "contact_number"],
//                   },
//                 ],
//               },
//             ],
//     });

//     // Prepare response data
//     const responseData = {
//       ...fullInvoice.toJSON(),
//       payment_summary: {
//         ...paymentBreakdown,
//         remaining_amount: remainingAmount,
//         invoice_total: totalAmount,
//         balance_status: remainingAmount === 0 ? 'paid' : 
//                       remainingAmount === totalAmount ? 'unpaid' : 'partially_paid'
//       }
//     };

//     // Add excess amount information
//     if ((type === "WO" || type === "PO") && excessSummary.is_excess) {
//       responseData.excess_summary = excessSummary;
//     }

//     return res.status(201).json({
//       success: true,
//       message: `${type === "PO" ? "Purchase Order" : "Work Order"} Invoice created successfully`,
//       data: responseData,
//     });
//   } catch (err) {
//     console.error("Invoice Raise Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// exports.getInvoices = async (req, res) => {
//   try {
//     const { number, status, type, start_date, end_date } = req.query;

//     const where = {};
//     if (number) where.number = { [Op.like]: `%${number}%` };
//     if (status) where.status = status;
    
//     // Date filtering
//     if (start_date || end_date) {
//       where.created_at = {};
//       if (start_date) where.created_at[Op.gte] = new Date(start_date);
//       if (end_date) where.created_at[Op.lte] = new Date(end_date);
//     }

//     const invoices = await Invoice.findAll({
//       where,
//       order: [["created_at", "DESC"]],
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           required: false,
//           include: [
//             {
//               association: "services",
//               attributes: [
//                 "id",
//                 "service_code",
//                 "description",
//                 "unit",
//                 "quantity",
//                 "rate",
//                 "amount",
//               ],
//             },
//             {
//               association: "assignedBranch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           required: false,
//           include: [
//             {
//               model: require("../models/purchase_order_item.model"),
//               as: "line_items",
//               attributes: [
//                 "id",
//                 "item_name",
//                 "quantity",
//                 "unit_price",
//                 "line_total",
//                 "unit_id",
//               ],
//             },
//             {
//               model: require("../models/branch.model"),
//               as: "branch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//       ],
//     });

//     // Add payment breakdown and excess amount to each invoice
//     const invoicesWithPayments = await Promise.all(
//       invoices.map(async (invoice) => {
//         // Determine if it's WO or PO
//         const isWO = invoice.number.startsWith('WO-') || (invoice.workOrder && !invoice.purchaseOrder);
//         const paymentBreakdown = await getPaymentBreakdown(invoice.number, isWO);
        
//         const totalReceived = paymentBreakdown.total_received;
//         const remainingAmount = Math.max(0, parseFloat(invoice.total_amount) - totalReceived);
        
//         // Prepare basic response
//         const response = {
//           ...invoice.toJSON(),
//           payment_summary: {
//             ...paymentBreakdown,
//             remaining_amount: remainingAmount,
//             invoice_total: invoice.total_amount,
//             balance_status: remainingAmount === 0 ? 'paid' : 
//                           remainingAmount === parseFloat(invoice.total_amount) ? 'unpaid' : 'partially_paid'
//           }
//         };

//         // Add excess amount information ONLY for Work Orders with excess from PAID payments
//         if (isWO && invoice.workOrder) {
//           const excessSummary = await calculateExcessAmount(invoice.workOrder, paymentBreakdown);
          
//           // Only show excess_summary if there's actual excess from PAID payments
//           if (excessSummary.is_excess) {
//             response.excess_summary = excessSummary;
//           }
//         }

//         return response;
//       })
//     );

//     return res.json({ success: true, data: invoicesWithPayments });
//   } catch (err) {
//     console.error("Get Invoices Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };
// exports.getInvoiceById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const invoice = await Invoice.findByPk(id, {
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           include: [
//             {
//               association: "services",
//               attributes: [
//                 "id",
//                 "service_code",
//                 "description",
//                 "unit",
//                 "quantity",
//                 "rate",
//                 "amount",
//               ],
//             },
//             {
//               association: "assignedBranch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           include: [
//             {
//               model: require("../models/purchase_order_item.model"),
//               as: "line_items",
//               attributes: [
//                 "id",
//                 "item_name",
//                 "quantity",
//                 "unit_price",
//                 "line_total",
//                 "unit_id",
//               ],
//             },
//             {
//               model: require("../models/branch.model"),
//               as: "branch",
//               attributes: ["id", "name", "branch_address", "contact_number"],
//             },
//           ],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Invoice not found" });
//     }

//     return res.json({ success: true, data: invoice });
//   } catch (err) {
//     console.error("Get Invoice Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: "workOrder",
          include: [
            {
              association: "services",
              attributes: [
                "id",
                "service_code",
                "description",
                "unit",
                "quantity",
                "rate",
                "amount",
              ],
            },
            {
              association: "assignedBranch",
              attributes: ["id", "name", "branch_address", "contact_number"],
            },
          ],
        },
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          include: [
            {
              model: require("../models/purchase_order_item.model"),
              as: "line_items",
              attributes: [
                "id",
                "item_name",
                "quantity",
                "unit_price",
                "line_total",
                "unit_id",
              ],
            },
            {
              model: require("../models/branch.model"),
              as: "branch",
              attributes: ["id", "name", "branch_address", "contact_number"],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // 🔥 Determine type
    const isWO =
      invoice.workOrder ||
      invoice.number?.startsWith("WO-");

    // ✅ Use EXISTING helper (this was the bug)
    const paymentBreakdown = await getPaymentBreakdown(
      invoice.number,
      isWO
    );

    const totalReceived = paymentBreakdown.total_received;
    const remainingAmount = Math.max(
      0,
      parseFloat(invoice.total_amount) - totalReceived
    );

    let excessSummary = null;

    // ✅ Work Order excess
    if (isWO && invoice.workOrder) {
      const excess = await calculateExcessAmount(
        invoice.workOrder,
        paymentBreakdown,
        {
          cgst: invoice.cgst,
          sgst: invoice.sgst,
          igst: invoice.igst,
          gst_type: invoice.gst_type,
        }
      );

      if (excess.is_excess) {
        excessSummary = excess;
      }
    }

    // ✅ Purchase Order excess (same logic as raiseInvoice)
    if (!isWO && invoice.purchaseOrder) {
      const poTotal = parseFloat(invoice.base_amount || 0);
      const paidBase = paymentBreakdown.total_paid_base_amount || 0;

      if (paidBase > poTotal) {
        excessSummary = {
          purchase_order_amount: poTotal,
          total_paid_base_amount: paidBase,
          excess_amount: paidBase - poTotal,
          ...calculateExcessWithGST(
            paidBase - poTotal,
            invoice.cgst,
            invoice.sgst,
            invoice.igst,
            invoice.gst_type
          ),
          is_excess: true,
        };
      }
    }

    return res.json({
      success: true,
      data: {
        ...invoice.toJSON(),
        payment_summary: {
          ...paymentBreakdown,
          remaining_amount: remainingAmount,
          invoice_total: invoice.total_amount,
          balance_status:
            remainingAmount === 0
              ? "paid"
              : remainingAmount === parseFloat(invoice.total_amount)
              ? "unpaid"
              : "partially_paid",
        },
        ...(excessSummary && { excess_summary: excessSummary }),
      },
    });
  } catch (err) {
    console.error("Get Invoice Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_amount, cgst, sgst, igst, gst_type, status } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    let baseAmount = parseFloat(payment_amount || invoice.base_amount);
    const { gstAmount, totalAmount } = calculateGST(baseAmount, cgst || invoice.cgst, sgst || invoice.sgst, igst || invoice.igst, gst_type || invoice.gst_type);

    invoice.payment_amount = baseAmount;
    invoice.base_amount = baseAmount;
    invoice.cgst = cgst || invoice.cgst;
    invoice.sgst = sgst || invoice.sgst;
    invoice.igst = igst || invoice.igst;
    invoice.gst_amount = gstAmount;
    invoice.total_amount = totalAmount;
    invoice.remaining_amount = totalAmount;
    invoice.gst_type = gst_type || invoice.gst_type;
    invoice.status = status || invoice.status;

    await invoice.save();

    return res.json({ success: true, message: "Invoice updated successfully", data: invoice });
  } catch (err) {
    console.error("Update Invoice Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    // Hard delete (force: true)
    await invoice.destroy({ force: true });
    return res.json({ success: true, message: "Invoice permanently deleted successfully" });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};






const ExpensesNew = require("../models/expenseNew.model");
const ExpenseCategory = require("../models/expenseCategory.model");
const Employee = require("../models/employee.model");
const Payslip = require("../models/payslip.model");
const Branch = require("../models/branch.model");
const Department = require("../models/department.model");
const Designation = require("../models/designation.model");
const PurchaseOrderItem = require("../models/purchase_order_item.model");
const Unit = require("../models/unit.model");


exports.getWorkOrderInvoiceDetails = async (req, res) => {
  try {
    const { wo_number } = req.params;
    const { branch_id } = req.query;

    if (!wo_number)
      return res.status(400).json({ success: false, message: "wo_number is required" });

    // 🔹 Find Work Order
    const workOrder = await WorkOrder.findOne({ where: { wo_number } });
    if (!workOrder)
      return res.status(404).json({ success: false, message: "Work order not found" });

    const activeBranch = branch_id || workOrder.assigned_to;

    // ============================
    // 🔹 Work Order Invoices
    // ============================
    const invoices = await WorkOrderInvoice.findAll({
      where: { wo_number },
      order: [["created_at", "ASC"]],
      raw: true,
    });

    let totalBaseReceived = 0,
      totalGSTReceived = 0,
      totalInvoiceAmount = 0;

    invoices.forEach((inv) => {
      const baseAmt = parseFloat(inv.base_amount || inv.payment_amount || 0);
      const gstAmt = parseFloat(inv.gst_amount || 0);
      const totalAmt = parseFloat(inv.total_amount || baseAmt + gstAmt);

      totalBaseReceived += baseAmt;
      totalGSTReceived += gstAmt;
      totalInvoiceAmount += totalAmt;

      inv.base_amount = baseAmt.toFixed(2);
      inv.gst_amount = gstAmt.toFixed(2);
      inv.total_amount = totalAmt.toFixed(2);
    });

    const workOrderAmount = parseFloat(workOrder.amount || 0);
    const remainingAmount = Math.max(workOrderAmount - totalBaseReceived, 0);

    const gstRate = invoices.length
      ? (parseFloat(invoices[0].cgst || 0) +
          parseFloat(invoices[0].sgst || 0) +
          parseFloat(invoices[0].igst || 0)) / 100
      : 0;

    const baseAmountWithGST = (workOrderAmount * (1 + gstRate)).toFixed(2);

    // ============================
    // 🔹 Branch-wise Expenses
    // ============================
    const expenses = await ExpensesNew.findAll({
      where: { branch_id: activeBranch, is_deleted: 1 },
      attributes: [
        "id",
        "payment_date",
        "subtotal",
        "tax_total",
        "total_amount",
        "payments_status",
        "description",
        "category_id",
        "document",
      ],
      order: [["payment_date", "DESC"]],
      raw: true,
    });

    const taxableExpenses = expenses.filter(
      (exp) => parseFloat(exp.tax_total || 0) > 0
    );
    const nonTaxableExpenses = expenses.filter(
      (exp) => parseFloat(exp.tax_total || 0) === 0
    );

    const totalTaxable = taxableExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.total_amount || 0),
      0
    );
    const totalNonTaxable = nonTaxableExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.total_amount || 0),
      0
    );
    const totalExpenses = totalTaxable + totalNonTaxable;

    // ============================
    // 🔹 Payslips
    // ============================
    const employees = await Employee.findAll({
      where: { branch_id: activeBranch },
      include: [
        { model: Branch, as: "branch", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Designation, as: "designation", attributes: ["id", "name"] },
      ],
      attributes: ["id", "name", "employee_id", "salary", "salary_type"],
      raw: false,
    });

    const employeeBusinessIds = employees.map((e) => e.employee_id);

    const payslipsData = await Payslip.findAll({
      where: {
        employee_id: { [Op.in]: employeeBusinessIds.length ? employeeBusinessIds : [0] },
        is_deleted: 0,
      },
      attributes: [
        "id",
        "employee_id",
        "salary_month",
        "basic_salary",
        "allowance",
        "commission",
        "overtime",
        "other_payment",
        "loan",
        "saturation_deduction",
        "net_payble",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      raw: true,
    });

    let totalSalaries = 0;

    const payslips = employees.map((emp) => {
      const empPayslip = payslipsData.find((p) => p.employee_id === emp.employee_id);
      
      let netSalary = 0;
      let basicSalary = 0;
      let totalAdditions = 0;
      let totalDeductions = 0;
      
      if (empPayslip) {
        basicSalary = parseFloat(empPayslip.basic_salary || 0);
        const allowance = parseFloat(empPayslip.allowance || 0);
        const commission = parseFloat(empPayslip.commission || 0);
        const overtime = parseFloat(empPayslip.overtime || 0);
        const otherPayment = parseFloat(empPayslip.other_payment || 0);
        const loan = parseFloat(empPayslip.loan || 0);
        const saturationDeduction = parseFloat(empPayslip.saturation_deduction || 0);
        
        totalAdditions = allowance + commission + overtime + otherPayment;
        totalDeductions = loan + saturationDeduction;
        netSalary = parseFloat(empPayslip.net_payble || 0);
      } else {
        basicSalary = parseFloat(emp.salary || 0);
        netSalary = basicSalary;
      }
      
      totalSalaries += netSalary;

      return {
        employee_id: emp.employee_id,
        employee_name: emp.name,
        branch: emp.branch ? emp.branch.name : null,
        department: emp.department ? emp.department.name : null,
        designation: emp.designation ? emp.designation.name : null,
        salary_month: empPayslip ? empPayslip.salary_month : "Current",
        basic_salary: basicSalary,
        allowance: empPayslip ? parseFloat(empPayslip.allowance || 0) : 0,
        commission: empPayslip ? parseFloat(empPayslip.commission || 0) : 0,
        overtime: empPayslip ? parseFloat(empPayslip.overtime || 0) : 0,
        other_payment: empPayslip ? parseFloat(empPayslip.other_payment || 0) : 0,
        loan: empPayslip ? parseFloat(empPayslip.loan || 0) : 0,
        saturation_deduction: empPayslip ? parseFloat(empPayslip.saturation_deduction || 0) : 0,
        net_payble: netSalary.toFixed(2),
        status: empPayslip
          ? empPayslip.status == 1
            ? "paid"
            : "unpaid"
          : "no_payslip",
        salary_type: emp.salary_type,
        has_payslip: !!empPayslip,
        calculation: {
          total_additions: totalAdditions,
          total_deductions: totalDeductions,
          net_salary: netSalary
        }
      };
    });

    // ============================
    // 🔹 Dynamic Purchase Order Income (by branch)
    // ============================
    const purchaseOrderInvoices = await PurchaseOrderInvoice.findAll({
      include: [
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          attributes: [],
          where: { branch_id: activeBranch },
        },
      ],
      attributes: ["total_amount"],
      raw: true,
    });

    const purchaseOrderIncome = purchaseOrderInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    const workOrderIncome = totalInvoiceAmount;
    const totalBranchIncome = workOrderIncome + purchaseOrderIncome;

    // 🟢 Profit Calculation
    const totalIncome = totalBranchIncome;
    const totalCosts = totalExpenses + totalSalaries;
    const netProfit = totalIncome - totalCosts;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // ============================
    // ✅ Final Response (format unchanged)
    // ============================
    return res.json({
      success: true,
      data: {
        wo_number: workOrder.wo_number,
        branch_id: activeBranch,
        workOrder: {
          id: workOrder.id,
          title: workOrder.title,
          amount: workOrderAmount.toFixed(2),
        },
        base_amount_with_gst: baseAmountWithGST,
        total_received: totalBaseReceived.toFixed(2),
        remaining_amount: remainingAmount.toFixed(2),
        total_invoice_amount: totalInvoiceAmount.toFixed(2),
        total_expenses: totalExpenses.toFixed(2),
        total_taxable_expenses: totalTaxable.toFixed(2),
        total_non_taxable_expenses: totalNonTaxable.toFixed(2),
        total_salaries: totalSalaries.toFixed(2),

        profit_calculation: {
          total_income: totalIncome.toFixed(2),
          total_costs: totalCosts.toFixed(2),
          net_profit: netProfit.toFixed(2),
          profit_margin: profitMargin.toFixed(2) + '%',
          formula: `Income(${totalIncome}) - Expenses(${totalExpenses}) - Salaries(${totalSalaries}) = ${netProfit}`
        },

        // // ✅ Added dynamic branch income summary
        // branch_income_summary: {
        //   [activeBranch]: {
        //     branch_id: activeBranch,
        //     work_order_income: workOrderIncome,
        //     purchase_order_income: purchaseOrderIncome,
        //     total_branch_income: totalBranchIncome
        //   }
        // },
        // ✅ Added dynamic branch income summary (with branch name)
branch_wise_income: {
  [ (await Branch.findByPk(activeBranch, { attributes: ["name"], raw: true }) )?.name || `Branch_${activeBranch}` ]: {
    branch_id: activeBranch,
    purchase_order_income: purchaseOrderIncome,
    work_order_income: workOrderIncome,
    total_branch_income: totalBranchIncome
  }
},


        invoices,
        taxable_expenses: taxableExpenses,
        non_taxable_expenses: nonTaxableExpenses,
        payslips,
      },
    });
  } catch (error) {
    console.error("Get Work Order Invoice Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch work order details",
      error: error.message,
    });
  }
};
exports.getPurchaseOrderInvoiceDetails = async (req, res) => {
  try {
    const { po_number } = req.params;
    const { branch_id } = req.query;

    if (!po_number)
      return res.status(400).json({ success: false, message: "po_number is required" });

    // 🔹 Find Purchase Order
    const purchaseOrder = await PurchaseOrder.findOne({ 
      where: { po_number },
      include: [
        {
          model: PurchaseOrderItem,
          as: "line_items",
          include: [
            {
              model: Unit,
              as: "unit",
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });
    
    if (!purchaseOrder)
      return res.status(404).json({ success: false, message: "Purchase order not found" });

    const activeBranch = branch_id || purchaseOrder.branch_id;

    // ============================
    // 🔹 Purchase Order Invoices
    // ============================
    const invoices = await PurchaseOrderInvoice.findAll({
      where: { po_number },
      order: [["created_at", "ASC"]],
      raw: true,
    });

    let totalBaseReceived = 0,
      totalGSTReceived = 0,
      totalInvoiceAmount = 0;

    invoices.forEach((inv) => {
      const baseAmt = parseFloat(inv.base_amount || inv.payment_amount || 0);
      const gstAmt = parseFloat(inv.gst_amount || 0);
      const totalAmt = parseFloat(inv.total_amount || baseAmt + gstAmt);

      totalBaseReceived += baseAmt;
      totalGSTReceived += gstAmt;
      totalInvoiceAmount += totalAmt;

      inv.base_amount = baseAmt.toFixed(2);
      inv.gst_amount = gstAmt.toFixed(2);
      inv.total_amount = totalAmt.toFixed(2);
    });

    const purchaseOrderAmount = parseFloat(purchaseOrder.total_amount || 0);
    const remainingAmount = Math.max(purchaseOrderAmount - totalBaseReceived, 0);

    const gstRate = invoices.length
      ? (parseFloat(invoices[0].cgst || 0) +
          parseFloat(invoices[0].sgst || 0) +
          parseFloat(invoices[0].igst || 0)) / 100
      : 0;

    const baseAmountWithGST = (purchaseOrderAmount * (1 + gstRate)).toFixed(2);

    // ============================
    // 🔹 Branch-wise Expenses
    // ============================
    const expenses = await ExpensesNew.findAll({
      where: { branch_id: activeBranch, is_deleted: 1 },
      attributes: [
        "id",
        "payment_date",
        "subtotal",
        "tax_total",
        "total_amount",
        "payments_status",
        "description",
        "category_id",
        "document",
      ],
      order: [["payment_date", "DESC"]],
      raw: true,
    });

    const taxableExpenses = expenses.filter(
      (exp) => parseFloat(exp.tax_total || 0) > 0
    );
    const nonTaxableExpenses = expenses.filter(
      (exp) => parseFloat(exp.tax_total || 0) === 0
    );

    const totalTaxable = taxableExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.total_amount || 0),
      0
    );
    const totalNonTaxable = nonTaxableExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.total_amount || 0),
      0
    );
    const totalExpenses = totalTaxable + totalNonTaxable;

    // ============================
    // 🔹 Payslips with full breakdown
    // ============================
    const employees = await Employee.findAll({
      where: { branch_id: activeBranch },
      include: [
        { model: Branch, as: "branch", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Designation, as: "designation", attributes: ["id", "name"] },
      ],
      attributes: ["id", "name", "employee_id", "salary", "salary_type"],
      raw: false,
    });

    const employeeBusinessIds = employees.map((e) => e.employee_id);

    const payslipsData = await Payslip.findAll({
      where: {
        employee_id: { [Op.in]: employeeBusinessIds.length ? employeeBusinessIds : [0] },
        is_deleted: 0,
      },
      attributes: [
        "id",
        "employee_id",
        "salary_month",
        "basic_salary",
        "allowance",
        "commission",
        "overtime",
        "other_payment",
        "loan",
        "saturation_deduction",
        "net_payble",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      raw: true,
    });

    let totalSalaries = 0;

    const payslips = employees.map((emp) => {
      const empPayslip = payslipsData.find((p) => p.employee_id === emp.employee_id);
      
      let netSalary = 0;
      let basicSalary = 0;
      let totalAdditions = 0;
      let totalDeductions = 0;
      
      if (empPayslip) {
        basicSalary = parseFloat(empPayslip.basic_salary || 0);
        const allowance = parseFloat(empPayslip.allowance || 0);
        const commission = parseFloat(empPayslip.commission || 0);
        const overtime = parseFloat(empPayslip.overtime || 0);
        const otherPayment = parseFloat(empPayslip.other_payment || 0);
        const loan = parseFloat(empPayslip.loan || 0);
        const saturationDeduction = parseFloat(empPayslip.saturation_deduction || 0);
        
        totalAdditions = allowance + commission + overtime + otherPayment;
        totalDeductions = loan + saturationDeduction;
        netSalary = parseFloat(empPayslip.net_payble || 0);
      } else {
        basicSalary = parseFloat(emp.salary || 0);
        netSalary = basicSalary;
      }
      
      totalSalaries += netSalary;

      return {
        employee_id: emp.employee_id,
        employee_name: emp.name,
        branch: emp.branch ? emp.branch.name : null,
        department: emp.department ? emp.department.name : null,
        designation: emp.designation ? emp.designation.name : null,
        salary_month: empPayslip ? empPayslip.salary_month : "Current",
        basic_salary: basicSalary,
        allowance: empPayslip ? parseFloat(empPayslip.allowance || 0) : 0,
        commission: empPayslip ? parseFloat(empPayslip.commission || 0) : 0,
        overtime: empPayslip ? parseFloat(empPayslip.overtime || 0) : 0,
        other_payment: empPayslip ? parseFloat(empPayslip.other_payment || 0) : 0,
        loan: empPayslip ? parseFloat(empPayslip.loan || 0) : 0,
        saturation_deduction: empPayslip ? parseFloat(empPayslip.saturation_deduction || 0) : 0,
        net_payble: netSalary.toFixed(2),
        status: empPayslip
          ? empPayslip.status == 1
            ? "paid"
            : "unpaid"
          : "no_payslip",
        salary_type: emp.salary_type,
        has_payslip: !!empPayslip,
        calculation: {
          total_additions: totalAdditions,
          total_deductions: totalDeductions,
          net_salary: netSalary
        }
      };
    });

    // ============================
    // 🔹 Dynamic Work Order Income (by branch)
    // ============================
    const workOrderInvoices = await WorkOrderInvoice.findAll({
      include: [
        {
          model: WorkOrder,
          as: "workOrder",
          attributes: [],
          where: { assigned_to: activeBranch },
        },
      ],
      attributes: ["total_amount"],
      raw: true,
    });

    const workOrderIncome = workOrderInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    const purchaseOrderIncome = totalInvoiceAmount;
    const totalBranchIncome = workOrderIncome + purchaseOrderIncome;

    // 🟢 CALCULATE PROFIT
    const totalIncome = totalBranchIncome;
    const totalCosts = totalExpenses + totalSalaries;
    const netProfit = totalIncome - totalCosts;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // ============================
    // ✅ Final Response
    // ============================
    return res.json({
      success: true,
      data: {
        po_number: purchaseOrder.po_number,
        branch_id: activeBranch,
        purchaseOrder: {
          id: purchaseOrder.id,
          title: purchaseOrder.title,
          vendor_name: purchaseOrder.vendor_name,
          total_amount: purchaseOrderAmount.toFixed(2),
          items: purchaseOrder.line_items ? purchaseOrder.line_items.map(item => ({
            id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            unit: item.unit ? item.unit.name : null
          })) : []
        },

        // Income
        base_amount_with_gst: baseAmountWithGST,
        total_received: totalBaseReceived.toFixed(2),
        remaining_amount: remainingAmount.toFixed(2),
        total_invoice_amount: totalInvoiceAmount.toFixed(2),

        // Expenses
        total_expenses: totalExpenses.toFixed(2),
        total_taxable_expenses: totalTaxable.toFixed(2),
        total_non_taxable_expenses: totalNonTaxable.toFixed(2),

        // Salaries (NET)
        total_salaries: totalSalaries.toFixed(2),

        // ✅ Profit Calculation
        profit_calculation: {
          total_income: totalIncome.toFixed(2),
          total_costs: totalCosts.toFixed(2),
          net_profit: netProfit.toFixed(2),
          profit_margin: profitMargin.toFixed(2) + '%',
          formula: `Income(${totalIncome}) - Expenses(${totalExpenses}) - Salaries(${totalSalaries}) = ${netProfit}`
        },

        // ✅ Added dynamic branch income summary
        branch_income_summary: {
          [activeBranch]: {
            branch_id: activeBranch,
            purchase_order_income: purchaseOrderIncome,
            work_order_income: workOrderIncome,
            total_branch_income: totalBranchIncome
          }
        },

        // Detailed Lists
        invoices,
        taxable_expenses: taxableExpenses,
        non_taxable_expenses: nonTaxableExpenses,
        payslips,
      },
    });
  } catch (error) {
    console.error("Get Purchase Order Invoice Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order details",
      error: error.message,
    });
  }
};
