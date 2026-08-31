// import React, { useEffect, useState } from "react";
// import { Table, Button, Spinner, Modal, Form, Alert } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import {
//   getCommissionsByEmployee,
//   deleteCommission,
//   createCommission,
// } from "../../../../services/commissionService";

// const CommissionCard = ({ employeeId, employeeName }) => {
//   const [commissions, setCommissions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [newCommission, setNewCommission] = useState({
//     title: "",
//     type: "fixed",
//     amount: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [editingCommission, setEditingCommission] = useState(null); // 🔑 NEW

//   // Fetch commissions
//   const fetchCommissions = async () => {
//     if (!employeeId) {
//       setCommissions([]);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getCommissionsByEmployee(employeeId);
//       setCommissions(data || []);
//     } catch (err) {
//       console.error("Error fetching commissions:", err);
//       setError("Failed to fetch commissions");
//       setCommissions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this commission?")) {
//       try {
//         await deleteCommission(id);
//         setCommissions((prev) => prev.filter((c) => c.id !== id));
//       } catch (err) {
//         console.error("Error deleting commission:", err);
//         alert("Failed to delete commission");
//       }
//     }
//   };

//   const handleAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingCommission(null); // reset edit mode
//     setNewCommission({ title: "", type: "fixed", amount: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (commission) => {
//     setEditingCommission(commission); // mark edit mode
//     setNewCommission({
//       title: commission.title,
//       type: commission.type,
//       amount: commission.amount,
//     });
//     setShowModal(true);
//   };

//   const handleModalClose = () => {
//     setShowModal(false);
//     setEditingCommission(null); // reset edit state
//     setNewCommission({ title: "", type: "fixed", amount: "" });
//   };

//   const handleModalSubmit = async () => {
//     if (!newCommission.title || !newCommission.amount) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editingCommission) {
//         // 🔑 UPDATE locally (replace this with API later)
//         setCommissions((prev) =>
//           prev.map((c) =>
//             c.id === editingCommission.id
//               ? { ...c, ...newCommission, amount: Number(newCommission.amount) }
//               : c
//           )
//         );
//       } else {
//         // ✅ CREATE (your existing logic)
//         await createCommission({
//           employee_id: employeeId,
//           title: newCommission.title,
//           type: newCommission.type,
//           amount: Number(newCommission.amount),
//         });
//         await fetchCommissions();
//       }

//       handleModalClose();
//     } catch (err) {
//       console.error("Error saving commission:", err.response?.data || err);
//       alert("Failed to save commission");
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     fetchCommissions();
//   }, [employeeId]);

//   if (loading) return <Spinner animation="border" />;

//   return (
//     <div className="commission-card p-3 bg-white rounded shadow-sm">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="mb-0">Commission </h5>
//         <Button variant="success" onClick={handleAdd} disabled={!employeeId}>
//           <Plus />
//         </Button>
//       </div>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>EMPLOYEE NAME</th>
//             <th>TITLE</th>
//             <th>TYPE</th>
//             <th>AMOUNT</th>
//             <th>ACTIONS</th>
//           </tr>
//         </thead>
//         <tbody>
//           {commissions.length > 0 ? (
//             commissions.map((c) => (
//               <tr key={c.id}>
//                 <td>{c.employee?.name || employeeName}</td>
//                 <td>{c.title}</td>
//                 <td>{c.type}</td>
//                 <td>₹{c.amount}</td>
//                 <td>
//                   <Button
//                     size="sm"
//                     variant="info"
//                     className="me-2"
//                     onClick={() => handleEdit(c)} // 🔑 open edit modal
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="danger"
//                     onClick={() => handleDelete(c.id)}
//                   >
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5" className="text-center">
//                 {employeeId
//                   ? "No commissions found for this employee"
//                   : "No employee selected"}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </Table>

//       {/* Modal for add/edit commission */}
//       <Modal show={showModal} onHide={handleModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingCommission ? "Edit Commission" : "Add Commission"} for{" "}
//             {employeeName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Title *</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newCommission.title}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, title: e.target.value })
//                 }
//                 placeholder="Enter commission title"
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 value={newCommission.type}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, type: e.target.value })
//                 }
//               >
//                 <option value="fixed">Fixed</option>
//                 <option value="percentage">Percentage</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Amount *</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={newCommission.amount}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, amount: e.target.value })
//                 }
//                 placeholder="Enter amount"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleModalClose}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleModalSubmit}
//             disabled={saving}
//           >
//             {saving
//               ? editingCommission
//                 ? "Updating..."
//                 : "Saving..."
//               : editingCommission
//               ? "Update Commission"
//               : "Save Commission"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default CommissionCard;

