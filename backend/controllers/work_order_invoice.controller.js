// const { Op } = require("sequelize");
// const WorkOrderInvoice = require("../models/work_order_invoice.model");
// const WorkOrder = require("../models/workOrder.model");
// const Employee = require("../models/employee.model");
// const User = require("../models/user.model");
// const Branch = require("../models/branch.model");

// // ================================
// // HELPERS
// // ================================
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
//   return emp; // null if not branch-based
// }

// // ================================
// // ADD PAYMENT
// // ================================
// // exports.addPayment = async (req, res) => {
// //   try {
// //     const { wo_number, payment_amount, cgst = 9, sgst = 9, igst = 0 } = req.body;
// //     if (!wo_number || !payment_amount) {
// //       return res.status(400).json({ success: false, message: "wo_number and payment_amount are required" });
// //     }

// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     // Work order permission check
// //     let woWhere = { wo_number };
// //     if (emp) woWhere.assigned_to = emp.branch_id;
// //     else {
// //       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
// //       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
// //     }

// //     const workOrder = await WorkOrder.findOne({ where: woWhere });
// //     if (!workOrder) return res.status(403).json({ success: false, message: "Unauthorized to access this work order" });

// //     // Prevent overpayment
// //     const totalPaid = await WorkOrderInvoice.sum("base_amount", { where: { wo_number } }) || 0;
// //     if (parseFloat(workOrder.amount) <= totalPaid) {
// //       return res.status(400).json({ success: false, message: "Work order already paid in full" });
// //     }

// //     const base_amount = parseFloat(payment_amount);
// //     const gst_amount = base_amount * ((parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100);
// //     const total_amount = base_amount + gst_amount;

// //     let remaining_amount = parseFloat(workOrder.amount) - (totalPaid + base_amount);
// //     if (remaining_amount < 0) remaining_amount = 0;

// //     const status = remaining_amount === 0 ? "paid" : "pending";

// //     const payment = await WorkOrderInvoice.create({
// //       wo_number,
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

// //     if (remaining_amount === 0) await workOrder.update({ status: "paid" });

// //     res.status(201).json({ success: true, message: "Payment recorded successfully", data: payment });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Failed to add payment", error: err.message });
// //   }
// // };
// // exports.addPayment = async (req, res) => {
// //   try {
// //     const { wo_number, payment_amount, cgst = 9, sgst = 9, igst = 0, gst_type = "Exclusive" } = req.body;
// //     if (!wo_number || !payment_amount) {
// //       return res.status(400).json({ success: false, message: "wo_number and payment_amount are required" });
// //     }

// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     let woWhere = { wo_number };
// //     if (emp) woWhere.assigned_to = emp.branch_id;
// //     else {
// //       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
// //       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
// //     }

// //     const workOrder = await WorkOrder.findOne({ where: woWhere });
// //     if (!workOrder) return res.status(403).json({ success: false, message: "Unauthorized to access this work order" });

// //     const totalPaid = await WorkOrderInvoice.sum("base_amount", { where: { wo_number } }) || 0;
// //     if (parseFloat(workOrder.amount) <= totalPaid) {
// //       return res.status(400).json({ success: false, message: "Work order already paid in full" });
// //     }

// //     let base_amount = parseFloat(payment_amount);
// //     let gst_amount = 0;
// //     let total_amount = 0;

// //     if (gst_type === "Exclusive") {
// //       gst_amount = base_amount * ((parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100);
// //       total_amount = base_amount + gst_amount;
// //     } else { // Inclusive
// //       total_amount = base_amount;
// //       base_amount = total_amount / (1 + (parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst)) / 100);
// //       gst_amount = total_amount - base_amount;
// //     }

// //     // Round off
// //     base_amount = parseFloat(base_amount.toFixed(2));
// //     gst_amount = parseFloat(gst_amount.toFixed(2));
// //     total_amount = parseFloat(total_amount.toFixed(2));

// //     let remaining_amount = parseFloat(workOrder.amount) - (totalPaid + base_amount);
// //     if (remaining_amount < 0) remaining_amount = 0;
// //     const status = remaining_amount === 0 ? "paid" : "pending";

// //     const payment = await WorkOrderInvoice.create({
// //       wo_number,
// //       payment_amount: total_amount,
// //       cgst,
// //       sgst,
// //       igst,
// //       gst_amount,
// //       base_amount,
// //       total_amount,
// //       remaining_amount,
// //       status,
// //       gst_type,
// //       created_by: req.user?.id || null,
// //     });

// //     if (remaining_amount === 0) await workOrder.update({ status: "paid" });

// //     res.status(201).json({ success: true, message: "Payment recorded successfully", data: payment });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Failed to add payment", error: err.message });
// //   }
// // };
// // exports.addPayment = async (req, res) => {
// //   try {
// //     const {
// //       wo_number,
// //       payment_amount,
// //       cgst = 9,
// //       sgst = 9,
// //       igst = 0,
// //       gst_type = "Exclusive", // can be Exclusive or Inclusive
// //     } = req.body;

// //     if (!wo_number || !payment_amount) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "wo_number and payment_amount are required",
// //       });
// //     }

// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     let woWhere = { wo_number };
// //     if (emp) {
// //       woWhere.assigned_to = emp.branch_id;
// //     } else {
// //       const branches = await Branch.findAll({
// //         where: { created_by: companyId },
// //         attributes: ["id"],
// //         raw: true,
// //       });
// //       woWhere.assigned_to = { [Op.in]: branches.map((b) => b.id) };
// //     }

// //     const workOrder = await WorkOrder.findOne({ where: woWhere });
// //     if (!workOrder) {
// //       return res.status(403).json({
// //         success: false,
// //         message: "Unauthorized to access this work order",
// //       });
// //     }

// //     // Get total paid so far
// //     const totalPaid =
// //       (await WorkOrderInvoice.sum("total_amount", { where: { wo_number } })) || 0;

// //     if (parseFloat(workOrder.amount) <= totalPaid) {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Work order already paid in full" });
// //     }

// //     // ============================================
// //     // GST Logic (Handles both Exclusive & Inclusive)
// //     // ============================================
// //     const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
// //     let base_amount = parseFloat(payment_amount);
// //     let gst_amount = 0;
// //     let total_amount = 0;

// //     if (gst_type.toLowerCase() === "exclusive") {
// //       // ✅ Exclusive GST
// //       gst_amount = base_amount * (gstRate / 100);
// //       total_amount = base_amount + gst_amount;
// //     } else {
// //       // ✅ Inclusive GST
// //       total_amount = base_amount;
// //       base_amount = total_amount / (1 + gstRate / 100);
// //       gst_amount = total_amount - base_amount;
// //     }

// //     // Round values
// //     base_amount = parseFloat(base_amount.toFixed(2));
// //     gst_amount = parseFloat(gst_amount.toFixed(2));
// //     total_amount = parseFloat(total_amount.toFixed(2));

// //     // // ============================================
// //     // // Remaining amount logic
// //     // // ============================================
// //     // let remaining_amount =
// //     //   parseFloat(workOrder.amount) - (totalPaid + total_amount);
// //     // if (remaining_amount < 0) remaining_amount = 0;

// //     // const status = remaining_amount === 0 ? "paid" : "pending";
// //     // ============================================
// // // Remaining amount logic (use base_amount, not total_amount)
// // // ============================================
// // let remaining_amount = parseFloat(workOrder.amount) - (totalPaid + base_amount);
// // if (remaining_amount < 0) remaining_amount = 0;

// // const status = remaining_amount === 0 ? "paid" : "pending";


// //     // ============================================
// //     // Save payment entry
// //     // ============================================
// //     const payment = await WorkOrderInvoice.create({
// //       wo_number,
// //       payment_amount,
// //       cgst,
// //       sgst,
// //       igst,
// //       gst_amount,
// //       base_amount,
// //       total_amount,
// //       remaining_amount,
// //       status,
// //       gst_type,
// //       created_by: req.user?.id || null,
// //     });

// //     // Update WO status if fully paid
// //     if (remaining_amount === 0) await workOrder.update({ status: "paid" });

// //     // ============================================
// //     // Response
// //     // ============================================
// //     return res.status(201).json({
// //       success: true,
// //       message: `${gst_type} GST payment recorded successfully`,
// //       data: {
// //         payment,
// //         gst_details: {
// //           type: gst_type,
// //           base_amount,
// //           gst_amount,
// //           total_amount,
// //           remaining_amount,
// //         },
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Error adding payment:", err);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to add payment",
// //       error: err.message,
// //     });
// //   }
// // };

// exports.addPayment = async (req, res) => {
//   try {
//     const {
//       wo_number,
//       payment_amount,
//       cgst = 9,
//       sgst = 9,
//       igst = 0,
//       gst_type = "Exclusive", // can be Exclusive or Inclusive
//     } = req.body;

//     if (!wo_number || !payment_amount) {
//       return res.status(400).json({
//         success: false,
//         message: "wo_number and payment_amount are required",
//       });
//     }

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = { wo_number };
//     if (emp) {
//       woWhere.assigned_to = emp.branch_id;
//     } else {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });
//       woWhere.assigned_to = { [Op.in]: branches.map((b) => b.id) };
//     }

//     const workOrder = await WorkOrder.findOne({ where: woWhere });
//     if (!workOrder) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized to access this work order",
//       });
//     }

//     // ================================
//     // Get total base_amount paid so far
//     // ================================
//     const totalPaidBase =
//       (await WorkOrderInvoice.sum("base_amount", { where: { wo_number } })) || 0;

//     if (parseFloat(workOrder.amount) <= totalPaidBase) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Work order already paid in full" });
//     }

//     // ============================================
//     // GST Logic (Handles both Exclusive & Inclusive)
//     // ============================================
//     const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
//     let base_amount = parseFloat(payment_amount);
//     let gst_amount = 0;
//     let total_amount = 0;

//     if (gst_type.toLowerCase() === "exclusive") {
//       // ✅ Exclusive GST
//       gst_amount = base_amount * (gstRate / 100);
//       total_amount = base_amount + gst_amount;
//     } else {
//       // ✅ Inclusive GST
//       total_amount = base_amount;
//       base_amount = total_amount / (1 + gstRate / 100);
//       gst_amount = total_amount - base_amount;
//     }

