// const BaseAmount = require("../models/base_amount.model");
// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const { Sequelize } = require("sequelize");

// exports.getFinancialReport = async (req, res) => {
//   try {
//     // 1. Calculate total base amount
//     const baseAmountSum = await BaseAmount.findOne({
//       attributes: [[Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"]],
//       raw: true,
//     });

//     const totalBaseAmount = parseFloat(baseAmountSum.total_taxable_amount || 0);

//     // 2. Calculate total loan deduction
//     const deductions = await DeductionPaymentDone.findAll({
//       attributes: [
//         [Sequelize.fn("SUM", Sequelize.col("tds")), "tds"],
//         [Sequelize.fn("SUM", Sequelize.col("others")), "others"],
//         [Sequelize.fn("SUM", Sequelize.col("salaries")), "salaries"],
//         [Sequelize.fn("SUM", Sequelize.col("esi")), "esi"],
//         [Sequelize.fn("SUM", Sequelize.col("epf")), "epf"],
//         [Sequelize.fn("SUM", Sequelize.col("pt")), "pt"],
//       ],
//       raw: true,
//     });

//     const deductionRow = deductions[0];
//     const totalLoanDeduction =
//       parseFloat(deductionRow.tds || 0) +
//       parseFloat(deductionRow.others || 0) +
//       parseFloat(deductionRow.salaries || 0) +
//       parseFloat(deductionRow.esi || 0) +
//       parseFloat(deductionRow.epf || 0) +
//       parseFloat(deductionRow.pt || 0);

//     // 3. Overall balance
//     const overallBalance = totalBaseAmount - totalLoanDeduction;

//     return res.status(200).json({
//       success: true,
//       data: {
//         total_taxable_amount: totalBaseAmount.toFixed(2),
//         total_loan_deduction: totalLoanDeduction.toFixed(2),
//         overall_balance: overallBalance.toFixed(2),
//       },
//       message: "Financial report generated successfully",
//     });
//   } catch (err) {
//     console.error("Error generating report:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };




// controllers/report.controller.js
const BaseAmount = require("../models/base_amount.model");
const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
const Employee = require("../models/employee.model");
const { Sequelize } = require("sequelize");

// ==============================
// Multi-tenant company helper
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  // Company login
  if (type === "company") return req.user.id;

  // Employee login
  if (type === "employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    if (emp?.created_by) return emp.created_by;
  }

  // Other roles (HR, Accountant, Manager etc.)
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  // fallback: assume user is company
  return req.user.id;
}

// ==============================
// GET FINANCIAL REPORT
// ==============================
exports.getFinancialReport = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ message: "Unable to resolve company" });
    }

    // =============================
    // 1. Calculate total base amount
    // =============================
    const baseAmountSum = await BaseAmount.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"],
      ],
      where: { created_by: companyId },   // ✅ filter by company
      raw: true,
    });

    const totalBaseAmount = parseFloat(baseAmountSum?.total_taxable_amount || 0);

    // =============================
    // 2. Calculate total deductions
    // =============================
    const deductions = await DeductionPaymentDone.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("tds")), "tds"],
        [Sequelize.fn("SUM", Sequelize.col("others")), "others"],
        [Sequelize.fn("SUM", Sequelize.col("salaries")), "salaries"],
        [Sequelize.fn("SUM", Sequelize.col("esi")), "esi"],
        [Sequelize.fn("SUM", Sequelize.col("epf")), "epf"],
        [Sequelize.fn("SUM", Sequelize.col("pt")), "pt"],
      ],
      where: { created_by: companyId },   // ✅ filter by company
      raw: true,
    });

    const deductionRow = deductions[0] || {};
    const totalLoanDeduction =
      parseFloat(deductionRow.tds || 0) +
      parseFloat(deductionRow.others || 0) +
      parseFloat(deductionRow.salaries || 0) +
      parseFloat(deductionRow.esi || 0) +
      parseFloat(deductionRow.epf || 0) +
      parseFloat(deductionRow.pt || 0);

    // =============================
    // 3. Calculate overall balance
    // =============================
    const overallBalance = totalBaseAmount - totalLoanDeduction;

    return res.status(200).json({
      success: true,
      data: {
        total_taxable_amount: totalBaseAmount.toFixed(2),
        total_loan_deduction: totalLoanDeduction.toFixed(2),
        overall_balance: overallBalance.toFixed(2),
      },
      message: "Financial report generated successfully",
    });
  } catch (err) {
    console.error("Error generating report:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
