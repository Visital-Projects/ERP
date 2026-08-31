// src/pages/PurchaseOrders/components/RaiseInvoiceModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const RaiseInvoiceModal = ({ show, onHide, purchase, onSubmit }) => {
  const [formData, setFormData] = useState({
    number: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    gst_type: "Exclusive",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 🔥 new state for loader

  useEffect(() => {
    if (purchase) {
      setFormData((prev) => ({
        ...prev,
        number: purchase.po_number || "",
      }));
    }
  }, [purchase]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle GST fields — allow clearing 0
    if (["cgst", "sgst", "igst"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.number) newErrors.number = "This field is required";
    if (!formData.gst_type) newErrors.gst_type = "This field is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true); // 🔥 start loader
      await onSubmit(formData);
    } finally {
      setLoading(false); // 🔥 stop loader after submission
    }
  };

  const getInputClass = (field) =>
    errors[field] ? "is-invalid" : "";

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Raise Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Invoice Number */}
          <Form.Group className="mb-3">
            <Form.Label>
              Invoice Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.number}
              name="number"
              readOnly
              className={getInputClass("number")}
            />
            {errors.number && (
              <div className="text-danger small mt-1">{errors.number}</div>
            )}
          </Form.Group>

          {/* GST Type */}
          <Form.Group className="mb-3">
            <Form.Label>
              GST Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="gst_type"
              value={formData.gst_type}
              onChange={handleChange}
              className={getInputClass("gst_type")}
            >
              <option value="Exclusive">Exclusive</option>
              <option value="Inclusive">Inclusive</option>
            </Form.Select>
            {errors.gst_type && (
              <div className="text-danger small mt-1">{errors.gst_type}</div>
            )}
          </Form.Group>

          {/* CGST */}
          <Form.Group className="mb-3">
            <Form.Label>CGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="cgst"
              value={formData.cgst}
              onChange={handleChange}
              placeholder="Enter CGST percentage"
            />
          </Form.Group>

          {/* SGST */}
          <Form.Group className="mb-3">
            <Form.Label>SGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="sgst"
              value={formData.sgst}
              onChange={handleChange}
              placeholder="Enter SGST percentage"
            />
          </Form.Group>

          {/* IGST */}
          <Form.Group className="mb-3">
            <Form.Label>IGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="igst"
              value={formData.igst}
              onChange={handleChange}
              placeholder="Enter IGST percentage"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
              />
              Raising...
            </>
          ) : (
            "Raise Invoice"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RaiseInvoiceModal;
 