//     // Round values
//     base_amount = parseFloat(base_amount.toFixed(2));
//     gst_amount = parseFloat(gst_amount.toFixed(2));
//     total_amount = parseFloat(total_amount.toFixed(2));

//     // ============================================
//     // Remaining amount logic (use base_amount only)
//     // ============================================
//     let remaining_amount = parseFloat(workOrder.amount) - (totalPaidBase + base_amount);
//     if (remaining_amount < 0) remaining_amount = 0;

//     const status = remaining_amount === 0 ? "paid" : "pending";

//     // ============================================
//     // Save payment entry
//     // ============================================
//     const payment = await WorkOrderInvoice.create({
//       wo_number,
//       payment_amount,
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

//     // Update WO status if fully paid
//     if (remaining_amount === 0) await workOrder.update({ status: "paid" });

//     // ============================================
//     // Response
//     // ============================================
//     return res.status(201).json({
//       success: true,
//       message: `${gst_type} GST payment recorded successfully`,
//       data: {
//         payment,
//         gst_details: {
//           type: gst_type,
//           base_amount,
//           gst_amount,
//           total_amount,
//           remaining_amount,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Error adding payment:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to add payment",
//       error: err.message,
//     });
//   }
// };



// exports.getAllPayments = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const payments = await WorkOrderInvoice.findAll({
//       include: [{
//         model: WorkOrder,
//         as: "workOrder",
//         attributes: ["id", "wo_number", "title", "amount", "status"],
//         where: woWhere
//       }],
//       order: [["id", "ASC"]],
//     });

//     res.json({ success: true, data: payments });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
//   }
// };


// exports.getPaymentById = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const payment = await WorkOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [{
//         model: WorkOrder,
//         as: "workOrder",
//         attributes: ["id", "wo_number", "title", "amount", "status"],
//         where: woWhere
//       }]
//     });

//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found or unauthorized" });

//     res.json({ success: true, data: payment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to fetch payment", error: err.message });
//   }
// };



// // exports.updatePayment = async (req, res) => {
// //   try {
// //     const emp = await getUserBranch(req);
// //     const companyId = await getCompanyId(req);

// //     // Accessible branches
// //     let woWhere = {};
// //     if (emp) {
// //       woWhere.assigned_to = emp.branch_id;
// //     } else {
// //       const branches = await Branch.findAll({
// //         where: { created_by: companyId },
// //         attributes: ["id"],
// //         raw: true,
// //       });
// //       woWhere.assigned_to = { [Op.in]: branches.map((b) => b.id) };
// //     }

// //     // Find payment
// //     const payment = await WorkOrderInvoice.findOne({
// //       where: { id: req.params.id },
// //       include: [{ model: WorkOrder, as: "workOrder", where: woWhere }],
// //     });

// //     if (!payment)
// //       return res.status(404).json({
// //         success: false,
// //         message: "Payment not found or unauthorized",
// //       });

// //     const {
// //       payment_amount,
// //       cgst,
// //       sgst,
// //       igst,
// //       status,
// //       gst_type,
// //     } = req.body;

// //     const finalGstType = (gst_type || payment.gst_type || "Exclusive").toLowerCase();
// //     const finalCgst = parseFloat(cgst ?? payment.cgst);
// //     const finalSgst = parseFloat(sgst ?? payment.sgst);
// //     const finalIgst = parseFloat(igst ?? payment.igst);
// //     const gstRate = finalCgst + finalSgst + finalIgst;

// //     // ===============================
// //     // Base amount to update
// //     // ===============================
// //     let base_amount = parseFloat(payment_amount ?? payment.payment_amount);

// //     // ===============================
// //     // Sum of base_amount of all other payments
// //     // ===============================
// //     const wo_number = payment.wo_number;
// //     const workOrder = payment.workOrder;

// //     const totalPaidBeforeUpdate =
// //       (await WorkOrderInvoice.sum("base_amount", {
// //         where: { wo_number, id: { [Op.ne]: payment.id } },
// //       })) || 0;

// //     // ===============================
// //     // Overpayment protection
// //     // ===============================
// //     const maxAllowed = workOrder.amount - totalPaidBeforeUpdate;
// //     if (base_amount > maxAllowed) base_amount = maxAllowed;

// //     // ===============================
// //     // GST Calculation
// //     // ===============================
// //     let gst_amount = 0;
// //     let total_amount = 0;

// //     if (finalGstType === "exclusive") {
// //       gst_amount = base_amount * (gstRate / 100);
// //       total_amount = base_amount + gst_amount;
// //     } else {
// //       total_amount = base_amount;
// //       base_amount = total_amount / (1 + gstRate / 100);
// //       gst_amount = total_amount - base_amount;
// //     }

// //     // Round values
// //     base_amount = parseFloat(base_amount.toFixed(2));
// //     gst_amount = parseFloat(gst_amount.toFixed(2));
// //     total_amount = parseFloat(total_amount.toFixed(2));

