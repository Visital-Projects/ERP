// // WorkOrderModal.jsx
// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form, Spinner, ListGroup } from "react-bootstrap";
// import { getBranches } from "../../../services/branchService";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import Select from 'react-select'
// import { fetchUnits } from "../../../services/AccountingSetup";

// const WorkOrderModal = ({ show, onHide, formData, setFormData, handleSave, selectedWorkOrder, onDraftSaved  }) => {
//   const navigate = useNavigate();
//   const [branches, setBranches] = useState([]);
//   const [loadingBranches, setLoadingBranches] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [loadingUnits, setLoadingUnits] = useState(false);
//   const [units, setUnits] = useState([]);
//   const [requiredFields, setRequiredFields] = useState({});
//   const isEditMode = !!selectedWorkOrder;

//   useEffect(() => {
//     if (show) {
//       fetchBranches();
//       fetchAllUnits();
//       setRequiredFields({});
//     }
//   }, [show]);

//   const fetchBranches = async () => {
//     setLoadingBranches(true);
//     const branchList = await getBranches();
//     setBranches(branchList);
//     setLoadingBranches(false);
//   };

//     const fetchAllUnits = async () => {
//     setLoadingUnits(true);
//     const unitList = await fetchUnits();
//     setUnits(unitList.map(u => ({ value: u.id, label: u.name }))); // ✅ map for react-select
//     setLoadingUnits(false);
//   };
//   // Auto-calculate Actual Days whenever start_date or end_date changes
//   useEffect(() => {
//     if (isEditMode && formData.start_date && formData.end_date) {
//       const start = new Date(formData.start_date);
//       const end = new Date(formData.end_date);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         const diffTime = end.getTime() - start.getTime();
//         const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 0);
//         setFormData((prev) => ({ ...prev, actual_days: diffDays }));
//       }
//     }
//   }, [formData.start_date, formData.end_date, isEditMode]);
//   useEffect(() => {
//   if (show && !isEditMode && (!formData.services || formData.services.length === 0)) {
//     setFormData((prev) => ({
//       ...prev,
//       services: [
//         {
//           service_code: "",
//           description: "",
//           unit_id: "",
//           quantity: "",
//           rate: "",
//         },
//       ],
//     }));
//   }
// }, [show, isEditMode]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "documents") {
//       setFormData((prev) => {
//         const existingFiles = prev.documents || [];
//         const newFiles = files ? Array.from(files) : [];
//         return {
//           ...prev,
//           documents: [...existingFiles, ...newFiles],
//         };
//       });
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value || "" }));
//     }
//   };

//   const validateRequiredFields = () => {
//     const required = {};
//     let isValid = true;

//     // Define required fields for create mode
//     if (!isEditMode) {
//       const fieldsToValidate = [
//         'wo_number',
//         'title',
//         'description',
//         'wo_type',
//         'priority',
//         'assigned_to',
//         'issue_date',
//         'expected_date',
//         'documents'
//       ];

//       fieldsToValidate.forEach(field => {
//         if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
//           required[field] = 'This field is required';
//           isValid = false;
//         }
//       });
//     }

//     setRequiredFields(required);
//     return isValid;
//   };

//   const handleSubmit = async () => {
//     if (!isEditMode && !validateRequiredFields()) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = new FormData();

// for (let key in formData) {
//   if (key === "documents" || key === "services") continue;

//   // Skip empty numeric fields
//   if (
//     (key === "expected_days" || key === "actual_days" || key === "amount") &&
//     (formData[key] === "" || formData[key] === null)
//   ) {
//     continue;
//   }

//   payload.append(key, formData[key]);
// }

// // ✅ Add services properly as JSON
// if (formData.services && formData.services.length > 0) {
//   payload.append("services", JSON.stringify(formData.services));
// }

//       if (formData.documents && formData.documents.length > 0) {
//         formData.documents.forEach((file) => {
//           if (file instanceof File) {
//             payload.append("documents", file);
//           }
//         });
//       }

//       await handleSave(payload);
//       onHide();
//     } catch (err) {
//       console.error("Error saving work order:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>{isEditMode ? "Edit Work Order" : "Create Work Order"}</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         <Form>
//           {/* WO Number */}
//           <Form.Group className="mb-3">
//             <Form.Label>WO Number <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               name="wo_number"
//               value={formData.wo_number || ""}
//               onChange={handleChange}
//               placeholder="Enter Work Order Number"
//               isInvalid={!!requiredFields.wo_number}
//             />
//             <Form.Control.Feedback type="invalid">
//               {requiredFields.wo_number}
//             </Form.Control.Feedback>
//           </Form.Group>

