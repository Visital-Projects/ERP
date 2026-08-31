// const express = require("express");
// const router = express.Router();
// const invoiceController = require("../controllers/invoice.controller");
// const auth = require('../middlewares/auth.middleware');

// // Routes
// // router.post("/", auth,invoiceController.createInvoice);
// // router.get("/:id",auth, invoiceController.getInvoice);
// // router.get("/", auth,invoiceController.getInvoices);
// router.post("/",auth, invoiceController.createInvoice);        // Create
// router.get("/", auth,invoiceController.getAllInvoices);        // List all
// router.get("/:id",auth, invoiceController.getInvoiceById);     // Get by id
// router.put("/:id", auth,invoiceController.updateInvoice);      // Update
// router.delete("/:id",auth, invoiceController.deleteInvoice); 

// module.exports = router;

const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const auth = require('../middlewares/auth.middleware');
const { generateInvoicePDF } = require("../Template/invoiceGenerator");
const authorize = require("../middlewares/authorize");
const Invoice = require("../models/Invoice.model");
// const { companyDetails } = require("../controllers/invoice.controller"); // import company details
const Customer = require("../models/customer.model"); // ✅ import Customer model
const InvoiceItem = require("../models/InvoiceItem"); // import InvoiceItem model
const InvoiceTax = require("../models/InvoiceTax.model"); // import InvoiceTax model
const fs = require("fs");           // ✅ Add this
const path = require("path");


const companyDetails = {
  name: "VENKATESWAR ENGINEERING WORKS",
  address:
    "DUPURI S.O, SAD NUA NAGA, JHARSUGUDA, JHARSUGUDA, ODISHA - 768202, WORKSHOP: HINAYAT NAGAR, BACHCHAN, TANAHAL DARPAN, HOUSE 15, JUAIPUR, P.S: KHORDHA, KHORDHA - 752064",
  gst_number: "21EXAMPLE1234Z5Y",
  pan_number: "ARXPK7658Q",
  state_name: "Odisha",
  state_code: "21",
  email: "venkat_j2y@yahoo.co.in",
  bank_name: "AXIS BANK LIMITED",
  account_no: "911020042168303",
  ifsc: "UTIB0000550",
  branch: "BIDANASI, CUTTACK, ODISHA",
  declaration:
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};


router.get("/:id/pdf", auth, authorize("read_invoice"), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: InvoiceItem, as: "items" },
        { model: InvoiceTax, as: "taxes" }
      ]
    });

    if (!invoice) return res.status(404).send("Invoice not found");

    const invoiceData = invoice.toJSON();
    invoiceData.company = companyDetails;

    // Generate and store PDF
    const pdfPath = await generateInvoicePDF(invoiceData);

    // Return PDF path or filename
    res.json({
      success: true,
      message: "PDF generated and stored successfully",
      pdfPath: pdfPath
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});








router.post("/", auth, authorize("create_invoice"), invoiceController.createInvoice);
router.get("/", auth, authorize("read_invoice"), invoiceController.getAllInvoices);
router.get("/:id", auth, authorize("read_invoice"), invoiceController.getInvoiceById);
router.put("/:id", auth, authorize("update_invoice"), invoiceController.updateInvoice);
router.delete("/:id", auth, authorize("delete_invoice"), invoiceController.deleteInvoice);

module.exports = router;
