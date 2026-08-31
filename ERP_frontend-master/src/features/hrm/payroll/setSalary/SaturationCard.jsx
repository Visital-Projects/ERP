// // src/components/SaturationCard.jsx
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Button,
//   Table,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Spinner,
// } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";

// import saturationService from "../../../../services/saturationService";
// import deductionService from "../../../../services/deductionService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";
// const SaturationCard = ({ employeeId }) => {
//   const [deductions, setDeductions] = useState([]);
//   const [deductionOptions, setDeductionOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     id: null,
//     employee_id: employeeId || "",
//     deduction_option: "",
//     title: "",
//     amount: "",
//     type: "fixed",
//   });
//   const [saving, setSaving] = useState(false);
//   const [isClosingModal, setIsClosingModal] = useState(false);

//   // Fetch deductions & deduction options
//   useEffect(() => {
//     fetchDeductions();
//     fetchDeductionOptions();
//   }, [employeeId]);

//   const fetchDeductions = async () => {
//     setLoading(true);
//     try {
//       const data = employeeId
//         ? await saturationService.getSaturationsByEmployee(employeeId)
//         : await saturationService.getAllSaturations();
//       setDeductions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching deductions", err);
//       setDeductions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDeductionOptions = async () => {
//     try {
//       const data = await deductionService.getAllDeductions();
//       setDeductionOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching deduction options", err);
//     }
//   };

//   const handleShowModal = (deduction = null) => {
//     setFormData(
//       deduction
//         ? {
//             id: deduction.id,
//             employee_id: deduction.employee_id,
//             deduction_option: deduction.deduction_option,
//             title: deduction.title,
//             amount: deduction.amount,
//             type: deduction.type,
//           }
//         : {
//             id: null,
//             employee_id: employeeId || "",
//             deduction_option: "",
//             title: "",
//             amount: "",
//             type: "fixed",
//           }
//     );
//     setShowModal(true);
//   };

//   // const handleCloseModal = () => {
//   //   setShowModal(false);
//   //   setFormData({
//   //     id: null,
//   //     employee_id: employeeId || "",
//   //     deduction_option: "",
//   //     title: "",
//   //     amount: "",
//   //     type: "fixed",
//   //   });
//   // };

//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setFormData({
//         id: null,
//         employee_id: employeeId || "",
//         deduction_option: "",
//         title: "",
//         amount: "",
//         type: "fixed",
//       });
//     }, 700);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       if (formData.id) {
//         await saturationService.updateSaturation(formData.id, formData);
//         toast.success("Saturation successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await saturationService.createSaturation(formData);
//         toast.success("Saturation successfully created.", {
//           icon: false,
//         });
//       }
//       handleCloseModal();
//       fetchDeductions();
//     } catch (err) {
//       console.error("Error saving deduction", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (!window.confirm("Are you sure you want to delete this deduction?"))
//   //     return;
//   //   try {
//   //     await saturationService.deleteSaturation(id);
//   //     fetchDeductions();
//   //   } catch (err) {
//   //     console.error("Error deleting deduction", err);
//   //   }
//   // };
//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>

//           <div className="d-flex justify-content-center mt-3">
//             {/* Cancel Button */}
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>

//             {/* Confirm Button */}
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await saturationService.deleteSaturation(id); // ✅ delete deduction
//                   await fetchDeductions(); // ✅ refresh deductions
//                   toast.success("Saturation successfully deleted.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Error deleting deduction", err);
//                 }
//                 onClose(); // ✅ close modal
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const getDeductionOptionName = (optionId) => {
//     const option = deductionOptions.find((opt) => opt.id === optionId);
//     return option ? option.name : "-";
//   };

//   return (
//     <>
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
//       <Card
//         className="card p-3 pt-2 shadow-sm rounded-3"
//         style={{
//           overflowY: "scroll",
//           overflowX: "hidden",
//           height: "385px",
//           scrollbarWidth: "none", // Firefox
//           msOverflowStyle: "none",
//         }}
//       >
//         {/* <div className="d-flex justify-content-between align-items-center mb-2 card-header"> */}
//         <div
//           className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
//           style={{ position: "sticky", top: 0, }}
//         >
//           <h5 className="mb-0">Saturation Deductions</h5>
//           {/* <Button variant="success" onClick={() => handleShowModal()}>
//             <Plus />
//           </Button> */}
//           <OverlayTrigger
//             placement="top"
//             overlay={<Tooltip>Add Saturation Deduction</Tooltip>}
//           >
//             <Button variant="success" onClick={() => handleShowModal()}>
//               <Plus />
//             </Button>
//           </OverlayTrigger>
//         </div>

//         {/* {loading ? (
//           <div className="text-center py-3">
//             <Spinner animation="border" />
//           </div>
//         ) : deductions.length === 0 ? (
//           <p className="text-muted text-center mb-0">No deductions found.</p>
//         ) : ( */}
//           <div className="card-body mt-2">
//             <div
//               className="table-responsive"
//               style={{ maxHeight: "250px", overflowY: "auto" }}
//             >

//         {loading ? (
//           <div className="text-center py-5">
//             <Spinner animation="border" variant="success" />
//           </div>
//         ) : (
//               <Table striped hover>
//                 <thead>
//                   <tr>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Employee
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Deduction Option
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Title
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Amount
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Type
//                     </th>
//                     <th
//                       style={{
//                         position: "sticky",
//                         top: 0,
//                         zIndex: 2,
//                         width: "100px",
//                       }}
//                     >
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {deductions.length > 0 ? (
//                       deductions.map((ded) => (
//                         <tr key={ded.id}>
//                           <td>{ded.employee?.name || "-"}</td>
//                           {/* ✅ FIX: Show name instead of ID */}
//                           <td>{getDeductionOptionName(ded.deduction_option)}</td>
//                           <td>{ded.title}</td>
//                           <td>  ₹{ded.amount}</td>
//                           <td>{ded.type}</td>
//                           <td className="text-center">
//                             {/* <Button
//                               size="sm"
//                               variant="info"
//                               className="me-1"
//                               onClick={() => handleShowModal(ded)}
//                             >
//                               <PencilSquare />
//                             </Button> */}
//                             <OverlayTrigger
//                               placement="top"
//                               overlay={<Tooltip>Edit</Tooltip>}
//                             >
//                               <Button
//                                 size="sm"
//                                 variant="info"
//                                 className="me-1"
//                                 onClick={() => handleShowModal(ded)}
//                               >
//                                 {/* <PencilSquare /> */}
//                                 <i className="bi bi-pencil text-white"></i>

//                               </Button>
//                             </OverlayTrigger>
//                             {/* <Button
//                               size="sm"
//                               variant="danger"
//                               onClick={() => handleDelete(ded.id)}
//                             >
//                               <Trash />
//                             </Button> */}
//                             <OverlayTrigger
//                               placement="top"
//                               overlay={<Tooltip>Delete</Tooltip>}
//                             >
//                               <Button
//                                 size="sm"
//                                 variant="danger"
//                                 onClick={() => handleDelete(ded.id)}
//                               >
//                                 <Trash />
//                               </Button>
//                             </OverlayTrigger>
//                           </td>
//                         </tr>
//                       ))
//                     ):(
//                        <tr>
//                       <td colSpan="10" className="text-center">
//                         No Satusation found for this employee.
//                       </td>
//                     </tr>
//                     )}
//                 </tbody>
//               </Table>
//         )}
//             </div>
//           </div>

//         {/* Modal */}
//         <Modal
//           show={showModal}
//           onHide={handleCloseModal}
//           centered
//           className={`custom-slide-modal ${
//             isClosingModal ? "closing" : "open"
//           }`}
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>{formData.id ? "Edit" : "Add"} Deduction</Modal.Title>
//           </Modal.Header>
//           <Form onSubmit={handleSubmit}>
//             <Modal.Body>
//               <Row>
//                 {!employeeId && (
//                   <Col md={12}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Employee ID</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="employee_id"
//                         value={formData.employee_id}
//                         onChange={handleChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 )}

//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>
//                       Deduction Option <span className="text-danger">*</span>
//                     </Form.Label>
//                     <Form.Select
//                       name="deduction_option"
//                       value={formData.deduction_option}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="">Select Option</option>
//                       {deductionOptions.map((opt) => (
//                         <option key={opt.id} value={opt.id}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>

//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>
//                       Title <span className="text-danger">*</span>
//                     </Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="title"
//                       value={formData.title}
//                       onChange={handleChange}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>
//                       Amount <span className="text-danger">*</span>
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="amount"
//                       value={formData.amount}
//                       onChange={handleChange}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Type </Form.Label>
//                     <Form.Select
//                       name="type"
//                       value={formData.type}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="fixed">Fixed</option>
//                       <option value="percentage">Percentage</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="secondary" onClick={handleCloseModal}>
//                 Cancel
//               </Button>
//               <Button type="submit" variant="success" disabled={saving}>
//                 {saving ? "Saving..." : formData.id ? "Update" : "Create"}
//               </Button>
//             </Modal.Footer>
//           </Form>
//         </Modal>
//       </Card>
//     </>
//   );
// };

// export default SaturationCard;

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";

import saturationService from "../../../../services/saturationService";
import deductionService from "../../../../services/deductionService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const SaturationCard = ({ employeeId }) => {
  const [deductions, setDeductions] = useState([]);
  const [deductionOptions, setDeductionOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    employee_id: employeeId || "",
    deduction_option: "",
    title: "",
    amount: "",
    type: "fixed",
  });
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Fetch deductions & deduction options
  useEffect(() => {
    fetchDeductions();
    fetchDeductionOptions();
  }, [employeeId]);

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      const data = employeeId
        ? await saturationService.getSaturationsByEmployee(employeeId)
        : await saturationService.getAllSaturations();
      setDeductions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching deductions", err);
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeductionOptions = async () => {
    try {
      const data = await deductionService.getAllDeductions();
      setDeductionOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching deduction options", err);
    }
  };

  const handleShowModal = (deduction = null) => {
    setFormData(
      deduction
        ? {
            id: deduction.id,
            employee_id: deduction.employee_id,
            deduction_option: deduction.deduction_option,
            title: deduction.title,
            amount: deduction.amount,
            type: deduction.type,
          }
        : {
            id: null,
            employee_id: employeeId || "",
            deduction_option: "",
            title: "",
            amount: "",
            type: "fixed",
          }
    );
    setShowModal(true);
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  //   setFormData({
  //     id: null,
  //     employee_id: employeeId || "",
  //     deduction_option: "",
  //     title: "",
  //     amount: "",
  //     type: "fixed",
  //   });
  // };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setFormData({
        id: null,
        employee_id: employeeId || "",
        deduction_option: "",
        title: "",
        amount: "",
        type: "fixed",
      });
    }, 700);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ If deduction option changes
    if (name === "deduction_option") {
      const selectedOption = deductionOptions.find(
        (opt) => opt.id === Number(value)
      );

      setFormData((prev) => ({
        ...prev,
        deduction_option: value,
        title: selectedOption ? selectedOption.name : "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.id) {
        await saturationService.updateSaturation(formData.id, formData);
        toast.success("Saturation successfully updated.", {
          icon: false,
        });
      } else {
        await saturationService.createSaturation(formData);
        toast.success("Saturation successfully created.", {
          icon: false,
        });
      }
      handleCloseModal();
      fetchDeductions();
    } catch (err) {
      console.error("Error saving deduction", err);
    } finally {
      setSaving(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this deduction?"))
  //     return;
  //   try {
  //     await saturationService.deleteSaturation(id);
  //     fetchDeductions();
  //   } catch (err) {
  //     console.error("Error deleting deduction", err);
  //   }
  // };
  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>

          <div className="d-flex justify-content-center mt-3">
            {/* Cancel Button */}
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>

            {/* Confirm Button */}
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await saturationService.deleteSaturation(id); // ✅ delete deduction
                  await fetchDeductions(); // ✅ refresh deductions
                  toast.success("Saturation successfully deleted.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Error deleting deduction", err);
                }
                onClose(); // ✅ close modal
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const getDeductionOptionName = (optionId) => {
    const option = deductionOptions.find((opt) => opt.id === optionId);
    return option ? option.name : "-";
  };

  return (
    <>
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
      <Card
        className="card p-3 pt-2 shadow-sm rounded-3"
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          height: "385px",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none",
        }}
      >
        {/* <div className="d-flex justify-content-between align-items-center mb-2 card-header"> */}
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0 }}
        >
          <h5 className="mb-0">Saturation Deductions</h5>
          {/* <Button variant="success" onClick={() => handleShowModal()}>
            <Plus />
          </Button> */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Add Saturation Deduction</Tooltip>}
          >
            <Button variant="success" onClick={() => handleShowModal()}>
              <Plus />
            </Button>
          </OverlayTrigger>
        </div>

        {/* {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" />
          </div>
        ) : deductions.length === 0 ? (
          <p className="text-muted text-center mb-0">No deductions found.</p>
        ) : ( */}
        <div className="card-body mt-2">
          <div
            className="table-responsive"
            style={{ maxHeight: "250px", overflowY: "auto" }}
          >
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : (
              <Table striped hover>
                <thead>
                  <tr>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Employee
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Deduction Option
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Title
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Amount
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      Type
                    </th>
                    <th
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        width: "100px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.length > 0 ? (
                    deductions.map((ded) => (
                      <tr key={ded.id}>
                        <td>{ded.employee?.name || "-"}</td>
                        {/* ✅ FIX: Show name instead of ID */}
                        <td>{getDeductionOptionName(ded.deduction_option)}</td>
                        <td>{ded.title}</td>
                        <td> ₹{ded.amount}</td>
                        <td>{ded.type}</td>
                        <td className="text-center">
                          {/* <Button
                              size="sm"
                              variant="info"
                              className="me-1"
                              onClick={() => handleShowModal(ded)}
                            >
                              <PencilSquare />
                            </Button> */}
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="info"
                              className="me-1"
                              onClick={() => handleShowModal(ded)}
                            >
                              {/* <PencilSquare /> */}
                              <i className="bi bi-pencil text-white"></i>
                            </Button>
                          </OverlayTrigger>
                          {/* <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(ded.id)}
                            >
                              <Trash />
                            </Button> */}
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(ded.id)}
                            >
                              <Trash />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No Satusation found for this employee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          className={`custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>{formData.id ? "Edit" : "Add"} Deduction</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                {!employeeId && (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control
                        type="number"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Deduction Option <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="deduction_option"
                      value={formData.deduction_option}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Option</option>
                      {deductionOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={!!formData.deduction_option}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Amount <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type </Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? "Saving..." : formData.id ? "Update" : "Create"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card>
    </>
  );
};

export default SaturationCard;
