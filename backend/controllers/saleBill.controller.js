// const { Op } = require("sequelize");
// const path = require("path");

// const SaleBill = require("../models/saleBill.model");
// const SaleBillService = require("../models/saleBillService.model");
// const Branch = require("../models/branch.model");
// const Employee = require("../models/employee.model");
// const User = require("../models/user.model");

// // ================= HELPER =================

// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//     raw: true,
//   });
//   if (emp?.created_by) return emp.created_by;

//   const user = await User.findOne({
//     where: { id: req.user.id },
//     attributes: ["created_by"],
//     raw: true,
//   });
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

// // ================= CREATE =================
// exports.createSaleBill = async (req, res) => {
//   try {
//     if (!req.user?.id)
//       return res.status(401).json({ success: false, message: "Unauthorized" });

//     const userId = req.user.id;

//     let {
//       invoice_number,
//       invoice_date,
//       status,
//       assigned_to,
//       services = [],
      
//       advance_amount,

//       // =========================
//       // ALL FIELDS
//       // =========================
//       irn,
//       ack_no,
//       ack_date,
     

//       consignee_name,
//       consignee_address,
//       consignee_gstin,
//       consignee_state,
//       consignee_state_code,

//       buyer_name,
//       buyer_address,
//       buyer_gstin,
//       buyer_state,
//       buyer_state_code,

//       delivery_note,
//       payment_terms,
//       reference_no,
//       other_references,
//       buyer_order_no,
//       buyer_order_date,
//       dispatch_doc_no,
//       delivery_note_date,
//       dispatched_through,
//       destination,
//       terms_of_delivery,

//       company_pan,

//       bank_name,
//       account_number,
//       ifsc_code,
//       bank_branch,

//     } = req.body;

//     // ✅ Draft logic
//     if (!invoice_number || !invoice_date) {
//       status = "pending";
//     }

//     // ✅ Employee → branch auto assign
//     const emp = await getUserBranch(req);
//     if (emp) assigned_to = emp.branch_id;

//     // ✅ Validate branch
//     if (assigned_to) {
//       const branch = await Branch.findByPk(assigned_to);
//       if (!branch)
//         return res.status(404).json({ success: false, message: "Branch not found" });
//     }

//     // ✅ File upload
//     let documentPaths = [];
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     // ✅ Parse services
//     if (typeof services === "string") {
//       try {
//         services = JSON.parse(services);
//       } catch {
//         services = [];
//       }
//     }

//     let serviceEntries = [];

//     for (const s of services) {
//       const qty = parseFloat(s.quantity) || 0;
//       const rate = parseFloat(s.rate) || 0;
//       const amount = qty * rate;

//       const taxRate = parseFloat(s.tax_rate) || 0;
//       const taxableValue = amount;

//       let taxAmount = (taxableValue * taxRate) / 100;

//       let cgst = 0, sgst = 0, igst = 0;

//       if (s.tax_type === "IGST") {
//         igst = taxAmount;
//       } else {
//         cgst = taxAmount / 2;
//         sgst = taxAmount / 2;
//       }

//       const totalAmount = amount + taxAmount;

//       serviceEntries.push({
//         service_name: s.service_name,
//         description: s.description,
//         hsn_sac: s.hsn_sac,
//         unit: s.unit,
//         quantity: qty,
//         rate,
//         amount,
//         is_taxable: s.is_taxable ?? true,
//         taxable_value: taxableValue,
//         cgst,
//         sgst,
//         igst,
//         tax_rate: taxRate,
//         tax_amount: taxAmount,
//         total_amount: totalAmount,
//         total_amount_words: s.total_amount_words || null,
//         tax_amount_words: s.tax_amount_words || null,
//       });
//     }


// // =========================
//     // ADVANCE AMOUNT
//     // =========================
//     const advanceAmount =
//       advance_amount !== undefined &&
//       advance_amount !== null &&
//       advance_amount !== ""
//         ? parseFloat(advance_amount)
//         : null;
      
      
      
//     // ✅ Create SaleBill (EXPLICIT MAPPING)
//     const saleBill = await SaleBill.create({
//       invoice_number,
//       invoice_date,
//       status: status || "pending",
//       assigned_to,
//       created_by: userId,
      
      
//       // PAYMENT
//       advance_amount: advanceAmount,

//       // =========================
//       // E-INVOICE
//       // =========================
//       irn: irn || null,
//       ack_no: ack_no || null,
//       ack_date: ack_date || null,

//       // =========================
//       // CONSIGNEE
//       // =========================
//       consignee_name: consignee_name || null,
//       consignee_address: consignee_address || null,
//       consignee_gstin: consignee_gstin || null,
//       consignee_state: consignee_state || null,
//       consignee_state_code: consignee_state_code || null,

