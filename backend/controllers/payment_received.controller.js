// // controllers/payment_received.controller.js
// const PaymentReceived = require("../models/payment_received.model");
// const PlantName = require("../models/plant_name.model");
// const BaseAmount = require("../models/base_amount.model");

// // exports.create = async (req, res) => {
// //   try {
// //     const { plant_id, base_amount_id, payment_received } = req.body;
// //     const created_by = req.user?.id || null;

// //     if (!plant_id || !base_amount_id || !payment_received) {
// //       return res.status(400).json({ message: "plant_id, base_amount_id and payment_received are required" });
// //     }

// //     // 🔍 Check if already exists
// //     const existingPayment = await PaymentReceived.findOne({
// //       where: { plant_id, base_amount_id }
// //     });

// //     if (existingPayment) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Advance already paid for this plant and base amount"
// //       });
// //     }

// //     // 1. Find base_amount to get grand_total
// //     const baseAmount = await BaseAmount.findByPk(base_amount_id);
// //     if (!baseAmount) {
// //       return res.status(404).json({ message: "Base amount not found" });
// //     }

// //     // 2. Calculate due amount
// //     const grandTotal = parseFloat(baseAmount.grand_total);
// //     const dueAmount = grandTotal - parseFloat(payment_received);

// //     // 3. Insert into payment_received table
// //     let payment = await PaymentReceived.create({
// //       plant_id,
// //       base_amount_id,
// //       payment_received,
// //       due_amount: dueAmount,
// //       created_by,
// //     });

// //     payment = await payment.reload();

// //     return res.status(201).json({
// //       success: true,
// //       data: payment.get({ plain: true }),
// //       message: "Payment recorded successfully"
// //     });
// //   } catch (error) {
// //     console.error("Error creating payment:", error);
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// exports.create = async (req, res) => {
//   try {
//     const { plant_id, base_amount_id, payment_received } = req.body;
//     const created_by = req.user?.id || null;

//     if (!plant_id || !base_amount_id || !payment_received) {
//       return res.status(400).json({ message: "plant_id, base_amount_id and payment_received are required" });
//     }

//     // 1. Find base_amount to get grand_total
//     const baseAmount = await BaseAmount.findByPk(base_amount_id);
//     if (!baseAmount) {
//       return res.status(404).json({ message: "Base amount not found" });
//     }

//     const grandTotal = parseFloat(baseAmount.grand_total);

//     // 2. Get last payment (if any) to calculate remaining due
//     const lastPayment = await PaymentReceived.findOne({
//       where: { plant_id, base_amount_id },
//       order: [["created_at", "DESC"]],
//     });

//     const previousDue = lastPayment ? parseFloat(lastPayment.due_amount) : grandTotal;

//     if (previousDue <= 0) {
//       return res.status(400).json({ 
//         success: false,
//         message: "This base amount is already fully paid"
//       });
//     }

//     if (payment_received > previousDue) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment exceeds due amount. Remaining due = ${previousDue}`
//       });
//     }

//     // 3. New due = previous due - payment_received
//     const dueAmount = previousDue - parseFloat(payment_received);

//     // 4. Insert new row
//     let payment = await PaymentReceived.create({
//       plant_id,
//       base_amount_id,
//       payment_received,
//       due_amount: dueAmount,
//       created_by,
//     });

//     // 5. Fetch with relations
//     payment = await PaymentReceived.findByPk(payment.id, {
//       include: [
//         { model: PlantName, as: "plant", attributes: ["id", "name"] },
//         { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
//       ],
//     });

//     return res.status(201).json({
//       success: true,
//       data: payment,
//       message: "Payment recorded successfully"
//     });
//   } catch (error) {
//     console.error("Error creating payment:", error);
//     return res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };



// exports.getAll = async (req, res) => {
//   try {
//     const data = await PaymentReceived.findAll({
//       include: [
//         { model: PlantName, as: "plant", attributes: ["id", "name"] },
//         { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
//       ],
//       order: [["id", "DESC"]],
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching payments:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // GET BY ID
// exports.getById = async (req, res) => {
//   try {
//     const data = await PaymentReceived.findOne({
//       where: { id: req.params.id },
//       include: [
//         { model: PlantName, as: "plant", attributes: ["id", "name"] },
//         { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
//       ],
//     });

//     if (!data) return res.status(404).json({ message: "Payment not found" });
//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching payment by id:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // UPDATE
// exports.update = async (req, res) => {
//   try {
//     const record = await PaymentReceived.findByPk(req.params.id);
//     if (!record) return res.status(404).json({ message: "Payment not found" });

//     const { payment_received } = req.body;

//     // If updating payment_received, recalc due_amount
//     if (payment_received !== undefined) {
//       const baseAmount = await BaseAmount.findByPk(record.base_amount_id);
//       if (!baseAmount) return res.status(404).json({ message: "Base amount not found" });

//       const grandTotal = parseFloat(baseAmount.grand_total);
//       req.body.due_amount = grandTotal - parseFloat(payment_received);
//     }

//     await record.update(req.body);

//     return res.json({ success: true, data: record, message: "Payment updated successfully" });
//   } catch (err) {
//     console.error("Error updating payment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // DELETE
// exports.remove = async (req, res) => {
//   try {
//     const record = await PaymentReceived.findByPk(req.params.id);
//     if (!record) return res.status(404).json({ message: "Payment not found" });

//     await record.destroy();
//     return res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting payment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



