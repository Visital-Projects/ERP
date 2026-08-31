// import React, { useState, useEffect } from "react";
// import {
//   fetchLeaves,
//   createLeave,
//   updateLeave,
//   deleteLeave,
//   getEmployees,
// } from "../../../services/hrmService";
// import leaveTypeService from "../../../services/leavetypeService";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../../components/BreadCrumb";
// import { useNavigate, useLocation } from "react-router-dom";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const LeaveList = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [leaves, setLeaves] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [leaveTypes, setLeaveTypes] = useState([]);
//   const [approveLeave, setApproveLeave] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isClosing, setIsClosing] = useState(false);
//   const [isApproveClosing, setIsApproveClosing] = useState(false);

//   const [form, setForm] = useState({
//     employee_id: "",
//     leave_type_id: "",
//     applied_on: new Date().toISOString().slice(0, 10),
//     start_date: "",
//     end_date: "",
//     total_leave_days: "",
//     leave_reason: "",
//     // remark: "",
//     status: "Pending",
//   });

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [leavesData, empRes, leaveTypeRes] = await Promise.all([
//         fetchLeaves(),
//         getEmployees(),
//         leaveTypeService.getAll(),
//       ]);

//       console.log("Leaves Data:", leavesData);
//       console.log("Employees Data:", empRes);
//       console.log("Leave Types Data:", leaveTypeRes);

//       setLeaves(Array.isArray(leavesData) ? leavesData : []);
//       setEmployees(Array.isArray(empRes) ? empRes : []);
//       setLeaveTypes(Array.isArray(leaveTypeRes) ? leaveTypeRes : []);
//     } catch (err) {
//       console.error("Error loading data:", err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       employee_id: "",
//       leave_type_id: "",
//       applied_on: new Date().toISOString().slice(0, 10),
//       start_date: "",
//       end_date: "",
//       total_leave_days: "",
//       leave_reason: "",
//       // remark: "",
//       status: "Pending",
//     });
//     setEditId(null);
//     setIsEditMode(false);
//     setError("");
//   };

//   const handleAddLeave = () => {
//     resetForm();
//     setShowModal(true);
//   };

//   const handleEditLeave = (leave) => {
//     console.log("Editing leave:", leave);

//     // Use the employee_id from the employee object if available, otherwise use the direct employee_id
//     const employeeBusinessId = leave.employee?.employee_id || leave.employee_id;

//     setForm({
//       employee_id: employeeBusinessId?.toString() || "",
//       leave_type_id: leave.leave_type_id?.toString() || "",
//       applied_on: leave.applied_on || new Date().toISOString().slice(0, 10),
//       start_date: leave.start_date || "",
//       end_date: leave.end_date || "",
//       total_leave_days: leave.total_leave_days?.toString() || "",
//       leave_reason: leave.leave_reason || "",
//       remark: leave.remark || "",
//       status: leave.status || "Pending",
//     });
//     setEditId(leave.id);
//     setIsEditMode(true);
//     setShowModal(true);
//   };

//   const handleApprovePopup = (leave) => setApproveLeave(leave);

//   // slide animation close for Approve modal
//   const handleCloseApprove = () => {
//     setIsApproveClosing(true);
//     setTimeout(() => {
//       setApproveLeave(null);
//       setIsApproveClosing(false);
//     }, 700); // match animation duration
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       resetForm();
//       setShowModal(false);
//       setIsClosing(false);
//     }, 700); // match animation duration
//   };

//   // const handleStatusChange = async (status) => {
//   //   try {
//   //     setLoading(true);
//   //     await updateLeave(approveLeave.id, { ...approveLeave, status });
//   //     await loadInitialData();
//   //     setApproveLeave(null);
//   //   } catch (error) {
//   //     console.error("Failed to update status:", error);
//   //     setError(error.response?.data?.message || "Failed to update status");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleStatusChange = async (status) => {
//     try {
//       setLoading(true);

//       // Create a clean payload with only the status field
//       const payload = { status };

//       console.log("🔄 Updating status for leave ID:", approveLeave.id);
//       console.log("📦 Clean payload:", payload);

//       await updateLeave(approveLeave.id, payload);
//       await loadInitialData();
//       setApproveLeave(null);
//     } catch (error) {
//       console.error("Failed to update status:", error);
//       setError(error.response?.data?.message || "Failed to update status");
//     } finally {
//       setLoading(false);
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
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   setLoading(true);
//                   await deleteLeave(id);
//                   await loadInitialData();
//                   toast.success("Leave deleted successfully.", { icon: false });
//                 } catch (err) {
//                   console.error("Error deleting leave:", err);
//                   setError(
//                     err.response?.data?.message || "Error deleting leave"
//                   );
//                 } finally {
//                   setLoading(false);
//                   onClose();
//                 }
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));

//     // Auto-calculate days when start or end date changes
//     if (
//       (name === "start_date" || name === "end_date") &&
//       form.start_date &&
//       form.end_date
//     ) {
//       const days = calculateDays(
//         name === "start_date" ? value : form.start_date,
//         name === "end_date" ? value : form.end_date
//       );
//       setForm((prev) => ({ ...prev, total_leave_days: days }));
//     }
//   };

//   const calculateDays = (start, end) => {
//     if (!start || !end) return "0";
//     const s = new Date(start);
//     const e = new Date(end);
//     if (isNaN(s) || isNaN(e)) return "0";
//     return (Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1).toString();
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   try {
//   //     setLoading(true);
//   //     setError("");

//   //     // Validate required fields
//   //     if (
//   //       !form.employee_id ||
//   //       !form.leave_type_id ||
//   //       !form.start_date ||
//   //       !form.leave_reason
//   //     ) {
//   //       setError("Please fill in all required fields");
//   //       return;
//   //     }

//   //     // Prepare payload - ensure we're using business employee_id
//   //     const payload = {
//   //       employee_id: form.employee_id, // This should be the business employee_id (like "EMP001")
//   //       leave_type_id: parseInt(form.leave_type_id),
//   //       applied_on: form.applied_on,
//   //       start_date: form.start_date,
//   //       end_date: form.end_date || form.start_date, // If no end date, use start date
//   //       total_leave_days: form.total_leave_days || "1",
//   //       leave_reason: form.leave_reason,
//   //       remark: form.remark || "",
//   //       status: form.status,
//   //     };

//   //     console.log("Submitting payload:", payload);

//   //     if (isEditMode && editId) {
//   //       await updateLeave(editId, payload);
//   //     } else {
//   //       await createLeave(payload);
//   //     }

//   //     await loadInitialData();
//   //     handleCloseModal();
//   //   } catch (err) {
//   //     console.error("Error submitting leave:", err.response?.data || err);
//   //     setError(
//   //       err.response?.data?.message ||
//   //         "Error submitting leave. Please check your input."
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Helper functions

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       setError("");

//       // Validate required fields - remove employee_id validation for edits
//       if (!form.leave_type_id || !form.start_date || !form.leave_reason) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       // For new leaves, employee_id is required
//       if (!isEditMode && !form.employee_id) {
//         setError("Employee is required for new leaves");
//         return;
//       }

//       // Prepare payload - don't include employee_id for updates
//       const payload = {
//         leave_type_id: parseInt(form.leave_type_id),
//         applied_on: form.applied_on,
//         start_date: form.start_date,
//         end_date: form.end_date || form.start_date,
//         total_leave_days: form.total_leave_days || "1",
//         leave_reason: form.leave_reason,
//         remark: form.remark || "",
//         status: form.status,
//       };

//       // Only include employee_id for new leaves, not for updates
//       if (!isEditMode) {
//         payload.employee_id = form.employee_id;
//       }

//       console.log("Submitting payload:", payload);
//       console.log("Edit ID:", editId);
//       console.log("Is Edit Mode:", isEditMode);

//       let response;
//       if (isEditMode && editId) {
//         response = await updateLeave(editId, payload);
//         console.log("Update response:", response);
//         toast.success("Leave successfully updated.", { icon: false });
//       } else {
//         response = await createLeave(payload);
//         console.log("Create response:", response);

//         toast.success("Leave successfully created.", { icon: false });
//       }

//       await loadInitialData();
//       handleCloseModal();
//     } catch (err) {
//       console.error("Error submitting leave:", err.response?.data || err);
//       setError(
//         err.response?.data?.message ||
//           "Error submitting leave. Please check your input."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const getEmployeeName = (employeeId) => {
//   //   const employee = employees.find(
//   //     (e) => e.employee_id?.toString() === employeeId?.toString()
//   //   );
//   //   return employee?.name || `ID: ${employeeId}`;
//   // };

//   const getEmployeeName = (employeeId) => {
//     const employee = employees.find(
//       (e) => e.employee_id?.toString() === employeeId?.toString()
//     );

//     return employee
//       ? `${employee.name} (EMP-ID: ${employee.employee_id})`
//       : `ID: ${employeeId}`;
//   };

//   const getLeaveTypeName = (typeId) => {
//     const type = leaveTypes.find(
//       (l) => l.id?.toString() === typeId?.toString()
//     );
//     return type?.title || `ID: ${typeId}`;
//   };

//   // Filtering
//   const filteredLeaves = leaves.filter(
//     (leave) =>
//       getEmployeeName(leave.employee?.employee_id || leave.employee_id)
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       getLeaveTypeName(leave.leave_type_id)
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       (leave.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (leave.leave_reason || "")
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase())
//   );

//   // Pagination
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredLeaves.length / entriesPerPage) || 1;

