
// const PurchaseOrder = require("../models/purchase_order.model");
// const PurchaseOrderItem = require("../models/purchase_order_item.model");
// const Employee = require("../models/employee.model");
// const Branch = require("../models/branch.model");
// const User = require("../models/user.model");
// const { Op } = require("sequelize");
// const path = require("path");
// // =====================
// // Helper: Resolve Allowed Users
// // =====================
// async function getAllowedUserIds(req) {
//   if (!req.user) return [];

//   const userType = (req.user.type || "").toLowerCase();

//   if (userType === "company" || userType === "accountant") {
//     // Company and Accountant can see ALL users
//     const allUsers = await User.findAll({
//       attributes: ["id"],
//       raw: true
//     });
//     return allUsers.map(u => u.id);
//   }

//   // Other users: normal logic
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//     raw: true
//   });

//   return [req.user.id, emp?.created_by].filter(Boolean);
// }

// // =====================
// // CREATE Purchase Order
// // =====================
// exports.create = async (req, res) => {
//   try {
//     const userType = (req.user.type || "").toLowerCase();
//     if (userType === "employee") {
//       return res.status(403).json({ message: "Not allowed to create Purchase Order" });
//     }

//     let { po_number, vendor_name, po_date, delivery_date, line_items, branch_id } = req.body;

//     if (!po_number || !vendor_name || !po_date) {
//       return res.status(400).json({ message: "po_number, vendor_name and po_date are required" });
//     }

//     // Parse line_items if it's a string (from form-data)
//     if (typeof line_items === "string") {
//       try {
//         line_items = JSON.parse(line_items);
//       } catch (err) {
//         return res.status(400).json({ message: "line_items must be a valid JSON array" });
//       }
//     }

//     // Handle document upload
//     let documentPaths = [];
// if (req.files && req.files.length) {
//   documentPaths = req.files.map(file => {
//     const uploadFolder = file.destination.split(path.sep).pop();
//     return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//   });
// }

//     // Calculate total
//     let totalAmount = 0;
//     line_items?.forEach(li => {
//       totalAmount += Number(li.quantity) * Number(li.unit_price);
//     });

//     const po = await PurchaseOrder.create({
//       po_number,
//       vendor_name,
//       po_date,
//       delivery_date,
//       total_amount: totalAmount,
//       document: documentPaths,
//       created_by: req.user.id,
//       branch_id: branch_id || null,
//       line_items: line_items?.map(li => ({
//         item_name: li.item_name,
//         quantity: li.quantity,
//         unit_price: li.unit_price,
//         line_total: li.quantity * li.unit_price,
//       })),
//     }, {
//       include: [{ model: PurchaseOrderItem, as: "line_items" }]
//     });

//     const createdPO = await PurchaseOrder.findByPk(po.id, {
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
//       ],
//     });

//     res.status(201).json({ success: true, message: "Purchase Order created", data: createdPO });
//   } catch (err) {
//     console.error("Error creating PO:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET ALL Purchase Orders
// // =====================
// exports.getAll = async (req, res) => {
//   try {
//     const allowedUserIds = await getAllowedUserIds(req);
//     if (!allowedUserIds.length) return res.status(403).json({ message: "Unauthorized" });

//     const userType = (req.user?.type || "").toLowerCase();
//     let where = { created_by: allowedUserIds };

//     if (userType === "branch manager") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp) return res.status(404).json({ message: "Employee record not found" });
//       where.branch_id = Number(emp.branch_id);
//     }

//     const orders = await PurchaseOrder.findAll({
//       where,
//       order: [["id", "DESC"]],
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
//       ],
//     });

//     res.json({ success: true, data: orders });
//   } catch (err) {
//     console.error("Error fetching POs:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET Purchase Order BY ID
// // =====================
// exports.getById = async (req, res) => {
//   try {
//     const allowedUserIds = await getAllowedUserIds(req);
//     const userType = (req.user?.type || "").toLowerCase();

//     let where = { id: req.params.id, created_by: allowedUserIds };
//     if (userType === "branch manager") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp) return res.status(404).json({ message: "Employee record not found" });
//       where.branch_id = Number(emp.branch_id);
//     }

//     const order = await PurchaseOrder.findOne({
//       where,
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
//       ],
//     });

//     if (!order) return res.status(404).json({ message: "PO not found" });

