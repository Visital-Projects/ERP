
const { Op } = require("sequelize");
const path = require("path");
const WorkOrder = require("../models/workOrder.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const WorkOrderService = require("../models/workOrderService.model");
const Unit = require("../models/unit.model");

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
  return emp; // null if not branch-based
}

exports.createWorkOrder = async (req, res) => {
  try {
    if (!req.user?.id)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });

    const userId = req.user.id;
    let {
      wo_number,
      title,
      description,
      status,
      wo_type,
      issue_date,
      expected_date,
      assigned_to,
      priority,
      start_date,
      end_date,
      services = [], // ✅ may include unit_id instead of unit name
    } = req.body;

    // ✅ Automatically set status
    if (!title || !description || !issue_date) {
      status = "Draft";
    } else {
      status = "Open";
    }

    // ✅ Get branch if user is employee
    const emp = await getUserBranch(req);
    if (emp && status !== "Draft") assigned_to = emp.branch_id;

    // ✅ Check assigned branch validity
    if (status !== "Draft" && assigned_to) {
      const branch = await Branch.findOne({ where: { id: assigned_to } });
      if (!branch)
        return res
          .status(404)
          .json({ success: false, message: "Branch not found" });
    }

    // ✅ Handle file uploads
    let documentPaths = [];
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path
          .join("uploads", uploadFolder, file.filename)
          .replace(/\\/g, "/");
      });
    }

    // ✅ Parse services if JSON string
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        services = [];
      }
    }

    let totalAmount = 0;
    const serviceEntries = [];

    for (const s of services) {
      const qty = parseFloat(s.quantity) || 0;
      const rate = parseFloat(s.rate) || 0;
      const amount = qty * rate;
      totalAmount += amount;

      // ✅ Fetch unit name if unit_id provided
      let unitName = "No";
      if (s.unit_id) {
        const unit = await Unit.findByPk(s.unit_id, {
          attributes: ["name"],
        });
        if (unit) unitName = unit.name;
      }

      serviceEntries.push({
        service_code: s.service_code,
        description: s.description,
        unit: unitName,
        quantity: qty,
        rate: rate,
        amount,
      });
    }

    // ✅ Create Work Order
    const workOrder = await WorkOrder.create({
      wo_number,
      title: title || null,
      description: description || null,
      status,
      wo_type: wo_type || null,
    //   amount: totalAmount || 0,
    work_order_amount: totalAmount || 0,
    total_invoiced_amount: 0,
    excess_amount: 0,

      priority: priority || "Medium",
      assigned_to: assigned_to || null,
      created_by: userId,
      issue_date: issue_date || null,
      expected_date: expected_date || null,
      start_date: start_date || null,
      end_date: end_date || null,
      document: documentPaths.length ? documentPaths : null,
    });

    // ✅ Add related services
    if (serviceEntries.length > 0) {
      const serviceData = serviceEntries.map((s) => ({
        ...s,
        work_order_id: workOrder.id,
      }));
      await WorkOrderService.bulkCreate(serviceData);
    }

    // ✅ Calculate durations
    if (status !== "Draft") {
      if (workOrder.issue_date && workOrder.expected_date) {
        const diffMs =
          new Date(workOrder.expected_date) - new Date(workOrder.issue_date);
        workOrder.expected_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
      if (workOrder.start_date && workOrder.end_date) {
        const diffMs =
          new Date(workOrder.end_date) - new Date(workOrder.start_date);
        workOrder.actual_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
      await workOrder.save();
    }

    // ✅ Return final object with included services
    const createdWO = await WorkOrder.findByPk(workOrder.id, {
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: WorkOrderService,
          as: "services",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message:
        status === "Draft"
          ? "Work order saved as draft"
          : "Work order created successfully",
      data: createdWO,
    });
  } catch (err) {
    console.error("createWorkOrder failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create work order",
      error: err.message,
    });
  }
};

exports.getAllWorkOrders = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};

    if (emp) {
      where.assigned_to = emp.branch_id; // branch employee only sees their branch
    } else {
      // company or accountant: filter by all company branches
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      where.assigned_to = { [Op.in]: branches.map(b => b.id) };
    }

    const workOrders = await WorkOrder.findAll({
      where,
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: WorkOrderService,
          as: "services",
          attributes: ["id", "service_code", "description", "unit", "quantity", "rate", "amount"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: workOrders });
  } catch (err) {
    console.error("getAllWorkOrders failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch work orders",
      error: err.message,
    });
  }
};

exports.getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id, {
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: WorkOrderService,
          as: "services",
          attributes: ["id", "service_code", "description", "unit", "quantity", "rate", "amount"],
        },
      ],
    });

    if (!workOrder)
      return res.status(404).json({ success: false, message: "Work order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // permission check
    if (emp && workOrder.assigned_to !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      const allowedBranchIds = branches.map(b => b.id);
      if (!allowedBranchIds.includes(workOrder.assigned_to))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: workOrder });
  } catch (err) {
    console.error("getWorkOrderById failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch work order",
      error: err.message,
    });
  }
};