//   const statusBadge = (status) => {
//     if (status === "Approved")
//       return <span className="badge bg-success">Approved</span>;
//     if (status === "Rejected")
//       return <span className="badge bg-danger">Rejected</span>;
//     return <span className="badge bg-warning text-dark">Pending</span>;
//   };

//   // if (loading && leaves.length === 0) {
//   //   return (
//   //     <div className="d-flex justify-content-center align-items-center mt-5">
//   //       <Spinner animation="border" />
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="container mt-4">
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

//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="fw-bold mb-0">Manage Leave</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//           <Button
//             onClick={handleAddLeave}
//             className="btn btn-success"
//             disabled={loading}
//           >
//             <i className="bi bi-plus-lg"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {error && (
//         <Alert variant="danger" onClose={() => setError("")} dismissible>
//           {error}
//         </Alert>
//       )}

//       {/* Card with Table */}
//       <div className="card shadow-sm p-3">
//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
//           <div className="d-flex align-items-center">
//             <Form.Select
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//               disabled={loading}
//             >
//               {/* <option value="5">5</option> */}
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </Form.Select>
//           </div>
//           <Form.Control
//             className=" w-auto"
//             type="text"
//             placeholder="Search..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={{ maxWidth: "300px" }}
//             disabled={loading}
//           />
//         </div>