//           {/* Title */}
//           <Form.Group className="mb-3">
//             <Form.Label>Title <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               name="title"
//               value={formData.title || ""}
//               onChange={handleChange}
//               placeholder="Enter work order title"
//               isInvalid={!!requiredFields.title}
//             />
//             <Form.Control.Feedback type="invalid">
//               {requiredFields.title}
//             </Form.Control.Feedback>
//           </Form.Group>

//           {/* Description */}
//           <Form.Group className="mb-3">
//             <Form.Label>Description <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="description"
//               value={formData.description || ""}
//               onChange={handleChange}
//               placeholder="Enter work order description"
//               isInvalid={!!requiredFields.description}
//             />
//             <Form.Control.Feedback type="invalid">
//               {requiredFields.description}
//             </Form.Control.Feedback>
//           </Form.Group>

//           {/* WO Type & Priority */}
//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Work Order Type <span className="text-danger">*</span></Form.Label>
//                 <Form.Select
//                   name="wo_type"
//                   value={formData.wo_type || ""}
//                   onChange={handleChange}
//                   isInvalid={!!requiredFields.wo_type}
//                 >
//                   <option value="">Select Type</option>
//                   <option value="Maintenance">Maintenance</option>
//                   <option value="Repair">Repair</option>
//                   <option value="Installation">Installation</option>
//                   <option value="Inspection">Inspection</option>
//                 </Form.Select>
//                 <Form.Control.Feedback type="invalid">
//                   {requiredFields.wo_type}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
//                 <Form.Select
//                   name="priority"
//                   value={formData.priority || ""}
//                   onChange={handleChange}
//                   isInvalid={!!requiredFields.priority}
//                 >
//                   <option value="">Select Priority</option>
//                   <option value="High">High</option>
//                   <option value="Medium">Medium</option>
//                   <option value="Low">Low</option>
//                 </Form.Select>
//                 <Form.Control.Feedback type="invalid">
//                   {requiredFields.priority}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </div>
//           </div>

//           {/* Status & Branch */}
//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select name="status" value={formData.status || "Open"} onChange={handleChange}>
//                   <option value="Open">Open</option>
//                   <option value="In Progress">In Progress</option>
//                   <option value="Completed">Completed</option>
//                 </Form.Select>
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Assigned Site <span className="text-danger">*</span></Form.Label>
//                 {loadingBranches ? (
//                   <div className="text-center">
//                     <Spinner animation="border" size="sm" /> Loading sites...
//                   </div>
//                 ) : (
//                   <>
//                     <Form.Select
//                       name="assigned_to"
//                       value={formData.assigned_to || ""}
//                       onChange={handleChange}
//                       isInvalid={!!requiredFields.assigned_to}
//                     >
//                       <option value="">Select Site</option>
//                       {branches.map((branch) => (
//                         <option key={branch.id} value={branch.id}>
//                           {branch.name}
//                         </option>
//                       ))}
//                     </Form.Select>
//                     <Form.Control.Feedback type="invalid">
//                       {requiredFields.assigned_to}
//                     </Form.Control.Feedback>
//                     <div className="mt-2">
//                       <small>
//                         Don't see your site?{" "}
//                         <span
//                           className="text-success"
//                           style={{ cursor: "pointer" }}
//                           onClick={() => navigate("/hrmsystemsetup/branch")}
//                         >
//                           Create Site
//                         </span>
//                       </small>
//                     </div>
//                   </>
//                 )}
//               </Form.Group>
//             </div>
//           </div>

//           {/* Dates */}
//           <div className="row">
//             {isEditMode ? (
//               <>
//                 <div className="col-md-4">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Actual Start Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="start_date"
//                       value={formData.start_date?.split("T")[0] || ""}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Actual End Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="end_date"
//                       value={formData.end_date?.split("T")[0] || ""}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-4">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Actual Days</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="actual_days"
//                       value={formData.actual_days || ""}
//                       onChange={handleChange}
//                       placeholder="Enter actual days"
//                     />
//                   </Form.Group>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Issue Date <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="issue_date"
//                       value={formData.issue_date?.split("T")[0] || ""}
//                       onChange={handleChange}
//                       isInvalid={!!requiredFields.issue_date}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {requiredFields.issue_date}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Expected Completion Date <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="expected_date"
//                       value={formData.expected_date?.split("T")[0] || ""}
//                       onChange={handleChange}
//                       isInvalid={!!requiredFields.expected_date}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {requiredFields.expected_date}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Multiple Documents Upload */}
//           <Form.Group className="mb-3">
//             <Form.Label>
//               Documents <span className="text-danger">*</span>
//             </Form.Label>
//               {Array.isArray(formData.documents) && formData.documents.length > 0 && (
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
//             {/* ✅ Click to view file */}
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

//             {/* ❌ Delete Button */}
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
//             <Form.Control
//               type="file"
//               name="documents"
//               multiple
//               onChange={handleChange}
//               required={!isEditMode || !formData.documents?.length}
//               isInvalid={!!requiredFields.documents}
//             />
//             <Form.Control.Feedback type="invalid">
//               {requiredFields.documents}
//             </Form.Control.Feedback>
//             {/* {formData.documents && formData.documents.length > 0 && (
//               <ListGroup className="mt-2">
//                 {formData.documents.map((file, idx) => (
//                   <ListGroup.Item key={idx}>
//                     {typeof file === "string" ? file.split("/").pop() : file.name}
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>
//             )} */}
//           </Form.Group>
//   <Form.Group className="mb-3">
//     <Form.Label>Services</Form.Label>
// {(formData.services || []).map((service, index) => (
//   <div
//     key={index}
//     className="border rounded p-3 mb-2 bg-light position-relative"
//   >
//     {/* ❌ Top-right remove button */}
//     <Button
//       variant="danger"
//       size="sm"
//       style={{
//         position: "absolute",
//         top: "5px",
//         right: "5px",
//         padding: "0 6px",
//         lineHeight: 1,
//       }}
//       onClick={() => {
//         const updated = [...formData.services];
//         updated.splice(index, 1);
//         setFormData({ ...formData, services: updated });
//       }}
//       disabled={saving}
//     >
//       &times;
//     </Button>

//     <div className="row g-2">
//       <div className="col-md-3">
//         <Form.Control
//           placeholder="Service Code"
//           value={service.service_code || ""}
//           onChange={(e) => {
//             const updated = [...formData.services];
//             updated[index].service_code = e.target.value;
//             setFormData({ ...formData, services: updated });
//           }}
//         />
//       </div>

//       <div className="col-md-3">
//         <Form.Control
//           placeholder="Service name"
//           value={service.description || ""}
//           onChange={(e) => {
//             const updated = [...formData.services];
//             updated[index].description = e.target.value;
//             setFormData({ ...formData, services: updated });
//           }}
//         />
//       </div>

//       <div className="col-md-3">
//         <Select
//           isSearchable
//           isClearable
//           options={units}
//           isLoading={loadingUnits}
//           placeholder="Select Unit"
//           value={units.find((u) => u.value === service.unit_id) || null}
//           onChange={(selected) => {
//             const updated = [...formData.services];
//             updated[index].unit_id = selected ? selected.value : "";
//             setFormData({ ...formData, services: updated });
//           }}
//           styles={{
//             control: (base) => ({
//               ...base,
//               minHeight: "38px",
//               fontSize: "0.9rem",
//             }),
//           }}
//         />
//       </div>

//       <div className="col-md-2">
//         <Form.Control
//           placeholder="Quantity"
//           type="number"
//           value={service.quantity || ""}
//           onChange={(e) => {
//             const updated = [...formData.services];
//             updated[index].quantity = e.target.value;
//             setFormData({ ...formData, services: updated });
//           }}
//         />
//       </div>

//       <div className="col-md-2">
//         <Form.Control
//           placeholder="Rate"
//           type="number"
//           value={service.rate || ""}
//           onChange={(e) => {
//             const updated = [...formData.services];
//             updated[index].rate = e.target.value;
//             setFormData({ ...formData, services: updated });
//           }}
//         />
//       </div>
//     </div>
//   </div>
// ))}

//   </Form.Group>
//         </Form>
//       </Modal.Body>

