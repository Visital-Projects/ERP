

const Invoice = require("../models/Invoice.model");
const InvoiceTax = require("../models/InvoiceTax.model");
const Customer = require("../models/customer.model");
const companyDetails = require("../config/companyDetails");

// Helper function to convert numbers to words (Indian Rupees)
function numberToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  function convert(num) {
    if (num < 10) return ones[num];
    if (num >= 10 && num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "");
  }

  return "Indian Rupees " + convert(Math.round(amount)) + " Only";
}
async function recalcInvoice(invoice_id) {
  // 1️⃣ Fetch invoice and items
  const invoice = await Invoice.findByPk(invoice_id, { include: ["items"] });
  if (!invoice) throw new Error("Invoice not found");

  const customer = await Customer.findByPk(invoice.customer_id);
  if (!customer) throw new Error("Customer not found");

  // 2️⃣ Calculate taxable value
//   let taxable_value = 0;
//   invoice.items.forEach(item => {
//     taxable_value += parseFloat(item.amount);
//   });
 // 2️⃣ Calculate taxable value and total quantity
  let taxable_value = 0;
  let total_quantity = 0;
  invoice.items.forEach(item => {
    taxable_value += parseFloat(item.amount);
    total_quantity += parseFloat(item.quantity); // ✅ total quantity
  });

  // 3️⃣ Calculate taxes
  let totalTax = 0;
  await InvoiceTax.destroy({ where: { invoice_id } }); // clear old taxes

  if (companyDetails.state_code === customer.state_code) {
    // Same state → CGST + SGST
    const rate = 9;
    const cgst = (taxable_value * rate) / 100;
    const sgst = (taxable_value * rate) / 100;
    totalTax = cgst + sgst;

    await InvoiceTax.bulkCreate([
      { invoice_id, tax_type: "CGST", rate, tax_amount: cgst },
      { invoice_id, tax_type: "SGST", rate, tax_amount: sgst },
    ]);
  } else {
    // Different state → IGST
    const rate = 18;
    const igst = (taxable_value * rate) / 100;
    totalTax = igst;

    await InvoiceTax.create({ invoice_id, tax_type: "IGST", rate, tax_amount: igst });
  }

  // 4️⃣ Calculate total, round off, balance due
  const total_amount = taxable_value + totalTax;
  const rounded_total = Math.round(total_amount);
  const round_off = parseFloat((rounded_total - total_amount).toFixed(2));

  const amountPaid = parseFloat(invoice.amount_paid || 0);
  const balance_due = rounded_total - amountPaid;

  // 5️⃣ Update invoice
  await invoice.update({
    taxable_value,
    tax_amount: totalTax,
    total_amount: rounded_total,
    round_off,
    amount_in_words: numberToWords(rounded_total),
    tax_amount_in_words: numberToWords(totalTax),
    balance_due,
    total_quantity,
  });

  return await Invoice.findByPk(invoice_id, {
    include: ["items", "taxes", "customer"],
  });
}

module.exports = { recalcInvoice };