// exports.updateWorkOrder = async (req, res) => {
//   try {
//     const workOrder = await WorkOrder.findByPk(req.params.id);
//     if (!workOrder)
//       return res.status(404).json({ success: false, message: "Work order not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // ================= Permission Logic =================
//     if (workOrder.status !== "Draft") {
//       // Non-draft — enforce branch permissions
//       if (emp && workOrder.assigned_to !== emp.branch_id) {
//         return res.status(403).json({ success: false, message: "Access denied" });
//       }

//       if (!emp) {
//         const branches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         const allowedBranchIds = branches.map((b) => b.id);
//         if (!allowedBranchIds.includes(workOrder.assigned_to)) {
//           return res.status(403).json({ success: false, message: "Access denied" });
//         }
//       }
//     } else {
//       // Draft — allow update only by creator
//       if (req.user?.id && workOrder.created_by !== req.user.id) {
//         return res.status(403).json({ success: false, message: "Access denied" });
//       }
//     }

//     // ================= Handle File Uploads =================
//     let documentPaths = null;
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     // ================= Parse Services =================
//     let { services = [] } = req.body;

//     if (typeof services === "string") {
//       try {
//         services = JSON.parse(services);
//       } catch {
//         services = [];
//       }
//     }

//     // ================= Recalculate Total Amount =================
//     let totalAmount = 0;
//     const serviceEntries = [];

//     for (const s of services) {
//       const qty = parseFloat(s.quantity) || 0;
//       const rate = parseFloat(s.rate) || 0;
//       const amount = qty * rate;
//       totalAmount += amount;

//       let unitName = "No";
//       if (s.unit_id) {
//         const unit = await Unit.findByPk(s.unit_id, {
//           attributes: ["name"],
//         });
//         if (unit) unitName = unit.name;
//       }

//       serviceEntries.push({
//         service_code: s.service_code,
//         description: s.description,
//         unit: unitName,
//         quantity: qty,
//         rate: rate,
//         amount,
//       });
//     }

//     // ================= Update Core Fields =================
//     await workOrder.update({
//       ...req.body,
//       amount: totalAmount || workOrder.amount,
//       document: documentPaths !== null ? documentPaths : workOrder.document,
//     });

//     // ================= Replace Services (if provided) =================
//     if (services.length > 0) {
//       await WorkOrderService.destroy({ where: { work_order_id: workOrder.id } });
//       const newServices = serviceEntries.map((s) => ({
//         ...s,
//         work_order_id: workOrder.id,
//       }));
//       await WorkOrderService.bulkCreate(newServices);
//     }

//     // ================= Auto Calculate Duration =================
//     if (workOrder.issue_date && workOrder.expected_date) {
//       const diffMs = new Date(workOrder.expected_date) - new Date(workOrder.issue_date);
//       workOrder.expected_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
//     }

//     if (workOrder.start_date && workOrder.end_date) {
//       const diffMs = new Date(workOrder.end_date) - new Date(workOrder.start_date);
//       workOrder.actual_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
//     }

//     // ================= Auto Status Logic =================
//     const allRequiredPresent =
//       workOrder.title &&
//       workOrder.description &&
//       workOrder.issue_date &&
//       workOrder.assigned_to &&
//       workOrder.amount;

//     if (workOrder.status === "Draft" && allRequiredPresent) {
//       workOrder.status = "Open"; // move from Draft → Open automatically
//     }

//     await workOrder.save();

//     // ================= Return Updated Work Order =================
//     const updatedWO = await WorkOrder.findByPk(workOrder.id, {
//       include: [
//         {
//           model: Branch,
//           as: "assignedBranch",
//           attributes: ["id", "name", "branch_address", "contact_number"],
//         },
//         {
//           model: WorkOrderService,
//           as: "services",
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       message: "Work order updated successfully",
//       data: updatedWO,
//     });
//   } catch (err) {
//     console.error("updateWorkOrder failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update work order",
//       error: err.message,
//     });
//   }
// };

