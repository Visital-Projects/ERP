// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// import {
//   getTerminations,
//   createTermination,
//   updateTermination,
//   deleteTermination,
//   getEmployees,
// } from "../../../services/hrmService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import BreadCrumb from "../../../components/BreadCrumb";

// import { getTerminationTypes } from "../../../services/terminationTypeService";

// const TerminationList = () => {
//   const [terminations, setTerminations] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [terminationTypes, setTerminationTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added

//   const [formData, setFormData] = useState({
//     employee_id: "",
//     notice_date: "",
//     termination_date: "",
//     termination_type: "",
//     description: "",
//   });

//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [terminationData, employeeData, terminationTypeData] =
//         await Promise.all([
//           getTerminations(),
//           getEmployees(),
//           getTerminationTypes(),
//         ]);

//       setTerminations(Array.isArray(terminationData) ? terminationData : []);
//       setEmployees(Array.isArray(employeeData) ? employeeData : []);
//       setTerminationTypes(
//         Array.isArray(terminationTypeData?.data) ? terminationTypeData.data : []
//       );
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
//       notice_date: "",
//       termination_date: "",
//       termination_type: "",
//       description: "",
//     });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   const handleEdit = (termination) => {
//     setFormData({
//       employee_id: termination.employee_id || "",
//       notice_date: termination.notice_date || "",
//       termination_date: termination.termination_date || "",
//       termination_type: termination.termination_type || "",
//       description: termination.description || "",
//     });
//     setEditId(termination.id);
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

//       // Prepare payload with correct data types
//       const payload = {
//         employee_id: parseInt(formData.employee_id),
//         notice_date: formData.notice_date,
//         termination_date: formData.termination_date,
//         termination_type: parseInt(formData.termination_type), // Convert to integer
//         description: formData.description,
//       };

//       console.log("Submitting payload:", payload);

//       if (editId) {
//         await updateTermination(editId, payload);
//         toast.success("Termination successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createTermination(payload);
//         toast.success("Termination successfully created.", {
//           icon: false,
//         });
//       }

//       setShowModal(false);
//       loadInitialData();
//     } catch (error) {
//       console.error("Error saving termination:", error.response?.data || error);
//       setError(
//         error.response?.data?.message ||
//         "Failed to save termination. Please check your input data."
//       );
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
//                   await deleteTermination(id); // ? termination logic
//                   loadInitialData(); // ? refresh data
//                   toast.success("Termination deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting termination:", error);
//                   setError(
//                     error.response?.data?.message ||
//                     "Failed to delete termination"
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

//   // ? Animated modal close
//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setEditId(null);
//     }, 400);
//   };

//   const getEmployeeName = (empId) => {
//     const emp = employees.find(
//       (e) =>
//         e.employee_id?.toString() === empId?.toString() ||
//         e.id?.toString() === empId?.toString()
//     );
//     return emp ? emp.name : "N/A";
//   };

//   // Map termination_type ID to termination type name
//   const getTerminationTypeName = (typeId) => {
//     const type = terminationTypes.find(
//       (t) => t.id?.toString() === typeId?.toString()
//     );
//     return type ? type.name : "N/A";
//   };

//   // Filter + Pagination
//   const filteredTerminations = terminations.filter(
//     (t) =>
//       getEmployeeName(t.employee_id)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getTerminationTypeName(t.termination_type)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//   );

//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredTerminations.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredTerminations.length / entriesPerPage);

//   return (
//     <div className="container mt-4">
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
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="fw-bold mb-0">Manage Terminations</h4>
//           {/* <div className="text-muted">Dashboard > Termination</div> */}
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger
//           placement="top"
//           overlay={(props) => <Tooltip {...props}>Create</Tooltip>}
//         >
//           <Button
//             onClick={handleShow}
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

//       {/* Table card */}
//       <div className="card p-3 shadow-sm rounded-4 ">
//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="d-flex align-items-center">
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
//             className="form-control form-control-sm mb-0"
//             placeholder="Search..."
//             style={{ maxWidth: "200px" }}
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             disabled={loading}
//           />
//         </div>

//         <>
//           {/* Table */}
//           <div style={{  overflowY: "auto" }}>
//             {loading ? (
//               <div className="text-center p-4">
//                 <Spinner animation="border" role="status" variant="success">
//                   <span className="visually-hidden">Loading...</span>
//                 </Spinner>
//               </div>
//             ) : (
//               <table className="table table-bordered table-hover table-striped text-center align-middle mb-0" style={{ tableLayout: "fixed", width: "100%" }}>
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Employee</th>
//                     {/* <th>Notice Date</th> */}
//                     <th>Termination Date</th>
//                     <th>Type</th>
//                     <th>Description</th>
//                     <th className="text-center">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((item) => (
//                       <tr key={item.id}>
//                         <td>{getEmployeeName(item.employee_id)}</td>

