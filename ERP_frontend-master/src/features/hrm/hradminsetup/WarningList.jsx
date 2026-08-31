// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form, Table } from "react-bootstrap";
// import {
//   getWarnings,
//   createWarning,
//   updateWarning,
//   deleteWarning,
//   getEmployees,
// } from "../../../services/hrmService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const WarningList = () => {
//   const [warnings, setWarnings] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingWarning, setEditingWarning] = useState(null);
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [formData, setFormData] = useState({
//     warning_to: "",
//     warning_by: "",
//     subject: "",
//     warning_date: "",
//     description: "",
//   });

//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
//   const fetchData = async () => {
//     const warningData = await getWarnings();
//     const employeeData = await getEmployees();
//     setWarnings(warningData);
//     setEmployees(employeeData);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const getEmployeeName = (id) => {
//     if (!id) return "N/A";
//     const emp = employees.find(
//       (e) => Number(e.employee_id) === Number(id) || Number(e.id) === Number(id)
//     );
//     return emp ? emp.name : "N/A";
//   };

//   const getEmployeeId = (employee) => {
//     return Number(employee.employee_id) || Number(employee.id);
//   };

//   const handleShowModal = (warning = null) => {
//     if (warning) {
//       setEditingWarning(warning);
//       setFormData({
//         warning_to: warning.warning_to.toString(),
//         warning_by: warning.warning_by.toString(),
//         subject: warning.subject || "",
//         warning_date: warning.warning_date?.slice(0, 10) || "",
//         description: warning.description || "",
//       });
//     } else {
//       setEditingWarning(null);
//       setFormData({
//         warning_to: "",
//         warning_by: "",
//         subject: "",
//         warning_date: "",
//         description: "",
//       });
//     }
//     setShowModal(true);
//   };

//   const filteredWarnings = warnings.filter(
//     (w) =>
//       getEmployeeName(w.warning_to)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getEmployeeName(w.warning_by)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       w.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       w.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredWarnings.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredWarnings.length / entriesPerPage);

//   // const handleCloseModal = () => {
//   //   setShowModal(false);
//   //   setEditingWarning(null);
//   // };
//   // ? Modal close with animation
//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setEditingWarning(null);
//     }, 400);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       // Prepare the payload - remove any empty fields and ensure proper data types
//       const payload = {
//         warning_to: parseInt(formData.warning_to),
//         warning_by: parseInt(formData.warning_by),
//         subject: formData.subject,
//         warning_date: formData.warning_date,
//         description: formData.description,
//       };

//       // Remove empty fields
//       Object.keys(payload).forEach((key) => {
//         if (
//           payload[key] === "" ||
//           payload[key] === null ||
//           payload[key] === undefined
//         ) {
//           delete payload[key];
//         }
//       });

//       if (editingWarning) {
//         await updateWarning(editingWarning.id, payload);
//         toast.success("Warning successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createWarning(payload);
//         toast.success("Warning successfully created.", {
//           iconWarning,
//         });
//       }
//       fetchData();
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error saving warning:", error);
//       alert(`Error: ${error.response?.data?.message || error.message}`);
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
//                   await deleteWarning(id); // ? warning deletion
//                   fetchData(); // ? refresh data
//                   toast.success("Warning deleted successfully.", {
//                     iconWarning,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting warning:", error);
//                   alert(
//                     `Error: ${error.response?.data?.message || error.message}`
//                   );
//                 }
//                 onClose();
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
//     <div className="container py-4">
//       {/* ? Modal Animation Styles */}
//       <style>{`
//         @keyframes slideInUp {
//           from { transform: translateY(100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes slideOutUp {
//           from { transform: translateY(0); opacity: 1; }
//           to { transform: translateY(-100%); opacity: 0; }
//         }
//         .custom-slide-modal.open .modal-dialog {
//           animation: slideInUp 0.7s ease forwards;
//         }
//         .custom-slide-modal.closing .modal-dialog {
//           animation: slideOutUp 0.7s ease forwards;
//         }
//       `}</style>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h5 className="fw-bold mb-1">Manage Warning</h5>
//           {/* <span className="text-success small">Dashboard</span> >{" "} */}
//           {/* <span className="text-muted small">Warnings</span> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <Button
//           className="btn btn-success d-flex align-items-center justify-content-center"
//           style={{ width: "38px", height: "38px", borderRadius: "6px" }}
//           onClick={() => handleShowModal()}
//         >
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//       </div>

//       <div className="card shadow-sm border-0">
//         <div className="card-body">
//           {/* Search and entries per page */}
//           <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//             <div className="d-flex align-items-center mb-4">
//               <select
//                 className="form-select form-select-sm"
//                 style={{ width: "60px" }}
//                 value={entriesPerPage}
//                 onChange={(e) => {
//                   setEntriesPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//               >
//                 {[5, 10, 25, 50, 100].map((n) => (
//                   <option key={n} value={n}>
//                     {n}
//                   </option>
//                 ))}
//               </select>
//               <span className="ms-2">entries per page</span>
//             </div>
//             <div className="mb-2">
//               <input
//                 type="text"
//                 className="form-control form-control-sm"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </div>

//           {/* Table */}
//           <div className="table-responsive">
//             <Table
//               bordered
//               hover
//               size="sm"
//               className="text-center align-middle table-striped"
//             >
//               <thead className="table-light">
//                 <tr>
//                   <th>Warning To</th>
//                   <th>Warning By</th>
//                   <th>Subject</th>
//                   <th>Warning Date</th>
//                   <th>Description</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentData.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-muted">
//                       No warnings found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentData.map((warning) => (
//                     <tr key={warning.id}>
//                       <td>{getEmployeeName(warning.warning_to)}</td>
//                       <td>{getEmployeeName(warning.warning_by)}</td>
//                       <td>{warning.subject}</td>
//                       <td>
//                         {new Date(warning.warning_date).toLocaleDateString()}
//                       </td>
//                       <td>{warning.description}</td>
//                       <td>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-info me-1"
//                             style={{
//                               backgroundColor: "#00BCD4",
//                               border: "none",
//                             }}
//                             onClick={() => handleShowModal(warning)}
//                           >
//                             <i className="bi bi-pencil-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-danger"
//                             style={{
//                               backgroundColor: "#F44336",
//                               border: "none",
//                             }}
//                             onClick={() => handleDelete(warning.id)}
//                           >
//                             <i className="bi bi-trash-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </Table>

//             {/* Pagination Footer */}
//             <div className="d-flex justify-content-between align-items-center">
//               <div className="small text-muted">
//                 Showing {filteredWarnings.length === 0 ? 0 : indexOfFirst + 1}{" "}
//                 to {Math.min(indexOfLast, filteredWarnings.length)} of{" "}
//                 {filteredWarnings.length} entries
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
//                     >
//                       «
//                     </button>
//                   </li>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <li
//                       key={i + 1}
//                       className={`page-item ${
//                         currentPage === i + 1 ? "active" : ""
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => setCurrentPage(i + 1)}
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
//                     >
//                       »
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingWarning ? "Edit Warning" : "Create Warning"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Warning To</Form.Label>
//               <Form.Select
//                 name="warning_to"
//                 value={formData.warning_to}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   // <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                   //   {emp.name}
//                   // </option>

//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Warning By</Form.Label>
//               <Form.Select
//                 name="warning_by"
//                 value={formData.warning_by}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Subject</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Warning Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="warning_date"
//                 value={formData.warning_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editingWarning ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default WarningList;

// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form, Table } from "react-bootstrap";
// import {
//   getWarnings,
//   createWarning,
//   updateWarning,
//   deleteWarning,
//   getEmployees,
// } from "../../../services/hrmService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const WarningList = () => {
//   const [warnings, setWarnings] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingWarning, setEditingWarning] = useState(null);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [formData, setFormData] = useState({
//     warning_to: "",
//     warning_by: "",
//     subject: "",
//     warning_date: "",
//     description: "",
//   });

//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
//   const fetchData = async () => {
//     const warningData = await getWarnings();
//     const employeeData = await getEmployees();
//     setWarnings(warningData);
//     setEmployees(employeeData);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const getEmployeeName = (id) => {
//     if (!id) return "N/A";
//     const emp = employees.find(
//       (e) => Number(e.employee_id) === Number(id) || Number(e.id) === Number(id)
//     );
//     return emp ? emp.name : "N/A";
//   };

//   const getEmployeeId = (employee) => {
//     return Number(employee.employee_id) || Number(employee.id);
//   };

//   const handleShowModal = (warning = null) => {
//     if (warning) {
//       setEditingWarning(warning);
//       setFormData({
//         warning_to: warning.warning_to.toString(),
//         warning_by: warning.warning_by.toString(),
//         subject: warning.subject || "",
//         warning_date: warning.warning_date?.slice(0, 10) || "",
//         description: warning.description || "",
//       });
//     } else {
//       setEditingWarning(null);
//       setFormData({
//         warning_to: "",
//         warning_by: "",
//         subject: "",
//         warning_date: "",
//         description: "",
//       });
//     }
//     setShowModal(true);
//   };

//   const filteredWarnings = warnings.filter(
//     (w) =>
//       getEmployeeName(w.warning_to)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getEmployeeName(w.warning_by)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       w.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       w.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredWarnings.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredWarnings.length / entriesPerPage);

//   // const handleCloseModal = () => {
//   //   setShowModal(false);
//   //   setEditingWarning(null);
//   // };
//   // ? Modal close with animation
//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setEditingWarning(null);
//     }, 400);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       // Prepare the payload - remove any empty fields and ensure proper data types
//       const payload = {
//         warning_to: parseInt(formData.warning_to),
//         warning_by: parseInt(formData.warning_by),
//         subject: formData.subject,
//         warning_date: formData.warning_date,
//         description: formData.description,
//       };

//       // Remove empty fields
//       Object.keys(payload).forEach((key) => {
//         if (
//           payload[key] === "" ||
//           payload[key] === null ||
//           payload[key] === undefined
//         ) {
//           delete payload[key];
//         }
//       });

//       if (editingWarning) {
//         await updateWarning(editingWarning.id, payload);
//         toast.success("Warning successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createWarning(payload);
//         toast.success("Warning successfully created.", {
//           icon: false,
//         });
//       }
//       fetchData();
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error saving warning:", error);
//       alert(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
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
//                   await deleteWarning(id); // ? warning deletion
//                   fetchData(); // ? refresh data
//                   toast.success("Warning deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting warning:", error);
//                   alert(
//                     `Error: ${error.response?.data?.message || error.message}`
//                   );
//                 }
//                 onClose();
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
//     <div className="container py-4">

//       {/* ✅ Green border + glow only for entries dropdown */}
//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
//       {/* ? Modal Animation Styles */}
//       <style>{`
//         @keyframes slideInUp {
//           from { transform: translateY(100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes slideOutUp {
//           from { transform: translateY(0); opacity: 1; }
//           to { transform: translateY(-100%); opacity: 0; }
//         }
//         .custom-slide-modal.open .modal-dialog {
//           animation: slideInUp 0.7s ease forwards;
//         }
//         .custom-slide-modal.closing .modal-dialog {
//           animation: slideOutUp 0.7s ease forwards;
//         }
//       `}</style>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h5 className="fw-bold mb-1">Manage Warning</h5>
//           {/* <span className="text-success small">Dashboard</span> >{" "} */}
//           {/* <span className="text-muted small">Warnings</span> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//          <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//         <Button
//           className="btn btn-success "
//           onClick={() => handleShowModal()}
//         >
//           <i className="bi bi-plus-lg "></i>
//         </Button>
//         </OverlayTrigger>
//       </div>

//       <div className="card shadow-sm border-0">
//         <div className="card-body">
//           {/* Search and entries per page */}
//           <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">

//              <div className="d-flex align-items-center mb-4">
//               <select
//                 className="form-select me-2"
//                 style={{ width: "80px", height:"40px" }}
//                 value={entriesPerPage}
//                 onChange={(e) => {
//                   setEntriesPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//               >
//                 {[10, 25, 50, 100].map((n) => (
//                   <option key={n} value={n}>
//                     {n}
//                   </option>
//                 ))}
//               </select>

//             </div>

//             <div className="mb-2">
//               <input
//                 type="text"
//                 className="form-control form-control-sm "
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </div>

//           {/* Table */}
//           <div className="table-responsive">
//             <Table
//               bordered
//               hover
//               size="sm"
//               className="text-center align-middle table-striped"
//             >
//               <thead className="table-light">
//                 <tr>
//                   <th>Warning To</th>
//                   <th>Warning By</th>
//                   <th>Subject</th>
//                   <th>Warning Date</th>
//                   <th>Description</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentData.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-muted">
//                       No warnings found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentData.map((warning) => (
//                     <tr key={warning.id}>
//                       <td>{getEmployeeName(warning.warning_to)}</td>
//                       <td>{getEmployeeName(warning.warning_by)}</td>
//                       <td>{warning.subject}</td>
//                       <td>
//                         {new Date(warning.warning_date).toLocaleDateString()}
//                       </td>
//                       <td>{warning.description}</td>
//                       <td>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-info me-1"
//                             style={{
//                               backgroundColor: "#00BCD4",
//                               border: "none",
//                             }}
//                             onClick={() => handleShowModal(warning)}
//                           >
//                             <i className="bi bi-pencil-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-danger"
//                             style={{
//                               backgroundColor: "#F44336",
//                               border: "none",
//                             }}
//                             onClick={() => handleDelete(warning.id)}
//                           >
//                             <i className="bi bi-trash-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </Table>

//             {/* Pagination Footer */}
//             <div className="d-flex justify-content-between align-items-center">
//               <div className="small text-muted ms-2">
//                 Showing {filteredWarnings.length === 0 ? 0 : indexOfFirst + 1}{" "}
//                 to {Math.min(indexOfLast, filteredWarnings.length)} of{" "}
//                 {filteredWarnings.length} entries
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
//                     >
//                       «
//                     </button>
//                   </li>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <li
//                       key={i + 1}
//                       className={`page-item ${
//                         currentPage === i + 1 ? "active" : ""
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => setCurrentPage(i + 1)}
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
//                     >
//                       »
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {/* <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingWarning ? "Edit Warning" : "Create Warning"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Warning To</Form.Label>
//               <Form.Select
//                 name="warning_to"
//                 value={formData.warning_to}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   // <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                   //   {emp.name}
//                   // </option>

//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Warning By</Form.Label>
//               <Form.Select
//                 name="warning_by"
//                 value={formData.warning_by}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Subject</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Warning Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="warning_date"
//                 value={formData.warning_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editingWarning ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>

//       </Modal> */}

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingWarning ? "Edit Warning" : "Add Warning"}
//           </Modal.Title>
//         </Modal.Header>
//         <Form
//           onSubmit={(e) => {
//             e.preventDefault(); // prevent full page reload
//             handleSubmit();
//           }}
//         >
//           <Modal.Body>
//             {/* Warning To */}
//             <Form.Group className="mb-3">
//               <Form.Label>Warning To <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="warning_to"
//                 value={formData.warning_to}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             {/* Warning By */}
//             <Form.Group className="mb-3">
//               <Form.Label>Warning By <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="warning_by"
//                 value={formData.warning_by}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             {/* Subject */}
//             <Form.Group className="mb-3">
//               <Form.Label>Subject</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleChange}
//                 placeholder="Enter subject"
//               />
//             </Form.Group>

