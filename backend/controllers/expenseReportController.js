

// const { Op } = require("sequelize");
// const dayjs = require("dayjs");
// const ExpenseNew = require("../models/expenseNew.model");
// const Branch = require("../models/branch.model");
// const Employee = require("../models/employee.model");


const { Op } = require("sequelize");
const dayjs = require("dayjs");


const ExpenseNew = require("../models/expenseNew.model");
const WorkOrderInvoice = require('../models/work_order_invoice.model');
const WorkOrder = require('../models/workOrder.model');
const PurchaseOrderInvoice = require('../models/purchase_order_invoice.model');
const PurchaseOrder = require('../models/purchase_order.model');
const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const BranchWallet = require('../models/branchWallet.model');
// Month name → number mapping
const MONTH_MAP = {
  January: 1, February: 2, March: 3,
  April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9,
  October: 10, November: 11, December: 12
};

async function getUserBranchId(userId) {
  const emp = await Employee.findOne({ where: { user_id: userId }, attributes: ["branch_id"], raw: true });
  return emp?.branch_id || null;
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

async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["created_by"], raw: true });
  if (emp?.created_by) return emp.created_by;

  const user = await User.findOne({ where: { id: req.user.id }, attributes: ["created_by"], raw: true });
  if (user?.created_by) return user.created_by;

  return req.user.id;
}

async function getUserBranch(req) {
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["branch_id", "created_by"],
    raw: true,
  });
  return emp; // null if not branch-based
}

exports.getExpenseSummary = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { year, branch_id, branch_ids } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // ======= Dynamic quarters input =======
    // Input example: quarter_ranges = "January-March,April-June,July-September,October-December"
    const quarterInput = req.query.quarter_ranges || "January-March,April-June,July-September,October-December";
    const quarters = quarterInput.split(",").map((q, idx) => {
      const [startName, endName] = q.split("-").map(s => s.trim());
      return { start: MONTH_MAP[startName], end: MONTH_MAP[endName], key: `Q${idx + 1}`, label: q };
    });

    // ======= Base query =======
    const where = { is_deleted: false, payment_date: { [Op.between]: [`${selectedYear}-01-01`, `${selectedYear}-12-31`] } };

    // ======= Branch filtering =======
    let branchWhere = {};
    const userType = (req.user.type || '').toLowerCase();

    if (isSuper(req) || ["company","admin","branch manager","accountant"].includes(userType)) {
      if (branch_id) branchWhere.id = branch_id;
      else if (branch_ids) branchWhere.id = { [Op.in]: branch_ids.split(",").map(i => parseInt(i.trim())).filter(Boolean) };
    } else if (isEmployee(req)) {
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) return res.status(403).json({ success: false, message: "Not assigned to any branch" });
      branchWhere.id = branchId;
    } else return res.status(403).json({ success: false, message: "Access denied" });

    // ======= Fetch expenses =======
    const expenses = await ExpenseNew.findAll({
      where,
      include: [{ model: Branch, as: "branch", attributes: ["id","name"], where: branchWhere }],
      order: [["payment_date","ASC"]],
    });

    if (!expenses.length) return res.json({ success: true, data: { year: selectedYear, branch_details: [] }, message: "No expenses found" });

    // ======= Prepare aggregation =======
    const branchesMap = {};
    const all_branches_monthly_totals = {};
    const all_branches_quarterly_totals = {};
    const all_branches_yearly_totals = { subtotal:0, tax_total:0, total_amount:0 };

    for (const exp of expenses) {
      const branchId = exp.branch_id;
      const branchName = exp.branch?.name || "Unknown Branch";
      const month = dayjs(exp.payment_date).month() + 1;
      const monthName = dayjs(exp.payment_date).format("MMMM");

      const subtotal = parseFloat(exp.subtotal || 0);
      const tax_total = parseFloat(exp.tax_total || 0);
      const total_amount = parseFloat(exp.total_amount || 0);

      // Branch level aggregation
      if (!branchesMap[branchId]) branchesMap[branchId] = { branch_id: branchId, branch_name: branchName, months:{}, yearly_totals:{ subtotal:0,tax_total:0,total_amount:0 } };
      if (!branchesMap[branchId].months[monthName]) branchesMap[branchId].months[monthName] = { month: monthName, records: [], monthly_totals: { subtotal:0,tax_total:0,total_amount:0 } };

      branchesMap[branchId].months[monthName].records.push({ date: exp.payment_date, description: exp.description, subtotal, tax_total, total_amount });
      branchesMap[branchId].months[monthName].monthly_totals.subtotal += subtotal;
      branchesMap[branchId].months[monthName].monthly_totals.tax_total += tax_total;
      branchesMap[branchId].months[monthName].monthly_totals.total_amount += total_amount;

      branchesMap[branchId].yearly_totals.subtotal += subtotal;
      branchesMap[branchId].yearly_totals.tax_total += tax_total;
      branchesMap[branchId].yearly_totals.total_amount += total_amount;

      // All branches monthly totals
      if (!all_branches_monthly_totals[monthName]) all_branches_monthly_totals[monthName] = { subtotal:0,tax_total:0,total_amount:0 };
      all_branches_monthly_totals[monthName].subtotal += subtotal;
      all_branches_monthly_totals[monthName].tax_total += tax_total;
      all_branches_monthly_totals[monthName].total_amount += total_amount;

      // Dynamic quarterly totals
      for (const q of quarters) {
        if (month >= q.start && month <= q.end) {
          if (!all_branches_quarterly_totals[q.label]) all_branches_quarterly_totals[q.label] = { subtotal:0,tax_total:0,total_amount:0 };
          all_branches_quarterly_totals[q.label].subtotal += subtotal;
          all_branches_quarterly_totals[q.label].tax_total += tax_total;
          all_branches_quarterly_totals[q.label].total_amount += total_amount;
          break;
        }
      }

      // Yearly totals
      all_branches_yearly_totals.subtotal += subtotal;
      all_branches_yearly_totals.tax_total += tax_total;
      all_branches_yearly_totals.total_amount += total_amount;
    }

    const branch_details = Object.values(branchesMap).map(b => ({ ...b, months: Object.values(b.months) }));

    return res.json({
      success: true,
      data: {
        year: selectedYear,
        branch_details,
        all_branches_monthly_totals,
        all_branches_quarterly_totals,
        all_branches_yearly_totals
      }
    });

  } catch(err) {
    console.error("Expense Report Error:", err);
    return res.status(500).json({ success:false, message:"Server error while generating expense report", error:err.message });
  }
};