//                         <td>
//                           {item.termination_date
//                             ? new Date(
//                               item.termination_date
//                             ).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td>{getTerminationTypeName(item.termination_type)}</td>
//                         <td  style={{
//           width: "100px",
//           whiteSpace: "normal",
//           wordWrap: "break-word",
//           overflowWrap: "break-word",
//         }}>{item.description || "N/A"}</td>
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
//                         No terminations found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="d-flex justify-content-between align-items-center mt-3">
//             <div className="small text-muted">
//               Showing {indexOfFirstItem + 1} to{" "}
//               {Math.min(indexOfLastItem, filteredTerminations.length)} of{" "}
//               {filteredTerminations.length} entries
//             </div>
//             <nav>
//               <ul className="pagination pagination-sm mb-0 ">
//                 {/* First Page */}
//                 <li
//                   className={`page-item ${currentPage === 1 ? "disabled" : ""
//                     }`}
//                 >
//                   <button
//                     className="page-link "
//                     onClick={() => setCurrentPage(1)}
//                     disabled={currentPage === 1 || loading}
//                   >
//                     «
//                   </button>
//                 </li>

//                 {/* Numbered Pages */}
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

//                 {/* Last Page */}
//                 <li
//                   className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                     }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(totalPages)}
//                     disabled={currentPage === totalPages || loading}
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
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Termination" : "Create Termination"}
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
//                     key={emp.employee_id || emp.id}
//                     value={emp.employee_id || emp.id}
//                   >
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Termination Date <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="date"
//                 name="termination_date"
//                 value={formData.termination_date}
//                 onChange={handleChange}
//                 disabled={loading}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Termination Type <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="termination_type"
//                 value={formData.termination_type}
//                 onChange={handleChange}
//                 disabled={loading}
//               >
//                 <option value="">Select Termination Type</option>
//                 {terminationTypes.map((type) => (
//                   <option key={type.id} value={type.id}>
//                     {type.name}
//                   </option>
//                 ))}
//               </Form.Select>
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
//           <Button
//             variant="secondary"
//             onClick={handleCloseModal}
//             disabled={loading}
//           >
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

// export default TerminationList;

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  getTerminations,
  createTermination,
  updateTermination,
  deleteTermination,
  getEmployees,
} from "../../../services/hrmService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";

import { getTerminationTypes } from "../../../services/terminationTypeService";

