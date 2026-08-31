

// const { Op, literal } = require("sequelize");
// const Asset = require("../models/asset.model");
// const Employee = require("../models/employee.model");

// // 🔹 Tenant isolation helper
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === "Employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // fallback → company login
// }

// // 🔹 Role checkers
// function isCompanyUser(req) {
//   const t = (req.user?.type || "").toLowerCase();
//   return t === "company" || t === "admin";
// }

// function isEmployeeUser(req) {
//   return (req.user?.type || "").toLowerCase() === "employee";
// }

// /**
//  * 🔹 Safe WHERE for employee-specific assets
//  */
// function whereAssignedToEmployee(employeeEmployeeId) {
//   const val = String(employeeEmployeeId).trim();
//   return literal(`FIND_IN_SET('${val}', employee_id)`);
// }

// // ------------------------------------------------------
// // Get all assets
// exports.getAllAssets = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     if (isCompanyUser(req)) {
//       // ✅ Company/Admin → see all assets
//       const assets = await Asset.findAll({ where: { created_by: companyId } });
//       return res.json({ success: true, data: assets });
//     }

//     if (isEmployeeUser(req)) {
//       // ✅ Employee → only their assets
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: "Employee record not found" });
//       }

//       const assets = await Asset.findAll({
//         where: {
//           created_by: companyId,
//           [Op.and]: whereAssignedToEmployee(emp.employee_id),
//         },
//       });

//       return res.json({ success: true, data: assets });
//     }

//     // ✅ Other roles (HR, Manager, etc.) → company scope
//     const assets = await Asset.findAll({ where: { created_by: companyId } });
//     res.json({ success: true, data: assets });
//   } catch (err) {
//     console.error("❌ Get Assets Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ------------------------------------------------------
// // Get asset by ID
// exports.getAssetById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const id = req.params.id;

//     let where = { id, created_by: companyId };

//     if (isEmployeeUser(req)) {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: "Employee record not found" });
//       }
//       where = { ...where, [Op.and]: whereAssignedToEmployee(emp.employee_id) };
//     }

//     const asset = await Asset.findOne({ where });
//     if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

//     res.json({ success: true, data: asset });
//   } catch (err) {
//     console.error("❌ Get Asset Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ------------------------------------------------------
// // Create asset (Company + HR/Manager only)
// exports.createAsset = async (req, res) => {
//   try {
//     const { employee_id, name, purchase_date, supported_date, amount, description } = req.body;
//     const created_by = await getCompanyId(req);

//     if (!name || !purchase_date || !supported_date || !amount || !employee_id) {
//       return res.status(400).json({ success: false, message: "All required fields must be provided" });
//     }

//     if (isEmployeeUser(req)) {
//       return res.status(403).json({ success: false, message: "Employees cannot assign assets" });
//     }

//     // ✅ Normalize employee_id as CSV
//     const empCsv = Array.isArray(employee_id)
//       ? employee_id.map(String).map(s => s.trim()).filter(Boolean).join(",")
//       : String(employee_id).split(",").map(s => s.trim()).filter(Boolean).join(",");

//     const asset = await Asset.create({
//       employee_id: empCsv,
//       name: name.trim(),
//       purchase_date,
//       supported_date,
//       amount,
//       description,
//       created_by,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ success: true, data: asset });
//   } catch (err) {
//     console.error("❌ Create Asset Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ------------------------------------------------------
// // Update asset
// exports.updateAsset = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { id } = req.params;

//     let where = { id, created_by: companyId };

//     if (isEmployeeUser(req)) {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: "Employee record not found" });
//       where = { ...where, [Op.and]: whereAssignedToEmployee(emp.employee_id) };
//     }

//     const asset = await Asset.findOne({ where });
//     if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

//     const { employee_id, name, purchase_date, supported_date, amount, description } = req.body;
//     const updatedFields = { updated_at: new Date() };

//     if (!isEmployeeUser(req) && employee_id !== undefined) {
//       // Only company/HR can reassign
//       const empCsv = Array.isArray(employee_id)
//         ? employee_id.map(String).map(s => s.trim()).filter(Boolean).join(",")
//         : String(employee_id).split(",").map(s => s.trim()).filter(Boolean).join(",");
//       updatedFields.employee_id = empCsv;
//     }

//     if (name) updatedFields.name = name.trim();
//     if (purchase_date) updatedFields.purchase_date = purchase_date;
//     if (supported_date) updatedFields.supported_date = supported_date;
//     if (amount) updatedFields.amount = amount;
//     if (description) updatedFields.description = description;

//     await asset.update(updatedFields);

//     res.json({ success: true, message: "Asset updated successfully", data: asset });
//   } catch (err) {
//     console.error("❌ Update Asset Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ------------------------------------------------------
// // Delete asset (Company + HR only)
// exports.deleteAsset = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { id } = req.params;

//     if (isEmployeeUser(req)) {
//       return res.status(403).json({ success: false, message: "Employees cannot delete assets" });
//     }

//     const asset = await Asset.findOne({ where: { id, created_by: companyId } });
//     if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

//     await asset.destroy();
//     res.json({ success: true, message: "Asset deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Asset Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };





const { Op } = require('sequelize');
const Asset = require('../models/asset.model');
const AssetMaintenanceLog = require('../models/assetMaintenance.model');
const Employee = require('../models/employee.model');

// Helper: resolve companyId from request (multi-tenant)
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || '').toLowerCase();
  if (type === 'company') return req.user.id;
  if (req.user.creator_id || req.user.creatorId) {
    return req.user.creator_id || req.user.creatorId;
  }
  // If employee, find their company
  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'], raw: true });
  if (emp?.created_by) return emp.created_by;
  return req.user.id;
}
async function getCompanyUserIds(companyId) {
  const employees = await Employee.findAll({
    where: { created_by: companyId },
    attributes: ['user_id'],
    raw: true
  });
  const userIds = employees.map(e => e.user_id);
  userIds.push(companyId); // include company owner
  return userIds;
}

// GET ASSET BY ID (fixed)
exports.getAssetById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const whereClause = { id: req.params.id };

    if ((req.user.type || '').toLowerCase() === 'company') {
      // company can see any asset in the company
      const userIds = await getCompanyUserIds(companyId);
      whereClause.created_by = { [Op.in]: userIds };
    } else {
      // others can see only their own created assets
      whereClause.created_by = req.user.id;
    }

    const asset = await Asset.findOne({
      where: whereClause,
      include: { model: AssetMaintenanceLog, as: 'maintenanceLogs' }
    });

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    res.json({ success: true, data: asset });
  } catch (err) {
    console.error('Get Asset Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



exports.getAllAssets = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    let whereClause = {};

    if ((req.user.type || '').toLowerCase() === 'company') {
      // Company user → all assets in this company
      whereClause = { created_by: { [Op.in]: await getCompanyUserIds(companyId) } };
    } else {
      // Other roles → self-created assets only
      whereClause = { created_by: req.user.id };
    }

    const assets = await Asset.findAll({
      where: whereClause,
      include: { model: AssetMaintenanceLog, as: 'maintenanceLogs' },
      order: [['id', 'DESC']]
    });

    res.json({ success: true, data: assets });
  } catch (err) {
    console.error('Get All Assets Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// =====================
// CREATE ASSET
// =====================
exports.createAsset = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });


    const asset = await Asset.create({
      ...req.body,
      created_by: req.user.id, // ✅ set logged-in user
    });

    res.status(201).json({ success: true, message: 'Asset created', data: asset });
  } catch (err) {
    console.error('Create Asset Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};



// =====================
// UPDATE ASSET
// =====================
exports.updateAsset = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const whereClause = { id: req.params.id };

    if ((req.user.type || '').toLowerCase() === 'company') {
      // company can update any asset in the company
      const userIds = await getCompanyUserIds(companyId);
      whereClause.created_by = { [Op.in]: userIds };
    } else {
      // others can update only their own assets
      whereClause.created_by = req.user.id;
    }

    const asset = await Asset.findOne({ where: whereClause });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    await asset.update({ ...req.body, updatedAt: new Date() });
    res.json({ success: true, message: 'Asset updated', data: asset });
  } catch (err) {
    console.error('Update Asset Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// =====================
// DELETE ASSET
// =====================
exports.deleteAsset = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const whereClause = { id: req.params.id };

    if ((req.user.type || '').toLowerCase() === 'company') {
      // company can delete any asset in the company
      const userIds = await getCompanyUserIds(companyId);
      whereClause.created_by = { [Op.in]: userIds };
    } else {
      // others can delete only their own assets
      whereClause.created_by = req.user.id;
    }

    const asset = await Asset.findOne({ where: whereClause });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    await asset.destroy();

    res.json({success: true, message: 'Asset soft deleted', data: { id: req.params.id }, });

    // res.json({ success: true, message: 'Asset deleted', data: { id: req.params.id } });
  } catch (err) {
    console.error('Delete Asset Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};