// // 📌 Get all payment history for a base_amount_id
// exports.getPaymentHistory = async (req, res) => {
//   try {
//     const { base_amount_id } = req.params;

//     if (!base_amount_id) {
//       return res.status(400).json({ message: "base_amount_id is required" });
//     }

//     // 1. Find all payments for this base_amount_id
//     const payments = await PaymentReceived.findAll({
//       where: { base_amount_id },
//       include: [
//         { model: PlantName, as: "plant", attributes: ["id", "name"] },
//         { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
//       ],
//       order: [["created_at", "ASC"]], // ⬅ oldest first (timeline)
//     });

//     if (!payments || payments.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No payments found for this base amount",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: payments,
//       message: "Payment history fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching payment history:", error);
//     return res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };





// controllers/payment_received.controller.js
const PaymentReceived = require("../models/payment_received.model");
const PlantName = require("../models/plant_name.model");
const BaseAmount = require("../models/base_amount.model");
const Employee = require("../models/employee.model");

// ==============================
// Helper: get root company id dynamically
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  // Company login
  if (type === "company") return req.user.id;

  // Employee login
  if (type === "employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    if (emp?.created_by) return emp.created_by;
  }

  // Other roles (Accountant, HR, Manager)
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  // fallback: assume user is company
  return req.user.id;
}

// ==============================
// CREATE PAYMENT
// ==============================
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to create payment" });
    }

    const { plant_id, base_amount_id, payment_received } = req.body;
    if (!plant_id || !base_amount_id || payment_received === undefined) {
      return res.status(400).json({ message: "plant_id, base_amount_id and payment_received are required" });
    }

    // ✅ Validate plant belongs to company
    const plant = await PlantName.findOne({
      where: { id: plant_id, created_by: companyId },
    });
    if (!plant) return res.status(400).json({ message: "Invalid plant_id for this company" });

    // ✅ Validate base_amount belongs to company
    const baseAmount = await BaseAmount.findOne({
      where: { id: base_amount_id, created_by: companyId },
    });
    if (!baseAmount) return res.status(400).json({ message: "Invalid base_amount_id for this company" });

    // grand_total from base amount
    const grandTotal = parseFloat(baseAmount.grand_total);

    // Last payment check
    const lastPayment = await PaymentReceived.findOne({
      where: { plant_id, base_amount_id },
      order: [["created_at", "DESC"]],
    });
    const previousDue = lastPayment ? parseFloat(lastPayment.due_amount) : grandTotal;

    if (previousDue <= 0) {
      return res.status(400).json({ message: "This base amount is already fully paid" });
    }

    if (payment_received > previousDue) {
      return res.status(400).json({ message: `Payment exceeds due amount. Remaining due = ${previousDue}` });
    }

    const dueAmount = previousDue - parseFloat(payment_received);

    // Save payment
    let payment = await PaymentReceived.create({
      plant_id,
      base_amount_id,
      payment_received,
      due_amount: dueAmount,
      created_by: companyId,
    });

    payment = await PaymentReceived.findByPk(payment.id, {
      include: [
        { model: PlantName, as: "plant", attributes: ["id", "name"] },
        { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ==============================
// GET ALL
// ==============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const data = await PaymentReceived.findAll({
      include: [
        { model: PlantName, as: "plant", attributes: ["id", "name"], where: { created_by: companyId } },
        { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"], where: { created_by: companyId } },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching payments:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const data = await PaymentReceived.findOne({
      where: { id: req.params.id },
      include: [
        { model: PlantName, as: "plant", attributes: ["id", "name"], where: { created_by: companyId } },
        { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"], where: { created_by: companyId } },
      ],
    });

    if (!data) return res.status(404).json({ message: "Payment not found" });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching payment by id:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================
// UPDATE
// ==============================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to update payment" });
    }

    const record = await PaymentReceived.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Payment not found" });

    const { payment_received } = req.body;

    if (payment_received !== undefined) {
      const baseAmount = await BaseAmount.findOne({ where: { id: record.base_amount_id, created_by: companyId } });
      if (!baseAmount) return res.status(404).json({ message: "Base amount not found" });

      const grandTotal = parseFloat(baseAmount.grand_total);
      req.body.due_amount = grandTotal - parseFloat(payment_received);
    }

    await record.update(req.body);

    const updated = await PaymentReceived.findByPk(record.id, {
      include: [
        { model: PlantName, as: "plant", attributes: ["id", "name"] },
        { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"] },
      ],
    });

    return res.json({ success: true, data: updated, message: "Payment updated successfully" });
  } catch (err) {
    console.error("Error updating payment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to delete payment" });
    }

    const record = await PaymentReceived.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Payment not found" });

    await record.destroy();
    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting payment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================
// PAYMENT HISTORY BY BASE AMOUNT
// ==============================
exports.getPaymentHistory = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const { base_amount_id } = req.params;
    if (!base_amount_id) return res.status(400).json({ message: "base_amount_id is required" });

    const payments = await PaymentReceived.findAll({
      where: { base_amount_id },
      include: [
        { model: PlantName, as: "plant", attributes: ["id", "name"], where: { created_by: companyId } },
        { model: BaseAmount, as: "base_amount", attributes: ["id", "grand_total"], where: { created_by: companyId } },
      ],
      order: [["created_at", "ASC"]],
    });

    if (!payments.length) return res.status(404).json({ message: "No payments found for this base amount" });

    return res.status(200).json({ success: true, data: payments, message: "Payment history fetched successfully" });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
