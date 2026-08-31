// import React, { useEffect, useState } from "react";
// import {
//   getResignations,
//   createResignation,
//   updateResignation,
//   deleteResignation,
//   getEmployees,
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

// const ResignationList = () => {
//   const [resignations, setResignations] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [formErrors, setFormErrors] = useState({});

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [isClosingModal, setIsClosingModal] = useState(false); // ? for animation

//   const [formData, setFormData] = useState({
//     employee_id: "",
//     notice_date: "",
//     resignation_date: "",
//     description: "",
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [resignationData, employeeData] = await Promise.all([
//         getResignations(),
//         getEmployees(),
//       ]);

//       setResignations(Array.isArray(resignationData) ? resignationData : []);
//       setEmployees(Array.isArray(employeeData) ? employeeData : []);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get employee name by employee_id
//   const getEmployeeName = (employeeId) => {
//     const employee = employees.find(
//       (emp) =>
//         emp.employee_id?.toString() === employeeId?.toString() ||
//         emp.id?.toString() === employeeId?.toString()
//     );
//     return employee?.name || employee?.user?.name || "N/A";
//   };

//   const validateForm = () => {
//     const errors = {};

//     if (!formData.employee_id) errors.employee_id = "Employee is required";
//     if (!formData.notice_date) errors.notice_date = "Notice date is required";
//     if (!formData.resignation_date) errors.resignation_date = "Resignation date is required";

//     setFormErrors(errors);

//     // If no errors, form is valid
//     return Object.keys(errors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCreateOrUpdate = async () => {
//     if (!validateForm()) return; // Stop if validation fails

//     try {
//       setLoading(true);
//       setError("");

//       if (editId) {
//         await updateResignation(editId, formData);
//         toast.success("Resignation successfully updated.", { icon: false });
//       } else {
//         await createResignation(formData);
//         toast.success("Resignation successfully created.", { icon: false });
//       }

//       setShowModal(false);
//       setFormData({
//         employee_id: "",
//         notice_date: "",
//         resignation_date: "",
//         description: "",
//       });
//       setEditId(null);
//       setFormErrors({});
//       fetchData();
//     } catch (error) {
//       console.error("Failed to save resignation:", error);
//       setError(error.response?.data?.message || "Failed to save resignation");
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
//                   await deleteResignation(id); // ? use resignation logic
//                   fetchData(); // ? refresh data
//                   toast.success("Resignation deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Failed to delete resignation:", err);
//                   setError(
//                     err.response?.data?.message ||
//                     "Failed to delete resignation"
//                   );
//                 } finally {
//                   setLoading(false);
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

//   const openEditModal = (resignation) => {
//     setFormData({
//       employee_id: resignation.employee_id || "",
//       notice_date: resignation.notice_date || "",
//       resignation_date: resignation.resignation_date || "",
//       description: resignation.description || "",
//     });
//     setEditId(resignation.id);
//     setShowModal(true);
//     setError("");
//   };

//   const openCreateModal = () => {
//     setFormData({
//       employee_id: "",
//       notice_date: "",
//       resignation_date: "",
//       description: "",
//     });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   // ? Modal close with animation
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 400);
//   };

//   // Filtered & Paginated Data
//   const filteredResignations = resignations.filter((r) =>
//     getEmployeeName(r.employee_id)
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredResignations.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredResignations.length / entriesPerPage);

//   return (
//     <div className="container-fluid mt-4">

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
//           <h4>Manage Resignations</h4>
//           {/* <div className="text-muted">Dashboard > Resignation</div> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <button
//             className="btn btn-success "
//             onClick={openCreateModal}
//             disabled={loading}
//           >
//             <i className="bi bi-plus-lg"></i>
//           </button>
//         </OverlayTrigger>
//       </div>

//       {error && (
//         <Alert variant="danger" onClose={() => setError("")} dismissible>
//           {error}
//         </Alert>
//       )}

//       {/* Table */}
//       <div
//         className="card border-0 shadow-sm rounded-4 p-3 "
//       >
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap ">

//           {/* <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select form-select-sm entries-select"
//               style={{ Width: "80px" , height:"40px"}}
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
//           </div> */}

//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               style={{ width: "80px", height: "40px" }}
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

//           <input
//             type="text"
//             className="form-control form-control-sm"
//             style={{ maxWidth: "200px" }}
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             disabled={loading}
//           />
//         </div>

