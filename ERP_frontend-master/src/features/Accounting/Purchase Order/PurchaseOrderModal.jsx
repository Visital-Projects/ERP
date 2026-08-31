// import React, { useEffect, useState } from "react";
// import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
// import { getBranches } from "../../../services/branchService";
// import { fetchUnits, createUnit } from "../../../services/AccountingSetup";
// import CreatableSelect from "react-select/creatable";
// import { toast } from "react-toastify";

// const PurchaseOrderModal = ({
//   show,
//   onHide,
//   formData,
//   setFormData,
//   selectedPurchase,
//   handleSave,
//   addLineItem,
//   removeLineItem,
//   handleLineItemChange,
// }) => {
//   const [branches, setBranches] = useState([]);
//   const [draftSaving, setDraftSaving] = useState(false);
//   const [units, setUnits] = useState([]);
//   const [loadingBranches, setLoadingBranches] = useState(false);
//   const [loadingUnits, setLoadingUnits] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({}); // ✅ store missing field errors

//   // ✅ Fetch branches and units when modal opens
//   useEffect(() => {
//     const loadData = async () => {
//       setLoadingBranches(true);
//       const branchesData = await getBranches();
//       setBranches(branchesData);
//       setLoadingBranches(false);

//       setLoadingUnits(true);
//       const unitsData = await fetchUnits();
//       setUnits(unitsData);
//       setLoadingUnits(false);
//     };
//     loadData();
//   }, []);
  
//   useEffect(() => {
//     if (!show) {
//       setErrors({}); // clear errors when modal is closed
//     }
//   }, [show]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//       if ((name === "po_date" || name === "delivery_date") && value) {
//     const [yyyy, mm, dd] = value.split("-");

//     if (yyyy && yyyy.length > 4) {
//       return; // ⛔ ignore invalid year input
//     }
//   }
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" })); // ✅ clear error on input
//   };

//   const handleFileChange = (e) => {
//     const newFiles = Array.from(e.target.files);
//     setFormData((prev) => {
//       const existingFiles = prev.documents || [];
//       const combinedFiles = [...existingFiles, ...newFiles];
//       const uniqueFiles = combinedFiles.filter(
//         (file, index, self) =>
//           index === self.findIndex((f) => f.name === file.name)
//       );
//       return { ...prev, documents: uniqueFiles };
//     });
//     e.target.value = null;
//   };

//   // ✅ Validate required fields before save
//   const handleValidateAndSave = () => {
//     const newErrors = {};
//     if (!formData.po_number) newErrors.po_number = "This field is required";
//     if (!formData.vendor_name) newErrors.vendor_name = "This field is required";
//     if (!formData.po_date) newErrors.po_date = "This field is required";
//     if (!formData.delivery_date) newErrors.delivery_date = "This field is required";
//     if (!formData.branch_id) newErrors.branch_id = "This field is required";

