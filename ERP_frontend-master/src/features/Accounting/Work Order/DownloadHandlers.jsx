// src/components/DownloadHandlers.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export const handleDownloadPDF = async (summaryData, fetchPreview) => {
  if (!summaryData) await fetchPreview();

  const doc = new jsPDF("p", "pt");
  let y = 40;

  const branchName = summaryData.branch_name || "Branch Name";
  const branchAddress = summaryData.branch_address || "Branch Address";
  const branchContact = summaryData.branch_contact || "Branch Contact";

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(branchName, doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 16;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(branchAddress, doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 12;
  doc.text(`Contact: ${branchContact}`, doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 20;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Work Order Details", 40, y);
  y += 15;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const workOrderDetails = {
    ...(summaryData.workOrder || {}),
    ...(summaryData.wo_number && { wo_number: summaryData.wo_number }),
  };

  Object.entries(workOrderDetails).forEach(([key, val]) => {
    if (key !== "wo_id" && key !== "id" && key !== "branch_id") {
      doc.text(`${key.replace(/_/g, " ")}: ${val ?? "-"}`, 50, y);
      y += 12;
    }
  });
  y += 10;

  const addSectionTitle = (title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, 40, y);
    y += 12;
    doc.setFont("helvetica", "normal");
  };

  if (summaryData.profit_calculation) {
    addSectionTitle("Profit Calculation");
    doc.setFontSize(9);
    Object.entries(summaryData.profit_calculation).forEach(([key, val]) => {
      if (!String(key).toLowerCase().includes("formula") && !String(val).includes("formula")) {
        doc.text(`${key.replace(/_/g, " ")}: ${val ?? "-"}`, 50, y);
        y += 12;
      }
    });
    y += 10;
  }

  addSectionTitle("Financial Summary");
  const fs = summaryData;
  const financialData = [
    ["Base Amount with GST", fs.base_amount_with_gst ?? "-"],
    ["Total Received", fs.total_received ?? "-"],
    ["Remaining Amount", fs.remaining_amount ?? "-"],
    ["Total Invoice Amount", fs.total_invoice_amount ?? "-"],
    ["Total Expenses", fs.total_expenses ?? "-"],
    ["Total Taxable Expenses", fs.total_taxable_expenses ?? "-"],
    ["Total Non-Taxable Expenses", fs.total_non_taxable_expenses ?? "-"],
    ["Total Salaries", fs.total_salaries ?? "-"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Item", "Amount"]],
    body: financialData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 160, 133] },
    margin: { left: 40, right: 40 },
  });
  y = doc.lastAutoTable.finalY + 20;

  const addTable = (rows, title) => {
    if (!rows || !rows.length) return;
    addSectionTitle(title);
    autoTable(doc, {
      startY: y,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 40, right: 40 },
    });
    y = doc.lastAutoTable.finalY + 20;
  };

  addTable(summaryData.invoices, "Invoices");
  addTable(summaryData.taxable_expenses, "Taxable Expenses");
  addTable(summaryData.non_taxable_expenses, "Non-Taxable Expenses");
  addTable(summaryData.payslips, "Payslips");

  const woNumber = summaryData.wo_number || "WorkOrder";
  doc.save(`${woNumber}_Summary.pdf`);
  toast.success("PDF downloaded successfully");
};

export const handleDownloadExcel = async (summaryData, fetchPreview) => {
  if (!summaryData) {
    await fetchPreview();
    if (!summaryData) {
      toast.error("Failed to load summary data");
      return;
    }
  }

  const wb = XLSX.utils.book_new();
  let sheetData = [];

  sheetData.push(["Branch Information"]);
  sheetData.push(["Branch Name", summaryData.branch_name || "-"]);
  sheetData.push(["Branch Address", summaryData.branch_address || "-"]);
  sheetData.push(["Branch Contact", summaryData.branch_contact || "-"]);
  sheetData.push([]);

  if (summaryData.workOrder) {
    sheetData.push(["Work Order Details"]);
    const filteredWorkOrder = Object.fromEntries(
      Object.entries(summaryData.workOrder).filter(
        ([key]) => key !== "wo_id" && key !== "id" && key !== "branch_id"
      )
    );
    for (const [key, value] of Object.entries(filteredWorkOrder)) {
      sheetData.push([key, value ?? "-"]);
    }
    sheetData.push([]);
  }

  if (summaryData.profit_calculation) {
    sheetData.push(["Profit Calculation"]);
    const filteredProfit = Object.fromEntries(
      Object.entries(summaryData.profit_calculation).filter(([key]) => key.toLowerCase() !== "formula")
    );
    for (const [key, value] of Object.entries(filteredProfit)) {
      sheetData.push([key, value ?? "-"]);
    }
    sheetData.push([]);
  }

  sheetData.push(["Financial Summary"]);
  const fs = summaryData;
  sheetData.push(["Base Amount with GST", fs.base_amount_with_gst ?? "-"]);
  sheetData.push(["Total Received", fs.total_received ?? "-"]);
  sheetData.push(["Remaining Amount", fs.remaining_amount ?? "-"]);
  sheetData.push(["Total Invoice Amount", fs.total_invoice_amount ?? "-"]);
  sheetData.push(["Total Expenses", fs.total_expenses ?? "-"]);
  sheetData.push(["Total Taxable Expenses", fs.total_taxable_expenses ?? "-"]);
  sheetData.push(["Total Non-Taxable Expenses", fs.total_non_taxable_expenses ?? "-"]);
  sheetData.push(["Total Salaries", fs.total_salaries ?? "-"]);
  sheetData.push([]);

  const addTable = (title, rows) => {
    if (!rows?.length) return;
    sheetData.push([title]);
    const headers = Object.keys(rows[0]);
    sheetData.push(headers);
    rows.forEach((r) => sheetData.push(headers.map((h) => r[h] ?? "-")));
    sheetData.push([]);
  };

  addTable("Invoices", summaryData.invoices);
  addTable("Taxable Expenses", summaryData.taxable_expenses);
  addTable("Non-Taxable Expenses", summaryData.non_taxable_expenses);
  addTable("Payslips", summaryData.payslips);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const colWidths = [];
  sheetData.forEach((row) =>
    row.forEach((cell, i) => {
      const len = String(cell || "").length;
      colWidths[i] = Math.max(colWidths[i] || 10, len + 2);
    })
  );
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, "Summary");

  const woNumber = summaryData.wo_number || "WorkOrder";
  XLSX.writeFile(wb, `${woNumber}_Summary.xlsx`);
  toast.success("Excel downloaded successfully");
};