//     res.json({ success: true, data: order });
//   } catch (err) {
//     console.error("Error fetching PO:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // UPDATE Purchase Order
// // =====================
// // exports.update = async (req, res) => {
// //   try {
// //     const allowedUserIds = await getAllowedUserIds(req);
// //     const order = await PurchaseOrder.findOne({ where: { id: req.params.id, created_by: allowedUserIds } });
// //     if (!order) return res.status(404).json({ message: "PO not found" });

// //     const userType = (req.user?.type || "").toLowerCase();
// //     if (userType === "branch manager") {
// //       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
// //       if (!emp || Number(emp.branch_id) !== Number(order.branch_id)) {
// //         return res.status(403).json({ message: "You can only update POs of your own branch" });
// //       }
// //     }
    
// //     const { vendor_name, status, po_date, delivery_date, line_items, branch_id } = req.body;
// //     await order.update({ vendor_name, status, po_date, delivery_date, branch_id });

// //     if (Array.isArray(line_items)) {
// //       await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });

// //       let totalAmount = 0;
// //       for (let li of line_items) {
// //         totalAmount += li.quantity * li.unit_price;
// //         await PurchaseOrderItem.create({
// //           purchase_order_id: order.id,
// //           item_name: li.item_name,
// //           quantity: li.quantity,
// //           unit_price: li.unit_price,
// //           line_total: li.quantity * li.unit_price,
// //         });
// //       }

// //       await order.update({ total_amount: totalAmount });
// //     }

// //     const updated = await PurchaseOrder.findByPk(order.id, {
// //       include: [
// //         { model: PurchaseOrderItem, as: "line_items" },
// //         { model: Branch, as: "branch", attributes: ["id", "name"] },
// //       ],
// //     });

// //     res.json({ success: true, message: "PO updated", data: updated });
// //   } catch (err) {
// //     console.error("Error updating PO:", err);
// //     return res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };



// exports.update = async (req, res) => {
//   try {
//     const allowedUserIds = await getAllowedUserIds(req);
//     const order = await PurchaseOrder.findOne({ where: { id: req.params.id, created_by: allowedUserIds } });
//     if (!order) return res.status(404).json({ message: "PO not found" });

//     const userType = (req.user?.type || "").toLowerCase();
//     if (userType === "branch manager") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(order.branch_id)) {
//         return res.status(403).json({ message: "You can only update POs of your own branch" });
//       }
//     }

//     let { vendor_name, status, po_date, delivery_date, line_items, branch_id } = req.body;

//     // Parse line_items if string
//     if (typeof line_items === "string") {
//       try {
//         line_items = JSON.parse(line_items);
//       } catch (err) {
//         return res.status(400).json({ message: "line_items must be a valid JSON array" });
//       }
//     }

