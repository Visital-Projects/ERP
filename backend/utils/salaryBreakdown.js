// utils/salaryBreakdown.js
const Allowance = require("../models/allowance.model");
const Commission = require("../models/commission.model");
const Loan = require("../models/loan.model");
const OtherPayment = require("../models/otherPayment.model");
const SaturationDeduction = require("../models/saturationDeduction.model");
const Overtime = require("../models/overtime.model");
const { Op } = require("sequelize");

exports.computeSalaryBreakdown = async (emp, monthStart, monthEnd) => {
  try {
    const employee_id = emp.employee_id || emp.id;
    const base_salary = Number(emp.salary || 0);

    const [
      allowances,
      commissions,
      otherPayments,
      overtime,
      loans,
      deductions
    ] = await Promise.all([
      Allowance.findAll({ where: { employee_id }, raw: true }),
      Commission.findAll({ where: { employee_id }, raw: true }),
      OtherPayment.findAll({ where: { employee_id }, raw: true }),
      Overtime.findAll({
        where: { employee_id, date: { [Op.between]: [monthStart, monthEnd] } },
        raw: true
      }),
      Loan.findAll({ where: { employee_id }, raw: true }),
      SaturationDeduction.findAll({ where: { employee_id }, raw: true })
    ]);

    const sum = (arr, field) =>
      arr.reduce((acc, r) => acc + parseFloat(r[field] || 0), 0);

    const allowances_total = sum(allowances, "amount");
    const commissions_total = sum(commissions, "amount");
    const other_total = sum(otherPayments, "amount");
    const overtime_total = sum(overtime, "ot_amount");
    const loans_total = sum(loans, "amount");
    const saturation_total = sum(deductions, "amount");

    const additions =
      allowances_total + commissions_total + other_total + overtime_total;
    const deductions_total = loans_total + saturation_total;
    const gross = base_salary + additions;
    const net = gross - deductions_total;

    return {
      base_salary,
      allowances_total,
      commissions_total,
      other_payments_total: other_total,
      overtime_total,
      loans_total,
      saturation_total,
      totals: {
        additions,
        deductions: deductions_total,
        gross,
        net,
      },
    };
  } catch (err) {
    console.error("Salary breakdown error:", err);
    return {
      base_salary: emp.salary || 0,
      totals: {
        additions: 0,
        deductions: 0,
        gross: emp.salary || 0,
        net: emp.salary || 0,
      },
    };
  }
};
