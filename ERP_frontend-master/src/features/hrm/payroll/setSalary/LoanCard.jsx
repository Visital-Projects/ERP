// import React, { useEffect, useState } from "react";
// import { Card, Button, Table, Modal, Form, Spinner } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import loanService from "../../../../services/loanService";
// import loanOptionService from "../../../../services/loanOptionService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";

// const LoanCard = ({ employeeId }) => {
//   const [loans, setLoans] = useState([]);
//   const [loanOptions, setLoanOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [editingLoan, setEditingLoan] = useState(null);
//   const [isClosingModal, setIsClosingModal] = useState(false);

//   const [formData, setFormData] = useState({
//     employee_id: employeeId || "",
//     title: "",
//     loan_option: "",
//     type: "",
//     amount: "",
//     reason: "",
//     start_date: "",
//     end_date: "",
//   });

//   // =========================
//   // Fetch Loans & Loan Options
//   // =========================
//   const fetchLoans = async () => {
//     if (!employeeId) return; // do nothing if no employeeId
//     try {
//       setLoading(true);
//       const data = await loanService.getLoansByEmployee(employeeId);
//       setLoans(data || []);
//     } catch (err) {
//       console.error("Error fetching loans:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLoanOptions = async () => {
//     try {
//       const data = await loanOptionService.getAllLoanOptions();
//       setLoanOptions(data || []);
//     } catch (err) {
//       console.error("Error fetching loan options:", err);
//     }
//   };

//   useEffect(() => {
//     fetchLoans();
//     fetchLoanOptions();
//   }, [employeeId]); // refetch if employeeId changes

//   // =========================
//   // Handlers
//   // =========================
//   const handleOpenModal = (loan = null) => {
//     if (loan) {
//       setEditingLoan(loan);
//       setFormData({
//         employee_id: loan.employee_id,
//         title: loan.title,
//         loan_option: loan.loan_option,
//         type: loan.type,
//         amount: loan.amount,
//         reason: loan.reason,
//         start_date: loan.start_date || "",
//         end_date: loan.end_date || "",
//       });
//     } else {
//       setEditingLoan(null);
//       setFormData({
//         employee_id: employeeId || "",
//         title: "",
//         loan_option: "",
//         type: "",
//         amount: "",
//         reason: "",
//         start_date: "",
//         end_date: "",
//       });
//     }
//     setShowModal(true);
//   };

//   // const handleCloseModal = () => {
//   //   setShowModal(false);
//   //   setEditingLoan(null);
//   // };
//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 700);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       // Always take employeeId prop if available
//       const employee_id = employeeId || formData.employee_id;
//       if (!employee_id) {
//         alert("Employee is required!");
//         return;
//       }

//       const payload = {
//         ...formData,
//         employee_id: Number(employee_id),
//         loan_option: formData.loan_option ? Number(formData.loan_option) : null,
//         amount: Number(formData.amount),
//         reason: formData.reason?.trim() || null,
//         start_date: formData.start_date || null,
//         end_date: formData.end_date || null,
//       };

//       if (editingLoan) {
//         await loanService.updateLoan(editingLoan.id, payload);
//       } else {
//         await loanService.createLoan(payload);
//       }

//       handleCloseModal();
//       setTimeout(() => fetchLoans(), 700);
//     } catch (err) {
//       console.error("Error saving loan:", err.response?.data || err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

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
//                   await loanService.deleteLoan(id); // ✅ delete loan
//                   await fetchLoans(); // ✅ refresh loans
//                 } catch (err) {
//                   console.error("Error deleting loan:", err);
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

//   return (
//     <>
//       <style>{`
//       @keyframes slideInUp {
//         from { transform: translateY(100%); opacity: 0; }
//         to { transform: translateY(0); opacity: 1; }
//       }
//       @keyframes slideOutUp {
//         from { transform: translateY(0); opacity: 1; }
//         to { transform: translateY(-100%); opacity: 0; }
//       }
//       .custom-slide-modal.open .modal-dialog {
//         animation: slideInUp 0.7s ease forwards;
//       }
//       .custom-slide-modal.closing .modal-dialog {
//         animation: slideOutUp 0.7s ease forwards;
//       }
//     `}</style>

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
//         {/* <div className="d-flex justify-content-between align-items-center mb-3 card-header"> */}

//         <div
//           className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
//           style={{ position: "sticky", top: 0, zIndex: 10 }}
//         >
//           <h5 className="mb-0">Loans</h5>
//           {/* <Button variant="success" onClick={() => handleOpenModal()}>
//           <Plus className="me-1" />
//         </Button> */}
//           <OverlayTrigger placement="top" overlay={<Tooltip>Add Loan</Tooltip>}>
//             <Button variant="success" onClick={() => handleOpenModal()}>
//               <Plus className="me-1" />
//             </Button>
//           </OverlayTrigger>
//         </div>

