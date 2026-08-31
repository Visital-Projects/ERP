// const { Op } = require('sequelize');
// const JournalEntry = require('../models/journalEntry.model');
// const JournalItem = require('../models/journalItem.model');
// const BankAccount = require('../models/bank_account.model');
// const ChartOfAccount = require('../models/chart_of_account.model');
// const ChartOfAccountType = require('../models/chart_of_account_type.model');
// const ChartOfAccountSubType = require('../models/chart_of_account_sub_type.model');
// // const AddTransactionLine = require("../models/addTransactionLine.model");
// //const Utility = require('../utils/utility');

// // ==========================
// // HELPER: Generate Journal Number
// // ==========================
// async function generateJournalNumber(userId) {
//   const latest = await JournalEntry.findOne({
//     where: { created_by: userId },
//     order: [["journal_id", "DESC"]],
//   });
//   return latest ? latest.journal_id + 1 : 1;
// }

// // ==========================
// // GET ALL JOURNAL ENTRIES
// // ==========================
// exports.getAllJournalEntries = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("manage journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const journalEntries = await JournalEntry.findAll({
//       where: { created_by: req.user.id },
//       order: [["id", "DESC"]],
//       include: ["accounts"],
//     });

//     res.json(journalEntries);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // GET SINGLE JOURNAL ENTRY
// // ==========================
// exports.getJournalEntryById = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("show journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const jEntry = await JournalEntry.findByPk(req.params.id, { include: ["accounts"] });
//     if (!jEntry || jEntry.created_by !== req.user.creatorId) {
//       return res.status(404).json({ error: "Journal entry not found." });
//     }

//     res.json({ journalEntry: jEntry, accounts: jEntry.accounts });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // GET DATA FOR CREATE JOURNAL ENTRY
// // ==========================
// exports.getCreateData = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("create journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const accountTypes = await ChartOfAccountType.findAll({ where: { created_by: req.user.creatorId } });
//     const chartAccounts = {};

//     for (const type of accountTypes) {
//       const subTypes = await ChartOfAccountSubType.findAll({
//         where: { type: type.id, created_by: req.user.creatorId, name: { [Op.notIn]: ["Accounts Receivable", "Accounts Payable"] } },
//       });

//       const temp = {};
//       for (const subType of subTypes) {
//         const chartOfAccounts = await ChartOfAccount.findAll({ where: { sub_type: subType.id, parent: 0, created_by: req.user.creatorId } });
//         const subAccounts = await ChartOfAccount.findAll({ where: { sub_type: subType.id, parent: { [Op.ne]: 0 }, created_by: req.user.creatorId } });

//         temp[subType.id] = {
//           account_name: subType.name,
//           chart_of_accounts: chartOfAccounts.map(acc => ({ id: acc.id, account_number: acc.account_number, account_name: acc.name })),
//           subAccounts: subAccounts.map(acc => ({
//             id: acc.id,
//             account_number: acc.account_number,
//             account_name: acc.name,
//             parent: acc.parent,
//             parent_account: acc.parentAccount ? acc.parentAccount.account : 0,
//           })),
//         };
//       }

//       chartAccounts[type.name] = temp;
//     }

//     const journalId = await generateJournalNumber(req.user.creatorId);
//     res.json({ chartAccounts, journalId });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // CREATE JOURNAL ENTRY
// // ==========================
// exports.createJournalEntry = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("create journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const { date, reference, description, accounts } = req.body;
//     if (!date || !accounts || accounts.length === 0) {
//       return res.status(400).json({ error: "Date and accounts required." });
//     }

//     const totalDebit = accounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
//     const totalCredit = accounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);
//     if (totalDebit !== totalCredit) {
//       return res.status(400).json({ error: "Debit and Credit must be equal." });
//     }

//     const journal = await JournalEntry.create({
//       journal_id: await generateJournalNumber(req.user.id),
//       date,
//       reference,
//       description,
//       created_by: req.user.id,
//     });

//     for (const acc of accounts) {
//       const journalItem = await JournalItem.create({
//         journal: journal.id,
//         account: acc.account,
//         description: acc.description,
//         debit: acc.debit || 0,
//         credit: acc.credit || 0,
//       });

//       const bankAccounts = await BankAccount.findAll({ where: { chart_account_id: acc.account } });
//       for (const bank of bankAccounts) {
//         let new_balance = bank.opening_balance;
//         if (journalItem.debit) new_balance -= journalItem.debit;
//         if (journalItem.credit) new_balance += journalItem.credit;
//         await bank.update({ opening_balance: new_balance });
//       }

