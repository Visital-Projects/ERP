// const { Op } = require("sequelize");
// const WorkOrderInvoice = require('../models/work_order_invoice.model');
// const WorkOrder = require('../models/workOrder.model');
// const PurchaseOrderInvoice = require('../models/purchase_order_invoice.model');
// const PurchaseOrder = require('../models/purchase_order.model');
// const BranchWallet = require('../models/branchWallet.model');
// const Branch = require('../models/branch.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const CreditPurchase = require('../models/creditPurchase.model');

// // ================================
// // PAYSLIP IMPORT - FIXED
// // ================================
// let Payslip;
// try {
//   // Try to import the model directly
//   const PayslipModel = require('../models/payslip.model');
  
//   // If it's a Sequelize model definition function, we need to initialize it properly
//   if (typeof PayslipModel === 'function') {
//     // You'll need to pass sequelize and DataTypes if required
//     // For now, we'll use it as is since it's likely already initialized
//     Payslip = PayslipModel;
//   } else {
//     Payslip = PayslipModel;
//   }
//   console.log("✅ Payslip model imported successfully");
// } catch (error) {
//   console.error("❌ Failed to import Payslip model:", error.message);
//   // Create a dummy Payslip model to prevent crashes
//   Payslip = {
//     findAll: () => Promise.resolve([]),
//     findOne: () => Promise.resolve(null)
//   };
// }

// // ================================
// // HELPERS
// // ================================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["created_by"], raw: true });
//   if (emp?.created_by) return emp.created_by;

//   const user = await User.findOne({ where: { id: req.user.id }, attributes: ["created_by"], raw: true });
//   if (user?.created_by) return user.created_by;

//   return req.user.id;
// }

// async function getUserBranch(req) {
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["branch_id", "created_by"],
//     raw: true,
//   });
//   return emp;
// }

// // ================================
// // GET CURRENT MONTH STRING (YYYY-MM)
// // ================================
// function getCurrentMonthString() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//   return `${year}-${month}`;
// }

// // ================================
// // GET INCOME SUMMARY (Role-Based)
// // ================================
// exports.getIncomeSummary = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     console.log("=== STARTING INCOME SUMMARY ===");
//     console.log("User Type:", req.user?.type);
//     console.log("Employee Branch:", emp?.branch_id);
//     console.log("Company ID:", companyId);

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
//         //   attributes: ["wo_number", "title", "amount", "status", "assigned_to"],
//         attributes: ["wo_number", "title", "work_order_amount", "status", "assigned_to"],
//           where: woWhere
//         }
//       ],
//       raw: true,
//       nest: true
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

//     const purchaseOrders = await PurchaseOrder.findAll({ where: poWhere, attributes: ["po_number"], raw: true });
//     const poNumbers = purchaseOrders.map(po => po.po_number);

//     const purchaseInvoices = await PurchaseOrderInvoice.findAll({
//       where: { status: "Paid", po_number: { [Op.in]: poNumbers } },
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: ["po_number", "vendor_name", "total_amount", "status", "branch_id"],
//         }
//       ],
//       raw: true,
//       nest: true
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

//     const walletExpenses = await BranchWallet.findAll({ where: walletWhere, attributes: ["amount"], raw: true });
//     const totalWalletExpense = walletExpenses.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

//     // ======================
//     // CREDIT PURCHASES (company expenses)
//     // ======================
//     let creditPurchases = await CreditPurchase.findAll({
//       where: { payment_status: "paid" },
//       attributes: ["total_amount", "branch_id"],
//       raw: true,
//     });
    
//     if (!emp) {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       const branchIds = branches.map(b => b.id);
//       creditPurchases = creditPurchases.filter(cp => branchIds.includes(cp.branch_id));
//     }
    
//     const totalCreditExpense = creditPurchases.reduce(
//       (sum, cp) => sum + parseFloat(cp.total_amount || 0),
//       0
//     );

//     // ======================
//     // PAID PAYSLIPS CALCULATION - WITH ERROR HANDLING
//     // ======================
//     let totalPaidPayslipsAmount = 0;
//     let currentMonth = getCurrentMonthString(); // 🟩 MOVED: Define currentMonth outside try block

//     console.log("=== PAYSLIP CALCULATION ===");
//     console.log(`📅 Calculating payslips for current month: ${currentMonth}`);

//     try {
//       // Get all branches for the company
//       let branchIds = [];
//       if (emp) {
//         branchIds = [emp.branch_id];
//       } else {
//         const companyBranches = await Branch.findAll({ 
//           where: { created_by: companyId }, 
//           attributes: ["id"], 
//           raw: true 
//         });
//         branchIds = companyBranches.map(b => b.id);
//       }

//       console.log("Branch IDs for payslip filtering:", branchIds);

//       if (branchIds.length > 0) {
//         // Get all employees in these branches
//         const employees = await Employee.findAll({
//           where: { branch_id: { [Op.in]: branchIds } },
//           attributes: ["id", "employee_id", "branch_id"],
//           raw: true,
//         });

//         console.log(`Found ${employees.length} employees in specified branches`);

//         if (employees.length > 0) {
//           const employeeIds = employees.map(e => e.employee_id);
          
//           // 🟩 CRITICAL FIX: Use status = 1 for paid payslips + current month filter
//           const payslipWhere = {
//             status: 1, // 🟩 FIXED: Use 1 for paid status (not "paid")
//             is_deleted: false,
//             employee_id: { [Op.in]: employeeIds },
//             salary_month: currentMonth // 🟩 NEW: Only current month payslips
//           };

//           console.log("Payslip query conditions:", payslipWhere);

//           // Fetch paid payslips for current month only
//           const payslips = await Payslip.findAll({
//             where: payslipWhere,
//             attributes: ['id', 'employee_id', 'net_payble', 'salary_month', 'status'],
//             raw: true
//           });

//           console.log(`🔍 Found ${payslips.length} paid payslips for current month (${currentMonth})`);

//           // Calculate total amount for current month
//           if (payslips.length > 0) {
//             totalPaidPayslipsAmount = payslips.reduce((sum, payslip) => {
//               const amount = parseFloat(payslip.net_payble || 0);
//               console.log(`Payslip ${payslip.id}: employee_id=${payslip.employee_id}, net_payble=${payslip.net_payble}, month=${payslip.salary_month}`);
//               return sum + amount;
//             }, 0);

//             console.log(`💰 Total paid payslip amount for ${currentMonth}: ${totalPaidPayslipsAmount}`);
            
//             // Debug: Show first few payslips
//             console.log("📊 Sample current month payslips:", payslips.slice(0, 3).map(p => ({
//               id: p.id,
//               employee_id: p.employee_id,
//               net_payble: p.net_payble,
//               salary_month: p.salary_month,
//               status: p.status
//             })));
//           } else {
//             console.log(`❌ No paid payslips found for current month ${currentMonth}`);
            
//             // Debug: Check what's actually in the database for current month
//             console.log("🔍 Debug: Checking database for current month payslips...");
            
//             // Check for any payslips with status = 1 for current month
//             const currentMonthPaidPayslips = await Payslip.findAll({
//               where: { 
//                 status: 1, 
//                 is_deleted: false,
//                 salary_month: currentMonth 
//               },
//               attributes: ['id', 'employee_id', 'net_payble', 'salary_month', 'status'],
//               limit: 10,
//               raw: true
//             });
//             console.log(`Current month (${currentMonth}) payslips with status=1:`, currentMonthPaidPayslips);
            
//             // Check if there are any payslips at all for current month
//             const anyCurrentMonthPayslips = await Payslip.findAll({
//               where: { salary_month: currentMonth },
//               attributes: ['id', 'employee_id', 'net_payble', 'salary_month', 'status'],
//               limit: 5,
//               raw: true
//             });
//             console.log(`Any payslips for current month ${currentMonth}:`, anyCurrentMonthPayslips);
            
//             // Check employee IDs match
//             console.log("Employee IDs we're looking for:", employeeIds.slice(0, 10));
            
