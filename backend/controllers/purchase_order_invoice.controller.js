// const { Op } = require("sequelize");
// const path = require("path");
// const PurchaseOrderInvoice = require("../models/purchase_order_invoice.model");
// const PurchaseOrder = require("../models/purchase_order.model");
// const Branch = require("../models/branch.model");
// const Employee = require("../models/employee.model");
// const User = require("../models/user.model");

// // ================================
// // HELPERS
// // ================================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;

//   // Employee link
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//     raw: true,
//   });
//   if (emp?.created_by) return emp.created_by;

//   // Accountant or sub-user linked to company
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

// // =====================
// // Add Payment
// // =====================
// // exports.addPayment = async (req, res) => {
// //   try {
// //     const { po_number, payment_amount, cgst = 9, sgst = 9, igst = 0 } = req.body;

// //     if (!po_number || !payment_amount)
// //       return res.status(400).json({ success: false, message: "po_number and payment_amount are required" });

// //     const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
// //     if (!purchaseOrder)
// //       return res.status(404).json({ success: false, message: "Purchase Order not found" });

// //     // ======================
// //     // Role Permission Logic
// //     // ======================
// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     if (emp) {
// //       // Employee/Branch Manager – can only manage their branch POs
// //       const branch = await Branch.findOne({ where: { id: emp.branch_id } });
// //       if (!branch || branch.created_by !== companyId)
// //         return res.status(403).json({ success: false, message: "You don't have access to this branch PO" });
// //     } else {
// //       // Company or Accountant – validate company ownership
// //       const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
// //       if (branch && branch.created_by !== companyId)
// //         return res.status(403).json({ success: false, message: "Access denied for this PO" });
// //     }

// //     // ======================
// //     // Payment Logic
// //     // ======================
// //     const totalPaid = (await PurchaseOrderInvoice.sum("base_amount", { where: { po_number } })) || 0;
// //     if (parseFloat(purchaseOrder.total_amount) <= totalPaid)
// //       return res.status(400).json({ success: false, message: "Purchase Order already paid in full" });

// //     const base_amount = parseFloat(payment_amount);
// //     const gst_amount = base_amount * ((parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100);
// //     const total_amount = base_amount + gst_amount;

// //     let remaining_amount = parseFloat(purchaseOrder.total_amount) - (totalPaid + base_amount);
// //     if (remaining_amount < 0) remaining_amount = 0;

// //     const status = remaining_amount === 0 ? "Paid" : "Pending";

// //     const payment = await PurchaseOrderInvoice.create({
// //       po_number,
// //       payment_amount: base_amount,
// //       cgst,
// //       sgst,
// //       igst,
// //       gst_amount,
// //       base_amount,
// //       total_amount,
// //       remaining_amount,
// //       status,
// //       created_by: req.user?.id || null,
// //     });

// //     if (remaining_amount === 0) await purchaseOrder.update({ status: "Received" });

// //     res.status(201).json({ success: true, message: "Payment recorded successfully", data: payment });
// //   } catch (error) {
// //     console.error("Add Payment Error:", error);
// //     res.status(500).json({ success: false, message: "Failed to add payment", error: error.message });
// //   }
// // };
// // =====================
// exports.addPayment = async (req, res) => {
//   try {
//     const { po_number, payment_amount, cgst = 9, sgst = 9, igst = 0, gst_type = "Exclusive" } = req.body;

//     if (!po_number || !payment_amount)
//       return res.status(400).json({ success: false, message: "po_number and payment_amount are required" });

//     const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
//     if (!purchaseOrder)
//       return res.status(404).json({ success: false, message: "Purchase Order not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // Branch access check
//     if (emp) {
//       const branch = await Branch.findOne({ where: { id: emp.branch_id } });
//       if (!branch || branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "You don't have access to this branch PO" });
//     } else {
//       const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
//       if (branch && branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "Access denied for this PO" });
//     }