// <Modal.Footer>
//   <Button variant="secondary" onClick={onHide}>
//     Cancel
//   </Button>

//   {!isEditMode || (selectedWorkOrder && selectedWorkOrder.isDraft) ? (
//     <Button
//       variant="warning"
//       onClick={() => {
// const drafts = JSON.parse(localStorage.getItem("woDrafts") || "[]");
// const draftId = formData.id || `draft_${Date.now()}`; // ✅ use existing id if re-saving
// const newDraft = { ...formData, id: draftId, isDraft: true };

// // Remove existing draft if same id, then overwrite
// const updatedDrafts = drafts.filter((d) => d.id !== draftId);
// updatedDrafts.push(newDraft);

// localStorage.setItem("woDrafts", JSON.stringify(updatedDrafts));
// toast.success("Draft saved locally!");
// if (typeof onDraftSaved === "function") onDraftSaved();
// onHide();
//       }}
//     >
//       Save as Draft
//     </Button>
//   ) : null}

//   <Button variant="success" onClick={handleSubmit} disabled={saving}>
//     {saving ? (
//       <>
//         <Spinner
//           as="span"
//           animation="border"
//           size="sm"
//           role="status"
//           aria-hidden="true"
//         />{" "}
//         {isEditMode ? "Updating..." : "Creating..."}
//       </>
//     ) : isEditMode ? "Update" : "Create"}
//   </Button>
// </Modal.Footer>

//     </Modal>
//   );
// };

// export default WorkOrderModal;

// WorkOrderModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, ListGroup } from "react-bootstrap";
import { getBranches } from "../../../services/branchService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";
import { fetchUnits, createUnit } from "../../../services/AccountingSetup";

