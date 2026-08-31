import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import creditPurchaseService from "../../../services/expensessService";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CreditPurchaseForm = ({
  initialBranchId = "",
  initialAmount = "",
  initialDescription = "",
  initialTransactionDate = "",
  existingPurchase = null,
  fromWallet = false,
  onCancel,
  onSuccess,
}) => {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const supplyTypes = ["Service", "Supply"];

  const [formData, setFormData] = useState({
    branch_id: initialBranchId || "",
    category_id: "",
    description: initialDescription || "",
    vendor_name: "",
    type_of_supply_or_service: "",
    actual_bill_date: getTodayDateString(),
    remark: "",
    items: [
      {
        item_name: "",
        subtotal: initialAmount || "",
        is_taxable: false,
        tax_rate: 0,
        tax_type: "inclusive",
        document: null,
      },
    ],
    status: "pending",
  });

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const data = await branchService.getAll();
      setBranches(data || []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (existingPurchase) {
      setFormData({
        branch_id: existingPurchase.branch_id || "",
        category_id: existingPurchase.category_id || "",
        description: existingPurchase.description || "",
        vendor_name: existingPurchase.vendor_name || "",
        type_of_supply_or_service: existingPurchase.type_of_supply_or_service || "",
        actual_bill_date: existingPurchase.actual_bill_date
          ? String(existingPurchase.actual_bill_date).split("T")[0]
          : getTodayDateString(),
        remark: existingPurchase.remark || "",
        items: (existingPurchase.items || []).map((item) => ({
          item_name: item.item_name || "",
          subtotal: item.subtotal || "",
          is_taxable: !!item.is_taxable,
          tax_rate: item.tax_rate || 0,
          tax_type: item.tax_type || "inclusive",
          document: null,
        })),
        status: existingPurchase.status || "pending",
      });
    } else if (initialBranchId || initialAmount || initialDescription || initialTransactionDate) {
      setFormData((prev) => ({
        ...prev,
        branch_id: initialBranchId || prev.branch_id,
        description: initialDescription || prev.description,
        actual_bill_date: prev.actual_bill_date || getTodayDateString(),
        items: [
          {
            item_name: "",
            subtotal: initialAmount || "",
            is_taxable: false,
            tax_rate: 0,
            tax_type: "inclusive",
            document: null,
          },
        ],
      }));
    }
  }, [existingPurchase, initialBranchId, initialAmount, initialDescription, initialTransactionDate]);

  const handleChange = (e, index, field) => {
    if (field === "items") {
      const updatedItems = [...formData.items];
      updatedItems[index][e.target.name] =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (index, file) => {
    const updatedItems = [...formData.items];
    updatedItems[index].document = file;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          item_name: "",
          subtotal: "",
          is_taxable: false,
          tax_rate: 0,
          tax_type: "inclusive",
          document: null,
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      toast.warning("At least one item is required");
      return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    let totalAmount = 0;

    formData.items.forEach((item) => {
      const sub = parseFloat(item.subtotal || 0);
      const rate = parseFloat(item.tax_rate || 0);

      if (!item.is_taxable) {
        subtotal += sub;
        totalAmount += sub;
      } else {
        if (item.tax_type === "exclusive") {
          const tax = sub * (rate / 100);
          subtotal += sub;
          taxTotal += tax;
          totalAmount += sub + tax;
        } else {
          // inclusive
          const tax = sub * (rate / (100 + rate));
          subtotal += sub - tax;
          taxTotal += tax;
          totalAmount += sub;
        }
      }
    });

    return {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      setIsSubmitting(true);

      const newErrors = {};
      if (!fromWallet && !formData.branch_id) newErrors.branch_id = "Site is required";
      if (!formData.category_id) newErrors.category_id = "Payment Head is required";
      if (!formData.vendor_name?.trim()) newErrors.vendor_name = "Vendor name is required";
      if (!formData.type_of_supply_or_service) newErrors.type_of_supply_or_service = "Type of supply or service is required";
      if (!fromWallet && !formData.actual_bill_date) newErrors.actual_bill_date = "Bill date is required";
      if (existingPurchase && !formData.remark?.trim()) {
        newErrors.remark = "Remark is mandatory while updating";
      }

      formData.items.forEach((item, i) => {
        if (!item.item_name?.trim()) newErrors[`item_name_${i}`] = "Item name is required";
        if (!fromWallet && !item.subtotal) newErrors[`subtotal_${i}`] = "Amount is required";
        if (item.is_taxable && !item.tax_rate) newErrors[`tax_rate_${i}`] = "Tax rate is required";
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        toast.error("Please fill all required fields correctly.");
        return;
      } else {
        setErrors({});
      }

      const submitData = new FormData();
      submitData.append("branch_id", formData.branch_id);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.description || "");
      submitData.append("actual_bill_date", formData.actual_bill_date);
      submitData.append("remark", formData.remark || "");
      submitData.append("vendor_name", formData.vendor_name);
      submitData.append("type_of_supply_or_service", formData.type_of_supply_or_service);
      submitData.append("status", formData.status || "pending");

      formData.items.forEach((item, i) => {
        submitData.append(`items[${i}][item_name]`, item.item_name);
        submitData.append(`items[${i}][subtotal]`, item.subtotal);
        submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
        submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
        submitData.append(`items[${i}][tax_type]`, item.tax_type);
        if (item.document) {
          submitData.append(`item_document_${i}`, item.document);
        }
      });

      if (existingPurchase) {
        await creditPurchaseService.updateCreditPurchase(existingPurchase.id, submitData);
        toast.success("GST purchase updated successfully");
      } else {
        await creditPurchaseService.createCreditPurchase(submitData);
        toast.success("GST purchase created successfully");
      }

      if (onSuccess) {
        onSuccess(formData.branch_id);
      }
    } catch (err) {
      console.error("Failed to submit GST Purchase:", err);
      toast.error(err.message || "Failed to submit GST purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSiteDisabled = !existingPurchase && !!formData.branch_id;

  return (
    <Card className="p-4 shadow-sm">
      <Form onSubmit={handleSubmit}>
        {/* Row 1: Site & Payment Head */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Site {!isSiteDisabled && <span className="text-danger">*</span>}
              </Form.Label>
              <Select
                value={
                  formData.branch_id
                    ? {
                        value: formData.branch_id,
                        label:
                          branches.find(
                            (b) => String(b.id) === String(formData.branch_id)
                          )?.name || formData.branch_id,
                      }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    branch_id: selected ? selected.value : "",
                  }));
                }}
                options={branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
                placeholder={loadingBranches ? "Loading sites..." : "Select Site..."}
                isDisabled={isSiteDisabled || isSubmitting}
                isClearable={!isSiteDisabled && !isSubmitting}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: state.isDisabled ? "#e9ecef" : base.backgroundColor,
                    cursor: state.isDisabled ? "not-allowed" : "default",
                    borderColor: errors.branch_id
                      ? "#dc3545"
                      : state.isFocused
                      ? "#198754"
                      : "#ced4da",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: state.isDisabled
                        ? "#ced4da"
                        : errors.branch_id
                        ? "#dc3545"
                        : "#198754",
                    },
                  }),
                }}
              />
              {errors.branch_id && (
                <div className="invalid-feedback d-block">
                  {errors.branch_id}
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Payment Head <span className="text-danger">*</span>
              </Form.Label>
              <CreatableSelect
                value={
                  formData.category_id
                    ? {
                        value: formData.category_id,
                        label:
                          categories.find((c) => String(c.id) === String(formData.category_id))?.name ||
                          formData.category_id,
                      }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    category_id: selected ? selected.value : "",
                  }));
                }}
                onCreateOption={async (inputValue) => {
                  if (!inputValue?.trim()) return;
                  try {
                    const newCat = await categoryService.createCategory(inputValue.trim());
                    if (newCat && newCat.id) {
                      setCategories((prev) => [...prev, newCat]);
                      setFormData((prev) => ({
                        ...prev,
                        category_id: newCat.id,
                      }));
                      toast.success(`Category "${inputValue}" created`);
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        category_id: inputValue,
                      }));
                    }
                  } catch (err) {
                    console.error("Failed to create category:", err);
                    setFormData((prev) => ({
                      ...prev,
                      category_id: inputValue,
                    }));
                  }
                }}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder={loadingCategories ? "Loading categories..." : "Select or create Payment Head..."}
                isClearable={!isSubmitting}
                isDisabled={isSubmitting}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.category_id
                      ? "#dc3545"
                      : state.isFocused
                      ? "#198754"
                      : "#ced4da",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: errors.category_id ? "#dc3545" : "#198754",
                    },
                  }),
                }}
              />
              {errors.category_id && (
                <div className="invalid-feedback d-block">
                  {errors.category_id}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Row 2: Vendor Name & Type of Supply / Service */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Vendor Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="Enter vendor name..."
                isInvalid={!!errors.vendor_name}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.vendor_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Type of Supply / Service <span className="text-danger">*</span>
              </Form.Label>
              <Select
                value={
                  formData.type_of_supply_or_service
                    ? {
                        value: formData.type_of_supply_or_service,
                        label: formData.type_of_supply_or_service,
                      }
                    : null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    type_of_supply_or_service: selected ? selected.value : "",
                  }))
                }
                options={supplyTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                placeholder="Select supply type..."
                isClearable={!isSubmitting}
                isDisabled={isSubmitting}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.type_of_supply_or_service
                      ? "#dc3545"
                      : state.isFocused
                      ? "#198754"
                      : "#ced4da",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: errors.type_of_supply_or_service ? "#dc3545" : "#198754",
                    },
                  }),
                }}
              />
              {errors.type_of_supply_or_service && (
                <div className="invalid-feedback d-block">
                  {errors.type_of_supply_or_service}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Row 3: Bill Date & Remark */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Bill Date {!fromWallet && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="date"
                name="actual_bill_date"
                value={formData.actual_bill_date}
                onChange={handleChange}
                isInvalid={!!errors.actual_bill_date}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.actual_bill_date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Remark</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter remark..."
                disabled={isSubmitting}
              />
            </Form.Group>
          </Col>
        </Row>

        {existingPurchase && (
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Update Reason <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  isInvalid={!!errors.remark}
                  placeholder="Enter reason for update..."
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.remark}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        )}

        <hr />
        <h5 className="mb-3">Items</h5>

        {formData.items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 mb-3 border rounded bg-light position-relative"
          >
            {formData.items.length > 1 && (
              <Button
                variant="outline-danger"
                size="sm"
                className="position-absolute end-0 top-0 m-2 py-0 px-2"
                onClick={() => handleRemoveItem(idx)}
                disabled={isSubmitting}
                title="Remove Item"
              >
                &times; Remove
              </Button>
            )}

            <Row className="g-3 align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Item Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="item_name"
                    value={item.item_name}
                    onChange={(e) => handleChange(e, idx, "items")}
                    isInvalid={!!errors[`item_name_${idx}`]}
                    placeholder="Item name..."
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`item_name_${idx}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Amount {!fromWallet && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="subtotal"
                    value={item.subtotal}
                    onChange={(e) => handleChange(e, idx, "items")}
                    isInvalid={!!errors[`subtotal_${idx}`]}
                    placeholder="Amount..."
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`subtotal_${idx}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2} className="pt-4">
                <Form.Check
                  type="checkbox"
                  id={`taxable-check-cp-${idx}`}
                  label="Taxable"
                  name="is_taxable"
                  checked={item.is_taxable}
                  onChange={(e) => handleChange(e, idx, "items")}
                  disabled={isSubmitting}
                />
              </Col>

              {item.is_taxable && (
                <>
                  <Col md={1}>
                    <Form.Group>
                      <Form.Label>
                        Tax Rate % <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="tax_rate"
                        value={item.tax_rate}
                        onChange={(e) => handleChange(e, idx, "items")}
                        isInvalid={!!errors[`tax_rate_${idx}`]}
                        disabled={isSubmitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`tax_rate_${idx}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>
                        Tax Type <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="tax_type"
                        value={item.tax_type}
                        onChange={(e) => handleChange(e, idx, "items")}
                        disabled={isSubmitting}
                      >
                        <option value="inclusive">Inclusive</option>
                        <option value="exclusive">Exclusive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Document Upload</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleFileChange(idx, e.target.files[0])}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}

        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="success"
            onClick={handleAddItem}
            disabled={isSubmitting}
          >
            Add Item
          </Button>
        </div>

        <hr />

        <div className="text-end pe-3 mb-4">
          <h6>
            Sub Total (₹): <strong>{totals.subtotal}</strong>
          </h6>
          <h6>
            Tax (₹): <strong>{totals.taxTotal}</strong>
          </h6>
          <h5>
            Total Amount (₹): <strong>{totals.totalAmount}</strong>
          </h5>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="success"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {existingPurchase ? "Updating..." : "Creating..."}
              </>
            ) : existingPurchase ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CreditPurchaseForm;