// //     // ===============================
// //     // Remaining & Status Logic
// //     // ===============================
// //     let remaining_amount = parseFloat(workOrder.amount) - (totalPaidBeforeUpdate + base_amount);
// //     if (remaining_amount < 0) remaining_amount = 0;

// //     let finalStatus = status || (remaining_amount === 0 ? "paid" : "pending");
// //     if (!["paid", "pending"].includes(finalStatus.toLowerCase())) {
// //       finalStatus = "pending";
// //     }

// //     // ===============================
// //     // Update payment record
// //     // ===============================
// //     await payment.update({
// //       payment_amount,
// //       cgst: finalCgst,
// //       sgst: finalSgst,
// //       igst: finalIgst,
// //       gst_amount,
// //       base_amount,
// //       total_amount,
// //       remaining_amount,
// //       status: finalStatus,
// //       gst_type: gst_type || payment.gst_type,
// //     });

// //     // Update work order status if fully paid
// //     await workOrder.update({ status: finalStatus });

// //     return res.json({
// //       success: true,
// //       message: `${gst_type || payment.gst_type} GST payment updated successfully`,
// //       data: {
// //         payment,
// //         gst_details: {
// //           type: gst_type || payment.gst_type,
// //           base_amount,
// //           gst_amount,
// //           total_amount,
// //           remaining_amount,
// //           status: finalStatus,
// //         },
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Error updating payment:", err);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to update payment",
// //       error: err.message,
// //     });
// //   }
// // };

// exports.updatePayment = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const payment = await WorkOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [{ model: WorkOrder, as: "workOrder", where: woWhere }]
//     });

//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found or unauthorized" });

//     const { payment_amount, cgst, sgst, igst, status } = req.body;
//     let base_amount = parseFloat(payment_amount || payment.payment_amount);
//     const gstPercent = parseFloat(cgst ?? payment.cgst) + parseFloat(sgst ?? payment.sgst) + parseFloat(igst ?? payment.igst);
//     const gst_amount = (base_amount * gstPercent) / 100;
//     const total_amount = base_amount + gst_amount;

//     await payment.update({ payment_amount: base_amount, cgst, sgst, igst, gst_amount, total_amount, status: status || payment.status });
//     res.json({ success: true, message: "Payment updated successfully", data: payment });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to update payment", error: err.message });
//   }
// };



// exports.deletePayment = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const payment = await WorkOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [{ model: WorkOrder, as: "workOrder", where: woWhere }]
//     });

//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found or unauthorized" });

//     await payment.destroy();
//     res.json({ success: true, message: "Payment deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to delete payment", error: err.message });
//   }
// };


// exports.getPaymentSummary = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);
//     const { wo_number } = req.params;

//     let woWhere = { wo_number };
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const workOrder = await WorkOrder.findOne({ where: woWhere });
//     if (!workOrder) return res.status(403).json({ success: false, message: "Unauthorized to access this work order" });

//     const payments = await WorkOrderInvoice.findAll({ where: { wo_number } });
//     const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount), 0);
//     const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);

//     res.json({
//       success: true,
//       data: {
//         wo_number,
//         total_base_paid: totalBasePaid,
//         total_gst_paid: totalGST,
//         total_paid: totalBasePaid + totalGST,
//         remaining_balance: Math.max(0, workOrder.amount - totalBasePaid),
//         work_order_status: workOrder.status,
//         payments_count: payments.length
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to fetch payment summary", error: err.message });
//   }
// };





const { Op } = require("sequelize");
const WorkOrderInvoice = require("../models/work_order_invoice.model");
const WorkOrder = require("../models/workOrder.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const Branch = require("../models/branch.model");

// ================================
// HELPERS
// ================================
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
  return emp; // null if not branch-based
}

// exports.addPayment = async (req, res) => {
//   try {
//     const {
//       wo_number,
//       payment_amount,
//       cgst = 9,
//       sgst = 9,
//       igst = 0,
//       gst_type = "Exclusive", // can be Exclusive or Inclusive
//     } = req.body;

//     if (!wo_number || !payment_amount) {
//       return res.status(400).json({
//         success: false,
//         message: "wo_number and payment_amount are required",
//       });
//     }

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = { wo_number };
//     if (emp) {
//       woWhere.assigned_to = emp.branch_id;
//     } else {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });
//       woWhere.assigned_to = { [Op.in]: branches.map((b) => b.id) };
//     }

//     const workOrder = await WorkOrder.findOne({ where: woWhere });
//     if (!workOrder) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized to access this work order",
//       });
//     }

//     const totalPaidBase =
//       (await WorkOrderInvoice.sum("base_amount", { where: { wo_number } })) || 0;

//     if (parseFloat(workOrder.amount) <= totalPaidBase) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Work order already paid in full" });
//     }

//     // ============================================
//     // GST Logic (Handles both Exclusive & Inclusive)
//     // ============================================
//     const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
//     let base_amount = parseFloat(payment_amount);
//     let gst_amount = 0;
//     let total_amount = 0;

