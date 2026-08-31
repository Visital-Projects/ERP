// import React, { useEffect, useState } from "react";
// import { Card, Table, Button, Modal, Form } from "react-bootstrap";
// import { PencilSquare, Trash, Plus } from "react-bootstrap-icons";
// import {
//   getOtherPaymentsByEmployee,
//   createOtherPayment,
//   updateOtherPayment,
//   deleteOtherPayment,
// } from "../../../../services/otherPaymentService";

// const OtherPaymentCard = ({ employee }) => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     amount: "",
//     type: "Fixed",
//   });

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const res = await getOtherPaymentsByEmployee(employee.id);
//       setPayments(res.data || []);
//     } catch (err) {
//       console.error("Error fetching other payments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (employee?.id) fetchPayments();
//   }, [employee]);

//   const handleAdd = () => {
//     setEditing(null);
//     setFormData({ title: "", amount: "", type: "Fixed" });
//     setShowModal(true);
//   };

//   const handleEdit = (payment) => {
//     setEditing(payment);
//     setFormData({
//       title: payment.title,
//       amount: payment.amount,
//       type: payment.type || "Fixed",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       try {
//         await deleteOtherPayment(id);
//         fetchPayments();
//       } catch (err) {
//         console.error("Error deleting payment", err);
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     const data = {
//       ...formData,
//       employee_id: employee.id,
//     };

//     try {
//       if (editing) {
//         await updateOtherPayment(editing.id, data);
//       } else {
//         await createOtherPayment(data);
//       }
//       setShowModal(false);
//       fetchPayments();
//     } catch (err) {
//       console.error("Error saving payment", err);
//     }
//   };

//   const formatAmount = (payment) => {
//     if (payment.type === "Fixed") {
//       return `$ ${Number(payment.amount).toLocaleString("en-US")}`;
//     } else {
//       const percent = Number(payment.amount).toFixed(2);
//       return `${percent}% ($${Math.round(0)})`; // Replace 0 with calculation if needed
//     }
//   };

//   return (
//     <>
//       <Card style={{ height: "340px" }}>
//         <Card.Header className="d-flex justify-content-between align-items-center">
//           <strong>Other Payment</strong>
//           <Button size="sm" variant="success" onClick={handleAdd}>
//             <Plus size={16} />
//           </Button>
//         </Card.Header>
//         <Card.Body>
//           {payments.length === 0 ? (
//             <p className="text-muted text-center">No other payments found.</p>
//           ) : (
//             <Table bordered hover responsive className="text-center">
//               <thead className="table-light">
//                 <tr>
//                   <th>EMPLOYEE</th>
//                   <th>TITLE</th>
//                   <th>TYPE</th>
//                   <th>AMOUNT</th>
//                   <th>ACTION</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {payments.map((payment) => (
//                   <tr key={payment.id}>
//                     <td>{employee?.name || "—"}</td>
//                     <td>{payment.title}</td>
//                     <td>{payment.type}</td>
//                     <td>{formatAmount(payment)}</td>
//                     <td>
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEdit(payment)}
//                       >
//                         <PencilSquare />
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDelete(payment.id)}
//                       >
//                         <Trash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>{editing ? "Edit Payment" : "Add Payment"}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 name="title"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Amount</Form.Label>
//               <Form.Control
//                 name="amount"
//                 type="number"
//                 value={formData.amount}
//                 onChange={(e) =>
//                   setFormData({ ...formData, amount: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 name="type"
//                 value={formData.type}
//                 onChange={(e) =>
//                   setFormData({ ...formData, type: e.target.value })
//                 }
//               >
//                 <option value="Fixed">Fixed</option>
//                 <option value="Percentage">Percentage</option>
//               </Form.Select>
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editing ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default OtherPaymentCard;

// // src/components/hrm/employee/OtherPaymentCard.jsx
// import React, { useEffect, useState } from "react";
// import { Table, Button, Spinner, Modal, Form, Alert } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import {
//   getOtherPaymentsByEmployee,
//   createOtherPayment,
//   updateOtherPayment,
//   deleteOtherPayment,
// } from "../../../../services/otherPaymentService";

// const OtherPaymentCard = ({ employeeId, employeeName }) => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const [editingPayment, setEditingPayment] = useState(null); // edit state
//   const [formData, setFormData] = useState({
//     title: "",
//     type: "fixed",
//     amount: "",
//   });

