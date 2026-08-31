// // src/pages/Purchase/Components/InvoiceViewModal.jsx
// import React from "react";
// import { Modal, Button, Table } from "react-bootstrap";

// const InvoiceViewModal = ({ show, onHide, invoice }) => {
//   if (!invoice) return null;

//   return (
//     <Modal show={show} onHide={onHide} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>Invoice Details - #{String(invoice.id).padStart(6, "0")}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Table bordered responsive>
//           <tbody>
//             <tr>
//               <th>Invoice Number</th>
//               <td>#{String(invoice.id).padStart(6, "0")}</td>
//             </tr>
//             <tr>
//               <th>Invoice Date</th>
//               <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
//             </tr>
//             <tr>
//               <th>Base Amount</th>
//               <td>₹{parseFloat(invoice.base_amount || 0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>GST Amount</th>
//               <td>₹{parseFloat(invoice.gst_amount || 0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>Total Amount</th>
//               <td>₹{parseFloat(invoice.total_amount || 0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>Remaining Amount</th>
//               <td>₹{parseFloat(invoice.remaining_amount || 0).toFixed(2)}</td>
//             </tr>
//             <tr>
//               <th>Status</th>
//               <td>{invoice.status || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Created By</th>
//               <td>{invoice.created_by || "N/A"}</td>
//             </tr>
//             <tr>
//               <th>Updated At</th>
//               <td>{invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : "N/A"}</td>
//             </tr>
//           </tbody>
//         </Table>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default InvoiceViewModal;





import React from "react";
import { Modal, Button, Card, Table, Badge } from "react-bootstrap";

const InvoiceViewModal = ({ show, onHide, invoice }) => {
  if (!invoice) return null;

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'paid') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'overdue') return 'danger';
    if (statusLower === 'draft') return 'secondary';
    return 'info';
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
            <i className="bi bi-receipt text-primary fs-5"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Invoice Details</h5>
            <small className="text-muted">
              #{String(invoice.id).padStart(6, "0")}
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Invoice Summary Card */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Total Amount</h6>
                <h4 className="fw-bold text-primary mb-0">
                  ₹{formatCurrency(invoice.total_amount)}
                </h4>
                <small className="text-muted">
                  Base: ₹{formatCurrency(invoice.base_amount)} 
                  + GST: ₹{formatCurrency(invoice.gst_amount)}
                </small>
                {invoice.remaining_amount > 0 && (
                  <div className="mt-2">
                    <small className="text-warning">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      Remaining: ₹{formatCurrency(invoice.remaining_amount)}
                    </small>
                  </div>
                )}
              </div>
              <div className="text-end">
                <span className={`badge bg-${getStatusColor(invoice.status)} fs-6 px-3 py-2`}>
                  {invoice.status || "N/A"}
                </span>
                <div className="mt-2">
                  <small className="text-muted">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDate(invoice.created_at)}
                  </small>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Basic Information Section */}
        <h6 className="fw-bold mb-3 text-uppercase text-muted">
          <i className="bi bi-info-circle me-2"></i>
          Basic Information
        </h6>
        <div className="table-responsive">
          <Table borderless hover className="mb-4">
            <tbody>
              <tr className="border-bottom">
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-hash text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Invoice Number</small>
                      <strong>#{String(invoice.id).padStart(6, "0")}</strong>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-calendar text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Invoice Date</small>
                      <strong>{formatDate(invoice.created_at)}</strong>
                    </div>
                  </div>
                </td>
              </tr>
              {/* <tr className="border-bottom">
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-clock-history text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Last Updated</small>
                      <strong>{formatDateTime(invoice.updated_at)}</strong>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-person text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Created By</small>
                      <strong>{invoice.created_by || "System"}</strong>
                    </div>
                  </div>
                </td>
              </tr> */}
            </tbody>
          </Table>
        </div>

        {/* Amount Details Section */}
        <h6 className="fw-bold mb-3 text-uppercase text-muted">
          <i className="bi bi-calculator me-2"></i>
          Amount Details
        </h6>
        <div className="table-responsive">
          <Table borderless hover className="mb-4">
            <tbody>
              <tr className="border-bottom">
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-currency-rupee text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Base Amount</small>
                      <strong className="text-success fs-5">
                        ₹{formatCurrency(invoice.base_amount)}
                      </strong>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-percent text-warning"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">GST Amount</small>
                      <strong className="text-warning fs-5">
                        ₹{formatCurrency(invoice.gst_amount)}
                      </strong>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-bottom">
                <td colSpan="2" className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-calculator-fill text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Total Amount</small>
                      <strong className="text-primary fs-4">
                        ₹{formatCurrency(invoice.total_amount)}
                      </strong>
                    </div>
                  </div>
                </td>
              </tr>
              {invoice.remaining_amount > 0 && (
                <tr className="border-bottom">
                  <td colSpan="2" className="py-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle p-2 me-3">
                        <i className="bi bi-exclamation-triangle text-danger"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block">Remaining Amount</small>
                        <strong className="text-danger fs-5">
                          ₹{formatCurrency(invoice.remaining_amount)}
                        </strong>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Amount Breakdown Card */}
        <Card className="mb-4 border-0 shadow-sm bg-light">
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-3 text-uppercase text-muted">Amount Breakdown</h6>
            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <span className="text-muted">Base Amount</span>
              </div>
              <span className="fw-bold text-success">₹{formatCurrency(invoice.base_amount)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <span className="text-muted">GST Amount</span>
              </div>
              <span className="fw-bold text-warning">₹{formatCurrency(invoice.gst_amount)}</span>
            </div>
            {invoice.remaining_amount > 0 && (
              <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                <div>
                  <span className="text-muted">
                    <i className="bi bi-exclamation-circle me-1 text-danger"></i>
                    Remaining Amount
                  </span>
                </div>
                <span className="fw-bold text-danger">₹{formatCurrency(invoice.remaining_amount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between pt-2">
              <div>
                <span className="fw-bold">Total Amount</span>
              </div>
              <span className="fw-bold text-primary fs-4">
                ₹{formatCurrency(invoice.total_amount)}
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* Status Information */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1">Status Information</h6>
                <small className="text-muted">Current invoice status and details</small>
              </div>
              <Badge bg={getStatusColor(invoice.status)} className="px-3 py-2 fs-6">
                {invoice.status || "N/A"}
              </Badge>
            </div>
            
            {/* <div className="row">
              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <i className="bi bi-person-plus text-primary"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Created By</small>
                    <strong>{invoice.created_by || "System"}</strong>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <i className="bi bi-clock-history text-primary"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Last Updated</small>
                    <strong>{formatDateTime(invoice.updated_at)}</strong>
                  </div>
                </div>
              </div>
            </div> */}

            {invoice.remaining_amount > 0 && (
              <div className="alert alert-warning mt-3 mb-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle fs-5 me-3"></i>
                  <div>
                    <strong>Attention Required</strong>
                    <p className="mb-0">
                      This invoice has a remaining balance of ₹{formatCurrency(invoice.remaining_amount)}.
                      The status will automatically update to "Paid" when the remaining amount is zero.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="border-top bg-light">
        <div className="d-flex justify-content-end w-100 align-items-center">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-x-circle"></i> Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceViewModal;