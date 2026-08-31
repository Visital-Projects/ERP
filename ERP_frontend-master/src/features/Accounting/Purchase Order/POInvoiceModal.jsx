import React, { useEffect, useState } from "react";
import { Modal, Form, Button, OverlayTrigger, Tooltip, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";

const InvoiceModal = ({
  show,
  onHide,
  purchase,
  invoices,
  setInvoices,
  selectedInvoice,
  setSelectedInvoice,
  isEditingInvoice,
  setIsEditingInvoice,
}) => {
  const [invoiceForm, setInvoiceForm] = useState({
    po_number: purchase?.po_number || "",
    payment_amount: "",
    cgst: "",
    sgst: "",
    igst: "",
    gst_type: "exclusive",
    base_amount: "",
    gst_amount: "",
  });

  const [finalAmount, setFinalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ Added buffer loader state

  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setInvoiceForm({
        po_number: purchase?.po_number || "",
        payment_amount: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        gst_type: "exclusive",
        base_amount: "",
        gst_amount: "",
      });
      setFinalAmount(0);
      setErrors({});
      setLoading(false); // reset loader on close
    }
  }, [show]);

  useEffect(() => {
    if (purchase) {
      setInvoiceForm((prev) => ({
        ...prev,
        po_number: purchase.po_number || "",
      }));
    }
    if (isEditingInvoice && selectedInvoice) {
      setInvoiceForm({
        po_number: selectedInvoice.po_number,
        payment_amount: selectedInvoice.payment_amount || "",
        cgst: selectedInvoice.cgst || 0,
        sgst: selectedInvoice.sgst || 0,
        igst: selectedInvoice.igst || 0,
        gst_type: selectedInvoice.gst_type || "exclusive",
        base_amount: selectedInvoice.base_amount || "",
        gst_amount: selectedInvoice.gst_amount || "",
      });
    } else if (purchase) {
      setInvoiceForm({
        po_number: purchase.po_number,
        payment_amount: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        gst_type: "exclusive",
        base_amount: "",
        gst_amount: "",
      });
    }
  }, [purchase, selectedInvoice, isEditingInvoice]);

  // ✅ Auto-calculate GST, base, and total properly (also for edit)
  useEffect(() => {
    const base = parseFloat(invoiceForm.payment_amount) || 0;
    const cgst = parseFloat(invoiceForm.cgst) || 0;
    const sgst = parseFloat(invoiceForm.sgst) || 0;
    const igst = parseFloat(invoiceForm.igst) || 0;

    const gstPercent = cgst + sgst + igst;
    let total = base;
    let gstAmount = 0;
    let baseAmount = base;

    if (gstPercent > 0 && base > 0) {
      if (invoiceForm.gst_type === "exclusive") {
        gstAmount = (base * gstPercent) / 100;
        total = base + gstAmount;
      } else {
        baseAmount = base / (1 + gstPercent / 100);
        gstAmount = base - baseAmount;
        total = base;
      }
    }

    setFinalAmount(total.toFixed(2));
    setInvoiceForm((prev) => ({
      ...prev,
      gst_amount: gstAmount.toFixed(2),
      base_amount: baseAmount.toFixed(2),
    }));
  }, [
    invoiceForm.payment_amount,
    invoiceForm.cgst,
    invoiceForm.sgst,
    invoiceForm.igst,
    invoiceForm.gst_type,
  ]);

  const handleInvoiceChange = (field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!invoiceForm.payment_amount) newErrors.payment_amount = "Required field";
    if (!invoiceForm.gst_type) newErrors.gst_type = "Required field";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchInvoices = async () => {
    try {
      const res = await purchaseService.getPurchaseOrderInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filteredInvoices = res.data.filter(
          (inv) => inv.po_number === purchase.po_number
        );
        setInvoices(filteredInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices for this PO");
    }
  };

  const handleSaveInvoice = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true); // ✅ start loader
      const payload = {
        ...invoiceForm,
        po_number: purchase.po_number,
        total_amount: finalAmount,
      };

      if (isEditingInvoice && selectedInvoice) {
        await purchaseService.updatePurchaseOrderInvoice(selectedInvoice.id, payload);
        toast.success(`Invoice #${selectedInvoice.id} updated successfully`);
      } else {
        await purchaseService.createPurchaseOrderInvoice(payload);
        toast.success("Invoice created successfully");
      }

      onHide();
      setIsEditingInvoice(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditingInvoice ? "Edit Invoice" : "Create Invoice"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Payment Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.payment_amount}
                  onChange={(e) => handleInvoiceChange("payment_amount", e.target.value)}
                  isInvalid={!!errors.payment_amount}
                />
                {errors.payment_amount && (
                  <div className="text-danger small">{errors.payment_amount}</div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  GST Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={invoiceForm.gst_type}
                  onChange={(e) => handleInvoiceChange("gst_type", e.target.value)}
                  isInvalid={!!errors.gst_type}
                >
                  <option value="exclusive">Exclusive</option>
                  <option value="inclusive">Inclusive</option>
                </Form.Select>
                {errors.gst_type && (
                  <div className="text-danger small">{errors.gst_type}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>CGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.cgst}
                  onChange={(e) => handleInvoiceChange("cgst", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>SGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.sgst}
                  onChange={(e) => handleInvoiceChange("sgst", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>IGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={invoiceForm.igst}
                  onChange={(e) => handleInvoiceChange("igst", e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
{/* 
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <strong>Total Amount (After GST)</strong>
                </Form.Label>
                <Form.Control type="text" value={finalAmount} readOnly />
              </Form.Group>
            </Col>
          </Row> */}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Create/Update Invoice</Tooltip>}>
          <Button variant="success" onClick={handleSaveInvoice} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Creating...
              </>
            ) : (
              <>{isEditingInvoice ? "Update Invoice" : "Create"}</>
            )}
          </Button>
        </OverlayTrigger>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