//       // =========================
//       // BUYER
//       // =========================
//       buyer_name: buyer_name || null,
//       buyer_address: buyer_address || null,
//       buyer_gstin: buyer_gstin || null,
//       buyer_state: buyer_state || null,
//       buyer_state_code: buyer_state_code || null,

//       // =========================
//       // INVOICE DETAILS
//       // =========================
//       delivery_note: delivery_note || null,
//       payment_terms: payment_terms || null,
//       reference_no: reference_no || null,
//       other_references: other_references || null,
//       buyer_order_no: buyer_order_no || null,
//       buyer_order_date: buyer_order_date || null,
//       dispatch_doc_no: dispatch_doc_no || null,
//       delivery_note_date: delivery_note_date || null,
//       dispatched_through: dispatched_through || null,
//       destination: destination || null,
//       terms_of_delivery: terms_of_delivery || null,

//       // =========================
//       // COMPANY
//       // =========================
//       company_pan: company_pan || null,

//       // =========================
//       // BANK
//       // =========================
//       bank_name: bank_name || null,
//       account_number: account_number || null,
//       ifsc_code: ifsc_code || null,
//       bank_branch: bank_branch || null,

//       // =========================
//       // DOCUMENT
//       // =========================
//       document: documentPaths.length ? documentPaths : null,
//     });

//     // ✅ Save services
//     if (serviceEntries.length > 0) {
//       const data = serviceEntries.map((s) => ({
//         ...s,
//         sale_bill_id: saleBill.id,
//       }));
//       await SaleBillService.bulkCreate(data);
//     }

//     const created = await SaleBill.findByPk(saleBill.id, {
//       include: [
//         { model: Branch, as: "assignedBranch" },
//         { model: SaleBillService, as: "services" },
//       ],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Sale bill created successfully",
//       data: created,
//     });

//   } catch (err) {
//     console.error("createSaleBill error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ================= GET ALL =================
// exports.getAllSaleBills = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let where = {};

//     // =========================
//     // BRANCH FILTERING
//     // =========================
//     if (emp) {
//       // Employee → only their branch
//       where.assigned_to = emp.branch_id;
//     } else {
//       // Company / accountant → all company branches
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });

//       const branchIds = branches.map((b) => b.id);

//       // If no branches → return empty safely
//       if (!branchIds.length) {
//         return res.status(200).json({
//           success: true,
//           data: [],
//           message: "No sale bills found",
//         });
//       }

//       where.assigned_to = { [Op.in]: branchIds };
//     }

//     // =========================
//     // FETCH DATA
//     // =========================
//     const bills = await SaleBill.findAll({
//       where,
//       include: [
//         {
//           model: Branch,
//           as: "assignedBranch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//         {
//           model: SaleBillService,
//           as: "services",
//           attributes: [
//             "id",
//             "service_name",
//             "description",
//             "hsn_sac",
//             "unit",
//             "quantity",
//             "rate",
//             "amount",
//             "tax_rate",
//             "tax_amount",
//             "total_amount",
//           ],
//         },
//       ],
//       order: [["id", "DESC"]],
//     });

//     // =========================
//     // RESPONSE
//     // =========================
//     res.status(200).json({
//       success: true,
//       count: bills.length,
//       data: bills,
//       message: bills.length
//         ? "Sale bills fetched successfully"
//         : "No sale bills found",
//     });

//   } catch (err) {
//     console.error("getAllSaleBills failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch sale bills",
//       error: err.message,
//     });
//   }
// };

// // ================= GET BY ID =================
// exports.getSaleBillById = async (req, res) => {
//   try {
//     const bill = await SaleBill.findByPk(req.params.id, {
//       include: [
//         {
//           model: Branch,
//           as: "assignedBranch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//         {
//           model: SaleBillService,
//           as: "services",
//           attributes: [
//             "id",
//             "service_name",
//             "description",
//             "hsn_sac",
//             "unit",
//             "quantity",
//             "rate",
//             "amount",
//             "tax_rate",
//             "tax_amount",
//             "total_amount",
//           ],
//         },
//       ],
//     });

//     if (!bill) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale bill not found",
//       });
//     }

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // =========================
//     // PERMISSION CHECK
//     // =========================
//     if (emp && bill.assigned_to !== emp.branch_id) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     if (!emp) {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });

//       const allowedBranchIds = branches.map((b) => b.id);

//       if (!allowedBranchIds.includes(bill.assigned_to)) {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied",
//         });
//       }
//     }

//     // =========================
//     // RESPONSE
//     // =========================
//     res.status(200).json({
//       success: true,
//       data: bill,
//       message: "Sale bill fetched successfully",
//     });

//   } catch (err) {
//     console.error("getSaleBillById failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch sale bill",
//       error: err.message,
//     });
//   }
// };


// exports.updateSaleBill = async (req, res) => {
//   try {
//     const bill = await SaleBill.findByPk(req.params.id);