//     // Handle document upload
//     let documentPaths = [];
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map(file => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     // Replace old documents with new ones if uploaded, otherwise keep old
//     const finalDocuments = documentPaths.length > 0 ? documentPaths : (order.document ? JSON.parse(order.document) : []);

//     // Update main PO
//     await order.update({
//       vendor_name,
//       status,
//       po_date,
//       delivery_date,
//       branch_id,
//       document: JSON.stringify(finalDocuments), // store as JSON string
//     });

//     // Update line items
//     if (Array.isArray(line_items)) {
//       await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });

//       let totalAmount = 0;
//       for (let li of line_items) {
//         const lineTotal = Number(li.quantity) * Number(li.unit_price);
//         totalAmount += lineTotal;
//         await PurchaseOrderItem.create({
//           purchase_order_id: order.id,
//           item_name: li.item_name,
//           quantity: li.quantity,
//           unit_price: li.unit_price,
//           line_total: lineTotal,
//         });
//       }

//       await order.update({ total_amount: totalAmount });
//     }

//     const updated = await PurchaseOrder.findByPk(order.id, {
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name"] },
//       ],
//     });

//     // Parse documents back to array for response
//     const data = updated.toJSON();
//     data.document = data.document ? JSON.parse(data.document) : [];

//     res.json({ success: true, message: "PO updated successfully", data });
//   } catch (err) {
//     console.error("Error updating PO:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // DELETE Purchase Order
// // =====================
// exports.remove = async (req, res) => {
//   try {
//     const allowedUserIds = await getAllowedUserIds(req);
//     const order = await PurchaseOrder.findOne({ where: { id: req.params.id, created_by: allowedUserIds } });
//     if (!order) return res.status(404).json({ message: "PO not found" });

//     const userType = (req.user?.type || "").toLowerCase();
//     if (userType === "branch manager") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ["branch_id"], raw: true });
//       if (!emp || Number(emp.branch_id) !== Number(order.branch_id)) {
//         return res.status(403).json({ message: "You can only delete POs of your own branch" });
//       }
//     }

//     await order.destroy(); // Soft delete if paranoid:true
//     res.json({ success: true, message: "PO deleted" });
//   } catch (err) {
//     console.error("Error deleting PO:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



const { Op } = require("sequelize");
const path = require("path");
const PurchaseOrder = require("../models/purchase_order.model");
const PurchaseOrderItem = require("../models/purchase_order_item.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const Unit = require("../models/unit.model"); // 

// ================================
// HELPERS
// ================================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  // Employee linked to company
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

// ================================
// CREATE PURCHASE ORDER
// ================================
// exports.create = async (req, res) => {
//   try {
//     if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const userId = req.user.id;
//     let { po_number, vendor_name, po_date, delivery_date, line_items, branch_id } = req.body;

//     // enforce branch for employees
//     const emp = await getUserBranch(req);
//     if (emp) branch_id = emp.branch_id;

//     // verify branch
//     const branch = await Branch.findOne({ where: { id: branch_id } });
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // Parse line_items if string (form-data)
//     if (typeof line_items === "string") {
//       try {
//         line_items = JSON.parse(line_items);
//       } catch {
//         return res.status(400).json({ message: "line_items must be valid JSON" });
//       }
//     }

//     // Handle file uploads
//     let documentPaths = [];
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     // Calculate total
//     let totalAmount = 0;
//     line_items?.forEach((li) => {
//       totalAmount += Number(li.quantity) * Number(li.unit_price);
//     });

//     const po = await PurchaseOrder.create(
//       {
//         po_number,
//         vendor_name,
//         po_date,
//         delivery_date,
//         total_amount: totalAmount,
//         document: documentPaths,
//         created_by: userId,
//         branch_id,
//         line_items: line_items?.map((li) => ({
//           item_name: li.item_name,
//           quantity: li.quantity,
//           unit_price: li.unit_price,
//           line_total: li.quantity * li.unit_price,
//           unit_id: li.unit_id,
//         })),
//       },
//       { include: [{ model: PurchaseOrderItem, as: "line_items" }] }
//     );

//     const createdPO = await PurchaseOrder.findByPk(po.id, {
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
//       ],
//     });

//     res.status(201).json({ success: true, message: "Purchase Order created", data: createdPO });
//   } catch (err) {
//     console.error("createPurchaseOrder failed:", err);
//     res.status(500).json({ success: false, message: "Failed to create Purchase Order", error: err.message });
//   }
// };

exports.create = async (req, res) => {
  try {
    if (!req.user?.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const userId = req.user.id;
    let { po_number, vendor_name, po_date, delivery_date, line_items, branch_id } = req.body;

    // enforce branch for employees
    const emp = await getUserBranch(req);
    if (emp) branch_id = emp.branch_id;

    // branch validation (only if branch_id provided)
    let branch = null;
    if (branch_id) {
      branch = await Branch.findOne({ where: { id: branch_id } });
      if (!branch)
        return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // Parse line_items if string
    if (typeof line_items === "string") {
      try {
        line_items = JSON.parse(line_items);
      } catch {
        return res.status(400).json({ message: "line_items must be valid JSON" });
      }
    }

    // Handle file uploads
    let documentPaths = [];
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }

    // Filter valid line items
    let validLineItems = [];
    let totalAmount = 0;
    if (Array.isArray(line_items) && line_items.length) {
      validLineItems = line_items
        .filter(
          (li) =>
            li.item_name != null &&
            li.quantity != null &&
            li.unit_price != null &&
            li.unit_id != null
        )
        .map((li) => {
          totalAmount += Number(li.quantity) * Number(li.unit_price);
          return {
            item_name: li.item_name,
            quantity: li.quantity,
            unit_price: li.unit_price,
            line_total: Number(li.quantity) * Number(li.unit_price),
            unit_id: li.unit_id,
          };
        });
    }

    // Determine status
    let status = "Draft";
    const allRequiredPresent =
      po_number &&
      vendor_name &&
      po_date &&
      delivery_date &&
      validLineItems.length &&
      branch_id;
    if (allRequiredPresent) status = "Success";

    // Create Purchase Order
    const po = await PurchaseOrder.create(
      {
        po_number: po_number || null,
        vendor_name: vendor_name || null,
        po_date: po_date || null,
        delivery_date: delivery_date || null,
        total_amount: totalAmount,
        document: documentPaths,
        created_by: userId,
        branch_id: branch_id || null,
        status,
        line_items: validLineItems.length ? validLineItems : undefined,
      },
      {
        include: validLineItems.length
          ? [{ model: PurchaseOrderItem, as: "line_items" }]
          : [],
      }
    );

    // Fetch created PO with related data
    const createdPO = await PurchaseOrder.findByPk(po.id, {
      include: [
        { model: PurchaseOrderItem, as: "line_items" },
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "branch_address", "contact_number"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: status === "Draft" ? "Purchase Order saved as draft" : "Purchase Order created successfully",
      data: createdPO,
    });
  } catch (err) {
    console.error("createPurchaseOrder failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create Purchase Order",
      error: err.message,
    });
  }
};

// ================================
// GET ALL PURCHASE ORDERS
// ================================
exports.getAll = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);
    let where = {};

    if (emp) {
      // branch employee: only their branch
      where.branch_id = emp.branch_id;
    } else {
      // company/accountant: all branches of company
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      where.branch_id = { [Op.in]: branches.map((b) => b.id) };
    }

    const orders = await PurchaseOrder.findAll({
      where,
      order: [["id", "DESC"]],
      include: [
        { model: PurchaseOrderItem, as: "line_items" },
        { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
      ],
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("getAllPurchaseOrders failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch Purchase Orders", error: err.message });
  }
};

// ================================
// GET PURCHASE ORDER BY ID
// ================================
exports.getById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrderItem, as: "line_items" },
        { model: Branch, as: "branch", attributes: ["id", "name", "branch_address", "contact_number"] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: "Purchase Order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // permission check
    if (emp && order.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      const allowedBranchIds = branches.map((b) => b.id);
      if (!allowedBranchIds.includes(order.branch_id))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("getPurchaseOrderById failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch Purchase Order", error: err.message });
  }
};