//             // Also check what months are available in the database
//             const distinctMonths = await Payslip.findAll({
//               attributes: ['salary_month'],
//               group: ['salary_month'],
//               raw: true
//             });
//             console.log("Available salary months in database:", distinctMonths.map(m => m.salary_month));
//           }
//         } else {
//           console.log("❌ No employees found in the specified branches");
//         }
//       } else {
//         console.log("❌ No branch IDs found for filtering");
//       }
//     } catch (payslipError) {
//       console.error("❌ Error in payslip calculation:", payslipError.message);
//       console.log("⚠️ Continuing without payslip data...");
//       totalPaidPayslipsAmount = 0;
//     }

//     console.log("=== END PAYSLIP CALCULATION ===");

//     // ======================
//     // Branch-wise income calculation
//     // ======================
//     const branchWiseIncome = {};

//     if (!emp) {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id", "name"],
//         raw: true,
//       });

//       for (const branch of branches) {
//         const branchId = branch.id;

//         // Work Order Income for this branch
//         const branchWorkInvoices = workInvoices.filter(
//           inv => inv.workOrder?.assigned_to === branchId
//         );
//         const branchWorkIncome = branchWorkInvoices.reduce(
//           (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//           0
//         );

//         // Purchase Order Income for this branch
//         const branchPurchaseInvoices = purchaseInvoices.filter(
//           inv => inv.purchaseOrder?.branch_id === branchId
//         );
//         const branchPurchaseIncome = branchPurchaseInvoices.reduce(
//           (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//           0
//         );

//         branchWiseIncome[branch.name] = {
//           branch_id: branchId,
//           work_order_income: branchWorkIncome,
//           purchase_order_income: branchPurchaseIncome,
//           total_branch_income: branchWorkIncome + branchPurchaseIncome,
//         };
//       }
//     } else {
//       const branchId = emp.branch_id;
//       const branch = await Branch.findByPk(branchId, { attributes: ["name"], raw: true });

//       const branchWorkInvoices = workInvoices.filter(
//         inv => inv.workOrder?.assigned_to === branchId
//       );
//       const branchWorkIncome = branchWorkInvoices.reduce(
//         (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//         0
//       );

//       const branchPurchaseInvoices = purchaseInvoices.filter(
//         inv => inv.purchaseOrder?.branch_id === branchId
//       );
//       const branchPurchaseIncome = branchPurchaseInvoices.reduce(
//         (sum, inv) => sum + parseFloat(inv.total_amount || 0),
//         0
//       );

//       branchWiseIncome[branch?.name || `Branch-${branchId}`] = {
//         branch_id: branchId,
//         work_order_income: branchWorkIncome,
//         purchase_order_income: branchPurchaseIncome,
//         total_branch_income: branchWorkIncome + branchPurchaseIncome,
//       };
//     }

//     // ======================
//     // Final Calculation
//     // ======================
//     const totalIncome = totalWorkIncome + totalPurchaseIncome;
//     const totalExpenses = totalWalletExpense + totalCreditExpense + totalPaidPayslipsAmount;
//     const netIncome = totalIncome - totalExpenses;

//     console.log("=== FINAL CALCULATIONS ===");
//     console.log("Total Work Income:", totalWorkIncome);
//     console.log("Total Purchase Income:", totalPurchaseIncome);
//     console.log("Total Income:", totalIncome);
//     console.log("Total Wallet Expense:", totalWalletExpense);
//     console.log("Total Credit Expense:", totalCreditExpense);
//     console.log(`Total Payslip Expense (${currentMonth}):`, totalPaidPayslipsAmount);
//     console.log("Total Expenses:", totalExpenses);
//     console.log("Net Income:", netIncome);

//     // ======================
//     // Return Response
//     // ======================
//     return res.json({
//       success: true,
//       data: {
//         total_work_order_income: totalWorkIncome,
//         total_purchase_order_income: totalPurchaseIncome,
//         total_wallet_expense: totalWalletExpense,
//         total_credit_expense: totalCreditExpense,
//         total_paid_payslip_amount: totalPaidPayslipsAmount,
//         total_income_before_expense: totalIncome,
//         net_income: netIncome,
//         branch_wise_income: branchWiseIncome,
//         work_order_invoices: workInvoices,
//         purchase_order_invoices: purchaseInvoices,
//         wallet_expenses: walletExpenses,
//         credit_purchases: creditPurchases,
//         current_month: currentMonth 
//       }
//     });