//     if (!bill)
//       return res.status(404).json({ success: false, message: "Sale bill not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // =========================
//     // PERMISSION CHECK
//     // =========================
//     if (emp && bill.assigned_to !== emp.branch_id) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     if (!emp) {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });

//       const allowedBranchIds = branches.map((b) => b.id);

//       if (!allowedBranchIds.includes(bill.assigned_to)) {
//         return res.status(403).json({ success: false, message: "Access denied" });
//       }
//     }

//     // =========================
//     // FILE UPLOAD
//     // =========================
//     let documentPaths = null;
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     // =========================
//     // PARSE SERVICES
//     // =========================
//     let { services = [] } = req.body;

//     if (typeof services === "string") {
//       try {
//         services = JSON.parse(services);
//       } catch {
//         services = [];
//       }
//     }

//     let serviceEntries = [];

//     for (const s of services) {
//       const qty = parseFloat(s.quantity) || 0;
//       const rate = parseFloat(s.rate) || 0;
//       const amount = qty * rate;

//       const taxRate = parseFloat(s.tax_rate) || 0;
//       const taxableValue = amount;

//       const taxAmount = (taxableValue * taxRate) / 100;

//       let cgst = 0,
//         sgst = 0,
//         igst = 0;

//       if (s.tax_type === "IGST") {
//         igst = taxAmount;
//       } else {
//         cgst = taxAmount / 2;
//         sgst = taxAmount / 2;
//       }

//       const totalAmount = amount + taxAmount;

//       serviceEntries.push({
//         service_name: s.service_name,
//         description: s.description,
//         hsn_sac: s.hsn_sac,
//         unit: s.unit,
//         quantity: qty,
//         rate,
//         amount,
//         is_taxable: s.is_taxable ?? true,
//         taxable_value: taxableValue,
//         cgst,
//         sgst,
//         igst,
//         tax_rate: taxRate,
//         tax_amount: taxAmount,
//         total_amount: totalAmount,
//         total_amount_words: s.total_amount_words || null,
//         tax_amount_words: s.tax_amount_words || null,
//       });
//     }



// // =========================
//     // CALCULATE TOTALS
//     // =========================
//     let totalBillAmount = 0;

//     if (serviceEntries.length > 0) {
//       totalBillAmount = serviceEntries.reduce(
//         (sum, item) => sum + (parseFloat(item.total_amount) || 0),
//         0
//       );
//     } else {
//       totalBillAmount =
//         (await SaleBillService.sum("total_amount", {
//           where: { sale_bill_id: bill.id },
//         })) || 0;
//     }

//     // =========================
//     // ADVANCE AMOUNT
//     // =========================
//     const advanceAmount =
//       req.body.advance_amount !== undefined &&
//       req.body.advance_amount !== null &&
//       req.body.advance_amount !== ""
//         ? parseFloat(req.body.advance_amount)
//         : bill.advance_amount;

//     // =========================
//     // FIXED FIELD UPDATE
//     // =========================
//     await bill.update({
//       invoice_number: req.body.invoice_number !== undefined ? req.body.invoice_number : bill.invoice_number,
//       invoice_date: req.body.invoice_date !== undefined ? req.body.invoice_date : bill.invoice_date,
//       status: req.body.status !== undefined ? req.body.status : bill.status,
      
//       // PAYMENT
//       advance_amount: advanceAmount,

//       irn: req.body.irn !== undefined ? req.body.irn : bill.irn,
//       ack_no: req.body.ack_no !== undefined ? req.body.ack_no : bill.ack_no,
//       ack_date: req.body.ack_date !== undefined ? req.body.ack_date : bill.ack_date,

//       consignee_name: req.body.consignee_name !== undefined ? req.body.consignee_name : bill.consignee_name,
//       consignee_address: req.body.consignee_address !== undefined ? req.body.consignee_address : bill.consignee_address,
//       consignee_gstin: req.body.consignee_gstin !== undefined ? req.body.consignee_gstin : bill.consignee_gstin,
//       consignee_state: req.body.consignee_state !== undefined ? req.body.consignee_state : bill.consignee_state,
//       consignee_state_code: req.body.consignee_state_code !== undefined ? req.body.consignee_state_code : bill.consignee_state_code,

//       buyer_name: req.body.buyer_name !== undefined ? req.body.buyer_name : bill.buyer_name,
//       buyer_address: req.body.buyer_address !== undefined ? req.body.buyer_address : bill.buyer_address,
//       buyer_gstin: req.body.buyer_gstin !== undefined ? req.body.buyer_gstin : bill.buyer_gstin,
//       buyer_state: req.body.buyer_state !== undefined ? req.body.buyer_state : bill.buyer_state,
//       buyer_state_code: req.body.buyer_state_code !== undefined ? req.body.buyer_state_code : bill.buyer_state_code,

