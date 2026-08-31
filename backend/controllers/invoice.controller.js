

const { Op } = require("sequelize");
const Invoice = require("../models/Invoice.model");
const Customer = require("../models/customer.model");
const InvoiceItem = require("../models/InvoiceItem");
const InvoiceTax = require("../models/InvoiceTax.model");
const crypto = require("crypto");

// ✅ Generate random IRN (simulate Govt hash)
function generateIRN(invoiceId) {
  const randomString = crypto.randomBytes(16).toString("hex"); // 32 chars
  return `${randomString}-${invoiceId}`;
}

// ✅ Generate random Ack No
function generateAckNo() {
  return Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
}



// ✅ (NEW) Company static details (can later be moved to DB)
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
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct",
};

// ✅ Helper: get financial year string (YY-YY)
function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let startYear, endYear;

  if (month >= 4) {
    startYear = year % 100;
    endYear = (year + 1) % 100;
  } else {
    startYear = (year - 1) % 100;
    endYear = year % 100;
  }
  return `${startYear.toString().padStart(2, "0")}-${endYear
    .toString()
    .padStart(2, "0")}`;
}

// ✅ Auto-generate Invoice Number
async function generateInvoiceNumber() {
  const prefix = "VEW";
  const fy = getFinancialYear();

  const lastInvoice = await Invoice.findOne({
    where: { invoice_number: { [Op.like]: `${prefix}/${fy}/%` } },
    order: [["created_at", "DESC"]],
  });

  let seq = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoice_number.split("/");
    seq = parseInt(parts[2]) + 1;
  }
  return `${prefix}/${fy}/${seq}`;
}



// ✅ Number to words (with "Indian Rupees" prefix)
function numberToWords(num) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen",
    "Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }

  return `Indian Rupees ${inWords(Math.floor(num))} Only`;
}


// ✅ Auto-generate Buyer Order Number
async function generateBuyerOrderNo() {
  const prefix = "NRISPAT";
  const fy = getFinancialYear();

  const lastInvoice = await Invoice.findOne({
    where: { buyer_order_no: { [Op.like]: `${prefix}/${fy}/%` } },
    order: [["created_at", "DESC"]],
  });

  let seq = 1;
  if (lastInvoice && lastInvoice.buyer_order_no) {
    const parts = lastInvoice.buyer_order_no.split("/");
    seq = parseInt(parts[2]) + 1;
  }
  return `${prefix}/${fy}/${seq}`;
}

function formatDate(date) {
  if (!date) return null;

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");

  // custom month mapping
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()]; // always "Sep" not "Sept"

  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}




// ✅ Create Invoice (add new fields)
// exports.createInvoice = async (req, res) => {
//   const t = await Invoice.sequelize.transaction();
//   try {
//     // const invoice_number = await generateInvoiceNumber();
//     const invoice_number = await generateInvoiceNumber();
//     const buyer_order_no = await generateBuyerOrderNo();

//     const invoice = await Invoice.create(
//       {
//         ...req.body,
//         invoice_number,
//         buyer_order_no,
//         authorized_signatory: "JAYA RAM KOTHARI",
//          created_by: req.user.id, 
//          issue_date: req.body.issue_date || new Date(), 

//         // ensure all new fields are captured
//         // buyer_order_no: req.body.buyer_order_no,
//         buyer_order_date: req.body.buyer_order_date,
//         delivery_note: req.body.delivery_note,
//         mode_of_payment: req.body.mode_of_payment,
//         other_references: req.body.other_references,
//         dispatched_through: req.body.dispatched_through,
//         destination: req.body.destination,
//         // authorized_signatory: req.body.authorized_signatory,

//         taxable_value: 0,
//         tax_amount: 0,
//         tax_amount_in_words:"",
//         total_amount: 0,
//         amount_in_words: "",
//         round_off: 0,
//         irn: null,
//         ack_no: null,
//         ack_date: null,
//         qr_code_url: null,
//         amount_paid: parseFloat(req.body.amount_paid || 0),
//       },
//       { transaction: t }
//     );

//     // ... your items + taxes logic unchanged ...


//     let taxable_value = 0;
//     let total_quantity = 0; 

//     // 2️⃣ Items
//     if (req.body.items?.length) {
//       for (const item of req.body.items) {
//         await InvoiceItem.create(
//           { ...item, invoice_id: invoice.id },
//           { transaction: t }
//         );
//         taxable_value += parseFloat(item.amount);
//         total_quantity += parseFloat(item.quantity);
//       }
//     }

//     // // 3️⃣ Taxes
//     // let totalTax = 0;
//     // if (req.body.gst_type === "IGST") {
//     //   const rate = 18;
//     //   const taxAmt = (taxable_value * rate) / 100;
//     //   totalTax += taxAmt;

