// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import {
//   getHolidays,
//   createHoliday,
//   updateHoliday,
//   deleteHoliday,
// } from "../../../services/hrmService";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom";
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const HolidaysList = () => {
//   const [holidays, setHolidays] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [formData, setFormData] = useState({
//     date: "",
//     end_date: "",
//     occasion: "",
//   });

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   useEffect(() => {
//     fetchHolidays();
//   }, []);

//   const fetchHolidays = async () => {
//     const data = await getHolidays();
//     setHolidays(data);
//   };

//   const filteredData = holidays.filter((holiday) =>
//     holiday.occasion?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state

//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredData.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editId) {
//         await updateHoliday(editId, formData);
//         toast.success("Holiday successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createHoliday(formData);
//         toast.success("Holiday successfully created.", {
//           icon: false,
//         });
//       }
//       await fetchHolidays();
//       handleClose();
//     } catch (error) {
//       console.error("Failed to save holiday:", error);
//     }
//   };

//   const handleEdit = (holiday) => {
//     setEditId(holiday.id);
//     setFormData({
//       date: holiday.date,
//       end_date: holiday.end_date,
//       occasion: holiday.occasion,
//     });
//     setShowModal(true);
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this holiday?")) {
//   //     await deleteHoliday(id);
//   //     fetchHolidays();
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
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteHoliday(id); // ? delete holiday
//                   await fetchHolidays(); // ? refresh holidays
//                   toast.success("Holiday deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Failed to delete holiday:", err);
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

//   // ? Animated close function
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       resetForm();
//     }, 400);
//   };

//   const resetForm = () => {
//     setFormData({
//       date: "",
//       end_date: "",
//       occasion: "",
//     });
//     setEditId(null);
//   };

//   return (
//     <div className="container mt-4">
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
//         <div>
//           <h4>Manage Holidays</h4>
//           {/* <div className="text-muted">Dashboard > Holidays</div> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <Button
//           className="btn btn-success d-flex align-items-center justify-content-center mt-2 mt-sm-0"
//           style={{ width: "38px", height: "38px", borderRadius: "6px" }}
//           onClick={() => setShowModal(true)}
//         >
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//       </div>

//       {/* Card */}
//       <div className="card shadow-sm p-3 mb-4">
//         {/* Filters */}
//         <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
//           <div className="d-flex align-items-center gap-2">
//             <Form.Select
//               value={entriesPerPage}
//               onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
//               style={{ width: "80px" }}
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//             </Form.Select>
//             <span>entries per page</span>
//           </div>

//           <Form.Control
//             type="text"
//             placeholder="Search by occasion..."
//             style={{ maxWidth: "250px" }}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {/* Scrollable Table */}
//         <div
//           className="flex-grow-1"
//           style={{ maxHeight: "400px", overflowY: "auto" }}
//         >
//           <table className="table table-borderless align-middle text-nowrap mb-0 table-striped">
//             <thead className="table-light">
//               <tr>
//                 <th>Date</th>
//                 <th>End Date</th>
//                 <th>Occasion</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentData.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="text-center">
//                     No holidays found
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((holiday) => (
//                   <tr key={holiday.id}>
//                     <td>{holiday.date}</td>
//                     <td>{holiday.end_date}</td>
//                     <td>{holiday.occasion}</td>
//                     <td>
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Edit</Tooltip>}
//                       >
//                         <Button
//                           variant="info"
//                           size="sm"
//                           onClick={() => handleEdit(holiday)}
//                         >
//                           <i className="bi bi-pencil-fill text-white"></i>
//                         </Button>
//                       </OverlayTrigger>
//                       {" "}
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Delete</Tooltip>}
//                       >
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() => handleDelete(holiday.id)}
//                         >
//                           <i className="bi bi-trash-fill text-white"></i>
//                         </Button>
//                       </OverlayTrigger>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
//           <div className="small text-muted">
//             Showing {indexOfFirst + 1} to{" "}
//             {Math.min(indexOfLast, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>

//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {/* First Page */}
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {/* Previous Page */}

//               {/* Numbered Pages */}
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                 (num) => (
//                   <li
//                     key={num}
//                     className={`page-item ${currentPage === num ? "active" : ""
//                       }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage(num)}
//                     >
//                       {num}
//                     </button>
//                   </li>
//                 )
//               )}

//               {/* Last Page */}
//               <li
//                 className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                   }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(totalPages)}
//                   disabled={currentPage === totalPages}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
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
//             {editId ? "Edit Holiday" : "Create Holiday"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>End Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="end_date"
//                 value={formData.end_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Occasion</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="occasion"
//                 value={formData.occasion}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <div className="text-end">
//               <Button variant="secondary" onClick={closeModal} className="me-2">
//                 Cancel
//               </Button>
//               <Button type="submit" variant="success">
//                 {editId ? "Update" : "Create"}
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default HolidaysList;












// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import {
//   getHolidays,
//   createHoliday,
//   updateHoliday,
//   deleteHoliday,
// } from "../../../services/hrmService";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const HolidaysList = () => {
//   const [holidays, setHolidays] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [formData, setFormData] = useState({
//     date: "",
//     end_date: "",
//     occasion: "",
//   });

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   useEffect(() => {
//     fetchHolidays();
//   }, []);

//   const fetchHolidays = async () => {
//     const data = await getHolidays();
//     setHolidays(data);
//   };

//   const filteredData = holidays.filter((holiday) =>
//     holiday.occasion?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state

//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredData.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editId) {
//         await updateHoliday(editId, formData);
//         toast.success("Holiday successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createHoliday(formData);
//         toast.success("Holiday successfully created.", {
//           icon: false,
//         });
//       }
//       await fetchHolidays();
//       closeModal();
//     } catch (error) {
//       console.error("Failed to save holiday:", error);
//     }
//   };

//   const handleEdit = (holiday) => {
//     setEditId(holiday.id);
//     setFormData({
//       date: holiday.date,
//       end_date: holiday.end_date,
//       occasion: holiday.occasion,
//     });
//     setShowModal(true);
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this holiday?")) {
//   //     await deleteHoliday(id);
//   //     fetchHolidays();
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
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteHoliday(id); // ? delete holiday
//                   await fetchHolidays(); // ? refresh holidays
//                   toast.success("Holiday deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Failed to delete holiday:", err);
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

//   // ? Animated close function
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       resetForm();
//     }, 400);
//   };

//   const resetForm = () => {
//     setFormData({
//       date: "",
//       end_date: "",
//       occasion: "",
//     });
//     setEditId(null);
//   };

//   return (
//     <div className="container mt-4">

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
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//         <div>
//           <h4>Manage Holidays</h4>
//           {/* <div className="text-muted">Dashboard > Holidays</div> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button
//             className="btn btn-success"
//             onClick={() => setShowModal(true)}
//           >
//             <i className="bi bi-plus-lg "></i>{" "}
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {/* Card */}
//       <div className="card shadow-sm p-3 mb-4">
//         {/* Filters */}
//         <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
//           <div className="d-flex align-items-center gap-2">
//             <Form.Select
//             className="form-select me-2"
//               value={entriesPerPage}
//               onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
//               style={{ width: "80px" }}
//             >
             
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//               <option value={100}>100</option>
//             </Form.Select>
            
//           </div>

//           <Form.Control
//           className=""
//             type="text"
//             placeholder="Search by occasion..."
//             style={{ maxWidth: "250px" }}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {/* Scrollable Table */}
//         <div
//           className="flex-grow-1"
//           style={{ maxHeight: "400px", overflowY: "auto" }}
//         >
//           <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Occasion</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentData.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="text-center">
//                     No holidays found
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((holiday) => (
//                   <tr key={holiday.id}>
//                     <td>{holiday.occasion}</td>
//                     <td>{holiday.date}</td>
//                     <td>{holiday.end_date}</td>

//                     <td>
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Edit</Tooltip>}
//                       >
//                         <Button
//                           variant="info"
//                           size="sm"
//                           onClick={() => handleEdit(holiday)}
//                         >
//                           <i className="bi bi-pencil-fill text-white"></i>
//                         </Button>
//                       </OverlayTrigger>{" "}
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Delete</Tooltip>}
//                       >
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() => handleDelete(holiday.id)}
//                         >
//                           <i className="bi bi-trash-fill text-white"></i>
//                         </Button>
//                       </OverlayTrigger>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
//           <div className="small text-muted">
//             Showing {indexOfFirst + 1} to{" "}
//             {Math.min(indexOfLast, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>

//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {/* First Page */}
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {/* Previous Page */}

//               {/* Numbered Pages */}
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                 (num) => (
//                   <li
//                     key={num}
//                     className={`page-item ${
//                       currentPage === num ? "active" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage(num)}
//                     >
//                       {num}
//                     </button>
//                   </li>
//                 )
//               )}

//               {/* Last Page */}
//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(totalPages)}
//                   disabled={currentPage === totalPages}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
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
//             {editId ? "Edit Holiday" : "Create Holiday"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Occasion <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="text"
//                 name="occasion"
//                 value={formData.occasion}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="date"
//                 name="end_date"
//                 value={formData.end_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <div className="text-end">
//               <Button variant="secondary" onClick={closeModal} className="me-2">
//                 Cancel
//               </Button>
//               <Button type="submit" variant="success">
//                 {editId ? "Update" : "Create"}
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default HolidaysList;



import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../../../services/hrmService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const HolidaysList = () => {
  const [holidays, setHolidays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    end_date: "",
    occasion: "",
  });

  const navigate = useNavigate(); // ? Added
  const location = useLocation(); // ? Added
  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const filteredData = holidays.filter((holiday) =>
    holiday.occasion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateHoliday(editId, formData);
        toast.success("Holiday successfully updated.", {
          icon: false,
        });
      } else {
        await createHoliday(formData);
        toast.success("Holiday successfully created.", {
          icon: false,
        });
      }
      await fetchHolidays();
      closeModal();
    } catch (error) {
      console.error("Failed to save holiday:", error);
    }
  };

  const handleEdit = (holiday) => {
    setEditId(holiday.id);
    setFormData({
      date: holiday.date,
      end_date: holiday.end_date,
      occasion: holiday.occasion,
    });
    setShowModal(true);
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this holiday?")) {
  //     await deleteHoliday(id);
  //     fetchHolidays();
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
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await deleteHoliday(id); // ? delete holiday
                  await fetchHolidays(); // ? refresh holidays
                  toast.success("Holiday deleted successfully.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Failed to delete holiday:", err);
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

  // ? Animated close function
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      resetForm();
    }, 400);
  };

  const resetForm = () => {
    setFormData({
      date: "",
      end_date: "",
      occasion: "",
    });
    setEditId(null);
  };

  return (
    <div className="container mt-4">

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="fw-bold">Manage Holidays</h4>
          {/* <div className="text-muted">Dashboard > Holidays</div> */}
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button
            className="btn btn-success"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg "></i>{" "}
          </Button>
        </OverlayTrigger>
      </div>

      {/* Card */}
      <div className="card shadow-sm p-3 mb-4">
        {/* Filters */}
        <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              className="form-select me-2"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
              style={{ width: "80px" }}
            >

              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>

          </div>

          <Form.Control
            className="mb-0"
            type="text"
            placeholder="Search by occasion..."
            style={{ maxWidth: "200px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Scrollable Table */}
        <div
          className="flex-grow-1"
          style={{ overflowY: "auto" }}
        >
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status" variant="success">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Occasion</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No holidays found
                    </td>
                  </tr>
                ) : (
                  currentData.map((holiday) => (
                    <tr key={holiday.id}>
                      <td>{holiday.occasion}</td>
                      <td>{holiday.date}</td>
                      <td>{holiday.end_date}</td>

                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                          >
                            <i className="bi bi-pencil-fill text-white"></i>
                          </Button>
                        </OverlayTrigger>{" "}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(holiday.id)}
                          >
                            <i className="bi bi-trash-fill text-white"></i>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
          <div className="small text-muted">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              {/* First Page */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
              </li>

              {/* Previous Page */}

              {/* Numbered Pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <li
                    key={num}
                    className={`page-item ${currentPage === num ? "active" : ""
                      }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  </li>
                )
              )}

              {/* Last Page */}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
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
            {editId ? "Edit Holiday" : "Create Holiday"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Occasion <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max="9999-12-31"

                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                max="9999-12-31"

                required
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success">
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HolidaysList;