//     if (gst_type.toLowerCase() === "exclusive") {
//       // ✅ Exclusive GST
//       gst_amount = base_amount * (gstRate / 100);
//       total_amount = base_amount + gst_amount;
//     } else {
//       // ✅ Inclusive GST
//       total_amount = base_amount;
//       base_amount = total_amount / (1 + gstRate / 100);
//       gst_amount = total_amount - base_amount;
//     }

//     // Round values
//     base_amount = parseFloat(base_amount.toFixed(2));
//     gst_amount = parseFloat(gst_amount.toFixed(2));
//     total_amount = parseFloat(total_amount.toFixed(2));

//     // ============================================
//     // Remaining amount logic (use base_amount only)
//     // ============================================
//     let remaining_amount = parseFloat(workOrder.amount) - (totalPaidBase + base_amount);
//     if (remaining_amount < 0) remaining_amount = 0;

//     const status = remaining_amount === 0 ? "paid" : "pending";

//     // ============================================
//     // Save payment entry
//     // ============================================
//     const payment = await WorkOrderInvoice.create({
//       wo_number,
//       payment_amount,
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

//     // Update WO status if fully paid
//     if (remaining_amount === 0) await workOrder.update({ status: "paid" });

//     // ============================================
//     // Response
//     // ============================================
//     return res.status(201).json({
//       success: true,
//       message: `${gst_type} GST payment recorded successfully`,
//       data: {
//         payment,
//         gst_details: {
//           type: gst_type,
//           base_amount,
//           gst_amount,
//           total_amount,
//           remaining_amount,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Error adding payment:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to add payment",
//       error: err.message,
//     });
//   }
// };

exports.addPayment = async (req, res) => {
  try {
    const {
      wo_number,
      payment_amount,
      cgst = 9,
      sgst = 9,
      igst = 0,
      gst_type = "Exclusive", // Exclusive | Inclusive
    } = req.body;

    if (!wo_number || !payment_amount) {
      return res.status(400).json({
        success: false,
        message: "wo_number and payment_amount are required",
      });
    }

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // =========================
    // Work order access control
    // =========================
    let woWhere = { wo_number };
    if (emp) {
      woWhere.assigned_to = emp.branch_id;
    } else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const workOrder = await WorkOrder.findOne({ where: woWhere });
    if (!workOrder) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this work order",
      });
    }

    // ============================================
    // GST calculation
    // ============================================
    const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
    let base_amount = parseFloat(payment_amount);
    let gst_amount = 0;
    let total_amount = 0;

    if (gst_type.toLowerCase() === "exclusive") {
      gst_amount = base_amount * (gstRate / 100);
      total_amount = base_amount + gst_amount;
    } else {
      total_amount = base_amount;
      base_amount = total_amount / (1 + gstRate / 100);
      gst_amount = total_amount - base_amount;
    }

    base_amount = parseFloat(base_amount.toFixed(2));
    gst_amount = parseFloat(gst_amount.toFixed(2));
    total_amount = parseFloat(total_amount.toFixed(2));

    // ============================================
    // Get already invoiced base amount
    // ============================================
    const totalPaidBase =
      (await WorkOrderInvoice.sum("base_amount", { where: { wo_number } })) || 0;

    const newTotalInvoiced = totalPaidBase + base_amount;

    // Remaining (UI only)
    let remaining_amount =
      parseFloat(workOrder.work_order_amount) - newTotalInvoiced;
    if (remaining_amount < 0) remaining_amount = 0;

    // Excess calculation (KEY POINT)
    let excess_amount = 0;
    if (newTotalInvoiced > parseFloat(workOrder.work_order_amount)) {
      excess_amount =
        newTotalInvoiced - parseFloat(workOrder.work_order_amount);
    }

    // const status = remaining_amount === 0 ? "paid" : "pending";
    // Invoice status should ALWAYS start as pending
const status = "pending";


    // ============================================
    // Create invoice entry
    // ============================================
    const payment = await WorkOrderInvoice.create({
      wo_number,
      payment_amount,
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

    // ============================================
    // Update work order totals
    // ============================================
    await workOrder.update({
      total_invoiced_amount: newTotalInvoiced,
      excess_amount: excess_amount,
    //   status: remaining_amount === 0 ? "Paid" : workOrder.status,
    });

    // ============================================
    // Response
    // ============================================
    return res.status(201).json({
      success: true,
      message: `${gst_type} GST payment recorded successfully`,
      data: {
        payment,
        summary: {
          work_order_amount: workOrder.work_order_amount,
          total_invoiced_amount: newTotalInvoiced,
          remaining_amount,
          excess_amount,
        },
      },
    });
  } catch (err) {
    console.error("Error adding payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add payment",
      error: err.message,
    });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let woWhere = {};
    if (emp) woWhere.assigned_to = emp.branch_id;
    else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const payments = await WorkOrderInvoice.findAll({
      include: [{
        model: WorkOrder,
        as: "workOrder",
        // attributes: ["id", "wo_number", "title", "amount", "status"],
        attributes: ["id", "wo_number", "title", "work_order_amount","excess_amount", "status"],
        where: woWhere
      }],
      order: [["id", "ASC"]],
    });

    res.json({ success: true, data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
  }
};


exports.getPaymentById = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let woWhere = {};
    if (emp) woWhere.assigned_to = emp.branch_id;
    else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const payment = await WorkOrderInvoice.findOne({
      where: { id: req.params.id },
      include: [{
        model: WorkOrder,
        as: "workOrder",
        // attributes: ["id", "wo_number", "title", "amount", "status"],
        attributes: ["id", "wo_number", "title", "work_order_amount", "status"],

        where: woWhere
      }]
    });

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found or unauthorized" });

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch payment", error: err.message });
  }
};

