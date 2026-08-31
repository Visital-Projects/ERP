// PreviewWorkOrdersModal.jsx
import React, { useRef } from "react";
import { Button, OverlayTrigger, Tooltip, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PreviewWorkOrdersModal = ({ show, onHide, data = [], handleDownloadExcel, handleDownloadPDF }) => {
  const printRef = useRef();
  if (!show) return null;

  const handleDownloadPDFInternal = async () => {
    if (handleDownloadPDF) {
      handleDownloadPDF();
      return;
    }

    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("WorkOrdersPreview.pdf");
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-light bg-opacity-95 overflow-auto z-50"
      style={{ padding: "2rem", zIndex: 1055 }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h4 className="fw-bold mb-0">Work Orders Preview</h4>
        <div>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-excel">Download Excel</Tooltip>}
          >
            <Button variant="success" size="sm" className="me-2" onClick={handleDownloadExcel}>
              Download Excel
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-pdf">Download PDF</Tooltip>}
          >
            <Button variant="primary" size="sm" className="me-2" onClick={handleDownloadPDFInternal}>
              Download PDF
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-close">Close full-screen view</Tooltip>}
          >
            <Button variant="secondary" size="sm" onClick={onHide}>
              Close
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Table Content */}
      <div ref={printRef} className="p-4 bg-white rounded shadow-sm">
        <Table bordered hover size="sm" responsive className="align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>WO Number</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Issue Date</th>
              <th>Expected Date</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((wo, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{wo.wo_number}</td>
                <td>{wo.title}</td>
                <td>{wo.status}</td>
                <td>{wo.priority}</td>
                <td>{wo.assigned_to}</td>
                <td>{wo.issue_date}</td>
                <td>{wo.expected_date}</td>
                <td>{wo.amount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default PreviewWorkOrdersModal;
