import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import invoiceService from "../../../services/purchaseService";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

const RaisedInvoiceTable = ({ poNumber, refreshTrigger }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getAllInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filtered = res.data.filter((inv) => inv.number === poNumber);
        setInvoices(filtered);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching raised invoices:", error);
      toast.error("Failed to load raised invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice ?`,
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          await invoiceService.deleteInvoice(id);
          toast.success(`Invoice deleted successfully`);
          fetchInvoices();
        } catch (error) {
          toast.error("Failed to delete invoice");
        }
      },
    });
  };

  const handleView = async (id) => {
    try {
      const data = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(data?.data || data);
      setShowViewModal(true);
    } catch (error) {
      toast.error("Failed to load invoice details");
    }
  };

  useEffect(() => {
    if (poNumber) fetchInvoices();
  }, [poNumber, refreshTrigger]);

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2 mb-0">Loading raised invoices...</p>
      </div>
    );

  if (invoices.length === 0)
    return (
      <div className="text-center py-4 text-muted fst-italic">
        No raised invoices found for <b>{poNumber}</b>
      </div>
    );

  return (
    <>
      <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
            <div
              className="bg-primary rounded-2"
              style={{ width: "20px", height: "20px" }}
            ></div>
          </div>
          <h6 className="fw-bold text-primary mb-0">Raised Invoices</h6>
        </div>

        <div className="table-responsive rounded-3">
          <Table hover className="mb-0 text-center align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 fw-semibold text-muted border-0">#</th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Invoice No
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Base Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  GST Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Total Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">GST Type</th>
                <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, index) => (
                <tr key={inv.id} className="border-top">
                  <td className="ps-4 py-3">{index + 1}</td>
                  <td className="py-3">
                    <Button variant="outline-success" size="sm">
                      #{inv.number}
                    </Button>
                  </td>
                  <td className="py-3 fw-bold text-dark">
                    ₹{Number(inv.base_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 fw-bold text-dark">
                    ₹{Number(inv.gst_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 fw-bold text-dark">
                    ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 fw-bold text-dark">{inv.gst_type}</td>
                  <td className="pe-4 py-3">
                    <div className="d-flex justify-content-center gap-2">
                      {/* ✅ View Icon */}
                      <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
                        <Button
                          size="sm"
                          variant="warning"
                          className="border-1 text-white"
                          onClick={() => handleView(inv.id)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger overlay={<Tooltip>Delete Invoice</Tooltip>}>
                        <Button
                          size="sm"
                          variant="danger"
                          className="border-1"
                          onClick={() => handleDelete(inv.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* ✅ View Details Modal */}
      {/* <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Invoice Details — #{selectedInvoice?.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice ? (
            <div className="table-responsive">
              <Table bordered hover size="sm" className="align-middle">
                <tbody>
                  <tr>
                    <th>Invoice Number</th>
                    <td>#{selectedInvoice.number}</td>
                  </tr>
                  <tr>
                    <th>Base Amount</th>
                    <td>₹{selectedInvoice.base_amount}</td>
                  </tr>
                  <tr>
                    <th>GST Amount</th>
                    <td>₹{selectedInvoice.gst_amount}</td>
                  </tr>
                  <tr>
                    <th>Total Amount</th>
                    <td>₹{selectedInvoice.total_amount}</td>
                  </tr>
                  <tr>
                    <th>GST Type</th>
                    <td>{selectedInvoice.gst_type}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{selectedInvoice.status}</td>
                  </tr>
                  {selectedInvoice?.remarks && (
                    <tr>
                      <th>Remarks</th>
                      <td>{selectedInvoice.remarks}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted">Loading...</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal> */}
      {/* <Modal
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  size="lg"
  centered
  backdrop="static"
>
  <Modal.Header closeButton className="bg-light">
    <Modal.Title className="d-flex align-items-center">
      <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
        <i className="bi bi-receipt text-primary fs-5"></i>
      </div>
      <div>
        <h5 className="fw-bold mb-0">Invoice Details</h5>
        <small className="text-muted">#{selectedInvoice?.number}</small>
      </div>
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-4">
    {selectedInvoice ? (
      <>
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Total Amount</h6>
                <h4 className="fw-bold text-primary mb-0">
                  ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}
                </h4>
                <small className="text-muted">
                  Base: ₹{Number(selectedInvoice.base_amount).toLocaleString('en-IN')} 
                  + GST: ₹{Number(selectedInvoice.gst_amount).toLocaleString('en-IN')}
                </small>
              </div>
              <div className="text-end">
                <span className={`badge bg-${selectedInvoice.status === 'Paid' ? 'success' : 
                  selectedInvoice.status === 'Pending' ? 'warning' : 
                  selectedInvoice.status === 'Overdue' ? 'danger' : 'secondary'} 
                  fs-6 px-3 py-2`}>
                  {selectedInvoice.status}
                </span>
                <div className="mt-2">
                  <small className="text-muted">GST Type: {selectedInvoice.gst_type}</small>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <h6 className="fw-bold mb-3 text-uppercase text-muted">Invoice Information</h6>
        <div className="table-responsive">
          <Table borderless hover className="mb-0">
            <tbody>
              <tr className="border-bottom">
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-hash text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Invoice Number</small>
                      <strong>#{selectedInvoice.number}</strong>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-percent text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">GST Type</small>
                      <strong>{selectedInvoice.gst_type}</strong>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-bottom">
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-currency-rupee text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Base Amount</small>
                      <strong className="text-success">
                        ₹{Number(selectedInvoice.base_amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-receipt-cutoff text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">GST Amount</small>
                      <strong className="text-warning">
                        ₹{Number(selectedInvoice.gst_amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-bottom">
                <td colSpan="2" className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-calculator text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Total Amount</small>
                      <strong className="text-primary fs-5">
                        ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </td>
              </tr>
              {selectedInvoice?.remarks && (
                <tr>
                  <td colSpan="2" className="py-3">
                    <div className="d-flex align-items-start">
                      <div className="bg-light rounded-circle p-2 me-3 mt-1">
                        <i className="bi bi-chat-left-text text-primary"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block">Remarks</small>
                        <div className="bg-light p-3 rounded mt-1">
                          {selectedInvoice.remarks}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="fw-bold mb-3 text-uppercase text-muted">Amount Breakdown</h6>
          <div className="d-flex justify-content-between mb-2">
            <span>Base Amount:</span>
            <span className="fw-bold">₹{Number(selectedInvoice.base_amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>GST Amount ({selectedInvoice.gst_type}):</span>
            <span className="fw-bold text-warning">₹{Number(selectedInvoice.gst_amount).toLocaleString('en-IN')}</span>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between">
            <span className="fw-bold">Total Amount:</span>
            <span className="fw-bold text-primary fs-5">
              ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading invoice details...</p>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer className="border-top bg-light">
    <div className="d-flex justify-content-between w-100 align-items-center">
      <div>
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          PO Number: <strong>{poNumber}</strong>
        </small>
      </div>
      <div className="d-flex gap-2">
        <Button 
          variant="outline-secondary" 
          onClick={() => setShowViewModal(false)}
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-x-circle"></i> Close
        </Button>
      </div>
    </div>
  </Modal.Footer>
</Modal> */}
<Modal
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  size="lg"
  centered
  backdrop="static"
  keyboard={false}
>
  <Modal.Header closeButton className="bg-light p-0">
    <Modal.Title className="d-flex align-items-center">
      <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
        <i className="bi bi-receipt text-primary fs-5"></i>
      </div>
      <div>
        <h5 className="fw-bold mb-0">Invoice Details</h5>
        <small className="text-muted">#{selectedInvoice?.number}</small>
      </div>
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="py-4">
    {selectedInvoice ? (
      <>
        {/* Purchase Order Details - First */}
        {selectedInvoice.purchaseOrder && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold text-uppercase text-muted mb-0">
                <i className="bi bi-bag-check me-2"></i>Purchase Order Details
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-hash text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">PO Number</small>
                      <strong>{selectedInvoice.purchaseOrder.po_number}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-building text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Vendor</small>
                      <strong>{selectedInvoice.purchaseOrder.vendor_name}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-calendar text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">PO Date</small>
                      <strong>{new Date(selectedInvoice.purchaseOrder.po_date).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-truck text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Delivery Date</small>
                      <strong>{new Date(selectedInvoice.purchaseOrder.delivery_date).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {selectedInvoice.purchaseOrder.line_items?.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Line Items</h6>
                  <Table size="sm" bordered className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Item</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.purchaseOrder.line_items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.item_name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                          <td className="text-end">₹{Number(item.line_total).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Invoice Summary - Total Amount & Status */}
        <Card className="mb-4 border-0 shadow-sm bg-opacity-5">
          <Card.Body className="p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h6 className="text-muted mb-2">Total Invoice Amount</h6>
                <h2 className="fw-bold text-primary mb-0">
                  ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}
                </h2>
                <div className="mt-2">
                  <span className="badge bg-light text-dark me-2">
                    Base: ₹{Number(selectedInvoice.base_amount).toLocaleString('en-IN')}
                  </span>
                  <span className="badge bg-light text-dark">
                    GST: ₹{Number(selectedInvoice.gst_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <span className={`badge bg-${
                  selectedInvoice.payment_summary?.balance_status === 'paid' ? 'success' : 
                  selectedInvoice.payment_summary?.balance_status === 'partially_paid' ? 'warning' : 'danger'
                } fs-6 px-3 py-2`}>
                  {selectedInvoice.payment_summary?.balance_status?.replace('_', ' ') || 'Pending'}
                </span>
                <div className="mt-2">
                  <small className="text-muted">GST: {selectedInvoice.gst_type}</small>
                </div>
              </div>
            </div>
            
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 bg-success bg-opacity-10 rounded-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-25 rounded-circle p-3 me-3">
                        <i className="bi bi-check-circle-fill text-success"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block">Amount Received</small>
                        <h4 className="fw-bold text-success mb-0">
                          ₹{Number(selectedInvoice.payment_summary.total_received || 0).toLocaleString('en-IN')}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-25 rounded-circle p-3 me-3">
                        <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                      </div>
                      <div>
                        <small className="text-muted d-block">Remaining Amount</small>
                        <h4 className="fw-bold text-warning mb-0">
                          ₹{Number(selectedInvoice.payment_summary.remaining_amount || 0).toLocaleString('en-IN')}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </Card.Body>
        </Card>

        {/* Payment Summary - Amount Received & Remaining */}
        {selectedInvoice.payment_summary && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>

              {/* Payment History */}
              {selectedInvoice.payment_summary.payments?.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Payment History</h6>
                  <Table size="sm" bordered className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Date</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Base Amount</th>
                        <th className="text-end">GST Amount</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.payment_summary.payments.map((payment, idx) => (
                        <tr key={idx}>
                          <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td className="text-end">₹{Number(payment.amount).toLocaleString('en-IN')}</td>
                          <td className="text-end">₹{Number(payment.base_amount).toLocaleString('en-IN')}</td>
                          <td className="text-end">₹{Number(payment.gst_amount).toLocaleString('en-IN')}</td>
                          <td className="text-center">
                            <span className={`badge bg-${payment.status === 'Paid' ? 'success' : 'warning'}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Tax Breakdown */}
        {/* <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-3 pb-0">
            <h6 className="fw-bold text-uppercase text-muted mb-0">
              <i className="bi bi-percent me-2"></i>Tax Breakdown
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 text-center">
                  <small className="text-muted d-block">CGST</small>
                  <h5 className="fw-bold text-primary mb-0">
                    ₹{Number(selectedInvoice.cgst || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 text-center">
                  <small className="text-muted d-block">SGST</small>
                  <h5 className="fw-bold text-primary mb-0">
                    ₹{Number(selectedInvoice.sgst || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3 text-center">
                  <small className="text-muted d-block">IGST</small>
                  <h5 className="fw-bold text-primary mb-0">
                    ₹{Number(selectedInvoice.igst || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card> */}
      </>
    ) : (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading invoice details...</p>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer className="border-top bg-light p-0">
      <Button 
        variant="secondary" 
        onClick={() => setShowViewModal(false)}
        className="d-flex align-items-center gap-2"
      >
        Close
      </Button>
  </Modal.Footer>
</Modal>
    </>
  );
};

export default RaisedInvoiceTable;