//     // ===============================
//     // Total base_amount paid so far
//     // ===============================
//     const totalPaidBase = (await PurchaseOrderInvoice.sum("base_amount", { where: { po_number } })) || 0;

//     // Remaining base amount
//     let remainingBase = parseFloat(purchaseOrder.total_amount) - totalPaidBase;
//     if (remainingBase <= 0)
//       return res.status(400).json({ success: false, message: "Purchase Order already paid in full" });

//     // Prevent overpayment
//     let base_amount = parseFloat(payment_amount);
//     if (base_amount > remainingBase) base_amount = remainingBase;

//     // ===============================
//     // GST calculation
//     // ===============================
//     const gstRate = (parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100;
//     let gst_amount = 0;
//     let total_amount = 0;

//     if (gst_type.toLowerCase() === "inclusive") {
//       base_amount = base_amount / (1 + gstRate);
//       gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
//       total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
//     } else {
//       gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
//       total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
//     }

//     base_amount = parseFloat(base_amount.toFixed(2));

//     // ===============================
//     // Remaining amount and status
//     // ===============================
//     let remaining_amount = parseFloat(purchaseOrder.total_amount) - (totalPaidBase + base_amount);
//     if (remaining_amount < 0) remaining_amount = 0;
//     remaining_amount = parseFloat(remaining_amount.toFixed(2));

//     const status = remaining_amount === 0 ? "Paid" : "Pending";

//     // ===============================
//     // Save payment
//     // ===============================
//     const payment = await PurchaseOrderInvoice.create({
//       po_number,
//       payment_amount: parseFloat(payment_amount),
//       cgst,
//       sgst,
//       igst,
//       gst_amount,
//       base_amount,
//       total_amount,
//       remaining_amount,
//       status,
//       gst_type,
//       created_by: req.user?.id || null,
//     });

//     // Update PO status if fully paid
//     if (remaining_amount === 0) await purchaseOrder.update({ status: "Received" });

//     return res.status(201).json({
//       success: true,
//       message: `Payment (${gst_type}) recorded successfully`,
//       data: payment,
//     });

//   } catch (error) {
//     console.error("Add Payment Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to add payment", error: error.message });
//   }
// };


// // =====================
// // Get All Payments (Role Based)
// // =====================
// exports.getAllPayments = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let where = {};

//     if (emp) {
//       // Employee sees payments only for their branch
//       const branch = await Branch.findOne({ where: { id: emp.branch_id }, attributes: ["id"] });
//       if (!branch)
//         return res.status(403).json({ success: false, message: "No access to any branch payments" });

//       const poList = await PurchaseOrder.findAll({
//         where: { branch_id: emp.branch_id },
//         attributes: ["po_number"],
//         raw: true,
//       });
//       where.po_number = { [Op.in]: poList.map((p) => p.po_number) };
//     } else {
//       // Company sees payments for all its branches
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });
//       const poList = await PurchaseOrder.findAll({
//         where: { branch_id: { [Op.in]: branches.map((b) => b.id) } },
//         attributes: ["po_number"],
//         raw: true,
//       });
//       where.po_number = { [Op.in]: poList.map((p) => p.po_number) };
//     }

//     const payments = await PurchaseOrderInvoice.findAll({
//       where,
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: ["id", "po_number", "vendor_name", "total_amount", "status", "branch_id"],
//         },
//       ],
//       order: [["id", "DESC"]],
//     });

//     res.json({ success: true, data: payments });
//   } catch (error) {
//     console.error("Get All Payments Error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch payments", error: error.message });
//   }
// };

// // =====================
// // Get Payment By ID (Role Based)
// // =====================
// exports.getPaymentById = async (req, res) => {
//   try {
//     const payment = await PurchaseOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [
//         {
//           model: PurchaseOrder,
//           as: "purchaseOrder",
//           attributes: ["id", "po_number", "vendor_name", "total_amount", "status", "branch_id"],
//         },
//       ],
//     });

//     if (!payment)
//       return res.status(404).json({ success: false, message: "Payment not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
//       return res.status(403).json({ success: false, message: "Access denied" });

//     if (!emp) {
//       const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
//       if (!branch || branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     res.json({ success: true, data: payment });
//   } catch (error) {
//     console.error("Get Payment By ID Error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch payment", error: error.message });
//   }
// };

// // =====================
// // Update Payment (Role Based)
// // =====================
// // exports.updatePayment = async (req, res) => {
// //   try {
// //     const payment = await PurchaseOrderInvoice.findByPk(req.params.id, {
// //       include: [{ model: PurchaseOrder, as: "purchaseOrder", attributes: ["branch_id"] }],
// //     });
// //     if (!payment)
// //       return res.status(404).json({ success: false, message: "Payment not found" });

// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
// //       return res.status(403).json({ success: false, message: "Access denied" });

// //     if (!emp) {
// //       const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
// //       if (!branch || branch.created_by !== companyId)
// //         return res.status(403).json({ success: false, message: "Access denied" });
// //     }

// //     const { payment_amount, cgst, sgst, igst, status } = req.body;
// //     const base_amount = parseFloat(payment_amount ?? payment.payment_amount) || 0;
// //     const new_cgst = parseFloat(cgst ?? payment.cgst) || 0;
// //     const new_sgst = parseFloat(sgst ?? payment.sgst) || 0;
// //     const new_igst = parseFloat(igst ?? payment.igst) || 0;
// //     const gst_amount = (base_amount * (new_cgst + new_sgst + new_igst)) / 100;
// //     const total_amount = base_amount + gst_amount;

// //     await payment.update({
// //       payment_amount: base_amount,
// //       cgst: new_cgst,
// //       sgst: new_sgst,
// //       igst: new_igst,
// //       gst_amount,
// //       base_amount,
// //       total_amount,
// //       status: status ?? payment.status,
// //     });

// //     res.json({ success: true, message: "Payment updated successfully", data: payment });
// //   } catch (error) {
// //     console.error("Update Payment Error:", error);
// //     res.status(500).json({ success: false, message: "Failed to update payment", error: error.message });
// //   }
// // };
// exports.updatePayment = async (req, res) => {
//   try {
//     const payment = await PurchaseOrderInvoice.findByPk(req.params.id, {
//       include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
//     });
//     if (!payment)
//       return res.status(404).json({ success: false, message: "Payment not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // Branch access check
//     if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
//       return res.status(403).json({ success: false, message: "Access denied" });

//     if (!emp) {
//       const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
//       if (!branch || branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     // ✅ Safe destructuring with defaults
//     const {
//       payment_amount = payment.payment_amount,
//       cgst = payment.cgst,
//       sgst = payment.sgst,
//       igst = payment.igst,
//       status = payment.status,
//       gst_type = payment.gst_type || "Exclusive"
//     } = req.body || {};

//     // ===============================
//     // Sum of base_amount of other payments
//     // ===============================
//     const po_number = payment.po_number;
//     const totalPaidBeforeUpdate =
//       (await PurchaseOrderInvoice.sum("base_amount", {
//         where: { po_number, id: { [Op.ne]: payment.id } },
//       })) || 0;

//     let remainingBase = parseFloat(payment.purchaseOrder.total_amount) - totalPaidBeforeUpdate;
//     if (remainingBase <= 0)
//       return res.status(400).json({ success: false, message: "Purchase Order already paid in full" });

//     // ===============================
//     // Base amount and overpayment protection
//     // ===============================
//     let base_amount = parseFloat(payment_amount);
//     if (base_amount > remainingBase) base_amount = remainingBase;

//     const new_cgst = parseFloat(cgst);
//     const new_sgst = parseFloat(sgst);
//     const new_igst = parseFloat(igst);
//     const gstRate = (new_cgst + new_sgst + new_igst) / 100;

//     // ===============================
//     // GST calculation
//     // ===============================
//     let gst_amount = 0;
//     let total_amount = 0;

//     if (gst_type.toLowerCase() === "inclusive") {
//       base_amount = base_amount / (1 + gstRate);
//       gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
//       total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
//     } else {
//       gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
//       total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
//     }
//     base_amount = parseFloat(base_amount.toFixed(2));

//     // ===============================
//     // Remaining amount and status
//     // ===============================
//     let remaining_amount = parseFloat(payment.purchaseOrder.total_amount) - (totalPaidBeforeUpdate + base_amount);
//     if (remaining_amount < 0) remaining_amount = 0;
//     remaining_amount = parseFloat(remaining_amount.toFixed(2));

//     const finalStatus = status
//       ? status
//       : remaining_amount === 0
//       ? "Paid"
//       : "Pending";

//     // ===============================
//     // Update payment record
//     // ===============================
//     await payment.update({
//       payment_amount: parseFloat(payment_amount),
//       cgst: new_cgst,
//       sgst: new_sgst,
//       igst: new_igst,
//       gst_amount,
//       base_amount,
//       total_amount,
//       remaining_amount,
//       status: finalStatus,
//       gst_type,
//     });

//     // Update PO status if fully paid
//     if (remaining_amount === 0) await payment.purchaseOrder.update({ status: "Received" });

//     return res.json({
//       success: true,
//       message: `Payment (${gst_type}) updated successfully`,
//       data: payment,
//     });
//   } catch (error) {
//     console.error("Update Payment Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to update payment", error: error.message });
//   }
// };



// // =====================
// // Delete Payment (Role Based)
// // =====================
// exports.deletePayment = async (req, res) => {
//   try {
//     const payment = await PurchaseOrderInvoice.findByPk(req.params.id, {
//       include: [{ model: PurchaseOrder, as: "purchaseOrder", attributes: ["branch_id"] }],
//     });
//     if (!payment)
//       return res.status(404).json({ success: false, message: "Payment not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
//       return res.status(403).json({ success: false, message: "Access denied" });

//     if (!emp) {
//       const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
//       if (!branch || branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     await payment.destroy();
//     res.json({ success: true, message: "Payment deleted successfully" });
//   } catch (error) {
//     console.error("Delete Payment Error:", error);
//     res.status(500).json({ success: false, message: "Failed to delete payment", error: error.message });
//   }
// };

// // =====================
// // Payment Summary (Role Based)
// // =====================
// // exports.getPaymentSummary = async (req, res) => {
// //   try {
// //     const { po_number } = req.params;

// //     const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
// //     if (!purchaseOrder)
// //       return res.status(404).json({ success: false, message: "Purchase Order not found" });

// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     if (emp && purchaseOrder.branch_id !== emp.branch_id)
// //       return res.status(403).json({ success: false, message: "Access denied" });

// //     if (!emp) {
// //       const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
// //       if (!branch || branch.created_by !== companyId)
// //         return res.status(403).json({ success: false, message: "Access denied" });
// //     }

// //     const payments = await PurchaseOrderInvoice.findAll({ where: { po_number } });
// //     const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount || 0), 0);
// //     const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);

// //     res.json({
// //       success: true,
// //       data: {
// //         po_number,
// //         total_base_paid: totalBasePaid,
// //         total_gst_paid: totalGST,
// //         total_paid: totalBasePaid + totalGST,
// //         remaining_balance: Math.max(0, purchaseOrder.total_amount - totalBasePaid),
// //         purchase_order_status: purchaseOrder.status,
// //         payments_count: payments.length,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Payment Summary Error:", error);
// //     res.status(500).json({ success: false, message: "Failed to fetch payment summary", error: error.message });
// //   }
// // };
// // =====================
// // Payment Summary (Role Based)
// // =====================
// exports.getPaymentSummary = async (req, res) => {
//   try {
//     const { po_number } = req.params;

//     const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
//     if (!purchaseOrder)
//       return res.status(404).json({ success: false, message: "Purchase Order not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // Branch-based access check
//     if (emp && purchaseOrder.branch_id !== emp.branch_id)
//       return res.status(403).json({ success: false, message: "Access denied" });

//     if (!emp) {
//       const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
//       if (!branch || branch.created_by !== companyId)
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const payments = await PurchaseOrderInvoice.findAll({ where: { po_number } });

//     const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount || 0), 0);
//     const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);
//     const totalPaid = totalBasePaid + totalGST;

//     const remainingBalance = Math.max(0, purchaseOrder.total_amount - totalPaid);

//     res.json({
//       success: true,
//       data: {
//         po_number,
//         total_base_paid: +totalBasePaid.toFixed(2),
//         total_gst_paid: +totalGST.toFixed(2),
//         total_paid: +totalPaid.toFixed(2),
//         remaining_balance: +remainingBalance.toFixed(2),
//         purchase_order_status: purchaseOrder.status,
//         payments_count: payments.length,
//       },
//     });
//   } catch (error) {
//     console.error("Payment Summary Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment summary",
//       error: error.message,
//     });
//   }
// };




const { Op } = require("sequelize");
const path = require("path");
const PurchaseOrderInvoice = require("../models/purchase_order_invoice.model");
const PurchaseOrder = require("../models/purchase_order.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  // Employee link
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });
  if (emp?.created_by) return emp.created_by;

  // Accountant or sub-user linked to company
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

exports.addPayment = async (req, res) => {
  try {
    const { po_number, payment_amount, cgst = 9, sgst = 9, igst = 0, gst_type = "Exclusive" } = req.body;

    if (!po_number || !payment_amount)
      return res.status(400).json({ success: false, message: "po_number and payment_amount are required" });

    const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
    if (!purchaseOrder)
      return res.status(404).json({ success: false, message: "Purchase Order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Branch access check
    if (emp) {
      const branch = await Branch.findOne({ where: { id: emp.branch_id } });
      if (!branch || branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "You don't have access to this branch PO" });
    } else {
      const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
      if (branch && branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "Access denied for this PO" });
    }

    // ===============================
    // Total base_amount paid so far
    // ===============================
    const totalPaidBase = (await PurchaseOrderInvoice.sum("base_amount", { where: { po_number } })) || 0;

    // Remaining base amount
    let remainingBase = parseFloat(purchaseOrder.total_amount) - totalPaidBase;
    if (remainingBase <= 0)
      return res.status(400).json({ success: false, message: "Purchase Order already paid in full" });

    // Prevent overpayment
    let base_amount = parseFloat(payment_amount);
    if (base_amount > remainingBase) base_amount = remainingBase;

    // ===============================
    // GST calculation
    // ===============================
    const gstRate = (parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100;
    let gst_amount = 0;
    let total_amount = 0;

    if (gst_type.toLowerCase() === "inclusive") {
      base_amount = base_amount / (1 + gstRate);
      gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
      total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
    } else {
      gst_amount = parseFloat((base_amount * gstRate).toFixed(2));
      total_amount = parseFloat((base_amount + gst_amount).toFixed(2));
    }

    base_amount = parseFloat(base_amount.toFixed(2));

    // ===============================
    // Remaining amount and status
    // ===============================
    let remaining_amount = parseFloat(purchaseOrder.total_amount) - (totalPaidBase + base_amount);
    if (remaining_amount < 0) remaining_amount = 0;
    remaining_amount = parseFloat(remaining_amount.toFixed(2));

    const status = remaining_amount === 0 ? "Paid" : "Pending";

    // ===============================
    // Save payment
    // ===============================
    const payment = await PurchaseOrderInvoice.create({
      po_number,
      payment_amount: parseFloat(payment_amount),
      cgst,
      sgst,
      igst,
      gst_amount,
      base_amount,
      total_amount,
      remaining_amount,
      status,
      gst_type,
      created_by: req.user?.id || null,
    });

    // Update PO status if fully paid
    if (remaining_amount === 0) await purchaseOrder.update({ status: "Received" });

    return res.status(201).json({
      success: true,
      message: `Payment (${gst_type}) recorded successfully`,
      data: payment,
    });

  } catch (error) {
    console.error("Add Payment Error:", error);
    return res.status(500).json({ success: false, message: "Failed to add payment", error: error.message });
  }
};


// =====================
// Get All Payments (Role Based)
// =====================
exports.getAllPayments = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};

    if (emp) {
      // Employee sees payments only for their branch
      const branch = await Branch.findOne({ where: { id: emp.branch_id }, attributes: ["id"] });
      if (!branch)
        return res.status(403).json({ success: false, message: "No access to any branch payments" });

      const poList = await PurchaseOrder.findAll({
        where: { branch_id: emp.branch_id },
        attributes: ["po_number"],
        raw: true,
      });
      where.po_number = { [Op.in]: poList.map((p) => p.po_number) };
    } else {
      // Company sees payments for all its branches
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      const poList = await PurchaseOrder.findAll({
        where: { branch_id: { [Op.in]: branches.map((b) => b.id) } },
        attributes: ["po_number"],
        raw: true,
      });
      where.po_number = { [Op.in]: poList.map((p) => p.po_number) };
    }

    const payments = await PurchaseOrderInvoice.findAll({
      where,
      include: [
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          attributes: ["id", "po_number", "vendor_name", "total_amount", "status", "branch_id"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: error.message });
  }
};

// =====================
// Get Payment By ID (Role Based)
// =====================
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await PurchaseOrderInvoice.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          attributes: ["id", "po_number", "vendor_name", "total_amount", "status", "branch_id"],
        },
      ],
    });

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
      if (!branch || branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error("Get Payment By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await PurchaseOrderInvoice.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
    });
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Branch access check
    if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
      if (!branch || branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    // ✅ Safe destructuring with defaults
    const {
      payment_amount = payment.payment_amount,
      cgst = payment.cgst,
      sgst = payment.sgst,
      igst = payment.igst,
      status = payment.status,
      gst_type = payment.gst_type || "Exclusive"
    } = req.body || {};

    const po_number = payment.po_number;
    const po_total = parseFloat(payment.purchaseOrder.total_amount);

    // ===============================
    // Get ALL invoices for this PO (sorted by creation date)
    // ===============================
    const allInvoices = await PurchaseOrderInvoice.findAll({
      where: { po_number },
      order: [['created_at', 'ASC']]
    });

    // ===============================
    // Calculate cumulative paid amount
    // ===============================
    let cumulativePaid = 0;
    const updatedInvoices = [];

    for (const invoice of allInvoices) {
      let invoiceBaseAmount;
      
      // If this is the invoice being updated, use new values
      if (invoice.id === payment.id) {
        // Calculate new base_amount with overpayment protection
        const remainingForThisInvoice = po_total - cumulativePaid;
        let calculatedBase = parseFloat(payment_amount);
        if (calculatedBase > remainingForThisInvoice) {
          calculatedBase = remainingForThisInvoice;
        }

        // GST calculation
        const new_cgst = parseFloat(cgst);
        const new_sgst = parseFloat(sgst);
        const new_igst = parseFloat(igst);
        const gstRate = (new_cgst + new_sgst + new_igst) / 100;

        let gst_amount = 0;
        let total_amount = 0;

        if (gst_type.toLowerCase() === "inclusive") {
          invoiceBaseAmount = calculatedBase / (1 + gstRate);
          gst_amount = parseFloat((invoiceBaseAmount * gstRate).toFixed(2));
          total_amount = parseFloat((invoiceBaseAmount + gst_amount).toFixed(2));
        } else {
          invoiceBaseAmount = calculatedBase;
          gst_amount = parseFloat((invoiceBaseAmount * gstRate).toFixed(2));
          total_amount = parseFloat((invoiceBaseAmount + gst_amount).toFixed(2));
        }
        
        invoiceBaseAmount = parseFloat(invoiceBaseAmount.toFixed(2));
        
        // Update this invoice
        await invoice.update({
          payment_amount: parseFloat(payment_amount),
          cgst: new_cgst,
          sgst: new_sgst,
          igst: new_igst,
          gst_amount,
          base_amount: invoiceBaseAmount,
          total_amount,
          remaining_amount: 0, // Will be recalculated after loop
          status: status || invoice.status,
          gst_type,
        });
      } else {
        invoiceBaseAmount = parseFloat(invoice.base_amount);
      }

      cumulativePaid += invoiceBaseAmount;
      
      // Store for second pass to update remaining_amount
      updatedInvoices.push({
        id: invoice.id,
        base_amount: invoiceBaseAmount,
        invoice
      });
    }

    // ===============================
    // Update remaining_amount for ALL invoices
    // ===============================
    let runningPaid = 0;
    
    for (let i = 0; i < updatedInvoices.length; i++) {
      const { id, base_amount, invoice } = updatedInvoices[i];
      
      runningPaid += base_amount;
      const remaining_amount = po_total - runningPaid;
      const finalRemaining = Math.max(0, parseFloat(remaining_amount.toFixed(2)));
      
      // Determine status for this invoice
      let invoiceStatus = invoice.status;
      if (i === updatedInvoices.length - 1) {
        // Last invoice
        invoiceStatus = finalRemaining === 0 ? "Paid" : "Pending";
      } else {
        // Not last invoice - status should remain as is unless overpaid
        if (finalRemaining === 0) {
          invoiceStatus = "Paid";
        }
        // Don't change from Paid to Pending automatically
      }

      // Update remaining_amount and status if needed
      await invoice.update({
        remaining_amount: finalRemaining,
        ...(invoice.id === payment.id ? {} : { status: invoiceStatus })
      });
    }

    // Update PO status if fully paid
    const finalRemaining = po_total - cumulativePaid;
    if (finalRemaining <= 0) {
      await payment.purchaseOrder.update({ status: "Received" });
    }

    // Fetch updated payment
    const updatedPayment = await PurchaseOrderInvoice.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: "purchaseOrder" }],
    });

    return res.json({
      success: true,
      message: `Payment (${gst_type}) updated successfully`,
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update payment", error: error.message });
  }
};



