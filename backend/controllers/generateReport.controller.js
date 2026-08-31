// const ExcelJS = require("exceljs");
// const path = require("path");
// const fs = require("fs");
// const BaseAmount = require('../models/base_amount.model');
// const JobMode = require('../models/job_mode.model');
// const PlantName = require('../models/plant_name.model');
// const ContractPeriod = require('../models/contract_period.model');
// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const PaymentReceived = require("../models/payment_received.model");
// const { Sequelize } = require("sequelize");

// exports.downloadMonthlyReport = async (req, res) => {
//   try {
//     // Helper to safely convert values to numbers
//     const toNumber = (val) => (val ? parseFloat(val) : 0);

//     // 1. Create Workbook & Worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Monthly Report");

//     // 2. Header Row
//     worksheet.mergeCells("A1:A2");
//     worksheet.getCell("A1").value = "Job mode";
//     worksheet.mergeCells("B1:B2");
//     worksheet.getCell("B1").value = "Plant Name";
//     worksheet.mergeCells("C1:C2");
//     worksheet.getCell("C1").value = "Contract period\nPO/WO No(Work Order/Purchase Order)";
//     worksheet.mergeCells("D1:D2");
//     worksheet.getCell("D1").value = "Invoice raised\nBasic(Base Amount)";
//     worksheet.mergeCells("E1:G1");
//     worksheet.getCell("E1").value = "Tax";
//     worksheet.getCell("E2").value = "CGST";
//     worksheet.getCell("F2").value = "SGST";
//     worksheet.getCell("G2").value = "IGST";
//     worksheet.mergeCells("H1:H2");
//     worksheet.getCell("H1").value = "Total";
//     worksheet.mergeCells("I1:I2");
//     worksheet.getCell("I1").value = "Payment Received";
//     worksheet.mergeCells("J1:O1");
//     worksheet.getCell("J1").value = "Deductions / Payment Done";
//     worksheet.getCell("J2").value = "TDS";
//     worksheet.getCell("K2").value = "OTHERS";
//     worksheet.getCell("L2").value = "Salaries/oth exp.";
//     worksheet.getCell("M2").value = "ESI";
//     worksheet.getCell("N2").value = "EPF";
//     worksheet.getCell("O2").value = "PT";
//     worksheet.mergeCells("P1:P2");
//     worksheet.getCell("P1").value = "Balance";

//     // Style header
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber <= 2) {
//         row.eachCell((cell) => {
//           cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
//           cell.font = { bold: true };
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" }
//           };
//         });
//       }
//     });

//     // 3. Fetch Data
//     const jobModes = await JobMode.findAll({ include: [{ model: PlantName, as: "plants" }] });

//     for (const jm of jobModes) {
//       // Add Job Mode row
//       worksheet.addRow([jm.name]).font = { bold: true };

//       for (const plant of jm.plants) {
//         const contract = await ContractPeriod.findOne({ where: { job_mode_id: jm.id, plant_id: plant.id } });
//         const invoices = await BaseAmount.findAll({ where: { job_mode_id: jm.id, plant_id: plant.id } });

//         for (const invoice of invoices) {
//           const payment = await PaymentReceived.findOne({ where: { base_amount_id: invoice.id } });
//           const deduction = await DeductionPaymentDone.findOne({ where: { base_amount_id: invoice.id } });

//           const totalDeduction =
//             toNumber(deduction?.tds) +
//             toNumber(deduction?.others) +
//             toNumber(deduction?.salaries) +
//             toNumber(deduction?.esi) +
//             toNumber(deduction?.epf) +
//             toNumber(deduction?.pt);

//           const balance = toNumber(invoice?.grand_total) - totalDeduction;

//           worksheet.addRow([
//             "",
//             plant.name || "",
//             contract?.po_wo_number || "",
//             toNumber(invoice?.base_amount),
//             toNumber(invoice?.cgst_amount),
//             toNumber(invoice?.sgst_amount),
//             toNumber(invoice?.igst_amount),
//             toNumber(invoice?.grand_total),
//             toNumber(payment?.payment_received),
//             toNumber(deduction?.tds),
//             toNumber(deduction?.others),
//             toNumber(deduction?.salaries),
//             toNumber(deduction?.esi),
//             toNumber(deduction?.epf),
//             toNumber(deduction?.pt),
//             balance
//           ]);
//         }
//       }
//     }

//     // 4. Calculate Totals (reuse your getFinancialReport logic)
//     const baseAmountSum = await BaseAmount.findOne({
//       attributes: [[Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"]],
//       raw: true,
//     });
//     const totalBaseAmount = parseFloat(baseAmountSum.total_taxable_amount || 0);

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

//     const d = deductions[0];
//     const totalLoanDeduction =
//       toNumber(d.tds) +
//       toNumber(d.others) +
//       toNumber(d.salaries) +
//       toNumber(d.esi) +
//       toNumber(d.epf) +
//       toNumber(d.pt);

//     const overallBalance = totalBaseAmount - totalLoanDeduction;

//     // 5. Totals Row (use values, not formulas)
//     worksheet.addRow([]);
//     worksheet.addRow([
//       "Total Loan deduction", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
//       totalLoanDeduction.toFixed(2)
//     ]);
//     worksheet.addRow([
//       "Overall Balance", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
//       overallBalance.toFixed(2)
//     ]);

//     // 6. Save file to server and return link
//     const fileDir = path.join(__dirname, "../public/reports");
//     fs.mkdirSync(fileDir, { recursive: true });
//     const filePath = path.join(fileDir, "Monthly_Report.xlsx");
//     await workbook.xlsx.writeFile(filePath);

//     const downloadUrl = `/reports/Monthly_Report.xlsx`;
//     res.json({ success: true, downloadUrl });

//   } catch (error) {
//     console.error("Excel generation error:", error);
//     res.status(500).json({ message: "Error generating report", error });
//   }
// };





// const ExcelJS = require("exceljs");
// const path = require("path");
// const fs = require("fs");
// const BaseAmount = require('../models/base_amount.model');
// const JobMode = require('../models/job_mode.model');
// const PlantName = require('../models/plant_name.model');
// const ContractPeriod = require('../models/contract_period.model');
// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const PaymentReceived = require("../models/payment_received.model");
// const { Sequelize } = require("sequelize");

// exports.downloadMonthlyReport = async (req, res) => {
//   try {
//     const toNumber = (val) => (val ? parseFloat(val) : 0);

//     // 1. Create Workbook & Worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Monthly Report");

//     // 2. Title Row
//     worksheet.mergeCells("C1:P1");
//     worksheet.getCell("C1").value = "Month report of Income / expenses / Balance";
//     worksheet.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };
//     worksheet.getCell("C1").font = { bold: true };

//     // 3. Headers
//     worksheet.mergeCells("A2:A3");
//     worksheet.getCell("A2").value = "Job mode";

//     worksheet.mergeCells("B2:B3");
//     worksheet.getCell("B2").value = "Plant Name";

//     worksheet.mergeCells("C2:C3");
//     worksheet.getCell("C2").value = "Contract period\nPO/WO No(Work Order/Purchase Order)";

//     worksheet.mergeCells("D2:D3");
//     worksheet.getCell("D2").value = "Invoice raised\nBasic(Base Amount)";

//     worksheet.mergeCells("E2:G2");
//     worksheet.getCell("E2").value = "Tax";
//     worksheet.getCell("E3").value = "CGST";
//     worksheet.getCell("F3").value = "SGST";
//     worksheet.getCell("G3").value = "IGST";

//     worksheet.mergeCells("H2:H3");
//     worksheet.getCell("H2").value = "Total";

//     worksheet.mergeCells("I2:I3");
//     worksheet.getCell("I2").value = "Payment Received";

//     worksheet.mergeCells("J2:K2");
//     worksheet.getCell("J2").value = "Deductions";
//     worksheet.getCell("J3").value = "TDS";
//     worksheet.getCell("K3").value = "OTHERS";

//     worksheet.mergeCells("L2:O2");
//     worksheet.getCell("L2").value = "Payment Done";
//     worksheet.getCell("L3").value = "Salaries/oth exp.";
//     worksheet.getCell("M3").value = "ESI";
//     worksheet.getCell("N3").value = "EPF";
//     worksheet.getCell("O3").value = "PT";

//     worksheet.mergeCells("P2:P3");
//     worksheet.getCell("P2").value = "Balance";

//     // Style header rows
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber <= 3) {
//         row.eachCell((cell) => {
//           cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
//           cell.font = { bold: true };
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" }
//           };
//         });
//       }
//     });

//     // 4. Fetch Data
//     const jobModes = await JobMode.findAll({ include: [{ model: PlantName, as: "plants" }] });

//     for (const jm of jobModes) {
//       // Add Job Mode row
//       let jmRow = worksheet.addRow([jm.name]);
//       jmRow.font = { bold: true };
//       worksheet.mergeCells(`A${jmRow.number}:P${jmRow.number}`);
//       worksheet.getCell(`A${jmRow.number}`).alignment = { horizontal: "left" };

//       for (const plant of jm.plants) {
//         const contract = await ContractPeriod.findOne({ where: { job_mode_id: jm.id, plant_id: plant.id } });
//         const invoices = await BaseAmount.findAll({ where: { job_mode_id: jm.id, plant_id: plant.id } });

//         for (const invoice of invoices) {
//           const payment = await PaymentReceived.findOne({ where: { base_amount_id: invoice.id } });
//           const deduction = await DeductionPaymentDone.findOne({ where: { base_amount_id: invoice.id } });

//           const totalDeduction =
//             toNumber(deduction?.tds) +
//             toNumber(deduction?.others) +
//             toNumber(deduction?.salaries) +
//             toNumber(deduction?.esi) +
//             toNumber(deduction?.epf) +
//             toNumber(deduction?.pt);

//           const balance = toNumber(invoice?.grand_total) - totalDeduction;

//           worksheet.addRow([
//             "",
//             plant.name || "",
//             contract?.po_wo_number || "",
//             toNumber(invoice?.base_amount),
//             toNumber(invoice?.cgst_amount),
//             toNumber(invoice?.sgst_amount),
//             toNumber(invoice?.igst_amount),
//             toNumber(invoice?.grand_total),
//             toNumber(payment?.payment_received),
//             toNumber(deduction?.tds),
//             toNumber(deduction?.others),
//             toNumber(deduction?.salaries),
//             toNumber(deduction?.esi),
//             toNumber(deduction?.epf),
//             toNumber(deduction?.pt),
//             balance
//           ]);
//         }
//       }
//     }

//     // 5. Totals
//     const baseAmountSum = await BaseAmount.findOne({
//       attributes: [[Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"]],
//       raw: true,
//     });
//     const totalBaseAmount = parseFloat(baseAmountSum.total_taxable_amount || 0);

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

//     const d = deductions[0];
//     const totalLoanDeduction =
//       toNumber(d.tds) +
//       toNumber(d.others) +
//       toNumber(d.salaries) +
//       toNumber(d.esi) +
//       toNumber(d.epf) +
//       toNumber(d.pt);

//     const overallBalance = totalBaseAmount - totalLoanDeduction;

//     worksheet.addRow([]);
//     let totalRow = worksheet.addRow(["Total Loans deduction"]);
//     worksheet.mergeCells(`A${totalRow.number}:O${totalRow.number}`);
//     worksheet.getCell(`A${totalRow.number}`).alignment = { horizontal: "left" };
//     worksheet.getCell(`P${totalRow.number}`).value = totalLoanDeduction.toFixed(2);

//     let balanceRow = worksheet.addRow(["Overall Balance"]);
//     worksheet.mergeCells(`A${balanceRow.number}:O${balanceRow.number}`);
//     worksheet.getCell(`A${balanceRow.number}`).alignment = { horizontal: "left" };
//     worksheet.getCell(`P${balanceRow.number}`).value = overallBalance.toFixed(2);

//     // 6. Save file to server
//     const fileDir = path.join(__dirname, "../public/reports");
//     fs.mkdirSync(fileDir, { recursive: true });
//     const filePath = path.join(fileDir, "Monthly_Report.xlsx");
//     await workbook.xlsx.writeFile(filePath);

//     const downloadUrl = `/reports/Monthly_Report.xlsx`;
//     res.json({ success: true, downloadUrl });

//   } catch (error) {
//     console.error("Excel generation error:", error);
//     res.status(500).json({ message: "Error generating report", error });
//   }
// };






// const ExcelJS = require("exceljs");
// const path = require("path");
// const fs = require("fs");
// const BaseAmount = require("../models/base_amount.model");
// const JobMode = require("../models/job_mode.model");
// const PlantName = require("../models/plant_name.model");
// const ContractPeriod = require("../models/contract_period.model");
// const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
// const PaymentReceived = require("../models/payment_received.model");
// const { Sequelize } = require("sequelize");

// exports.downloadMonthlyReport = async (req, res) => {
//   try {
//     const toNumber = (val) => (val ? parseFloat(val) : 0);

//     // 1. Workbook & Worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Monthly Report");

//     // ===============================
//     // 2. Title Row
//     // ===============================
//     worksheet.mergeCells("C1:P1");
//     worksheet.getCell("C1").value =
//       "Month report of Income / expenses / Balance";
//     worksheet.getCell("C1").alignment = {
//       horizontal: "center",
//       vertical: "middle",
//     };
//     worksheet.getCell("C1").font = { bold: true, size: 14 };

//     // ===============================
//     // 3. Header Rows
//     // ===============================
//     worksheet.mergeCells("A2:A3");
//     worksheet.getCell("A2").value = "Job mode";

//     worksheet.mergeCells("B2:B3");
//     worksheet.getCell("B2").value = "Plant Name";

//     worksheet.mergeCells("C2:C3");
//     worksheet.getCell("C2").value =
//       "Contract period\nPO/WO No(Work Order/Purchase Order)";

//     worksheet.mergeCells("D2:D3");
//     worksheet.getCell("D2").value = "Invoice raised\nBasic(Base Amount)";

//     worksheet.mergeCells("E2:G2");
//     worksheet.getCell("E2").value = "Tax";
//     worksheet.getCell("E3").value = "CGST";
//     worksheet.getCell("F3").value = "SGST";
//     worksheet.getCell("G3").value = "IGST";

//     worksheet.mergeCells("H2:H3");
//     worksheet.getCell("H2").value = "Total";

//     worksheet.mergeCells("I2:I3");
//     worksheet.getCell("I2").value = "Payment Received";

//     worksheet.mergeCells("J2:K2");
//     worksheet.getCell("J2").value = "Deductions";
//     worksheet.getCell("J3").value = "TDS";
//     worksheet.getCell("K3").value = "OTHERS";

//     worksheet.mergeCells("L2:O2");
//     worksheet.getCell("L2").value = "Payment Done";
//     worksheet.getCell("L3").value = "Salaries/oth exp.";
//     worksheet.getCell("M3").value = "ESI";
//     worksheet.getCell("N3").value = "EPF";
//     worksheet.getCell("O3").value = "PT";

//     worksheet.mergeCells("P2:P3");
//     worksheet.getCell("P2").value = "Balance";

//     // Style headers
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber <= 3) {
//         row.eachCell((cell) => {
//           cell.alignment = {
//             vertical: "middle",
//             horizontal: "center",
//             wrapText: true,
//           };
//           cell.font = { bold: true };
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" },
//           };
//         });
//       }
//     });

//     // ===============================
//     // 4. Data (Group JobMode → Plant → Invoices)
//     // ===============================
//     const jobModes = await JobMode.findAll({
//       include: [{ model: PlantName, as: "plants" }],
//     });

//     for (const jm of jobModes) {
//       let jmStartRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 4;
//       let jmRowCount = 0;

//       for (const plant of jm.plants) {
//         let plantStartRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 4;
//         let plantRowCount = 0;

//         const contract = await ContractPeriod.findOne({
//           where: { job_mode_id: jm.id, plant_id: plant.id },
//         });

//         const invoices = await BaseAmount.findAll({
//           where: { job_mode_id: jm.id, plant_id: plant.id },
//         });

//         if (invoices.length > 0) {
//           for (const invoice of invoices) {
//             const payment = await PaymentReceived.findOne({
//               where: { base_amount_id: invoice.id },
//             });

//             const deduction = await DeductionPaymentDone.findOne({
//               where: { base_amount_id: invoice.id },
//             });

//             const totalDeduction =
//               toNumber(deduction?.tds) +
//               toNumber(deduction?.others) +
//               toNumber(deduction?.salaries) +
//               toNumber(deduction?.esi) +
//               toNumber(deduction?.epf) +
//               toNumber(deduction?.pt);

//             const balance = toNumber(invoice?.grand_total) - totalDeduction;

//             worksheet.addRow([
//               jm.name, // temporary, will merge
//               plant.name, // temporary, will merge
//               contract?.po_wo_number || "",
//               toNumber(invoice?.base_amount),
//               toNumber(invoice?.cgst_amount),
//               toNumber(invoice?.sgst_amount),
//               toNumber(invoice?.igst_amount),
//               toNumber(invoice?.grand_total),
//               toNumber(payment?.payment_received),
//               toNumber(deduction?.tds),
//               toNumber(deduction?.others),
//               toNumber(deduction?.salaries),
//               toNumber(deduction?.esi),
//               toNumber(deduction?.epf),
//               toNumber(deduction?.pt),
//               balance,
//             ]);
//             plantRowCount++;
//           }
//         } else {
//           worksheet.addRow([
//             jm.name,
//             plant.name,
//             contract?.po_wo_number || "",
//             "", "", "", "", "", "", "", "", "", "", "", "", "", ""
//           ]);
//           plantRowCount = 1;
//         }

//         // Merge Plant Name column for multiple invoices
//         if (plantRowCount > 1) {
//           let plantEndRow = plantStartRow + plantRowCount - 1;
//           worksheet.mergeCells(`B${plantStartRow}:B${plantEndRow}`);
//           worksheet.getCell(`B${plantStartRow}`).value = plant.name;
//           worksheet.getCell(`B${plantStartRow}`).alignment = {
//             vertical: "middle",
//             horizontal: "center",
//           };
//         }

//         jmRowCount += plantRowCount;
//       }

//       // Merge JobMode column across all its plants
//       if (jmRowCount > 1) {
//         let jmEndRow = jmStartRow + jmRowCount - 1;
//         worksheet.mergeCells(`A${jmStartRow}:A${jmEndRow}`);
//         worksheet.getCell(`A${jmStartRow}`).value = jm.name;
//         worksheet.getCell(`A${jmStartRow}`).alignment = {
//           vertical: "middle",
//           horizontal: "center",
//         };
//       }
//     }

//     // ===============================
//     // 5. Totals
//     // ===============================
//     const baseAmountSum = await BaseAmount.findOne({
//       attributes: [
//         [Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"],
//       ],
//       raw: true,
//     });
//     const totalBaseAmount = parseFloat(baseAmountSum.total_taxable_amount || 0);

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

//     const d = deductions[0];
//     const totalLoanDeduction =
//       toNumber(d.tds) +
//       toNumber(d.others) +
//       toNumber(d.salaries) +
//       toNumber(d.esi) +
//       toNumber(d.epf) +
//       toNumber(d.pt);

//     const overallBalance = totalBaseAmount - totalLoanDeduction;

//   worksheet.addRow([]);

// // Total Loan Deduction row
// let totalRow = worksheet.addRow(["Total Loans deduction"]);
// worksheet.mergeCells(`A${totalRow.number}:O${totalRow.number}`);
// let totalCell = worksheet.getCell(`A${totalRow.number}`);
// totalCell.value = "Total Loans deduction";
// totalCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
// worksheet.getCell(`P${totalRow.number}`).value = totalLoanDeduction.toFixed(2);

// // Overall Balance row
// let balanceRow = worksheet.addRow(["Overall Balance"]);
// worksheet.mergeCells(`A${balanceRow.number}:O${balanceRow.number}`);
// let balanceCell = worksheet.getCell(`A${balanceRow.number}`);
// balanceCell.value = "Overall Balance";
// balanceCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
// worksheet.getCell(`P${balanceRow.number}`).value = overallBalance.toFixed(2);

// // ===============================
// // 6. Borders & Alignment for data rows
// // ===============================
// worksheet.eachRow((row, rowNumber) => {
//   if (rowNumber > 3) {
//     row.eachCell((cell, colNumber) => {
//       // Only apply borders within A–P (1–16)
//       if (colNumber <= 16) {
//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           bottom: { style: "thin" },
//           right: { style: "thin" },
//         };
//       } else {
//         // Remove border if any beyond P
//         cell.border = {};
//       }

//       // ✅ Skip overriding totals alignment
//       if (rowNumber === totalRow.number || rowNumber === balanceRow.number) {
//         if (colNumber === 16) {
//           // Right column (P) keep centered
//           cell.alignment = { vertical: "middle", horizontal: "center" };
//         } else if (colNumber <= 15) {
//           // Left merged cell stays left
//           cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
//         }
//       } else {
//         // Normal rows → center align
//         cell.alignment = {
//           vertical: "middle",
//           horizontal: "center",
//           wrapText: true,
//         };
//       }
//     });
//   }
// });


//     // ===============================
//     // 7. Save file
//     // ===============================
//     const fileDir = path.join(__dirname, "../public/reports");
//     fs.mkdirSync(fileDir, { recursive: true });
//     const filePath = path.join(fileDir, "Monthly_Report.xlsx");
//     await workbook.xlsx.writeFile(filePath);

//     const downloadUrl = `/reports/Monthly_Report.xlsx`;
//     res.json({ success: true, downloadUrl });
//   } catch (error) {
//     console.error("Excel generation error:", error);
//     res.status(500).json({ message: "Error generating report", error });
//   }
// };






// controllers/generateReport.controller.js
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const BaseAmount = require("../models/base_amount.model");
const JobMode = require("../models/job_mode.model");
const PlantName = require("../models/plant_name.model");
const ContractPeriod = require("../models/contract_period.model");
const DeductionPaymentDone = require("../models/deductionPaymentDone.model");
const PaymentReceived = require("../models/payment_received.model");
const Employee = require("../models/employee.model");

// ==============================
// Helper: get root company id dynamically
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();
  if (type === "company") return req.user.id;

  // If employee or accountant/hr/manager → resolve company from Employee table
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  // fallback
  return req.user.id;
}

// ==============================
// DOWNLOAD MONTHLY REPORT
// ==============================
exports.downloadMonthlyReport = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    const toNumber = (val) => (val ? parseFloat(val) : 0);

    // 1. Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Report");

    // ===============================
    // 2. Title & Headers (unchanged)
    // ===============================
    worksheet.mergeCells("C1:P1");
    worksheet.getCell("C1").value =
      "Month report of Income / expenses / Balance";
    worksheet.getCell("C1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("C1").font = { bold: true, size: 14 };

    worksheet.mergeCells("A2:A3");
    worksheet.getCell("A2").value = "Job mode";
    worksheet.mergeCells("B2:B3");
    worksheet.getCell("B2").value = "Plant Name";
    worksheet.mergeCells("C2:C3");
    worksheet.getCell("C2").value =
      "Contract period\nPO/WO No(Work Order/Purchase Order)";
    worksheet.mergeCells("D2:D3");
    worksheet.getCell("D2").value = "Invoice raised\nBasic(Base Amount)";
    worksheet.mergeCells("E2:G2");
    worksheet.getCell("E2").value = "Tax";
    worksheet.getCell("E3").value = "CGST";
    worksheet.getCell("F3").value = "SGST";
    worksheet.getCell("G3").value = "IGST";
    worksheet.mergeCells("H2:H3");
    worksheet.getCell("H2").value = "Total";
    worksheet.mergeCells("I2:I3");
    worksheet.getCell("I2").value = "Payment Received";
    worksheet.mergeCells("J2:K2");
    worksheet.getCell("J2").value = "Deductions";
    worksheet.getCell("J3").value = "TDS";
    worksheet.getCell("K3").value = "OTHERS";
    worksheet.mergeCells("L2:O2");
    worksheet.getCell("L2").value = "Payment Done";
    worksheet.getCell("L3").value = "Salaries/oth exp.";
    worksheet.getCell("M3").value = "ESI";
    worksheet.getCell("N3").value = "EPF";
    worksheet.getCell("O3").value = "PT";
    worksheet.mergeCells("P2:P3");
    worksheet.getCell("P2").value = "Balance";

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
          cell.font = { bold: true };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // ===============================
    // 3. Data Fetch - Scoped by company
    // ===============================
    const jobModes = await JobMode.findAll({
      where: { created_by: companyId },
      include: [{ model: PlantName, as: "plants", where: { created_by: companyId }, required: false }],
    });

    for (const jm of jobModes) {
      let jmStartRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 4;
      let jmRowCount = 0;

      for (const plant of jm.plants) {
        let plantStartRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 4;
        let plantRowCount = 0;

        const contract = await ContractPeriod.findOne({
          where: { job_mode_id: jm.id, plant_id: plant.id, created_by: companyId },
        });

        const invoices = await BaseAmount.findAll({
          where: { job_mode_id: jm.id, plant_id: plant.id, created_by: companyId },
        });

        if (invoices.length > 0) {
          for (const invoice of invoices) {
            const payment = await PaymentReceived.findOne({
              where: { base_amount_id: invoice.id, created_by: companyId },
            });

            const deduction = await DeductionPaymentDone.findOne({
              where: { base_amount_id: invoice.id, created_by: companyId },
            });

            const totalDeduction =
              toNumber(deduction?.tds) +
              toNumber(deduction?.others) +
              toNumber(deduction?.salaries) +
              toNumber(deduction?.esi) +
              toNumber(deduction?.epf) +
              toNumber(deduction?.pt);

            const balance = toNumber(invoice?.grand_total) - totalDeduction;

            worksheet.addRow([
              jm.name,
              plant.name,
              contract?.po_wo_number || "",
              toNumber(invoice?.base_amount),
              toNumber(invoice?.cgst_amount),
              toNumber(invoice?.sgst_amount),
              toNumber(invoice?.igst_amount),
              toNumber(invoice?.grand_total),
              toNumber(payment?.payment_received),
              toNumber(deduction?.tds),
              toNumber(deduction?.others),
              toNumber(deduction?.salaries),
              toNumber(deduction?.esi),
              toNumber(deduction?.epf),
              toNumber(deduction?.pt),
              balance,
            ]);
            plantRowCount++;
          }
        } else {
          worksheet.addRow([
            jm.name,
            plant.name,
            contract?.po_wo_number || "",
            "", "", "", "", "", "", "", "", "", "", "", "", "", ""
          ]);
          plantRowCount = 1;
        }

        // Merge Plant Name if multiple rows
        if (plantRowCount > 1) {
          let plantEndRow = plantStartRow + plantRowCount - 1;
          worksheet.mergeCells(`B${plantStartRow}:B${plantEndRow}`);
          worksheet.getCell(`B${plantStartRow}`).value = plant.name;
          worksheet.getCell(`B${plantStartRow}`).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }

        jmRowCount += plantRowCount;
      }

      if (jmRowCount > 1) {
        let jmEndRow = jmStartRow + jmRowCount - 1;
        worksheet.mergeCells(`A${jmStartRow}:A${jmEndRow}`);
        worksheet.getCell(`A${jmStartRow}`).value = jm.name;
        worksheet.getCell(`A${jmStartRow}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
    }

    // ===============================
    // 4. Totals - Scoped by company
    // ===============================
    const baseAmountSum = await BaseAmount.findOne({
      where: { created_by: companyId },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_taxable_amount"],
      ],
      raw: true,
    });
    const totalBaseAmount = parseFloat(baseAmountSum.total_taxable_amount || 0);

    const deductions = await DeductionPaymentDone.findAll({
      where: { created_by: companyId },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("tds")), "tds"],
        [Sequelize.fn("SUM", Sequelize.col("others")), "others"],
        [Sequelize.fn("SUM", Sequelize.col("salaries")), "salaries"],
        [Sequelize.fn("SUM", Sequelize.col("esi")), "esi"],
        [Sequelize.fn("SUM", Sequelize.col("epf")), "epf"],
        [Sequelize.fn("SUM", Sequelize.col("pt")), "pt"],
      ],
      raw: true,
    });

    const d = deductions[0] || {};
    const totalLoanDeduction =
      toNumber(d.tds) +
      toNumber(d.others) +
      toNumber(d.salaries) +
      toNumber(d.esi) +
      toNumber(d.epf) +
      toNumber(d.pt);

    const overallBalance = totalBaseAmount - totalLoanDeduction;

    worksheet.addRow([]);
    let totalRow = worksheet.addRow(["Total Loans deduction"]);
    worksheet.mergeCells(`A${totalRow.number}:O${totalRow.number}`);
    worksheet.getCell(`A${totalRow.number}`).value = "Total Loans deduction";
    worksheet.getCell(`P${totalRow.number}`).value = totalLoanDeduction.toFixed(2);

    let balanceRow = worksheet.addRow(["Overall Balance"]);
    worksheet.mergeCells(`A${balanceRow.number}:O${balanceRow.number}`);
    worksheet.getCell(`A${balanceRow.number}`).value = "Overall Balance";
    worksheet.getCell(`P${balanceRow.number}`).value = overallBalance.toFixed(2);

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        row.eachCell((cell, colNumber) => {
          if (colNumber <= 16) {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        });
      }
    });

    // ===============================
    // 5. Save & Response
    // ===============================
    const fileDir = path.join(__dirname, "../public/reports");
    fs.mkdirSync(fileDir, { recursive: true });
    const filePath = path.join(fileDir, "Monthly_Report.xlsx");
    await workbook.xlsx.writeFile(filePath);

    const downloadUrl = `/reports/Monthly_Report.xlsx`;
    res.json({ success: true, downloadUrl });
  } catch (error) {
    console.error("Excel generation error:", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};
