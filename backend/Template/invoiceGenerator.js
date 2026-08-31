
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const { toWords } = require("number-to-words");

// Local Chrome path
// const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Folder to save PDFs
const folderPath = path.join(__dirname, "..", "invoices");
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

async function generateInvoicePDF(invoice) {
  try {
    invoice.company = invoice.company || {};

    // Calculate totals if not already
    let totalAmount = 0;
    (invoice.items || []).forEach(item => {
      const qty = item.quantity || 0;
      const rate = item.rate || 0;
      totalAmount += qty * rate;
    });

    let totalTax = 0;
    (invoice.taxes || []).forEach(tax => {
      totalTax += tax.amount || 0;
    });

    const grandTotal = totalAmount + totalTax;

    // Convert total to words
    invoice.amountInWords = `Indian Rupees ${toWords(grandTotal).replace(/,/g, '')} Only`;

    // Load EJS template
    const templatePath = path.join(__dirname, "invoiceTemplate.html");
    const html = await ejs.renderFile(templatePath, { invoice, company: invoice.company });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process'
  ],
  timeout: 60000
});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Sanitize invoice number for filename
    const safeInvoiceNumber = invoice.invoice_number.replace(/[\/\\:*?"<>|]/g, "-");
    // const pdfPath = path.join(SAVE_FOLDER, `Invoice-${safeInvoiceNumber}.pdf`);

    // // Generate PDF
    // await page.pdf({
    //   path: pdfPath,
    //   format: "A4",
    //   printBackground: true,
    //   margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    // });
    const pdfPath = path.join(folderPath, `Invoice-${safeInvoiceNumber}.pdf`);
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
});
 await browser.close();
    return pdfPath;


   

  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

module.exports = { generateInvoicePDF };
