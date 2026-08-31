
// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const BaseAmount = require("../models/base_amount.model");

// // ================= CREATE =================
// exports.create = async (req, res) => {
//   try {
//     const {
//       job_mode_id,
//       plant_id,
//       contract_period_id,
//       base_amount_id,
//       tds,
//       others,
//       salaries,
//       esi,
//       epf,
//       pt,
//       created_by: bodyCreatedBy
//     } = req.body;

//     const created_by = req.user?.id || bodyCreatedBy || null;

//     let record = await DeductionPaymentDone.create({
//       job_mode_id,
//       plant_id,
//       contract_period_id,
//       base_amount_id,
//       tds,
//       others,
//       salaries,
//       esi,
//       epf,
//       pt,
//       created_by,
//     });

//     record = await record.reload();

//     const { total, balance } = await calculateTotals(record);

//     return res.status(201).json({
//       success: true,
//       data: { ...record.get({ plain: true }), total_deduction: total, balance },
//       message: "Deduction record created successfully"
//     });

//   } catch (err) {
//     console.error("Error creating deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ================= GET ALL =================
// exports.getAll = async (req, res) => {
//   try {
//     let records = await DeductionPaymentDone.findAll();

//     const results = await Promise.all(
//       records.map(async (record) => {
//         const { total, balance } = await calculateTotals(record);
//         return { ...record.get({ plain: true }), total_deduction: total, balance };
//       })
//     );

//     return res.json({ success: true, data: results });
//   } catch (err) {
//     console.error("Error fetching deductions:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ================= GET BY ID =================
// exports.getById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let record = await DeductionPaymentDone.findByPk(id);
//     if (!record) {
//       return res.status(404).json({ message: "Deduction record not found" });
//     }

//     const { total, balance } = await calculateTotals(record);

//     return res.json({
//       success: true,
//       data: { ...record.get({ plain: true }), total_deduction: total, balance }
//     });
//   } catch (err) {
//     console.error("Error fetching deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ================= UPDATE =================
// exports.update = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let record = await DeductionPaymentDone.findByPk(id);
//     if (!record) {
//       return res.status(404).json({ message: "Deduction record not found" });
//     }

//     await record.update(req.body);
//     record = await record.reload();

//     const { total, balance } = await calculateTotals(record);

//     return res.json({
//       success: true,
//       data: { ...record.get({ plain: true }), total_deduction: total, balance },
//       message: "Deduction record updated successfully"
//     });
//   } catch (err) {
//     console.error("Error updating deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ================= DELETE =================
// exports.delete = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const record = await DeductionPaymentDone.findByPk(id);
//     if (!record) {
//       return res.status(404).json({ message: "Deduction record not found" });
//     }

//     await record.destroy();

//     return res.json({ success: true, message: "Deduction record deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ================= HELPER =================
// async function calculateTotals(record) {
//   const total =
//     parseFloat(record.tds || 0) +
//     parseFloat(record.others || 0) +
//     parseFloat(record.salaries || 0) +
//     parseFloat(record.esi || 0) +
//     parseFloat(record.epf || 0) +
//     parseFloat(record.pt || 0);

//   const baseAmount = await BaseAmount.findByPk(record.base_amount_id);
//   const grandTotal = baseAmount ? parseFloat(baseAmount.grand_total || 0) : 0;
//   const balance = grandTotal - total;

//   return { total: total.toFixed(2), balance: balance.toFixed(2) };
// }




// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const BaseAmount = require("../models/base_amount.model");
// const PlantName = require("../models/plant_name.model");
// const Employee = require("../models/employee.model");

// // =====================
// // Helper: get root company id dynamically
// // =====================
// async function getCompanyId(req) {
//   if (!req.user) return null;

//   const type = req.user.type?.toLowerCase();

//   // 1️⃣ Company login
//   if (type === "company") return req.user.id;

//   // 2️⃣ Employee login
//   if (type === "employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     if (emp?.created_by) return emp.created_by;
//   }

//   // 3️⃣ Other roles (Accountant, HR, Manager)
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//   });
//   if (emp?.created_by) return emp.created_by;

//   return req.user.id; // fallback
// }

// // =====================
// // CREATE
// // =====================
// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     // Employees/Accountant cannot create
//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to create deduction" });
//     }

//     const {
//       job_mode_id,
//       plant_id,
//       contract_period_id,
//       base_amount_id,
//       tds,
//       others,
//       salaries,
//       esi,
//       epf,
//       pt,
//     } = req.body;

//     if (!plant_id || !base_amount_id)
//       return res.status(400).json({ message: "plant_id and base_amount_id are required" });

//     // Validate Plant & BaseAmount belong to company
//     const plant = await PlantName.findOne({ where: { id: plant_id, created_by: companyId } });
//     if (!plant) return res.status(400).json({ message: "Invalid plant_id for this company" });