//         <>
//           <div
//             className="flex-grow-1"
//             style={{ overflowY: "auto", }}
//           >
//             {loading ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="success" />
//               </div>
//             ) : (
//               <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Employee</th>
//                     <th>Notice Date</th>
//                     <th>Resignation Date</th>
//                     <th>Description</th>
//                     <th className="text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((res) => (
//                       <tr key={res.id}>
//                         <td>{getEmployeeName(res.employee_id)}</td>
//                         <td>
//                           {res.notice_date
//                             ? new Date(res.notice_date).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td>
//                           {res.resignation_date
//                             ? new Date(
//                               res.resignation_date
//                             ).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td style={{
//             width: "250px",       // fixed width
//             whiteSpace: "normal", // allow wrapping
//             wordWrap: "break-word",
//              // break long words
//           }}>{res.description || "N/A"}</td>
//                         <td className="text-center">
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Edit</Tooltip>}
//                           >
//                             <button
//                               className="btn btn-sm btn-info me-1"
//                               onClick={() => openEditModal(res)}
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
//                               onClick={() => handleDelete(res.id)}
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
//                       <td colSpan="5" className="text-center text-muted">
//                         No resignations found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//             <div className="small text-muted">
//               Showing {indexOfFirstItem + 1} to{" "}
//               {Math.min(indexOfLastItem, filteredResignations.length)} of{" "}
//               {filteredResignations.length} entries
//             </div>
//             <nav>
//               <ul className="pagination pagination-sm mb-0">
//                 {/* Left Arrow */}
//                 <li
//                   className={`page-item ${currentPage === 1 ? "disabled" : ""
//                     }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={loading}
//                   >
//                     «
//                   </button>
//                 </li>

//                 {/* Page Numbers */}
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (num) => (
//                     <li
//                       key={num}
//                       className={`page-item ${currentPage === num ? "active" : ""
//                         }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() => setCurrentPage(num)}
//                         disabled={loading}
//                       >
//                         {num}
//                       </button>
//                     </li>
//                   )
//                 )}

//                 {/* Right Arrow */}
//                 <li
//                   className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                     }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={loading}
//                   >
//                     »
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </>
//       </div>

//       {/* Modal */}
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
//             {editId ? "Edit Resignation" : "Create Resignation"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {/* Display general error */}
//           {error && (
//             <Alert variant="danger" className="mb-3">
//               {error}
//             </Alert>
//           )}

//           <div className="row">
//             {/* Employee */}
//             <div className="mb-3 col-md-6">
//               <Form.Label>
//                 Employee <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleInputChange}
//                 disabled={loading}
//                 isInvalid={!!formErrors.employee_id}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option
//                     key={emp.employee_id || emp.id}
//                     value={emp.employee_id || emp.id}
//                   >
//                     {emp.name || emp.user?.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {formErrors.employee_id}
//               </Form.Control.Feedback>
//             </div>

//             {/* Notice Date */}
//             <div className="mb-3 col-md-6">
//               <Form.Label>
//                 Notice Date <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="notice_date"
//                 value={formData.notice_date}
//                 onChange={handleInputChange}
//                 disabled={loading}
//                 isInvalid={!!formErrors.notice_date}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {formErrors.notice_date}
//               </Form.Control.Feedback>
//             </div>

//             {/* Resignation Date */}
//             <div className="mb-3 col-md-6">
//               <Form.Label>
//                 Resignation Date <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="resignation_date"
//                 value={formData.resignation_date}
//                 onChange={handleInputChange}
//                 disabled={loading}
//                 isInvalid={!!formErrors.resignation_date}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {formErrors.resignation_date}
//               </Form.Control.Feedback>
//             </div>

//             {/* Description */}
//             <div className="mb-3 col-12">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 rows="3"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 disabled={loading}
//               />
//             </div>
//           </div>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal} disabled={loading}>
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={handleCreateOrUpdate}
//             disabled={loading}
//           >
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

// export default ResignationList;

import React, { useEffect, useState } from "react";
import {
  getResignations,
  createResignation,
  updateResignation,
  deleteResignation,
  getEmployees,
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

const ResignationList = () => {
  const [resignations, setResignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const [isClosingModal, setIsClosingModal] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    resignation_date: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resignationData, employeeData] = await Promise.all([
        getResignations(),
        getEmployees(),
      ]);

      setResignations(Array.isArray(resignationData) ? resignationData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const getEmployeeName = (employeeId) => {
  //   const employee = employees.find(
  //     (emp) =>
  //       emp.employee_id?.toString() === employeeId?.toString() ||
  //       emp.id?.toString() === employeeId?.toString()
  //   );
  //   return (
  //     employee?.name || employee?.user?.name || `Employee ID: ${employeeId}`
  //   );
  // };

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

  const validateForm = () => {
    const errors = {};

    if (!formData.employee_id) errors.employee_id = "Employee is required";
    if (!formData.resignation_date)
      errors.resignation_date = "Resignation date is required";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        employee_id: parseInt(formData.employee_id),
        resignation_date: formData.resignation_date,
        description: formData.description || "",
      };

      console.log("Sending payload:", payload);

      if (editId) {
        await updateResignation(editId, payload);
        toast.success("Resignation successfully updated.", { icon: false });
      } else {
        await createResignation(payload);
        toast.success("Resignation successfully created.", { icon: false });
      }

      setShowModal(false);
      setFormData({
        employee_id: "",
        resignation_date: "",
        description: "",
      });
      setEditId(null);
      setFormErrors({});
      fetchData();
    } catch (error) {
      console.error("Full error object:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save resignation";
      setError(errorMessage);
      toast.error(errorMessage);
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
                  await deleteResignation(id);
                  fetchData();
                  toast.success("Resignation deleted successfully.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Failed to delete resignation:", err);
                  setError(
                    err.response?.data?.message ||
                      "Failed to delete resignation"
                  );
                  toast.error("Failed to delete resignation");
                } finally {
                  setLoading(false);
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

  const openEditModal = (resignation) => {
    setFormData({
      employee_id: resignation.employee_id?.toString() || "",
      resignation_date: resignation.resignation_date
        ? new Date(resignation.resignation_date).toISOString().split("T")[0]
        : "",
      description: resignation.description || "",
    });
    setEditId(resignation.id);
    setShowModal(true);
    setError("");
  };

  const openCreateModal = () => {
    setFormData({
      employee_id: "",
      resignation_date: "",
      description: "",
    });
    setEditId(null);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  const filteredResignations = resignations.filter((r) =>
    getEmployeeName(r.employee_id)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredResignations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredResignations.length / entriesPerPage);

  return (
    <div className="container-fluid mt-4">
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
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
          <h4 className="fw-bold">Manage Resignations</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <button
            className="btn btn-success"
            onClick={openCreateModal}
            disabled={loading}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </OverlayTrigger>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <div
        className="card border-0 shadow-sm rounded-4 p-3"
        style={{ maxHeight: "80vh" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
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

          <input
            type="text"
            className="form-control form-control-sm "
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

        <>
          <div
            className="flex-grow-1"
            style={{ overflowY: "auto", maxHeight: "50vh" }}
          >
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : (
              <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Employee</th>
                    <th>Resignation Date</th>
                    <th>Description</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((res) => (
                      <tr key={res.id}>
                        <td>{getEmployeeName(res.employee_id)}</td>
                        <td>
                          {res.resignation_date
                            ? new Date(
                                res.resignation_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>{res.description || "N/A"}</td>
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn btn-sm btn-info me-1"
                              onClick={() => openEditModal(res)}
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
                              onClick={() => handleDelete(res.id)}
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
                      <td colSpan="4" className="text-center text-muted">
                        No resignations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <div className="small text-muted">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredResignations.length)} of{" "}
              {filteredResignations.length} entries
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
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

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Resignation" : "Create Resignation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div className="row">
            <div
              className="mb-3 col-md-12"
              style={{
                pointerEvents: editId ? "none" : "auto",
                opacity: editId ? "0.6" : "1",
              }}
            >
              <Form.Label>
                Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={loading}
                isInvalid={!!formErrors.employee_id}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option
                    key={emp.employee_id || emp.id}
                    value={emp.employee_id || emp.id} 
                  >
                    {emp.name || emp.user?.name}  (Emp-id:{emp.employee_id})
                    {/* {emp.employee_id || emp.id}) */}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.employee_id}
              </Form.Control.Feedback>
            </div>

            <div className="mb-3 col-md-12">
              <Form.Label>
                Resignation Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="resignation_date"
                value={formData.resignation_date}
                onChange={handleInputChange}
                max="9999-12-31"
                disabled={loading}
                isInvalid={!!formErrors.resignation_date}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.resignation_date}
              </Form.Control.Feedback>
            </div>

            <div className="mb-3 col-12">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter resignation reason..."
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCreateOrUpdate}
            disabled={loading}
          >
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

export default ResignationList;
