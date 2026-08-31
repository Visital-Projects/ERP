import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { getBranches } from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import expenseService from "../../../services/expensessService";

const EditExpenseModal = ({ show, onHide, expense, onUpdated }) => {
  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [remarkError, setRemarkError] = useState("");
  const [formData, setFormData] = useState({
    branch_id: "",
    category_id: "",
    description: "",
    actual_bill_date: "",
    remark: "",
  });

  
  const [items, setItems] = useState([
    {
      item_name: "",
      subtotal: 0,
      is_taxable: false,
      tax_rate: 0,
      tax_type: "",
      document: null,
    },
  ]);

  // ✅ FIXED: Fetch when modal opens (show prop changes)
  useEffect(() => {
    if (show) {
      fetchBranches();
      fetchCategories();
    }
  }, [show]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Error fetching branches", err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (expense) {
      setFormData({
        branch_id: expense.branch_id || "",
        category_id: expense.category_id || "",
        description: expense.description || "",
        type_of_supply_or_service: expense.type_of_supply_or_service || "",
        actual_bill_date: toDateInputValue(
          expense.actual_bill_date ||
          expense.payment_date ||
          expense.created_at ||
          expense.createdAt
        ),
      remark: expense.remark || "",
      });
      const FILE_BASE_URL = import.meta.env.VITE_BASE_URL || "";
const prefillItems =
  expense.items?.map((item) => {
    let doc = item.document_url || item.document || "";
    if (doc && !doc.startsWith("http")) {
      // prepend your backend base URL only if it’s a relative path
      doc = `${FILE_BASE_URL}${doc.startsWith("/") ? "" : "/"}${doc}`;
    }
    return {
      item_name: item.item_name,
      subtotal: parseFloat(item.subtotal),
      is_taxable: item.is_taxable,
      tax_rate: parseFloat(item.tax_rate),
      tax_type: item.tax_type,
      document: null,
      existing_document: doc,
    };
  }) || [
    {
      item_name: "",
      subtotal: 0,
      is_taxable: false,
      tax_rate: 0,
      tax_type: "",
      document: null,
      existing_document: "",
    },
  ];

      setItems(prefillItems);
    }
  }, [expense]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleItemFileChange = (index, file) => {
    const updated = [...items];
    updated[index].document = file;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: "",
        subtotal: 0,
        is_taxable: false,
        tax_rate: 0,
        tax_type: "",
        document: null,
      },
    ]);
  };

  const subtotal = items.reduce((sum, item) => {
    const val = parseFloat(item.subtotal) || 0;
    if (item.is_taxable && item.tax_type === "inclusive" && item.tax_rate) {
      return sum + val / (1 + item.tax_rate / 100);
    }
    return sum + val;
  }, 0);

  const totalTax = items.reduce((sum, item) => {
    const val = parseFloat(item.subtotal) || 0;
    if (item.is_taxable && item.tax_rate) {
      if (item.tax_type === "inclusive") {
        return sum + (val - val / (1 + item.tax_rate / 100));
      } else {
        return sum + (val * item.tax_rate) / 100;
      }
    }
    return sum;
  }, 0);

  const totalAmount = subtotal + totalTax;

  // ✅ FIXED: Removed setErrors({}) and changed handleClose() to onHide()
  const handleAnimatedClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      onHide(); // ✅ CHANGED: Was handleClose() - now uses onHide() prop
    }, 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