//         {loading ? (
//           <div className="text-center my-3">
//             <Spinner animation="border" />
//           </div>
//         ) : (
//           <div className="card-body mt-2">
//             <div
//               className="table-responsive"
//               style={{ maxHeight: "250px", overflowY: "auto" }}
//             >
//               <Table striped hover>
//                 <thead>
//                   <tr>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Employee
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Title
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Loan Option
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Type
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Amount
//                     </th>
//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Reason
//                     </th>

//                     <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loans.length > 0 ? (
//                     loans.map((loan) => (
//                       <tr key={loan.id}>
//                         <td>{loan.employee?.name || loan.employee_id}</td>
//                         <td>{loan.title}</td>
//                         <td>
//                           {loanOptions.find(
//                             (opt) => opt.id === Number(loan.loan_option)
//                           )?.name || loan.loan_option}
//                         </td>
//                         <td>{loan.type}</td>
//                         <td>{loan.amount}</td>
//                         <td>{loan.reason}</td>

//                         <td className="text-center">

//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Edit</Tooltip>}
//                           >
//                             <Button
//                               size="sm"
//                               variant="info"
//                               className="me-2"
//                               onClick={() => handleOpenModal(loan)}
//                             >
//                               <PencilSquare />
//                             </Button>
//                           </OverlayTrigger>

//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Delete</Tooltip>}
//                           >
//                             <Button
//                               size="sm"
//                               variant="danger"
//                               onClick={() => handleDelete(loan.id)}
//                             >
//                               <Trash />
//                             </Button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="text-center">
//                         No loans found for this employee.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </div>
//         )}

//         {/* Modal */}
//         <Modal
//           show={showModal}
//           onHide={handleCloseModal}
//           size="md"
//           centered
//           className={`custom-slide-modal ${
//             isClosingModal ? "closing" : "open"
//           }`}
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>{editingLoan ? "Edit Loan" : "Add Loan"}</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>

//               {!editingLoan && !employeeId && (
//                 <Form.Group className="mb-2">
//                   <Form.Label>Employee ID</Form.Label>
//                   <Form.Control
//                     name="employee_id"
//                     value={formData.employee_id}
//                     onChange={handleChange}
//                     placeholder="Enter Employee ID"
//                   />
//                 </Form.Group>
//               )}

//               <Form.Group className="mb-2">
//                 <Form.Label>Title  <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   placeholder="Enter Loan Title"
//                 />
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Loan Option <span className="text-danger">*</span></Form.Label>
//                 <Form.Select
//                   name="loan_option"
//                   value={formData.loan_option}
//                   onChange={handleChange}
//                 >
//                   <option value="">-- Select Option --</option>
//                   {loanOptions.map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Type <span className="text-danger">*</span></Form.Label>
//                 <Form.Select
//                   name="type"
//                   value={formData.type}
//                   onChange={handleChange}
//                 >
//                   <option value="">-- Select Type --</option>
//                   <option value="Fixed">Fixed</option>
//                   <option value="Percentage">Percentage</option>
//                   <option value="Enter Amount">Enter Amount</option>
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   name="amount"
//                   type="number"
//                   value={formData.amount}
//                   onChange={handleChange}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Reason</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={2}
//                   name="reason"
//                   value={formData.reason}
//                   onChange={handleChange}
//                 />
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button variant="success" onClick={handleSave} disabled={saving}>
//               {saving ? (
//                 <Spinner size="sm" animation="border" />
//               ) : editingLoan ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Card>
//     </>
//   );
// };

