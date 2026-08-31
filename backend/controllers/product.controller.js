

const { Op } = require("sequelize");
const Product = require("../models/product.model");
const ProductLog = require("../models/product_log.model");
const Category = require("../models/category.model");
const Unit = require("../models/unit.model");
const Tax = require("../models/tax.model");
const ChartOfAccount = require("../models/chart_of_account.model");
const crypto = require("crypto");
const path = require("path");

const Employee = require("../models/employee.model");
const RolePermission = require("../models/rolePermission"); 
const RoleUser = require("../models/roleuser.model"); // model_has_roles equivalent
const Permission = require("../models/permission.model"); // <--- added

//----------------- Helpers -----------------

// Auto SKU
function generateSKU() {
  return "SKU-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Get companyId safely
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
 



module.exports = {

  // GET all products
  async index(req, res) {
    try {
      const permittedUserIds = await getPermittedUserIds(req, "product", "view");

      const products = await Product.findAll({
        where: { created_by: { [Op.in]: permittedUserIds } },
        include: [
          { model: Category, as: "category" },
          { model: Unit, as: "unit" },
          { model: Tax, as: "tax" },
        //   { model: ChartOfAccount, as: "saleAccount" },
        //   { model: ChartOfAccount, as: "expenseAccount" },
          { 
            model: ChartOfAccount, 
            as: "saleAccount",
            attributes: ["id", "name", "code", "type", "sub_type", "parent", "is_enabled", "description", "created_by", "created_at", "updated_at"] // removed 'account'
            },
          { 
            model: ChartOfAccount, 
            as: "expenseAccount",
            attributes: ["id", "name", "code", "type", "sub_type", "parent", "is_enabled", "description", "created_by", "created_at", "updated_at"] // removed 'account'
            },

        ],
        order: [["id", "DESC"]],
      });

      res.json({ code: 200, data: products });
    } catch (err) {
      console.error("Product Index Error:", err);
      res.status(500).json({ code: 500, error: err.message || "Server error" });
    }
  },

  // GET single product
  async show(req, res) {
    try {
      const permittedUserIds = await getPermittedUserIds(req, "product", "view");

      const product = await Product.findOne({
        where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
        include: [
          { model: Category, as: "category" },
          { model: Unit, as: "unit" },
          { model: Tax, as: "tax" },
        //   { model: ChartOfAccount, as: "saleAccount" },
        //   { model: ChartOfAccount, as: "expenseAccount" },
          { model: ChartOfAccount, as: "saleAccount", attributes: ["id","name","code","type","sub_type","parent","is_enabled","description","created_by","created_at","updated_at"] },
          { model: ChartOfAccount, as: "expenseAccount", attributes: ["id","name","code","type","sub_type","parent","is_enabled","description","created_by","created_at","updated_at"] },

        ],
      });

      if (!product) return res.status(404).json({ code: 404, error: "Product not found" });
      res.json({ code: 200, data: product });
    } catch (err) {
      console.error("Product Show Error:", err);
      res.status(500).json({ code: 500, error: err.message || "Server error" });
    }
  },

  // CREATE product
  async create(req, res) {
    try {
      const permittedUserIds = await getPermittedUserIds(req, "product", "create");
      if (!permittedUserIds.includes(req.user?.id)) {
        return res.status(403).json({ code: 403, error: "Permission denied" });
      }

      if (!req.body.name || req.body.name.trim() === "") {
        return res.status(400).json({ code: 400, error: "Product name is required" });
      }
      if (!req.body.sale_price || isNaN(req.body.sale_price)) {
        return res.status(400).json({ code: 400, error: "Sale price is required" });
      }

      const productData = { ...req.body };
      productData.created_by = req.user.id;
    //   productData.sku = generateSKU();
    
      if (req.body.sku && req.body.sku.trim() !== "") {
        productData.sku = req.body.sku.trim();
        } else {
            productData.sku = null; // or you can enforce required check here
        }


      if (req.file) {
        productData.pro_image = path.relative(path.join(__dirname, ".."), req.file.path);
      }

      const product = await Product.create(productData);

      await ProductLog.create({
        product_id: product.id,
        action: "created",
        new_data: product.toJSON(),
        created_by: req.user.id,
      });

      res.status(201).json({ code: 201, data: product });
    } catch (err) {
      console.error("Product Create Error:", err);
      res.status(500).json({ code: 500, error: err.message || "Server error" });
    }
  },

  // UPDATE product
  async update(req, res) {
    try {
      const permittedUserIds = await getPermittedUserIds(req, "product", "edit");

      const product = await Product.findOne({
        where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
      });
      if (!product) return res.status(404).json({ code: 404, error: "Product not found" });

      const oldData = product.toJSON();
      const updateData = { ...req.body };
      if (req.file) {
        updateData.pro_image = path.relative(path.join(__dirname, ".."), req.file.path);
      }

      await product.update(updateData);

      await ProductLog.create({
        product_id: product.id,
        action: "updated",
        old_data: oldData,
        new_data: product.toJSON(),
        created_by: req.user.id,
      });

      res.json({ code: 200, data: product });
    } catch (err) {
      console.error("Product Update Error:", err);
      res.status(500).json({ code: 500, error: err.message || "Server error" });
    }
  },

  // DELETE product (soft delete)
  async destroy(req, res) {
    try {
      const permittedUserIds = await getPermittedUserIds(req, "product", "delete");

      const product = await Product.findOne({
        where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
      });
      if (!product) return res.status(404).json({ code: 404, error: "Product not found" });

      const oldData = product.toJSON();
      await product.destroy();

      await ProductLog.create({
        product_id: product.id,
        action: "deleted",
        old_data: oldData,
        created_by: req.user.id,
      });

      res.json({ code: 200, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Product Delete Error:", err);
      res.status(500).json({ code: 500, error: err.message || "Server error" });
    }
  },
};







// const { Op } = require("sequelize");
// const Product = require("../models/product.model");
// const ProductLog = require("../models/product_log.model");
// const Category = require("../models/category.model");
// const Unit = require("../models/unit.model");
// const Tax = require("../models/tax.model");
// const ChartOfAccount = require("../models/chart_of_account.model");
// const crypto = require("crypto");
// const path = require("path");

// const Employee = require("../models/employee.model");
// const RolePermission = require("../models/rolePermission");
// const RoleUser = require("../models/roleuser.model");
// const Permission = require("../models/permission.model");


// function generateSKU() {
//   return "SKU-" + crypto.randomBytes(3).toString("hex").toUpperCase();
// }


// async function getCompanyId(req) {
//   try {
//     if (!req.user) return null;

//     const type = (req.user.type || "").toLowerCase();
//     if (type === "company") return req.user.id;

//     // if user is stored as "employee" in DB
//     if (type === "employee") {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ["created_by"],
//       });
//       return emp?.created_by || null;
//     }

//     // if user is a role user (HR/Accountant/Manager), assume they are an employee-type user in your system
//     // try to read employee record to find company if exists
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     if (emp) return emp.created_by;

//     return req.user.id;
//   } catch (err) {
//     console.error("getCompanyId Error:", err);
//     return null;
//   }
// }


// function permissionMap() {
//   return {
//     product: {
//       view: ["manage product & service", "view product & service"],
//       create: ["create product & service", "manage product & service"],
//       edit: ["edit product & service", "manage product & service"],
//       delete: ["delete product & service", "manage product & service"],
//     },
//     // add other modules here if needed
//   };
// }


// async function hasPermission(req, module = "product", action = "view") {
//   const map = permissionMap();
//   const allowedPerms = map[module]?.[action] || [];
//   if (!allowedPerms.length) return false;

//   // Super admin bypass
//   if ((req.user?.type || "").toLowerCase() === "super admin") return true;

//   // 1) Fast check: req.user.permissions (if your auth middleware populated it)
//   if (Array.isArray(req.user?.permissions) && req.user.permissions.length > 0) {
//     const userPermsLower = req.user.permissions.map((p) => String(p).toLowerCase());
//     if (allowedPerms.some((p) => userPermsLower.includes(p.toLowerCase()))) return true;
//   }

//   // 2) Fallback DB check using RoleUser -> RolePermission -> Permission
//   // get role(s) for this user
//   const roleUsers = await RoleUser.findAll({
//     where: { model_id: req.user.id, model_type: "App\\Models\\User" },
//     attributes: ["role_id"],
//   });
//   const roleIds = roleUsers.map((r) => r.role_id).filter(Boolean);
//   if (!roleIds.length) return false;

//   // find permission records for allowedPerms
//   const perms = await Permission.findAll({
//     where: { name: { [Op.in]: allowedPerms } },
//     attributes: ["id", "name"],
//   });
//   const permIds = perms.map((p) => p.id).filter(Boolean);
//   if (!permIds.length) return false;

//   // check RolePermission
//   const rp = await RolePermission.findOne({
//     where: { role_id: { [Op.in]: roleIds }, permission_id: { [Op.in]: permIds } },
//   });

//   return !!rp;
// }


// async function getScope(req, module = "product", action = "view") {
//   const companyId = await getCompanyId(req);
//   const allowed = await hasPermission(req, module, action);

//   // if no company record or no permission -> only self
//   if (!companyId || !allowed) return [req.user.id];

//   // return company + employees under that company
//   const emps = await Employee.findAll({
//     where: { created_by: companyId },
//     attributes: ["user_id"],
//   });

//   const empIds = emps.map((e) => e.user_id).filter(Boolean);
//   // include company id as well (company user owns company records)
//   return Array.from(new Set([...empIds, companyId]));
// }

// module.exports = {
//   // GET all products
//   async index(req, res) {
//     try {
//       // users who are allowed to view (company + employees if permission)
//       const permittedUserIds = await getScope(req, "product", "view");

//       const products = await Product.findAll({
//         where: { created_by: { [Op.in]: permittedUserIds } },
//         include: [
//           { model: Category, as: "category" },
//           { model: Unit, as: "unit" },
//           { model: Tax, as: "tax" },
//           {
//             model: ChartOfAccount,
//             as: "saleAccount",
//             attributes: [
//               "id",
//               "name",
//               "code",
//               "type",
//               "sub_type",
//               "parent",
//               "is_enabled",
//               "description",
//               "created_by",
//               "created_at",
//               "updated_at",
//             ],
//           },
//           {
//             model: ChartOfAccount,
//             as: "expenseAccount",
//             attributes: [
//               "id",
//               "name",
//               "code",
//               "type",
//               "sub_type",
//               "parent",
//               "is_enabled",
//               "description",
//               "created_by",
//               "created_at",
//               "updated_at",
//             ],
//           },
//         ],
//         order: [["id", "DESC"]],
//       });

//       res.json({ code: 200, data: products });
//     } catch (err) {
//       console.error("Product Index Error:", err);
//       res.status(500).json({ code: 500, error: err.message || "Server error" });
//     }
//   },

//   // GET single product
//   async show(req, res) {
//     try {
//       const permittedUserIds = await getScope(req, "product", "view");

//       const product = await Product.findOne({
//         where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
//         include: [
//           { model: Category, as: "category" },
//           { model: Unit, as: "unit" },
//           { model: Tax, as: "tax" },
//           {
//             model: ChartOfAccount,
//             as: "saleAccount",
//             attributes: [
//               "id",
//               "name",
//               "code",
//               "type",
//               "sub_type",
//               "parent",
//               "is_enabled",
//               "description",
//               "created_by",
//               "created_at",
//               "updated_at",
//             ],
//           },
//           {
//             model: ChartOfAccount,
//             as: "expenseAccount",
//             attributes: [
//               "id",
//               "name",
//               "code",
//               "type",
//               "sub_type",
//               "parent",
//               "is_enabled",
//               "description",
//               "created_by",
//               "created_at",
//               "updated_at",
//             ],
//           },
//         ],
//       });

//       if (!product) return res.status(404).json({ code: 404, error: "Product not found" });
//       res.json({ code: 200, data: product });
//     } catch (err) {
//       console.error("Product Show Error:", err);
//       res.status(500).json({ code: 500, error: err.message || "Server error" });
//     }
//   },

//   // CREATE product
//   async create(req, res) {
//     try {
//       const allowed = await hasPermission(req, "product", "create");
//       if (!allowed) {
//         return res.status(403).json({ code: 403, error: "Permission denied" });
//       }

//       if (!req.body.name || req.body.name.trim() === "") {
//         return res.status(400).json({ code: 400, error: "Product name is required" });
//       }
//       if (!req.body.sale_price || isNaN(req.body.sale_price)) {
//         return res.status(400).json({ code: 400, error: "Sale price is required" });
//       }

//       const productData = { ...req.body };

//       // *** IMPORTANT: created_by must be the actual user who performed the create ***
//       productData.created_by = req.user.id;

//       // SKU: use provided sku if present; otherwise NULL (you can change to generateSKU() if you want)
//       if (req.body.sku && req.body.sku.trim() !== "") {
//         productData.sku = req.body.sku.trim();
//       } else {
//         productData.sku = null;
//       }

//       // Normalize numeric fields in case multipart/form-data sends strings
//       if (productData.sale_price) productData.sale_price = parseFloat(productData.sale_price);
//       if (productData.purchase_price) productData.purchase_price = parseFloat(productData.purchase_price);
//       if (productData.quantity) productData.quantity = parseFloat(productData.quantity);

//       if (req.file) {
//         productData.pro_image = path.relative(path.join(__dirname, ".."), req.file.path);
//       }

//       const product = await Product.create(productData);

//       await ProductLog.create({
//         product_id: product.id,
//         action: "created",
//         new_data: product.toJSON(),
//         created_by: req.user.id,
//       });

//       res.status(201).json({ code: 201, data: product });
//     } catch (err) {
//       console.error("Product Create Error:", err);
//       res.status(500).json({ code: 500, error: err.message || "Server error" });
//     }
//   },

//   // UPDATE product
//   async update(req, res) {
//     try {
//       const permittedUserIds = await getScope(req, "product", "edit");

//       const product = await Product.findOne({
//         where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
//       });
//       if (!product) return res.status(404).json({ code: 404, error: "Product not found" });

//       const oldData = product.toJSON();

//       const updateData = { ...req.body };
//       if (req.file) {
//         updateData.pro_image = path.relative(path.join(__dirname, ".."), req.file.path);
//       }

//       // update numeric fields if present
//       if (updateData.sale_price) updateData.sale_price = parseFloat(updateData.sale_price);
//       if (updateData.purchase_price) updateData.purchase_price = parseFloat(updateData.purchase_price);
//       if (updateData.quantity) updateData.quantity = parseFloat(updateData.quantity);

//       // *** UPDATED: set created_by to the actor who performed the update (per your request) ***
//       updateData.created_by = req.user.id;

//       await product.update(updateData);

//       await ProductLog.create({
//         product_id: product.id,
//         action: "updated",
//         old_data: oldData,
//         new_data: product.toJSON(),
//         created_by: req.user.id,
//       });

//       res.json({ code: 200, data: product });
//     } catch (err) {
//       console.error("Product Update Error:", err);
//       res.status(500).json({ code: 500, error: err.message || "Server error" });
//     }
//   },

//   // DELETE product (soft delete)
//   async destroy(req, res) {
//     try {
//       const permittedUserIds = await getScope(req, "product", "delete");

//       const product = await Product.findOne({
//         where: { id: req.params.id, created_by: { [Op.in]: permittedUserIds } },
//       });
//       if (!product) return res.status(404).json({ code: 404, error: "Product not found" });

//       // set created_by to the user who is deleting (per your request)
//       await product.update({ created_by: req.user.id });
//       const oldData = product.toJSON();

//       await product.destroy(); // paranoid => soft delete

//       await ProductLog.create({
//         product_id: product.id,
//         action: "deleted",
//         old_data: oldData,
//         created_by: req.user.id,
//       });

//       res.json({ code: 200, message: "Product deleted successfully" });
//     } catch (err) {
//       console.error("Product Delete Error:", err);
//       res.status(500).json({ code: 500, error: err.message || "Server error" });
//     }
//   },
// };
