// import React, { useEffect, useState } from "react";
// import {
//   getPromotions,
//   createPromotion,
//   updatePromotion,
//   deletePromotion,
//   getEmployees,
//   getDesignations,
// } from "../../../services/hrmService";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added
// import BreadCrumb from "../../../components/BreadCrumb";

// const PromotionList = () => {
//   const [promotions, setPromotions] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate(); // ✅ Added
//   const location = useLocation(); // ✅ Added
//   const [formData, setFormData] = useState({
//     employee_id: "",
//     designation_id: "",
//     promotion_title: "",
//     promotion_date: "",
//     description: "",
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosingModal, setIsClosingModal] = useState(false); // ✅ for animation

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [promotionData, employeeData, designationData] = await Promise.all([
//         getPromotions(),
//         getEmployees(),
//         getDesignations(),
//       ]);

//       setPromotions(Array.isArray(promotionData) ? promotionData : []);
//       setEmployees(Array.isArray(employeeData) ? employeeData : []);
//       setDesignations(Array.isArray(designationData) ? designationData : []);
//     } catch (err) {
//       console.error("Error loading initial data:", err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShow = () => {
//     setFormData({
//       employee_id: "",
//       designation_id: "",
//       promotion_title: "",
//       promotion_date: "",
//       description: "",
//     });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   const handleEdit = (promotion) => {
//     setFormData({
//       employee_id: promotion.employee_id || "",
//       designation_id: promotion.designation_id || "",
//       promotion_title: promotion.promotion_title || "",
//       promotion_date: promotion.promotion_date || "",
//       description: promotion.description || "",
//     });
//     setEditId(promotion.id);
//     setShowModal(true);
//     setError("");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       if (editId) {
//         await updatePromotion(editId, formData);
//       } else {
//         await createPromotion(formData);
//       }

//       setShowModal(false);
//       loadInitialData();
//     } catch (error) {
//       console.error("Error saving promotion:", error);
//       setError(error.response?.data?.message || "Failed to save promotion");
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
//                   setLoading(true); // ✅ show loading state
//                   await deletePromotion(id); // ✅ delete API call
//                   loadInitialData(); // ✅ refresh list
//                 } catch (error) {
//                   console.error("Error deleting promotion:", error);
//                   setError(
//                     error.response?.data?.message ||
//                       "Failed to delete promotion"
//                   );
//                 } finally {
//                   setLoading(false); // ✅ stop loading
//                   onClose(); // ✅ close modal
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

//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 400);
//   };

//   const getEmployeeName = (employeeId) => {
//     const employee = employees.find(
//       (emp) =>
//         emp.employee_id?.toString() === employeeId?.toString() ||
//         emp.id?.toString() === employeeId?.toString()
//     );
//     return employee?.name || employee?.user?.name || "N/A";
//   };

//   // Get designation name by designation_id
//   const getDesignationName = (designationId) => {
//     const designation = designations.find(
//       (des) => des.id?.toString() === designationId?.toString()
//     );
//     return designation?.name || "N/A";
//   };

//   // Filter promotions by search term
//   const filteredPromotions = promotions.filter(
//     (p) =>
//       getEmployeeName(p.employee_id)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getDesignationName(p.designation_id)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       (p.promotion_title || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredPromotions.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredPromotions.length / entriesPerPage);

//   if (loading && promotions.length === 0) {
//     return (
//       <div className="d-flex justify-content-center align-items-center mt-5">
//         <Spinner animation="border" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">
//       {/* ✅ Modal Animation Styles */}
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
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//         <div className="d-flex align-items-center gap-3 flex-wrap">
//           <div>
//             <h4 className="fw-bold mb-0">Manage Promotion</h4>
//             {/* <p className="text-success small mb-0">Dashboard &gt; Promotion</p> */}
//             <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//           </div>
//         </div>
//         <Button
//           className="btn btn-success d-flex align-items-center justify-content-center"
//           style={{ width: "38px", height: "38px", borderRadius: "6px" }}
//           onClick={handleShow}
//           disabled={loading}
//         >
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//       </div>

//       {error && (
//         <Alert variant="danger" onClose={() => setError("")} dismissible>
//           {error}
//         </Alert>
//       )}

//       {/* Table */}
//       <div className="card border-0 shadow-sm rounded-4 p-3 ">
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select form-select-sm"
//               style={{ width: "80px" }}
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               disabled={loading}
//             >
//               {[5, 10, 25, 50, 100].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>
//             <span className="ms-2">entries per page</span>
//           </div>
//           <div className="d-flex align-items-center mb-2">
//             <input
//               type="text"
//               className="form-control form-control-sm"
//               style={{ maxWidth: "250px" }}
//               placeholder="Search by Employee, Designation or Title"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               disabled={loading}
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         ) : (
//           <>
//             <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
//               <table className="table table-borderless align-middle text-nowrap mb-0 table-striped">
//                 <thead className="bg-light">
//                   <tr>
//                     <th>EMPLOYEE NAME</th>
//                     <th>DESIGNATION</th>
//                     <th>PROMOTION TITLE</th>
//                     <th>PROMOTION DATE</th>
//                     <th>DESCRIPTION</th>
//                     <th className="text-center">ACTION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((item) => (
//                       <tr key={item.id}>
//                         <td>{getEmployeeName(item.employee_id)}</td>
//                         <td>{getDesignationName(item.designation_id)}</td>
//                         <td>{item.promotion_title}</td>
//                         <td>
//                           {item.promotion_date
//                             ? new Date(item.promotion_date).toLocaleDateString(
//                                 undefined,
//                                 {
//                                   month: "short",
//                                   day: "numeric",
//                                   year: "numeric",
//                                 }
//                               )
//                             : "N/A"}
//                         </td>
//                         <td>{item.description || "N/A"}</td>
//                         <td className="text-center">
//                           <button
//                             className="btn btn-sm btn-info me-1"
//                             onClick={() => handleEdit(item)}
//                             disabled={loading}
//                           >
//                             <i className="bi bi-pencil-fill text-white"></i>
//                           </button>
//                           <button
//                             className="btn btn-sm btn-danger"
//                             onClick={() => handleDelete(item.id)}
//                             disabled={loading}
//                           >
//                             <i className="bi bi-trash-fill text-white"></i>
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="text-center text-muted">
//                         No promotions found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//               <div className="small text-muted">
//                 Showing {indexOfFirstItem + 1} to{" "}
//                 {Math.min(indexOfLastItem, filteredPromotions.length)} of{" "}
//                 {filteredPromotions.length} entries
//               </div>
//               <nav>
//                 <ul className="pagination pagination-sm mb-0">
//                   {/* Left Arrow */}
//                   <li
//                     className={`page-item ${
//                       currentPage === 1 ? "disabled" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                       disabled={loading}
//                     >
//                       &laquo;
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (num) => (
//                       <li
//                         key={num}
//                         className={`page-item ${
//                           currentPage === num ? "active" : ""
//                         }`}
//                       >
//                         <button
//                           className="page-link"
//                           onClick={() => setCurrentPage(num)}
//                           disabled={loading}
//                         >
//                           {num}
//                         </button>
//                       </li>
//                     )
//                   )}

//                   {/* Right Arrow */}
//                   <li
//                     className={`page-item ${
//                       currentPage === totalPages ? "disabled" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() =>
//                         setCurrentPage((p) => Math.min(p + 1, totalPages))
//                       }
//                       disabled={loading}
//                     >
//                       &raquo;
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={closeModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Promotion" : "Create Promotion"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {error && (
//             <Alert variant="danger" className="mb-3">
//               {error}
//             </Alert>
//           )}
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Employee</Form.Label>
//               <Form.Select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option
//                     key={emp.id || emp.employee_id}
//                     value={emp.employee_id || emp.id}
//                   >
//                     {emp.name || emp.user?.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Designation</Form.Label>
//               <Form.Select
//                 name="designation_id"
//                 value={formData.designation_id}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="">Select Designation</option>
//                 {designations.map((desig) => (
//                   <option key={desig.id} value={desig.id}>
//                     {desig.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Promotion Title</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="promotion_title"
//                 value={formData.promotion_title}
//                 onChange={handleChange}
//                 disabled={loading}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Promotion Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="promotion_date"
//                 value={formData.promotion_date}
//                 onChange={handleChange}
//                 disabled={loading}
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
//                 disabled={loading}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal} disabled={loading}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit} disabled={loading}>
//             {loading ? (
//               <Spinner animation="border" size="sm" />
//             ) : editId ? (
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

// export default PromotionList;

// import React, { useEffect, useState } from "react";
// import {
//   getPromotions,
//   createPromotion,
//   updatePromotion,
//   deletePromotion,
//   getEmployees,
//   getDesignations,
// } from "../../../services/hrmService";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const PromotionList = () => {
//   const [promotions, setPromotions] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [formData, setFormData] = useState({
//     employee_id: "",
//     designation_id: "",
//     promotion_title: "",
//     promotion_date: "",
//     description: "",
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosingModal, setIsClosingModal] = useState(false); // ? for animation

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [promotionData, employeeData, designationData] = await Promise.all([
//         getPromotions(),
//         getEmployees(),
//         getDesignations(),
//       ]);

//       setPromotions(Array.isArray(promotionData) ? promotionData : []);
//       setEmployees(Array.isArray(employeeData) ? employeeData : []);
//       setDesignations(Array.isArray(designationData) ? designationData : []);
//     } catch (err) {
//       console.error("Error loading initial data:", err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShow = () => {
//     setFormData({
//       employee_id: "",
//       designation_id: "",
//       promotion_title: "",
//       promotion_date: "",
//       description: "",
//     });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   const handleEdit = (promotion) => {
//     setFormData({
//       employee_id: promotion.employee_id || "",
//       designation_id: promotion.designation_id || "",
//       promotion_title: promotion.promotion_title || "",
//       promotion_date: promotion.promotion_date || "",
//       description: promotion.description || "",
//     });
//     setEditId(promotion.id);
//     setShowModal(true);
//     setError("");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       if (editId) {
//         await updatePromotion(editId, formData);
//         toast.success("Promotion successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createPromotion(formData);
//         toast.success("Promotion successfully created.", {
//           icon: false,
//         });
//       }

//       setShowModal(false);
//       loadInitialData();
//     } catch (error) {
//       console.error("Error saving promotion:", error);
//       setError(error.response?.data?.message || "Failed to save promotion");
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
//                   setLoading(true); // ? show loading state
//                   await deletePromotion(id); // ? delete API call
//                   loadInitialData(); // ? refresh list
//                   toast.success("Transfer deletd successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting promotion:", error);
//                   setError(
//                     error.response?.data?.message ||
//                     "Failed to delete promotion"
//                   );
//                 } finally {
//                   setLoading(false); // ? stop loading
//                   onClose(); // ? close modal
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

//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 400);
//   };

//   const getEmployeeName = (employeeId) => {
//     const employee = employees.find(
//       (emp) =>
//         emp.employee_id?.toString() === employeeId?.toString() ||
//         emp.id?.toString() === employeeId?.toString()
//     );
//     return employee?.name || employee?.user?.name || "N/A";
//   };

//   // Get designation name by designation_id
//   const getDesignationName = (designationId) => {
//     const designation = designations.find(
//       (des) => des.id?.toString() === designationId?.toString()
//     );
//     return designation?.name || "N/A";
//   };

//   // Filter promotions by search term
//   const filteredPromotions = promotions.filter(
//     (p) =>
//       getEmployeeName(p.employee_id)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getDesignationName(p.designation_id)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       (p.promotion_title || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredPromotions.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredPromotions.length / entriesPerPage);

//   if (loading && promotions.length === 0) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{height:"100vh"

//       }}>
//         <Spinner animation="border" variant="success" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">

//       {/* ✅ Green border + glow only for entries dropdown */}

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
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//         <div className="d-flex align-items-center gap-3 flex-wrap">
//           <div>
//             <h4 className="fw-bold mb-0">Manage Promotion</h4>
//             {/* <p className="text-success small mb-0">Dashboard > Promotion</p> */}
//             <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//           </div>
//         </div>
//          <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button
//             className="btn btn-success"
//             onClick={handleShow}
//             disabled={loading}
//           >
//             <i className="bi bi-plus-lg "></i>{" "}
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {error && (
//         <Alert variant="danger" onClose={() => setError("")} dismissible>
//           {error}
//         </Alert>
//       )}

//       {/* Table */}
//       <div className="card border-0 shadow-sm rounded-4 p-3 ">
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">

//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               style={{ width: "80px", height:"40px" }}
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               disabled={loading}
//             >
//               {[10, 25, 50, 100].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>

//           </div>

//           <div className="d-flex align-items-center mb-2">
//             <input
//               type="text"
//               className="form-control form-control-sm "
//               style={{ maxWidth: "250px" }}
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               disabled={loading}
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         ) : (
//           <>
//             <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
//               <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
//                 <thead className="bg-light">
//                   <tr>
//                     <th>EMPLOYEE NAME</th>
//                     <th>DESIGNATION</th>
//                     <th>PROMOTION TITLE</th>
//                     <th>PROMOTION DATE</th>
//                     <th>DESCRIPTION</th>
//                     <th className="text-center">ACTION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((item) => (
//                       <tr key={item.id}>
//                         <td>{getEmployeeName(item.employee_id)}</td>
//                         <td>{getDesignationName(item.designation_id)}</td>
//                         <td>{item.promotion_title}</td>
//                         <td>
//                           {item.promotion_date
//                             ? new Date(item.promotion_date).toLocaleDateString(
//                               undefined,
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                               }
//                             )
//                             : "N/A"}
//                         </td>
//                         <td>{item.description || "N/A"}</td>
//                         <td className="text-center">
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Edit</Tooltip>}
//                           >
//                             <button
//                               className="btn btn-sm btn-info me-1"
//                               onClick={() => handleEdit(item)}
//                               disabled={loading}
//                             >
//                               <i className="bi bi-pencil-fill text-white"></i>
//                             </button>
//                           </OverlayTrigger>
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Delete</Tooltip>}
//                           >
//                             <button
//                               className="btn btn-sm btn-danger"
//                               onClick={() => handleDelete(item.id)}
//                               disabled={loading}
//                             >
//                               <i className="bi bi-trash-fill text-white"></i>
//                             </button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="text-center text-muted">
//                         No promotions found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//               <div className="small text-muted">
//                 Showing {indexOfFirstItem + 1} to{" "}
//                 {Math.min(indexOfLastItem, filteredPromotions.length)} of{" "}
//                 {filteredPromotions.length} entries
//               </div>
//               <nav>
//                 <ul className="pagination pagination-sm mb-0">
//                   {/* Left Arrow */}
//                   <li
//                     className={`page-item ${currentPage === 1 ? "disabled" : ""
//                       }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                       disabled={loading}
//                     >
//                       «
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (num) => (
//                       <li
//                         key={num}
//                         className={`page-item ${currentPage === num ? "active" : ""
//                           }`}
//                       >
//                         <button
//                           className="page-link"
//                           onClick={() => setCurrentPage(num)}
//                           disabled={loading}
//                         >
//                           {num}
//                         </button>
//                       </li>
//                     )
//                   )}

//                   {/* Right Arrow */}
//                   <li
//                     className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                       }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() =>
//                         setCurrentPage((p) => Math.min(p + 1, totalPages))
//                       }
//                       disabled={loading}
//                     >
//                       »
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={closeModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Promotion" : "Create Promotion"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {error && (
//             <Alert variant="danger" className="mb-3">
//               {error}
//             </Alert>
//           )}
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Employee <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option
//                     key={emp.id || emp.employee_id}
//                     value={emp.employee_id || emp.id}
//                   >
//                     {emp.name || emp.user?.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="designation_id"
//                 value={formData.designation_id}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="">Select Designation</option>
//                 {designations.map((desig) => (
//                   <option key={desig.id} value={desig.id}>
//                     {desig.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Promotion Title</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="promotion_title"
//                 value={formData.promotion_title}
//                 onChange={handleChange}
//                 disabled={loading}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Promotion Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="promotion_date"
//                 value={formData.promotion_date}
//                 onChange={handleChange}
//                 disabled={loading}
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
//                 disabled={loading}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal} disabled={loading}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit} disabled={loading}>
//             {loading ? (
//               <Spinner animation="border" size="sm" />
//             ) : editId ? (
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

// export default PromotionList;

import React, { useEffect, useState } from "react";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getEmployees,
  getDesignations,
} from "../../../services/hrmService";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate(); // ? Added
  const location = useLocation(); // ? Added
  const [formData, setFormData] = useState({
    employee_id: "",
    designation_id: "",
    promotion_title: "",
    promotion_date: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosingModal, setIsClosingModal] = useState(false); // ? for animation

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [promotionData, employeeData, designationData] = await Promise.all([
        getPromotions(),
        getEmployees(),
        getDesignations(),
      ]);

      // ✅ Filter only active employees
      const activeEmployees = (employeeData || []).filter(
        (emp) => emp.is_active === true
      );

      console.log("Total employees:", employeeData.length);
      console.log("Active employees:", activeEmployees.length);

      setPromotions(Array.isArray(promotionData) ? promotionData : []);
      setEmployees(activeEmployees); // ✅ set only active ones

      setDesignations(Array.isArray(designationData) ? designationData : []);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setFormData({
      employee_id: "",
      designation_id: "",
      promotion_title: "",
      promotion_date: "",
      description: "",
    });
    setEditId(null);
    setShowModal(true);
    setError("");
  };

  const handleEdit = (promotion) => {
    setFormData({
      employee_id: promotion.employee_id || "",
      designation_id: promotion.designation_id || "",
      promotion_title: promotion.promotion_title || "",
      promotion_date: promotion.promotion_date || "",
      description: promotion.description || "",
    });
    setEditId(promotion.id);
    setShowModal(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (editId) {
        await updatePromotion(editId, formData);
        toast.success("Promotion successfully updated.", {
          icon: false,
        });
      } else {
        await createPromotion(formData);
        toast.success("Promotion successfully created.", {
          icon: false,
        });
      }

      setShowModal(false);
      loadInitialData();
    } catch (error) {
      console.error("Error saving promotion:", error);
      setError(error.response?.data?.message || "Failed to save promotion");
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
                  setLoading(true); // ? show loading state
                  await deletePromotion(id); // ? delete API call
                  loadInitialData(); // ? refresh list
                  toast.success("Transfer deletd successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting promotion:", error);
                  setError(
                    error.response?.data?.message ||
                      "Failed to delete promotion"
                  );
                } finally {
                  setLoading(false); // ? stop loading
                  onClose(); // ? close modal
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

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  // const getEmployeeName = (employeeId) => {
  //   const employee = employees.find(
  //     (emp) =>
  //       emp.employee_id?.toString() === employeeId?.toString() ||
  //       emp.id?.toString() === employeeId?.toString()
  //   );
  //   return employee?.name || employee?.user?.name || "N/A";
  // };

  // Get designation name by designation_id

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) =>
        emp.employee_id?.toString() === employeeId?.toString() ||
        emp.id?.toString() === employeeId?.toString()
    );

    if (!employee) return `Employee ID: ${employeeId}`;

    return `${employee.user?.name || employee.name} (EMP-ID: ${
      employee.employee_id || employee.id
    })`;
  };

  const getDesignationName = (designationId) => {
    const designation = designations.find(
      (des) => des.id?.toString() === designationId?.toString()
    );
    return designation?.name || "N/A";
  };

  // Filter promotions by search term
  const filteredPromotions = promotions.filter(
    (p) =>
      getEmployeeName(p.employee_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getDesignationName(p.designation_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.promotion_title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredPromotions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPromotions.length / entriesPerPage);

  return (
    <div className="container mt-4">
      {/* ✅ Green border + glow only for entries dropdown */}

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div>
            <h4 className="fw-bold">Manage Promotion</h4>
            {/* <p className="text-success small mb-0">Dashboard > Promotion</p> */}
            <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
          </div>
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button
            className="btn btn-success"
            onClick={handleShow}
            disabled={loading}
          >
            <i className="bi bi-plus-lg "></i>{" "}
          </Button>
        </OverlayTrigger>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 p-3 ">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="d-flex align-items-center mb-2">
            <select
              className="form-select me-2"
              style={{ width: "80px", height: "40px" }}
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control form-control-sm mb-0"
              style={{ maxWidth: "200px" }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          </div>
        </div>

        <>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status" variant="success">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                className="table table-bordered table-hover table-striped text-center align-middle mb-0"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead className="bg-light">
                  <tr>
                    <th>EMPLOYEE NAME</th>
                    <th>DESIGNATION</th>
                    <th>PROMOTION TITLE</th>
                    <th>PROMOTION DATE</th>
                    <th>DESCRIPTION</th>
                    <th className="text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{getEmployeeName(item.employee_id)}</td>
                        <td>{getDesignationName(item.designation_id)}</td>
                        <td>{item.promotion_title}</td>
                        <td>
                          {item.promotion_date
                            ? new Date(item.promotion_date).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            width: "250px", // fixed width
                            whiteSpace: "normal", // allow wrapping
                            wordWrap: "break-word",
                            // break long words
                          }}
                        >
                          {item.description || "N/A"}
                        </td>
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn btn-sm btn-info me-1"
                              onClick={() => handleEdit(item)}
                              disabled={loading}
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
                              onClick={() => handleDelete(item.id)}
                              disabled={loading}
                            >
                              <i className="bi bi-trash-fill text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No promotions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <div className="small text-muted">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredPromotions.length)} of{" "}
              {filteredPromotions.length} entries
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                {/* Left Arrow */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={loading}
                  >
                    «
                  </button>
                </li>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <li
                      key={num}
                      className={`page-item ${
                        currentPage === num ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(num)}
                        disabled={loading}
                      >
                        {num}
                      </button>
                    </li>
                  )
                )}

                {/* Right Arrow */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={loading}
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Promotion" : "Create Promotion"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option
                    key={emp.id || emp.employee_id}
                    value={emp.employee_id || emp.id}
                  >
                    {emp.name || emp.user?.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Designation <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="designation_id"
                value={formData.designation_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Designation</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Promotion Title</Form.Label>
              <Form.Control
                type="text"
                name="promotion_title"
                value={formData.promotion_title}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Promotion Date</Form.Label>
              <Form.Control
                type="date"
                name="promotion_date"
                value={formData.promotion_date}
                onChange={handleChange}
                max="9999-12-31"
                disabled={loading}
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
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : editId ? (
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

export default PromotionList;