//   // fetch employee payments
//   const fetchPayments = async () => {
//     if (!employeeId) {
//       setPayments([]);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getOtherPaymentsByEmployee(employeeId);
//       setPayments(data || []);
//     } catch (err) {
//       console.error("Error fetching other payments:", err);
//       // setError("Failed to fetch other payments");
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdd = () => {
//     setEditingPayment(null);
//     setFormData({ title: "", type: "fixed", amount: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (payment) => {
//     setEditingPayment(payment);
//     setFormData({
//       title: payment.title,
//       type: payment.type,
//       amount: payment.amount,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       try {
//         await deleteOtherPayment(id);
//         setPayments((prev) => prev.filter((p) => p.id !== id));
//       } catch (err) {
//         console.error("Error deleting other payment:", err);
//         alert("Failed to delete payment");
//       }
//     }
//   };

//   const handleModalClose = () => {
//     setShowModal(false);
//     setEditingPayment(null);
//     setFormData({ title: "", type: "fixed", amount: "" });
//   };

//   const handleModalSubmit = async () => {
//     if (!formData.title || !formData.amount) {
//       alert("Please fill all required fields");
//       return;
//     }
//     setSaving(true);
//     try {
//       if (editingPayment) {
//         // update
//         await updateOtherPayment(editingPayment.id, {
//           title: formData.title,
//           type: formData.type,
//           amount: Number(formData.amount),
//         });
//       } else {
//         // create
//         await createOtherPayment({
//           employee_id: employeeId,
//           title: formData.title,
//           type: formData.type,
//           amount: Number(formData.amount),
//         });
//       }
//       handleModalClose();
//       await fetchPayments(); // refresh
//     } catch (err) {
//       console.error("Error saving payment:", err.response?.data || err);
//       alert("Failed to save payment");
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, [employeeId]);

//   if (loading) return <Spinner animation="border" />;

//   return (
//     <div
//       className="other-payment-card p-3 bg-white rounded shadow-sm"
//       style={{ overflowY: "scroll", overflowX: "hidden", height: "340px" }}
//     >
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="mb-0">Other Payments</h5>
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
//           {payments.length > 0 ? (
//             payments.map((p) => (
//               <tr key={p.id}>
//                 <td>{p.employee?.name || employeeName}</td>
//                 <td>{p.title}</td>
//                 <td>{p.type}</td>
//                 <td>₹{p.amount}</td>
//                 <td>
//                   <Button
//                     size="sm"
//                     variant="info"
//                     className="me-2"
//                     onClick={() => handleEdit(p)}
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="danger"
//                     onClick={() => handleDelete(p.id)}
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
//                   ? "No other payments found for this employee"
//                   : "No employee selected"}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </Table>

//       {/* Modal for Add/Edit */}
//       <Modal show={showModal} onHide={handleModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingPayment
//               ? `Edit Payment for ${employeeName}`
//               : `Add Payment for ${employeeName}`}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>Title *</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 placeholder="Enter payment title"
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 value={formData.type}
//                 onChange={(e) =>
//                   setFormData({ ...formData, type: e.target.value })
//                 }
//               >
//                 <option value="fixed">Fixed</option>
//                 <option value="variable">Variable</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Amount *</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={formData.amount}
//                 onChange={(e) =>
//                   setFormData({ ...formData, amount: e.target.value })
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
//             {saving ? "Saving..." : editingPayment ? "Update " : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default OtherPaymentCard;

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
  getOtherPaymentsByEmployee,
  createOtherPayment,
  updateOtherPayment,
  deleteOtherPayment,
} from "../../../../services/otherPaymentService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const OtherPaymentCard = ({ employeeId, employeeName }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false); // ✅ animation state

  const [editingPayment, setEditingPayment] = useState(null); // edit state
  const [formData, setFormData] = useState({
    title: "",
    type: "fixed",
    amount: "",
  });

  // fetch employee payments
  const fetchPayments = async () => {
    if (!employeeId) {
      setPayments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getOtherPaymentsByEmployee(employeeId);
      setPayments(data || []);
    } catch (err) {
      console.error("Error fetching other payments:", err);
      // setError("Failed to fetch other payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPayment(null);
    setFormData({ title: "", type: "fixed", amount: "" });
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      title: payment.title,
      type: payment.type,
      amount: payment.amount,
    });
    setShowModal(true);
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this payment?")) {
  //     try {
  //       await deleteOtherPayment(id);
  //       setPayments((prev) => prev.filter((p) => p.id !== id));
  //     } catch (err) {
  //       console.error("Error deleting other payment:", err);
  //       alert("Failed to delete payment");
  //     }
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
                  await deleteOtherPayment(id); // ✅ delete payment
                  setPayments((prev) => prev.filter((p) => p.id !== id)); // ✅ update state
                   toast.success("Other Payment successfully deleted.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Error deleting other payment:", err);
                  alert("Failed to delete payment"); // ✅ error alert
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

  // const handleModalClose = () => {
  //   setShowModal(false);
  //   setEditingPayment(null);
  //   setFormData({ title: "", type: "fixed", amount: "" });
  // };
  const handleModalClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingPayment(null);
      setFormData({ title: "", type: "fixed", amount: "" });
    }, 700);
  };

  // const handleModalSubmit = async () => {
  //   if (!formData.title || !formData.amount) {
  //     alert("Please fill all required fields");
  //     return;
  //   }
  //   setSaving(true);
  //   try {
  //     if (editingPayment) {
  //       // update
  //       await updateOtherPayment(editingPayment.id, {
  //         title: formData.title,
  //         type: formData.type,
  //         amount: Number(formData.amount),
  //       });
  //     } else {
  //       // create
  //       await createOtherPayment({
  //         employee_id: employeeId,
  //         title: formData.title,
  //         type: formData.type,
  //         amount: Number(formData.amount),
  //       });
  //     }
  //     handleModalClose();
  //     setTimeout(() => {
  //       fetchPayments();
  //     }, 700);
  //     // await fetchPayments();
  //   } catch (err) {
  //     console.error("Error saving payment:", err.response?.data || err);
  //     alert("Failed to save payment");
  //   } finally {
  //     setSaving(false);
  //   }
  // };



  const handleModalSubmit = async (e) => {
  e.preventDefault(); // ✅ prevent page reload

  if (!formData.title || !formData.amount) {
    alert("Please fill all required fields");
    return;
  }

  setSaving(true);
  try {
    if (editingPayment) {
      await updateOtherPayment(editingPayment.id, {
        title: formData.title,
        type: formData.type,
        amount: Number(formData.amount),
      });
       toast.success("Other Payment successfully updated.", {
                    icon: false,
                  });
    } else {
      await createOtherPayment({
        employee_id: employeeId,
        title: formData.title,
        type: formData.type,
        amount: Number(formData.amount),
      });
       toast.success("Other Payment successfully created.", {
                    icon: false,
                  });
    }
    handleModalClose();
    setTimeout(fetchPayments, 700);
  } catch (err) {
    console.error("Error saving payment:", err.response?.data || err);
    alert("Failed to save payment");
  } finally {
    setSaving(false);
  }
};







  useEffect(() => {
    fetchPayments();
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
        className="card p-3  pt-2 shadow-sm rounded-3"
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          height: "380px",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0, zIndex: 2 }}
        >
          <h5 className="mb-0">Other Payments</h5>
          {/* <Button variant="success" onClick={handleAdd} disabled={!employeeId}>
          <Plus />
        </Button> */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Add Payment</Tooltip>}
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
                <tr>
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
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.employee?.name || employeeName}</td>
                      <td>{p.title}</td>
                      <td>{p.type}</td>
                      <td>₹{p.amount}</td>
                      <td>
                        {/* <Button
                        size="sm"
                        variant="info"
                        className="me-2"
                        onClick={() => handleEdit(p)}
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
                            className="me-2"
                            onClick={() => handleEdit(p)}
                          >
                            {/* <PencilSquare /> */}
                            <i className="bi bi-pencil text-white"></i>

                          </Button>
                        </OverlayTrigger>
                        {/* <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(p.id)}
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
                            onClick={() => handleDelete(p.id)}
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
                        ? "No other payments found for this employee"
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
        {/* <Modal
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
              {editingPayment
                ? `Edit Payment for ${employeeName}`
                : `Add Payment for ${employeeName}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter payment title"
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
                  <option value="variable">Variable</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleModalSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : editingPayment ? "Update " : "Create"}
            </Button>
          </Modal.Footer>
        </Modal> */}




        {/* Modal for Add/Edit */}
<Modal
  show={showModal}
  onHide={handleModalClose}
  centered
  className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
  style={{ overflowY: "auto", scrollbarWidth: "none" }}
>
  <Modal.Header closeButton>
    <Modal.Title>
      {editingPayment
        ? `Edit Payment for ${employeeName}`
        : `Add Payment for ${employeeName}`}
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
          placeholder="Enter payment title"
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
        <Button variant="secondary" onClick={handleModalClose} className="me-2">
          Cancel
        </Button>
        <Button type="submit" variant="success" disabled={saving}>
          {saving ? "Saving..." : editingPayment ? "Update" : "Create"}
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

      </Card>
    </>
  );
};

export default OtherPaymentCard;