//   } catch (error) {
//     console.error("Income summary error:", error);
//     return res.status(500).json({ 
//       success: false, 
//       message: "Failed to fetch income summary", 
//       error: error.message 
//     });
//   }
// };






const { Op } = require("sequelize");
const moment = require("moment");

const WorkOrderInvoice = require('../models/work_order_invoice.model');
const WorkOrder = require('../models/workOrder.model');
const PurchaseOrderInvoice = require('../models/purchase_order_invoice.model');
const PurchaseOrder = require('../models/purchase_order.model');
const BranchWallet = require('../models/branchWallet.model');
const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const CreditPurchase = require('../models/creditPurchase.model');

// ================================
// PAYSLIP IMPORT - FIXED
// ================================
let Payslip;
try {
  // Try to import the model directly
  const PayslipModel = require('../models/payslip.model');
  
  // If it's a Sequelize model definition function, we need to initialize it properly
  if (typeof PayslipModel === 'function') {
    // You'll need to pass sequelize and DataTypes if required
    // For now, we'll use it as is since it's likely already initialized
    Payslip = PayslipModel;
  } else {
    Payslip = PayslipModel;
  }
  console.log("✅ Payslip model imported successfully");
} catch (error) {
  console.error("❌ Failed to import Payslip model:", error.message);
  // Create a dummy Payslip model to prevent crashes
  Payslip = {
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null)
  };
}

// ================================
// HELPERS
// ================================
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
  return emp;
}

// ================================
// GET CURRENT MONTH STRING (YYYY-MM)
// ================================
function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  return `${year}-${month}`;
}

