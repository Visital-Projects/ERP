

const { Op } = require('sequelize');
const Department = require('../models/department.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Allowance = require('../models/allowance.model');
const Commission = require('../models/commission.model');
const Loan = require('../models/loan.model');
const SaturationDeduction = require('../models/saturationDeduction.model');
const OtherPayment = require('../models/otherPayment.model');
const Overtime = require('../models/overtime.model');
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// -----------------------------
// Helper: Resolve company/employee context
// -----------------------------
async function resolveRequestContext(req) {
  if (!req.user) return { companyId: null, employeeBusinessId: null, employeeRecord: null, isEmployee: false };

  const type = (req.user.type || '').toLowerCase();
  if (type === 'company') return { companyId: req.user.id, employeeBusinessId: null, employeeRecord: null, isEmployee: false };

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['id', 'employee_id', 'created_by', 'department_id', 'salary', 'user_id'],
    raw: true
  });

  if (!emp) return { companyId: null, employeeBusinessId: null, employeeRecord: null, isEmployee: false };

  return {
    companyId: emp.created_by,
    employeeBusinessId: emp.employee_id,
    employeeRecord: emp,
    isEmployee: type === 'employee'
  };
}

// -----------------------------
// Utility: convert YYYY-MM → Month Year
// -----------------------------
function formatMonthLabel(ym) {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

// -----------------------------
// Utility: compute raw value (percentage or fixed)
// -----------------------------
function computeValue(amount, type, baseSalary) {
  const amt = parseFloat(amount || 0);
  if (!type) return amt;
  if (String(type).toLowerCase() === 'percentage') return (amt / 100) * parseFloat(baseSalary || 0);
  return amt;
}

// -----------------------------
// Compute net salary for a single employee
// -----------------------------
async function computeEmployeeNet(employee, companyId, monthFilter = null) {
  const baseSalary = parseFloat(employee.salary || 0);
  const monthWhere = {};
  if (monthFilter && monthFilter.fieldName) {
    if (monthFilter.between && Array.isArray(monthFilter.between)) {
      monthWhere[monthFilter.fieldName] = { [Op.between]: monthFilter.between };
    } else {
      monthWhere[monthFilter.fieldName] = monthFilter.value;
    }
  }
  const empBusinessId = String(employee.employee_id || '');

  const [allowances, commissions, loans, saturationDeductions, otherPayments, overtimes] = await Promise.all([
    Allowance.findAll({ where: { employee_id: empBusinessId, created_by: companyId, ...monthWhere }, raw: true }),
    Commission.findAll({ where: { employee_id: employee.id, created_by: companyId, ...monthWhere }, raw: true }),
    Loan.findAll({ where: { employee_id: empBusinessId, created_by: companyId, ...monthWhere }, raw: true }),
    SaturationDeduction.findAll({ where: { employee_id: empBusinessId, created_by: companyId, ...monthWhere }, raw: true }),
    OtherPayment.findAll({ where: { employee_id: empBusinessId, created_by: companyId, ...monthWhere }, raw: true }),
    Overtime.findAll({ where: { employee_id: empBusinessId, created_by: companyId, ...monthWhere }, raw: true })
  ]);

  const allowancesTotal = allowances.reduce((s, a) => s + computeValue(a.amount, a.type, baseSalary), 0);
  const commissionsTotal = commissions.reduce((s, c) => s + computeValue(c.amount, c.type, baseSalary), 0);
  const otherPaymentsTotal = otherPayments.reduce((s, o) => s + computeValue(o.amount, o.type, baseSalary), 0);

  const overtimeTotal = overtimes.reduce((s, o) => {
    const days = Number(o.number_of_days || 0);
    const hours = Number(o.hours || 0);
    const rate = Number(o.rate || 0);
    return s + days * hours * rate;
  }, 0);

  const loansTotal = loans.reduce((s, l) => s + computeValue(l.amount, l.type, baseSalary), 0);
  const saturationTotal = saturationDeductions.reduce((s, sd) => s + computeValue(sd.amount, sd.type, baseSalary), 0);

  const additions = allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;
  const deductions = loansTotal + saturationTotal;
  const gross = baseSalary + additions;
  const net = Number((gross - deductions).toFixed(2));

  return { baseSalary: Number(baseSalary.toFixed(2)), additions: Number(additions.toFixed(2)), deductions: Number(deductions.toFixed(2)), gross: Number(gross.toFixed(2)), net };
}

// -----------------------------
// Controller: Branch-wise manpower report
// -----------------------------
exports.getBranchWiseManpower = async (req, res) => {
  try {
    const ctx = await resolveRequestContext(req);
    const { companyId, employeeBusinessId, employeeRecord, isEmployee } = ctx;

    if (!companyId) 
      return res.status(403).json({ success: false, message: 'Unauthorized: company context required' });

    // Parse months
    const monthsParam = (req.query.months || '').trim();
    let months = monthsParam
      ? monthsParam.split(',').map(m => m.trim())
      : [new Date().toISOString().slice(0, 7)];

    // Get branch_id from params
    const branchId = req.params.branch_id ? parseInt(req.params.branch_id) : null;
    if (!branchId) 
      return res.status(400).json({ success: false, message: 'branch_id is required' });

    // Fetch the branch
    const branch = await Branch.findOne({ where: { id: branchId, created_by: companyId }, raw: true });
    if (!branch) 
      return res.status(404).json({ success: false, message: 'Branch not found' });

    // Fetch all departments under this branch
    const deptWhere = { created_by: companyId, branch_id: branch.id };
    if (isEmployee) {
      // If employee, only fetch their department
      deptWhere.id = employeeRecord.department_id;
    }

    const departments = await Department.findAll({ where: deptWhere, raw: true, order: [['id', 'ASC']] });

    const deptResults = [];

    // Loop through each department
    for (const dept of departments) {
      const empWhere = { department_id: dept.id, created_by: companyId, is_active: true, branch_id: branch.id };
      if (isEmployee) empWhere.employee_id = employeeBusinessId; // employee can only see self

      const employeesInDept = await Employee.findAll({
        where: empWhere,
        raw: true,
        attributes: ['id', 'employee_id', 'name', 'salary', 'user_id']
      });

      // Skip department if no employees
      if (!employeesInDept.length) continue;

      const rows = [];

      for (const month of months) {
        const start = new Date(month + "-01T00:00:00.000Z");
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
        const monthFilter = { fieldName: 'created_at', between: [start, end] };

        let totalSalary = 0;
        for (const emp of employeesInDept) {
          const netInfo = await computeEmployeeNet(emp, companyId, monthFilter);
          totalSalary += netInfo.net;
        }

        const qty = employeesInDept.length;
        const avg = qty > 0 ? Number((totalSalary / qty).toFixed(2)) : 0;
        rows.push({ month: formatMonthLabel(month), qty, totalSalary: Number(totalSalary.toFixed(2)), averagePerHead: avg });
      }

      deptResults.push({ id: dept.id, name: dept.name, rows });
    }

    const report = [{ branchId: branch.id, branchName: branch.name, departments: deptResults }];

    return res.json({ success: true, data: { months: months.map(formatMonthLabel), report } });

  } catch (err) {
    console.error('❌ Branch wise manpower report error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};






// -----------------------------
// Controller: All branches manpower report (with pagination)
// -----------------------------
exports.getAllBranchWiseManpower = async (req, res) => {
  try {
    const ctx = await resolveRequestContext(req);
    const { companyId, employeeBusinessId, employeeRecord, isEmployee } = ctx;

    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized: company context required' });

    // Parse pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parse months
    const monthsParam = (req.query.months || '').trim();
    let months = monthsParam
      ? monthsParam.split(',').map(m => m.trim())
      : [new Date().toISOString().slice(0, 7)];

    // Fetch all branches (paginated)
    const { rows: branches, count: totalBranches } = await Branch.findAndCountAll({
      where: { created_by: companyId },
      raw: true,
      order: [['id', 'ASC']],
      offset,
      limit
    });

    const report = [];

    for (const branch of branches) {
      const deptWhere = { created_by: companyId, branch_id: branch.id };
      if (isEmployee) deptWhere.id = employeeRecord.department_id;

      const departments = await Department.findAll({ where: deptWhere, raw: true, order: [['id', 'ASC']] });
      const deptResults = [];

      for (const dept of departments) {
        const empWhere = { department_id: dept.id, created_by: companyId, is_active: true, branch_id: branch.id };
        if (isEmployee) empWhere.employee_id = employeeBusinessId;

        const employeesInDept = await Employee.findAll({
          where: empWhere,
          raw: true,
          attributes: ['id', 'employee_id', 'name', 'salary', 'user_id']
        });

        const rows = [];

        for (const month of months) {
          const start = new Date(month + "-01T00:00:00.000Z");
          const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
          const monthFilter = { fieldName: 'created_at', between: [start, end] };

          let totalSalary = 0;
          for (const emp of employeesInDept) {
            const netInfo = await computeEmployeeNet(emp, companyId, monthFilter);
            totalSalary += netInfo.net;
          }

          const qty = employeesInDept.length;
          const avg = qty > 0 ? Number((totalSalary / qty).toFixed(2)) : 0;
          rows.push({
            month: formatMonthLabel(month),
            qty,
            totalSalary: Number(totalSalary.toFixed(2)),
            averagePerHead: avg
          });
        }

        deptResults.push({ id: dept.id, name: dept.name, rows });
      }

      report.push({ branchId: branch.id, branchName: branch.name, departments: deptResults });
    }

    return res.json({
      success: true,
      data: {
        months: months.map(formatMonthLabel),
        totalBranches,
        currentPage: page,
        totalPages: Math.ceil(totalBranches / limit),
        report
      }
    });

  } catch (err) {
    console.error('❌ All branches manpower report error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};





// -----------------------------
// Controller: Excel Export (Branch-wise)
// -----------------------------
exports.downloadBranchWiseManpowerExcel = async (req, res) => {
  try {
    const data = await exports.getBranchWiseManpower(req);
    if (!data.success) return res.status(400).json(data);

    const { months, report } = data.data;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Branch Wise Manpower");

    // Title
    worksheet.mergeCells("A1:" + String.fromCharCode(65 + months.length * 3) + "1");
    worksheet.getCell("A1").value = "Branch wise report of Manpower - qty/avg salaries";
    worksheet.getCell("A1").alignment = { horizontal: "center" };
    worksheet.getCell("A1").font = { bold: true };

    // Headers
    let rowIndex = 2;
    for (const branch of report) {
      worksheet.mergeCells(rowIndex, 1, rowIndex, 1 + months.length * 3);
      worksheet.getCell(rowIndex, 1).value = `Branch: ${branch.branchName}`;
      worksheet.getCell(rowIndex, 1).font = { bold: true };
      rowIndex++;

      // Header row
      worksheet.mergeCells(rowIndex, 1, rowIndex + 1, 1);
      worksheet.getCell(rowIndex, 1).value = "Manpower";
      worksheet.getCell(rowIndex, 1).alignment = { vertical: "middle", horizontal: "center" };

      let colIndex = 2;
      for (const month of months) {
        const startCol = colIndex;
        const endCol = colIndex + 2;
        worksheet.mergeCells(rowIndex, startCol, rowIndex, endCol);
        worksheet.getCell(rowIndex, startCol).value = month;
        worksheet.getCell(rowIndex, startCol).alignment = { horizontal: "center" };

        worksheet.getCell(rowIndex + 1, startCol).value = "Qty";
        worksheet.getCell(rowIndex + 1, startCol + 1).value = "Total salaries";
        worksheet.getCell(rowIndex + 1, startCol + 2).value = "Average/Head";
        colIndex += 3;
      }

      // Fill data rows
      rowIndex += 2;
      for (const dept of branch.departments) {
        const row = worksheet.getRow(rowIndex);
        row.getCell(1).value = dept.name;
        let col = 2;
        for (const month of months) {
          const rowData = dept.rows.find(r => r.month === month) || { qty: 0, totalSalary: 0, averagePerHead: 0 };
          row.getCell(col).value = rowData.qty;
          row.getCell(col + 1).value = rowData.totalSalary;
          row.getCell(col + 2).value = rowData.averagePerHead;
          col += 3;
        }
        rowIndex++;
      }

      rowIndex++; // spacing after each branch
    }

    // Column widths
    worksheet.columns.forEach(col => col.width = 18);
    worksheet.eachRow(row => row.height = 20);

    // Borders
    worksheet.eachRow({ includeEmpty: false }, row => {
      row.eachCell(cell => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    });

    // Send file directly to client (works in Postman)
    res.setHeader('Content-Disposition', 'attachment; filename=Branch_Manpower_Report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res); // write directly to response
    res.end();

  } catch (err) {
    console.error('❌ Branch Excel Export Error:', err);
    res.status(500).json({ success: false, message: "Failed to export Excel", error: err.message });
  }
};