//       delivery_note: req.body.delivery_note !== undefined ? req.body.delivery_note : bill.delivery_note,
//       payment_terms: req.body.payment_terms !== undefined ? req.body.payment_terms : bill.payment_terms,
//       reference_no: req.body.reference_no !== undefined ? req.body.reference_no : bill.reference_no,
//       other_references: req.body.other_references !== undefined ? req.body.other_references : bill.other_references,
//       buyer_order_no: req.body.buyer_order_no !== undefined ? req.body.buyer_order_no : bill.buyer_order_no,
//       buyer_order_date: req.body.buyer_order_date !== undefined ? req.body.buyer_order_date : bill.buyer_order_date,
//       dispatch_doc_no: req.body.dispatch_doc_no !== undefined ? req.body.dispatch_doc_no : bill.dispatch_doc_no,
//       delivery_note_date: req.body.delivery_note_date !== undefined ? req.body.delivery_note_date : bill.delivery_note_date,
//       dispatched_through: req.body.dispatched_through !== undefined ? req.body.dispatched_through : bill.dispatched_through,
//       destination: req.body.destination !== undefined ? req.body.destination : bill.destination,
//       terms_of_delivery: req.body.terms_of_delivery !== undefined ? req.body.terms_of_delivery : bill.terms_of_delivery,

//       company_pan: req.body.company_pan !== undefined ? req.body.company_pan : bill.company_pan,

//       bank_name: req.body.bank_name !== undefined ? req.body.bank_name : bill.bank_name,
//       account_number: req.body.account_number !== undefined ? req.body.account_number : bill.account_number,
//       ifsc_code: req.body.ifsc_code !== undefined ? req.body.ifsc_code : bill.ifsc_code,
//       bank_branch: req.body.bank_branch !== undefined ? req.body.bank_branch : bill.bank_branch,

//       document: documentPaths !== null ? documentPaths : bill.document,
//     });

//     // =========================
//     // REPLACE SERVICES
//     // =========================
//     if (services.length > 0) {
//       await SaleBillService.destroy({ where: { sale_bill_id: bill.id } });

//       const data = serviceEntries.map((s) => ({
//         ...s,
//         sale_bill_id: bill.id,
//       }));

//       await SaleBillService.bulkCreate(data);
//     }

//     // =========================
//     // FETCH UPDATED
//     // =========================
//     const updated = await SaleBill.findByPk(bill.id, {
//       include: [
//         {
//           model: Branch,
//           as: "assignedBranch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//         {
//           model: SaleBillService,
//           as: "services",
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       message: "Sale bill updated successfully",
//       data: updated,
//     });

//   } catch (err) {
//     console.error("updateSaleBill failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update sale bill",
//       error: err.message,
//     });
//   }
// };


// exports.deleteSaleBill = async (req, res) => {
//   try {
//     const bill = await SaleBill.findByPk(req.params.id);

//     if (!bill) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale bill not found",
//       });
//     }

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // =========================
//     // PERMISSION CHECK
//     // =========================
//     if (emp && bill.assigned_to !== emp.branch_id) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     if (!emp) {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });

//       const allowedBranchIds = branches.map((b) => b.id);

//       if (!allowedBranchIds.includes(bill.assigned_to)) {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied",
//         });
//       }
//     }

//     // =========================
//     // RESET PAYMENT VALUES
//     // before delete (important for history consistency)
//     // =========================
//     await bill.update({
//       received_amount: null,
//       advance_amount: null,
//       difference_amount: 0,
//       status: "pending",
//     });

//     // =========================
//     // SOFT DELETE
//     // =========================
//     await bill.destroy(); // paranoid delete

//     return res.status(200).json({
//       success: true,
//       message: "Sale bill deleted successfully",
//     });

//   } catch (err) {
//     console.error("deleteSaleBill failed:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete sale bill",
//       error: err.message,
//     });
//   }
// };




const { Op } = require("sequelize");
const path = require("path");

const SaleBill = require("../models/saleBill.model");
const SaleBillService = require("../models/saleBillService.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

const ProformaBill = require("../models/proformaBill.model");
const SaleBillPayment = require("../models/saleBillPayment.model");

// ================= HELPER =================

async function getCompanyId(req) {
  if (!req.user) return null;

  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });

  if (emp?.created_by) return emp.created_by;

  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });

  if (user?.created_by) return user.created_by;

  return req.user.id;
}

async function getUserBranch(req) {
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["branch_id"],
    raw: true,
  });

  return emp;
}

// ================= APPLY PROFORMA CREDIT =================

