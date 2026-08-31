import React, { useState } from "react";
import { Dropdown, Modal, Button, Spinner, Table } from "react-bootstrap";
import { FileEarmarkArrowDown, Eye } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import workOrderService from "../../../services/workOrderService";
import { handleDownloadExcel, handleDownloadPDF } from "./DownloadHandlers";

const DownloadSummary = ({ woNumber,branchName, branchAddress, branchContact }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await workOrderService.getWorkOrderSummaryByNumber(woNumber);
      if (res?.success) {
  const mergedData = {
    ...res.data,
    branch_name: res.data.branch_name || branchName || "N/A",
    branch_address: res.data.branch_address || branchAddress || "N/A",
    branch_contact: res.data.branch_contact || branchContact || "N/A",
  };
  setSummaryData(mergedData);
  setShowPreview(true);
} else toast.error("Failed to load summary");
    } catch (err) {
      toast.error("Error fetching summary data");
    } finally {
      setLoading(false);
    }
  };
  const renderSection = (title, data) => {
    if (!data || (Array.isArray(data) && !data.length)) return null;
    
    return (
      <>
        <h6 className="mt-3 fw-bold border-bottom pb-1">{title}</h6>
        {Array.isArray(data) ? (
          <div className="table-responsive mb-3">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key} className="text-nowrap">
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([key, val], i) => {
                      const isDocument = key.toLowerCase().includes("document") && val;
                      
                      // Use your environment variable base URL
                      const baseUrl = import.meta.env.VITE_BASE_URL || "";
                      const fullUrl = isDocument
                        ? (val.startsWith("http") ? val : `${baseUrl}/${val}`)
                        : null;

                      return (
                        <td key={i}>
                          {isDocument ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => window.open(fullUrl, "_blank")}
                            >
                              <Eye size={14} className="me-1" /> View
                            </Button>
                          ) : (
                            val === null || val === undefined
                              ? "-"
                              : typeof val === "boolean"
                              ? val
                                ? "Yes"
                                : "No"
                              : val.toString()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Table bordered size="sm" className="mb-3">
            <tbody>
              {Object.entries(data).map(([key, val]) => (
                <tr key={key}>
                  <td className="fw-semibold text-nowrap">
                    {key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td>
                    {val === null || val === undefined ? "-" : 
                     typeof val === 'boolean' ? (val ? 'Yes' : 'No') : 
                     val.toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </>
    );
  };

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle variant="light" size="sm" className="border">
          <FileEarmarkArrowDown size={18} />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={fetchPreview}>
            <Eye size={15} className="me-2" />
            Preview Summary
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleDownloadPDF(summaryData, fetchPreview)}>
            <i className="bi bi-filetype-pdf me-2 text-danger"></i> Download as PDF
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleDownloadExcel(summaryData, fetchPreview)}>
            <i className="bi bi-file-earmark-excel me-2 text-success"></i> Download as Excel
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl" centered scrollable dialogClassName="d-flex align-items-center justify-content-center" backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Preview - Work Order Summary ({woNumber})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          ) : summaryData ? (
  <>
    <div className="text-center mb-4" style={{ fontSize: '0.9rem' }}>
      <h5 className="fw-bold" style={{ fontSize: '1.1rem' }}>{summaryData.branch_name || "Branch Name"}</h5>
      <div style={{ fontSize: '0.85rem' }}>{summaryData.branch_address || "Branch Address"}</div>
      <div style={{ fontSize: '0.85rem' }}>Contact: {summaryData.branch_contact || "-"}</div>
    </div>
    <div className="mb-3">
      <h6 className="fw-bold border-bottom pb-1" style={{ fontSize: '0.95rem' }}>Work Order Details</h6>
      <div style={{ fontSize: '0.85rem' }}>
        {Object.entries({
          ...(
              summaryData.workOrder
                ? Object.fromEntries(
                    Object.entries(summaryData.workOrder).filter(([key]) => key !== "id")
                  )
                : {}
            ),
          ...(summaryData.wo_number && { wo_number: summaryData.wo_number })
        }).map(([key, val]) => 
          key !== 'wo_id' && key !== 'branch_id' ? (
            <div key={key} className="d-flex justify-content-between">
              <span><b>{key.replace(/_/g, " ")}:</b></span>
              <span>{val ?? "-"}</span>
            </div>
          ) : null
        )}
      </div>
    </div>
    {summaryData.profit_calculation && (
      <div className="mb-3">
        <h6
          className="fw-bold border-bottom pb-1"
          style={{ fontSize: "0.95rem" }}
        >
          Profit Calculation
        </h6>
        <div style={{ fontSize: "0.85rem" }}>
          {Object.entries(summaryData.profit_calculation)
            .filter(([key]) => key !== "formula") 
            .map(([key, val]) => (
              <div key={key} className="d-flex justify-content-between">
                <span>
                  <b>{key.replace(/_/g, " ")}:</b>
                </span>
                <span>{val ?? "-"}</span>
              </div>
            ))}
        </div>
      </div>
    )}
    <div className="mb-3">
      <h6 className="fw-bold border-bottom pb-1" style={{ fontSize: '0.95rem' }}>Financial Summary</h6>
      <div className="table-responsive">
        <Table striped bordered hover size="sm" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Base Amount with GST", summaryData.base_amount_with_gst],
              ["Total Received", summaryData.total_received],
              ["Remaining Amount", summaryData.remaining_amount],
              ["Total Invoice Amount", summaryData.total_invoice_amount],
              ["Total Expenses", summaryData.total_expenses],
              ["Total Taxable Expenses", summaryData.total_taxable_expenses],
              ["Total Non-Taxable Expenses", summaryData.total_non_taxable_expenses],
              ["Total Salaries", summaryData.total_salaries]
            ].map(([label, value]) => (
              <tr key={label}>
                <td><b>{label}</b></td>
                <td>{value ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>

    {renderSection("Invoices", summaryData.invoices)}
    {renderSection("Taxable Expenses", summaryData.taxable_expenses)}
    {renderSection("Non-Taxable Expenses", summaryData.non_taxable_expenses)}
    {renderSection("Payslips", summaryData.payslips)}
  </>
) : (
  <div className="text-muted text-center">No data found.</div>
)}

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => handleDownloadExcel(summaryData, fetchPreview)}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>Download Excel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDownloadPDF(summaryData, fetchPreview)}
          >
            <i className="bi bi-filetype-pdf me-2"></i>Download PDF
          </Button>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DownloadSummary;