const ProformaBill = require("../models/proformaBill.model");
const ProformaBillPayment = require("../models/proformaBillPayment.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const Branch = require("../models/branch.model");

// ================= HELPERS =================

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

async function checkAccess(req, bill) {
  const emp = await getUserBranch(req);
  const companyId = await getCompanyId(req);

  if (emp && bill.assigned_to !== emp.branch_id) return false;

  if (!emp) {
    const branches = await Branch.findAll({
      where: { created_by: companyId },
      attributes: ["id"],
      raw: true,
    });

    const ids = branches.map((b) => b.id);
    if (!ids.includes(bill.assigned_to)) return false;
  }

  return true;
}

// ================= SUMMARY =================

async function updateProformaSummary(proformaId) {
  const bill = await ProformaBill.findByPk(proformaId);

  if (!bill) return null;

  const total = parseFloat(bill.total_amount) || 0;

  const payments = await ProformaBillPayment.findAll({
    where: { proforma_bill_id: proformaId },
    raw: true,
  });

  let received = 0;

  for (const p of payments) {
    received += parseFloat(p.amount_received) || 0;
  }

  let outstanding = total - received;
if (outstanding < 0) outstanding = 0;

  let status = "pending";

  if (outstanding <= 0) status = "settled";
  else if (received > 0) status = "partial";

  await bill.update({
    outstanding_amount: outstanding < 0 ? 0 : outstanding,
    status,
  });

  return {
    total,
    received,
    outstanding: outstanding < 0 ? 0 : outstanding,
    status,
  };
}

// ================= CREATE =================

exports.createPayment = async (req, res) => {
  try {
    const {
      proforma_bill_id,
      payment_date,
      amount_received,
      payment_mode,
      reference_no,
      notes,
    } = req.body;

    const bill = await ProformaBill.findByPk(proforma_bill_id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Proforma bill not found",
      });
    }

    const allowed = await checkAccess(req, bill);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    const currentSummary = await updateProformaSummary(proforma_bill_id);

if (parseFloat(amount_received) > currentSummary.outstanding) {
  return res.status(400).json({
    success: false,
    message: "Payment exceeds outstanding amount",
  });
}

    const payment = await ProformaBillPayment.create({
      proforma_bill_id,
      payment_date,
      amount_received: parseFloat(amount_received) || 0,
      payment_mode,
      reference_no: reference_no || null,
      notes: notes || null,
    });

    const summary = await updateProformaSummary(proforma_bill_id);

    return res.status(201).json({
      success: true,
      message: "Proforma payment added",
      data: payment,
      summary,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: err.message,
    });
  }
};

// ================= GET ALL =================

exports.getPaymentsByProforma = async (req, res) => {
  try {
    const id = req.params.proforma_bill_id;

    const bill = await ProformaBill.findByPk(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Proforma not found",
      });
    }

    const allowed = await checkAccess(req, bill);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const payments = await ProformaBillPayment.findAll({
      where: { proforma_bill_id: id },
      order: [["id", "DESC"]],
    });

    const summary = await updateProformaSummary(id);

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
      summary,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: err.message,
    });
  }
};

// ================= GET BY ID =================

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await ProformaBillPayment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const bill = await ProformaBill.findByPk(payment.proforma_bill_id);

    const allowed = await checkAccess(req, bill);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed",
      error: err.message,
    });
  }
};

// ================= UPDATE =================

exports.updatePayment = async (req, res) => {
  try {
    const payment = await ProformaBillPayment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const bill = await ProformaBill.findByPk(payment.proforma_bill_id);

    const allowed = await checkAccess(req, bill);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await payment.update({
      payment_date: req.body.payment_date ?? payment.payment_date,
      amount_received:
        req.body.amount_received !== undefined
          ? parseFloat(req.body.amount_received) || 0
          : payment.amount_received,
      payment_mode: req.body.payment_mode ?? payment.payment_mode,
      reference_no: req.body.reference_no ?? payment.reference_no,
      notes: req.body.notes ?? payment.notes,
    });

    const summary = await updateProformaSummary(payment.proforma_bill_id);

    return res.status(200).json({
      success: true,
      message: "Payment updated",
      data: payment,
      summary,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};

// ================= DELETE =================

exports.deletePayment = async (req, res) => {
  try {
    const payment = await ProformaBillPayment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const bill = await ProformaBill.findByPk(payment.proforma_bill_id);

    const allowed = await checkAccess(req, bill);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const proformaId = payment.proforma_bill_id;

    await payment.destroy();

    const summary = await updateProformaSummary(proformaId);

    return res.status(200).json({
      success: true,
      message: "Payment deleted",
      summary,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete",
      error: err.message,
    });
  }
};