const TerminationList = () => {
  const [terminations, setTerminations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [terminationTypes, setTerminationTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    employee_id: "",
    notice_date: "",
    termination_date: "",
    termination_type: "",
    description: "",
    is_black_list: false,
  });

  const [isClosingModal, setIsClosingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  // const loadInitialData = async () => {
  //   setLoading(true);
  //   try {
  //     const [terminationData, employeeData, terminationTypeData] =
  //       await Promise.all([
  //         getTerminations(),
  //         getEmployees(),
  //         getTerminationTypes(),
  //       ]);

  //     setTerminations(Array.isArray(terminationData) ? terminationData : []);
  //     setEmployees(Array.isArray(employeeData) ? employeeData : []);
  //     setTerminationTypes(
  //       Array.isArray(terminationTypeData?.data) ? terminationTypeData.data : []
  //     );
  //   } catch (err) {
  //     console.error("Error loading initial data:", err);
  //     setError("Failed to load data. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [terminationData, employeeData, terminationTypeData] =
        await Promise.all([
          getTerminations(),
          getEmployees(),
          getTerminationTypes(),
        ]);

      // ✅ Filter only active employees
      const activeEmployees = Array.isArray(employeeData)
        ? employeeData.filter((emp) => emp.is_active === true)
        : [];

      console.log("Total employees:", employeeData.length);
      console.log("Active employees:", activeEmployees.length);

      setTerminations(Array.isArray(terminationData) ? terminationData : []);
      setEmployees(activeEmployees); // ✅ only active employees
      setTerminationTypes(
        Array.isArray(terminationTypeData?.data) ? terminationTypeData.data : []
      );
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
      notice_date: "",
      termination_date: "",
      termination_type: "",
      description: "",
      is_black_list: false,
    });
    setEditId(null);
    setShowModal(true);
    setError("");
  };

  const handleEdit = (termination) => {
    setFormData({
      employee_id: termination.employee_id || "",
      notice_date: termination.notice_date || "",
      termination_date: termination.termination_date || "",
      termination_type: termination.termination_type || "",
      description: termination.description || "",
      is_black_list: termination.is_black_list || false,
    });
    setEditId(termination.id);
    setShowModal(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // const errors = {};
    // if (!formData.termination_type) errors.termination_type = "Termination Type is required";
    // if (!formData.termination_date) errors.termination_date = "Date is required";
    // if (!formData.employee_id) errors.employee_id = "Name is required";
    // if (!formData.description) errors.description = "Description required";

    // setValidationErrors(errors);
    // if (Object.keys(errors).length > 0) return; // stop if validation fails

    console.log(validationErrors);
    const errors = {};
    if (!formData.termination_type)
      errors.termination_type = "Termination type is required";
    if (!formData.termination_date)
      errors.termination_date = "Transfer Date is required";
    if (!formData.employee_id) errors.employee_id = "Employee is required";
    if (!formData.description) errors.description = "Description is required";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return; // stop if validation fails

    try {
      setLoading(true);
      setError("");

      // Prepare payload with correct data types
      const payload = {
        employee_id: parseInt(formData.employee_id),
        notice_date: formData.notice_date,
        termination_date: formData.termination_date,
        termination_type: parseInt(formData.termination_type),
        description: formData.description,
        is_black_list: formData.is_black_list,
      };

      console.log("Submitting payload:", payload);

      if (editId) {
        await updateTermination(editId, payload);
        toast.success("Termination successfully updated.", {
          icon: false,
        });
      } else {
        await createTermination(payload);
        toast.success("Termination successfully created.", {
          icon: false,
        });
      }

      setShowModal(false);
      loadInitialData();
    } catch (error) {
      console.error("Error saving termination:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Failed to save termination. Please check your input data."
      );
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
                  await deleteTermination(id);
                  loadInitialData();
                  toast.success("Termination deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting termination:", error);
                  setError(
                    error.response?.data?.message ||
                      "Failed to delete termination"
                  );
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

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditId(null);
    }, 400);
  };

  // const getEmployeeName = (empId) => {
  //   const emp = employees.find(
  //     (e) =>
  //       e.employee_id?.toString() === empId?.toString() ||
  //       e.id?.toString() === empId?.toString()
  //   );
  //   return emp ? emp.name : "N/A";
  // };

  const getEmployeeName = (empId) => {
    const emp = employees.find(
      (e) =>
        e.employee_id?.toString() === empId?.toString() ||
        e.id?.toString() === empId?.toString()
    );
    return emp ? `${emp.name} (EMP-ID: ${emp.employee_id || emp.id})` : "N/A";
  };
  const getTerminationTypeName = (typeId) => {
    const type = terminationTypes.find(
      (t) => t.id?.toString() === typeId?.toString()
    );
    return type ? type.name : "N/A";
  };

  // Filter + Pagination
  const filteredTerminations = terminations.filter(
    (t) =>
      getEmployeeName(t.employee_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getTerminationTypeName(t.termination_type)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (t.is_black_list ? "blacklisted" : "not blacklisted")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredTerminations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTerminations.length / entriesPerPage);

  // if (loading && terminations.length === 0) {
  //   return (
  //     <div
  //       className="d-flex justify-content-center align-items-center"
  //       style={{ height: "100vh" }}
  //     >
  //       <Spinner animation="border" variant="success" />
  //     </div>
  //   );
  // }

  return (
    <div className="container mt-4">
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Terminations</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={(props) => <Tooltip {...props}>Create</Tooltip>}
        >
          <Button
            onClick={handleShow}
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

      {/* Table card */}
      <div className="card p-3 shadow-sm rounded-4 ">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
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
            className="form-control form-control-sm"
            placeholder="Search..."
            style={{ maxWidth: "200px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
            <div style={{ overflowY: "auto" }}>
              <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Employee</th>
                    <th>Termination Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    {/* <th>Blacklisted</th> */}
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{getEmployeeName(item.employee_id)}</td>
                        <td>
                          {item.termination_date
                            ? new Date(
                                item.termination_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>{getTerminationTypeName(item.termination_type)}</td>
                        <td
                          style={{
                            width: "250px",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {item.description || "N/A"}
                        </td>
                        {/* <td>
                          {item.is_black_list ? (
                            <span className="badge bg-danger">Yes</span>
                          ) : (
                            <span className="badge bg-success">No</span>
                          )}
                        </td> */}
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
                      <td colSpan="7" className="text-center text-muted">
                        No terminations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="small text-muted">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredTerminations.length)} of{" "}
                {filteredTerminations.length} entries
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0 ">
                  {/* First Page */}
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1 || loading}
                    >
                      «
                    </button>
                  </li>

                  {/* Numbered Pages */}
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

                  {/* Last Page */}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || loading}
                    >
                      »
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Termination" : "Create Termination"}
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
                isInvalid={validationErrors.employee_id}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option
                    key={emp.employee_id || emp.id}
                    value={emp.employee_id || emp.id}
                  >
                    {emp.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.employee_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Termination Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="termination_date"
                value={formData.termination_date}
                onChange={handleChange}
                disabled={loading}
                max="9999-12-31"
                isInvalid={validationErrors.termination_date}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.termination_date}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Termination Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="termination_type"
                value={formData.termination_type}
                onChange={handleChange}
                disabled={loading}
                isInvalid={!!validationErrors.termination_type}
              >
                <option value="">Select Termination Type</option>
                {terminationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.termination_type}
              </Form.Control.Feedback>
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
                isInvalid={validationErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Blacklist Checkbox */}
            {/* <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_black_list"
                label="Add to Blacklist"
                checked={formData.is_black_list}
                onChange={handleChange}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Check this box if you want to blacklist this employee
              </Form.Text>
            </Form.Group> */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={loading}
          >
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

export default TerminationList;