//     const baseAmount = await BaseAmount.findOne({ where: { id: base_amount_id, created_by: companyId } });
//     if (!baseAmount) return res.status(400).json({ message: "Invalid base_amount_id for this company" });

//     let record = await DeductionPaymentDone.create({
//       job_mode_id,
//       plant_id,
//       contract_period_id,
//       base_amount_id,
//       tds,
//       others,
//       salaries,
//       esi,
//       epf,
//       pt,
//       created_by: companyId,
//     });

//     record = await record.reload();
//     const { total, balance } = await calculateTotals(record);

//     return res.status(201).json({
//       success: true,
//       data: { ...record.get({ plain: true }), total_deduction: total, balance },
//       message: "Deduction record created successfully",
//     });
//   } catch (err) {
//     console.error("Error creating deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET ALL
// // =====================
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res.status(403).json({ message: "Unable to resolve company" });

//     const records = await DeductionPaymentDone.findAll({
//       where: { created_by: companyId },
//       order: [["id", "DESC"]],
//     });

//     const results = await Promise.all(
//       records.map(async (record) => {
//         // fetch related plant + base amount manually
//         const plant = await PlantName.findOne({
//           where: { id: record.plant_id, created_by: companyId },
//           attributes: ["id", "name"],
//         });

//         const baseAmount = await BaseAmount.findOne({
//           where: { id: record.base_amount_id, created_by: companyId },
//           attributes: ["id", "grand_total"],
//         });

//         const { total, balance } = await calculateTotals(record);

//         return {
//           ...record.get({ plain: true }),
//           plant,
//           base_amount: baseAmount,
//           total_deduction: total,
//           balance,
//         };
//       })
//     );

//     return res.json({ success: true, data: results });
//   } catch (err) {
//     console.error("Error fetching deductions:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };


// // =====================
// // GET BY ID
// // =====================
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res.status(403).json({ message: "Unable to resolve company" });

//     const record = await DeductionPaymentDone.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!record)
//       return res.status(404).json({ message: "Deduction record not found" });

//     const plant = await PlantName.findOne({
//       where: { id: record.plant_id, created_by: companyId },
//       attributes: ["id", "name"],
//     });

//     const baseAmount = await BaseAmount.findOne({
//       where: { id: record.base_amount_id, created_by: companyId },
//       attributes: ["id", "grand_total"],
//     });

//     const { total, balance } = await calculateTotals(record);

//     return res.json({
//       success: true,
//       data: {
//         ...record.get({ plain: true }),
//         plant,
//         base_amount: baseAmount,
//         total_deduction: total,
//         balance,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching deduction by id:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };


// // =====================
// // UPDATE
// // =====================
// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to update deduction" });
//     }

//     const record = await DeductionPaymentDone.findByPk(req.params.id);
//     if (!record) return res.status(404).json({ message: "Deduction record not found" });

//     await record.update(req.body);
//     const { total, balance } = await calculateTotals(record);

//     return res.json({ success: true, data: { ...record.get({ plain: true }), total_deduction: total, balance }, message: "Deduction record updated successfully" });
//   } catch (err) {
//     console.error("Error updating deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // DELETE
// // =====================
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to delete deduction" });
//     }

//     const record = await DeductionPaymentDone.findByPk(req.params.id);
//     if (!record) return res.status(404).json({ message: "Deduction record not found" });

//     await record.destroy();
//     return res.json({ success: true, message: "Deduction record deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting deduction:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // HELPER: Calculate totals & balance
// // =====================
// async function calculateTotals(record) {
//   const total =
//     parseFloat(record.tds || 0) +
//     parseFloat(record.others || 0) +
//     parseFloat(record.salaries || 0) +
//     parseFloat(record.esi || 0) +
//     parseFloat(record.epf || 0) +
//     parseFloat(record.pt || 0);

//   const baseAmount = await BaseAmount.findOne({ where: { id: record.base_amount_id } });
//   const grandTotal = baseAmount ? parseFloat(baseAmount.grand_total || 0) : 0;
//   const balance = grandTotal - total;

//   return { total: total.toFixed(2), balance: balance.toFixed(2) };
// }






const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Allowance = require('../models/allowance.model');
const Commission = require('../models/commission.model');
const Loan = require('../models/loan.model');
const SaturationDeduction = require('../models/saturationDeduction.model');
const OtherPayment = require('../models/otherPayment.model');
const Overtime = require('../models/overtime.model');
const Employee = require('../models/employee.model');
const Branch = require("../models/branch.model");