//       const refDetails = { reference: "Journal Entry", reference_id: journal.id, reference_sub_id: journalItem.id, date: journal.date };
//       if (acc.debit) {
//         await Utility.addTransactionLines({ account_id: acc.account, transaction_type: "debit", transaction_amount: acc.debit, ...refDetails });
//         const payable = await ChartOfAccount.findOne({ where: { name: "Accounts Payable", created_by: req.user.id } });
//         if (payable) await Utility.addTransactionLines({ account_id: payable.id, transaction_type: "credit", transaction_amount: acc.debit, ...refDetails });
//       } else {
//         await Utility.addTransactionLines({ account_id: acc.account, transaction_type: "credit", transaction_amount: acc.credit, ...refDetails });
//         const receivable = await ChartOfAccount.findOne({ where: { name: "Accounts Receivable", created_by: req.user.id } });
//         if (receivable) await Utility.addTransactionLines({ account_id: receivable.id, transaction_type: "debit", transaction_amount: acc.credit, ...refDetails });
//       }
//     }

//     res.json({ success: true, message: "Journal entry successfully created." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // UPDATE JOURNAL ENTRY
// // ==========================
// exports.updateJournalEntryById = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("edit journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const journalEntry = await JournalEntry.findByPk(req.params.id);
//     if (!journalEntry || journalEntry.created_by !== req.user.creatorId) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const { date, reference, description, accounts } = req.body;
//     const totalDebit = accounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
//     const totalCredit = accounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);
//     if (totalDebit !== totalCredit) return res.status(400).json({ error: "Debit and Credit must be equal." });

//     await journalEntry.update({ date, reference, description });

//     // Delete old transaction lines
//     await AddTransactionLine.destroy({ where: { reference: "Journal Entry", reference_id: journalEntry.id } });
//     await JournalItem.destroy({ where: { journal: journalEntry.id } });

//     // Recreate journal items and transaction lines
//     for (const acc of accounts) {
//       const journalItem = await JournalItem.create({
//         journal: journalEntry.id,
//         account: acc.account,
//         description: acc.description,
//         debit: acc.debit || 0,
//         credit: acc.credit || 0,
//       });

//       const bankAccounts = await BankAccount.findAll({ where: { chart_account_id: acc.account } });
//       for (const bank of bankAccounts) {
//         let new_balance = bank.opening_balance;
//         if (journalItem.debit) new_balance -= journalItem.debit;
//         if (journalItem.credit) new_balance += journalItem.credit;
//         await bank.update({ opening_balance: new_balance });
//       }

//       const refDetails = { reference: "Journal Entry", reference_id: journalEntry.id, reference_sub_id: journalItem.id, date: journalEntry.date };
//       if (acc.debit) {
//         await Utility.addTransactionLines({ account_id: acc.account, transaction_type: "debit", transaction_amount: acc.debit, ...refDetails });
//         const payable = await ChartOfAccount.findOne({ where: { name: "Accounts Payable", created_by: req.user.creatorId } });
//         if (payable) await Utility.addTransactionLines({ account_id: payable.id, transaction_type: "credit", transaction_amount: acc.debit, ...refDetails });
//       } else {
//         await Utility.addTransactionLines({ account_id: acc.account, transaction_type: "credit", transaction_amount: acc.credit, ...refDetails });
//         const receivable = await ChartOfAccount.findOne({ where: { name: "Accounts Receivable", created_by: req.user.creatorId } });
//         if (receivable) await Utility.addTransactionLines({ account_id: receivable.id, transaction_type: "debit", transaction_amount: acc.credit, ...refDetails });
//       }
//     }

//     res.json({ success: true, message: "Journal entry successfully updated." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // DELETE JOURNAL ENTRY
// // ==========================
// exports.deleteJournalEntryById = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("delete journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const journalEntry = await JournalEntry.findByPk(req.params.id);
//     if (!journalEntry || journalEntry.created_by !== req.user.creatorId) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     await JournalItem.destroy({ where: { journal: journalEntry.id } });
//     await AddTransactionLine.destroy({ where: { reference: "Journal Entry", reference_id: journalEntry.id } });
//     await journalEntry.destroy();

//     res.json({ success: true, message: "Journal entry successfully deleted." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ==========================
// // DELETE SINGLE JOURNAL ITEM
// // ==========================
// exports.deleteJournalItemById = async (req, res) => {
//   try {
//     if (!req.user.permissions.includes("delete journal entry")) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     const journalItem = await JournalItem.findByPk(req.params.item_id);
//     if (!journalItem) return res.status(404).json({ error: "Journal item not found." });

//     await journalItem.destroy();
//     res.json({ success: true, message: "Journal item successfully deleted." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
