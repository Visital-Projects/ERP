// const ExcelJS = require("exceljs");
// const fs = require("fs");
// const path = require("path");
// const BranchWallet = require("../models/branchWallet.model");
// const Branch = require("../models/branch.model");

// // Generate branch wallet report
// exports.generateBranchWalletReport = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const userType = (req.user?.type || "").toLowerCase();
//     let where = {};

//     if (userType === "super admin") {
//       // see all branches
//       where = {};
//     } else if (userType === "company") {
//       where = { created_by: companyId };
//     } else if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ["branch_id"],
//         raw: true,
//       });
//       if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });
//       where = { branch_id: emp.branch_id };
//     }

//     // Fetch all transactions including branch info
//     const wallets = await BranchWallet.findAll({
//       where,
//       include: [{ model: Branch, attributes: ["id", "name"] }],
//       order: [["branch_id", "ASC"], ["id", "ASC"]],
//     });

//     if (!wallets || wallets.length === 0) {
//       return res.status(404).json({ success: false, message: "No transactions found" });
//     }

//     // Group by branch
//     const branchMap = {};
//     wallets.forEach((w) => {
//       const branchName = w.Branch?.name || "Unknown Branch";
//       if (!branchMap[branchName]) branchMap[branchName] = [];
//       branchMap[branchName].push(w);
//     });

//     // Create Excel workbook
//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "ERP System";
//     workbook.created = new Date();

//     for (const branchName in branchMap) {
//       const sheet = workbook.addWorksheet(branchName);

//       // Columns
//       sheet.columns = [
//         { header: "ID", key: "id", width: 10 },
//         { header: "Name", key: "name", width: 25 },
//         { header: "Transaction Type", key: "transaction_type", width: 15 },
//         { header: "Amount", key: "amount", width: 15 },
//         { header: "Balance After", key: "balance_after", width: 15 },
//         { header: "Description", key: "description", width: 30 },
//         { header: "Date", key: "created_at", width: 20 },
//       ];

//       // Rows
//       branchMap[branchName].forEach((w) => {
//         sheet.addRow({
//           id: w.id,
//           name: w.name,
//           transaction_type: w.transaction_type,
//           amount: w.amount,
//           balance_after: w.balance_after,
//           description: w.description,
//           created_at: w.created_at.toISOString().replace("T", " ").substring(0, 19),
//         });
//       });

//       // Add current balance at the bottom
//       const lastBalance = branchMap[branchName][branchMap[branchName].length - 1].balance_after;
//       sheet.addRow({});
//       sheet.addRow({ name: "Current Balance", balance_after: lastBalance });
//       sheet.getRow(sheet.rowCount).font = { bold: true };
//     }

//     // Save file temporarily
//     const reportPath = path.join(__dirname, "../excel");
//     if (!fs.existsSync(reportPath)) fs.mkdirSync(reportPath, { recursive: true });

//     const filename = `BranchWalletReport_${Date.now()}.xlsx`;
//     const filepath = path.join(reportPath, filename);

//     await workbook.xlsx.writeFile(filepath);

//     // Send file download link
//     return res.json({ success: true, url: `/excel/${filename}` });
//   } catch (error) {
//     console.error("Generate Branch Wallet Report Error:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };
