const { Op } = require("sequelize");
const Product = require("../models/product.model");
const Employee = require("../models/employee.model");

const RolePermission = require("../models/rolePermission"); 
const RoleUser = require("../models/roleuser.model");
const Permission = require("../models/permission.model");

async function addProductStock(productId, quantity, type, description, createdBy) {
  try {
    await ProductStock.create({
      product_id: productId,
      quantity,
      type,
      description,
      created_by: createdBy,
    });
  } catch (err) {
    console.error("addProductStock Error:", err);
  }
}


async function getCompanyId(req) {
  try {
    if (!req.user) return null;

    const type = req.user.type?.toLowerCase();
    if (type === "company") return req.user.id;

    if (type === "employee") {
      const emp = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ["created_by"],
      });
      return emp?.created_by || null;
    }

    return req.user.id;
  } catch (err) {
    console.error("getCompanyId Error:", err);
    return null;
  }
}

async function getPermittedUserIds(req, module = "product", action = "view") {
  const companyId = await getCompanyId(req);
  if (!companyId) return [req.user.id];

  // Company user: access all employees under company
  if (req.user.type?.toLowerCase() === "company") {
    const emps = await Employee.findAll({
      where: { created_by: companyId },
      attributes: ["user_id"],
    });
    return emps.map(e => e.user_id).concat(companyId);
  }

  // Employee user
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (!emp) return [req.user.id];

  // Get role(s) of this user from RoleUser table
  const roleUser = await RoleUser.findOne({
    where: { model_id: req.user.id, model_type: "App\\Models\\User" },
    attributes: ["role_id"],
  });
  const roleId = roleUser?.role_id;
  if (!roleId) return [req.user.id];

  // 1️⃣ Find permission ID
  const permissionName = `${module}.${action}`; // e.g., "product.view"
  const permission = await Permission.findOne({
    where: { name: permissionName },
  });
  if (!permission) return [req.user.id];

  // 2️⃣ Check if this role has this permission
  const roleHasPermission = await RolePermission.findOne({
    where: { role_id: roleId, permission_id: permission.id },
  });
  if (!roleHasPermission) return [req.user.id];

  // 3️⃣ Return all employees under the same company + self
  const empsUnderCompany = await Employee.findAll({
    where: { created_by: emp.created_by },
    attributes: ["user_id"],
  });

  return empsUnderCompany.map(e => e.user_id).concat(req.user.id);
}


async function index(req, res) {
  try {
    const companyId = await getCompanyId(req);

    // Permission check: allow users with view OR edit permission
    const permittedUserIdsView = await getPermittedUserIds(req, "product", "view");
    const permittedUserIdsEdit = await getPermittedUserIds(req, "product", "edit");
    const permittedUserIds = [...new Set([...permittedUserIdsView, ...permittedUserIdsEdit])];

    if (!permittedUserIds.includes(req.user.id)) {
      return res.status(403).json({ code: 403, error: "Permission denied" });
    }

    const products = await Product.findAll({
      where: { created_by: companyId, type: "product" },
      order: [["id", "DESC"]],
    });

    res.json({ code: 200, data: products });
  } catch (err) {
    console.error("ProductStock Index Error:", err);
    res.status(500).json({ code: 500, error: err.message || "Server error" });
  }
}


async function update(req, res) {
  try {
    const companyId = await getCompanyId(req);

    // 🔐 Permission check
    const permittedUserIds = await getPermittedUserIds(req, "product", "edit");
    if (!permittedUserIds.includes(req.user.id)) {
      return res.status(403).json({ code: 403, error: "Permission denied" });
    }

    // 🔎 Find product
    const product = await Product.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!product) {
      return res.status(404).json({ code: 404, error: "Product not found" });
    }

    // 📦 Stock delta (the amount to add)
    const quantityToAdd = parseFloat(req.body.quantity);
    if (isNaN(quantityToAdd)) {
      return res.status(400).json({ code: 400, error: "Quantity is required and must be numeric" });
    }

    const oldQuantity = parseFloat(product.quantity) || 0;
    const newQuantity = oldQuantity + quantityToAdd;

    // ✅ Update product stock
    await product.update({ quantity: newQuantity });

    // 📝 Add stock log
    const description = `${quantityToAdd} quantity manually adjusted (from ${oldQuantity} → ${newQuantity})`;
    await addProductStock(product.id, quantityToAdd, "manual", description, req.user.id);

    // 📤 Return response
    res.json({
      code: 200,
      message: "Product stock updated successfully",
      data: {
        ...product.toJSON(),
        oldQuantity,
        added: quantityToAdd,
        newQuantity,
      },
    });
  } catch (err) {
    console.error("ProductStock Update Error:", err);
    res.status(500).json({ code: 500, error: err.message || "Server error" });
  }
}



module.exports = {
  index,
  update,
};