//     // line items validation
//     formData.line_items.forEach((item, i) => {
//       if (!item.item_name)
//         newErrors[`item_name_${i}`] = "This field is required";
//       if (!item.quantity)
//         newErrors[`quantity_${i}`] = "This field is required";
//       if (!item.unit_id)
//         newErrors[`unit_id_${i}`] = "This field is required";
//       if (!item.unit_price)
//         newErrors[`unit_price_${i}`] = "This field is required";
//     });

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length === 0) {
//       handleSave(); // ✅ only call handleSave if no errors
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {selectedPurchase ? "Edit Purchase Order" : "Add Purchase Order"}
//         </Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         <Form>
//           {/* === Purchase Order Header Fields === */}
//           <Row className="mb-3">
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>
//                   PO Number <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="po_number"
//                   value={formData.po_number || ""}
//                   onChange={handleChange}
//                   placeholder="Enter PO number"
//                   style={{
//                     borderColor: errors.po_number ? "red" : "",
//                   }}
//                 />
//                 {errors.po_number && (
//                   <small className="text-danger">{errors.po_number}</small>
//                 )}
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>
//                   Vendor Name <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="vendor_name"
//                   value={formData.vendor_name || ""}
//                   onChange={handleChange}
//                   placeholder="Enter vendor name"
//                   style={{
//                     borderColor: errors.vendor_name ? "red" : "",
//                   }}
//                 />
//                 {errors.vendor_name && (
//                   <small className="text-danger">{errors.vendor_name}</small>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row className="mb-3">
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>
//                   PO Date <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="po_date"
//                   value={formData.po_date || ""}
//                   onChange={handleChange}
//                   style={{
//                     borderColor: errors.po_date ? "red" : "",
//                   }}
//                 />
//                 {errors.po_date && (
//                   <small className="text-danger">{errors.po_date}</small>
//                 )}
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>
//                   Delivery Date <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="delivery_date"
//                   value={formData.delivery_date || ""}
//                   onChange={handleChange}
//                   style={{
//                     borderColor: errors.delivery_date ? "red" : "",
//                   }}
//                 />
//                 {errors.delivery_date && (
//                   <small className="text-danger">{errors.delivery_date}</small>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row className="mb-3">
//             <Col md={selectedPurchase ? 6 : 12}>
//               <Form.Group>
//                 <Form.Label>
//                   Site <span className="text-danger">*</span>
//                 </Form.Label>
//                 {loadingBranches ? (
//                   <div className="text-muted small">Loading sites...</div>
//                 ) : (
//                   <Form.Select
//                     name="branch_id"
//                     value={formData.branch_id || ""}
//                     onChange={handleChange}
//                     style={{
//                       borderColor: errors.branch_id ? "red" : "",
//                     }}
//                   >
//                     <option value="">Select a site</option>
//                     {branches.map((branch) => (
//                       <option key={branch.id} value={branch.id}>
//                         {branch.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 )}
//                 {errors.branch_id && (
//                   <small className="text-danger">{errors.branch_id}</small>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* Show Status field only in edit mode */}
// {selectedPurchase && (
//   <Col md={6}>
//     <Form.Group>
//       <Form.Label>Status</Form.Label>
//       <Form.Select
//         name="status"
//         value={formData.status}
//         onChange={handleChange}
//         required
//       >
//         <option value="">Change Status</option>
//         <option value="Approved">Approved</option>
//         <option value="Received">Received</option>
//       </Form.Select>
//     </Form.Group>
//   </Col>
// )}

//           </Row>

// {/* === Document Upload === */}
// {/* <Form.Group className="mb-3">
//   <Form.Label>
//     Documents <span className="text-danger">*</span>
//   </Form.Label>
//   {Array.isArray(formData.documents) && formData.documents.length > 0 && (
//     <div className="mt-2 d-flex flex-wrap gap-2">
//       {formData.documents.map((file, idx) => {
//         const fileName =
//           typeof file === "string"
//             ? file.split("/").pop()
//             : file.name || "Unnamed file";

//         const fileUrl =
//           typeof file === "string"
//             ? `/${file}`
//             : URL.createObjectURL(file);

//         return (
//           <div
//             key={idx}
//             className="border rounded p-2 d-flex align-items-center"
//             style={{ background: "#f8f9fa", position: "relative" }}
//           >
//             <a
//               href={fileUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="me-2 text-decoration-none text-primary"
//               style={{ fontSize: "0.85rem" }}
//             >
//               {fileName.length > 20
//                 ? fileName.slice(0, 17) + "..."
//                 : fileName}
//             </a>
//             <Button
//               size="sm"
//               variant="outline-danger"
//               style={{
//                 padding: "0 5px",
//                 fontSize: "0.7rem",
//                 lineHeight: "1",
//               }}
//               onClick={() => {
//                 setFormData((prev) => ({
//                   ...prev,
//                   documents: prev.documents.filter((_, i) => i !== idx),
//                 }));
//               }}
//             >
//               ×
//             </Button>
//           </div>
//         );
//       })}
//     </div>
//   )}

//   <Form.Control type="file" multiple onChange={handleFileChange} />
// </Form.Group> */}
// <Form.Group className="mb-3">
//   <Form.Label>
//     Documents <span className="text-danger">*</span>
//   </Form.Label>

//   {/* Display existing files */}
//   {Array.isArray(formData.documents) && formData.documents.length > 0 && (
//     <div className="mt-2 d-flex flex-wrap gap-2">
//       {formData.documents.map((file, idx) => {
//         const fileName =
//           typeof file === "string" ? file.split("/").pop() : file.name || "Unnamed file";

//         let fileUrl = "";
//         if (file instanceof File || file instanceof Blob) {
//           fileUrl = URL.createObjectURL(file);
//         } else if (typeof file === "string") {
//           fileUrl = file.startsWith("http") ? file : `/${file}`;
//         }

//         return (
//           <div
//             key={idx}
//             className="border rounded p-2 d-flex align-items-center"
//             style={{ background: "#f8f9fa", position: "relative" }}
//           >
//             <a
//               href={fileUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="me-2 text-decoration-none text-primary"
//               style={{ fontSize: "0.85rem" }}
//             >
//               {fileName.length > 20 ? fileName.slice(0, 17) + "..." : fileName}
//             </a>
//             <Button
//               size="sm"
//               variant="outline-danger"
//               style={{ padding: "0 5px", fontSize: "0.7rem", lineHeight: "1" }}
//               onClick={() =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   documents: prev.documents.filter((_, i) => i !== idx),
//                 }))
//               }
//             >
//               ×
//             </Button>
//           </div>
//         );
//       })}
//     </div>
//   )}

//   {/* File input with validation */}
//   <Form.Control
//     type="file"
//     multiple
//     accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
//     onChange={(e) => {
//       const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/gif",
//         "image/webp",
//         "image/bmp",
//         "application/pdf",
//       ];

//       const newFiles = Array.from(e.target.files);
//       const invalidFiles = newFiles.filter((file) => !allowedTypes.includes(file.type));

//       if (invalidFiles.length > 0) {
//         toast.error(
//           `Invalid file type: ${invalidFiles.map((f) => f.name).join(", ")}`
//         );
//         return;
//       }

//       setFormData((prev) => {
//         const existingFiles = prev.documents || [];
//         const combinedFiles = [...existingFiles, ...newFiles];
//         const uniqueFiles = combinedFiles.filter(
//           (file, index, self) => index === self.findIndex((f) => f.name === file.name)
//         );
//         return { ...prev, documents: uniqueFiles };
//       });

//       e.target.value = null;
//     }}
//     required={!selectedPurchase || !formData.documents?.length}
//     isInvalid={!!errors.documents}
//   />
//   <small className="text-muted">
//     Only JPG, JPEG, PNG, GIF, WEBP, BMP, and PDF files are allowed
//   </small>
//   {errors.documents && (
//     <small className="text-danger d-block">{errors.documents}</small>
//   )}
// </Form.Group>


//           <hr />
//           <h6 className="fw-bold">Line Items <span className="text-danger">*</span></h6>

//           {/* === Line Items Section === */}
//           {formData.line_items.map((item, index) => (
//             <div key={index} className="border rounded p-3 mb-3 bg-light">
//               <Row className="mb-2">
//                 <Col md={3}>
//                   <Form.Group>
//                     <Form.Label>Item Name <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={item.item_name}
//                       onChange={(e) =>
//                         handleLineItemChange(index, "item_name", e.target.value)
//                       }
//                       style={{
//                         borderColor: errors[`item_name_${index}`] ? "red" : "",
//                       }}
//                     />
//                     {errors[`item_name_${index}`] && (
//                       <small className="text-danger">
//                         {errors[`item_name_${index}`]}
//                       </small>
//                     )}
//                   </Form.Group>
//                 </Col>

//                 <Col md={2}>
//                   <Form.Group>
//                     <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) =>
//                         handleLineItemChange(index, "quantity", e.target.value)
//                       }
//                       style={{
//                         borderColor: errors[`quantity_${index}`] ? "red" : "",
//                       }}
//                     />
//                     {errors[`quantity_${index}`] && (
//                       <small className="text-danger">
//                         {errors[`quantity_${index}`]}
//                       </small>
//                     )}
//                   </Form.Group>
//                 </Col>

//                 <Col md={3}>
//                   <Form.Group>
//                     <Form.Label>Unit <span className="text-danger">*</span></Form.Label>
//                     {loadingUnits ? (
//                       <div className="text-muted small">Loading units...</div>
//                     ) : (
//                       <CreatableSelect
//                         value={
//                           item.unit_id
//                             ? {
//                                 value: item.unit_id,
//                                 label: units.find(
//                                   (u) => u.id === item.unit_id
//                                 )?.name,
//                               }
//                             : null
//                         }
//                         onChange={async (selected) => {
//                           if (selected.__isNew__) {
//                             const newUnit = await createUnit({
//                               name: selected.value,
//                             });
//                             if (newUnit?.id) {
//                               setUnits((prev) => [...prev, newUnit]);
//                               handleLineItemChange(
//                                 index,
//                                 "unit_id",
//                                 newUnit.id
//                               );
//                             }
//                           } else {
//                             handleLineItemChange(index, "unit_id", selected.value);
//                           }
//                         }}
//                         options={units.map((u) => ({
//                           value: u.id,
//                           label: u.name,
//                         }))}
//                         placeholder="Select or type unit..."
//                         isClearable
//                         styles={{
//                           control: (base) => ({
//                             ...base,
//                             borderColor: errors[`unit_id_${index}`]
//                               ? "red"
//                               : base.borderColor,
//                           }),
//                         }}
//                       />
//                     )}
//                     {errors[`unit_id_${index}`] && (
//                       <small className="text-danger">
//                         {errors[`unit_id_${index}`]}
//                       </small>
//                     )}
//                   </Form.Group>
//                 </Col>

//                 <Col md={3}>
//                   <Form.Group>
//                     <Form.Label>Unit Price <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={item.unit_price}
//                       onChange={(e) =>
//                         handleLineItemChange(index, "unit_price", e.target.value)
//                       }
//                       style={{
//                         borderColor: errors[`unit_price_${index}`] ? "red" : "",
//                       }}
//                     />
//                     {errors[`unit_price_${index}`] && (
//                       <small className="text-danger">
//                         {errors[`unit_price_${index}`]}
//                       </small>
//                     )}
//                   </Form.Group>
//                 </Col>

//                 <Col md={1} className="d-flex align-items-end">
//                   <Button
//                     variant="danger"
//                     size="sm"
//                     onClick={() => removeLineItem(index)}
//                   >
//                     ×
//                   </Button>
//                 </Col>
//               </Row>
//             </div>
//           ))}

//           <Button size="sm" variant="secondary" onClick={addLineItem}>
//             + Add Item
//           </Button>
//         </Form>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>

//         <Button
//           variant="warning"
//           onClick={() => {
//             try {
//               setDraftSaving(true);
//               const existingDrafts = JSON.parse(localStorage.getItem("poDrafts")) || [];
//               const updatedDrafts = [...existingDrafts, formData];
//               localStorage.setItem("poDrafts", JSON.stringify(updatedDrafts));
//                toast.success("Saved as draft successfully!");
//               onHide();
//             } catch (error) {
//               console.error("Error saving draft:", error);
//               toast.error("Failed to save draft");
//             } finally {
//       setDraftSaving(false); 
//     }
//           }}
//         >
//           Save as Draft
//         </Button>

//         <Button
//           variant="success"
//           onClick={handleValidateAndSave} // ✅ replaced direct call
//           disabled={saving}
//         >
//           {saving ? (
//             <>
//               <Spinner size="sm" animation="border" className="me-2" /> Saving...
//             </>
//           ) : (
//             "Save Purchase Order"
//           )}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default PurchaseOrderModal;



import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { getBranches } from "../../../services/branchService";
import { fetchUnits, createUnit } from "../../../services/AccountingSetup";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";

const PurchaseOrderModal = ({
  show,
  onHide,
  formData,
  setFormData,
  selectedPurchase,
  handleSave,
  addLineItem,
  removeLineItem,
  handleLineItemChange,
}) => {
  const [branches, setBranches] = useState([]);
  const [draftSaving, setDraftSaving] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ store missing field errors

  // ✅ Fetch branches and units when modal opens
  useEffect(() => {
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
  }, []);
  
  useEffect(() => {
    if (!show) {
      setErrors({}); // clear errors when modal is closed
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
      if ((name === "po_date" || name === "delivery_date") && value) {
    const [yyyy, mm, dd] = value.split("-");

    if (yyyy && yyyy.length > 4) {
      return; // ⛔ ignore invalid year input
    }
  }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // ✅ clear error on input
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => {
      const existingFiles = prev.documents || [];
      const combinedFiles = [...existingFiles, ...newFiles];
      const uniqueFiles = combinedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );
      return { ...prev, documents: uniqueFiles };
    });
    e.target.value = null;
  };

  // ✅ Validate required fields before save
  const handleValidateAndSave = () => {
    const newErrors = {};
    if (!formData.po_number) newErrors.po_number = "This field is required";
    if (!formData.vendor_name) newErrors.vendor_name = "This field is required";
    if (!formData.po_date) newErrors.po_date = "This field is required";
    if (!formData.delivery_date) newErrors.delivery_date = "This field is required";
    if (!formData.branch_id) newErrors.branch_id = "This field is required";

    // line items validation
    formData.line_items.forEach((item, i) => {
      if (!item.item_name)
        newErrors[`item_name_${i}`] = "This field is required";
      if (!item.quantity)
        newErrors[`quantity_${i}`] = "This field is required";
      if (!item.unit_id)
        newErrors[`unit_id_${i}`] = "This field is required";
      if (!item.unit_price)
        newErrors[`unit_price_${i}`] = "This field is required";
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSave(); // ✅ only call handleSave if no errors
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedPurchase ? "Edit Purchase Order" : "Add Purchase Order"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* === Purchase Order Header Fields === */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  PO Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="po_number"
                  value={formData.po_number || ""}
                  onChange={handleChange}
                  placeholder="Enter PO number"
                  style={{
                    borderColor: errors.po_number ? "red" : "",
                  }}
                />
                {errors.po_number && (
                  <small className="text-danger">{errors.po_number}</small>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Vendor Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name || ""}
                  onChange={handleChange}
                  placeholder="Enter vendor name"
                  style={{
                    borderColor: errors.vendor_name ? "red" : "",
                  }}
                />
                {errors.vendor_name && (
                  <small className="text-danger">{errors.vendor_name}</small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  PO Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="po_date"
                  value={formData.po_date || ""}
                  onChange={handleChange}
                  style={{
                    borderColor: errors.po_date ? "red" : "",
                  }}
                />
                {errors.po_date && (
                  <small className="text-danger">{errors.po_date}</small>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Delivery Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date || ""}
                  onChange={handleChange}
                  style={{
                    borderColor: errors.delivery_date ? "red" : "",
                  }}
                />
                {errors.delivery_date && (
                  <small className="text-danger">{errors.delivery_date}</small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={selectedPurchase ? 6 : 12}>
              <Form.Group>
                <Form.Label>
                  Site <span className="text-danger">*</span>
                </Form.Label>
                {loadingBranches ? (
                  <div className="text-muted small">Loading sites...</div>
                ) : (
                  <Form.Select
                    name="branch_id"
                    value={formData.branch_id || ""}
                    onChange={handleChange}
                    style={{
                      borderColor: errors.branch_id ? "red" : "",
                    }}
                  >
                    <option value="">Select a site</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {errors.branch_id && (
                  <small className="text-danger">{errors.branch_id}</small>
                )}
              </Form.Group>
            </Col>

            {/* Show Status field only in edit mode */}
{selectedPurchase && (
  <Col md={6}>
    <Form.Group>
      <Form.Label>Status</Form.Label>
      <Form.Select
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
      >
        <option value="">Change Status</option>
        <option value="Approved">Approved</option>
        <option value="Received">Received</option>
      </Form.Select>
    </Form.Group>
  </Col>
)}

          </Row>

{/* === Document Upload === */}
{/* <Form.Group className="mb-3">
  <Form.Label>
    Documents <span className="text-danger">*</span>
  </Form.Label>
  {Array.isArray(formData.documents) && formData.documents.length > 0 && (
    <div className="mt-2 d-flex flex-wrap gap-2">
      {formData.documents.map((file, idx) => {
        const fileName =
          typeof file === "string"
            ? file.split("/").pop()
            : file.name || "Unnamed file";

        const fileUrl =
          typeof file === "string"
            ? `/${file}`
            : URL.createObjectURL(file);

        return (
          <div
            key={idx}
            className="border rounded p-2 d-flex align-items-center"
            style={{ background: "#f8f9fa", position: "relative" }}
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="me-2 text-decoration-none text-primary"
              style={{ fontSize: "0.85rem" }}
            >
              {fileName.length > 20
                ? fileName.slice(0, 17) + "..."
                : fileName}
            </a>
            <Button
              size="sm"
              variant="outline-danger"
              style={{
                padding: "0 5px",
                fontSize: "0.7rem",
                lineHeight: "1",
              }}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  documents: prev.documents.filter((_, i) => i !== idx),
                }));
              }}
            >
              ×
            </Button>
          </div>
        );
      })}
    </div>
  )}

  <Form.Control type="file" multiple onChange={handleFileChange} />
</Form.Group> */}
<Form.Group className="mb-3">
  <Form.Label>
    Documents <span className="text-danger">*</span>
  </Form.Label>

  {/* Display existing files */}
  {Array.isArray(formData.documents) && formData.documents.length > 0 && (
    <div className="mt-2 d-flex flex-wrap gap-2">
      {formData.documents.map((file, idx) => {
        const fileName =
          typeof file === "string" ? file.split("/").pop() : file.name || "Unnamed file";

        let fileUrl = "";
        if (file instanceof File || file instanceof Blob) {
          fileUrl = URL.createObjectURL(file);
        } else if (typeof file === "string") {
          fileUrl = file.startsWith("http") ? file : `/${file}`;
        }

        return (
          <div
            key={idx}
            className="border rounded p-2 d-flex align-items-center"
            style={{ background: "#f8f9fa", position: "relative" }}
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="me-2 text-decoration-none text-primary"
              style={{ fontSize: "0.85rem" }}
            >
              {fileName.length > 20 ? fileName.slice(0, 17) + "..." : fileName}
            </a>
            <Button
              size="sm"
              variant="outline-danger"
              style={{ padding: "0 5px", fontSize: "0.7rem", lineHeight: "1" }}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  documents: prev.documents.filter((_, i) => i !== idx),
                }))
              }
            >
              ×
            </Button>
          </div>
        );
      })}
    </div>
  )}

  {/* File input with validation */}
  <Form.Control
    type="file"
    multiple
    accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
    onChange={(e) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "application/pdf",
      ];

      const newFiles = Array.from(e.target.files);
      const invalidFiles = newFiles.filter((file) => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid file type: ${invalidFiles.map((f) => f.name).join(", ")}`
        );
        return;
      }

      setFormData((prev) => {
        const existingFiles = prev.documents || [];
        const combinedFiles = [...existingFiles, ...newFiles];
        const uniqueFiles = combinedFiles.filter(
          (file, index, self) => index === self.findIndex((f) => f.name === file.name)
        );
        return { ...prev, documents: uniqueFiles };
      });

      e.target.value = null;
    }}
    required={!selectedPurchase || !formData.documents?.length}
    isInvalid={!!errors.documents}
  />
  <small className="text-muted">
    Only JPG, JPEG, PNG, GIF, WEBP, BMP, and PDF files are allowed
  </small>
  {errors.documents && (
    <small className="text-danger d-block">{errors.documents}</small>
  )}
</Form.Group>


          <hr />
          <h6 className="fw-bold">Line Items <span className="text-danger">*</span></h6>

          {/* === Line Items Section === */}
          {formData.line_items.map((item, index) => (
            <div key={index} className="border rounded p-3 mb-3 bg-light">
              <Row className="mb-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Item Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={item.item_name}
                      onChange={(e) =>
                        handleLineItemChange(index, "item_name", e.target.value)
                      }
                      style={{
                        borderColor: errors[`item_name_${index}`] ? "red" : "",
                      }}
                    />
                    {errors[`item_name_${index}`] && (
                      <small className="text-danger">
                        {errors[`item_name_${index}`]}
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, "quantity", e.target.value)
                      }
                      style={{
                        borderColor: errors[`quantity_${index}`] ? "red" : "",
                      }}
                    />
                    {errors[`quantity_${index}`] && (
                      <small className="text-danger">
                        {errors[`quantity_${index}`]}
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Unit <span className="text-danger">*</span></Form.Label>
                    {loadingUnits ? (
                      <div className="text-muted small">Loading units...</div>
                    ) : (
                      <CreatableSelect
                        value={
                          item.unit_id
                            ? {
                                value: item.unit_id,
                                label: units.find(
                                  (u) => u.id === item.unit_id
                                )?.name,
                              }
                            : null
                        }
                        onChange={async (selected) => {
                          if (selected.__isNew__) {
                            const newUnit = await createUnit({
                              name: selected.value,
                            });
                            if (newUnit?.id) {
                              setUnits((prev) => [...prev, newUnit]);
                              handleLineItemChange(
                                index,
                                "unit_id",
                                newUnit.id
                              );
                            }
                          } else {
                            handleLineItemChange(index, "unit_id", selected.value);
                          }
                        }}
                        options={units.map((u) => ({
                          value: u.id,
                          label: u.name,
                        }))}
                        placeholder="Select or type unit..."
                        isClearable
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: errors[`unit_id_${index}`]
                              ? "red"
                              : base.borderColor,
                          }),
                        }}
                      />
                    )}
                    {errors[`unit_id_${index}`] && (
                      <small className="text-danger">
                        {errors[`unit_id_${index}`]}
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Unit Price <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleLineItemChange(index, "unit_price", e.target.value)
                      }
                      style={{
                        borderColor: errors[`unit_price_${index}`] ? "red" : "",
                      }}
                    />
                    {errors[`unit_price_${index}`] && (
                      <small className="text-danger">
                        {errors[`unit_price_${index}`]}
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={1} className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                  >
                    ×
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Button size="sm" variant="secondary" onClick={addLineItem}>
            + Add Item
          </Button>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>

        {/* <Button
          variant="warning"
          onClick={() => {
            try {
              setDraftSaving(true);
              const existingDrafts = JSON.parse(localStorage.getItem("poDrafts")) || [];
              const updatedDrafts = [...existingDrafts, formData];
              localStorage.setItem("poDrafts", JSON.stringify(updatedDrafts));
               toast.success("Saved as draft successfully!");
              onHide();
            } catch (error) {
              console.error("Error saving draft:", error);
              toast.error("Failed to save draft");
            } finally {
      setDraftSaving(false); 
    }
          }}
        >
          Save as Draft
        </Button> */}

        <Button
          variant="success"
          onClick={handleValidateAndSave} // ✅ replaced direct call
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" /> Saving...
            </>
          ) : (
            "Save Purchase Order"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PurchaseOrderModal;