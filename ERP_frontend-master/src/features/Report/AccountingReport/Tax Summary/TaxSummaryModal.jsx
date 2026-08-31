import React from "react";
import { Modal, Table, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TaxSummaryModal = ({
  show,
  onHide,
  months,
  incomeData,
  expenseData,
  year,
  filterHeading,
  gstTypeFilter
}) => {

const handleExportExcel = () => {
  const wb = XLSX.utils.book_new();

  // Top heading: Filter info
  const filterRow = [[filterHeading]];
  const emptyRow = [[]];

  // Header with Income / Expense grouping
  const header = [
    ["Month", "Income GST Collected", "", "", "", "Expense GST Paid", "", "", ""],
    ["", "CGST", "SGST", "IGST", "Total", "CGST", "SGST", "IGST", "Total"]
  ];

  // Prepare body data per month
  const bodyData = months.map((m, idx) => {
    const incCGST = Number(incomeData.CGST[idx] || 0);
    const incSGST = Number(incomeData.SGST[idx] || 0);
    const incIGST = Number(incomeData.IGST[idx] || 0);
    const expCGST = Number(expenseData.CGST[idx] || 0);
    const expSGST = Number(expenseData.SGST[idx] || 0);
    const expIGST = Number(expenseData.IGST[idx] || 0);

    return [
      m,
      incCGST.toFixed(2),
      incSGST.toFixed(2),
      incIGST.toFixed(2),
      (incCGST + incSGST + incIGST).toFixed(2),
      expCGST.toFixed(2),
      expSGST.toFixed(2),
      expIGST.toFixed(2),
      (expCGST + expSGST + expIGST).toFixed(2),
    ];
  });

  // Add totals row
  const totalRow = [
    "Total",
    ...[0,1,2].map(i => months.reduce((sum, _, idx) => sum + (incomeData[["CGST","SGST","IGST"][i]][idx] || 0), 0).toFixed(2)),
    months.reduce((sum, _, idx) => sum + (incomeData.CGST[idx]+incomeData.SGST[idx]+incomeData.IGST[idx]),0).toFixed(2),
    ...[0,1,2].map(i => months.reduce((sum, _, idx) => sum + (expenseData[["CGST","SGST","IGST"][i]][idx] || 0), 0).toFixed(2)),
    months.reduce((sum, _, idx) => sum + (expenseData.CGST[idx]+expenseData.SGST[idx]+expenseData.IGST[idx]),0).toFixed(2)
  ];

  const ws = XLSX.utils.aoa_to_sheet([
    ...filterRow,
    ...emptyRow,
    ...header,
    ...bodyData,
    totalRow
  ]);

  // Merge header for Income/Expense
  ws["!merges"] = [
    { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // Income GST Collected
    { s: { r: 2, c: 5 }, e: { r: 2, c: 8 } }, // Expense GST Paid
  ];

  // Column widths for readability
  ws["!cols"] = [
    { wch: 15 }, // Month
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, // Income
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, // Expense
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tax Summary");
  XLSX.writeFile(wb, `Tax_Summary_${year}_${gstTypeFilter}.xlsx`);
};

const formatNumber = (value) =>
  Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const handleExportPDF = () => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.text("Tax Summary", 14, 20);
  doc.setFontSize(10);
  doc.text(filterHeading, 14, 36);

  // Calculate Net GST totals
  const netGST = {};
  Object.keys(incomeData).forEach((tax) => {
    netGST[tax] = incomeData[tax].map((val, i) => val - expenseData[tax][i]);
  });

  const head = [
    [
      { content: "Month", rowSpan: 2, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
      { content: "GST Collecetd Summary", colSpan: 4, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
      { content: "GST Pid Summary", colSpan: 4, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
    ],
    [
      // { content: "", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "CGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "SGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "IGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "Total", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "CGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "SGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "IGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
      { content: "Total", styles: { fillColor: [0, 123, 255], textColor: 255 } },
    ],
  ];

  const body = months.map((m, idx) => [
    m,
    formatNumber(incomeData.CGST[idx]),
    formatNumber(incomeData.SGST[idx]),
    formatNumber(incomeData.IGST[idx]),
    formatNumber(incomeData.CGST[idx] + incomeData.SGST[idx] + incomeData.IGST[idx]),
    formatNumber(expenseData.CGST[idx]),
    formatNumber(expenseData.SGST[idx]),
    formatNumber(expenseData.IGST[idx]),
    formatNumber(expenseData.CGST[idx] + expenseData.SGST[idx] + expenseData.IGST[idx]),
  ]);

  autoTable(doc, {
    startY: 50,
    head: head,
    body: body,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 4, halign: "center" },
    tableWidth: "auto",
    margin: { left: 20, right: 20 },
  });

  // Add Net GST row
  const totalIncome = months.reduce(
    (sum, _, idx) =>
      sum +
      incomeData.CGST[idx] +
      incomeData.SGST[idx] +
      incomeData.IGST[idx],
    0
  );
  const totalExpense = months.reduce(
    (sum, _, idx) =>
      sum +
      expenseData.CGST[idx] +
      expenseData.SGST[idx] +
      expenseData.IGST[idx],
    0
  );

  const netGSTTotal = totalIncome - totalExpense;
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFillColor(173, 216, 230); // light blue for net row
  doc.setTextColor(0);
  doc.rect(20, finalY - 4, doc.internal.pageSize.width - 40, 20, "F");
  doc.text(
    `Net GST (GST Collected - GST Paid): ₹${formatNumber(netGSTTotal)}`,
    25,
    finalY + 10
  );

  doc.save(`Tax_Summary_${year}.pdf`);
};

  return (
    <Modal size="xl" show={show} onHide={onHide} className="d-flex justify-content-center" dialogClassName="invoice-preview-modal">
      <Modal.Header closeButton>
        <Modal.Title>    <strong>GST Summary:</strong>
    <div className="text-muted small">{filterHeading}</div>
</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
<Table bordered hover size="sm" className="mb-0">
  <thead className="table-light">
    <tr>
      <th className="ps-3">Tax Type</th>
      {months.map((m) => (
        <th key={m} className="text-center">
          {m.slice(0, 3)}
        </th>
      ))}
      <th className="text-end pe-3">Annual Total</th>
    </tr>
  </thead>

  <tbody>
    {/* ================= INCOME ================= */}
    <tr className="table-secondary fw-bold">
      <td colSpan={months.length + 2} className="ps-3">
        GST Collected Summary
      </td>
    </tr>

    {Object.keys(incomeData).map((tax) => (
      <tr key={`income-${tax}`}>
        <td className="ps-3 fw-semibold">{tax}</td>
        {incomeData[tax].map((v, i) => (
          <td key={i} className="text-center">
            {v.toFixed(2)}
          </td>
        ))}
        <td className="text-end pe-3 fw-bold">
          {incomeData[tax].reduce((a, b) => a + b, 0).toFixed(2)}
        </td>
      </tr>
    ))}

    {/* ================= EXPENSE ================= */}
    <tr className="table-secondary fw-bold">
      <td colSpan={months.length + 2} className="ps-3">
        GST Paid Summary
      </td>
    </tr>

    {Object.keys(expenseData).map((tax) => (
      <tr key={`expense-${tax}`}>
        <td className="ps-3 fw-semibold">{tax}</td>
        {expenseData[tax].map((v, i) => (
          <td key={i} className="text-center">
            {v.toFixed(2)}
          </td>
        ))}
        <td className="text-end pe-3 fw-bold">
          {expenseData[tax].reduce((a, b) => a + b, 0).toFixed(2)}
        </td>
      </tr>
    ))}

    {/* ================= NET GST ================= */}
    <tr className="table-secondary fw-bold">
      <td colSpan={months.length + 2} className="ps-3">
        Net GST (GST Collected − GST Paid)
      </td>
    </tr>

    {Object.keys(incomeData).map((tax) => (
      <tr key={`net-${tax}`}>
        <td className="ps-3 fw-semibold">{tax}</td>
        {months.map((_, i) => (
          <td key={i} className="text-center">
            {(incomeData[tax][i] - expenseData[tax][i]).toFixed(2)}
          </td>
        ))}
        <td className="text-end pe-3 fw-bold">
          {(
            incomeData[tax].reduce((a, b) => a + b, 0) -
            expenseData[tax].reduce((a, b) => a + b, 0)
          ).toFixed(2)}
        </td>
      </tr>
    ))}
  </tbody>
</Table>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleExportExcel}>Export Excel</Button>
        <Button variant="danger" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaxSummaryModal;
