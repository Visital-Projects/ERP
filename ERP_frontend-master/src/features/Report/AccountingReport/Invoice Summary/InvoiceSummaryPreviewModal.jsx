import React from "react";
import { Modal, Table, Button, Row, Col } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../../Report.css'

const InvoicePreviewModal = ({ show, onHide, data, title }) => {
  if (!data || data.length === 0) return null;

  // Export Excel from modal
  const handleExportExcel = () => {
    const headers = Object.keys(data[0]);
const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
  wch: Math.max(
    key.length,
    ...data.map(row =>
      row[key] ? row[key].toString().length : 0
    )
  ) + 2
}));
worksheet["!cols"] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InvoicesPreview");
    XLSX.writeFile(workbook, "InvoicePreview.xlsx");
  };

const handleExportPDF = () => {
  const doc = new jsPDF("l", "mm", "a4");
  doc.setFont("helvetica", "normal");
doc.setCharSpace(0);

  doc.setFontSize(14);
  doc.text("Invoice Summary Preview", 14, 15);

autoTable(doc, {
  head: [Object.keys(data[0])],
  body: data.map((row) =>
  Object.values(row).map((val) =>
    val !== null && val !== undefined
      ? String(val).replace("₹", "")
      : ""
  )
),
  startY: 22,
  theme: "grid",
  styles: { fontSize: 9 },
  headStyles: { fillColor: [72, 66, 109], textColor: 255 },

  didParseCell: function (dataArg) {
    if (dataArg.row.raw[0] === "TOTAL") {
      dataArg.cell.styles.fontStyle = "bold";
    }
  },
});
  doc.save("InvoicePreview.pdf");
};

  return (
<Modal
  show={show}
  onHide={onHide}
  size="xl"
  dialogClassName="invoice-preview-modal"
>
      <Modal.Header closeButton>
       <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
<Modal.Body className="p-0">
  <div style={{ maxHeight: "70vh", overflowX: "auto" }}>
    <Table striped bordered hover className="mb-0">
          <thead>
            <tr>
{Object.keys(data[0])
  .filter((key) => key !== "Vendor")
  .map((key, idx) => (
    <th key={idx}>{key}</th>
))}
            </tr>
          </thead>
<tbody>
  {data.map((row, i) => (
    <tr
      key={i}
      className={row["Number"] === "TOTAL" ? "fw-bold table-secondary" : ""}
    >
      {Object.entries(row).map(([key, val], idx) => {

        // ❌ Hide Vendor column in table UI
        if (key === "Vendor") return null;

        return (
          <td
            key={idx}
            style={
              key === "Site" || key === "Branch"
                ? {
                    whiteSpace: "normal",
                    wordBreak: "keep-all",
                    overflowWrap: "break-word",
                    minWidth: "180px",
                    maxWidth: "220px",
                    verticalAlign: "top",
                  }
                : {}
            }
          >
            {/* ✅ If Number column, show Vendor below it */}
            {key === "Number" && row["Number"] !== "TOTAL" ? (
              <>
                <div>{val}</div>
                {row["Vendor"] && (
                  <d style={{ fontSize: "12px", color: "#6c757d" }}>
                    {row["Vendor"]}
                  </d>
                )}
              </>
            ) : (
              val
            )}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

        </Table>
        </div>
      </Modal.Body>
      
        <Row className="my-3">
          <Col className="d-flex gap-2 justify-content-end">
            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="danger" onClick={handleExportPDF}>
              Export PDF
            </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
          </Col>
        </Row>
    </Modal>
  );
};

export default InvoicePreviewModal;