// import React, { useEffect, useState } from "react";
// import { Table, Button, Spinner, Modal, Form, Alert } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import {
//   getCommissionsByEmployee,
//   deleteCommission,
//   createCommission,
//   updateCommission, // ✅ IMPORTED
// } from "../../../../services/commissionService";

// const CommissionCard = ({ employeeId, employeeName }) => {
//   const [commissions, setCommissions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [newCommission, setNewCommission] = useState({
//     title: "",
//     type: "fixed",
//     amount: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [editingCommission, setEditingCommission] = useState(null);

//   // Fetch commissions from backend
//   const fetchCommissions = async () => {
//     if (!employeeId) {
//       setCommissions([]);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getCommissionsByEmployee(employeeId);
//       setCommissions(data || []);
//     } catch (err) {
//       console.error("Error fetching commissions:", err);

//       setCommissions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this commission?")) {
//       try {
//         await deleteCommission(id);
//         await fetchCommissions(); // ✅ refetch after delete
//       } catch (err) {
//         console.error("Error deleting commission:", err);
//         alert("Failed to delete commission");
//       }
//     }
//   };

//   const handleAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingCommission(null);
//     setNewCommission({ title: "", type: "fixed", amount: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (commission) => {
//     setEditingCommission(commission);
//     setNewCommission({
//       title: commission.title,
//       type: commission.type,
//       amount: commission.amount,
//     });
//     setShowModal(true);
//   };

//   const handleModalClose = () => {
//     setShowModal(false);
//     setEditingCommission(null);
//     setNewCommission({ title: "", type: "fixed", amount: "" });
//   };

//   const handleModalSubmit = async () => {
//     if (!newCommission.title || !newCommission.amount) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editingCommission) {
//         // ✅ CALL API to update commission
//         await updateCommission(editingCommission.id, {
//           title: newCommission.title,
//           type: newCommission.type,
//           amount: Number(newCommission.amount),
//         });
//       } else {
//         // ✅ CREATE new commission
//         await createCommission({
//           employee_id: employeeId,
//           title: newCommission.title,
//           type: newCommission.type,
//           amount: Number(newCommission.amount),
//         });
//       }

//       await fetchCommissions(); // ✅ Always refetch to sync UI
//       handleModalClose();
//     } catch (err) {
//       console.error("Error saving commission:", err.response?.data || err);
//       alert("Failed to save commission");
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     fetchCommissions();
//   }, [employeeId]);

//   if (loading) return <Spinner animation="border" />;

//   return (
//     <div
//       className="commission-card p-3 bg-white rounded shadow-sm "
//       style={{ overflowY: "scroll", overflowX: "hidden", height: "340px" }}
//     >
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="mb-0">Commission</h5>
//         <Button variant="success" onClick={handleAdd} disabled={!employeeId}>
//           <Plus />
//         </Button>
//       </div>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Table striped bordered hover responsive table-striped>
//         <thead>
//           <tr>
//             <th>EMPLOYEE NAME</th>
//             <th>TITLE</th>
//             <th>TYPE</th>
//             <th>AMOUNT</th>
//             <th>ACTIONS</th>
//           </tr>
//         </thead>
//         <tbody>
//           {commissions.length > 0 ? (
//             commissions.map((c) => (
//               <tr key={c.id}>
//                 <td>{c.employee?.name || employeeName}</td>
//                 <td>{c.title}</td>
//                 <td>{c.type}</td>
//                 <td>₹{c.amount}</td>
//                 <td>
//                   <Button
//                     size="sm"
//                     variant="info"
//                     className="me-2"
//                     onClick={() => handleEdit(c)}
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="danger"
//                     onClick={() => handleDelete(c.id)}
//                   >
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5" className="text-center">
//                 {employeeId
//                   ? "No commissions found for this employee"
//                   : "No employee selected"}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </Table>

//       {/* Add/Edit Modal */}
//       <Modal show={showModal} onHide={handleModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingCommission ? "Edit Commission" : "Add Commission"} for{" "}
//             {employeeName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Title *</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newCommission.title}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, title: e.target.value })
//                 }
//                 placeholder="Enter commission title"
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 value={newCommission.type}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, type: e.target.value })
//                 }
//               >
//                 <option value="fixed">Fixed</option>
//                 <option value="percentage">Percentage</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Amount *</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={newCommission.amount}
//                 onChange={(e) =>
//                   setNewCommission({ ...newCommission, amount: e.target.value })
//                 }
//                 placeholder="Enter amount"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleModalClose}>
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={handleModalSubmit}
//             disabled={saving}
//           >
//             {saving
//               ? editingCommission
//                 ? "Updating..."
//                 : "Saving..."
//               : editingCommission
//               ? "Update "
//               : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default CommissionCard;

// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Spinner,
//   Modal,
//   Form,
//   Alert,
//   Card,
// } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import {
//   getCommissionsByEmployee,
//   deleteCommission,
//   createCommission,
//   updateCommission, // ✅ IMPORTED
// } from "../../../../services/commissionService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";

// const CommissionCard = ({ employeeId, employeeName }) => {
//   const [commissions, setCommissions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});

//   const [newCommission, setNewCommission] = useState({
//     title: "",
//     type: "fixed",
//     amount: "",
//   });

//   const [saving, setSaving] = useState(false);
//   const [editingCommission, setEditingCommission] = useState(null);
//   const [isClosingModal, setIsClosingModal] = useState(false);

//   // Fetch commissions from backend
//   const fetchCommissions = async () => {
//     if (!employeeId) {
//       setCommissions([]);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getCommissionsByEmployee(employeeId);
//       setCommissions(data || []);
//     } catch (err) {
//       console.error("Error fetching commissions:", err);

//       setCommissions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this commission?")) {
//   //     try {
//   //       await deleteCommission(id);
//   //       await fetchCommissions(); // ✅ refetch after delete
//   //     } catch (err) {
//   //       console.error("Error deleting commission:", err);
//   //       alert("Failed to delete commission");
//   //     }
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
//             {/* Cancel button */}
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>

