const { Op } = require("sequelize");
const path = require("path");

const ProformaBill = require("../models/proformaBill.model");
const ProformaBillService = require("../models/proformaBillService.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const ProformaBillPayment = require("../models/proformaBillPayment.model");

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
    attributes: ["branch_id", "created_by"],
    raw: true,
  });
  return emp;
}

// ================= CREATE =================
exports.createProformaBill = async (req, res) => {
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

    if (!invoice_number || !invoice_date) {
      status = "pending";
    }

    const emp = await getUserBranch(req);
    if (emp) assigned_to = emp.branch_id;

    if (assigned_to) {
      const branch = await Branch.findByPk(assigned_to);
      if (!branch)
        return res.status(404).json({ success: false, message: "Branch not found" });
    }

    let documentPaths = [];
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }

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

    const advanceAmount =
      advance_amount !== undefined &&
      advance_amount !== null &&
      advance_amount !== ""
        ? parseFloat(advance_amount)
        : null;
        
    const billTotal = serviceEntries.reduce(
  (sum, s) => sum + (parseFloat(s.total_amount) || 0),
  0
);
    

    const proformaBill = await ProformaBill.create({
      invoice_number,
      invoice_date,
      status: status || "pending",
      assigned_to,
      created_by: userId,

      advance_amount: advanceAmount,
      total_amount: billTotal,
      outstanding_amount: billTotal,

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

    if (serviceEntries.length > 0) {
      const data = serviceEntries.map((s) => ({
        ...s,
        proforma_bill_id: proformaBill.id,
      }));
      await ProformaBillService.bulkCreate(data);
    }

    const created = await ProformaBill.findByPk(proformaBill.id, {
      include: [
        { model: Branch, as: "assignedBranch" },
        { model: ProformaBillService, as: "services" },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Proforma bill created successfully",
      data: created,
    });

  } catch (err) {
    console.error("createProformaBill error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProformaBills = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};

    // =========================
    // BRANCH FILTERING
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
          message: "No proforma bills found",
        });
      }

      where.assigned_to = { [Op.in]: branchIds };
    }

    const bills = await ProformaBill.findAll({
      where,
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: ProformaBillService,
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
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
      message: bills.length
        ? "Proforma bills fetched successfully"
        : "No proforma bills found",
    });

  } catch (err) {
    console.error("getAllProformaBills failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch proforma bills",
      error: err.message,
    });
  }
};

exports.getProformaBillById = async (req, res) => {
  try {
    const bill = await ProformaBill.findByPk(req.params.id, {
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: ProformaBillService,
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
      ],
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Proforma bill not found",
      });
    }

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

    res.status(200).json({
      success: true,
      data: bill,
      message: "Proforma bill fetched successfully",
    });

  } catch (err) {
    console.error("getProformaBillById failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch proforma bill",
      error: err.message,
    });
  }
};

