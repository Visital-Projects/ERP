// import React, { useEffect, useState } from "react";
// import { Card, Row, Col, Form, Button } from "react-bootstrap";
// import { toast } from "react-toastify";
// import { getBranches } from "../../../services/branchService";
// import categoryService from "../../../services/expenseCategory";
// import expenseService from "../../../services/expensessService";
// import { useNavigate } from "react-router-dom";

// const ExpenseForm = ({ initialBranchId, existingExpense, onCancel, onSuccess }) => {
//   const navigate = useNavigate();
//   const [branches, setBranches] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loadingBranches, setLoadingBranches] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(false);

//   // Main form data
//   const [formData, setFormData] = useState({
//     branch_id: initialBranchId || "",
//     category_id: "",
//     description: "",
//   });

//   // Dynamic items array with document
//   const [items, setItems] = useState([
//     { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null },
//   ]);

//   useEffect(() => {
//     fetchBranches();
//     fetchCategories();

//     if (existingExpense) {
//       setFormData({
//         branch_id: existingExpense.branch_id,
//         category_id: existingExpense.category_id,
//         description: existingExpense.description || "",
//       });

//       const prefillItems = existingExpense.items.map((item) => ({
//         item_name: item.item_name,
//         subtotal: parseFloat(item.subtotal),
//         is_taxable: item.is_taxable,
//         tax_rate: parseFloat(item.tax_rate),
//         tax_type: item.tax_type,
//         document: null, // leave empty, user can upload new
//       }));
//       setItems(prefillItems);
//     }
//   }, [existingExpense]);

//   const fetchBranches = async () => {
//     setLoadingBranches(true);
//     try {
//       const branchesData = await getBranches();
//       setBranches(branchesData);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       setBranches([]);
//     } finally {
//       setLoadingBranches(false);
//     }
//   };

//   const fetchCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const data = await categoryService.getAllCategories();
//       setCategories(data);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       toast.error("Failed to load categories");
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = value;
//     setItems(updatedItems);
//   };

//   const handleItemFileChange = (index, file) => {
//     const updatedItems = [...items];
//     updatedItems[index].document = file;
//     setItems(updatedItems);
//   };

//   const addItem = () => {
//     setItems([...items, { item_name: "", subtotal: 0, is_taxable: false, tax_rate: 0, tax_type: "", document: null }]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const submitData = new FormData();
//       submitData.append("branch_id", formData.branch_id);
//       submitData.append("category_id", formData.category_id);
//       submitData.append("description", formData.description);

//       // Append dynamic items with document
//       items.forEach((item, i) => {
//         submitData.append(`items[${i}][item_name]`, item.item_name);
//         submitData.append(`items[${i}][subtotal]`, item.subtotal);
//         submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
//         submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
//         submitData.append(`items[${i}][tax_type]`, item.tax_type);
//         if (item.document) submitData.append(`item_document_${i}`, item.document);
//       });

//       const response = await expenseService.createExpense(submitData);

//       if (response?.success === false) {
//         toast.error(response.message || "Failed to create expense.");
//         return;
//       }

//       toast.success("Expense saved successfully!");
//       onSuccess?.();
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to save expense");
//     }
//   };
// const subtotal = items.reduce((sum, item) => {
//   const itemSubtotal = parseFloat(item.subtotal) || 0;
//   if (item.is_taxable && item.tax_type === "inclusive" && item.tax_rate) {
//     // For inclusive tax, remove tax from subtotal
//     return sum + (itemSubtotal / (1 + item.tax_rate / 100));
//   }
//   return sum + itemSubtotal;
// }, 0);

// const totalTax = items.reduce((sum, item) => {
//   const itemSubtotal = parseFloat(item.subtotal) || 0;
//   if (item.is_taxable && item.tax_rate) {
//     if (item.tax_type === "inclusive") {
//       // Tax part of inclusive subtotal
//       return sum + (itemSubtotal - itemSubtotal / (1 + item.tax_rate / 100));
//     } else {
//       // Exclusive tax
//       return sum + (itemSubtotal * item.tax_rate) / 100;
//     }
//   }
//   return sum;
// }, 0);

// const totalAmount = subtotal + totalTax;
//   return (
//     <Card className="p-4">
//       <Form onSubmit={handleSubmit}>
//         <Row className="mb-3">
//           <Col md={4}>
//             <Form.Label><strong>Site</strong></Form.Label>
//             <Form.Select
//               value={formData.branch_id}
//               onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
//               required
//               disabled={!!initialBranchId}
//             >
//               <option value="">{loadingBranches ? "Loading sites..." : "Select Site"}</option>
//               {branches.map((branch) => (
//                 <option key={branch.id} value={branch.id}>{branch.name}</option>
//               ))}
//             </Form.Select>
//           </Col>

//           <Col md={4}>
//             <Form.Label><strong>Category</strong></Form.Label>
//             <Form.Select
//               value={formData.category_id}
//               onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//               required
//             >
//               <option value="">{loadingCategories ? "Loading categories..." : "Select Category"}</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>{cat.name}</option>
//               ))}
//             </Form.Select>
//           </Col>

//           <Col md={4}>
//             <Form.Label><strong>Description</strong></Form.Label>
//             <Form.Control
//               type="text"
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               required
//             />
//           </Col>
//         </Row>

//         <div className="mb-3 text-end">
//           <Button variant="info" onClick={addItem}>Add Item</Button>
//         </div>

// {items.map((item, index) => (
//   <div
//     key={index}
//     style={{
//       position: "relative",
//       border: "1px solid #ddd",
//       borderRadius: "8px",
//       padding: "10px 15px",
//       marginBottom: "10px",
//       background: "#fafafa",
//       display: "flex",
//       alignItems: "center",
//       flexWrap: "wrap",
//       gap: "10px",
//     }}
//   >
//    <Button 
//                 variant="danger" 
//                 size="sm" 
//                 style={{ position: "absolute", top: "5px", right: "5px", padding: "0 6px", lineHeight: 1 }}
//                 onClick={() => setItems(items.filter((_, i) => i !== index))}
//               >
//                 &times;
//               </Button>

//     {/* Item Name */}
//     <Form.Control
//       type="text" className="mt-3"
//       placeholder="Item Name"
//       value={item.item_name}
//       onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
//       style={{ flex: "1 1 180px" }}
//       required
//     />

//     {/* Subtotal */}
//     <Form.Control
//       type="number"
//       placeholder="Subtotal"
//       value={item.subtotal}
//       onChange={(e) =>
//         handleItemChange(index, "subtotal", parseFloat(e.target.value))
//       }
//       style={{ flex: "1 1 100px" }}
//       required
//     />

//     {/* Taxable Checkbox */}
//     <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//       <Form.Check
//         type="checkbox"
//         label="Taxable"
//         checked={item.is_taxable}
//         onChange={(e) =>
//           handleItemChange(index, "is_taxable", e.target.checked)
//         }
//       />
//     </div>

//     {/* Tax Fields (if taxable) */}
//     {item.is_taxable && (
//       <>
//         <Form.Control
//           type="number"
//           placeholder="Tax Rate (%)"
//           value={item.tax_rate}
//           onChange={(e) =>
//             handleItemChange(index, "tax_rate", parseFloat(e.target.value))
//           }
//           style={{ flex: "1 1 120px" }}
//           required
//         />

//         <Form.Select
//           value={item.tax_type}
//           onChange={(e) =>
//             handleItemChange(index, "tax_type", e.target.value)
//           }
//           style={{ flex: "1 1 150px" }}
//           required
//         >
//           <option value="">Tax Type</option>
//           <option value="inclusive">Inclusive</option>
//           <option value="exclusive">Exclusive</option>
//         </Form.Select>
//       </>
//     )}

//     {/* File Input */}
//     <Form.Control className="mt-3"
//       type="file"
//       onChange={(e) => handleItemFileChange(index, e.target.files[0])}
//       style={{ flex: "1 1 200px" }}
//     />
//   </div>
// ))}


//         <div className="text-end mb-3">
//   <Row className="justify-content-end">
//     <Col md={4}>
//       <div className="d-flex justify-content-between">
//         <strong>Sub Total (₹)</strong>
//         <span>{subtotal.toFixed(2)}</span>
//       </div>
//       <div className="d-flex justify-content-between">
//         <strong>Tax (₹)</strong>
//         <span>{totalTax.toFixed(2)}</span>
//       </div>
//       <div className="d-flex justify-content-between">
//         <strong>Total Amount (₹)</strong>
//         <span>{totalAmount.toFixed(2)}</span>
//       </div>
//     </Col>
//   </Row>
// </div>

//         <div className="text-end mt-4">
//           <Button variant="secondary" className="me-2" onClick={onCancel}>Cancel</Button>
//           <Button variant="success" type="submit">Create Expense</Button>
//         </div>
//       </Form>
//     </Card>
//   );
// };

// export default ExpenseForm;






import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { getBranches } from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import expenseService from "../../../services/expensessService";
import { useNavigate } from "react-router-dom";

const ExpenseForm = ({
  initialBranchId,
  initialAmount,
  initialDescription,
  initialTransactionDate,
  existingExpense,
  supplyTypes = ["Service", "Supply"],
  onCancel,
  onSuccess,
}) => {
  const navigate = useNavigate();

  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Main form data
  const [formData, setFormData] = useState({
    branch_id: initialBranchId || "",
    category_id: "",
    vendor_name: "",
    type_of_supply_or_service: "",
    actual_bill_date: getTodayDateString(),
    remark: initialDescription || "",
  });

  // Dynamic items array with document (Taxable completely absent in Non-GST)
  const [items, setItems] = useState([
    {
      item_name: "",
      subtotal: initialAmount || "",
      is_taxable: false,
      tax_rate: 0,
      tax_type: "",
      document: null,
    },
  ]);

  useEffect(() => {
    fetchBranches();
    fetchCategories();

    if (existingExpense) {
      setFormData({
        branch_id: existingExpense.branch_id || "",
        category_id: existingExpense.category_id || "",
        vendor_name: existingExpense.vendor_name || existingExpense.description || "",
        type_of_supply_or_service:
          existingExpense.type_of_supply_or_service || "",
        actual_bill_date: toDateInputValue(
          existingExpense.actual_bill_date ||
            existingExpense.payment_date ||
            existingExpense.created_at ||
            existingExpense.createdAt
        ) || getTodayDateString(),
        remark: existingExpense.remark || "",
      });

      const prefillItems = (existingExpense.items || []).map((item) => ({
        item_name: item.item_name || "",
        subtotal: parseFloat(item.subtotal) || "",
        is_taxable: false,
        tax_rate: 0,
        tax_type: "",
        document: null,
      }));
      if (prefillItems.length > 0) {
        setItems(prefillItems);
      }
    }
  }, [existingExpense]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const branchesData = await getBranches();
      setBranches(branchesData || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleItemFileChange = (index, file) => {
    const updatedItems = [...items];
    updatedItems[index].document = file;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_name: "",
        subtotal: "",
        is_taxable: false,
        tax_rate: 0,
        tax_type: "",
        document: null,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.warning("At least one item is required");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const newErrors = {};
    if (!formData.branch_id) newErrors.branch_id = "Site is required";
    if (!formData.category_id) newErrors.category_id = "Payment Head is required";
    if (!formData.vendor_name?.trim()) newErrors.vendor_name = "Vendor name is required";
    if (!formData.type_of_supply_or_service)
      newErrors.type_of_supply_or_service = "Type of supply or service is required";
    if (!formData.actual_bill_date) newErrors.actual_bill_date = "Bill date is required";

    items.forEach((item, i) => {
      if (!item.item_name?.trim()) {
        newErrors[`item_name_${i}`] = `Item name is required for item #${i + 1}`;
      }
      if (item.subtotal === "" || isNaN(Number(item.subtotal)) || Number(item.subtotal) <= 0) {
        newErrors[`subtotal_${i}`] = `Valid amount is required for item #${i + 1}`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.warning("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("branch_id", formData.branch_id);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.vendor_name ? formData.vendor_name.trim() : "");
      submitData.append("vendor_name", formData.vendor_name ? formData.vendor_name.trim() : "");
      submitData.append("remark", formData.remark || "");
      submitData.append("type_of_supply_or_service", formData.type_of_supply_or_service);
      submitData.append("actual_bill_date", formData.actual_bill_date);

      // Append dynamic items with document (Non-taxable)
      items.forEach((item, i) => {
        submitData.append(`items[${i}][item_name]`, item.item_name.trim());
        submitData.append(`items[${i}][subtotal]`, parseFloat(item.subtotal) || 0);
        submitData.append(`items[${i}][is_taxable]`, false);
        submitData.append(`items[${i}][tax_rate]`, 0);
        submitData.append(`items[${i}][tax_type]`, "");
        if (item.document) {
          submitData.append(`item_document_${i}`, item.document);
        }
      });

      let response;
      if (existingExpense) {
        response = await expenseService.updateExpense(existingExpense.id, submitData);
      } else {
        response = await expenseService.createExpense(submitData);
      }

      if (response?.success === false) {
        toast.error(response.message || "Failed to save expense.");
        return;
      }

      toast.success(existingExpense ? "Expense updated successfully!" : "Expense saved successfully!");
      const createdBranchId =
        response?.data?.expense?.branch_id ||
        response?.data?.branch_id ||
        response?.branch_id ||
        formData.branch_id;
      onSuccess?.(createdBranchId);
    } catch (error) {
      console.error("Failed to save expense:", error);
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const itemSubtotal = parseFloat(item.subtotal) || 0;
    return sum + itemSubtotal;
  }, 0);

  const totalAmount = subtotal;

  return (
    <Card className="p-4 shadow-sm">
      <Form onSubmit={handleSubmit}>
        {/* Row 1: Site & Description (Creatable Category) */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Site <span className="text-danger">*</span>
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
                isClearable={Boolean(existingExpense) && !isSubmitting}
                isDisabled={isSubmitting || (!existingExpense && !!formData.branch_id)}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.branch_id
                      ? "#dc3545"
                      : state.isFocused
                      ? "#198754"
                      : "#ced4da",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: errors.branch_id ? "#dc3545" : "#198754",
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
                          categories.find(
                            (c) => String(c.id) === String(formData.category_id)
                          )?.name || formData.category_id,
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
                    if (newCat?.id) {
                      setCategories((prev) => [...prev, newCat]);
                      setFormData((prev) => ({
                        ...prev,
                        category_id: newCat.id,
                      }));
                      toast.success("Category added successfully");
                    }
                  } catch (err) {
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
                placeholder={loadingCategories ? "Loading categories..." : "Type or select category..."}
                isClearable
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

        {/* Row 2: Vendor Name (mandatory) & Type of Supply / Service */}
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
                onChange={(e) =>
                  setFormData({ ...formData, vendor_name: e.target.value })
                }
                isInvalid={!!errors.vendor_name}
                disabled={isSubmitting}
                placeholder="Enter vendor name..."
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
              <div
                className={`react-select-wrapper ${
                  errors.type_of_supply_or_service ? "is-invalid" : ""
                }`}
              >
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
                  isClearable
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
                        borderColor: errors.type_of_supply_or_service
                          ? "#dc3545"
                          : "#198754",
                      },
                    }),
                  }}
                />
              </div>
              {errors.type_of_supply_or_service && (
                <div className="invalid-feedback d-block">
                  {errors.type_of_supply_or_service}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Row 3: Bill Date */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Bill Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="actual_bill_date"
                value={formData.actual_bill_date}
                onChange={(e) =>
                  setFormData({ ...formData, actual_bill_date: e.target.value })
                }
                isInvalid={!!errors.actual_bill_date}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.actual_bill_date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Row 4: Remark (optional) */}
        <Form.Group className="mb-3">
          <Form.Label>Remark</Form.Label>
          <Form.Control
            type="text"
            name="remark"
            value={formData.remark}
            onChange={(e) =>
              setFormData({ ...formData, remark: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="Enter remark..."
          />
        </Form.Group>

        <hr />
        <h5>Items</h5>

        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              borderTop: "1px solid #ddd",
              padding: "15px 0",
              marginBottom: "0px",
            }}
          >
            {items.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "0px",
                  padding: "0 6px",
                  lineHeight: 1,
                }}
                onClick={() => handleRemoveItem(idx)}
                disabled={isSubmitting}
              >
                &times;
              </Button>
            )}

            <Row className="align-items-center">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Item Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.item_name}
                    onChange={(e) =>
                      handleItemChange(idx, "item_name", e.target.value)
                    }
                    isInvalid={!!errors[`item_name_${idx}`]}
                    placeholder="Item Name"
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`item_name_${idx}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Amount <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={item.subtotal}
                    onChange={(e) =>
                      handleItemChange(idx, "subtotal", e.target.value)
                    }
                    isInvalid={!!errors[`subtotal_${idx}`]}
                    placeholder="Amount"
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`subtotal_${idx}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Document Upload always in next row */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Document Upload</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleItemFileChange(idx, e.target.files[0])}
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
            Sub Total (₹): <strong>{subtotal.toFixed(2)}</strong>
          </h6>
          <h5>
            Total Amount (₹): <strong>{totalAmount.toFixed(2)}</strong>
          </h5>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
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
                {existingExpense ? "Updating..." : "Creating..."}
              </>
            ) : (
              existingExpense ? "Update Expense" : "Create"
            )}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default ExpenseForm;
