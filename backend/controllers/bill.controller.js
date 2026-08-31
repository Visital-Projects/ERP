// controllers/bill.controller.js

const Bill = require("../models/bill.model");
const BillProduct = require("../models/billProducts.model");
const Vender = require("../models/vender.model");
const Category = require("../models/category.model");

// Helper: Get company id
async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === "company") return req.user.id;
  return null;
}

// ===============================
// Helper for calculations
// ===============================
function calculateBill(bill) {
  let subTotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  if (bill.products && bill.products.length > 0) {
    bill.products.forEach((p) => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      const discount = Number(p.discount) || 0;
      const tax = Number(p.tax) || 0;

      const lineTotal = qty * price;
      const discountAmount = (lineTotal * discount) / 100; // % discount
      const taxAmount = ((lineTotal - discountAmount) * tax) / 100;

      subTotal += lineTotal;
      discountTotal += discountAmount;
      taxTotal += taxAmount;
    });
  }

  const totalAmount = subTotal - discountTotal + taxTotal;

  return {
    sub_total: subTotal.toFixed(2),
    discount: discountTotal.toFixed(2),
    tax: taxTotal.toFixed(2),
    total: totalAmount.toFixed(2),
  };
}

// ===============================
// GET ALL BILLS
// ===============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const bills = await Bill.findAll({
      where: { created_by: companyId, is_deleted: false },
      include: [
        { model: Vender, as: "vender", attributes: ["id", "name", "vender_id"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: BillProduct, as: "products" },
      ],
      order: [["id", "DESC"]],
    });

    const billsWithCalc = bills.map((bill) => {
      const calc = calculateBill(bill);
      return {
        ...bill.toJSON(),
        calculations: calc,
      };
    });

    res.json({ success: true, data: billsWithCalc });
  } catch (err) {
    console.error("Error fetching bills:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ===============================
// GET BILL BY ID
// ===============================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const bill = await Bill.findOne({
      where: { id: req.params.id, created_by: companyId, is_deleted: false },
      include: [
        { model: Vender, as: "vender", attributes: ["id", "name", "vender_id"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: BillProduct, as: "products" },
      ],
    });

    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    const calc = calculateBill(bill);

    res.json({
      success: true,
      data: {
        ...bill.toJSON(),
        calculations: calc,
      },
    });
  } catch (err) {
    console.error("Error fetching bill:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ===============================
// CREATE BILL
// ===============================
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const { vender_id, bill_date, due_date, order_number, category_id, products } =
      req.body;

    if (
      !vender_id ||
      !bill_date ||
      !due_date ||
      !category_id ||
      !products?.length
    )
      return res.status(400).json({
        success: false,
        message:
          "vender_id, bill_date, due_date, category_id, products are required",
      });

    const vender = await Vender.findOne({
      where: { vender_id, created_by: companyId },
    });
    if (!vender)
      return res.status(400).json({ success: false, message: "Invalid vender_id" });

    const category = await Category.findOne({ where: { id: category_id } });
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Invalid category_id" });

    const lastBill = await Bill.findOne({
      where: { created_by: companyId },
      order: [["bill_id", "DESC"]],
    });
    const newBillId = lastBill ? parseInt(lastBill.bill_id) + 1 : 1;

    // ================= Calculation Part =================
    let sub_total = 0,
      total_discount = 0,
      total_tax = 0,
      total_amount = 0;

    const productItems = products.map((p) => {
      const itemSubtotal = p.price * p.quantity;
      const itemDiscount = (itemSubtotal * (p.discount || 0)) / 100;
      const itemTax = ((itemSubtotal - itemDiscount) * (p.tax || 0)) / 100;
      const itemAmount = itemSubtotal - itemDiscount + itemTax;

      sub_total += itemSubtotal;
      total_discount += itemDiscount;
      total_tax += itemTax;
      total_amount += itemAmount;

      return {
        product_id: p.product_id,
        quantity: p.quantity,
        price: p.price,
        discount: p.discount || 0,
        tax: p.tax || 0,
        amount: itemAmount,
        description: p.description || "",
        bill_id: null, // set after bill create
      };
    });

    const bill = await Bill.create({
      bill_id: newBillId.toString(),
      vender_id: vender.id,
      bill_date,
      due_date,
      order_number: order_number || "",
      category_id,
      sub_total,
      total_discount,
      total_tax,
      total_amount,
      type: "Bill",
      user_type: "Vendor",
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    });

    productItems.forEach((item) => (item.bill_id = bill.id));
    await BillProduct.bulkCreate(productItems);

    const createdBill = await Bill.findOne({
      where: { id: bill.id },
      include: [
        { model: BillProduct, as: "products" },
        { model: Vender, as: "vender", attributes: ["id", "name", "vender_id"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    const calc = calculateBill(createdBill);

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: {
        ...createdBill.toJSON(),
        calculations: calc,
      },
    });
  } catch (err) {
    console.error("Error creating bill:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ===============================
// UPDATE BILL
// ===============================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const bill = await Bill.findOne({
      where: { id: req.params.id, created_by: companyId, is_deleted: false },
    });
    if (!bill)
      return res.status(404).json({ success: false, message: "Bill not found" });

    const { vender_id, category_id, products } = req.body;

    if (vender_id) {
      const vender = await Vender.findOne({
        where: { vender_id, created_by: companyId },
      });
      if (!vender)
        return res
          .status(400)
          .json({ success: false, message: "Invalid vender_id" });
      req.body.vender_id = vender.id;
    }

    if (category_id) {
      const category = await Category.findOne({ where: { id: category_id } });
      if (!category)
        return res
          .status(400)
          .json({ success: false, message: "Invalid category_id" });
    }

    if (products?.length) {
      let sub_total = 0,
        total_discount = 0,
        total_tax = 0,
        total_amount = 0;

      const productItems = products.map((p) => {
        const itemSubtotal = p.price * p.quantity;
        const itemDiscount = (itemSubtotal * (p.discount || 0)) / 100;
        const itemTax = ((itemSubtotal - itemDiscount) * (p.tax || 0)) / 100;
        const itemAmount = itemSubtotal - itemDiscount + itemTax;

        sub_total += itemSubtotal;
        total_discount += itemDiscount;
        total_tax += itemTax;
        total_amount += itemAmount;

        return {
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
          discount: p.discount || 0,
          tax: p.tax || 0,
          amount: itemAmount,
          description: p.description || "",
          bill_id: bill.id,
        };
      });

      await BillProduct.destroy({ where: { bill_id: bill.id } });
      await BillProduct.bulkCreate(productItems);
      await bill.update({ sub_total, total_discount, total_tax, total_amount });
    }

    await bill.update({
      ...req.body,
      type: "Bill",
      user_type: "Vendor",
      updated_at: new Date(),
    });

    const updatedBill = await Bill.findOne({
      where: { id: bill.id },
      include: [
        { model: BillProduct, as: "products" },
        { model: Vender, as: "vender", attributes: ["id", "name", "vender_id"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    const calc = calculateBill(updatedBill);

    res.json({
      success: true,
      message: "Bill updated successfully",
      data: {
        ...updatedBill.toJSON(),
        calculations: calc,
      },
    });
  } catch (err) {
    console.error("Error updating bill:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ===============================
// DELETE BILL (soft delete)
// ===============================
exports.delete = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const bill = await Bill.findOne({
      where: { id: req.params.id, created_by: companyId, is_deleted: false },
    });
    if (!bill)
      return res.status(404).json({ success: false, message: "Bill not found" });

    await bill.update({ is_deleted: true });
    await BillProduct.update(
      { is_deleted: true },
      { where: { bill_id: bill.id } }
    );

    res.json({
      success: true,
      message: "Bill deleted successfully",
      data: { id: req.params.id },
    });
  } catch (err) {
    console.error("Error deleting bill:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
