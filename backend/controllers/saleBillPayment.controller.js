const SaleBill = require("../models/saleBill.model");
const SaleBillPayment = require("../models/saleBillPayment.model");
const SaleBillService = require("../models/saleBillService.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const ProformaBill = require("../models/proformaBill.model");

// =======================================
// HELPERS
// =======================================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = (req.user.type || "").toLowerCase();

  if (type === "company") {
    return req.user.id;
  }

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });

  if (emp?.created_by) {
    return emp.created_by;
  }

  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });

  if (user?.created_by) {
    return user.created_by;
  }

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

async function checkBillAccess(req, bill) {
  const emp = await getUserBranch(req);
  const companyId = await getCompanyId(req);

  if (emp && bill.assigned_to !== emp.branch_id) {
    return false;
  }

  if (!emp) {
    const branches = await Branch.findAll({
      where: { created_by: companyId },
      attributes: ["id"],
      raw: true,
    });

    const branchIds = branches.map((b) => b.id);

    if (!branchIds.includes(bill.assigned_to)) {
      return false;
    }
  }

  return true;
}

// =======================================
// PAYMENT SUMMARY
// =======================================


// async function getPaymentSummary(saleBillId) {
//   const bill = await SaleBill.findByPk(saleBillId, {
//     include: [
//       {
//         model: SaleBillService,
//         as: "services",
//         attributes: ["total_amount"],
//       },
//     ],
//   });

//   if (!bill) {
//     return null;
//   }

//   const billTotal = (bill.services || []).reduce(
//     (sum, item) => sum + (parseFloat(item.total_amount) || 0),
//     0
//   );

//   const advance = parseFloat(bill.advance_amount) || 0;

//   const payments = await SaleBillPayment.findAll({
//     where: { sale_bill_id: saleBillId },
//     raw: true,
//   });

//   let totalReceived = 0;
//   let totalTds = 0;
//   let totalDeductions = 0;
//   let totalSettled = 0;

//   for (const row of payments) {
//     const received = parseFloat(row.amount_received) || 0;
//     const tds = parseFloat(row.tds) || 0;
//     const deductions = parseFloat(row.deductions) || 0;

//     totalReceived += received;
//     totalTds += tds;
//     totalDeductions += deductions;
//     totalSettled += received + tds + deductions;
//   }

//   const pendingAmount =
//     billTotal - advance - totalSettled;

//   let status = "pending";

//   if (pendingAmount <= 0) {
//     status = "paid";
//   } else if (
//     totalSettled > 0 ||
//     advance > 0
//   ) {
//     status = "partial";
//   }

//   await bill.update({
//     status,
//   });

//   return {
//     bill_total: billTotal,
//     advance_amount: advance,
//     total_received: totalReceived,
//     total_tds: totalTds,
//     total_deductions: totalDeductions,
//     total_settled: totalSettled,
//     pending_amount:
//       pendingAmount < 0 ? 0 : pendingAmount,
//     status,
//   };
// }





async function getPaymentSummary(saleBillId) {
  const bill = await SaleBill.findByPk(saleBillId, {
    include: [
      {
        model: SaleBillService,
        as: "services",
        attributes: ["total_amount"],
      },
    ],
  });

  if (!bill) {
    return null;
  }

  // Bill Total calculation from services
  const billTotal = (bill.services || []).reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );

  const advance = parseFloat(bill.advance_amount) || 0;

  const payments = await SaleBillPayment.findAll({
    where: { sale_bill_id: saleBillId },
    raw: true,
  });

  let totalReceived = 0;
  let totalTds = 0;
  let totalDeductions = 0;

  for (const row of payments) {
    totalReceived += parseFloat(row.amount_received) || 0;
    totalTds += parseFloat(row.tds) || 0;
    totalDeductions += parseFloat(row.deductions) || 0;
  }

  const totalSettled = totalReceived + totalTds + totalDeductions;

  // 🔥 FIX: Floating point issues handle karne ke liye rounding use karein
  // Agar bill amount aur settled amount ka difference 1 se kam hai, to use "paid" maane (Accounting standard)
  const diff = billTotal - advance - totalSettled;
  const pendingAmount = Math.round(diff); 
let status = "pending";
// Ab 0.3 round hokar 0 ho jayega, aur status "paid" ho jayega
if (pendingAmount <= 0) {
  status = "paid";
} else if (totalSettled > 0 || advance > 0) {
  status = "partial";
}

  // Database update
  await bill.update({ status });

  return {
    bill_total: billTotal,
    advance_amount: advance,
    total_received: totalReceived,
    total_tds: totalTds,
    total_deductions: totalDeductions,
    total_settled: totalSettled,
    pending_amount: pendingAmount < 0 ? 0 : pendingAmount,
    status,
  };
}


// =======================================
// CREATE PAYMENT
// =======================================
exports.createPayment = async (req, res) => {
  try {
    const {
      sale_bill_id,
      payment_date,
      amount_received,
      tds,
      deductions,
      payment_mode,
      reference_no,
      notes,
    } = req.body;

    const bill = await SaleBill.findByPk(
      sale_bill_id
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Sale bill not found",
      });
    }

    const allowed = await checkBillAccess(
      req,
      bill
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const payment =
      await SaleBillPayment.create({
        sale_bill_id,
        payment_date,
        amount_received:
          parseFloat(amount_received) || 0,
        tds: parseFloat(tds) || 0,
        deductions:
          parseFloat(deductions) || 0,
        payment_mode,
        reference_no:
          reference_no || null,
        notes: notes || null,
      });

    const summary =
      await getPaymentSummary(
        sale_bill_id
      );

    return res.status(201).json({
      success: true,
      message:
        "Payment added successfully",
      data: payment,
      summary,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to create payment",
      error: err.message,
    });
  }
};

// =======================================
// GET ALL PAYMENTS BY BILL
// =======================================
exports.getPaymentsBySaleBill =
  async (req, res) => {
    try {
      const saleBillId =
        req.params.sale_bill_id;

      const bill =
        await SaleBill.findByPk(
          saleBillId
        );

      if (!bill) {
        return res.status(404).json({
          success: false,
          message:
            "Sale bill not found",
        });
      }

      const allowed =
        await checkBillAccess(
          req,
          bill
        );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied",
        });
      }

      const payments =
        await SaleBillPayment.findAll({
          where: {
            sale_bill_id: saleBillId,
          },
          order: [["id", "DESC"]],
        });

      const summary =
        await getPaymentSummary(
          saleBillId
        );

      return res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
        summary,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch payments",
        error: err.message,
      });
    }
  };

// =======================================
// GET PAYMENT BY ID
// =======================================
exports.getPaymentById = async (
  req,
  res
) => {
  try {
    const payment =
      await SaleBillPayment.findByPk(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    const bill =
      await SaleBill.findByPk(
        payment.sale_bill_id
      );

    const allowed =
      await checkBillAccess(
        req,
        bill
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment",
      error: err.message,
    });
  }
};

// =======================================
// UPDATE PAYMENT
// =======================================
exports.updatePayment = async (
  req,
  res
) => {
  try {
    const payment =
      await SaleBillPayment.findByPk(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    const bill =
      await SaleBill.findByPk(
        payment.sale_bill_id
      );

    const allowed =
      await checkBillAccess(
        req,
        bill
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    await payment.update({
      payment_date:
        req.body.payment_date !==
        undefined
          ? req.body.payment_date
          : payment.payment_date,

      amount_received:
        req.body.amount_received !==
        undefined
          ? parseFloat(
              req.body.amount_received
            ) || 0
          : payment.amount_received,

      tds:
        req.body.tds !== undefined
          ? parseFloat(
              req.body.tds
            ) || 0
          : payment.tds,

      deductions:
        req.body.deductions !==
        undefined
          ? parseFloat(
              req.body.deductions
            ) || 0
          : payment.deductions,

      payment_mode:
        req.body.payment_mode !==
        undefined
          ? req.body.payment_mode
          : payment.payment_mode,

      reference_no:
        req.body.reference_no !==
        undefined
          ? req.body.reference_no
          : payment.reference_no,

      notes:
        req.body.notes !== undefined
          ? req.body.notes
          : payment.notes,
    });

    const summary =
      await getPaymentSummary(
        payment.sale_bill_id
      );

    return res.status(200).json({
      success: true,
      message:
        "Payment updated successfully",
      data: payment,
      summary,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to update payment",
      error: err.message,
    });
  }
};

// =======================================
// DELETE PAYMENT
// =======================================
exports.deletePayment = async (req, res) => {
  try {
    const payment = await SaleBillPayment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const bill = await SaleBill.findByPk(payment.sale_bill_id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Sale bill not found",
      });
    }

    const allowed = await checkBillAccess(req, bill);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const saleBillId = payment.sale_bill_id;

    // =========================
    // 🔥 HANDLE PROFORMA RESTORE
    // =========================
    if (payment.source_type === "proforma") {

      if (!payment.source_id) {
        return res.status(400).json({
          success: false,
          message: "Invalid proforma reference",
        });
      }

      const proforma = await ProformaBill.findByPk(payment.source_id);

      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: "Linked proforma not found",
        });
      }

      const currentOutstanding =
        parseFloat(proforma.outstanding_amount) || 0;

      const restoredAmount =
        currentOutstanding + (parseFloat(payment.amount_received) || 0);

      await proforma.update({
        outstanding_amount: restoredAmount,
        status: "partial", // safest fallback
      });

      // 🔥 OPTIONAL (GOOD PRACTICE)
      console.log(
        `Proforma #${proforma.id} restored by deleting payment #${payment.id}`
      );
    }

    // =========================
    // DELETE PAYMENT
    // =========================
    await payment.destroy();

    // =========================
    // UPDATE SUMMARY
    // =========================
    const summary = await getPaymentSummary(saleBillId);

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      summary,
    });

  } catch (err) {
    console.error("deletePayment failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: err.message,
    });
  }
};