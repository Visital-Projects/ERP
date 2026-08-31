// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import apiClient from "../../../../services/apiClient";
// import allowanceService from "../../../../services/allowanceService";
// import allowanceTypeService from "../../../../services/allowanceTypeService";

// const AllowanceModal = ({
//   show,
//   onHide,
//   allowance,
//   employeeId,
//   createdBy,
//   onSave,
// }) => {
//   const [allowanceOption, setAllowanceOption] = useState(
//     allowance?.allowance_option || ""
//   );
//   const [title, setTitle] = useState(allowance?.title || "");
//   const [type, setType] = useState(allowance?.type || "Fixed");
//   const [amount, setAmount] = useState(allowance?.amount || "");
//   const [newAllowanceOption, setNewAllowanceOption] = useState("");
//   const [loadingOption, setLoadingOption] = useState(false);
//   const [options, setOptions] = useState([]);

//   useEffect(() => {
//     fetchOptions();
//   }, []);

//   const fetchOptions = async () => {
//     try {
//       const res = await apiClient.get("/allowance-options");
//       setOptions(res.data);
//     } catch (err) {
//       console.error("Error fetching allowance options", err);
//     }
//   };

//   const createOption = async () => {
//     if (!newAllowanceOption.trim()) {
//       alert("Enter allowance option name");
//       return;
//     }
//     setLoadingOption(true);
//     try {
//       await apiClient.post("/allowance-options", { name: newAllowanceOption });
//       alert("Allowance option created");
//       setNewAllowanceOption("");
//       fetchOptions();
//     } catch (err) {
//       console.error("Error creating allowance option", err);
//       alert("Failed to create option");
//     } finally {
//       setLoadingOption(false);
//     }
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         employee_id: Number(employeeId),
//         title,
//         amount,
//         allowance_option: allowanceOption,
//         type,
//         created_by: createdBy || 1,
//       };

//       if (allowance) {
//         await allowanceService.updateAllowance(allowance.id, payload);
//       } else {
//         await allowanceService.createAllowance(payload);
//       }

//       onSave();
//       onHide();
//       alert(allowance ? "Allowance updated" : "Allowance added");
//     } catch (err) {
//       console.error("Failed to save allowance", err);
//       alert("Error saving allowance");
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {allowance ? "Edit Allowance" : "Add Allowance"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={handleSave}>
//           <Form.Group className="mb-3">
//             <Form.Label>Allowance Option</Form.Label>
//             <Form.Select
//               value={allowanceOption}
//               onChange={(e) => setAllowanceOption(e.target.value)}
//               required
//             >
//               <option value="">Select allowance option</option>
//               {options.map((opt) => (
//                 <option key={opt.id} value={opt.name}>
//                   {opt.name}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Create new allowance option</Form.Label>
//             <div className="d-flex">
//               <Form.Control
//                 type="text"
//                 placeholder="Enter new option"
//                 value={newAllowanceOption}
//                 onChange={(e) => setNewAllowanceOption(e.target.value)}
//               />
//               <Button
//                 variant="primary"
//                 onClick={createOption}
//                 disabled={loadingOption}
//                 className="ms-2"
//               >
//                 {loadingOption ? "Creating..." : "Create"}
//               </Button>
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Title</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Type</Form.Label>
//             <Form.Select
//               value={type}
//               onChange={(e) => setType(e.target.value)}
//               required
//             >
//               <option value="Fixed">Fixed</option>
//               <option value="Percentage">Percentage</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Amount</Form.Label>
//             <Form.Control
//               type="number"
//               min={0}
//               step={100}
//               placeholder="Enter amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               required
//             />
//           </Form.Group>

//           <div className="d-flex justify-content-end">
//             <Button variant="secondary" onClick={onHide} className="me-2">
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit">
//               {allowance ? "Update" : "Save"}
//             </Button>
//           </div>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AllowanceModal;

// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import allowanceService from "../../../../services/allowanceService";
// import allowanceTypeService from "../../../../services/allowanceTypeService";

// const AllowanceModal = ({
//   show,
//   onHide,
//   allowance,
//   employeeId,
//   employeeName,
//   createdBy,
//   onSave,
// }) => {
//   const [formData, setFormData] = useState({
//     allowance_option: "",
//     title: "",
//     type: "Fixed",
//     amount: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [options, setOptions] = useState([]);
//   const [loadingOptions, setLoadingOptions] = useState(false);

//   // Reset form data when allowance prop changes (for edit mode)
//   useEffect(() => {
//     if (allowance) {
//       setFormData({
//         allowance_option: allowance.allowance_option || "",
//         title: allowance.title || "",
//         type: allowance.type || "Fixed",
//         amount: allowance.amount || "",
//       });
//     } else {
//       setFormData({
//         allowance_option: "",
//         title: "",
//         type: "Fixed",
//         amount: "",
//       });
//     }
//   }, [allowance, show]);

//   useEffect(() => {
//     if (show) {
//       fetchOptions();
//     }
//   }, [show]);

//   const fetchOptions = async () => {
//     try {
//       setLoadingOptions(true);
//       const data = await allowanceTypeService.getAllAllowanceOptions();
//       setOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching allowance options", err);
//       setOptions([]);
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!formData.title || !formData.amount || !formData.allowance_option) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setSaving(true);
//       const payload = {
//         employee_id: Number(employeeId),
//         title: formData.title,
//         amount: Number(formData.amount),
//         allowance_option: formData.allowance_option,
//         type: formData.type,
//         created_by: createdBy || 1,
//       };