async function applyProformaCredit(saleBill) {
  // 1. DUPLICATE PROTECTION
  const existingAdjustment = await SaleBillPayment.findOne({
    where: { sale_bill_id: saleBill.id, source_type: "proforma" },
  });
  if (existingAdjustment) return 0;

  // 2. FETCH TOTAL AMOUNT FROM DATABASE (Fixes the 'reduce' error)
  const servicesData = await SaleBillService.findAll({
    where: { sale_bill_id: saleBill.id },
    attributes: ["total_amount"],
    raw: true,
  });
  
  let saleTotal = (servicesData || []).reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0);

  // 3. FETCH PROFORMAS - Match by Site AND Name
  const proformas = await ProformaBill.findAll({
    where: {
      assigned_to: saleBill.assigned_to,
      [Op.or]: [
        { buyer_name: saleBill.buyer_name },
        { consignee_name: saleBill.consignee_name },
        { buyer_name: saleBill.consignee_name }
      ],
      // Find proformas that have received money
      status: { [Op.in]: ["settled", "partial"] } 
    },
    order: [["id", "ASC"]],
  });

  let remainingSaleAmount = saleTotal;
  let totalAdjusted = 0;

  for (const p of proformas) {
    if (remainingSaleAmount <= 0) break;

    // Calculate how much was received on this Proforma
    const totalReceivedOnProforma = parseFloat(p.total_amount) - parseFloat(p.outstanding_amount);
    
    // Check if any of that money was already used by other Sale Bills
    const alreadyUsed = await SaleBillPayment.sum('amount_received', {
      where: { source_type: 'proforma', source_id: p.id }
    }) || 0;

    const availableCredit = totalReceivedOnProforma - alreadyUsed;

    if (availableCredit <= 0) continue;

    const used = Math.min(availableCredit, remainingSaleAmount);

    // ✅ Move the money to the Sale Bill
    await SaleBillPayment.create({
      sale_bill_id: saleBill.id,
      payment_date: new Date(),
      amount_received: used,
      tds: 0,
      deductions: 0,
      payment_mode: "adjustment",
      source_type: "proforma",
      source_id: p.id,
      notes: `Adjusted from Proforma #${p.invoice_number || p.id}`,
    });

    remainingSaleAmount -= used;
    totalAdjusted += used;
  }
  return totalAdjusted;
}



// ================= CREATE SALE BILL =================