const WorkOrderModal = ({
  show,
  onHide,
  formData,
  setFormData,
  handleSave,
  selectedWorkOrder,
  onDraftSaved,
}) => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [units, setUnits] = useState([]);
  const [woTypes, setWoTypes] = useState(() => {
    const saved = localStorage.getItem("workOrderTypes");
    return saved ? JSON.parse(saved) : ["Maintenance", "Repair", "Installation", "Inspection"];
  });
  const [newWoType, setNewWoType] = useState("");
  const [priorities, setPriorities] = useState(() => {
    const saved = localStorage.getItem("workOrderPriorities");
    return saved ? JSON.parse(saved) : ["High", "Medium", "Low"];
  });
  const [newPriority, setNewPriority] = useState("");
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem("workOrderStatuses");
    return saved ? JSON.parse(saved) : ["Open", "In Progress", "Completed"];
  });
  const [newStatus, setNewStatus] = useState("");
  const [requiredFields, setRequiredFields] = useState({});
  const isEditMode = !!selectedWorkOrder;

  useEffect(() => {
    if (show) {
      fetchBranches();
      fetchAllUnits();
      setRequiredFields({});
    }
  }, [show]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    const branchList = await getBranches();
    setBranches(branchList);
    setLoadingBranches(false);
  };

  const fetchAllUnits = async () => {
    setLoadingUnits(true);
    const unitList = await fetchUnits();
    setUnits(unitList.map((u) => ({ value: u.id, label: u.name }))); // ✅ map for react-select
    setLoadingUnits(false);
  };

  const handleAddWoType = () => {
    const trimmed = newWoType.trim();
    if (!trimmed) return;
    setWoTypes((prev) => {
      const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
      localStorage.setItem("workOrderTypes", JSON.stringify(next));
      return next;
    });
    setFormData((prev) => ({ ...prev, wo_type: trimmed }));
    setNewWoType("");
  };

  const handleAddPriority = () => {
    const trimmed = newPriority.trim();
    if (!trimmed) return;
    setPriorities((prev) => {
      const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
      localStorage.setItem("workOrderPriorities", JSON.stringify(next));
      return next;
    });
    setFormData((prev) => ({ ...prev, priority: trimmed }));
    setNewPriority("");
  };

  const handleAddStatus = () => {
    const trimmed = newStatus.trim();
    if (!trimmed) return;
    setStatuses((prev) => {
      const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
      localStorage.setItem("workOrderStatuses", JSON.stringify(next));
      return next;
    });
    setFormData((prev) => ({ ...prev, status: trimmed }));
    setNewStatus("");
  };

  // Auto-calculate Actual Days whenever start_date or end_date changes
  useEffect(() => {
    if (isEditMode && formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.max(
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1,
          0
        );
        setFormData((prev) => ({ ...prev, actual_days: diffDays }));
      }
    }
  }, [formData.start_date, formData.end_date, isEditMode]);
  useEffect(() => {
    if (
      show &&
      !isEditMode &&
      (!formData.services || formData.services.length === 0)
    ) {
      setFormData((prev) => ({
        ...prev,
        services: [
          {
            service_code: "",
            description: "",
            unit_id: "",
            quantity: "",
            rate: "",
          },
        ],
      }));
    }
  }, [show, isEditMode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

      if (name === "issue_date" || name === "expected_date" || name === "start_date" || name === "end_date") {
    if (value) {
      const year = value.split("-")[0];
      if (year.length > 4) {
        // toast.error("Year cannot be more than 4 digits");
        return; 
      }
    }
  }

    if (name === "documents") {
      setFormData((prev) => {
        const existingFiles = prev.documents || [];
        const newFiles = files ? Array.from(files) : [];
        return {
          ...prev,
          documents: [...existingFiles, ...newFiles],
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || "" }));
    }
  };

  const validateRequiredFields = () => {
    const required = {};
    let isValid = true;

    // Define required fields for create mode
    if (!isEditMode) {
      const fieldsToValidate = [
        "wo_number",
        "title",
        "description",
        "wo_type",
        "priority",
        "assigned_to",
        "issue_date",
        "expected_date",
        "documents",
      ];

      fieldsToValidate.forEach((field) => {
        if (
          !formData[field] ||
          (Array.isArray(formData[field]) && formData[field].length === 0)
        ) {
          required[field] = "This field is required";
          isValid = false;
        }
      });
    }

    setRequiredFields(required);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!isEditMode && !validateRequiredFields()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();

      for (let key in formData) {
        if (key === "documents" || key === "services") continue;

        // Skip empty numeric fields
        if (
          (key === "expected_days" ||
            key === "actual_days" ||
            key === "amount") &&
          (formData[key] === "" || formData[key] === null)
        ) {
          continue;
        }

        payload.append(key, formData[key]);
      }

      // ✅ Add services properly as JSON
      if (formData.services && formData.services.length > 0) {
        payload.append("services", JSON.stringify(formData.services));
      }

      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((file) => {
          if (file instanceof File) {
            payload.append("documents", file);
          }
        });
      }

      await handleSave(payload);
      onHide();
    } catch (err) {
      console.error("Error saving work order:", err);
    } finally {
      setSaving(false);
    }
  };
  const handleAddService = () => {
  setFormData((prev) => ({
    ...prev,
    services: [
      ...(prev.services || []),
      {
        service_code: "",
        description: "",
        unit_id: "",
        quantity: "",
        rate: "",
      },
    ],
  }));
};

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? "Edit Work Order" : "Create Work Order"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* WO Number */}
          <Form.Group className="mb-3">
            <Form.Label>
              WO Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="wo_number"
              value={formData.wo_number || ""}
              onChange={handleChange}
              placeholder="Enter Work Order Number"
              isInvalid={!!requiredFields.wo_number}
            />
            <Form.Control.Feedback type="invalid">
              {requiredFields.wo_number}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label>
              Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Enter work order title"
              isInvalid={!!requiredFields.title}
            />
            <Form.Control.Feedback type="invalid">
              {requiredFields.title}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter work order description"
              isInvalid={!!requiredFields.description}
            />
            <Form.Control.Feedback type="invalid">
              {requiredFields.description}
            </Form.Control.Feedback>
          </Form.Group>

          {/* WO Type & Priority */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  Work Order Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="wo_type"
                  value={formData.wo_type || ""}
                  onChange={handleChange}
                  isInvalid={!!requiredFields.wo_type}
                >
                  <option value="">Select Type</option>
                  {woTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {requiredFields.wo_type}
                </Form.Control.Feedback>
                <div className="mt-2 d-flex gap-2">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Add new type"
                    value={newWoType}
                    onChange={(e) => setNewWoType(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={handleAddWoType}
                    disabled={!newWoType.trim()}
                  >
                    Add
                  </Button>
                </div>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  Priority <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority || ""}
                  onChange={handleChange}
                  isInvalid={!!requiredFields.priority}
                >
                  <option value="">Select Priority</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {requiredFields.priority}
                </Form.Control.Feedback>
                <div className="mt-2 d-flex gap-2">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Add new priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={handleAddPriority}
                    disabled={!newPriority.trim()}
                  >
                    Add
                  </Button>
                </div>
              </Form.Group>
            </div>
          </div>

          {/* Status & Branch */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status || "Open"}
                  onChange={handleChange}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-2 d-flex gap-2">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Add new status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={handleAddStatus}
                    disabled={!newStatus.trim()}
                  >
                    Add
                  </Button>
                </div>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  Assigned Site <span className="text-danger">*</span>
                </Form.Label>
                {loadingBranches ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" /> Loading sites...
                  </div>
                ) : (
                  <>
                    <Form.Select
                      name="assigned_to"
                      value={formData.assigned_to || ""}
                      onChange={handleChange}
                      isInvalid={!!requiredFields.assigned_to}
                    >
                      <option value="">Select Site</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {requiredFields.assigned_to}
                    </Form.Control.Feedback>
                    <div className="mt-2">
                      <small>
                        Don't see your site?{" "}
                        <span
                          className="text-success"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/hrmsystemsetup/branch")}
                        >
                          Create Site
                        </span>
                      </small>
                    </div>
                  </>
                )}
              </Form.Group>
            </div>
          </div>

          {/* Dates */}
          <div className="row">
            {isEditMode ? (
              <>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Actual Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date?.split("T")[0] || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Actual End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date?.split("T")[0] || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Actual Days</Form.Label>
                    <Form.Control
                      type="number"
                      name="actual_days"
                      value={formData.actual_days || ""}
                      onChange={handleChange}
                      placeholder="Enter actual days"
                    />
                  </Form.Group>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Issue Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="issue_date"
                      value={formData.issue_date?.split("T")[0] || ""}
                      onChange={handleChange}
                      isInvalid={!!requiredFields.issue_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {requiredFields.issue_date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Expected Completion Date{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="expected_date"
                      value={formData.expected_date?.split("T")[0] || ""}
                      onChange={handleChange}
                      isInvalid={!!requiredFields.expected_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {requiredFields.expected_date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </>
            )}
          </div>

          {/* Multiple Documents Upload */}
          <Form.Group className="mb-3">
            <Form.Label>
              Documents <span className="text-danger">*</span>
            </Form.Label>
            {Array.isArray(formData.documents) &&
              formData.documents.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {formData.documents.map((file, idx) => {
                    const fileName =
                      typeof file === "string"
                        ? file.split("/").pop()
                        : file.name || "Unnamed file";

                    let fileUrl = "";
                    if (file instanceof File || file instanceof Blob) {
                      fileUrl = URL.createObjectURL(file);
                    } else if (typeof file === "string") {
                      // already stored path or full URL
                      fileUrl = file.startsWith("http") ? file : `/${file}`;
                    } else {
                      console.warn("Unexpected document type:", file);
                      return null;
                    }

                    return (
                      <div
                        key={idx}
                        className="border rounded p-2 d-flex align-items-center"
                        style={{ background: "#f8f9fa", position: "relative" }}
                      >
                        {/* ✅ Click to view file */}
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

                        {/* ❌ Delete Button */}
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
                              documents: prev.documents.filter(
                                (_, i) => i !== idx
                              ),
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
            <Form.Control
              type="file"
              name="documents"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
              onChange={handleChange}
              required={!isEditMode || !formData.documents?.length}
              isInvalid={!!requiredFields.documents}
            />
            <Form.Text className="text-muted">
  Only JPG, JPEG, PNG, GIF, WEBP, BMP, and PDF files are allowed.
</Form.Text>
            <Form.Control.Feedback type="invalid">
              {requiredFields.documents}
            </Form.Control.Feedback>
            {/* {formData.documents && formData.documents.length > 0 && (
              <ListGroup className="mt-2">
                {formData.documents.map((file, idx) => (
                  <ListGroup.Item key={idx}>
                    {typeof file === "string" ? file.split("/").pop() : file.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )} */}
          </Form.Group>
<Form.Group className="mb-3">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <Form.Label className="mb-0 fw-semibold">Services</Form.Label>
  </div>

  {/* Service Items */}
  {(formData.services || []).map((service, index) => (
    <div key={index} className="border rounded p-4 mb-4 bg-light position-relative">
      {/* ❌ Remove Button - More spacing from top/right */}
      <Button
        variant="danger"
        size="sm"
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          padding: "0 8px",
          lineHeight: 1,
          fontSize: "1.2rem",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px"
        }}
        onClick={() => {
          const updated = [...formData.services];
          updated.splice(index, 1);
          setFormData({ ...formData, services: updated });
        }}
        disabled={saving}
      >
        ×
      </Button>

      {/* Row 1: Service Code, Service Name, Select Unit */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Form.Label className="small fw-semibold mb-2">
            Service Code <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            placeholder="Enter service code"
            value={service.service_code || ""}
            onChange={(e) => {
              const updated = [...formData.services];
              updated[index].service_code = e.target.value;
              setFormData({ ...formData, services: updated });
            }}
            required
          />
        </div>
        <div className="col-md-4">
          <Form.Label className="small fw-semibold mb-2">
            Service name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            placeholder="Enter service name"
            value={service.description || ""}
            onChange={(e) => {
              const updated = [...formData.services];
              updated[index].description = e.target.value;
              setFormData({ ...formData, services: updated });
            }}
            required
          />
        </div>
        <div className="col-md-4">
          <Form.Label className="small fw-semibold mb-2">
            Select Unit <span className="text-danger">*</span>
          </Form.Label>
          <CreatableSelect
            isSearchable
            isClearable
            options={units}
            isLoading={loadingUnits}
            placeholder="Select or type unit..."
            value={units.find((u) => u.value === service.unit_id) || null}
            onChange={async (selected) => {
              const updated = [...formData.services];
              if (selected && selected.__isNew__) {
                const response = await createUnit({ name: selected.value });
                const newUnit = response?.data || response;
                if (newUnit?.id) {
                  const option = { value: newUnit.id, label: newUnit.name };
                  setUnits((prev) => [...prev, option]);
                  updated[index].unit_id = newUnit.id;
                } else {
                  toast.error(response?.message || "Failed to create unit");
                }
              } else {
                updated[index].unit_id = selected ? selected.value : "";
              }
              setFormData({ ...formData, services: updated });
            }}
            required
          />
        </div>
      </div>

      {/* Row 2: Quantity and Rate */}
      <div className="row g-4">
        <div className="col-md-6">
          <Form.Label className="small fw-semibold mb-2">
            Quantity <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter quantity"
            value={service.quantity || ""}
            onChange={(e) => {
              const updated = [...formData.services];
              updated[index].quantity = e.target.value;
              setFormData({ ...formData, services: updated });
            }}
            required
            min="0"
            step="1"
          />
        </div>
        <div className="col-md-6">
          <Form.Label className="small fw-semibold mb-2">
            Unit Price <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter unit price"
            value={service.rate || ""}
            onChange={(e) => {
              const updated = [...formData.services];
              updated[index].rate = e.target.value;
              setFormData({ ...formData, services: updated });
            }}
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  ))}

  {/* Add Service Button */}
  <div className="d-flex justify-content-start mt-3">
    <Button
      variant="outline-success"
      size="sm"
      onClick={handleAddService}
      disabled={saving}
      className="px-4 py-2"
      style={{ borderRadius: "6px" }}
    >
      <i className="bi bi-plus-lg me-2"></i>
      Add Service
    </Button>
  </div>
</Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>

        {!isEditMode || (selectedWorkOrder && selectedWorkOrder.isDraft) ? (
          <Button
            variant="warning"
            onClick={() => {
              const drafts = JSON.parse(
                localStorage.getItem("woDrafts") || "[]"
              );
              const draftId = formData.id || `draft_${Date.now()}`; 
              const newDraft = { ...formData, id: draftId, isDraft: true };

              // Remove existing draft if same id, then overwrite
              const updatedDrafts = drafts.filter((d) => d.id !== draftId);
              updatedDrafts.push(newDraft);

              localStorage.setItem("woDrafts", JSON.stringify(updatedDrafts));
              toast.success("Draft saved locally!");
              if (typeof onDraftSaved === "function") onDraftSaved();
              onHide();
            }}
          >
            Save as Draft
          </Button>
        ) : null}

        <Button variant="success" onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{" "}
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkOrderModal;