//       if (allowance && allowance.id) {
//         // Update existing allowance
//         await allowanceService.updateAllowance(allowance.id, payload);
//       } else {
//         // Create new allowance
//         await allowanceService.createAllowance(payload);
//       }

//       onSave();
//       onHide();
//     } catch (err) {
//       console.error("Failed to save allowance", err);
//       alert(
//         "Error saving allowance: " +
//           (err.response?.data?.message || err.message)
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {allowance ? "Edit Allowance" : "Create Allowance"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={handleSave}>
//           <Form.Group className="mb-3">
//             <Form.Label>Allowance Options *</Form.Label>
//             {loadingOptions ? (
//               <Spinner animation="border" size="sm" />
//             ) : (
//               <Form.Select
//                 name="allowance_option"
//                 value={formData.allowance_option}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Option</option>
//                 {options.map((opt) => (
//                   <option key={opt.id} value={opt.name}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             )}
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Type *</Form.Label>
//             <Form.Select
//               name="type"
//               value={formData.type}
//               onChange={handleChange}
//               required
//             >
//               <option value="Fixed">Fixed</option>
//               <option value="Percentage">Percentage</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Title *</Form.Label>
//             <Form.Control
//               type="text"
//               name="title"
//               placeholder="Enter Title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Amount *</Form.Label>
//             <Form.Control
//               type="number"
//               name="amount"
//               min={0}
//               step={0.01}
//               placeholder="Enter Amount"
//               value={formData.amount}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <div className="d-flex justify-content-end">
//             <Button variant="secondary" onClick={onHide} className="me-2">
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit" disabled={saving}>
//               {saving ? (
//                 <Spinner size="sm" animation="border" />
//               ) : allowance ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </div>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AllowanceModal;

// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import allowanceService from "../../../../services/allowanceService";
// import allowanceTypeService from "../../../../services/allowanceTypeService";

// const AllowanceModal = ({
//   show,
//   onHide,
//   allowance,
//   employeeId,
//   employeeName,
//   createdBy,
//   onSave,
// }) => {
//   const [formData, setFormData] = useState({
//     allowance_option: "",
//     title: "",
//     type: "Fixed",
//     amount: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [options, setOptions] = useState([]);
//   const [loadingOptions, setLoadingOptions] = useState(false);

//   // Reset form data when allowance prop changes (for edit mode)
//   useEffect(() => {
//     if (allowance) {
//       setFormData({
//         allowance_option: allowance.allowance_option || "", // Use the name for display
//         title: allowance.title || "",
//         type: allowance.type || "Fixed",
//         amount: allowance.amount || "",
//       });
//     } else {
//       setFormData({
//         allowance_option: "",
//         title: "",
//         type: "Fixed",
//         amount: "",
//       });
//     }
//   }, [allowance, show]);

//   useEffect(() => {
//     if (show) {
//       fetchOptions();
//     }
//   }, [show]);

//   const fetchOptions = async () => {
//     try {
//       setLoadingOptions(true);
//       const data = await allowanceTypeService.getAllAllowanceOptions();
//       setOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching allowance options", err);
//       setOptions([]);
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!formData.title || !formData.amount || !formData.allowance_option) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setSaving(true);

//       // Find the selected option to get its ID
//       const selectedOption = options.find(
//         (opt) => opt.name === formData.allowance_option
//       );

//       const payload = {
//         employee_id: Number(employeeId),
//         title: formData.title,
//         amount: Number(formData.amount),
//         allowance_option: selectedOption
//           ? selectedOption.name
//           : formData.allowance_option,
//         type: formData.type,
//         created_by: createdBy || 1,
//       };

//       if (allowance && allowance.id) {
//         // Update existing allowance
//         await allowanceService.updateAllowance(allowance.id, payload);
//       } else {
//         // Create new allowance
//         await allowanceService.createAllowance(payload);
//       }