async function getCompanyId(req) {
  if (req.user?.type === 'company') return req.user.id;
  if (req.user?.creator_id) return req.user.creator_id;

  if (req.user?.type === 'Employee') {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by']
    });
    return emp?.created_by;
  }

  // fallback — attempt lookup
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by']
  });
  return emp?.created_by || req.user?.id;
}

// 🔹 FIX ADDED: define role helpers
function isCompanyUser(req) {
  const t = (req.user?.type || "").toLowerCase();
  return t === "company" || t === "admin";
}

function isEmployeeUser(req) {
  return (req.user?.type || "").toLowerCase() === "employee";
}

// Utility to compute item value (percentage vs fixed)
function computeValue(itemAmount, itemType, baseSalary) {
  const amt = parseFloat(itemAmount || 0);
  if (!itemType) return amt;
  if (String(itemType).toLowerCase() === 'percentage') {
    return (amt / 100) * parseFloat(baseSalary || 0);
  }
  return amt;
}

exports.calculateNetSalaryByBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId;
    if (!branchId)
      return res
        .status(400)
        .json({ success: false, message: "branchId required" });

    const companyId = await getCompanyId(req);

    // 1) Validate branch belongs to company
    const branch = await Branch.findOne({
      where: { id: branchId, created_by: companyId },
    });
    if (!branch)
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });

    // 2) Get all employees of this branch
    const employees = await Employee.findAll({
      where: { branch_id: branchId, created_by: companyId },
    });
    if (!employees.length)
      return res.json({
        success: false,
        message: "No employees found in this branch",
      });

    // 3) Process each employee
    const results = [];
    let branchTotals = {
      base_salary: 0,
      additions: 0,
      deductions: 0,
      gross: 0,
      net: 0,
    };

    for (const employee of employees) {
      const baseSalary = parseFloat(employee.salary || 0);

      const [
        allowances,
        commissions,
        loans,
        saturationDeductions,
        otherPayments,
        overtimes,
      ] = await Promise.all([
        Allowance.findAll({
          where: { employee_id: employee.employee_id, created_by: companyId },
        }),
        Commission.findAll({
          where: { employee_id: employee.id, created_by: companyId },
        }),
        Loan.findAll({
          where: { employee_id: employee.employee_id, created_by: companyId },
        }),
        SaturationDeduction.findAll({
          where: { employee_id: employee.employee_id, created_by: companyId },
        }),
        OtherPayment.findAll({
          where: { employee_id: employee.employee_id, created_by: companyId },
        }),
        Overtime.findAll({
          where: { employee_id: employee.employee_id, created_by: companyId },
        }),
      ]);

      // totals
      const allowancesTotal = allowances.reduce(
        (s, a) => s + computeValue(a.amount, a.type, baseSalary),
        0
      );
      const commissionsTotal = commissions.reduce(
        (s, c) => s + computeValue(c.amount, c.type, baseSalary),
        0
      );
      const otherPaymentsTotal = otherPayments.reduce(
        (s, o) => s + computeValue(o.amount, o.type, baseSalary),
        0
      );
      const overtimeTotal = overtimes.reduce((s, o) => {
        const days = Number(o.number_of_days || 0);
        const hours = Number(o.hours || 0);
        const rate = Number(o.rate || 0);
        return s + days * hours * rate;
      }, 0);
      const loansTotal = loans.reduce(
        (s, l) => s + computeValue(l.amount, l.type, baseSalary),
        0
      );
      const saturationTotal = saturationDeductions.reduce(
        (s, sat) => s + computeValue(sat.amount, sat.type, baseSalary),
        0
      );

      const additions = allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;
      const gross = baseSalary + additions;
      const deductions = loansTotal + saturationTotal;
      const net = Number((gross - deductions).toFixed(2));

      // push employee result
      results.push({
        employee_id: employee.employee_id,
        name: employee.name,
        base_salary: baseSalary,
        totals: {
          additions: Number(additions.toFixed(2)),
          deductions: Number(deductions.toFixed(2)),
          gross: Number(gross.toFixed(2)),
          net,
        },
      });

      // update branch totals
      branchTotals.base_salary += baseSalary;
      branchTotals.additions += additions;
      branchTotals.deductions += deductions;
      branchTotals.gross += gross;
      branchTotals.net += net;
    }

    branchTotals = {
      base_salary: Number(branchTotals.base_salary.toFixed(2)),
      additions: Number(branchTotals.additions.toFixed(2)),
      deductions: Number(branchTotals.deductions.toFixed(2)),
      gross: Number(branchTotals.gross.toFixed(2)),
      net: Number(branchTotals.net.toFixed(2)),
    };

    return res.json({
      success: true,
      branch: { id: branch.id, name: branch.name },
      employees: results,
      branchTotals,
    });
  } catch (err) {
    console.error("❌ calculateNetSalaryByBranch Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