//     //   await InvoiceTax.create(
//     //     { invoice_id: invoice.id, tax_type: "IGST", rate, tax_amount: taxAmt },
//     //     { transaction: t }
//     //   );
//     // } else if (req.body.gst_type === "CGST_SGST") {
//     //   const rate = 9;
//     //   const cgst = (taxable_value * rate) / 100;
//     //   const sgst = (taxable_value * rate) / 100;
//     //   totalTax += cgst + sgst;

//     //   await InvoiceTax.bulkCreate(
//     //     [
//     //       { invoice_id: invoice.id, tax_type: "CGST", rate, tax_amount: cgst },
//     //       { invoice_id: invoice.id, tax_type: "SGST", rate, tax_amount: sgst },
//     //     ],
//     //     { transaction: t }
//     //   );
//     // }

//     // 3️⃣ Taxes (Auto decide IGST vs CGST+SGST)
// let totalTax = 0;

// // fetch customer state_code
// const customer = await Customer.findByPk(req.body.customer_id);
// if (!customer) throw new Error("Customer not found");

// if (companyDetails.state_code === customer.state_code) {
//   // Same state → CGST + SGST
//   const rate = 9;
//   const cgst = (taxable_value * rate) / 100;
//   const sgst = (taxable_value * rate) / 100;
//   totalTax += cgst + sgst;

//   await InvoiceTax.bulkCreate(
//     [
//       { invoice_id: invoice.id, tax_type: "CGST", rate, tax_amount: cgst },
//       { invoice_id: invoice.id, tax_type: "SGST", rate, tax_amount: sgst },
//     ],
//     { transaction: t }
//   );
// } else {
//   // Different state → IGST
//   const rate = 18;
//   const taxAmt = (taxable_value * rate) / 100;
//   totalTax += taxAmt;

//   await InvoiceTax.create(
//     { invoice_id: invoice.id, tax_type: "IGST", rate, tax_amount: taxAmt },
//     { transaction: t }
//   );
// }


//     // 4️⃣ Totals + Round off
//     const total_amount = taxable_value + totalTax;
//     const rounded_total = Math.round(total_amount);
//     const round_off = parseFloat((rounded_total - total_amount).toFixed(2));

//     const amountPaid = parseFloat(req.body.amount_paid || 0);
//     const balanceDue = rounded_total - amountPaid;

//     // 5️⃣ IRN, Ack & QR Code (auto-generate)
// const irn = generateIRN(invoice.id);
// const ack_no = generateAckNo();
// const ack_date = new Date(); // current date
// const qr_code_url = `/qrcode/${irn}.png`;


//     await invoice.update(
//       {
//         taxable_value,
//         tax_amount: totalTax,
//         total_amount: rounded_total,
//         round_off,
//         amount_in_words: numberToWords(rounded_total),
//         // tax_amount_in_words: numberToWords(totalTax),
//         tax_amount_in_words: numberToWords(totalTax), 
        
//         balance_due: balanceDue, // automatically calculated
//         amount_paid: amountPaid,
//          // ✅ new autogenerated fields
//     irn,
//     ack_no,
//     ack_date,
//     qr_code_url,
//     total_quantity
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     // 5️⃣ Return with relations
//     const fullInvoice = await Invoice.findByPk(invoice.id, {
//       include: [
//         { model: Customer, as: "customer" },
//         { model: InvoiceItem, as: "items" },
//         { model: InvoiceTax, as: "taxes" },
//       ],
//     });

//   const invoiceJson = fullInvoice.toJSON();
// invoiceJson.ack_date = formatDate(invoiceJson.ack_date);
// invoiceJson.issue_date = formatDate(invoiceJson.issue_date);

// res.status(201).json({
//   success: true,
//   data: { ...invoiceJson, company: companyDetails }, // ✅ keep formatted ack_date
// });

//   } catch (error) {
//     await t.rollback();
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