// ================================
// UPDATE PURCHASE ORDER
// ================================
// exports.update = async (req, res) => {
//   try {
//     const order = await PurchaseOrder.findByPk(req.params.id);
//     if (!order) return res.status(404).json({ success: false, message: "Purchase Order not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // permission check
//     if (emp && order.branch_id !== emp.branch_id)
//       return res.status(403).json({ success: false, message: "Access denied" });

//     if (!emp) {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       const allowedBranchIds = branches.map((b) => b.id);
//       if (!allowedBranchIds.includes(order.branch_id))
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     let { vendor_name, status, po_date, delivery_date, line_items } = req.body;

//     // Parse line_items if string
//     if (typeof line_items === "string") {
//       try {
//         line_items = JSON.parse(line_items);
//       } catch {
//         return res.status(400).json({ message: "line_items must be valid JSON" });
//       }
//     }

//     // Handle uploads
//     let documentPaths = [];
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }

//     const finalDocs = documentPaths.length > 0 ? documentPaths : order.document;

//     await order.update({
//       vendor_name,
//       status,
//       po_date,
//       delivery_date,
//       document: finalDocs,
//     });

//     // update line items
//     if (Array.isArray(line_items)) {
//       await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });

//       let totalAmount = 0;
//       for (const li of line_items) {
//         const lineTotal = Number(li.quantity) * Number(li.unit_price);
//         totalAmount += lineTotal;
//         await PurchaseOrderItem.create({
//           purchase_order_id: order.id,
//           item_name: li.item_name,
//           quantity: li.quantity,
//           unit_price: li.unit_price,
//           line_total: lineTotal,
//           unit_id: li.unit_id, 
          
//         });
//       }

//       await order.update({ total_amount: totalAmount });
//     }

//     const updated = await PurchaseOrder.findByPk(order.id, {
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         { model: Branch, as: "branch", attributes: ["id", "name"] },
//       ],
//     });

