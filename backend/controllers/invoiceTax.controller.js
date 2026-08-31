const InvoiceTax = require("../models/InvoiceTax.model");
const Invoice = require("../models/Invoice.model");

// Add tax row
exports.addTax = async (req, res) => {
  try {
    const { invoice_id, tax_type, rate, tax_amount } = req.body;

    const tax = await InvoiceTax.create({
      invoice_id,
      tax_type,
      rate,
      tax_amount
    });

    res.status(201).json({ success: true, data: tax });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get taxes by invoice
exports.getTaxesByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const taxes = await InvoiceTax.findAll({
      where: { invoice_id: invoiceId },
      include: [{ model: Invoice, as: "invoice" }]
    });

    res.status(200).json({ success: true, data: taxes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