exports.createInvoice = async (req, res) => {
  const t = await Invoice.sequelize.transaction();
  try {
    const invoice_number = await generateInvoiceNumber();
    const buyer_order_no = await generateBuyerOrderNo();

    const invoice = await Invoice.create(
      {
        ...req.body,
        invoice_number,
        buyer_order_no,
        authorized_signatory: "JAYA RAM KOTHARI",
        created_by: req.user.id,
        issue_date: req.body.issue_date || new Date(),

        taxable_value: 0,
        tax_amount: 0,
        tax_amount_in_words: "",
        total_amount: 0,
        amount_in_words: "",
        round_off: 0,
        irn: null,
        ack_no: null,
        ack_date: null,
        qr_code_url: null,
        amount_paid: parseFloat(req.body.amount_paid || 0),
      },
      { transaction: t }
    );

    let taxable_value = 0;
    let total_quantity = 0;

    // ✅ CASE 1: Attach existing items by IDs
    if (req.body.item_ids?.length) {
      const items = await InvoiceItem.findAll({
        where: { id: req.body.item_ids },
      });

      for (const item of items) {
        await item.update({ invoice_id: invoice.id }, { transaction: t });
        taxable_value += parseFloat(item.amount);
        total_quantity += parseFloat(item.quantity);
      }
    }

    // ✅ CASE 2: New inline items
    if (req.body.items?.length) {
      for (const item of req.body.items) {
        const createdItem = await InvoiceItem.create(
          { ...item, invoice_id: invoice.id },
          { transaction: t }
        );
        taxable_value += parseFloat(createdItem.amount);
        total_quantity += parseFloat(createdItem.quantity);
      }
    }

    // ✅ Taxes
    let totalTax = 0;
    const customer = await Customer.findByPk(req.body.customer_id);
    if (!customer) throw new Error("Customer not found");

    if (companyDetails.state_code === customer.state_code) {
      // CGST + SGST
      const rate = 9;
      const cgst = (taxable_value * rate) / 100;
      const sgst = (taxable_value * rate) / 100;
      totalTax += cgst + sgst;

      await InvoiceTax.bulkCreate(
        [
          { invoice_id: invoice.id, tax_type: "CGST", rate, tax_amount: cgst },
          { invoice_id: invoice.id, tax_type: "SGST", rate, tax_amount: sgst },
        ],
        { transaction: t }
      );
    } else {
      // IGST
      const rate = 18;
      const taxAmt = (taxable_value * rate) / 100;
      totalTax += taxAmt;

      await InvoiceTax.create(
        { invoice_id: invoice.id, tax_type: "IGST", rate, tax_amount: taxAmt },
        { transaction: t }
      );
    }

    // ✅ Totals
    const total_amount = taxable_value + totalTax;
    const rounded_total = Math.round(total_amount);
    const round_off = parseFloat((rounded_total - total_amount).toFixed(2));

    const amountPaid = parseFloat(req.body.amount_paid || 0);
    const balanceDue = rounded_total - amountPaid;

    // ✅ IRN, Ack & QR Code
    const irn = generateIRN(invoice.id);
    const ack_no = generateAckNo();
    const ack_date = new Date();
    const qr_code_url = `/qrcode/${irn}.png`;

    await invoice.update(
      {
        taxable_value,
        tax_amount: totalTax,
        total_amount: rounded_total,
        round_off,
        amount_in_words: numberToWords(rounded_total),
        tax_amount_in_words: numberToWords(totalTax),
        balance_due: balanceDue,
        amount_paid: amountPaid,
        irn,
        ack_no,
        ack_date,
        qr_code_url,
        total_quantity,
      },
      { transaction: t }
    );

    await t.commit();

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: InvoiceItem, as: "items" },
        { model: InvoiceTax, as: "taxes" },
      ],
    });

    const invoiceJson = fullInvoice.toJSON();
    invoiceJson.ack_date = formatDate(invoiceJson.ack_date);
    invoiceJson.issue_date = formatDate(invoiceJson.issue_date);

    res.status(201).json({
      success: true,
      data: { ...invoiceJson, company: companyDetails },
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, error: error.message });
  }
};


// ✅ Get Invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: InvoiceItem, as: "items" },
        { model: InvoiceTax, as: "taxes" },
      ],
    });
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    res.status(200).json({
      success: true,
      data: { ...invoice.toJSON(), company: companyDetails },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Customer, as: "customer" },
        { model: InvoiceItem, as: "items" },
        { model: InvoiceTax, as: "taxes" },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: invoices.map((inv) => ({ ...inv.toJSON(), company: companyDetails })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// exports.updateInvoice = async (req, res) => {
//   try {
//     const invoice = await Invoice.findByPk(req.params.id);
//     if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

//     await invoice.update(req.body);

//     // ✅ Recalculate balance_due if total_amount or amount_paid changed
//     if (req.body.amount_paid !== undefined || req.body.total_amount !== undefined) {
//       const updatedAmountPaid = parseFloat(req.body.amount_paid ?? invoice.amount_paid);
//       const updatedTotalAmount = parseFloat(req.body.total_amount ?? invoice.total_amount);
//       invoice.balance_due = updatedTotalAmount - updatedAmountPaid;
//       await invoice.save();
//     }

//     res.status(200).json({ success: true, data: invoice });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// ✅ Delete Invoice

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    // Remove fields from update input
    delete req.body.buyer_order_no;
    delete req.body.authorized_signatory;

    await invoice.update(req.body);

    // ✅ Recalculate balance_due if total_amount or amount_paid changed
    if (req.body.amount_paid !== undefined || req.body.total_amount !== undefined) {
      const updatedAmountPaid = parseFloat(req.body.amount_paid ?? invoice.amount_paid);
      const updatedTotalAmount = parseFloat(req.body.total_amount ?? invoice.total_amount);
      invoice.balance_due = updatedTotalAmount - updatedAmountPaid;
      await invoice.save();
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    await invoice.destroy();
    res.status(200).json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