//     res.status(200).json({ success: true, message: "Purchase Order updated", data: updated });
//   } catch (err) {
//     console.error("updatePurchaseOrder failed:", err);
//     res.status(500).json({ success: false, message: "Failed to update Purchase Order", error: err.message });
//   }
// };


// exports.update = async (req, res) => {
//   try {
//     const order = await PurchaseOrder.findByPk(req.params.id);
//     if (!order)
//       return res
//         .status(404)
//         .json({ success: false, message: "Purchase Order not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     // ================= Permission check =================
//     if (order.status !== "Draft") {
//       if (emp && order.branch_id !== emp.branch_id)
//         return res.status(403).json({ success: false, message: "Access denied" });

//       if (!emp) {
//         const branches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         const allowedBranchIds = branches.map((b) => b.id);
//         if (!allowedBranchIds.includes(order.branch_id))
//           return res.status(403).json({ success: false, message: "Access denied" });
//       }
//     } else {
//       // Draft: allow update only by creator
//       if (emp && order.created_by !== req.user.id)
//         return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     // ================= Extract request data =================
//     let { po_number, vendor_name, po_date, delivery_date, line_items, branch_id } = req.body;

//     // Parse line_items if string
//     if (typeof line_items === "string") {
//       try {
//         line_items = JSON.parse(line_items);
//       } catch {
//         return res.status(400).json({ message: "line_items must be valid JSON" });
//       }
//     }

//     // ================= Handle uploaded files =================
//     let documentPaths = [];
//     if (req.files && req.files.length) {
//       documentPaths = req.files.map((file) => {
//         const uploadFolder = file.destination.split(path.sep).pop();
//         return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
//       });
//     }
//     const finalDocs = documentPaths.length > 0 ? documentPaths : order.document;

//     // ================= Process line items =================
//     let totalAmount = 0;
//     let validLineItems = [];
//     if (Array.isArray(line_items) && line_items.length) {
//       validLineItems = line_items
//         .filter(
//           (li) =>
//             li.item_name != null &&
//             li.quantity != null &&
//             li.unit_price != null &&
//             li.unit_id != null
//         )
//         .map((li) => {
//           const lineTotal = Number(li.quantity) * Number(li.unit_price);
//           totalAmount += lineTotal;
//           return {
//             item_name: li.item_name,
//             quantity: li.quantity,
//             unit_price: li.unit_price,
//             line_total: lineTotal,
//             unit_id: li.unit_id,
//           };
//         });
//     }

//     // ================= Status logic =================
//     const allRequiredPresent =
//       (po_number || order.po_number) &&
//       (vendor_name || order.vendor_name) &&
//       (po_date || order.po_date) &&
//       (delivery_date || order.delivery_date) &&
//       (branch_id || order.branch_id) &&
//       validLineItems.length;

//     const status = allRequiredPresent ? "Success" : "Draft";

//     // ================= Update main Purchase Order =================
//     await order.update({
//       po_number: po_number || order.po_number,
//       vendor_name: vendor_name || order.vendor_name,
//       po_date: po_date || order.po_date,
//       delivery_date: delivery_date || order.delivery_date,
//       branch_id: branch_id || order.branch_id,
//       document: finalDocs,
//       total_amount: totalAmount,
//       status,
//     });

//     // ================= Update line items =================
//     if (validLineItems.length) {
//       await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });

//       for (const li of validLineItems) {
//         await PurchaseOrderItem.create({
//           purchase_order_id: order.id,
//           item_name: li.item_name,
//           quantity: li.quantity,
//           unit_price: li.unit_price,
//           line_total: li.line_total,
//           unit_id: li.unit_id,
//         });
//       }
//     }

//     // ================= Fetch updated PO with line items and branch =================
//     const updated = await PurchaseOrder.findByPk(order.id, {
//       include: [
//         { model: PurchaseOrderItem, as: "line_items" },
//         {
//           model: Branch,
//           as: "branch",
//           attributes: ["id", "name"],
//           required: false,
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       message: "Purchase Order updated",
//       data: updated,
//     });
//   } catch (err) {
//     console.error("updatePurchaseOrder failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update Purchase Order",
//       error: err.message,
//     });
//   }
// };