// export default LoanCard;

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import loanService from "../../../../services/loanService";
import loanOptionService from "../../../../services/loanOptionService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const LoanCard = ({ employeeId }) => {
  const [loans, setLoans] = useState([]);
  const [loanOptions, setLoanOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: employeeId || "",
    title: "",
    loan_option: "",
    type: "",
    amount: "",
    reason: "",
    start_date: "",
    end_date: "",
  });

  const fetchLoans = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const data = await loanService.getLoansByEmployee(employeeId);
      setLoans(data || []);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanOptions = async () => {
    try {
      const data = await loanOptionService.getAllLoanOptions();
      setLoanOptions(data || []);
    } catch (err) {
      console.error("Error fetching loan options:", err);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchLoanOptions();
  }, [employeeId]);

  const handleOpenModal = (loan = null) => {
    setError(null);
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        employee_id: loan.employee_id,
        title: loan.title,
        loan_option: loan.loan_option,
        type: loan.type,
        amount: loan.amount,
        reason: loan.reason,
        start_date: loan.start_date || "",
        end_date: loan.end_date || "",
      });
    } else {
      setEditingLoan(null);
      setFormData({
        employee_id: employeeId || "",
        title: "",
        loan_option: "",
        type: "",
        amount: "",
        reason: "",
        start_date: "",
        end_date: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingLoan(null);
      setFormData({
        employee_id: employeeId || "",
        title: "",
        loan_option: "",
        type: "",
        amount: "",
        reason: "",
        start_date: "",
        end_date: "",
      });
      setError(null);
    }, 700);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Enhanced handleSave with validation (like CommissionCard)
  const handleSave = async () => {
    const { title, loan_option, type, amount } = formData;
    const errors = {};

    if (!title.trim()) errors.title = "Title is required";
    if (!loan_option) errors.loan_option = "Loan Option is required";
    if (!type) errors.type = "Type is required";
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      errors.amount = "Amount must be a valid number";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      setValidationErrors({});

      const employee_id = employeeId || formData.employee_id;
      if (!employee_id) {
        setValidationErrors({ employee_id: "Employee is required" });
        return;
      }

      const payload = {
        ...formData,
        employee_id: Number(employee_id),
        loan_option: formData.loan_option ? Number(formData.loan_option) : null,
        amount: Number(formData.amount),
        reason: formData.reason?.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingLoan) {
        await loanService.updateLoan(editingLoan.id, payload);
        toast.success("Loan successfully updated.", {
          icon: false,
        });
      } else {
        await loanService.createLoan(payload);
        toast.success("Loan successfully created.", {
          icon: false,
        });
      }

      handleCloseModal();
      setTimeout(() => fetchLoans(), 700);
    } catch (err) {
      console.error("Error saving loan:", err.response?.data || err.message);
      setValidationErrors({
        general: "Failed to save loan. Please try again.",
      });
    } finally {
      setSaving(false);
    }
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
                  await loanService.deleteLoan(id);
                  await fetchLoans();
                  toast.success("Loan successfully deleted.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Error deleting loan:", err);
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
        //   style={{
        //     overflowY: "scroll",
        //     overflowX: "hidden",
        //     height: "385px",
        //     scrollbarWidth: "none",
        //     msOverflowStyle: "none",
        //   }}
        // >
        style={{
          height: "385px",
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          // style={{ position: "sticky", top: 0 }}
          style={{ position: "sticky", top: 0, zIndex: 2 }}
        >
          <h5 className="mb-0">Loans</h5>
          <OverlayTrigger placement="top" overlay={<Tooltip>Add Loan</Tooltip>}>
            {/* <Button variant="success" onClick={() => handleOpenModal()}>
              <Plus className="me-1 " />
            </Button> */}
            <Button variant="success" onClick={() => handleOpenModal()}>
              <Plus />
            </Button>
          </OverlayTrigger>
        </div>

        
      <Card.Body>

        <div
          className="table-responsive"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Employee
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Title
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Loan Option
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Type
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Amount
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Reason
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loans.length > 0 ? (
                  loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.employee?.name || loan.employee_id}</td>
                      <td>{loan.title}</td>
                      <td>
                        {loanOptions.find(
                          (opt) => opt.id === Number(loan.loan_option)
                        )?.name || loan.loan_option}
                      </td>
                      <td>{loan.type}</td>
                      <td>  ₹{loan.amount}</td>
                      <td
                        style={{
                          width: "400px", // fixed width
                          whiteSpace: "normal", // allow wrapping
                          wordWrap: "break-word",
                          // break long words
                        }}
                      >
                        {loan.reason}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleOpenModal(loan)}
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
                            onClick={() => handleDelete(loan.id)}
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
                      No loans found for this employee.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
        </Card.Body>
        {/* Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          size="md"
          centered
          className={`custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>{editingLoan ? "Edit Loan" : "Add Loan"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {!editingLoan && !employeeId && (
                <Form.Group className="mb-2">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    placeholder="Enter Employee ID"
                    isInvalid={!!validationErrors.employee_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.employee_id}
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              <Form.Group className="mb-2">
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Loan Title"
                  isInvalid={!!validationErrors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>
                  Loan Option <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="loan_option"
                  value={formData.loan_option}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.loan_option}
                >
                  <option value="">-- Select Option --</option>
                  {loanOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.loan_option}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>
                  Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.type}
                >
                  <option value="">-- Select Type --</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.type}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>
                  Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.amount}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.amount}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </Form.Group>

              {validationErrors.general && (
                <div className="text-danger small mt-2">
                  {validationErrors.general}
                </div>
              )}
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner size="sm" animation="border" />
              ) : editingLoan ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};

export default LoanCard;