//       onSave();
//       onHide();
//     } catch (err) {
//       console.error("Failed to save allowance", err);
//       alert(
//         "Error saving allowance: " +
//           (err.response?.data?.message || err.message)
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {allowance ? "Edit Allowance" : "Create Allowance"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={handleSave}>
//           <Form.Group className="mb-3">
//             <Form.Label>Allowance Options *</Form.Label>
//             {loadingOptions ? (
//               <Spinner animation="border" size="sm" />
//             ) : (
//               <Form.Select
//                 name="allowance_option"
//                 value={formData.allowance_option}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Option</option>
//                 {options.map((opt) => (
//                   <option key={opt.id} value={opt.name}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             )}
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Type *</Form.Label>
//             <Form.Select
//               name="type"
//               value={formData.type}
//               onChange={handleChange}
//               required
//             >
//               <option value="Fixed">Fixed</option>
//               <option value="Percentage">Percentage</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Title *</Form.Label>
//             <Form.Control
//               type="text"
//               name="title"
//               placeholder="Enter Title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Amount *</Form.Label>
//             <Form.Control
//               type="number"
//               name="amount"
//               min={0}
//               step={0.01}
//               placeholder="Enter Amount"
//               value={formData.amount}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <div className="d-flex justify-content-end">
//             <Button variant="secondary" onClick={onHide} className="me-2">
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit" disabled={saving}>
//               {saving ? (
//                 <Spinner size="sm" animation="border" />
//               ) : allowance ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </div>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AllowanceModal;

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import allowanceService from "../../../../services/allowanceService";
import allowanceTypeService from "../../../../services/allowanceTypeService";

const AllowanceModal = ({
  show,
  onHide,
  allowance,
  employeeId,
  employeeName,
  createdBy,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    allowance_option: "",
    title: "",
    type: "Fixed",
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false); // ✅ animation state

  // Reset form data when allowance prop changes (for edit mode)
  useEffect(() => {
    if (allowance) {
      setFormData({
        allowance_option: allowance.allowance_option || "",
        title: allowance.title || "",
        type: allowance.type || "Fixed",
        amount: allowance.amount || "",
      });
    } else {
      setFormData({
        allowance_option: "",
        title: "",
        type: "Fixed",
        amount: "",
      });
    }
  }, [allowance, show]);

  useEffect(() => {
    if (show) {
      fetchOptions();
    }
  }, [show]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const data = await allowanceTypeService.getAllAllowanceOptions();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching allowance options", err);
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSave = async (e) => {
  //   e.preventDefault();

  //   if (!formData.title || !formData.amount || !formData.allowance_option) {
  //     alert("Please fill all required fields");
  //     return;
  //   }

  //   try {
  //     setSaving(true);

  //     const payload = {
  //       employee_id: Number(employeeId),
  //       title: formData.title,
  //       amount: Number(formData.amount),
  //       allowance_option: formData.allowance_option, // Use the selected option name directly
  //       type: formData.type,
  //       created_by: createdBy || 1,
  //     };

  //     if (allowance && allowance.id) {
  //       // Update existing allowance
  //       await allowanceService.updateAllowance(allowance.id, payload);
  //     } else {
  //       // Create new allowance
  //       await allowanceService.createAllowance(payload);
  //     }

  //     onSave();
  //     onHide();
  //   } catch (err) {
  //     console.error("Failed to save allowance", err);
  //     alert(
  //       "Error saving allowance: " +
  //         (err.response?.data?.message || err.message)
  //     );
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.allowance_option) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const selectedOption = options.find(
        (opt) => opt.name === formData.allowance_option
      );

      const payload = {
        employee_id: Number(employeeId),
        title: formData.title,
        amount: Number(formData.amount),
        allowance_option: selectedOption
          ? selectedOption.name
          : formData.allowance_option,
        type: formData.type,
        created_by: createdBy || 1,
      };

      let savedAllowance;
      if (allowance && allowance.id) {
        savedAllowance = await allowanceService.updateAllowance(
          allowance.id,
          payload
        );
      } else {
        savedAllowance = await allowanceService.createAllowance(payload);
      }

      onSave(savedAllowance); // ✅ Pass back to parent
      onHide();
    } catch (err) {
      console.error("Failed to save allowance", err);
      alert(
        "Error saving allowance: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ animated close function
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      onHide();
      setIsClosingModal(false);
    }, 700);
  };

  return (
    <>
      {/* ✅ Modal Animation Styles */}
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
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {allowance ? "Edit Allowance" : "Create Allowance"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>
                Allowance Options <span className="text-danger">*</span>{" "}
              </Form.Label>
              {loadingOptions ? (
                <Spinner animation="border" size="sm" variant="success" />
              ) : (
                <Form.Select
                  name="allowance_option"
                  value={formData.allowance_option}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Option</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type </Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Fixed">Fixed</option>
                <option value="Percentage">Percentage</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="amount"
                min={0}
                step={0.01}
                placeholder="Enter Amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="success" type="submit" disabled={saving}>
                {saving ? (
                  <Spinner size="sm" animation="border" />
                ) : allowance ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AllowanceModal;