exports.createSaleBill = async (req, res) => {
  try {
    if (!req.user?.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const userId = req.user.id;

    let {
      invoice_number,
      invoice_date,
      status,
      assigned_to,
      services = [],
      advance_amount,

      irn,
      ack_no,
      ack_date,

      consignee_name,
      consignee_address,
      consignee_gstin,
      consignee_state,
      consignee_state_code,

      buyer_name,
      buyer_address,
      buyer_gstin,
      buyer_state,
      buyer_state_code,

      delivery_note,
      payment_terms,
      reference_no,
      other_references,
      buyer_order_no,
      buyer_order_date,
      dispatch_doc_no,
      delivery_note_date,
      dispatched_through,
      destination,
      terms_of_delivery,

      company_pan,

      bank_name,
      account_number,
      ifsc_code,
      bank_branch,

    } = req.body;

    // ================= DRAFT LOGIC =================
    if (!invoice_number || !invoice_date) {
      status = "pending";
    }

    // ================= BRANCH =================
    const emp = await getUserBranch(req);
    if (emp) assigned_to = emp.branch_id;

    if (assigned_to) {
      const branch = await Branch.findByPk(assigned_to);
      if (!branch)
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
    }

    // ================= FILES =================
    let documentPaths = [];
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }

    // ================= SERVICES PARSE =================
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        services = [];
      }
    }

    let serviceEntries = [];

    for (const s of services) {
      const qty = parseFloat(s.quantity) || 0;
      const rate = parseFloat(s.rate) || 0;
      const amount = qty * rate;

      const taxRate = parseFloat(s.tax_rate) || 0;
      const taxableValue = amount;

      let taxAmount = (taxableValue * taxRate) / 100;

      let cgst = 0, sgst = 0, igst = 0;

      if (s.tax_type === "IGST") {
        igst = taxAmount;
      } else {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      }

      const totalAmount = amount + taxAmount;

      serviceEntries.push({
        service_name: s.service_name,
        description: s.description,
        hsn_sac: s.hsn_sac,
        unit: s.unit,
        quantity: qty,
        rate,
        amount,
        is_taxable: s.is_taxable ?? true,
        taxable_value: taxableValue,
        cgst,
        sgst,
        igst,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        total_amount_words: s.total_amount_words || null,
        tax_amount_words: s.tax_amount_words || null,
      });
    }

    // ================= ADVANCE =================
    const advanceAmount =
      advance_amount !== undefined &&
      advance_amount !== null &&
      advance_amount !== ""
        ? parseFloat(advance_amount)
        : null;

    // ================= CREATE BILL =================
    const saleBill = await SaleBill.create({
      invoice_number,
      invoice_date,
      status: status || "pending",
      assigned_to,
      created_by: userId,
      advance_amount: advanceAmount,

      irn: irn || null,
      ack_no: ack_no || null,
      ack_date: ack_date || null,

      consignee_name: consignee_name || null,
      consignee_address: consignee_address || null,
      consignee_gstin: consignee_gstin || null,
      consignee_state: consignee_state || null,
      consignee_state_code: consignee_state_code || null,

      buyer_name: buyer_name || null,
      buyer_address: buyer_address || null,
      buyer_gstin: buyer_gstin || null,
      buyer_state: buyer_state || null,
      buyer_state_code: buyer_state_code || null,

      delivery_note: delivery_note || null,
      payment_terms: payment_terms || null,
      reference_no: reference_no || null,
      other_references: other_references || null,
      buyer_order_no: buyer_order_no || null,
      buyer_order_date: buyer_order_date || null,
      dispatch_doc_no: dispatch_doc_no || null,
      delivery_note_date: delivery_note_date || null,
      dispatched_through: dispatched_through || null,
      destination: destination || null,
      terms_of_delivery: terms_of_delivery || null,

      company_pan: company_pan || null,

      bank_name: bank_name || null,
      account_number: account_number || null,
      ifsc_code: ifsc_code || null,
      bank_branch: bank_branch || null,

      document: documentPaths.length ? documentPaths : null,
    });

    // ================= SAVE SERVICES =================
    if (serviceEntries.length > 0) {
      const data = serviceEntries.map((s) => ({
        ...s,
        sale_bill_id: saleBill.id,
      }));
      await SaleBillService.bulkCreate(data);
    }

    // ================= APPLY PROFORMA =================
    await applyProformaCredit(saleBill);

    // ================= FETCH RESULT =================
    const created = await SaleBill.findByPk(saleBill.id, {
      include: [
        { model: Branch, as: "assignedBranch" },
        { model: SaleBillService, as: "services" },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Sale bill created successfully",
      data: created,
    });

  } catch (err) {
    console.error("createSaleBill error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllSaleBills = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};

    // =========================
    // BRANCH FILTER
    // =========================
    if (emp) {
      where.assigned_to = emp.branch_id;
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });

      const branchIds = branches.map((b) => b.id);

      if (!branchIds.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No sale bills found",
        });
      }

      where.assigned_to = { [Op.in]: branchIds };
    }

    // =========================
    // FETCH DATA
    // =========================
    const bills = await SaleBill.findAll({
      where,
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: SaleBillService,
          as: "services",
          attributes: [
            "id",
            "service_name",
            "description",
            "hsn_sac",
            "unit",
            "quantity",
            "rate",
            "amount",
            "tax_rate",
            "tax_amount",
            "total_amount",
          ],
        },
        {
          model: SaleBillPayment,
          as: "payments",
          attributes: [
            "id",
            "payment_date",
            "amount_received",
            "payment_mode",
            "source_type",
            "source_id",
            "notes",
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
      message: bills.length
        ? "Sale bills fetched successfully"
        : "No sale bills found",
    });

  } catch (err) {
    console.error("getAllSaleBills failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale bills",
      error: err.message,
    });
  }
};

exports.getSaleBillById = async (req, res) => {
  try {
    const bill = await SaleBill.findByPk(req.params.id, {
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: SaleBillService,
          as: "services",
          attributes: [
            "id",
            "service_name",
            "description",
            "hsn_sac",
            "unit",
            "quantity",
            "rate",
            "amount",
            "tax_rate",
            "tax_amount",
            "total_amount",
          ],
        },
        {
          model: SaleBillPayment,
          as: "payments",
          attributes: [
            "id",
            "payment_date",
            "amount_received",
            "payment_mode",
            "source_type",
            "source_id",
            "notes",
          ],
          order: [["id", "DESC"]],
        },
      ],
    });

    // =========================
    // NOT FOUND
    // =========================
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Sale bill not found",
      });
    }

    // =========================
    // ACCESS CONTROL
    // =========================
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    if (emp && bill.assigned_to !== emp.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });

      const allowedBranchIds = branches.map((b) => b.id);

      if (!allowedBranchIds.includes(bill.assigned_to)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      data: bill,
      message: "Sale bill fetched successfully",
    });

  } catch (err) {
    console.error("getSaleBillById failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale bill",
      error: err.message,
    });
  }
};