// exports.updatePayment = async (req, res) => {
//   try {
//     const {
//       payment_amount,
//       cgst = 9,
//       sgst = 9,
//       igst = 0,
//       gst_type = "Exclusive",
//       status
//     } = req.body;

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ["id"],
//         raw: true,
//       });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     // Find the payment with associated work order
//     const payment = await WorkOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [{ model: WorkOrder, as: "workOrder", where: woWhere }]
//     });

//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found or unauthorized"
//       });
//     }

//     const workOrder = payment.workOrder;
//     const wo_number = payment.wo_number;

//     // ============================================
//     // GST calculation (same logic as create)
//     // ============================================
//     const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
//     let base_amount = parseFloat(payment_amount || payment.payment_amount);
//     let gst_amount = 0;
//     let total_amount = 0;

//     if (gst_type.toLowerCase() === "exclusive") {
//       gst_amount = base_amount * (gstRate / 100);
//       total_amount = base_amount + gst_amount;
//     } else {
//       total_amount = base_amount;
//       base_amount = total_amount / (1 + gstRate / 100);
//       gst_amount = total_amount - base_amount;
//     }

//     base_amount = parseFloat(base_amount.toFixed(2));
//     gst_amount = parseFloat(gst_amount.toFixed(2));
//     total_amount = parseFloat(total_amount.toFixed(2));

//     // ============================================
//     // Get all payments for this work order
//     // ============================================
//     const allPayments = await WorkOrderInvoice.findAll({
//       where: { wo_number },
//       raw: true
//     });

//     // Calculate total invoiced base amount excluding the old payment
//     let totalPaidBase = 0;
//     allPayments.forEach(p => {
//       if (p.id !== payment.id) {
//         totalPaidBase += parseFloat(p.base_amount);
//       }
//     });

//     // Add the new base amount
//     const newTotalInvoiced = totalPaidBase + base_amount;

//     // Calculate remaining amount
//     let remaining_amount = parseFloat(workOrder.work_order_amount) - newTotalInvoiced;
//     if (remaining_amount < 0) remaining_amount = 0;

//     // Calculate excess amount
//     let excess_amount = 0;
//     if (newTotalInvoiced > parseFloat(workOrder.work_order_amount)) {
//       excess_amount = newTotalInvoiced - parseFloat(workOrder.work_order_amount);
//     }

//     // Update payment status based on remaining amount
//     const paymentStatus = status || (remaining_amount === 0 ? "paid" : "pending");

//     // ============================================
//     // Update the payment
//     // ============================================
//     await payment.update({
//       payment_amount: parseFloat(payment_amount || payment.payment_amount),
//       cgst,
//       sgst,
//       igst,
//       gst_amount,
//       base_amount,
//       total_amount,
//       remaining_amount,
//       status: paymentStatus,
//       gst_type,
//       updated_by: req.user?.id || null,
//     });

//     // ============================================
//     // Update work order totals
//     // ============================================
//     await workOrder.update({
//       total_invoiced_amount: newTotalInvoiced,
//       excess_amount: excess_amount,
//       // Optionally update work order status
//       // status: remaining_amount === 0 ? "Paid" : workOrder.status,
//     });

//     // ============================================
//     // Response
//     // ============================================
//     return res.json({
//       success: true,
//       message: "Payment updated successfully",
//       data: {
//         payment: await payment.reload(),
//         summary: {
//           work_order_amount: workOrder.work_order_amount,
//           total_invoiced_amount: newTotalInvoiced,
//           remaining_amount,
//           excess_amount,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("Error updating payment:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update payment",
//       error: err.message,
//     });
//   }
// };
exports.updatePayment = async (req, res) => {
  try {
    const {
      payment_amount,
      cgst = 9,
      sgst = 9,
      igst = 0,
      gst_type = "Exclusive",
      status
    } = req.body;

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let woWhere = {};
    if (emp) woWhere.assigned_to = emp.branch_id;
    else {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    // Find the payment with associated work order
    const payment = await WorkOrderInvoice.findOne({
      where: { id: req.params.id },
      include: [{ model: WorkOrder, as: "workOrder", where: woWhere }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or unauthorized"
      });
    }

    const workOrder = payment.workOrder;
    const wo_number = payment.wo_number;

    // Check if amount is being changed
    const isAmountChanging = payment_amount && 
      parseFloat(payment_amount) !== parseFloat(payment.payment_amount);

    // ============================================
    // GST calculation (only if amount is changing)
    // ============================================
    let base_amount = parseFloat(payment.base_amount);
    let gst_amount = parseFloat(payment.gst_amount);
    let total_amount = parseFloat(payment.total_amount);
    
    if (isAmountChanging) {
      const gstRate = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
      base_amount = parseFloat(payment_amount);
      
      if (gst_type.toLowerCase() === "exclusive") {
        gst_amount = base_amount * (gstRate / 100);
        total_amount = base_amount + gst_amount;
      } else {
        total_amount = base_amount;
        base_amount = total_amount / (1 + gstRate / 100);
        gst_amount = total_amount - base_amount;
      }

      base_amount = parseFloat(base_amount.toFixed(2));
      gst_amount = parseFloat(gst_amount.toFixed(2));
      total_amount = parseFloat(total_amount.toFixed(2));
    }

    // ============================================
    // Get all payments for this work order
    // ============================================
    const allPayments = await WorkOrderInvoice.findAll({
      where: { wo_number },
      order: [['id', 'ASC']], // Important: order by creation
      raw: true
    });

    // If amount is changing, we need to recalculate ALL payments' remaining amounts
    let newTotalInvoiced = 0;
    let excess_amount = 0;
    
    if (isAmountChanging) {
      // Calculate total invoiced base amount excluding the old payment
      let totalPaidBase = 0;
      allPayments.forEach(p => {
        if (p.id !== payment.id) {
          totalPaidBase += parseFloat(p.base_amount);
        }
      });

      // Add the new base amount
      newTotalInvoiced = totalPaidBase + base_amount;

      // Calculate excess amount
      if (newTotalInvoiced > parseFloat(workOrder.work_order_amount)) {
        excess_amount = newTotalInvoiced - parseFloat(workOrder.work_order_amount);
      }
      
      // Recalculate ALL payments' remaining amounts in historical order
      let runningTotal = 0;
      const updatedPayments = [];
      
      for (const p of allPayments) {
        if (p.id === payment.id) {
          // Use the new amount for this payment
          runningTotal += base_amount;
        } else {
          runningTotal += parseFloat(p.base_amount);
        }
        
        const remaining = Math.max(0, parseFloat(workOrder.work_order_amount) - runningTotal);
        updatedPayments.push({
          id: p.id,
          remaining_amount: remaining
        });
      }
      
      // Update ALL payments' remaining amounts
      for (const p of updatedPayments) {
        await WorkOrderInvoice.update(
          { remaining_amount: p.remaining_amount },
          { where: { id: p.id } }
        );
      }
    } else {
      // If only status is changing, keep existing amounts
      newTotalInvoiced = allPayments.reduce((sum, p) => sum + parseFloat(p.base_amount), 0);
      
      // Recalculate excess based on current total
      if (newTotalInvoiced > parseFloat(workOrder.work_order_amount)) {
        excess_amount = newTotalInvoiced - parseFloat(workOrder.work_order_amount);
      }
    }

    // Calculate current remaining amount
    let current_remaining_amount = parseFloat(workOrder.work_order_amount) - newTotalInvoiced;
    if (current_remaining_amount < 0) current_remaining_amount = 0;

    // Update payment status (only if provided)
    const paymentStatus = status || payment.status;

    // ============================================
    // Update the payment (only change what's needed)
    // ============================================
    const updateData = {
      status: paymentStatus,
      updated_by: req.user?.id || null,
    };
    
    if (isAmountChanging) {
      updateData.payment_amount = parseFloat(payment_amount);
      updateData.cgst = cgst;
      updateData.sgst = sgst;
      updateData.igst = igst;
      updateData.gst_amount = gst_amount;
      updateData.base_amount = base_amount;
      updateData.total_amount = total_amount;
      updateData.gst_type = gst_type;
      // Note: remaining_amount is updated in the batch update above
    }
    
    await payment.update(updateData);

    // ============================================
    // Update work order totals
    // ============================================
    await workOrder.update({
      total_invoiced_amount: newTotalInvoiced,
      excess_amount: excess_amount,
      // Update work order status based on current remaining
    //   status: current_remaining_amount === 0 ? "Paid" : workOrder.status,
    });

    // ============================================
    // Response
    // ============================================
    return res.json({
      success: true,
      message: `Payment ${isAmountChanging ? 'amount and ' : ''}status updated successfully`,
      data: {
        payment: await payment.reload(),
        summary: {
          work_order_amount: workOrder.work_order_amount,
          total_invoiced_amount: newTotalInvoiced,
          current_remaining_amount: current_remaining_amount,
          excess_amount: excess_amount,
          work_order_status: workOrder.status,
        },
      },
    });
  } catch (err) {
    console.error("Error updating payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: err.message,
    });
  }
};