//         {loading ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" role="status" variant="success">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         ) : (
//           <>
//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className=" table table-bordered table-hover table-striped   text-center align-middle mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Employee</th>
//                     <th>Leave Type</th>
//                     <th>Applied On</th>
//                     <th>Start Date</th>
//                     <th>End Date</th>
//                     <th>Total Days</th>
//                     <th>Leave Reason</th>
//                     <th>Status</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentLeaves.length > 0 ? (
//                     currentLeaves.map((leave) => (
//                       <tr key={leave.id}>
//                         <td>
//                           {getEmployeeName(
//                             leave.employee?.employee_id || leave.employee_id
//                           )}
//                         </td>
//                         <td>{getLeaveTypeName(leave.leave_type_id)}</td>
//                         <td>
//                           {leave.applied_on
//                             ? new Date(leave.applied_on).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td>
//                           {leave.start_date
//                             ? new Date(leave.start_date).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td>
//                           {leave.end_date
//                             ? new Date(leave.end_date).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td>{leave.total_leave_days}</td>
//                         <td>{leave.leave_reason}</td>
//                         <td>{statusBadge(leave.status)}</td>
//                         <td>
//                           <OverlayTrigger
//                             overlay={<Tooltip>Approve/Reject</Tooltip>}
//                           >
//                             <Button
//                               variant="warning"
//                               size="sm"
//                               className="me-1"
//                               onClick={() => handleApprovePopup(leave)}
//                               disabled={loading}
//                             >
//                               <i className="bi bi-play-fill"></i>
//                             </Button>
//                           </OverlayTrigger>
//                           <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
//                             <Button
//                               variant="info"
//                               size="sm"
//                               className="me-1"
//                               onClick={() => handleEditLeave(leave)}
//                               disabled={loading || leave.status !== "Pending"}
//                             >
//                               <i className="bi bi-pencil-fill"></i>
//                             </Button>
//                           </OverlayTrigger>
//                           <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
//                             <Button
//                               variant="danger"
//                               size="sm"
//                               onClick={() => handleDelete(leave.id)}
//                               disabled={loading || leave.status !== "Pending"}
//                             >
//                               <i className="bi bi-trash-fill"></i>
//                             </Button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="text-center">
//                         No leave data found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {/* <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
//               <small>
//                 Showing {filteredLeaves.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
//                 to {Math.min(indexOfLastItem, filteredLeaves.length)} of{" "}
//                 {filteredLeaves.length} entries
//               </small>
//               <nav>
//                 <ul className="pagination pagination-sm mb-0">
//                   <li
//                     className={`page-item ${currentPage === 1 ? "disabled" : ""
//                       }`}
//                   >
//                     <Button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => p - 1)}
//                       disabled={loading || currentPage === 1}
//                     >
//                       &laquo;
//                     </Button>
//                   </li>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <li
//                       key={i}
//                       className={`page-item ${currentPage === i + 1 ? "active" : ""
//                         }`}
//                     >
//                       <Button
//                         className="page-link"
//                         onClick={() => setCurrentPage(i + 1)}
//                         disabled={loading}
//                       >
//                         {i + 1}
//                       </Button>
//                     </li>
//                   ))}
//                   <li
//                     className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                       }`}
//                   >
//                     <Button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => p + 1)}
//                       disabled={loading || currentPage === totalPages}
//                     >
//                       &raquo;
//                     </Button>
//                   </li>
//                 </ul>
//               </nav>
//             </div> */}
//             <div className="d-flex justify-content-between align-items-center mt-2">
//               <div className="small text-muted">
//                 Showing {filteredLeaves.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
//                 to {Math.min(indexOfLastItem, filteredLeaves.length)} of{" "}
//                 {filteredLeaves.length} entries
//               </div>
//               <div>
//                 <ul className="pagination pagination-sm mb-0">
//                   <li
//                     className={`page-item ${
//                       currentPage === 1 ? "disabled" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => p - 1)}
//                       disabled={loading || currentPage === 1}
//                     >
//                       &laquo;
//                     </button>
//                   </li>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <li
//                       key={i}
//                       className={`page-item ${
//                         currentPage === i + 1 ? "active" : ""
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => setCurrentPage(i + 1)}
//                         disabled={loading}
//                       >
//                         {i + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li
//                     className={`page-item ${
//                       currentPage === totalPages ? "disabled" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => p + 1)}
//                       disabled={loading || currentPage === totalPages}
//                     >
//                       &raquo;
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         size="md"
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{
//           overflowY: "auto",
//           scrollbarWidth: "none",
//         }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {isEditMode ? "Edit Leave" : "Create Leave"}
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             {error && (
//               <Alert variant="danger" className="mb-3">
//                 {error}
//               </Alert>
//             )}
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <Form.Label>
//                   Employee <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Select
//                   name="employee_id"
//                   value={form.employee_id}
//                   onChange={handleChange}
//                   required
//                   disabled={loading || isEditMode}
//                 >
//                   <option value="">Select Employee</option>
//                   {employees.map((e) => (
//                     <option key={e.employee_id} value={e.employee_id}>
//                       {e.name} (Emp-id:{e.employee_id})
//                     </option>
//                   ))}
//                 </Form.Select>
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>
//                   Leave Type <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Select
//                   name="leave_type_id"
//                   value={form.leave_type_id}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                 >
//                   <option value="">Select Leave Type</option>
//                   {leaveTypes.map((lt) => (
//                     <option key={lt.id} value={lt.id}>
//                       {lt.title}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>
//                   Applied On <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="applied_on"
//                   value={form.applied_on}
//                   onChange={handleChange}
//                   required
//                   max="9999-12-31"
//                   disabled={loading}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>
//                   Start Date <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="start_date"
//                   value={form.start_date}
//                   onChange={handleChange}
//                   required
//                   max="9999-12-31"
//                   disabled={loading}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>
//                   End Date <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="end_date"
//                   value={form.end_date}
//                   onChange={handleChange}
//                   required
//                   max="9999-12-31"
//                   disabled={loading}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>Total Leave Days</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="total_leave_days"
//                   value={
//                     form.total_leave_days ||
//                     calculateDays(form.start_date, form.end_date)
//                   }
//                   readOnly
//                   disabled={loading}
//                 />
//               </div>
//               <div className="col-12">
//                 <Form.Label>
//                   Leave Reason <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="leave_reason"
//                   value={form.leave_reason}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter reason for leave"
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={handleCloseModal}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button variant="success" type="submit" disabled={loading}>
//               {loading ? (
//                 <Spinner animation="border" size="sm" />
//               ) : isEditMode ? (
//                 "Update Leave"
//               ) : (
//                 "Create Leave"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       <Modal
//         show={!!approveLeave}
//         onHide={handleCloseApprove}
//         centered
//         className={`custom-slide-modal ${
//           isApproveClosing ? "closing" : "open"
//         }`}
//         style={{
//           overflowY: "auto",
//           scrollbarWidth: "none",
//         }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Manage Leave Status</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {approveLeave && (
//             <>
//               <p>
//                 <strong>Employee:</strong>{" "}
//                 {getEmployeeName(
//                   approveLeave.employee?.employee_id || approveLeave.employee_id
//                 )}
//               </p>
//               <p>
//                 <strong>Leave Type:</strong>{" "}
//                 {getLeaveTypeName(approveLeave.leave_type_id)}
//               </p>
//               <p>
//                 <strong>Applied On:</strong>{" "}
//                 {approveLeave.applied_on
//                   ? new Date(approveLeave.applied_on).toLocaleDateString()
//                   : "N/A"}
//               </p>
//               <p>
//                 <strong>Duration:</strong> {approveLeave.start_date} to{" "}
//                 {approveLeave.end_date}
//               </p>
//               <p>
//                 <strong>Total Days:</strong> {approveLeave.total_leave_days}
//               </p>
//               <p>
//                 <strong>Reason:</strong> {approveLeave.leave_reason}
//               </p>
//               <p>
//                 <strong>Current Status:</strong>{" "}
//                 {statusBadge(approveLeave.status)}
//               </p>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="success"
//             onClick={() => handleStatusChange("Approved")}
//             disabled={loading}
//           >
//             Approve
//           </Button>
//           <Button
//             variant="danger"
//             onClick={() => handleStatusChange("Rejected")}
//             disabled={loading}
//           >
//             Reject
//           </Button>
//           <Button
//             variant="secondary"
//             onClick={handleCloseApprove}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LeaveList;













import React, { useState, useEffect } from "react";
import {
  fetchLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
  getEmployees,
} from "../../../services/hrmService";
import leaveTypeService from "../../../services/leavetypeService";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const LeaveList = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [approveLeave, setApproveLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isApproveClosing, setIsApproveClosing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const statusOptions = ["", "Approved", "Pending", "Rejected"];
  const [form, setForm] = useState({
    employee_id: "",
    leave_type_id: "",
    applied_on: new Date().toISOString().slice(0, 10),
    start_date: "",
    end_date: "",
    total_leave_days: "",
    leave_reason: "",
    // remark: "",
    status: "Pending",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [leavesData, empRes, leaveTypeRes] = await Promise.all([
        fetchLeaves(),
        getEmployees(),
        leaveTypeService.getAll(),
      ]);

      console.log("Leaves Data:", leavesData);
      console.log("Employees Data:", empRes);
      console.log("Leave Types Data:", leaveTypeRes);

      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setEmployees(Array.isArray(empRes) ? empRes : []);
      setLeaveTypes(Array.isArray(leaveTypeRes) ? leaveTypeRes : []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      employee_id: "",
      leave_type_id: "",
      applied_on: new Date().toISOString().slice(0, 10),
      start_date: "",
      end_date: "",
      total_leave_days: "",
      leave_reason: "",
      // remark: "",
      status: "Pending",
    });
    setEditId(null);
    setIsEditMode(false);
    setError("");
  };

  const handleAddLeave = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditLeave = (leave) => {
    console.log("Editing leave:", leave);

    // Use the employee_id from the employee object if available, otherwise use the direct employee_id
    const employeeBusinessId = leave.employee?.employee_id || leave.employee_id;

    setForm({
      employee_id: employeeBusinessId?.toString() || "",
      leave_type_id: leave.leave_type_id?.toString() || "",
      applied_on: leave.applied_on || new Date().toISOString().slice(0, 10),
      start_date: leave.start_date || "",
      end_date: leave.end_date || "",
      total_leave_days: leave.total_leave_days?.toString() || "",
      leave_reason: leave.leave_reason || "",
      remark: leave.remark || "",
      status: leave.status || "Pending",
    });
    setEditId(leave.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleApprovePopup = (leave) => setApproveLeave(leave);

  // slide animation close for Approve modal
  const handleCloseApprove = () => {
    setIsApproveClosing(true);
    setTimeout(() => {
      setApproveLeave(null);
      setIsApproveClosing(false);
    }, 700); // match animation duration
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      resetForm();
      setShowModal(false);
      setIsClosing(false);
    }, 700); // match animation duration
  };

  // const handleStatusChange = async (status) => {
  //   try {
  //     setLoading(true);
  //     await updateLeave(approveLeave.id, { ...approveLeave, status });
  //     await loadInitialData();
  //     setApproveLeave(null);
  //   } catch (error) {
  //     console.error("Failed to update status:", error);
  //     setError(error.response?.data?.message || "Failed to update status");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleStatusChange = async (status) => {
    try {
      setLoading(true);

      // Create a clean payload with only the status field
      const payload = { status };

      console.log("🔄 Updating status for leave ID:", approveLeave.id);
      console.log("📦 Clean payload:", payload);

      await updateLeave(approveLeave.id, payload);
      await loadInitialData();
      setApproveLeave(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
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
                  setLoading(true);
                  await deleteLeave(id);
                  await loadInitialData();
                  toast.success("Leave deleted successfully.", { icon: false });
                } catch (err) {
                  console.error("Error deleting leave:", err);
                  setError(
                    err.response?.data?.message || "Error deleting leave"
                  );
                } finally {
                  setLoading(false);
                  onClose();
                }
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate days when start or end date changes
    if (
      (name === "start_date" || name === "end_date") &&
      form.start_date &&
      form.end_date
    ) {
      const days = calculateDays(
        name === "start_date" ? value : form.start_date,
        name === "end_date" ? value : form.end_date
      );
      setForm((prev) => ({ ...prev, total_leave_days: days }));
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return "0";
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e)) return "0";
    return (Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1).toString();
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setLoading(true);
  //     setError("");

  //     // Validate required fields
  //     if (
  //       !form.employee_id ||
  //       !form.leave_type_id ||
  //       !form.start_date ||
  //       !form.leave_reason
  //     ) {
  //       setError("Please fill in all required fields");
  //       return;
  //     }

  //     // Prepare payload - ensure we're using business employee_id
  //     const payload = {
  //       employee_id: form.employee_id, // This should be the business employee_id (like "EMP001")
  //       leave_type_id: parseInt(form.leave_type_id),
  //       applied_on: form.applied_on,
  //       start_date: form.start_date,
  //       end_date: form.end_date || form.start_date, // If no end date, use start date
  //       total_leave_days: form.total_leave_days || "1",
  //       leave_reason: form.leave_reason,
  //       remark: form.remark || "",
  //       status: form.status,
  //     };

  //     console.log("Submitting payload:", payload);

  //     if (isEditMode && editId) {
  //       await updateLeave(editId, payload);
  //     } else {
  //       await createLeave(payload);
  //     }

  //     await loadInitialData();
  //     handleCloseModal();
  //   } catch (err) {
  //     console.error("Error submitting leave:", err.response?.data || err);
  //     setError(
  //       err.response?.data?.message ||
  //         "Error submitting leave. Please check your input."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Helper functions

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Validate required fields - remove employee_id validation for edits
      if (!form.leave_type_id || !form.start_date || !form.leave_reason) {
        setError("Please fill in all required fields");
        return;
      }

      // For new leaves, employee_id is required
      if (!isEditMode && !form.employee_id) {
        setError("Employee is required for new leaves");
        return;
      }

      // Prepare payload - don't include employee_id for updates
      const payload = {
        leave_type_id: parseInt(form.leave_type_id),
        applied_on: form.applied_on,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        total_leave_days: form.total_leave_days || "1",
        leave_reason: form.leave_reason,
        remark: form.remark || "",
        status: form.status,
      };

      // Only include employee_id for new leaves, not for updates
      if (!isEditMode) {
        payload.employee_id = form.employee_id;
      }

      console.log("Submitting payload:", payload);
      console.log("Edit ID:", editId);
      console.log("Is Edit Mode:", isEditMode);

      let response;
      if (isEditMode && editId) {
        response = await updateLeave(editId, payload);
        console.log("Update response:", response);
        handleCloseModal();
        toast.success("Leave successfully updated.", { icon: false });
      } else {
        response = await createLeave(payload);
        console.log("Create response:", response);
        handleCloseModal();
        await loadInitialData();
        toast.success("Leave successfully created.", { icon: false });
      }

      await loadInitialData();
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting leave:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Error submitting leave. Please check your input."
      );
    } finally {
      setLoading(false);
    }
  };

  // const getEmployeeName = (employeeId) => {
  //   const employee = employees.find(
  //     (e) => e.employee_id?.toString() === employeeId?.toString()
  //   );
  //   return employee?.name || `ID: ${employeeId}`;
  // };
   const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (e) => e.employee_id?.toString() === employeeId?.toString()
    );

    return employee
      ? `${employee.name} (EMP-ID: ${employee.employee_id})`
      : `ID: ${employeeId}`;
  };

  const getLeaveTypeName = (typeId) => {
    const type = leaveTypes.find(
      (l) => l.id?.toString() === typeId?.toString()
    );
    return type?.title || `ID: ${typeId}`;
  };

  // Filtering
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      getEmployeeName(leave.employee?.employee_id || leave.employee_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      getLeaveTypeName(leave.leave_type_id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (leave.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.leave_reason || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by leave status (Approved, Pending, Rejected)
    const matchesStatusFilter =
      statusFilter === "" || leave.status === statusFilter;

    return matchesSearch && matchesStatusFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / entriesPerPage) || 1;

  const statusBadge = (status) => {
    if (status === "Approved")
      return <span className="badge bg-success">Approved</span>;
    if (status === "Rejected")
      return <span className="badge bg-danger">Rejected</span>;
    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  // if (loading && leaves.length === 0) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center mt-5">
  //       <Spinner animation="border" />
  //     </div>
  //   );
  // }

  return (
    <div className="container mt-4">
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">Manage Leave</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            onClick={handleAddLeave}
            className="btn btn-success"
            disabled={loading}
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Card with Table */}
      <div className="card shadow-sm p-3">
        {/* Controls */}
        <div className="d-flex justify-content-between align-items-end mb-3 flex-wrap gap-2">
          <div className="d-flex gap-4">
            <div className="d-flex align-items-end">
              <Form.Select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: "80px" }}
                disabled={loading}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </div>

            {/* Status Filter */}
            <div className="d-flex flex-column justify-content-center align-items-start">
              <label htmlFor="statusSelect" className="mb-2">
                Status
              </label>
              <Form.Select
                id="statusSelect"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "160px" }}
                disabled={loading}
              >
                {statusOptions.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status === "" ? "Status: All" : `Status: ${status}`}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Form.Control
            className="w-auto mb-0"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "300px" }}
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status" variant="success">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className=" table table-bordered table-hover table-striped   text-center align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Applied On</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Days</th>
                    <th>Leave Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaves.length > 0 ? (
                    currentLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>
                          {getEmployeeName(
                            leave.employee?.employee_id || leave.employee_id
                          )}
                        </td>
                        <td>{getLeaveTypeName(leave.leave_type_id)}</td>
                        <td>
                          {leave.applied_on
                            ? new Date(leave.applied_on).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          {leave.start_date
                            ? new Date(leave.start_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          {leave.end_date
                            ? new Date(leave.end_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>{leave.total_leave_days}</td>
                        <td>{leave.leave_reason}</td>
                        <td>{statusBadge(leave.status)}</td>
                        <td>
                          <OverlayTrigger
                            overlay={<Tooltip>Approve/Reject</Tooltip>}
                          >
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-1"
                              onClick={() => handleApprovePopup(leave)}
                              disabled={loading}
                            >
                              <i className="bi bi-play-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditLeave(leave)}
                              disabled={loading || leave.status !== "Pending"}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(leave.id)}
                              disabled={loading || leave.status !== "Pending"}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No leave data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small>
                Showing {filteredLeaves.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
                to {Math.min(indexOfLastItem, filteredLeaves.length)} of{" "}
                {filteredLeaves.length} entries
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""
                      }`}
                  >
                    <Button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={loading || currentPage === 1}
                    >
                      &laquo;
                    </Button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""
                        }`}
                    >
                      <Button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                        disabled={loading}
                      >
                        {i + 1}
                      </Button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""
                      }`}
                  >
                    <Button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={loading || currentPage === totalPages}
                    >
                      &raquo;
                    </Button>
                  </li>
                </ul>
              </nav>
            </div> */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="small text-muted">
                Showing {filteredLeaves.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
                to {Math.min(indexOfLastItem, filteredLeaves.length)} of{" "}
                {filteredLeaves.length} entries
              </div>
              <div>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={loading || currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                        disabled={loading}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={loading || currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit Leave" : "Create Leave"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label>
                  Employee <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                  disabled={loading || isEditMode}
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.name}(Emp-id:{e.employee_id})
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-6">
                <Form.Label>
                  Leave Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="leave_type_id"
                  value={form.leave_type_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.title}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-6">
                <Form.Label>
                  Applied On <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="applied_on"
                  value={form.applied_on}
                  onChange={handleChange}
                  required
                  max="9999-12-31"
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <Form.Label>
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  max="9999-12-31"
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <Form.Label>
                  End Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                  max="9999-12-31"
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <Form.Label>Total Leave Days</Form.Label>
                <Form.Control
                  type="text"
                  name="total_leave_days"
                  value={
                    form.total_leave_days ||
                    calculateDays(form.start_date, form.end_date)
                  }
                  readOnly
                  disabled={loading}
                />
              </div>
              <div className="col-12">
                <Form.Label>
                  Leave Reason <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="leave_reason"
                  value={form.leave_reason}
                  onChange={handleChange}
                  required
                  placeholder="Enter reason for leave"
                  disabled={loading}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : isEditMode ? (
                "Update Leave"
              ) : (
                "Create Leave"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={!!approveLeave}
        onHide={handleCloseApprove}
        centered
        className={`custom-slide-modal ${
          isApproveClosing ? "closing" : "open"
        }`}
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage Leave Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {approveLeave && (
            <>
              <p>
                <strong>Employee:</strong>{" "}
                {getEmployeeName(
                  approveLeave.employee?.employee_id || approveLeave.employee_id
                )}
              </p>
              <p>
                <strong>Leave Type:</strong>{" "}
                {getLeaveTypeName(approveLeave.leave_type_id)}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {approveLeave.applied_on
                  ? new Date(approveLeave.applied_on).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Duration:</strong> {approveLeave.start_date} to{" "}
                {approveLeave.end_date}
              </p>
              <p>
                <strong>Total Days:</strong> {approveLeave.total_leave_days}
              </p>
              <p>
                <strong>Reason:</strong> {approveLeave.leave_reason}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                {statusBadge(approveLeave.status)}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => handleStatusChange("Approved")}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => handleStatusChange("Rejected")}
            disabled={loading}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            onClick={handleCloseApprove}
            disabled={loading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeaveList;