exports.updateSaleBill = async (req, res) => {
  try {
    const bill = await SaleBill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Sale bill not found",
      });
    }

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // =========================
    // PERMISSION CHECK
    // =========================
    if (emp && bill.assigned_to !== emp.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });

      const allowedBranchIds = branches.map((b) => b.id);

      if (!allowedBranchIds.includes(bill.assigned_to)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // =========================
    // FILE UPLOAD
    // =========================
    let documentPaths = null;

    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path
          .join("uploads", uploadFolder, file.filename)
          .replace(/\\/g, "/");
      });
    }

    // =========================
    // PARSE SERVICES
    // =========================
    let { services = [] } = req.body;

    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        services = [];
      }
    }

    let serviceEntries = [];

    for (const s of services) {
      const qty = parseFloat(s.quantity) || 0;
      const rate = parseFloat(s.rate) || 0;
      const amount = qty * rate;

      const taxRate = parseFloat(s.tax_rate) || 0;
      const taxableValue = amount;

      const taxAmount = (taxableValue * taxRate) / 100;

      let cgst = 0,
        sgst = 0,
        igst = 0;

      if (s.tax_type === "IGST") {
        igst = taxAmount;
      } else {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      }

      const totalAmount = amount + taxAmount;

      serviceEntries.push({
        service_name: s.service_name,
        description: s.description,
        hsn_sac: s.hsn_sac,
        unit: s.unit,
        quantity: qty,
        rate,
        amount,
        is_taxable: s.is_taxable ?? true,
        taxable_value: taxableValue,
        cgst,
        sgst,
        igst,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        total_amount_words: s.total_amount_words || null,
        tax_amount_words: s.tax_amount_words || null,
      });
    }

    // =========================
    // 🔥 ROLLBACK OLD PROFORMA ADJUSTMENTS
    // =========================
    const oldAdjustments = await SaleBillPayment.findAll({
      where: {
        sale_bill_id: bill.id,
        source_type: "proforma",
      },
    });

    for (const adj of oldAdjustments) {
      if (!adj.source_id) continue;

      const proforma = await ProformaBill.findByPk(adj.source_id);
      if (!proforma) continue;

      const currentOutstanding =
        parseFloat(proforma.outstanding_amount) || 0;

      await proforma.update({
        outstanding_amount: currentOutstanding + adj.amount_received,
        status: "partial",
      });
    }

    // =========================
    // DELETE OLD ADJUSTMENTS
    // =========================
    await SaleBillPayment.destroy({
      where: {
        sale_bill_id: bill.id,
        source_type: "proforma",
      },
    });

    // =========================
    // ADVANCE AMOUNT
    // =========================
    const advanceAmount =
      req.body.advance_amount !== undefined &&
      req.body.advance_amount !== null &&
      req.body.advance_amount !== ""
        ? parseFloat(req.body.advance_amount)
        : bill.advance_amount;

    // =========================
    // UPDATE BILL
    // =========================
    await bill.update({
      invoice_number:
        req.body.invoice_number !== undefined
          ? req.body.invoice_number
          : bill.invoice_number,

      invoice_date:
        req.body.invoice_date !== undefined
          ? req.body.invoice_date
          : bill.invoice_date,

      status:
        req.body.status !== undefined
          ? req.body.status
          : bill.status,
          
      assigned_to:
        req.body.assigned_to !== undefined
         ? req.body.assigned_to
         : bill.assigned_to,

      advance_amount: advanceAmount,

      irn:
        req.body.irn !== undefined ? req.body.irn : bill.irn,
      ack_no:
        req.body.ack_no !== undefined ? req.body.ack_no : bill.ack_no,
      ack_date:
        req.body.ack_date !== undefined
          ? req.body.ack_date
          : bill.ack_date,

      consignee_name:
        req.body.consignee_name !== undefined
          ? req.body.consignee_name
          : bill.consignee_name,

      consignee_address:
        req.body.consignee_address !== undefined
          ? req.body.consignee_address
          : bill.consignee_address,

      consignee_gstin:
        req.body.consignee_gstin !== undefined
          ? req.body.consignee_gstin
          : bill.consignee_gstin,

      consignee_state:
        req.body.consignee_state !== undefined
          ? req.body.consignee_state
          : bill.consignee_state,

      consignee_state_code:
        req.body.consignee_state_code !== undefined
          ? req.body.consignee_state_code
          : bill.consignee_state_code,

      buyer_name:
        req.body.buyer_name !== undefined
          ? req.body.buyer_name
          : bill.buyer_name,

      buyer_address:
        req.body.buyer_address !== undefined
          ? req.body.buyer_address
          : bill.buyer_address,

      buyer_gstin:
        req.body.buyer_gstin !== undefined
          ? req.body.buyer_gstin
          : bill.buyer_gstin,

      buyer_state:
        req.body.buyer_state !== undefined
          ? req.body.buyer_state
          : bill.buyer_state,

      buyer_state_code:
        req.body.buyer_state_code !== undefined
          ? req.body.buyer_state_code
          : bill.buyer_state_code,

      delivery_note:
        req.body.delivery_note !== undefined
          ? req.body.delivery_note
          : bill.delivery_note,

      payment_terms:
        req.body.payment_terms !== undefined
          ? req.body.payment_terms
          : bill.payment_terms,

      reference_no:
        req.body.reference_no !== undefined
          ? req.body.reference_no
          : bill.reference_no,

      other_references:
        req.body.other_references !== undefined
          ? req.body.other_references
          : bill.other_references,

      buyer_order_no:
        req.body.buyer_order_no !== undefined
          ? req.body.buyer_order_no
          : bill.buyer_order_no,

      buyer_order_date:
        req.body.buyer_order_date !== undefined
          ? req.body.buyer_order_date
          : bill.buyer_order_date,

      dispatch_doc_no:
        req.body.dispatch_doc_no !== undefined
          ? req.body.dispatch_doc_no
          : bill.dispatch_doc_no,

      delivery_note_date:
        req.body.delivery_note_date !== undefined
          ? req.body.delivery_note_date
          : bill.delivery_note_date,

      dispatched_through:
        req.body.dispatched_through !== undefined
          ? req.body.dispatched_through
          : bill.dispatched_through,

      destination:
        req.body.destination !== undefined
          ? req.body.destination
          : bill.destination,

      terms_of_delivery:
        req.body.terms_of_delivery !== undefined
          ? req.body.terms_of_delivery
          : bill.terms_of_delivery,

      company_pan:
        req.body.company_pan !== undefined
          ? req.body.company_pan
          : bill.company_pan,

      bank_name:
        req.body.bank_name !== undefined
          ? req.body.bank_name
          : bill.bank_name,

      account_number:
        req.body.account_number !== undefined
          ? req.body.account_number
          : bill.account_number,

      ifsc_code:
        req.body.ifsc_code !== undefined
          ? req.body.ifsc_code
          : bill.ifsc_code,

      bank_branch:
        req.body.bank_branch !== undefined
          ? req.body.bank_branch
          : bill.bank_branch,

      document:
        documentPaths !== null ? documentPaths : bill.document,
    });

    // =========================
    // REPLACE SERVICES
    // =========================
    if (services.length > 0) {
      await SaleBillService.destroy({
        where: { sale_bill_id: bill.id },
      });

      const data = serviceEntries.map((s) => ({
        ...s,
        sale_bill_id: bill.id,
      }));

      await SaleBillService.bulkCreate(data);
    }

    // =========================
    // 🔥 RE-APPLY PROFORMA CREDIT
    // =========================
    await applyProformaCredit(bill);

    // =========================
    // FETCH UPDATED
    // =========================
    const updated = await SaleBill.findByPk(bill.id, {
      include: [
        { model: Branch, as: "assignedBranch" },
        { model: SaleBillService, as: "services" },
        { model: SaleBillPayment, as: "payments" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Sale bill updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("updateSaleBill failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update sale bill",
      error: err.message,
    });
  }
};

exports.deleteSaleBill = async (req, res) => {
  try {
    const bill = await SaleBill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Sale bill not found",
      });
    }

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // =========================
    // PERMISSION CHECK
    // =========================
    if (emp && bill.assigned_to !== emp.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });

      const allowedBranchIds = branches.map((b) => b.id);

      if (!allowedBranchIds.includes(bill.assigned_to)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // =========================
    // 🔥 FETCH PROFORMA ADJUSTMENTS
    // =========================
    const adjustments = await SaleBillPayment.findAll({
      where: {
        sale_bill_id: bill.id,
        source_type: "proforma",
      },
    });

    // =========================
    // 🔥 RESTORE PROFORMA CREDIT
    // =========================
    for (const adj of adjustments) {
      if (!adj.source_id) continue;

      const proforma = await ProformaBill.findByPk(adj.source_id);
      if (!proforma) continue;

      const currentOutstanding =
        parseFloat(proforma.outstanding_amount) || 0;

      const restoredAmount =
        currentOutstanding + (parseFloat(adj.amount_received) || 0);

      await proforma.update({
        outstanding_amount: restoredAmount,

        // status fix
        status:
          restoredAmount > 0
            ? "partial"
            : "settled",
      });
    }

    // =========================
    // 🔥 DELETE ADJUSTMENT PAYMENTS
    // =========================
    await SaleBillPayment.destroy({
      where: {
        sale_bill_id: bill.id,
        source_type: "proforma",
      },
    });

    // =========================
    // OPTIONAL: RESET BILL FIELDS
    // =========================
    await bill.update({
      advance_amount: null,
      status: "pending",
    });

    // =========================
    // SOFT DELETE BILL
    // =========================
    await bill.destroy(); // paranoid delete

    return res.status(200).json({
      success: true,
      message: "Sale bill deleted and proforma credit restored successfully",
    });

  } catch (err) {
    console.error("deleteSaleBill failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete sale bill",
      error: err.message,
    });
  }
};