exports.updateProformaBill = async (req, res) => {
  try {
    const bill = await ProformaBill.findByPk(req.params.id);

    if (!bill)
      return res.status(404).json({ success: false, message: "Proforma bill not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    if (emp && bill.assigned_to !== emp.branch_id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });

      const allowedBranchIds = branches.map((b) => b.id);

      if (!allowedBranchIds.includes(bill.assigned_to)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    let documentPaths = null;
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }

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

    const advanceAmount =
      req.body.advance_amount !== undefined &&
      req.body.advance_amount !== null &&
      req.body.advance_amount !== ""
        ? parseFloat(req.body.advance_amount)
        : bill.advance_amount;
        
    const newTotal = serviceEntries.reduce(
  (sum, s) => sum + (parseFloat(s.total_amount) || 0),
  0
);



const payments = await ProformaBillPayment.findAll({
  where: { proforma_bill_id: bill.id },
  raw: true,
});

let received = 0;
for (const p of payments) {
  received += parseFloat(p.amount_received) || 0;
}

let updatedOutstanding = newTotal - received;
if (updatedOutstanding < 0) updatedOutstanding = 0;

    await bill.update({
      invoice_number: req.body.invoice_number !== undefined ? req.body.invoice_number : bill.invoice_number,
      invoice_date: req.body.invoice_date !== undefined ? req.body.invoice_date : bill.invoice_date,
      status: req.body.status !== undefined ? req.body.status : bill.status,

      advance_amount: advanceAmount,
      total_amount: newTotal,
      outstanding_amount: updatedOutstanding,

      irn: req.body.irn !== undefined ? req.body.irn : bill.irn,
      ack_no: req.body.ack_no !== undefined ? req.body.ack_no : bill.ack_no,
      ack_date: req.body.ack_date !== undefined ? req.body.ack_date : bill.ack_date,

      consignee_name: req.body.consignee_name !== undefined ? req.body.consignee_name : bill.consignee_name,
      consignee_address: req.body.consignee_address !== undefined ? req.body.consignee_address : bill.consignee_address,
      consignee_gstin: req.body.consignee_gstin !== undefined ? req.body.consignee_gstin : bill.consignee_gstin,
      consignee_state: req.body.consignee_state !== undefined ? req.body.consignee_state : bill.consignee_state,
      consignee_state_code: req.body.consignee_state_code !== undefined ? req.body.consignee_state_code : bill.consignee_state_code,

      buyer_name: req.body.buyer_name !== undefined ? req.body.buyer_name : bill.buyer_name,
      buyer_address: req.body.buyer_address !== undefined ? req.body.buyer_address : bill.buyer_address,
      buyer_gstin: req.body.buyer_gstin !== undefined ? req.body.buyer_gstin : bill.buyer_gstin,
      buyer_state: req.body.buyer_state !== undefined ? req.body.buyer_state : bill.buyer_state,
      buyer_state_code: req.body.buyer_state_code !== undefined ? req.body.buyer_state_code : bill.buyer_state_code,

      delivery_note: req.body.delivery_note !== undefined ? req.body.delivery_note : bill.delivery_note,
      payment_terms: req.body.payment_terms !== undefined ? req.body.payment_terms : bill.payment_terms,
      reference_no: req.body.reference_no !== undefined ? req.body.reference_no : bill.reference_no,
      other_references: req.body.other_references !== undefined ? req.body.other_references : bill.other_references,
      buyer_order_no: req.body.buyer_order_no !== undefined ? req.body.buyer_order_no : bill.buyer_order_no,
      buyer_order_date: req.body.buyer_order_date !== undefined ? req.body.buyer_order_date : bill.buyer_order_date,
      dispatch_doc_no: req.body.dispatch_doc_no !== undefined ? req.body.dispatch_doc_no : bill.dispatch_doc_no,
      delivery_note_date: req.body.delivery_note_date !== undefined ? req.body.delivery_note_date : bill.delivery_note_date,
      dispatched_through: req.body.dispatched_through !== undefined ? req.body.dispatched_through : bill.dispatched_through,
      destination: req.body.destination !== undefined ? req.body.destination : bill.destination,
      terms_of_delivery: req.body.terms_of_delivery !== undefined ? req.body.terms_of_delivery : bill.terms_of_delivery,

      company_pan: req.body.company_pan !== undefined ? req.body.company_pan : bill.company_pan,

      bank_name: req.body.bank_name !== undefined ? req.body.bank_name : bill.bank_name,
      account_number: req.body.account_number !== undefined ? req.body.account_number : bill.account_number,
      ifsc_code: req.body.ifsc_code !== undefined ? req.body.ifsc_code : bill.ifsc_code,
      bank_branch: req.body.bank_branch !== undefined ? req.body.bank_branch : bill.bank_branch,

      document: documentPaths !== null ? documentPaths : bill.document,
    });

    if (services.length > 0) {
      await ProformaBillService.destroy({ where: { proforma_bill_id: bill.id } });

      const data = serviceEntries.map((s) => ({
        ...s,
        proforma_bill_id: bill.id,
      }));

      await ProformaBillService.bulkCreate(data);
    }

    const updated = await ProformaBill.findByPk(bill.id, {
      include: [
        { model: Branch, as: "assignedBranch" },
        { model: ProformaBillService, as: "services" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Proforma bill updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("updateProformaBill failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update proforma bill",
      error: err.message,
    });
  }
};

exports.deleteProformaBill = async (req, res) => {
  try {
    const bill = await ProformaBill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Proforma bill not found",
      });
    }

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

    await bill.update({
      received_amount: null,
      advance_amount: null,
      difference_amount: 0,
      status: "pending",
    });

    await bill.destroy();

    return res.status(200).json({
      success: true,
      message: "Proforma bill deleted successfully",
    });

  } catch (err) {
    console.error("deleteProformaBill failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete proforma bill",
      error: err.message,
    });
  }
};