//             {/* Confirm button */}
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteCommission(id); // ✅ call commission delete API
//                   await fetchCommissions(); // ✅ refresh commission list
//                   toast.success("Commission successfully deleted.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Error deleting commission:", err);
//                   // alert("Failed to delete commission");
//                 }
//                 onClose(); // close modal
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleAdd = () => {
//     if (!employeeId) {
//       alert("Please select an employee first");
//       return;
//     }
//     setEditingCommission(null);
//     setNewCommission({ title: "", type: "fixed", amount: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (commission) => {
//     setEditingCommission(commission);
//     setNewCommission({
//       title: commission.title,
//       type: commission.type,
//       amount: commission.amount,
//     });
//     setShowModal(true);
//   };

//   // const handleModalClose = () => {
//   //   setShowModal(false);
//   //   setEditingCommission(null);
//   //   setNewCommission({ title: "", type: "fixed", amount: "" });
//   // };

//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setIsClosingModal(false);
//       setShowModal(false); // keep existing functionality
//       setEditingCommission(null);
//       setNewCommission({ title: "", type: "fixed", amount: "" });
//     }, 700);
//   };

//   // const handleModalSubmit = async () => {
//   //   if (!newCommission.title || !newCommission.amount) {
//   //     alert("Please fill all required fields");
//   //     return;
//   //   }

//   //   setSaving(true);
//   //   try {
//   //     if (editingCommission) {
//   //       // ✅ CALL API to update commission
//   //       await updateCommission(editingCommission.id, {
//   //         title: newCommission.title,
//   //         type: newCommission.type,
//   //         amount: Number(newCommission.amount),
//   //       });
//   //        toast.success("Commission successfully updated.", { icon: false });
//   //     } else {
//   //       // ✅ CREATE new commission
//   //       await createCommission({
//   //         employee_id: employeeId,
//   //         title: newCommission.title,
//   //         type: newCommission.type,
//   //         amount: Number(newCommission.amount),
//   //       });
//   //       toast.success("Commission successfully created.", { icon: false });
//   //     }

//   //     // await fetchCommissions();
//   //     // handleModalClose();
//   //     handleCloseModal();
//   //     setTimeout(() => {
//   //       fetchCommissions();
//   //     }, 700);
//   //   } catch (err) {
//   //     console.error("Error saving commission:", err.response?.data || err);
//   //     alert("Failed to save commission");
//   //   } finally {
//   //     setSaving(false);
//   //   }
//   // };

//   const handleModalSubmit = async () => {
//     const errors = {};
//     if (!newCommission.title.trim()) errors.title = "Title is required";
//     if (!newCommission.amount.trim()) errors.amount = "Amount is required";

//     setValidationErrors(errors);

//     if (Object.keys(errors).length > 0) return; // stop if validation fails

//     setSaving(true);
//     try {
//       if (editingCommission) {
//         await updateCommission(editingCommission.id, {
//           title: newCommission.title,
//           type: newCommission.type,
//           amount: Number(newCommission.amount),
//         });
//         toast.success("Commission successfully updated.", { icon: false });
//       } else {
//         await createCommission({
//           employee_id: employeeId,
//           title: newCommission.title,
//           type: newCommission.type,
//           amount: Number(newCommission.amount),
//         });
//         toast.success("Commission successfully created.", { icon: false });
//       }

//       handleCloseModal();
//       setTimeout(() => fetchCommissions(), 700);
//     } catch (err) {
//       console.error("Error saving commission:", err);
//       toast.error("Failed to save commission");
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     fetchCommissions();
//   }, [employeeId]);

//   if (loading) return <Spinner animation="border" />;

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
//         <div
//           className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
//           style={{ position: "sticky", top: 0, zIndex: 2 }}
//         >
//           <h5 className="mb-0">Commission</h5>
//           {/* <Button variant="success" onClick={handleAdd} disabled={!employeeId}>
//           <Plus />
//         </Button> */}
//           <OverlayTrigger
//             placement="top"
//             overlay={<Tooltip>Add Commission</Tooltip>}
//           >
//             <Button
//               variant="success"
//               onClick={handleAdd}
//               disabled={!employeeId}
//             >
//               <Plus />
//             </Button>
//           </OverlayTrigger>
//         </div>

//         {error && <Alert variant="danger">{error}</Alert>}
//         <div className="card-body mt-2">
//           <div
//             className="table-responsive"
//             style={{ maxHeight: "250px", overflowY: "auto" }}
//           >
//             <Table striped hover>
//               <thead>
//                 <tr>
//                   <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                     EMPLOYEE NAME
//                   </th>
//                   <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                     TITLE
//                   </th>
//                   <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                     TYPE
//                   </th>
//                   <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                     AMOUNT
//                   </th>
//                   <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                     ACTIONS
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {commissions.length > 0 ? (
//                   commissions.map((c) => (
//                     <tr key={c.id}>
//                       <td>{c.employee?.name || employeeName}</td>
//                       <td>{c.title}</td>
//                       <td>{c.type}</td>
//                       <td>₹{c.amount}</td>
//                       <td>
//                         {/* <Button
//                         size="sm"
//                         variant="info"
//                         className="me-2"
//                         onClick={() => handleEdit(c)}
//                       >
//                         <PencilSquare />
//                       </Button> */}
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <Button
//                             size="sm"
//                             variant="info"
//                             className="me-2"
//                             onClick={() => handleEdit(c)}
//                           >
//                             <PencilSquare />
//                           </Button>
//                         </OverlayTrigger>
//                         {/* <Button
//                         size="sm"
//                         variant="danger"
//                         onClick={() => handleDelete(c.id)}
//                       >
//                         <Trash />
//                       </Button> */}
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <Button
//                             size="sm"
//                             variant="danger"
//                             onClick={() => handleDelete(c.id)}
//                           >
//                             <Trash />
//                           </Button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center">
//                       {employeeId
//                         ? "No commissions found for this employee"
//                         : "No employee selected"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           </div>
//         </div>

//         {/* Add/Edit Modal */}
//       <Modal
//   show={showModal}
//   onHide={handleCloseModal}
//   centered
//   className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//   style={{ overflowY: "auto", scrollbarWidth: "none" }}
// >
//   <Modal.Header closeButton>
//     <Modal.Title>
//       {editingCommission ? "Edit Commission" : "Add Commission"} for{" "}
//       {employeeName}
//     </Modal.Title>
//   </Modal.Header>

//   <Modal.Body>
//     <Form>
//       {/* Title Field */}
//       <Form.Group className="mb-2">
//         <Form.Label>
//           Title <span className="text-danger">*</span>
//         </Form.Label>
//         <Form.Control
//           type="text"
//           value={newCommission.title}
//           onChange={(e) => {
//             setNewCommission({ ...newCommission, title: e.target.value });
//             setValidationErrors({ ...validationErrors, title: "" });
//           }}
//           placeholder="Enter commission title"
//           isInvalid={!!validationErrors.title}
//         />
//         <Form.Control.Feedback type="invalid">
//           {validationErrors.title}
//         </Form.Control.Feedback>
//       </Form.Group>

//       {/* Type Field */}
//       <Form.Group className="mb-2">
//         <Form.Label>Type</Form.Label>
//         <Form.Select
//           value={newCommission.type}
//           onChange={(e) =>
//             setNewCommission({ ...newCommission, type: e.target.value })
//           }
//         >
//           <option value="fixed">Fixed</option>
//           <option value="percentage">Percentage</option>
//         </Form.Select>
//       </Form.Group>

//       {/* Amount Field */}
//       <Form.Group className="mb-2">
//         <Form.Label>
//           Amount <span className="text-danger">*</span>
//         </Form.Label>
//         <Form.Control
//           type="number"
//           value={newCommission.amount}
//           onChange={(e) => {
//             setNewCommission({ ...newCommission, amount: e.target.value });
//             setValidationErrors({ ...validationErrors, amount: "" });
//           }}
//           placeholder="Enter amount"
//           isInvalid={!!validationErrors.amount}
//         />
//         <Form.Control.Feedback type="invalid">
//           {validationErrors.amount}
//         </Form.Control.Feedback>
//       </Form.Group>
//     </Form>
//   </Modal.Body>

//   <Modal.Footer>
//     <Button variant="secondary" onClick={handleCloseModal}>
//       Cancel
//     </Button>
//     <Button
//       variant="success"
//       onClick={handleModalSubmit}
//       disabled={saving}
//     >
//       {saving
//         ? editingCommission
//           ? "Updating..."
//           : "Saving..."
//         : editingCommission
//         ? "Update"
//         : "Create"}
//     </Button>
//   </Modal.Footer>
// </Modal>

//       </Card>
//     </>
//   );
// };

// export default CommissionCard;

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Modal,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import {
  getCommissionsByEmployee,
  deleteCommission,
  createCommission,
  updateCommission,
} from "../../../../services/commissionService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const CommissionCard = ({ employeeId, employeeName }) => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "fixed",
    amount: "",
  });

  // Fetch commissions
  const fetchCommissions = async () => {
    if (!employeeId) {
      setCommissions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCommissionsByEmployee(employeeId);
      setCommissions(data || []);
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCommission(null);
    setFormData({ title: "", type: "fixed", amount: "" });
    setShowModal(true);
  };

  const handleEdit = (commission) => {
    setEditingCommission(commission);
    setFormData({
      title: commission.title,
      type: commission.type,
      amount: commission.amount,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>

          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await deleteCommission(id);
                  toast.success("Commission successfully deleted.", {
                    icon: false,
                  });
                  setCommissions((prev) => prev.filter((c) => c.id !== id));
                } catch (err) {
                  console.error("Error deleting commission:", err);
                  alert("Failed to delete commission");
                }
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleModalClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingCommission(null);
      setFormData({ title: "", type: "fixed", amount: "" });
    }, 700);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingCommission) {
        await updateCommission(editingCommission.id, {
          title: formData.title,
          type: formData.type,
          amount: Number(formData.amount),
        });
        toast.success("Commission successfully updated.", {
          icon: false,
        });
      } else {
        await createCommission({
          employee_id: employeeId,
          title: formData.title,
          type: formData.type,
          amount: Number(formData.amount),
        });
        toast.success("Commission successfully created.", {
          icon: false,
        });
      }

      handleModalClose();
      setTimeout(fetchCommissions, 700); // ✅ refresh after animation
    } catch (err) {
      console.error("Error saving commission:", err);
      alert("Failed to save commission");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [employeeId]);


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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0, zIndex: 2 }}
        >
          <h5 className="mb-0">Commission</h5>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Add Commission</Tooltip>}
          >
            <Button
              variant="success"
              onClick={handleAdd}
              disabled={!employeeId}
            >
              <Plus />
            </Button>
          </OverlayTrigger>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

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
                  <tr style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      EMPLOYEE NAME
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      TITLE
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      TYPE
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      AMOUNT
                    </th>
                    <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length > 0 ? (
                    commissions.map((c) => (
                      <tr key={c.id}>
                        <td>{c.employee?.name || employeeName}</td>
                        <td>{c.title}</td>
                        <td>{c.type}</td>
                        <td>₹{c.amount}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="info"
                              className="me-2"
                              onClick={() => handleEdit(c)}
                            >
                              {/* <PencilSquare /> */}
                              <i className="bi bi-pencil text-white"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        {employeeId
                          ? "No commissions found for this employee"
                          : "No employee selected"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          className={`custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCommission
                ? `Edit Commission for ${employeeName}`
                : `Add Commission for ${employeeName}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleModalSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter commission title"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>
                  Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  required
                />
              </Form.Group>

              <div className="text-end">
                <Button
                  variant="secondary"
                  onClick={handleModalClose}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="success" disabled={saving}>
                  {saving
                    ? editingCommission
                      ? "Updating..."
                      : "Saving..."
                    : editingCommission
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Card>
    </>
  );
};

export default CommissionCard;