if (!formData.remark || formData.remark.trim() === "") {
  setRemarkError("Remark is mandatory while updating");
  return;
} else {
  setRemarkError("");
}
    try {
      const data = new FormData();
      data.append("branch_id", formData.branch_id);
      data.append("category_id", formData.category_id);
      data.append("description", formData.description);
      data.append("type_of_supply_or_service", formData.type_of_supply_or_service || "");
      data.append("remark", formData.remark);
      data.append("actual_bill_date", formData.actual_bill_date);
      items.forEach((item, i) => {
        data.append(`items[${i}][item_name]`, item.item_name);
        data.append(`items[${i}][subtotal]`, item.subtotal);
        data.append(`items[${i}][is_taxable]`, item.is_taxable);
        data.append(`items[${i}][tax_rate]`, item.tax_rate);
        data.append(`items[${i}][tax_type]`, item.tax_type);
         if (item.document) {
    data.append(`items[${i}][document]`, item.document);
  }
});

      await expenseService.updateExpense(expense.id, data);
      toast.success("Expense updated successfully!");
      // ✅ CHANGED: Now calls handleAnimatedClose() instead of just onHide()
      handleAnimatedClose();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expense");
    }
  };

  return (
    <div>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .custom-slide-modal.open .modal-dialog {
          animation: slideInUp 0.7s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.7s ease forwards;
        }
      `}</style>

      <Modal
        show={show}
        onHide={handleAnimatedClose}
        size="lg"
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Non-GST Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="p-3">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label>
                    <strong>
                      Site<span className="text-danger">*</span>
                    </strong>
                  </Form.Label>
                  <Form.Select
                    value={formData.branch_id}
                    onChange={(e) =>
                      setFormData({ ...formData, branch_id: e.target.value })
                    }
                    required
                  >
                    <option value="">
                      {loadingBranches ? "Loading..." : "Select Site"}
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label>
                    <strong>
                      Category<span className="text-danger">*</span>
                    </strong>
                  </Form.Label>
                  <Form.Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    required
                  >
                    <option value="">
                      {loadingCategories ? "Loading..." : "Select Category"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label>
                    <strong>
                      Vendor Name<span className="text-danger">*</span>
                    </strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    placeholder="Enter vendor name..."
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </Col>

                <Col md={3}>
                  <Form.Label>
                    <strong>
                      Type of Supply / Service<span className="text-danger">*</span>
                    </strong>
                  </Form.Label>
                  <Form.Select
                    value={formData.type_of_supply_or_service || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, type_of_supply_or_service: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Service">Service</option>
                    <option value="Supply">Supply</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
  <Form.Label>
    <strong>
      Bill Date<span className="text-danger">*</span>
    </strong>
  </Form.Label>
  <Form.Control
    type="date"
    value={formData.actual_bill_date}
    onChange={(e) =>
      setFormData({ ...formData, actual_bill_date: e.target.value })
    }
    required
  />
</Col>
<Col md={12} className="mt-2">
  <Form.Label>
    <strong>
      Remark<span className="text-danger"> *</span>
    </strong>
  </Form.Label>

  <div style={{ position: "relative" }}>
    <Form.Control
      as="textarea"
      rows={3}
      placeholder="Enter reason for updating this purchase..."
      value={formData.remark}
      onChange={(e) => {
        setFormData({ ...formData, remark: e.target.value });
        if (e.target.value.trim() !== "") {
          setRemarkError("");
        }
      }}
      className={remarkError ? "is-invalid" : ""}
    />

    {remarkError && (
      <span
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          color: "#dc3545",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        
      </span>
    )}
  </div>

  {remarkError && (
    <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
      {remarkError}
    </div>
  )}
</Col>
              </Row>
            
              <div className="mb-3 text-end">
                <Button variant="success" onClick={addItem}>
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px 15px",
                    marginBottom: "10px",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      padding: "0 6px",
                      lineHeight: 1,
                    }}
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                  >
                    &times;
                  </Button>

                  <Form.Control
                    type="text"
                    placeholder="Item Name"
                    value={item.item_name}
                    onChange={(e) =>
                      handleItemChange(index, "item_name", e.target.value)
                    }
                    style={{ flex: "1 1 180px" }}
                    required
                  />

                  <Form.Control
                    type="number"
                    placeholder="Subtotal"
                    value={item.subtotal}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "subtotal",
                        parseFloat(e.target.value)
                      )
                    }
                    style={{ flex: "1 1 100px" }}
                    required
                  />

                  {/* Taxable Checkbox removed */}

                  {item.is_taxable && (
                    <>
                      <Form.Control
                        type="number"
                        placeholder="Tax Rate (%)"
                        value={item.tax_rate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "tax_rate",
                            parseFloat(e.target.value)
                          )
                        }
                        style={{ flex: "1 1 120px" }}
                        required
                      />

                      <Form.Select
                        value={item.tax_type}
                        onChange={(e) =>
                          handleItemChange(index, "tax_type", e.target.value)
                        }
                        style={{ flex: "1 1 150px" }}
                        required
                      >
                        <option value="">Tax Type</option>
                        <option value="inclusive">Inclusive</option>
                        <option value="exclusive">Exclusive</option>
                      </Form.Select>
                    </>
                  )}

<Form.Group controlId={`itemDoc${index}`} className="mb-2">
  <Form.Label><strong>Document</strong></Form.Label>
{item.existing_document && (
  <div className="mb-2 text-center">
    {item.existing_document.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
      <a
        href={item.existing_document}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={item.existing_document}
          alt="Existing Document"
          style={{
            maxWidth: "120px",
            maxHeight: "120px",
            borderRadius: "8px",
            objectFit: "cover",
            border: "1px solid #ddd",
            padding: "3px",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </a>
    ) : (
      <a
        href={item.existing_document}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary"
      >
        View Document
      </a>
    )}
  </div>
)}

<Form.Control
  type="file"
  accept="image/*,.pdf,.doc,.docx"
  onChange={(e) => handleItemChange(index, "document", e.target.files[0])}
/>

</Form.Group>
                </div>
              ))}

              <div className="text-end mb-3">
                <Row className="justify-content-end">
                  <Col md={4}>
                    {/* Subtotal and Tax hidden */}
                    <div className="d-flex justify-content-between">
                      <strong>Total Amount (₹)</strong>
                      <span>{totalAmount.toFixed(2)}</span>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="text-end mt-4">
                <Button variant="secondary" className="me-2" onClick={handleAnimatedClose}>
                  Cancel
                </Button>
                <Button variant="success" type="submit">
                  Update Expense
                </Button>
              </div>
            </Form>
          </Card>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EditExpenseModal;
