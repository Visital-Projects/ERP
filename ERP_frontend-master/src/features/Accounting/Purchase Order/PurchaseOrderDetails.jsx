import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Table, Button, OverlayTrigger, Tooltip, Spinner, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";
import PurchaseOrderModal from "./PurchaseOrderModal";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import BreadCrumb from "../../../components/BreadCrumb";
import InvoiceModal from "./POInvoiceModal";
import InvoiceSummaryTable from "./InvoiceSummaryTable";
import RaiseInvoiceModal from "./RaiseInvoiceModal";
import RaisedInvoiceTable from "./RaisedInvoiceTable";
import PurchaseOrderDownload from "./PurchaseOrderDownload";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [refreshInvoices, setRefreshInvoices] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRaiseInvoiceModal, setShowRaiseInvoiceModal] = useState(false);

  // Purchase edit modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    po_number: "",
    vendor_name: "",
    po_date: "",
    delivery_date: "",
    status: "Draft",
    branch_id: "",
    line_items: [{ item_name: "", quantity: "", unit_price: "" }],
  });

  const fetchPurchase = async () => {
    try {
      const res = await purchaseService.getPurchaseById(id);
      if (res?.success) {
        setPurchase(res.data);
        fetchInvoices(res.data.po_number);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast.error("Failed to fetch purchase order details");
    }
  };

  const fetchInvoices = async (poNumber) => {
    try {
      setLoadingInvoices(true);
      const res = await purchaseService.getPurchaseOrderInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filteredInvoices = res.data.filter(
          (inv) => inv.po_number === poNumber
        );
        setInvoices(filteredInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices for this PO");
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  if (!purchase) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="text-muted mt-2">Loading purchase order details...</p>
    </div>
  );

  const subTotal = purchase.line_items.reduce(
    (sum, item) => sum + Number(item.line_total),
    0
  );

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.line_items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { item_name: "", quantity: "", unit_price: "" }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      await purchaseService.updatePurchaseOrder(purchase.id, formData);
      toast.success("Purchase Order updated successfully");
      setShowModal(false);
      fetchPurchase();
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast.error("Failed to update purchase order");
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: `Are you sure you want to permanently delete invoice ?`,
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          await purchaseService.deletePurchaseOrderInvoice(invoiceId);
          toast.success(`Invoice  deleted successfully`);
          fetchInvoices(purchase.po_number);
        } catch (error) {
          console.error("Error deleting invoice:", error);
          toast.error("Failed to delete invoice");
        }
      },
    });
  };

  const handleToggleInvoiceStatus = async (invoice) => {
    try {
      const newStatus =
        invoice.status?.toLowerCase() === "paid" ? "Pending" : "Paid";

      await purchaseService.updatePurchaseOrderInvoiceStatus(invoice.id, newStatus);
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoices(purchase.po_number);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleInvoiceEdit = (invoice) => {
    setIsEditingInvoice(true);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

const handleRaiseInvoiceSubmit = async (payload) => {
  try {
    const res = await purchaseService.raiseInvoiceFromPO(payload);
    if (res?.success) {
      toast.success(res.message || "Invoice raised successfully!");
      fetchInvoices(purchase.po_number);
      setShowRaiseInvoiceModal(false);
      setRefreshInvoices((prev) => !prev); 
    } else {
      toast.error(res?.message || "Failed to raise invoice");
    }
  } catch (error) {
    console.error("Error raising invoice:", error);
    toast.error(error?.message || "Failed to raise invoice");
  }
};


  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold text-dark">Purchase Order Details</h4>
          <div className="w-100 mt-2">
            <BreadCrumb 
              pathname={window.location.pathname} 
              lastLabel={`PO #${purchase.po_number}`} 
              dynamicNames={{ 
                "purchase-orders": "Purchase Order",
                [id]: `PO #${purchase.po_number}` 
              }} 
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger placement="top" overlay={<Tooltip>Raise Invoice</Tooltip>}>
            <Button
              size="sm"
              variant="primary"
              className="px-3 py-2"
    onClick={() => setShowRaiseInvoiceModal(true)}
            >
              <i className="bi bi-receipt-cutoff me-1"></i>Raise Invoice
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip>Create Invoice</Tooltip>}>
            <Button 
              size="sm" 
              variant="success" 
              className="px-3 py-2"
              onClick={() => setShowInvoiceModal(true)}
            >
              <i className="bi bi-plus me-1"></i>Create Invoice
            </Button>
          </OverlayTrigger>
          
          {purchase?.po_number && (
            <PurchaseOrderDownload poNumber={purchase.po_number} />
          )}

          <OverlayTrigger placement="top" overlay={<Tooltip>Go Back</Tooltip>}>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Top Info Section */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 border-0 rounded-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                <div className="bg-primary rounded-2" style={{width: "20px", height: "20px"}}></div>
              </div>
              <h6 className="fw-bold text-primary mb-0">Purchase Order Info</h6>
            </div>
            <div className="card-body p-0">
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">PO Number</label>
                <p className="fw-semibold text-dark mb-2">{purchase.po_number}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Vendor</label>
                <p className="fw-semibold text-dark mb-2">{purchase.vendor_name}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Status</label>
                <p className="fw-semibold text-dark mb-2">{purchase.status}</p>
              </div>
              <div>
                <label className="text-muted small fw-semibold mb-1">PO Date</label>
                <p className="fw-semibold text-dark mb-0">
                  {new Date(purchase.po_date).toLocaleDateString()}
                </p>
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
              <h6 className="fw-bold text-success mb-0">Delivery Info</h6>
            </div>
            <div className="card-body p-0">
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Delivery Date</label>
                <p className="fw-semibold text-dark mb-2">
                  {new Date(purchase.delivery_date).toLocaleDateString()}
                </p>
              </div>
              {purchase.branch ? (
                <>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Site Name</label>
                    <p className="fw-semibold text-dark mb-2">{purchase.branch.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-semibold mb-1">Address</label>
                    <p className="text-dark mb-2">
                      {purchase.branch.branch_address || <span className="text-muted">-</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted small fw-semibold mb-1">Contact</label>
                    <p className="text-dark mb-0">
                      {purchase.branch.contact_number || <span className="text-muted">-</span>}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
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
              <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                <div className="bg-warning rounded-2" style={{width: "20px", height: "20px"}}></div>
              </div>
              <h6 className="fw-bold text-warning mb-0">Financial Summary</h6>
            </div>
            <div className="card-body p-0">
              <div className="mb-3">
                <label className="text-muted small fw-semibold mb-1">Total Line Items</label>
                <p className="fw-semibold text-dark mb-2">{purchase.line_items.length}</p>
              </div>
              <div>
                <label className="text-muted small fw-semibold mb-1">Sub Total</label>
                <p className="fw-bold fs-5 text-dark mb-0">₹{subTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Line Items */}
      <Card className="p-4 shadow-sm border-0 rounded-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
            <div className="bg-info rounded-2" style={{width: "20px", height: "20px"}}></div>
          </div>
          <h6 className="fw-bold text-info mb-0">Line Items</h6>
        </div>
        
        {purchase.line_items.length > 0 ? (
          <div className="table-responsive rounded-3">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 fw-semibold text-muted border-0">#</th>
                  <th className="py-3 fw-semibold text-muted border-0">Item Name</th>
                  <th className="py-3 fw-semibold text-muted border-0">Quantity</th>
                  <th className="py-3 fw-semibold text-muted border-0">Unit Price</th>
                  <th className="pe-4 py-3 fw-semibold text-muted border-0 text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.line_items.map((item, i) => (
                  <tr key={i} className="border-top">
                    <td className="ps-4 py-3 fw-semibold text-dark">{i + 1}</td>
                    <td className="py-3 text-dark">{item.item_name}</td>
                    <td className="py-3 text-dark">{item.quantity}</td>
                    <td className="py-3 text-dark">₹{Number(item.unit_price).toLocaleString("en-IN")}</td>
                    <td className="pe-4 py-3 fw-semibold text-dark text-end">₹{Number(item.line_total).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                <tr className="border-top">
                  <td colSpan={4} className="ps-4 py-3 fw-bold text-end border-0">Sub Total</td>
                  <td className="pe-4 py-3 fw-bold fs-6 text-primary text-end border-0">₹{subTotal.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="bg-light rounded-3 p-3 mb-2">
              <div className="bg-secondary bg-opacity-25 rounded-2 mx-auto" style={{width: "40px", height: "40px"}}></div>
            </div>
            <p className="text-muted fst-italic mb-0">No line items found</p>
          </div>
        )}
      </Card>
        <RaisedInvoiceTable poNumber={purchase.po_number} refreshTrigger={refreshInvoices} />

      <InvoiceSummaryTable
        invoices={invoices}
        loadingInvoices={loadingInvoices}
        handleInvoiceEdit={handleInvoiceEdit}
        handleToggleInvoiceStatus={handleToggleInvoiceStatus}
        handleDeleteInvoice={handleDeleteInvoice}
        setSelectedInvoice={setSelectedInvoice}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onHide={() => {
          setShowInvoiceModal(false);
          setIsEditingInvoice(false);
          setSelectedInvoice(null);
        }}
        purchase={purchase}
        invoices={invoices}
        setInvoices={setInvoices}
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
        isEditingInvoice={isEditingInvoice}
        setIsEditingInvoice={setIsEditingInvoice}
      />

      {/* Purchase Edit Modal */}
      <PurchaseOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedPurchase={purchase}
        handleSave={handleSave}
        addLineItem={addLineItem}
        removeLineItem={removeLineItem}
        handleLineItemChange={handleLineItemChange}
      />
      <RaiseInvoiceModal
  show={showRaiseInvoiceModal}
  onHide={() => setShowRaiseInvoiceModal(false)}
  purchase={purchase}
  onSubmit={handleRaiseInvoiceSubmit}
/>
    </div>
  );
};

export default PurchaseOrderDetails;