// exports.getIncomeSummary = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // ======================
//     // Work Order Invoices (income)
//     // ======================
//     const woWhereInvoice = { status: "paid" }; // WorkOrderInvoice filters
//     let woWhere = {}; // WorkOrder filters

//     if (emp) {
//       woWhere.assigned_to = emp.branch_id;
//     } else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const workInvoices = await WorkOrderInvoice.findAll({
//       where: woWhereInvoice,
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           attributes: ["wo_number", "title", "amount", "status", "assigned_to"],
//           where: woWhere
//         }
//       ]
//     });

//     const totalWorkIncome = workInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

//     // ======================
//     // Purchase Order Invoices (income)
//     // ======================
//     let poWhere = {};
//     if (emp) poWhere.branch_id = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       poWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
//     }

//     const purchaseOrders = await PurchaseOrder.findAll({ where: poWhere, attributes: ["po_number"] });
//     const poNumbers = purchaseOrders.map(po => po.po_number);

//     const purchaseInvoices = await PurchaseOrderInvoice.findAll({
//       where: { status: "Paid", po_number: { [Op.in]: poNumbers } },
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: ["po_number", "vendor_name", "total_amount", "status", "branch_id"],
//         }
//       ]
//     });

//     const totalPurchaseIncome = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

//     // ======================
//     // Branch Wallet Credited (expenses)
//     // ======================
//     let walletWhere = { transaction_type: "credit" };
//     if (emp) walletWhere.branch_id = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       walletWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
//     }

//     const walletExpenses = await BranchWallet.findAll({ where: walletWhere, attributes: ["amount"] });
//     const totalWalletExpense = walletExpenses.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

//     // ======================
//     // Final Calculation
//     // ======================
//     const totalIncome = totalWorkIncome + totalPurchaseIncome;
//     const netIncome = totalIncome - totalWalletExpense;

//     return res.json({
//       success: true,
//       data: {
//         total_work_order_income: totalWorkIncome,
//         total_purchase_order_income: totalPurchaseIncome,
//         total_wallet_expense: totalWalletExpense,
//         total_income_before_expense: totalIncome,
//         net_income: netIncome,
//         work_order_invoices: workInvoices,
//         purchase_order_invoices: purchaseInvoices,
//         wallet_expenses: walletExpenses
//       }
//     });
//   } catch (error) {
//     console.error("Income summary error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch income summary", error: error.message });
//   }
// };
// exports.getIncomeSummary = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // ======================
//     // Work Order Invoices (income)
//     // ======================
//     const woWhereInvoice = { status: "paid" };
//     let woWhere = {};

//     if (emp) {
//       woWhere.assigned_to = emp.branch_id;
//     } else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const workInvoices = await WorkOrderInvoice.findAll({
//       where: woWhereInvoice,
//       include: [
//         {
//           model: WorkOrder,
//           as: "workOrder",
//           attributes: ["wo_number", "title", "amount", "status", "assigned_to"],
//           where: woWhere
//         }
//       ]
//     });

//     const totalWorkIncome = workInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

//     // ======================
//     // Purchase Order Invoices (income)
//     // ======================
//     let poWhere = {};
//     if (emp) poWhere.branch_id = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       poWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
//     }

//     const purchaseOrders = await PurchaseOrder.findAll({ where: poWhere, attributes: ["po_number"] });
//     const poNumbers = purchaseOrders.map(po => po.po_number);

//     const purchaseInvoices = await PurchaseOrderInvoice.findAll({
//       where: { status: "Paid", po_number: { [Op.in]: poNumbers } },
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: ["po_number", "vendor_name", "total_amount", "status", "branch_id"],
//         }
//       ]
//     });

//     const totalPurchaseIncome = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

//     // ======================
//     // Branch Wallet Credited (expenses)
//     // ======================
//     let walletWhere = { transaction_type: "credit" };
//     if (emp) walletWhere.branch_id = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       walletWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
//     }

//     const walletExpenses = await BranchWallet.findAll({ where: walletWhere, attributes: ["amount", "branch_id", "created_at"] });
//     const totalWalletExpense = walletExpenses.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

//     // ======================
//     // Final Calculation
//     // ======================
//     const totalIncome = totalWorkIncome + totalPurchaseIncome;
//     const netIncome = totalIncome - totalWalletExpense;

//     // ======================
//     // Branch-wise Monthly, Quarterly, Yearly Totals
//     // ======================
//     const allBranches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id", "name"], raw: true });

//     const summaryByBranch = {};

//     for (const branch of allBranches) {
//       const branchId = branch.id;
//       const branchName = branch.name; // corrected

//       // --- Filter Data for This Branch ---
//       const woBranch = workInvoices.filter(w => w.workOrder.assigned_to === branchId);
//       const poBranch = purchaseInvoices.filter(p => p.purchaseOrder.branch_id === branchId);
//       const walletBranch = walletExpenses.filter(w => w.branch_id === branchId);

//       // --- Initialize Monthly Aggregation ---
//       const months = Array.from({ length: 12 }, (_, i) => ({
//         month: dayjs().month(i).format("MMMM"),
//         wo_income: 0,
//         po_income: 0,
//         expenses: 0,
//         net_income: 0,
//       }));

//       // --- Fill Monthly Data ---
//       woBranch.forEach(w => {
//         if (!w.invoice_date) return;
//         const m = dayjs(w.invoice_date).month();
//         months[m].wo_income += parseFloat(w.total_amount || 0);
//       });

//       poBranch.forEach(p => {
//         if (!p.invoice_date) return;
//         const m = dayjs(p.invoice_date).month();
//         months[m].po_income += parseFloat(p.total_amount || 0);
//       });

//       walletBranch.forEach(w => {
//         if (!w.created_at) return;
//         const m = dayjs(w.created_at).month();
//         months[m].expenses += parseFloat(w.amount || 0);
//       });

//       // --- Compute Monthly Net Income ---
//       months.forEach(m => {
//         m.net_income = m.wo_income + m.po_income - m.expenses;
//       });

//       // --- Quarterly Aggregation (dynamic) ---
//       const quarters = {};
//       months.forEach((m, i) => {
//         const qNumber = Math.floor(i / 3) + 1; // dynamic quarter
//         const qName = `Q${qNumber}`;

//         if (!quarters[qName]) {
//           quarters[qName] = { wo_income: 0, po_income: 0, expenses: 0, net_income: 0, months: [] };
//         }

//         quarters[qName].wo_income += m.wo_income;
//         quarters[qName].po_income += m.po_income;
//         quarters[qName].expenses += m.expenses;
//         quarters[qName].net_income += m.net_income;
//         quarters[qName].months.push(m.month);
//       });

//       const quartersArray = Object.keys(quarters).map(q => ({
//         quarter: q,
//         months: quarters[q].months,
//         wo_income: quarters[q].wo_income,
//         po_income: quarters[q].po_income,
//         expenses: quarters[q].expenses,
//         net_income: quarters[q].net_income
//       }));

//       // --- Yearly Totals ---
//       const yearlyTotals = {
//         wo_income: months.reduce((s, m) => s + m.wo_income, 0),
//         po_income: months.reduce((s, m) => s + m.po_income, 0),
//         expenses: months.reduce((s, m) => s + m.expenses, 0),
//         net_income: months.reduce((s, m) => s + m.net_income, 0),
//       };

//       summaryByBranch[branchId] = {
//         branch_id: branchId,
//         branch_name: branchName,
//         months,
//         quarters: quartersArray,
//         yearlyTotals,
//       };
//     }

//     // --- Aggregate Totals Across All Branches for the Year ---
//     const all_branches_yearly_totals = Object.values(summaryByBranch).reduce(
//       (acc, b) => {
//         acc.wo_income += b.yearlyTotals.wo_income;
//         acc.po_income += b.yearlyTotals.po_income;
//         acc.expenses += b.yearlyTotals.expenses;
//         acc.net_income += b.yearlyTotals.net_income;
//         return acc;
//       },
//       { wo_income: 0, po_income: 0, expenses: 0, net_income: 0 }
//     );

//     // ======================
//     // Final Response
//     // ======================
//     return res.json({
//       success: true,
//       data: {
//         total_work_order_income: totalWorkIncome,
//         total_purchase_order_income: totalPurchaseIncome,
//         total_wallet_expense: totalWalletExpense,
//         total_income_before_expense: totalIncome,
//         net_income: netIncome,
//         work_order_invoices: workInvoices,
//         purchase_order_invoices: purchaseInvoices,
//         wallet_expenses: walletExpenses,
//         branch_wise_summary: summaryByBranch,
//         all_branches_yearly_totals,
//       },
//     });
//   } catch (error) {
//     console.error("Income summary error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch income summary", error: error.message });
//   }
// };
exports.getIncomeSummary = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);
    const { year, quarter_ranges } = req.query; // e.g., year=2025, quarter_ranges="April-October"

    // ======================
    // Work Order Invoices (income)
    // ======================
    const woWhereInvoice = { status: "paid" };
    let woWhere = {};

    if (emp) {
      woWhere.assigned_to = emp.branch_id;
    } else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const workInvoices = await WorkOrderInvoice.findAll({
      where: woWhereInvoice,
      include: [
        {
          model: WorkOrder,
          as: "workOrder",
          attributes: ["wo_number", "title", "amount", "status", "assigned_to"],
          where: woWhere
        }
      ]
    });

    const totalWorkIncome = workInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    const workInvoicesFiltered = workInvoices.map(inv => ({
      id: inv.id,
      wo_number: inv.wo_number,
      payment_amount: inv.payment_amount,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      gst_amount: inv.gst_amount,
      base_amount: inv.base_amount,
      total_amount: inv.total_amount,
      remaining_amount: inv.remaining_amount,
      status: inv.status,
    }));

    // ======================
    // Purchase Order Invoices (income)
    // ======================
    let poWhere = {};
    if (emp) poWhere.branch_id = emp.branch_id;
    else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      poWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const purchaseOrders = await PurchaseOrder.findAll({ where: poWhere, attributes: ["po_number"] });
    const poNumbers = purchaseOrders.map(po => po.po_number);

    const purchaseInvoices = await PurchaseOrderInvoice.findAll({
      where: { status: "Paid", po_number: { [Op.in]: poNumbers } },
    });

    const totalPurchaseIncome = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

    const purchaseInvoicesFiltered = purchaseInvoices.map(inv => ({
      id: inv.id,
      po_number: inv.po_number,
      payment_amount: inv.payment_amount,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      gst_amount: inv.gst_amount,
      base_amount: inv.base_amount,
      total_amount: inv.total_amount,
      remaining_amount: inv.remaining_amount,
      status: inv.status,
    }));

    // ======================
    // Branch Wallet Credited (expenses)
    // ======================
    let walletWhere = { transaction_type: "credit" };
    if (emp) walletWhere.branch_id = emp.branch_id;
    else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      walletWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const walletExpenses = await BranchWallet.findAll({ where: walletWhere, attributes: ["amount", "branch_id", "created_at"] });
    const totalWalletExpense = walletExpenses.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

    // ======================
    // Final Calculation
    // ======================
    const totalIncome = totalWorkIncome + totalPurchaseIncome;
    const netIncome = totalIncome - totalWalletExpense;

    // ======================
    // Branch-wise Monthly, Quarterly, Yearly Totals
    // ======================
    const allBranches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id", "name"], raw: true });
    const allMonths =  [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

    // Determine start/end month from quarter_ranges
    let startMonthIndex = 0;
    let endMonthIndex = 11;
    if (quarter_ranges) {
      const monthsArr = quarter_ranges.split("-").map(m => m.trim());
      startMonthIndex = allMonths.indexOf(monthsArr[0]);
      endMonthIndex = allMonths.indexOf(monthsArr[1]);
      if (startMonthIndex === -1) startMonthIndex = 0;
      if (endMonthIndex === -1) endMonthIndex = 11;
    }

    const summaryByBranch = {};

    for (const branch of allBranches) {
      const branchId = branch.id;
      const branchName = branch.name;

      const woBranch = workInvoices.filter(w => w.workOrder.assigned_to === branchId);
      const poBranch = purchaseInvoices.filter(p => p.purchaseOrder?.branch_id === branchId);
      const walletBranch = walletExpenses.filter(w => w.branch_id === branchId);

      // Initialize monthly aggregation for selected months only
      const months = [];
      for (let i = startMonthIndex; i <= endMonthIndex; i++) {
        months.push({
          month: allMonths[i],
          wo_income: 0,
          po_income: 0,
          expenses: 0,
          net_income: 0,
          monthIndex: i,
        });
      }

      // Fill monthly data
      woBranch.forEach(w => {
        if (!w.invoice_date) return;
        const m = dayjs(w.invoice_date).month();
        if (m < startMonthIndex || m > endMonthIndex) return;
        const monthObj = months.find(x => x.monthIndex === m);
        if (monthObj) monthObj.wo_income += parseFloat(w.total_amount || 0);
      });

      poBranch.forEach(p => {
        if (!p.invoice_date) return;
        const m = dayjs(p.invoice_date).month();
        if (m < startMonthIndex || m > endMonthIndex) return;
        const monthObj = months.find(x => x.monthIndex === m);
        if (monthObj) monthObj.po_income += parseFloat(p.total_amount || 0);
      });

      walletBranch.forEach(w => {
        if (!w.created_at) return;
        const m = dayjs(w.created_at).month();
        if (m < startMonthIndex || m > endMonthIndex) return;
        const monthObj = months.find(x => x.monthIndex === m);
        if (monthObj) monthObj.expenses += parseFloat(w.amount || 0);
      });

      months.forEach(m => {
        m.net_income = m.wo_income + m.po_income - m.expenses;
      });

      // Quarterly aggregation dynamically based on filtered months
      const quarters = {};
      months.forEach((m, i) => {
        const qNumber = Math.floor(i / 3) + 1;
        const qName = `Q${qNumber}`;
        if (!quarters[qName]) quarters[qName] = { wo_income: 0, po_income: 0, expenses: 0, net_income: 0, months: [] };
        quarters[qName].wo_income += m.wo_income;
        quarters[qName].po_income += m.po_income;
        quarters[qName].expenses += m.expenses;
        quarters[qName].net_income += m.net_income;
        quarters[qName].months.push(m.month);
      });

      const quartersArray = Object.keys(quarters).map(q => ({
        quarter: q,
        months: quarters[q].months,
        wo_income: quarters[q].wo_income,
        po_income: quarters[q].po_income,
        expenses: quarters[q].expenses,
        net_income: quarters[q].net_income
      }));

      const yearlyTotals = {
        wo_income: months.reduce((s, m) => s + m.wo_income, 0),
        po_income: months.reduce((s, m) => s + m.po_income, 0),
        expenses: months.reduce((s, m) => s + m.expenses, 0),
        net_income: months.reduce((s, m) => s + m.net_income, 0),
      };

      summaryByBranch[branchId] = {
        branch_id: branchId,
        branch_name: branchName,
        months,
        quarters: quartersArray,
        yearlyTotals,
      };
    }

    const all_branches_yearly_totals = Object.values(summaryByBranch).reduce(
      (acc, b) => {
        acc.wo_income += b.yearlyTotals.wo_income;
        acc.po_income += b.yearlyTotals.po_income;
        acc.expenses += b.yearlyTotals.expenses;
        acc.net_income += b.yearlyTotals.net_income;
        return acc;
      },
      { wo_income: 0, po_income: 0, expenses: 0, net_income: 0 }
    );

    return res.json({
      success: true,
      data: {
        total_work_order_income: totalWorkIncome,
        total_purchase_order_income: totalPurchaseIncome,
        total_wallet_expense: totalWalletExpense,
        total_income_before_expense: totalIncome,
        net_income: netIncome,
        work_order_invoices: workInvoicesFiltered,
        purchase_order_invoices: purchaseInvoicesFiltered,
        wallet_expenses: walletExpenses,
        branch_wise_summary: summaryByBranch,
        all_branches_yearly_totals,
      },
    });
  } catch (error) {
    console.error("Income summary error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch income summary", error: error.message });
  }
};