exports.update = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: PurchaseOrderItem, as: "line_items" }],
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Purchase Order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // ================= Permission check =================
    if (order.status !== "Draft") {
      if (emp && order.branch_id !== emp.branch_id)
        return res.status(403).json({ success: false, message: "Access denied" });

      if (!emp) {
        const branches = await Branch.findAll({
          where: { created_by: companyId },
          attributes: ["id"],
          raw: true,
        });
        const allowedBranchIds = branches.map((b) => b.id);
        if (!allowedBranchIds.includes(order.branch_id))
          return res.status(403).json({ success: false, message: "Access denied" });
      }
    } else {
      // Draft: allow update only by creator
      if (emp && order.created_by !== req.user.id)
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    // ================= Extract request data =================
    let { po_number, vendor_name, po_date, delivery_date, line_items, branch_id, status } = req.body;

    // Validate status if provided
    const allowedStatuses = ["Draft", "Success", "Approved", "Received"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Use existing status if not provided
    status = status || order.status;

    // Parse line_items if string
    if (typeof line_items === "string") {
      try {
        line_items = JSON.parse(line_items);
      } catch {
        return res.status(400).json({ message: "line_items must be valid JSON" });
      }
    }

    // ================= Handle uploaded files =================
    let documentPaths = [];
    if (req.files && req.files.length) {
      documentPaths = req.files.map((file) => {
        const uploadFolder = file.destination.split(path.sep).pop();
        return path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      });
    }
    const finalDocs = documentPaths.length > 0 ? documentPaths : order.document;

    // ================= Process line items =================
let totalAmount = order.total_amount; // keep previous total

let validLineItems = [];
if (Array.isArray(line_items) && line_items.length) {
  totalAmount = 0; // recalc only if new items provided
  validLineItems = line_items
    .filter(
      (li) =>
        li.item_name != null &&
        li.quantity != null &&
        li.unit_price != null &&
        li.unit_id != null
    )
    .map((li) => {
      const lineTotal = Number(li.quantity) * Number(li.unit_price);
      totalAmount += lineTotal;
      return {
        item_name: li.item_name,
        quantity: li.quantity,
        unit_price: li.unit_price,
        line_total: lineTotal,
        unit_id: li.unit_id,
      };
    });
}

    // ================= Update main Purchase Order =================
    order.po_number = po_number || order.po_number;
    order.vendor_name = vendor_name || order.vendor_name;
    order.po_date = po_date || order.po_date;
    order.delivery_date = delivery_date || order.delivery_date;
    order.branch_id = branch_id || order.branch_id;
    order.document = finalDocs;
    order.total_amount = totalAmount;
    order.status = status;

    await order.save(); // updated_at will refresh automatically

    // ================= Update line items =================
    if (validLineItems.length) {
      await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });

      for (const li of validLineItems) {
        await PurchaseOrderItem.create({
          purchase_order_id: order.id,
          item_name: li.item_name,
          quantity: li.quantity,
          unit_price: li.unit_price,
          line_total: li.line_total,
          unit_id: li.unit_id,
        });
      }
    }

    // ================= Fetch updated PO with line items and branch =================
    const updated = await PurchaseOrder.findByPk(order.id, {
      include: [
        { model: PurchaseOrderItem, as: "line_items" },
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Purchase Order updated",
      data: updated,
    });
  } catch (err) {
    console.error("updatePurchaseOrder failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order",
      error: err.message,
    });
  }
};


// ================================
// DELETE PURCHASE ORDER
// ================================
exports.remove = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Purchase Order not found" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // permission check
    if (emp && order.branch_id !== emp.branch_id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (!emp) {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      const allowedBranchIds = branches.map((b) => b.id);
      if (!allowedBranchIds.includes(order.branch_id))
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    await order.destroy();
    res.status(200).json({ success: true, message: "Purchase Order deleted" });
  } catch (err) {
    console.error("deletePurchaseOrder failed:", err);
    res.status(500).json({ success: false, message: "Failed to delete Purchase Order", error: err.message });
  }
};

// GET /api/purchase-orders/draft
exports.getDraftPOs = async (req, res) => {
  try {
    const drafts = await PurchaseOrder.findAll({
      where: { status: "Draft" }, // fetch only Draft status
      include: [
        { model: PurchaseOrderItem, as: "line_items" },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    });

    // Return empty array if no drafts found
    res.status(200).json({ success: true, data: drafts });
  } catch (err) {
    console.error("getDraftPOs failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch drafts", error: err.message });
  }
};

