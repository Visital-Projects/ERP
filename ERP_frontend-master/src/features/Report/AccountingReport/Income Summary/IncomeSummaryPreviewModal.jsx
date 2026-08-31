import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";

const formatINR = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const formatINRForPDF = (value = 0) =>
  `Rs. ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const IncomeSummaryPreviewModal = ({
  show,
  onHide,
  months,
  monthlyRevenue,      // Changed from monthlyBaseAmount
  monthlyPaidInvoice,      // Changed from monthlyGST
  monthlyIncome,       // Changed from monthlyTotalIncome
  filterHeading,
  exportToExcel,
  exportToPDF,
}) => {
  const shortMonth = (m) => m.substring(0, 3).toUpperCase();

  // Calculate totals using the correct prop names
  const baseAmountTotal = monthlyRevenue?.reduce((a, b) => a + b, 0) || 0;
  const paidInvoiceTotal = monthlyPaidInvoice?.reduce((a, b) => a + b, 0) || 0;
  const totalIncomeTotal = monthlyIncome?.reduce((a, b) => a + b, 0) || 0;

  return (
    <Modal show={show} onHide={onHide} size="xl" className="d-flex justify-content-center">
      <Modal.Header closeButton>
        <Modal.Title>Income Summary Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {filterHeading && (
          <div className="alert alert-info mb-3">
            <strong>Filter Applied:</strong> {filterHeading}
          </div>
        )}

        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>MONTH</th>
                <th>BASE AMOUNT (Sale Invoice)</th>
                <th>PAID INVOICE (Sale Invoice)</th>
                <th>INCOME</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, index) => (
                <tr key={month}>
                  <td className="fw-semibold">{shortMonth(month)}</td>
                  <td>{formatINR(monthlyRevenue?.[index] || 0)}</td>
                  <td>{formatINR(monthlyPaidInvoice?.[index] || 0)}</td>
                  <td>{formatINR(monthlyIncome?.[index] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mt-4 p-3 bg-light rounded">
          <h5>Summary</h5>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Total Base Amount (Sale Invoice):</span>
            <span className="fw-bold text-success">{formatINR(baseAmountTotal)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Total Paid Invoice (Sale Invoice):</span>
            <span className="fw-bold text-primary">{formatINR(paidInvoiceTotal)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span>Total Income:</span>
            <span className="fw-bold text-info">{formatINR(totalIncomeTotal)}</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="danger" onClick={exportToPDF}>
          Export PDF
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncomeSummaryPreviewModal;