// // src/components/Accounting/CreditPurchaseModal.jsx
// import React, { useState, useEffect } from "react";
// import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import creditPurchaseService from "../../../services/expensessService";

// const CreditPurchaseModal = ({
//   show,
//   handleClose,
//   branches = [],
//   categories = [],
//   supplyTypes = ["Service", "Supply"],
//   editingPurchase = null,
//   onSuccess,
// }) => {
//   const [formData, setFormData] = useState({
//     branch_id: "",
//     category_id: "",
//     description: "",
//     vendor_name: "",
//     type_of_supply_or_service: "",
//     items: [
//       {
//         item_name: "",
//         subtotal: "",
//         is_taxable: false,
//         tax_rate: 0,
//         tax_type: "exclusive",
//         document: null,
//       },
//     ],
//     status: "pending",
//   });

//   const [isClosingModal, setIsClosingModal] = useState(false);
//   const [loading, setLoading] = useState(false); // ✅ new state for spinner
//   const [errors, setErrors] = useState({}); // ✅ new state for validation errors

//   // useEffect(() => {
//   //   if (editingPurchase) {
//   //     setFormData({
//   //       branch_id: editingPurchase.branch_id,
//   //       category_id: editingPurchase.category_id,
//   //       description: editingPurchase.description,
//   //       vendor_name: editingPurchase.vendor_name,
//   //       type_of_supply_or_service: editingPurchase.type_of_supply_or_service,
//   //       items: editingPurchase.items.map((item) => ({
//   //         item_name: item.item_name,
//   //         subtotal: item.subtotal,
//   //         is_taxable: item.is_taxable,
//   //         tax_rate: item.tax_rate,
//   //         tax_type: item.tax_type || "exclusive",
//   //         document: null, // user can upload new file
//   //       })),
//   //       status: editingPurchase.status || "pending",
//   //     });
//   //   } else {
//   //     setFormData({
//   //       branch_id: "",
//   //       category_id: "",
//   //       description: "",
//   //       vendor_name: "",
//   //       type_of_supply_or_service: "",
//   //       items: [
//   //         {
//   //           item_name: "",
//   //           subtotal: "",
//   //           is_taxable: false,
//   //           tax_rate: 0,
//   //           tax_type: "exclusive",
//   //           document: null,
//   //         },
//   //       ],
//   //       status: "pending",
//   //     });
//   //   }
//   // }, [editingPurchase]);



//   // 🧠 1️⃣ Run when editingPurchase changes
// useEffect(() => {
//   if (editingPurchase) {
//     setFormData({
//       branch_id: editingPurchase.branch_id,
//       category_id: editingPurchase.category_id,
//       description: editingPurchase.description,
//       vendor_name: editingPurchase.vendor_name,
//       type_of_supply_or_service: editingPurchase.type_of_supply_or_service,
//       items: editingPurchase.items.map((item) => ({
//         item_name: item.item_name,
//         subtotal: item.subtotal,
//         is_taxable: item.is_taxable,
//         tax_rate: item.tax_rate,
//         tax_type: item.tax_type || "exclusive",
//         document: null,
//       })),
//       status: editingPurchase.status || "pending",
//     });
//   } else {
//     setFormData({
//       branch_id: "",
//       category_id: "",
//       description: "",
//       vendor_name: "",
//       type_of_supply_or_service: "",
//       items: [
//         {
//           item_name: "",
//           subtotal: "",
//           is_taxable: false,
//           tax_rate: 0,
//           tax_type: "exclusive",
//           document: null,
//         },
//       ],
//       status: "pending",
//     });
//   }
// }, [editingPurchase]);

// // 🧠 2️⃣ Run when modal closes (to clear form if not editing)
// useEffect(() => {
//   if (!show && !editingPurchase) {
//     setFormData({
//       branch_id: "",
//       category_id: "",
//       description: "",
//       vendor_name: "",
//       type_of_supply_or_service: "",
//       items: [
//         {
//           item_name: "",
//           subtotal: "",
//           is_taxable: false,
//           tax_rate: 0,
//           tax_type: "exclusive",
//           document: null,
//         },
//       ],
//       status: "pending",
//     });
//   }
// }, [show, editingPurchase]);



//   useEffect(() => {
//     if (!show) {
//       setErrors({});
//     }
//   }, [show]);

//   //modified
//   const handleAnimatedClose = () => {
//     setErrors({});
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setIsClosingModal(false);
//       handleClose();
//     }, 700);
//   };

//   const handleChange = (e, index, field) => {
//     if (field === "items") {
//       const updatedItems = [...formData.items];
//       updatedItems[index][e.target.name] =
//         e.target.type === "checkbox" ? e.target.checked : e.target.value;
//       setFormData({ ...formData, items: updatedItems });
//     } else {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };

//   const handleFileChange = (index, file) => {
//     const updatedItems = [...formData.items];
//     updatedItems[index].document = file;
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const handleAddItem = () => {
//     setFormData({
//       ...formData,
//       items: [
//         ...formData.items,
//         {
//           item_name: "",
//           subtotal: "",
//           is_taxable: false,
//           tax_rate: 0,
//           tax_type: "exclusive",
//           document: null,
//         },
//       ],
//     });
//   };

//   const handleRemoveItem = (index) => {
//     const updatedItems = formData.items.filter((_, i) => i !== index);
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       // ✅ Basic form validation
//       const newErrors = {};
//       if (!formData.branch_id) newErrors.branch_id = "Site is required";
//       if (!formData.category_id) newErrors.category_id = "Category is required";
//       if (!formData.vendor_name.trim())
//         newErrors.vendor_name = "Vendor name is required";
//       if (!formData.type_of_supply_or_service)
//         newErrors.type_of_supply_or_service =
//           "Type of supply or service is required";
//       if (!formData.description.trim())
//         newErrors.description = "Description is required";

//       formData.items.forEach((item, i) => {
//         if (!item.item_name.trim())
//           newErrors[`item_name_${i}`] = "Item name is required";
//         if (!item.subtotal) newErrors[`subtotal_${i}`] = "Subtotal is required";
//         if (item.is_taxable && !item.tax_rate)
//           newErrors[`tax_rate_${i}`] = "Tax rate is required";
//       });

//       if (Object.keys(newErrors).length > 0) {
//         setErrors(newErrors);
//         setLoading(false);
//         return;
//       } else {
//         setErrors({});
//       }

//       const submitData = new FormData();
//       submitData.append("branch_id", formData.branch_id);
//       submitData.append("category_id", formData.category_id);
//       submitData.append("description", formData.description);
//       submitData.append("vendor_name", formData.vendor_name);
//       submitData.append(
//         "type_of_supply_or_service",
//         formData.type_of_supply_or_service
//       );
//       submitData.append("status", formData.status);

//       formData.items.forEach((item, i) => {
//         submitData.append(`items[${i}][item_name]`, item.item_name);
//         submitData.append(`items[${i}][subtotal]`, item.subtotal);
//         submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
//         submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
//         submitData.append(`items[${i}][tax_type]`, item.tax_type);
//         if (item.document)
//           submitData.append(`item_document_${i}`, item.document);
//       });

//       if (editingPurchase) {
//         await creditPurchaseService.updateCreditPurchase(
//           editingPurchase.id,
//           submitData
//         );
//         toast.success("Credit purchase updated successfully");
//       } else {
//         await creditPurchaseService.createCreditPurchase(submitData);
//         toast.success("Credit purchase created successfully");
//       }
//       setIsClosingModal(true);
//       setTimeout(() => {
//         handleClose();
//         setIsClosingModal(false);
//         onSuccess?.();
//       }, 700);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Operation failed");
//     } finally {
//       setLoading(false); // ✅ stop spinner
//     }
//   };

//   return (
//     <div>
//       <style>{`
//   @keyframes slideInUp {
//     from { transform: translateY(100%); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
//   @keyframes slideOutUp {
//     from { transform: translateY(0); opacity: 1; }
//     to { transform: translateY(-100%); opacity: 0; }
//   }
//   .custom-slide-modal.open .modal-dialog {
//     animation: slideInUp 0.7s ease forwards;
//   }
//   .custom-slide-modal.closing .modal-dialog {
//     animation: slideOutUp 0.7s ease forwards;
//   }
// `}</style>

//       <Modal
//         show={show}
//         onHide={() => {
//           setIsClosingModal(true);
//           setTimeout(() => {
//             handleClose();
//             setIsClosingModal(false);
//           }, 700);
//         }}
//         size="lg"
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingPurchase
//               ? "Update Credit Purchase"
//               : "Create Credit Purchase"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row className="mb-3">
//               <Col>
//                 <Form.Group>
//                   <Form.Label>
//                     Site <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Select
//                     name="branch_id"
//                     value={formData.branch_id}
//                     onChange={handleChange}
//                     isInvalid={!!errors.branch_id}
//                   >
//                     <option value="">Select Site</option>
//                     {branches.map((b) => (
//                       <option key={b.id} value={b.id}>
//                         {b.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {errors.branch_id}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group>
//                   <Form.Label>
//                     Category <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Select
//                     name="category_id"
//                     value={formData.category_id}
//                     onChange={handleChange}
//                     isInvalid={!!errors.category_id}
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {errors.category_id}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="">
//               <Col>
//                 <Form.Group>
//                   <Form.Label>
//                     Vendor Name <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="vendor_name"
//                     value={formData.vendor_name}
//                     onChange={handleChange}
//                     isInvalid={!!errors.vendor_name}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.vendor_name}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group>
                  

//                   {/* <Select
//                     value={
//                       formData.type_of_supply_or_service
//                         ? {
//                             value: formData.type_of_supply_or_service,
//                             label: formData.type_of_supply_or_service,
//                           }
//                         : null
//                     }
//                     onChange={(selected) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         type_of_supply_or_service: selected
//                           ? selected.value
//                           : "",
//                       }))
//                     }
//                     options={supplyTypes.map((type) => ({
//                       value: type,
//                       label: type,
//                     }))}
//                     placeholder="Select supply type..."
//                     isClearable
                   

//                   /> */}

//                   <Form.Group>
//                     <Form.Label>
//                       Type of Supply / Service{" "}
//                       <span className="text-danger">*</span>
//                     </Form.Label>
//                     <div
//                       className={`react-select-wrapper ${
//                         errors.type_of_supply_or_service ? "is-invalid" : ""
//                       }`}
//                     >
//                       <Select
//                         value={
//                           formData.type_of_supply_or_service
//                             ? {
//                                 value: formData.type_of_supply_or_service,
//                                 label: formData.type_of_supply_or_service,
//                               }
//                             : null
//                         }
//                         onChange={(selected) =>
//                           setFormData((prev) => ({
//                             ...prev,
//                             type_of_supply_or_service: selected
//                               ? selected.value
//                               : "",
//                           }))
//                         }
//                         options={supplyTypes.map((type) => ({
//                           value: type,
//                           label: type,
//                         }))}
//                         placeholder="Select supply type..."
//                         isClearable
//                         styles={{
//                           control: (base, state) => ({
//                             ...base,
//                             borderColor: errors.type_of_supply_or_service
//                               ? "#dc3545" // red for invalid
//                               : state.isFocused
//                               ? "#198754" // green for focus
//                               : "#ced4da", // default gray
//                             boxShadow: "none",
//                             "&:hover": {
//                               borderColor: errors.type_of_supply_or_service
//                                 ? "#dc3545"
//                                 : "#198754",
//                             },
//                           }),
//                         }}
//                       />
//                     </div>
//                     {errors.type_of_supply_or_service && (
//                       <div className="invalid-feedback d-block">
//                         {errors.type_of_supply_or_service}
//                       </div>
//                     )}
//                   </Form.Group>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Description <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 isInvalid={!!errors.description}
//               />

//               <Form.Control.Feedback type="invalid">
//                 {errors.description} {/* ✅ show red error text */}
//               </Form.Control.Feedback>
//             </Form.Group>

//             {/* ✅ Status field removed */}

//             <hr />
//             <h5>Items</h5>

//             {formData.items.map((item, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   position: "relative",
//                   borderTop: "1px solid #ddd",
//                   padding: "15px",
//                   borderRadius: "5px",
//                   marginBottom: "0px",
//                 }}
//               >
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   style={{
//                     position: "absolute",
//                     top: "0px",
//                     right: "-5px",
//                     padding: "0 6px",
//                     lineHeight: 1,
//                   }}
//                   onClick={() => handleRemoveItem(idx)}
//                 >
//                   &times;
//                 </Button>

//                 <Row className="align-items-center">
//                   <Col>
//                     <Form.Label>
//                       Item Name <span className="text-danger">*</span>
//                     </Form.Label>
//                     <Form.Control
//                       name="item_name"
//                       value={item.item_name}
//                       onChange={(e) => handleChange(e, idx, "items")}
//                       isInvalid={!!errors[`item_name_${idx}`]}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors[`item_name_${idx}`]}
//                     </Form.Control.Feedback>
//                   </Col>

//                   <Col>
//                     <Form.Label>
//                       Subtotal <span className="text-danger">*</span>
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="subtotal"
//                       value={item.subtotal}
//                       onChange={(e) => handleChange(e, idx, "items")}
//                       isInvalid={!!errors[`subtotal_${idx}`]}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors[`subtotal_${idx}`]}
//                     </Form.Control.Feedback>
//                   </Col>

//                   <Col className="mt-4">
//                     <Form.Check
//                       type="checkbox"
//                       label="Taxable"
//                       name="is_taxable"
//                       checked={item.is_taxable}
//                       onChange={(e) => handleChange(e, idx, "items")}
//                     />
//                   </Col>

//                   {item.is_taxable && (
//                     <>
//                       <Col>
//                         <Form.Label>
//                           Tax Rate <span className="text-danger">*</span>
//                         </Form.Label>
//                         <Form.Control
//                           type="number"
//                           name="tax_rate"
//                           value={item.tax_rate}
//                           onChange={(e) => handleChange(e, idx, "items")}
//                           isInvalid={!!errors[`tax_rate_${idx}`]}
//                         />
//                         <Form.Control.Feedback type="invalid">
//                           {errors[`tax_rate_${idx}`]}
//                         </Form.Control.Feedback>
//                       </Col>

//                       <Col>
//                         <Form.Label>
//                           Tax Type <span className="text-danger">*</span>
//                         </Form.Label>
//                         <Form.Select
//                           name="tax_type"
//                           value={item.tax_type}
//                           onChange={(e) => handleChange(e, idx, "items")}
//                         >
//                           <option value="exclusive">Exclusive</option>
//                           <option value="inclusive">Inclusive</option>
//                         </Form.Select>
//                       </Col>
//                     </>
//                   )}
//                 </Row>

//                 {/* ✅ File Upload always in next line */}
//                 <Row className="mt-3">
//                   <Col md={6}>
//                     <Form.Label>Document Upload</Form.Label>
//                     <Form.Control
//                       type="file"
//                       onChange={(e) => handleFileChange(idx, e.target.files[0])}
//                     />
//                   </Col>
//                 </Row>
//               </div>
//             ))}

//             <Button
//               variant="success"
//               className="position-relative"
//               style={{ left: "85%" }}
//               onClick={handleAddItem}
//             >
//               Add Item
//             </Button>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={handleAnimatedClose}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           {/* <Button onClick={handleSubmit} variant="success">
//           {editingPurchase ? "Update" : "Create"}
//         </Button> */}

//           <Button
//             onClick={handleSubmit}
//             variant="success"
//             disabled={loading} // ✅ disable during submit
//           >
//             {loading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-2"
//                 />
//                 {editingPurchase ? "Updating..." : "Creating..."}
//               </>
//             ) : editingPurchase ? (
//               "Update"
//             ) : (
//               "Create"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default CreditPurchaseModal;



// src/components/Accounting/CreditPurchaseModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { toast } from "react-toastify";
import creditPurchaseService from "../../../services/expensessService";

const CreditPurchaseModal = ({
  show,
  handleClose,
  branches = [],
  categories = [],
  supplyTypes = ["Service", "Supply"],
  editingPurchase = null,
  prefillData = null,
  fromWallet = false,
  onSuccess,
}) => {
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

  const [formData, setFormData] = useState({
    branch_id: "",
    category_id: "",
    description: "",
    vendor_name: "",
    type_of_supply_or_service: "",
    actual_bill_date: getTodayDateString(), 
    remark: "",
    items: [
      {
        item_name: "",
        subtotal: "",
        is_taxable: false,
        tax_rate: 0,
        tax_type: "inclusive",
        document: null,
      },
    ],
    status: "pending",
  });

  const [isClosingModal, setIsClosingModal] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ new state for spinner
  const [errors, setErrors] = useState({}); // ✅ new state for validation errors

  // useEffect(() => {
  //   if (editingPurchase) {
  //     setFormData({
  //       branch_id: editingPurchase.branch_id,
  //       category_id: editingPurchase.category_id,
  //       description: editingPurchase.description,
  //       vendor_name: editingPurchase.vendor_name,
  //       type_of_supply_or_service: editingPurchase.type_of_supply_or_service,
  //       items: editingPurchase.items.map((item) => ({
  //         item_name: item.item_name,
  //         subtotal: item.subtotal,
  //         is_taxable: item.is_taxable,
  //         tax_rate: item.tax_rate,
  //         tax_type: item.tax_type || "exclusive",
  //         document: null, // user can upload new file
  //       })),
  //       status: editingPurchase.status || "pending",
  //     });
  //   } else {
  //     setFormData({
  //       branch_id: "",
  //       category_id: "",
  //       description: "",
  //       vendor_name: "",
  //       type_of_supply_or_service: "",
  //       items: [
  //         {
  //           item_name: "",
  //           subtotal: "",
  //           is_taxable: false,
  //           tax_rate: 0,
  //           tax_type: "exclusive",
  //           document: null,
  //         },
  //       ],
  //       status: "pending",
  //     });
  //   }
  // }, [editingPurchase]);



  // 🧠 1️⃣ Run when editingPurchase changes
useEffect(() => {
  if (editingPurchase) {
    setFormData({
      branch_id: editingPurchase.branch_id,
      category_id: editingPurchase.category_id,
      description: editingPurchase.description,
      vendor_name: editingPurchase.vendor_name,
      type_of_supply_or_service: editingPurchase.type_of_supply_or_service,
      actual_bill_date: toDateInputValue(
        editingPurchase.actual_bill_date ||
        editingPurchase.purchase_date ||
        editingPurchase.payment_date ||
        editingPurchase.created_at ||
        editingPurchase.createdAt
      ),
      remark: editingPurchase.remark || "",
      items: editingPurchase.items.map((item) => {
        const sub = parseFloat(item.subtotal || 0);
        const rate = parseFloat(item.tax_rate || 0);
        
        // If it was inclusive, backend stores the base.
        // We need to show the total (base + tax) in the 'Amount' field.
        const displayAmount = (item.tax_type === "inclusive" && rate > 0)
          ? (sub * (1 + rate / 100)).toFixed(2)
          : sub;

        return {
          item_name: item.item_name,
          subtotal: displayAmount,
          is_taxable: item.is_taxable,
          tax_rate: item.tax_rate,
          tax_type: item.tax_type || "exclusive",
          document: null,
        };
      }),
      status: editingPurchase.status || "pending",
    });
  } else {
    if (prefillData) {
      setFormData({
        branch_id: prefillData.branchId || "",
        category_id: "",
        description: prefillData.description || "",
        vendor_name: "",
        type_of_supply_or_service: "",
        actual_bill_date: getTodayDateString(),
        remark: "",
        items: [
          {
            item_name: "",
            subtotal: prefillData.amount || "",
            is_taxable: false,
            tax_rate: 0,
            tax_type: "inclusive",
            document: null,
          },
        ],
        status: "pending",
      });
    } else {
      setFormData({
        branch_id: "",
        category_id: "",
        description: "",
        vendor_name: "",
        type_of_supply_or_service: "",
        actual_bill_date: getTodayDateString(),
        remark: "",
        items: [
          {
            item_name: "",
            subtotal: "",
            is_taxable: false,
            tax_rate: 0,
            tax_type: "inclusive",
            document: null,
          },
        ],
        status: "pending",
      });
    }
  }
}, [editingPurchase, prefillData]);

// 🧠 2️⃣ Run when modal closes (to clear form if not editing)
useEffect(() => {
  if (!show && !editingPurchase) {
    setFormData({
      branch_id: "",
      category_id: "",
      description: "",
      vendor_name: "",
      type_of_supply_or_service: "",
      actual_bill_date: getTodayDateString(),
      remark: "",
      items: [
        {
          item_name: "",
          subtotal: "",
          is_taxable: false,
          tax_rate: 0,
          tax_type: "inclusive",
          document: null,
        },
      ],
      status: "pending",
    });
  }
}, [show, editingPurchase]);



  useEffect(() => {
    if (!show) {
      setErrors({});
    }
  }, [show]);

  //modified
  const handleAnimatedClose = () => {
    setErrors({});
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      handleClose();
    }, 700);
  };

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
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // ✅ Basic form validation
      const newErrors = {};
      if (!fromWallet && !formData.branch_id) newErrors.branch_id = "Site is required";
      if (!formData.category_id) newErrors.category_id = "Category is required";
      if (!formData.vendor_name.trim())
        newErrors.vendor_name = "Vendor name is required";
      if (!formData.type_of_supply_or_service)
        newErrors.type_of_supply_or_service =
          "Type of supply or service is required";
      if (!fromWallet && !formData.actual_bill_date)
        newErrors.actual_bill_date = "Bill date is required";
      if (editingPurchase && !formData.remark.trim()) {
        newErrors.remark = "Remark is mandatory while updating";
      }
      formData.items.forEach((item, i) => {
        if (!item.item_name.trim())
          newErrors[`item_name_${i}`] = "Item name is required";
        if (!fromWallet && !item.subtotal) newErrors[`subtotal_${i}`] = "Subtotal is required";
        if (item.is_taxable && !item.tax_rate)
          newErrors[`tax_rate_${i}`] = "Tax rate is required";
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      } else {
        setErrors({});
      }

      const submitData = new FormData();
      submitData.append("branch_id", formData.branch_id);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.description);
      submitData.append("actual_bill_date", formData.actual_bill_date);
      submitData.append("remark", formData.remark);
      submitData.append("vendor_name", formData.vendor_name);
      submitData.append(
        "type_of_supply_or_service",
        formData.type_of_supply_or_service
      );
      submitData.append("status", formData.status);

      formData.items.forEach((item, i) => {
        submitData.append(`items[${i}][item_name]`, item.item_name);
        submitData.append(`items[${i}][subtotal]`, item.subtotal);
        submitData.append(`items[${i}][is_taxable]`, item.is_taxable);
        submitData.append(`items[${i}][tax_rate]`, item.tax_rate);
        submitData.append(`items[${i}][tax_type]`, item.tax_type);
        if (item.document)
          submitData.append(`item_document_${i}`, item.document);
      });

      if (editingPurchase) {
        await creditPurchaseService.updateCreditPurchase(
          editingPurchase.id,
          submitData
        );
        toast.success("Credit purchase updated successfully");
      } else {
        await creditPurchaseService.createCreditPurchase(submitData);
        toast.success("Credit purchase created successfully");
      }
      setIsClosingModal(true);
      setTimeout(() => {
        handleClose();
        setIsClosingModal(false);
        onSuccess?.();
      }, 700);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false); // ✅ stop spinner
    }
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
        onHide={() => {
          setIsClosingModal(true);
          setTimeout(() => {
            handleClose();
            setIsClosingModal(false);
          }, 700);
        }}
        size="lg"
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPurchase
              ? "Update GST Purchase"
              : "GST Purchase"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>
                    Site {!fromWallet && <span className="text-danger">*</span>}
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
                    placeholder="Select Site..."
                    isDisabled={fromWallet || !!editingPurchase}
                    isClearable={!fromWallet && !editingPurchase}
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
              <Col>
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
              categories.find((c) => c.id === formData.category_id)?.name ||
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
    onCreateOption={(inputValue) => {
      // If you want to allow new category creation
      setFormData((prev) => ({
        ...prev,
        category_id: inputValue,
      }));
    }}
    options={categories.map((c) => ({
      value: c.id,
      label: c.name,
    }))}
    placeholder="Type or create category..."
    isClearable
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

            <Row className="">
              <Col>
                <Form.Group>
                  <Form.Label>
                    Vendor Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    isInvalid={!!errors.vendor_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.vendor_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  

                  {/* <Select
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
                        type_of_supply_or_service: selected
                          ? selected.value
                          : "",
                      }))
                    }
                    options={supplyTypes.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    placeholder="Select supply type..."
                    isClearable
                   

                  /> */}

                  <Form.Group>
                    <Form.Label>
                      Type of Supply / Service{" "}
                      <span className="text-danger">*</span>
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
                            type_of_supply_or_service: selected
                              ? selected.value
                              : "",
                          }))
                        }
                        options={supplyTypes.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                        placeholder="Select supply type..."
                        isClearable
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderColor: errors.type_of_supply_or_service
                              ? "#dc3545" // red for invalid
                              : state.isFocused
                              ? "#198754" // green for focus
                              : "#ced4da", // default gray
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
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
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
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.actual_bill_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Remark
              </Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter remark..."
              />
            </Form.Group>

            {editingPurchase && (
              <Form.Group className="mb-3">
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
                />
                <Form.Control.Feedback type="invalid">
                  {errors.remark}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {/* ✅ Status field removed */}

            <hr />
            <h5>Items</h5>

            {formData.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderTop: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "5px",
                  marginBottom: "0px",
                }}
              >
                <Button
                  variant="danger"
                  size="sm"
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "-5px",
                    padding: "0 6px",
                    lineHeight: 1,
                  }}
                  onClick={() => handleRemoveItem(idx)}
                >
                  &times;
                </Button>

                <Row className="align-items-center">
                  <Col>
                    <Form.Label>
                      Item Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      name="item_name"
                      value={item.item_name}
                      onChange={(e) => handleChange(e, idx, "items")}
                      isInvalid={!!errors[`item_name_${idx}`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`item_name_${idx}`]}
                    </Form.Control.Feedback>
                  </Col>

                  <Col>
                    <Form.Label>
                      Amount {!fromWallet && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="subtotal"
                      value={item.subtotal}
                      onChange={(e) => handleChange(e, idx, "items")}
                      isInvalid={!!errors[`subtotal_${idx}`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`subtotal_${idx}`]}
                    </Form.Control.Feedback>
                  </Col>

                  <Col className="mt-4">
                    <Form.Check
                      type="checkbox"
                      label="Taxable"
                      name="is_taxable"
                      checked={item.is_taxable}
                      onChange={(e) => handleChange(e, idx, "items")}
                    />
                  </Col>

                  {item.is_taxable && (
                    <>
                      <Col>
                        <Form.Label>
                          Tax Rate <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="tax_rate"
                          value={item.tax_rate}
                          onChange={(e) => handleChange(e, idx, "items")}
                          isInvalid={!!errors[`tax_rate_${idx}`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`tax_rate_${idx}`]}
                        </Form.Control.Feedback>
                      </Col>

                      <Col>
                        <Form.Label>
                          Tax Type <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="tax_type"
                          value={item.tax_type}
                          onChange={(e) => handleChange(e, idx, "items")}
                        >
                          <option value="exclusive">Exclusive</option>
                          <option value="inclusive">Inclusive</option>
                        </Form.Select>
                      </Col>
                    </>
                  )}
                </Row>

                {/* ✅ File Upload always in next line */}
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Label>Document Upload</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => handleFileChange(idx, e.target.files[0])}
                    />
                  </Col>
                </Row>
              </div>
            ))}

            <Button
              variant="success"
              className="position-relative"
              style={{ left: "85%" }}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </Form>
        </Modal.Body>
        <hr />

<div className="text-end pe-3">
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
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleAnimatedClose}
            disabled={loading}
          >
            Cancel
          </Button>
          {/* <Button onClick={handleSubmit} variant="success">
          {editingPurchase ? "Update" : "Create"}
        </Button> */}

          <Button
            onClick={handleSubmit}
            variant="success"
            disabled={loading} // ✅ disable during submit
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {editingPurchase ? "Updating..." : "Creating..."}
              </>
            ) : editingPurchase ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreditPurchaseModal;
