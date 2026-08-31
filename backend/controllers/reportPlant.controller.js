const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Branch, WorkingZone, Vendor, BillPaid } = require("../models");

const generatePlantReport = async (req, res) => {
  try {
    // ✅ Fetch branches with zones, vendors, and bills
    const branches = await Branch.findAll({
      include: [
        {
          model: WorkingZone,
          as: "working_zones",
          include: [
            {
              model: Vendor,
              as: "vendors",
              include: [{ model: BillPaid, as: "bills" }],
            },
          ],
        },
      ],
    });

    // ✅ Prepare Excel folder
    const folderPath = path.join(__dirname, "..", "excel");
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    // ✅ Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Branch Vendor Report");

    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value =
      "Branch wise report vendor Bills and Payments / GST (Adjustable)";
    worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("A1").font = { bold: true, size: 14 };

    let currentRow = 3;

    for (const branch of branches) {
      worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = `Branch: ${branch.name} (ID: ${branch.id})`;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      worksheet.getRow(currentRow).values = [
        "Working Zone",
        "Vendor Name",
        "Bill received inc GST",
        "Basic",
        "GST",
      ];
      worksheet.getRow(currentRow).font = { bold: true };
      worksheet.getRow(currentRow).alignment = { horizontal: "center" };
      currentRow++;

      for (const zone of branch.working_zones) {
        if (zone.vendors.length > 0) {
          for (const vendor of zone.vendors) {
            if (vendor.bills.length > 0) {
              for (const bill of vendor.bills) {
                worksheet.getRow(currentRow).values = [
                  zone.name,
                  vendor.name,
                  Number(bill.bill_received_in_gst) || 0,
                  Number(bill.base_amount) || 0,
                  Number(bill.total_tax) || 0,
                ];
                currentRow++;
              }
            } else {
              worksheet.getRow(currentRow).values = [zone.name, vendor.name, 0, 0, 0];
              currentRow++;
            }
          }
        } else {
          worksheet.getRow(currentRow).values = [zone.name, "-", 0, 0, 0];
          currentRow++;
        }
      }
      currentRow++;
    }

    // ✅ Define column widths
    worksheet.columns = [
      { key: "working_zone", width: 20 },
      { key: "vendor_name", width: 25 },
      { key: "bill_received_inc_gst", width: 20 },
      { key: "basic", width: 15 },
      { key: "gst", width: 15 },
    ];

    // ✅ Save file
    const fileName = `branch_report_${Date.now()}.xlsx`;
    const filePath = path.join(folderPath, fileName);
    await workbook.xlsx.writeFile(filePath);

    res.json({ success: true, downloadUrl: `/excel/${fileName}` });
  } catch (err) {
    console.error("❌ Error generatePlantReport:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: err.message,
    });
  }
};

module.exports = { generatePlantReport };