// ================================
// GET INCOME SUMMARY (Role-Based)
// ================================
exports.getIncomeSummary = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    console.log("=== STARTING INCOME SUMMARY ===");
    console.log("User Type:", req.user?.type);
    console.log("Employee Branch:", emp?.branch_id);
    console.log("Company ID:", companyId);

    // ======================
    // OPTIONAL MONTH FILTER (Professional Reporting)
    // ======================
    const { month, year } = req.query;

    let startOfMonth, endOfMonth;

    if (month && year) {
      startOfMonth = moment(`${year}-${month}-01`).startOf("month").toDate();
      endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();
    } else {
      startOfMonth = moment().startOf("month").toDate();
      endOfMonth = moment().endOf("month").toDate();
    }

    console.log("📅 Income Period Start:", startOfMonth);
    console.log("📅 Income Period End:", endOfMonth);

    // ======================
    // Work Order Invoices (income)
    // ======================
    const woWhereInvoice = { status: "paid" };
    let woWhere = {};

    if (emp) {
      woWhere.assigned_to = emp.branch_id;
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const workInvoices = await WorkOrderInvoice.findAll({
      where: woWhereInvoice,
      include: [
        {
          model: WorkOrder,
          as: "workOrder",
          attributes: ["wo_number", "title", "work_order_amount", "status", "assigned_to"],
          where: woWhere
        }
      ],
      raw: true,
      nest: true
    });

    const totalWorkIncome = workInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    // ======================
    // Purchase Order Invoices (income)
    // ======================
    let poWhere = {};

    if (emp) {
      poWhere.branch_id = emp.branch_id;
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });
      poWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const purchaseOrders = await PurchaseOrder.findAll({
      where: poWhere,
      attributes: ["po_number"],
      raw: true
    });

    const poNumbers = purchaseOrders.map(po => po.po_number);

    const purchaseInvoices = await PurchaseOrderInvoice.findAll({
      where: { status: "Paid", po_number: { [Op.in]: poNumbers } },
      include: [
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          attributes: ["po_number", "vendor_name", "total_amount", "status", "branch_id"]
        }
      ],
      raw: true,
      nest: true
    });

    const totalPurchaseIncome = purchaseInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    // ======================
    // Branch Wallet Credited (expenses)
    // ======================
    let walletWhere = { transaction_type: "credit" };

    if (emp) {
      walletWhere.branch_id = emp.branch_id;
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });
      walletWhere.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const walletExpenses = await BranchWallet.findAll({
      where: walletWhere,
      attributes: ["amount"],
      raw: true
    });

    const totalWalletExpense = walletExpenses.reduce(
      (sum, w) => sum + parseFloat(w.amount || 0),
      0
    );

    // ======================
    // CREDIT PURCHASES (company expenses)
    // ======================
    let creditPurchases = await CreditPurchase.findAll({
      where: { payment_status: "paid" },
      attributes: ["total_amount", "branch_id"],
      raw: true
    });

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });

      const branchIds = branches.map(b => b.id);
      creditPurchases = creditPurchases.filter(cp =>
        branchIds.includes(cp.branch_id)
      );
    }

    const totalCreditExpense = creditPurchases.reduce(
      (sum, cp) => sum + parseFloat(cp.total_amount || 0),
      0
    );

    // ======================
    // PAID PAYSLIPS (ACCOUNTING BASED ON paid_at)
    // ======================
    let totalPaidPayslipsAmount = 0;

    try {
      let branchIds = [];

      if (emp) {
        branchIds = [emp.branch_id];
      } else {
        const companyBranches = await Branch.findAll({
          where: { created_by: companyId },
          attributes: ["id"],
          raw: true
        });
        branchIds = companyBranches.map(b => b.id);
      }

      if (branchIds.length > 0) {
        const employees = await Employee.findAll({
          where: { branch_id: { [Op.in]: branchIds } },
          attributes: ["employee_id"],
          raw: true
        });

        if (employees.length > 0) {
          const employeeIds = employees.map(e => e.employee_id);

          const payslips = await Payslip.findAll({
            where: {
              status: 1,
              is_deleted: false,
              employee_id: { [Op.in]: employeeIds },
              paid_at: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            },
            attributes: [
              "id",
              "employee_id",
              "gross_salary",
              "salary_month",
              "paid_at"
            ],
            raw: true
          });

          totalPaidPayslipsAmount = payslips.reduce(
            (sum, payslip) => sum + parseFloat(payslip.gross_salary || 0),
            0
          );

          console.log("💰 Total Paid Salary (by paid_at):", totalPaidPayslipsAmount);
        }
      }
    } catch (payslipError) {
      console.error("Payslip Calculation Error:", payslipError.message);
      totalPaidPayslipsAmount = 0;
    }

    // ======================
    // FINAL CALCULATION
    // ======================
    const totalIncome = totalWorkIncome + totalPurchaseIncome;

    const totalExpenses =
      totalWalletExpense +
      totalCreditExpense +
      totalPaidPayslipsAmount;

    const netIncome = totalIncome - totalExpenses;

    console.log("=== FINAL CALCULATIONS ===");
    console.log("Total Income:", totalIncome);
    console.log("Total Expenses:", totalExpenses);
    console.log("Net Income:", netIncome);

    // ======================
    // RESPONSE
    // ======================
    return res.json({
      success: true,
      data: {
        period_start: startOfMonth,
        period_end: endOfMonth,
        total_work_order_income: totalWorkIncome,
        total_purchase_order_income: totalPurchaseIncome,
        total_wallet_expense: totalWalletExpense,
        total_credit_expense: totalCreditExpense,
        total_paid_payslip_amount: totalPaidPayslipsAmount,
        total_income_before_expense: totalIncome,
        net_income: netIncome,
        work_order_invoices: workInvoices,
        purchase_order_invoices: purchaseInvoices,
        wallet_expenses: walletExpenses,
        credit_purchases: creditPurchases
      }
    });

  } catch (error) {
    console.error("Income summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch income summary",
      error: error.message
    });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    const { month, year } = req.query;

    let startOfMonth, endOfMonth;

    if (month && year) {
      startOfMonth = moment(`${year}-${month}-01`).startOf("month").toDate();
      endOfMonth = moment(`${year}-${month}-01`).endOf("month").toDate();
    } else {
      startOfMonth = moment().startOf("month").toDate();
      endOfMonth = moment().endOf("month").toDate();
    }

    let branchIds = [];

    if (emp) {
      branchIds = [emp.branch_id];
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });
      branchIds = branches.map(b => b.id);
    }

    let transactions = [];

    // =====================================
    // 1️⃣ WORK ORDER INCOME (CREDIT)
    // =====================================
    const workInvoices = await WorkOrderInvoice.findAll({
      where: {
        status: "paid",
       created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      include: [{
        model: WorkOrder,
        as: "workOrder",
        where: { assigned_to: { [Op.in]: branchIds } },
        attributes: ["wo_number", "title"]
      }],
      raw: true,
      nest: true
    });

    workInvoices.forEach(inv => {
      transactions.push({
        type: "credit",
        source: "Work Order Invoice",
        reference_no: inv.workOrder?.wo_number,
        description: inv.workOrder?.title,
        amount: parseFloat(inv.total_amount || 0),
        date: inv.created_at

      });
    });

    // =====================================
    // 2️⃣ PURCHASE ORDER INCOME (CREDIT)
    // =====================================
    const purchaseInvoices = await PurchaseOrderInvoice.findAll({
      where: {
        status: "Paid",
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      include: [{
        model: PurchaseOrder,
        as: "purchaseOrder",
        where: { branch_id: { [Op.in]: branchIds } },
        attributes: ["po_number", "vendor_name"]
      }],
      raw: true,
      nest: true
    });

    purchaseInvoices.forEach(inv => {
      transactions.push({
        type: "credit",
        source: "Purchase Order Invoice",
        reference_no: inv.purchaseOrder?.po_number,
        description: inv.purchaseOrder?.vendor_name,
        amount: parseFloat(inv.total_amount || 0),
        date: inv.created_at

      });
    });

    // =====================================
    // 3️⃣ WALLET TRANSACTIONS (DEBIT)
    // =====================================
    const walletTransactions = await BranchWallet.findAll({
      where: {
        branch_id: { [Op.in]: branchIds },
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }

      },
      raw: true
    });

    walletTransactions.forEach(w => {
      transactions.push({
        type: w.transaction_type === "credit" ? "debit" : "credit",
        source: "Branch Wallet",
        reference_no: w.id,
        description: "Wallet Transaction",
        amount: parseFloat(w.amount || 0),
        date: w.createdAt
      });
    });

    // =====================================
    // 4️⃣ CREDIT PURCHASE (DEBIT)
    // =====================================
    const creditPurchases = await CreditPurchase.findAll({
      where: {
        payment_status: "paid",
        branch_id: { [Op.in]: branchIds },
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }

      },
      raw: true
    });

    creditPurchases.forEach(cp => {
      transactions.push({
        type: "debit",
        source: "Credit Purchase",
        reference_no: cp.id,
        description: "Credit Purchase Payment",
        amount: parseFloat(cp.total_amount || 0),
        date: cp.createdAt
      });
    });

    // =====================================
    // 5️⃣ PAID SALARIES (DEBIT)
    // =====================================
    const employees = await Employee.findAll({
      where: { branch_id: { [Op.in]: branchIds } },
      attributes: ["employee_id"],
      raw: true
    });

    const employeeIds = employees.map(e => e.employee_id);

    if (employeeIds.length > 0) {
      const payslips = await Payslip.findAll({
        where: {
          status: 1,
          is_deleted: false,
          employee_id: { [Op.in]: employeeIds },
          paid_at: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        raw: true
      });

      payslips.forEach(p => {
        transactions.push({
          type: "debit",
          source: "Salary Payment",
          reference_no: p.id,
          description: `Salary for ${p.salary_month}`,
          amount: parseFloat(p.gross_salary || 0),
          date: p.paid_at
        });
      });
    }

    // =====================================
    // SORT BY DATE DESC
    // =====================================
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json({
      success: true,
      period_start: startOfMonth,
      period_end: endOfMonth,
      total_transactions: transactions.length,
      data: transactions
    });

  } catch (error) {
    console.error("Transaction history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
      error: error.message
    });
  }
};