//             {/* Warning Date */}
//             <Form.Group className="mb-3">
//               <Form.Label>Warning Date <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="date"
//                 name="warning_date"
//                 value={formData.warning_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             {/* Description */}
//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Enter description"
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button variant="success" type="submit">
//               {editingWarning ? "Update" : "Create"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default WarningList;

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import {
  getWarnings,
  createWarning,
  updateWarning,
  deleteWarning,
  getEmployees,
} from "../../../services/hrmService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const WarningList = () => {
  const [warnings, setWarnings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const navigate = useNavigate(); // ? Added
  const location = useLocation(); // ? Added
  const [formData, setFormData] = useState({
    warning_to: "",
    warning_by: "",
    subject: "",
    warning_date: "",
    description: "",
  });

  const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
  // const fetchData = async () => {
  //   const warningData = await getWarnings();
  //   const employeeData = await getEmployees();
  //   setWarnings(warningData);
  //   setEmployees(employeeData);
  //   setFilteredEmployees(employeeData);
  //   setLoading(false);
  // };

  const fetchData = async () => {
    try {
      const [warningData, employeeData] = await Promise.all([
        getWarnings(),
        getEmployees(),
      ]);

      // ✅ Filter only active employees
      const activeEmployees = Array.isArray(employeeData)
        ? employeeData.filter((emp) => emp.is_active === true)
        : [];

      console.log("Total employees:", employeeData.length);
      console.log("Active employees:", activeEmployees.length);

      setWarnings(Array.isArray(warningData) ? warningData : []);
      setEmployees(activeEmployees);
      setFilteredEmployees(activeEmployees);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const getEmployeeName = (id) => {
  //   if (!id) return "N/A";
  //   const emp = employees.find(
  //     (e) => Number(e.employee_id) === Number(id) || Number(e.id) === Number(id)
  //   );
  //   return emp ? emp.name : "N/A";
  // };

  const getEmployeeName = (id) => {
    if (!id) return "N/A";
    const emp = employees.find(
      (e) => Number(e.employee_id) === Number(id) || Number(e.id) === Number(id)
    );
    return emp ? `${emp.name} (EMP-ID: ${emp.employee_id || emp.id})` : "N/A";
  };
  const getEmployeeId = (employee) => {
    return Number(employee.employee_id) || Number(employee.id);
  };

  const handleShowModal = (warning = null) => {
    if (warning) {
      setEditingWarning(warning);
      setFormData({
        warning_to: warning.warning_to.toString(),
        warning_by: warning.warning_by.toString(),
        subject: warning.subject || "",
        warning_date: warning.warning_date?.slice(0, 10) || "",
        description: warning.description || "",
      });
    } else {
      setEditingWarning(null);
      setFormData({
        warning_to: "",
        warning_by: "",
        subject: "",
        warning_date: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const filteredWarnings = warnings.filter(
    (w) =>
      getEmployeeName(w.warning_to)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getEmployeeName(w.warning_by)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      w.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredWarnings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredWarnings.length / entriesPerPage);

  // const handleCloseModal = () => {
  //   setShowModal(false);
  //   setEditingWarning(null);
  // };
  // ? Modal close with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingWarning(null);
    }, 400);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Prepare the payload - remove any empty fields and ensure proper data types
      const payload = {
        warning_to: parseInt(formData.warning_to),
        warning_by: parseInt(formData.warning_by),
        subject: formData.subject,
        warning_date: formData.warning_date,
        description: formData.description,
      };

      // Remove empty fields
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === "" ||
          payload[key] === null ||
          payload[key] === undefined
        ) {
          delete payload[key];
        }
      });

      if (editingWarning) {
        await updateWarning(editingWarning.id, payload);
        toast.success("Warning successfully updated.", {
          icon: false,
        });
      } else {
        await createWarning(payload);
        toast.success("Warning successfully created.", {
          icon: false,
        });
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving warning:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          {/* <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div> */}
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
                  await deleteWarning(id); // ? warning deletion
                  fetchData(); // ? refresh data
                  toast.success("Warning deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting warning:", error);
                  alert(
                    `Error: ${error.response?.data?.message || error.message}`
                  );
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

  useEffect(() => {
    if (formData.warning_to == "") {
      return;
    }

    function getFilteredEmployes(id) {
      let data = employees;
      let filteredArray = [];
      let i = 0;
      for (i; i < data?.length - 1; i++) {
        if (id != data[i].employee_id) {
          filteredArray.push(data[i]);
        }
      }
      console.log(filteredArray);
      setFilteredEmployees(filteredArray);
    }
    getFilteredEmployes(formData.warning_to);
  }, [formData.warning_to]);

  return (
    <div className="container py-4">
      {/* ✅ Green border + glow only for entries dropdown */}
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
      {/* ? Modal Animation Styles */}
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Warning</h4>
          {/* <span className="text-success small">Dashboard</span> >{" "} */}
          {/* <span className="text-muted small">Warnings</span> */}
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button
            className="btn btn-success "
            onClick={() => handleShowModal()}
          >
            <i className="bi bi-plus-lg "></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* Search and entries per page */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <div className="d-flex align-items-center mb-4">
              <select
                className="form-select me-2"
                style={{ width: "80px", height: "40px" }}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm "
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table */}

          <div className="table-responsive">
            {loading ? (
              <div className="text-center p-4">
                <Spinner animation="border" role="status" variant="success">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <Table
                bordered
                hover
                size="sm"
                className="text-center align-middle table-striped"
              >
                <thead className="table-light ">
                  <tr>
                    <th>Warning To</th>
                    <th>Warning By</th>
                    <th>Subject</th>
                    <th>Warning Date</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-muted">
                        No warnings found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((warning) => (
                      <tr key={warning.id + "asd"}>
                        <td>{getEmployeeName(warning.warning_to)}</td>
                        <td>{getEmployeeName(warning.warning_by)}</td>
                        <td>{warning.subject}</td>
                        <td>
                          {new Date(warning.warning_date).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            width: "100px",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {warning.description}
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn btn-sm btn-info me-1"
                              style={{
                                backgroundColor: "#00BCD4",
                                border: "none",
                              }}
                              onClick={() => handleShowModal(warning)}
                            >
                              <i className="bi bi-pencil-fill text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(warning.id)}
                            >
                              <i className="bi bi-trash-fill text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
            {/* Pagination Footer */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted ms-2">
                Showing {filteredWarnings.length === 0 ? 0 : indexOfFirst + 1}{" "}
                to {Math.min(indexOfLast, filteredWarnings.length)} of{" "}
                {filteredWarnings.length} entries
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
                    >
                      «
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
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
                    >
                      »
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {/* <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWarning ? "Edit Warning" : "Create Warning"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Warning To</Form.Label>
              <Form.Select
                name="warning_to"
                value={formData.warning_to}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  // <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
                  //   {emp.name}
                  // </option>

                  <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
                    {emp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Warning By</Form.Label>
              <Form.Select
                name="warning_by"
                value={formData.warning_by}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
                    {emp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Warning Date</Form.Label>
              <Form.Control
                type="date"
                name="warning_date"
                value={formData.warning_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editingWarning ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
        
      </Modal> */}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWarning ? "Edit Warning" : "Add Warning"}
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault(); // prevent full page reload
            handleSubmit();
          }}
        >
          <Modal.Body>
            {/* Warning To */}
            <Form.Group className="mb-3">
              <Form.Label>
                Warning To <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="warning_to"
                value={formData.warning_to}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
                    {emp.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Warning By */}
            <Form.Group className="mb-3">
              <Form.Label>
                Warning By <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="warning_by"
                value={formData.warning_by}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {filteredEmployees.map((emp) => (
                  <option key={getEmployeeId(emp)} value={getEmployeeId(emp)}>
                    {emp.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Subject */}
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
              />
            </Form.Group>

            {/* Warning Date */}
            <Form.Group className="mb-3">
              <Form.Label>
                Warning Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="warning_date"
                value={formData.warning_date}
                onChange={handleChange}
                max="9999-12-31"
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              {editingWarning ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default WarningList;
