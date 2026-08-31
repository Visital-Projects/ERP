const InvoiceItem = require("../models/InvoiceItem");
const Invoice = require("../models/Invoice.model");
const InvoiceTax = require("../models/InvoiceTax.model");
const Customer = require("../models/customer.model");
const { recalcInvoice } = require("../utils/invoiceUtils");




exports.createItem = async (req, res) => {
  const t = await InvoiceItem.sequelize.transaction();
  try {
    const { invoice_id, items } = req.body;
    if (!items || !items.length) throw new Error("At least 1 item is required");

    const createdItems = [];

    for (const item of items) {
      if (!item.title) throw new Error("Item title is required");
      if (!item.description) throw new Error("Item description is required");
      if (!item.quantity) throw new Error("Item quantity is required");
      if (!item.unit) throw new Error("Item unit is required");
      if (!item.rate) throw new Error("Item rate is required");

      const quantity = parseFloat(item.quantity);
      const rate = parseFloat(item.rate);
      const amount = quantity * rate;

      const newItem = await InvoiceItem.create(
        {
          invoice_id: invoice_id || null, // ✅ may be null
          title: item.title,
          description: item.description,
          hsn_sac: item.hsn_sac || "",
          quantity,
          unit: item.unit,
          rate,
          amount,
          created_by: req.user?.id || null,
        },
        { transaction: t }
      );

      createdItems.push(newItem);
    }

    await t.commit();

    let updatedInvoice = null;
    if (invoice_id) {
      // ✅ Only recalc invoice if invoice_id is present
      updatedInvoice = await recalcInvoice(invoice_id);
    }

    res.status(201).json({
      success: true,
      message: invoice_id
        ? "Items added & invoice updated"
        : "Items created without invoice",
      data: invoice_id ? updatedInvoice : createdItems,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, error: error.message });
  }
};



// ✅ Get items of an invoice
exports.getItemsByInvoice = async (req, res) => {
  try {
    const items = await InvoiceItem.findAll({
      where: { invoice_id: req.params.invoiceId },
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update single item
exports.updateItem = async (req, res) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    await item.update(req.body);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    await item.destroy();
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Get ALL items (no filter)
exports.getAllItems = async (req, res) => {
  try {
    const items = await InvoiceItem.findAll();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Get single item by ID (always return array)
exports.getItemById = async (req, res) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);
    if (!item) {
      return res.status(200).json({ success: true, data: [] }); // empty array if not found
    }
    res.status(200).json({ success: true, data: [item] }); // wrap in array
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