// exports.deletePayment = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     let woWhere = {};
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const payment = await WorkOrderInvoice.findOne({
//       where: { id: req.params.id },
//       include: [{ model: WorkOrder, as: "workOrder", where: woWhere }]
//     });

//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found or unauthorized" });

//     await payment.destroy();
//     res.json({ success: true, message: "Payment deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to delete payment", error: err.message });
//   }
// };


// exports.getPaymentSummary = async (req, res) => {
//   try {
//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);
//     const { wo_number } = req.params;

//     let woWhere = { wo_number };
//     if (emp) woWhere.assigned_to = emp.branch_id;
//     else {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
//     }

//     const workOrder = await WorkOrder.findOne({ where: woWhere });
//     if (!workOrder) return res.status(403).json({ success: false, message: "Unauthorized to access this work order" });

//     const payments = await WorkOrderInvoice.findAll({ where: { wo_number } });
//     const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount), 0);
//     const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);

//     res.json({
//       success: true,
//       data: {
//         wo_number,
//         total_base_paid: totalBasePaid,
//         total_gst_paid: totalGST,
//         total_paid: totalBasePaid + totalGST,
//         // remaining_balance: Math.max(0, workOrder.amount - totalBasePaid),
//         remaining_balance: Math.max(
//   0,
//   workOrder.work_order_amount - workOrder.total_invoiced_amount
// ),
// excess_amount: workOrder.excess_amount,

//         work_order_status: workOrder.status,
//         payments_count: payments.length
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to fetch payment summary", error: err.message });
//   }
// };


exports.deletePayment = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let woWhere = {};
    if (emp) woWhere.assigned_to = emp.branch_id;
    else {
      const branches = await Branch.findAll({ 
        where: { created_by: companyId }, 
        attributes: ["id"], 
        raw: true 
      });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    // Find the payment with associated work order
    const payment = await WorkOrderInvoice.findOne({
      where: { id: req.params.id },
      include: [{ 
        model: WorkOrder, 
        as: "workOrder", 
        where: woWhere 
      }]
    });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found or unauthorized" 
      });
    }

    const workOrder = payment.workOrder;
    const wo_number = payment.wo_number;
    
    // Store the base amount before deleting
    const deletedBaseAmount = parseFloat(payment.base_amount);

    // Delete the payment
    await payment.destroy();

    // ============================================
    // Recalculate work order totals after deletion
    // ============================================
    
    // Get all remaining payments for this work order
    const remainingPayments = await WorkOrderInvoice.findAll({
      where: { wo_number },
      raw: true
    });

    // Calculate new total invoiced amount
    let newTotalInvoiced = 0;
    remainingPayments.forEach(p => {
      newTotalInvoiced += parseFloat(p.base_amount);
    });

    // Calculate remaining amount
    let remaining_amount = parseFloat(workOrder.work_order_amount) - newTotalInvoiced;
    if (remaining_amount < 0) remaining_amount = 0;

    // Calculate excess amount
    let excess_amount = 0;
    if (newTotalInvoiced > parseFloat(workOrder.work_order_amount)) {
      excess_amount = newTotalInvoiced - parseFloat(workOrder.work_order_amount);
    }

    // Update work order with new totals
    await workOrder.update({
      total_invoiced_amount: newTotalInvoiced,
      excess_amount: excess_amount,
      // Update work order status if needed
      // status: remaining_amount === 0 ? "Paid" : workOrder.status,
    });

    return res.json({
      success: true,
      message: "Payment deleted successfully",
      data: {
        summary: {
          work_order_amount: workOrder.work_order_amount,
          total_invoiced_amount: newTotalInvoiced,
          remaining_amount: remaining_amount,
          excess_amount: excess_amount,
          deleted_amount: deletedBaseAmount
        }
      }
    });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete payment", 
      error: err.message 
    });
  }
};
exports.getPaymentSummary = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);
    const { wo_number } = req.params;

    let woWhere = { wo_number };
    if (emp) woWhere.assigned_to = emp.branch_id;
    else {
      const branches = await Branch.findAll({ 
        where: { created_by: companyId }, 
        attributes: ["id"], 
        raw: true 
      });
      woWhere.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const workOrder = await WorkOrder.findOne({ where: woWhere });
    if (!workOrder) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to access this work order" 
      });
    }

    // Get ALL payments (not deleted)
    const payments = await WorkOrderInvoice.findAll({ 
      where: { wo_number } 
    });
    
    // Calculate dynamically
    const totalBasePaid = payments.reduce((sum, p) => sum + parseFloat(p.base_amount || 0), 0);
    const totalGST = payments.reduce((sum, p) => sum + parseFloat(p.gst_amount || 0), 0);
    
    // Calculate remaining and excess dynamically
    const workOrderAmount = parseFloat(workOrder.work_order_amount || 0);
    const remaining_balance = Math.max(0, workOrderAmount - totalBasePaid);
    const excess_amount = totalBasePaid > workOrderAmount ? totalBasePaid - workOrderAmount : 0;

    // Update work order with dynamic calculations (optional but recommended)
    await workOrder.update({
      total_invoiced_amount: totalBasePaid,
      excess_amount: excess_amount
    });

    res.json({
      success: true,
      data: {
        wo_number,
        total_base_paid: totalBasePaid,
        total_gst_paid: totalGST,
        total_paid: totalBasePaid + totalGST,
        remaining_balance: remaining_balance,
        excess_amount: excess_amount,
        work_order_status: workOrder.status,
        payments_count: payments.length
      }
    });
  } catch (err) {
    console.error("Error in getPaymentSummary:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payment summary", 
      error: err.message 
    });
  }
};
