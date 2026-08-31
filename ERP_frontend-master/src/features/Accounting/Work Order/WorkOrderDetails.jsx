import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Row, Col, Button, Spinner, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import workOrderService from "../../../services/workOrderService";
import WorkOrderModal from "./WorkOrderModal";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import InvoiceModal from "./WorkOrderInvoiceModal";
import InvoiceSummary from "./InvoiceSummaryTable";
import RaiseInvoiceModal from "./RaiseInvoiceModal";
import RaiseInvoiceTable from "./WO_RaisedInvoiceTable";
import DownloadSummary from "./WorkOrderDownload";

const WorkOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInvoices, setRefreshInvoices] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "In Progress",
    priority: "Medium",
    assigned_to: "",
    issue_date: "",
    expected_date: "",
    expected_days: "",
    start_date: "",
    end_date: "",
    actual_days: "",
    amount: "",
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    payment_amount: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    gst_type: "exclusive",
  });
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "-";
  const num = parseFloat(amount);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-IN");
};
  // Fetch work order by ID
  const fetchWorkOrder = async () => {
    try {
      const res = await workOrderService.getWorkOrderById(id);
      if (res?.success) {
        setWorkOrder(res.data);
      } else {
        toast.error("Failed to fetch work order details");
      }
    } catch (err) {
      toast.error("Error loading work order details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices for this work order
  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await workOrderService.getAllInvoices();
      if (res?.success) {
        const woInvoices = res.data.filter((inv) => inv.wo_number === workOrder.wo_number);
        setInvoices(woInvoices);
      } else {
        setInvoices([]);
        toast.error("Failed to fetch invoices");
      }
    } catch (err) {
      console.error(err);
      setInvoices([]);
      toast.error("Error fetching invoices");
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  useEffect(() => {
    if (workOrder?.wo_number) {
      fetchInvoices();
    }
  }, [workOrder]);

  const formatForDatetimeLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const toISOStringLocal = (localDateStr) => {
    if (!localDateStr || localDateStr.trim() === "") return null;
    const date = new Date(localDateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

// const handleShowModal = (wo = null) => {
//   if (wo) {
//     setSelectedWorkOrder(wo);

//     let docs = [];
//     try {
//       if (typeof wo.document === "string") {
//         docs = JSON.parse(wo.document);
//       } else if (Array.isArray(wo.document)) {
//         docs = wo.document;
//       }
//     } catch {
//       docs = [wo.document].filter(Boolean);
//     }

//     // ✅ parse and include services
//     let services = [];
//     try {
//       if (typeof wo.services === "string") {
//         services = JSON.parse(wo.services);
//       } else if (Array.isArray(wo.services)) {
//         services = wo.services;
//       }
//     } catch {
//       services = [];
//     }

//     setFormData({
//       wo_number: wo.wo_number || "",
//       title: wo.title || "",
//       description: wo.description || "",
//       status: wo.status || "In Progress",
//       priority: wo.priority || "Medium",
//       assigned_to: wo.assigned_to || wo.assignedBranch?.id || "",
//       wo_type: wo.wo_type || "",
//       issue_date: formatForDatetimeLocal(wo.issue_date),
//       expected_date: formatForDatetimeLocal(wo.expected_date),
//       expected_days: wo.expected_days || "",
//       start_date: formatForDatetimeLocal(wo.start_date),
//       end_date: formatForDatetimeLocal(wo.end_date),
//       actual_days: wo.actual_days || "",
//       amount: wo.amount || "",
//       documents: docs || [],
//       // ✅ now included
//       services: services || [],
//     });
//   } else {
//     setSelectedWorkOrder(null);
//     setFormData({
//       wo_number: "",
//       title: "",
//       description: "",
//       status: "In Progress",
//       priority: "Medium",
//       assigned_to: "",
//       wo_type: "",
//       issue_date: "",
//       expected_date: "",
//       expected_days: "",
//       start_date: "",
//       end_date: "",
//       actual_days: "",
//       amount: "",
//       documents: [],
//       services: [], // ✅ clear when creating new
//     });
//   }
//   setShowModal(true);
// };


  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        issue_date: toISOStringLocal(formData.issue_date),
        expected_date: toISOStringLocal(formData.expected_date),
        start_date: toISOStringLocal(formData.start_date),
        end_date: toISOStringLocal(formData.end_date),
      };

      await workOrderService.updateWorkOrder(selectedWorkOrder.id, payload);
      toast.success("Work Order updated successfully");
      setShowModal(false);
      fetchWorkOrder();
    } catch (error) {
      console.error("Error updating work order:", error);
      toast.error("Failed to update work order");
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceData({
      payment_amount: invoice.payment_amount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      gst_type: invoice.gst_type || "exclusive",
    });
    setEditingInvoiceId(invoice.id);
    setIsEditingInvoice(true);
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.payment_amount) {
      toast.error("Payment amount is required");
      return;
    }

    setCreatingInvoice(true);
    try {
      const payload = {
        wo_number: workOrder.wo_number,
        payment_amount: parseFloat(invoiceData.payment_amount),
        cgst: parseFloat(invoiceData.cgst),
        sgst: parseFloat(invoiceData.sgst),
        igst: parseFloat(invoiceData.igst),
        gst_type: invoiceData.gst_type,
        status: "pending",
      };

      let res;
      if (isEditingInvoice) {
        res = await workOrderService.updateInvoice(editingInvoiceId, payload);
      } else {
        res = await workOrderService.createInvoice(payload);
      }

      if (res?.success) {
        toast.success(isEditingInvoice ? "Invoice updated successfully" : "Invoice created successfully");
        setShowInvoiceModal(false);
        setInvoiceData({ payment_amount: "", cgst: 0, sgst: 0, igst: 0, gst_type: "exclusive" });
        setIsEditingInvoice(false);
        setEditingInvoiceId(null);
        fetchInvoices();
      } else {
        toast.error(isEditingInvoice ? "Failed to update invoice" : "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: "Are you sure you want to delete this invoice? This action cannot be undone.",
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          const res = await workOrderService.deleteInvoice(invoiceId);
          if (res?.success) {
            toast.success("Invoice deleted successfully");
            fetchInvoices();
          } else {
            toast.error("Failed to delete invoice");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error deleting invoice");
        }
      },
    });
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await workOrderService.updateInvoiceStatus(invoiceId, newStatus);
      if (res?.success) {
        toast.success(`Invoice status updated to "${newStatus}"`);
        fetchInvoices();
      } else {
        toast.error("Failed to update invoice status");
      }
    } catch (err) {
      console.error("Error updating invoice status:", err);
      toast.error("Error updating invoice status");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!workOrder) {
    return <div className="text-center my-5 text-muted">No details found.</div>;
  }

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Work Order Details</h4>
          <BreadCrumb pathname={location?.pathname || ""} lastLabel="Work Order Details" />
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger overlay={<Tooltip>Raise a new invoice</Tooltip>}>
            <Button
              variant="primary"
              size="sm"
              className="px-3 py-2"
              onClick={() => setShowRaiseModal(true)}
            >
              <i className="bi bi-receipt-cutoff me-1"></i> Raise Invoice
            </Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Create a new invoice</Tooltip>}>
            <Button
              variant="success"
              size="sm"
              className="px-3 py-2"
              onClick={() => {
                setInvoiceData({
                  payment_amount: "",
                  cgst: 0,
                  sgst: 0,
                  igst: 0,
                  gst_type: "exclusive",
                });
                setIsEditingInvoice(false);
                setEditingInvoiceId(null);
                setShowInvoiceModal(true);
              }}
            >
              <i className="bi bi-receipt"></i> Create Invoice
            </Button>
          </OverlayTrigger>
          {/* <OverlayTrigger overlay={<Tooltip>Edit this work order</Tooltip>}>
            <Button
              variant="info"
              size="sm"
              className="px-3 py-2"
              onClick={() => handleShowModal(workOrder)}
            >
              <i className="bi bi-pencil"></i> Edit
            </Button>
          </OverlayTrigger> */}
          <OverlayTrigger overlay={<Tooltip>Preview & Download</Tooltip>}>
            <div>
    <DownloadSummary
      woNumber={workOrder?.wo_number}
      branchName={workOrder?.assignedBranch?.name}
      branchAddress={workOrder?.assignedBranch?.branch_address}
      branchContact={workOrder?.assignedBranch?.contact_number}
    />
            </div>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Go back to previous page</Tooltip>}>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="px-3 py-2">
              Back
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      <Row className="g-4">
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 border-0 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                <div className="bg-primary rounded-2" style={{width: "20px", height: "20px"}}></div>
              </div>
              <h6 className="fw-bold text-primary mb-0">Work Order Overview</h6>
            </div>
            <div className="card-body p-0">
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">WO Number</label>
                <p className="fw-semibold text-dark mb-2">{workOrder.wo_number}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Title</label>
                <p className="fw-semibold text-dark mb-2">{workOrder.title}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Description</label>
                <p className="text-dark mb-2">{workOrder.description || <span className="text-muted">Not provided</span>}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Status</label>
                <div>
                  <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2">
                    {workOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-muted small fw-semibold mb-1">Priority</label>
                <div>
                  <span
                    className={`badge px-3 py-2 fw-bold border border-opacity-25 text-dark ${
                      workOrder.priority === "High"
                        ? "bg-danger bg-opacity-15 text-danger border-danger"
                        : workOrder.priority === "Medium"
                        ? "bg-warning bg-opacity-15 text-warning border-warning"
                        : workOrder.priority === "Low"
                        ? "bg-success bg-opacity-15 text-success border-success"
                        : "bg-secondary bg-opacity-15 text-secondary border-secondary"
                    }`}
                  >
                    {workOrder.priority || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 border-0 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                <div className="bg-success rounded-2" style={{width: "20px", height: "20px"}}></div>
              </div>
              <h6 className="fw-bold text-success mb-0">Assigned Site Details</h6>
            </div>
            <div className="card-body p-0">
              {workOrder.assignedBranch ? (
                <>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Site Name</label>
                    <p className="fw-semibold text-dark mb-2">{workOrder.assignedBranch.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Address</label>
                    <p className="text-dark mb-2">{workOrder.assignedBranch.branch_address || <span className="text-muted">-</span>}</p>
                  </div>
                  <div>
                    <label className="text-muted small fw-semibold mb-1">Contact</label>
                    <p className="text-dark mb-0">{workOrder.assignedBranch.contact_number || <span className="text-muted">-</span>}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-light rounded-3 p-3 mb-2">
                    <div className="bg-secondary bg-opacity-25 rounded-2 mx-auto" style={{width: "40px", height: "40px"}}></div>
                  </div>
                  <p className="text-muted fst-italic mb-0">No site details available</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 border-0 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                <div className="bg-secondary rounded-2" style={{width: "20px", height: "20px"}}></div>
              </div>
              <h6 className="fw-bold text-drak mb-0">Plan & Cost Overview</h6>
            </div>
            <div className="card-body p-0">
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Total Amount</label>
                    <p className="fw-bold fs-5 text-dark mb-2">
                      {workOrder.work_order_amount ? `₹${formatAmount(workOrder.work_order_amount)}` : <span className="text-muted">-</span>}
                    </p>
                  </div>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Issue Date</label>
                    <p className="fw-semibold text-dark mb-2">
                      {workOrder.issue_date ? new Date(workOrder.issue_date).toLocaleDateString() : <span className="text-muted">-</span>}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Expected Completion</label>
                    <p className="fw-semibold text-dark mb-2">
                      {workOrder.expected_date ? new Date(workOrder.expected_date).toLocaleDateString() : <span className="text-muted">-</span>}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Expected Days</label>
                    <p className="fw-semibold text-dark mb-2">
                      {workOrder.expected_days || <span className="text-muted">-</span>}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Actual Start</label>
                    <p className="fw-semibold text-dark mb-2">
                      {workOrder.start_date ? new Date(workOrder.start_date).toLocaleDateString() : <span className="text-muted">-</span>}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Actual End</label>
                    <p className="fw-semibold text-dark mb-0">
                      {workOrder.end_date ? new Date(workOrder.end_date).toLocaleDateString() : <span className="text-muted">-</span>}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Actual Days</label>
                    <p className="fw-semibold text-dark mb-0">
                      {workOrder.actual_days || <span className="text-muted">-</span>}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="p-4 shadow-sm border-0 rounded-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
            <div
              className="bg-danger rounded-2"
              style={{ width: "20px", height: "20px" }}
            ></div>
          </div>
          <h6 className="fw-bold text-danger mb-0">Service Details</h6>
        </div>

            {workOrder.services && workOrder.services.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">#</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Service Code</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Description</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Unit</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Quantity</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Rate (₹)</th>
                      <th scope="col" className="py-3 fw-semibold text-muted border-0">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrder.services.map((svc, idx) => (
                      <tr key={svc.id || idx}>
                        <td className="ps-4 py-3">{idx + 1}</td>
                        <td>{svc.service_code}</td>
                        <td>{svc.description}</td>
                        <td>{svc.unit}</td>
                        <td>{formatNumber(svc.quantity)}</td>
                        <td>{formatAmount(svc.rate)}</td>
                        <td className="fw-semibold">{formatAmount(svc.amount)}</td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td colSpan="6" className="text-end">Total</td>
                      <td>
                        ₹{formatAmount(
                          workOrder.services.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted fst-italic mb-0">No service details available</p>
            )}
          </Card>
        </Col>
      </Row>

      <RaiseInvoiceModal
        show={showRaiseModal}
        onHide={() => setShowRaiseModal(false)}
        woNumber={workOrder?.wo_number}
        onSuccess={() => {
    fetchInvoices(); // ensures fetch is triggered
    setRefreshInvoices((prev) => !prev); // trigger child re-render
  }}
      />

      {/* Raised Invoices Table */}
      <RaiseInvoiceTable 
        woNumber={workOrder?.wo_number}
        branchName={workOrder?.assignedBranch?.name}
        branchAddress={workOrder?.assignedBranch?.branch_address}
        branchContact={workOrder?.assignedBranch?.contact_number}
        refreshTrigger={refreshInvoices}
      />
      <InvoiceSummary
        invoices={invoices}
        loadingInvoices={loadingInvoices}
        handleViewInvoice={handleViewInvoice}
        handleEditInvoice={handleEditInvoice}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteInvoice={handleDeleteInvoice}
      />

      {/* Work Order Modal */}
      <WorkOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedWorkOrder={selectedWorkOrder}
        handleSave={handleSave}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => {
          setShowInvoiceModal(false);
          setIsEditingInvoice(false);
          setEditingInvoiceId(null);
        }}
        invoiceData={invoiceData}
        handleInvoiceChange={handleInvoiceChange}
        handleSaveInvoice={handleSaveInvoice}
        creatingInvoice={creatingInvoice}
        isEditingInvoice={isEditingInvoice}
        workOrder={workOrder}
      />

      {/* View Invoice Modal */}
      <Modal show={showViewInvoiceModal} onHide={() => setShowViewInvoiceModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div>
              <p><strong>Invoice ID:</strong> {selectedInvoice.id}</p>
              <p><strong>WO Number:</strong> {selectedInvoice.wo_number}</p>
              <p><strong>Payment Amount:</strong> ₹{formatAmount(selectedInvoice.payment_amount)}</p>
              <p><strong>CGST:</strong> {selectedInvoice.cgst}%</p>
              <p><strong>SGST:</strong> {selectedInvoice.sgst}%</p>
              <p><strong>IGST:</strong> {selectedInvoice.igst}%</p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <OverlayTrigger overlay={<Tooltip>Close this window</Tooltip>}>
            <Button variant="secondary" onClick={() => setShowViewInvoiceModal(false)}>Close</Button>
          </OverlayTrigger>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkOrderDetails;
