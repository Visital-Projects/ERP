import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { getBranches } from "../../../services/branchService";
import { fetchUnits, createUnit } from "../../../services/AccountingSetup";
import purchaseService from "../../../services/purchaseService";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";

const DraftPurchaseOrderModal = ({ show, onHide, draftData, refreshDrafts }) => {
  const [formData, setFormData] = useState({
    po_number: "",
    vendor_name: "",
    po_date: "",
    delivery_date: "",
    branch_id: "",
    status: "Approved",
    documents: [],
    line_items: [{ item_name: "", quantity: "", unit_id: "", unit_price: "" }],
  });

  const [branches, setBranches] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load form data if editing a draft
  useEffect(() => {
    if (draftData) {
      setFormData({
        ...draftData,
        documents: draftData.documents || [],
      });
    } else {
      setFormData({
        po_number: "",
        vendor_name: "",
        po_date: "",
        delivery_date: "",
        branch_id: "",
        status: "Approved",
        documents: [],
        line_items: [{ item_name: "", quantity: "", unit_id: "", unit_price: "" }],
      });
    }
  }, [draftData]);

  // Load branches & units when modal opens
  useEffect(() => {
    if (show) {
      const loadData = async () => {
        setLoadingBranches(true);
        const branchesData = await getBranches();
        setBranches(branchesData);
        setLoadingBranches(false);

        setLoadingUnits(true);
        const unitsData = await fetchUnits();
        setUnits(unitsData);
        setLoadingUnits(false);
      };
      loadData();
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle document selection
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        ...newFiles.map((f) => ({
          file: f,
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ],
    }));
    e.target.value = null;
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.line_items];
      updated[index][field] = value;
      return { ...prev, line_items: updated };
    });
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { item_name: "", quantity: "", unit_id: "", unit_price: "" }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  // Save as draft → store safely in localStorage
  const handleSaveAsDraft = () => {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem("poDrafts")) || [];

      const draftToSave = {
        ...formData,
        documents: formData.documents.map((doc) => ({
          name: doc.name,
          size: doc.size,
          type: doc.type,
        })),
      };

      let updatedDrafts;
      if (draftData) {
        updatedDrafts = existingDrafts.map((d) =>
          d.po_number === draftData.po_number ? draftToSave : d
        );
      } else {
        updatedDrafts = [...existingDrafts, draftToSave];
      }

      localStorage.setItem("poDrafts", JSON.stringify(updatedDrafts));
      toast.success("Saved as draft successfully!");
      refreshDrafts?.();
      onHide();
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

const handleSavePurchaseOrder = async () => {
  try {
    setSaving(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "documents") {
        formData.documents.forEach((d) => {
          if (d.file) payload.append("documents", d.file);
        });
      } else if (key === "line_items") {
        payload.append("line_items", JSON.stringify(formData.line_items));
      } else {
        payload.append(key, formData[key]);
      }
    });

const response = await purchaseService.createPurchaseOrder(payload);
console.log("✅ PO creation response:", response);

    // ✅ If creating from a draft, remove that draft from localStorage
    if (draftData) {
      const existingDrafts = JSON.parse(localStorage.getItem("poDrafts") || "[]");
      const updatedDrafts = existingDrafts.filter(
        (d) => d.po_number !== draftData.po_number
      );
      localStorage.setItem("poDrafts", JSON.stringify(updatedDrafts));
    }

    // ✅ Refresh draft list (table) only
    refreshDrafts?.();

    // ✅ Close modal and clear selection
    onHide();
  } catch (error) {
    console.error(error);
    toast.error("Failed to create Purchase Order");
  } finally {
    setSaving(false);
  }
};


  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Purchase Order (from Draft)</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Basic Info */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>PO Number</Form.Label>
                <Form.Control
                  type="text"
                  name="po_number"
                  value={formData.po_number || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vendor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>PO Date</Form.Label>
                <Form.Control
                  type="date"
                  name="po_date"
                  value={formData.po_date || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Delivery Date</Form.Label>
                <Form.Control
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Branch & Status */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Site</Form.Label>
                {loadingBranches ? (
                  <div>Loading...</div>
                ) : (
                  <Form.Select
                    name="branch_id"
                    value={formData.branch_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Site</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Approved">Approved</option>
                  <option value="Received">Received</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Documents */}
          <Form.Group className="mb-3">
            <Form.Label>Documents</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
            {formData.documents?.length > 0 && (
              <ul className="mt-2">
                {formData.documents.map((doc, idx) => (
                  <li key={idx} className="d-flex justify-content-between align-items-center">
                    <span>
                      {doc.name} ({Math.round(doc.size / 1024)} KB)
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Form.Group>

          <hr />
          <h6 className="fw-bold">Line Items</h6>

          {formData.line_items.map((item, idx) => (
            <div key={idx} className="border rounded p-3 mb-2 bg-light">
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Item</Form.Label>
                    <Form.Control
                      value={item.item_name}
                      onChange={(e) => handleLineItemChange(idx, "item_name", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Qty</Form.Label>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Unit</Form.Label>
                    <CreatableSelect
                      value={
                        item.unit_id
                          ? {
                              value: item.unit_id,
                              label: units.find((u) => u.id === item.unit_id)?.name,
                            }
                          : null
                      }
                      onChange={async (selected) => {
                        if (selected.__isNew__) {
                          const newUnit = await createUnit({ name: selected.value });
                          if (newUnit?.id) {
                            setUnits((prev) => [...prev, newUnit]);
                            handleLineItemChange(idx, "unit_id", newUnit.id);
                          }
                        } else {
                          handleLineItemChange(idx, "unit_id", selected.value);
                        }
                      }}
                      options={units.map((u) => ({ value: u.id, label: u.name }))}
                      isClearable
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Unit Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button size="sm" variant="danger" onClick={() => removeLineItem(idx)}>
                    ×
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={addLineItem}>
            + Add Item
          </Button>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="warning" onClick={handleSaveAsDraft}>
          Save as Draft
        </Button>
        <Button variant="success" disabled={saving} onClick={handleSavePurchaseOrder}>
          {saving ? <Spinner animation="border" size="sm" /> : "Create Purchase Order"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DraftPurchaseOrderModal;