// =====================
// Delete Payment (Role Based)
// =====================
exports.deletePayment = async (req, res) => {
  try {
    const payment = await PurchaseOrderInvoice.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: "purchaseOrder", attributes: ["branch_id"] }],
    });
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    if (emp && payment.purchaseOrder.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branch = await Branch.findOne({ where: { id: payment.purchaseOrder.branch_id } });
      if (!branch || branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    await payment.destroy();
    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete payment", error: error.message });
  }
};


exports.getPaymentSummary = async (req, res) => {
  try {
    const { po_number } = req.params;

    const purchaseOrder = await PurchaseOrder.findOne({ where: { po_number } });
    if (!purchaseOrder)
      return res.status(404).json({ success: false, message: "Purchase Order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Branch-based access check
    if (emp && purchaseOrder.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branch = await Branch.findOne({ where: { id: purchaseOrder.branch_id } });
      if (!branch || branch.created_by !== companyId)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    const payments = await PurchaseOrderInvoice.findAll({ where: { po_number } });

    const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount || 0), 0);
    const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);
    const totalPaid = totalBasePaid + totalGST;

    const remainingBalance = Math.max(0, purchaseOrder.total_amount - totalPaid);

    res.json({
      success: true,
      data: {
        po_number,
        total_base_paid: +totalBasePaid.toFixed(2),
        total_gst_paid: +totalGST.toFixed(2),
        total_paid: +totalPaid.toFixed(2),
        remaining_balance: +remainingBalance.toFixed(2),
        purchase_order_status: purchaseOrder.status,
        payments_count: payments.length,
      },
    });
  } catch (error) {
    console.error("Payment Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment summary",
      error: error.message,
    });
  }
};