exports.updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id);
    if (!workOrder)
      return res.status(404).json({ success: false, message: "Work order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // ================= Permission Logic =================
    if (workOrder.status !== "Draft") {
      // Non-draft — enforce branch permissions
      if (emp && workOrder.assigned_to !== emp.branch_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      if (!emp) {
        const branches = await Branch.findAll({
          where: { created_by: companyId },
          attributes: ["id"],
          raw: true,
        });
        const allowedBranchIds = branches.map((b) => b.id);
        if (!allowedBranchIds.includes(workOrder.assigned_to)) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
    } else {
      // Draft — allow update only by creator
      if (req.user?.id && workOrder.created_by !== req.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    // ================= Handle File Uploads =================
    let documentPaths = null;
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }

    // ================= Parse Services =================
    let { services = [] } = req.body;

    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        services = [];
      }
    }

    // ================= Recalculate Total Amount =================
    let totalAmount = 0;
    const serviceEntries = [];

    for (const s of services) {
      const qty = parseFloat(s.quantity) || 0;
      const rate = parseFloat(s.rate) || 0;
      const amount = qty * rate;
      totalAmount += amount;

      let unitName = "No";
      if (s.unit_id) {
        const unit = await Unit.findByPk(s.unit_id, {
          attributes: ["name"],
        });
        if (unit) unitName = unit.name;
      }

      serviceEntries.push({
        service_code: s.service_code,
        description: s.description,
        unit: unitName,
        quantity: qty,
        rate: rate,
        amount,
      });
    }

    // ================= Calculate remaining and excess amounts =================
    // Get current total_invoiced_amount from work order
    const currentInvoicedAmount = parseFloat(workOrder.total_invoiced_amount) || 0;
    
    // Calculate remaining amount after update
    let remainingAmount = parseFloat(totalAmount) - currentInvoicedAmount;
    if (remainingAmount < 0) remainingAmount = 0;
    
    // Calculate excess amount
    let excessAmount = 0;
    if (currentInvoicedAmount > parseFloat(totalAmount)) {
      excessAmount = currentInvoicedAmount - parseFloat(totalAmount);
    }

    // ================= Update Core Fields =================
    await workOrder.update({
      ...req.body,
      work_order_amount: totalAmount || workOrder.work_order_amount,
      total_invoiced_amount: currentInvoicedAmount, // Keep current invoiced amount
      excess_amount: excessAmount,
      document: documentPaths !== null ? documentPaths : workOrder.document,
    });

    // ================= Replace Services (if provided) =================
    if (services.length > 0) {
      await WorkOrderService.destroy({ where: { work_order_id: workOrder.id } });
      const newServices = serviceEntries.map((s) => ({
        ...s,
        work_order_id: workOrder.id,
      }));
      await WorkOrderService.bulkCreate(newServices);
    }

    // ================= Auto Calculate Duration =================
    if (workOrder.issue_date && workOrder.expected_date) {
      const diffMs = new Date(workOrder.expected_date) - new Date(workOrder.issue_date);
      workOrder.expected_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    if (workOrder.start_date && workOrder.end_date) {
      const diffMs = new Date(workOrder.end_date) - new Date(workOrder.start_date);
      workOrder.actual_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    // ================= Auto Status Logic =================
    const allRequiredPresent =
      workOrder.title &&
      workOrder.description &&
      workOrder.issue_date &&
      workOrder.assigned_to &&
      workOrder.work_order_amount;

    if (workOrder.status === "Draft" && allRequiredPresent) {
      workOrder.status = "Open"; // move from Draft → Open automatically
    }

    await workOrder.save();

    // ================= Return Updated Work Order =================
    const updatedWO = await WorkOrder.findByPk(workOrder.id, {
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
        {
          model: WorkOrderService,
          as: "services",
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Work order updated successfully",
      data: updatedWO,
      summary: {
        work_order_amount: totalAmount,
        total_invoiced_amount: currentInvoicedAmount,
        remaining_amount: remainingAmount,
        excess_amount: excessAmount,
      }
    });
  } catch (err) {
    console.error("updateWorkOrder failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update work order",
      error: err.message,
    });
  }
};

// ================================
// SOFT DELETE WORK ORDER
// ================================
exports.deleteWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id);
    if (!workOrder) return res.status(404).json({ success: false, message: "Work order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // permission check
    if (emp && workOrder.assigned_to !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      const allowedBranchIds = branches.map(b => b.id);
      if (!allowedBranchIds.includes(workOrder.assigned_to))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    await workOrder.destroy(); // soft delete if paranoid:true
    res.status(200).json({ success: true, message: "Work order deleted" });
  } catch (err) {
    console.error("deleteWorkOrder failed:", err);
    res.status(500).json({ success: false, message: "Failed to delete work order", error: err.message });
  }
};



// GET /api/work-orders/draft
exports.getDraftWorkOrders = async (req, res) => {
  try {
    const drafts = await WorkOrder.findAll({
      where: { status: "Draft" }, // only drafts
      include: [
        {
          model: Branch,
          as: "assignedBranch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: drafts,
      message: drafts.length ? "Draft work orders fetched" : "No draft work orders found",
    });
  } catch (err) {
    console.error("getDraftWorkOrders failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch draft work orders",
      error: err.message,
    });
  }
};


