// import React, { useEffect, useState } from "react";
// import {
//   getTransfers,
//   createTransfer,
//   updateTransfer,
//   deleteTransfer,
//   getEmployees,
//   getBranches,
// } from "../../../services/hrmService";

// import departmentService from "../../../services/departmentService";
// import designationService from "../../../services/designationService";

// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// import { useNavigate, useLocation } from "react-router-dom";
// import BreadCrumb from "../../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const TransferList = () => {
//   const [transfers, setTransfers] = useState([]);
//   const [filteredTransfers, setFilteredTransfers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTransfer, setEditingTransfer] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});

//   const [formData, setFormData] = useState({
//     employee_id: "",
//     branch_id: "",
//     department_id: "",
//     designation_id: "",
//     transfer_date: "",
//     description: "",
//   });

//   const navigate = useNavigate();
//   const location = useLocation();
//   const [employees, setEmployees] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [allDepartments, setAllDepartments] = useState([]);
//   const [allDesignations, setAllDesignations] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [isClosingModal, setIsClosingModal] = useState(false);

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     filterTransfers();
//   }, [transfers, searchTerm, allDepartments, allDesignations]);

//   // Fixed: Load departments when branch changes
//   const handleBranchChange = async (e) => {
//     const branch_id = Number(e.target.value);

//     setFormData({
//       ...formData,
//       branch_id,
//       department_id: "",
//       designation_id: "",
//       employee_id: "",
//     });

//     if (branch_id) {
//       try {
//         console.log("Fetching departments for branch:", branch_id);
//         const deptData = await departmentService.getByBranch(branch_id);
//         console.log("Fetched departments:", deptData);
//         setDepartments(deptData || []);
//         setDesignations([]);
//         setEmployees(allEmployees);
//       } catch (err) {
//         console.error("Failed to fetch departments:", err);
//         setDepartments([]);
//         setDesignations([]);
//         setEmployees(allEmployees);
//       }
//     } else {
//       setDepartments([]);
//       setDesignations([]);
//       setEmployees(allEmployees);
//     }
//   };

//   // Fixed: Load designations when department changes
//   const handleDepartmentChange = async (e) => {
//     const department_id = e.target.value;

//     setFormData({
//       ...formData,
//       department_id,
//       designation_id: "",
//       employee_id: "",
//     });

//     if (department_id) {
//       try {
//         console.log("Fetching designations for department:", department_id);
//         const desigData = await designationService.getByDepartment(
//           department_id
//         );
//         console.log("Fetched designations:", desigData);
//         setDesignations(desigData || []);
//         setEmployees(allEmployees);
//       } catch (err) {
//         console.error("Failed to fetch designations:", err);
//         setDesignations([]);
//         setEmployees(allEmployees);
//       }
//     } else {
//       setDesignations([]);
//       setEmployees(allEmployees);
//     }
//   };

//   // Fixed: Client-side filtering by designation for employees
//   const handleDesignationChange = async (e) => {
//     const designation_id = e.target.value;

//     console.log("Designation changed to:", designation_id);

//     setFormData((prev) => ({
//       ...prev,
//       designation_id,
//       employee_id: "",
//     }));

//     if (designation_id) {
//       try {
//         console.log("Filtering employees for designation:", designation_id);

//         const filteredEmployees = allEmployees.filter(
//           (emp) =>
//             emp.designation_id &&
//             Number(emp.designation_id) === Number(designation_id)
//         );

//         console.log("Filtered employees count:", filteredEmployees.length);
//         setEmployees(filteredEmployees);
//       } catch (err) {
//         console.error("Failed to filter employees by designation:", err);
//         setEmployees(allEmployees);
//       }
//     } else {
//       setEmployees(allEmployees);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "branch_id") {
//       handleBranchChange(e);
//     } else if (name === "department_id") {
//       handleDepartmentChange(e);
//     } else if (name === "designation_id") {
//       handleDesignationChange(e);
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const [
//         transferData,
//         employeeData,
//         branchData,
//         allDeptData,
//         allDesigData,
//       ] = await Promise.all([
//         getTransfers(),
//         getEmployees(),
//         getBranches(),
//         departmentService.getAll(),
//         designationService.getAll(),
//       ]);

//       const formattedTransfers = transferData.data || transferData;
//       setTransfers(formattedTransfers);

//       // Store all employees for client-side filtering
//       const employeesWithEmployeeId = (employeeData || []).map((emp) => ({
//         ...emp,
//         employee_id: emp.employee_id || emp.id,
//       }));
//       setEmployees(employeesWithEmployeeId);
//       setAllEmployees(employeesWithEmployeeId);

//       setBranches(branchData);
//       setAllDepartments(allDeptData || []);
//       setAllDesignations(allDesigData || []);
//     } catch (error) {
//       console.error("Error loading initial data:", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterTransfers = () => {
//     const term = searchTerm.toLowerCase();
//     const filtered = transfers.filter((t) => {
//       const emp = getName(employees, t.employee_id);
//       const branch = t.branch?.name || getName(branches, t.branch_id);
//       const dept =
//         t.department?.name || getName(allDepartments, t.department_id);
//       const desig =
//         t.designation?.name || getName(allDesignations, t.designation_id);

//       return (
//         emp.toLowerCase().includes(term) ||
//         branch.toLowerCase().includes(term) ||
//         dept.toLowerCase().includes(term) ||
//         desig.toLowerCase().includes(term) ||
//         (t.description?.toLowerCase() || "").includes(term)
//       );
//     });
//     setFilteredTransfers(filtered);
//   };

//   const handleCreate = () => {
//     setFormData({
//       employee_id: "",
//       branch_id: "",
//       department_id: "",
//       designation_id: "",
//       transfer_date: "",
//       description: "",
//     });
//     setEditingTransfer(null);
//     setDepartments([]);
//     setDesignations([]);
//     setEmployees(allEmployees);
//     setShowModal(true);
//   };

//   const handleEdit = (transfer) => {
//     setFormData({
//       employee_id: transfer.employee_id,
//       branch_id: transfer.branch_id || "",
//       department_id: transfer.department_id || "",
//       designation_id: transfer.designation_id || "",
//       transfer_date: transfer.transfer_date,
//       description: transfer.description || "",
//     });
//     setEditingTransfer(transfer);

//     // Load departments and designations for the transfer's branch and department
//     if (transfer.branch_id) {
//       departmentService.getByBranch(transfer.branch_id).then((data) => {
//         console.log("Edit - Fetched departments:", data);
//         setDepartments(data || []);

//         if (transfer.department_id) {
//           designationService
//             .getByDepartment(transfer.department_id)
//             .then((desigData) => {
//               console.log("Edit - Fetched designations:", desigData);
//               setDesignations(desigData || []);

//               if (transfer.designation_id) {
//                 const filteredEmployees = allEmployees.filter(
//                   (emp) =>
//                     emp.designation_id &&
//                     Number(emp.designation_id) ===
//                       Number(transfer.designation_id)
//                 );
//                 setEmployees(filteredEmployees);
//               } else {
//                 setEmployees(allEmployees);
//               }
//             });
//         } else {
//           setEmployees(allEmployees);
//         }
//       });
//     } else {
//       setEmployees(allEmployees);
//     }

//     setShowModal(true);
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
//                   await deleteTransfer(id);
//                   await loadInitialData();
//                   toast.success("Transfer deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting transfer:", error);
//                   toast.error("Failed to delete transfer");
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

//   const handleSubmit = async () => {
//     const errors = {};
//     if (!formData.branch_id) errors.branch_id = "Branch is required";
//     if (!formData.department_id)
//       errors.department_id = "Department is required";
//     if (!formData.designation_id)
//       errors.designation_id = "Designation is required";
//     if (!formData.employee_id) errors.employee_id = "Employee is required";
//     if (!formData.transfer_date)
//       errors.transfer_date = "Transfer Date is required";

//     setValidationErrors(errors);
//     if (Object.keys(errors).length > 0) return;

//     try {
//       const payload = {
//         branch_id: Number(formData.branch_id),
//         department_id: Number(formData.department_id),
//         designation_id: Number(formData.designation_id),
//         employee_id: String(formData.employee_id),
//         transfer_date: formData.transfer_date,
//         description: formData.description || "",
//       };

//       console.log("Submitting payload:", payload);

//       if (editingTransfer) {
//         await updateTransfer(editingTransfer.id, payload);
//         toast.success("Transfer successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createTransfer(payload);
//         toast.success("Transfer successfully created.", {
//           icon: false,
//         });
//       }

//       await loadInitialData();
//       setShowModal(false);
//     } catch (error) {
//       console.error("Error saving transfer:", error.response?.data || error);
//       const errorMessage =
//         error.response?.data?.message || "Failed to save transfer.";
//       toast.error(errorMessage);
//     }
//   };

//   const getName = (list, id) => {
//     const item = list.find(
//       (i) => String(i.employee_id) === String(id) || String(i.id) === String(id)
//     );

//     if (!item) return "Unknown";

//     if (item.employee_id) {
//       return `${item.user?.name || item.name} (EMP-ID: ${item.employee_id})`;
//     }

//     return item.name || item.user?.name || "Unknown";
//   };

//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setValidationErrors({});
//       setEmployees(allEmployees);
//     }, 400);
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredTransfers.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredTransfers.length / entriesPerPage);
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="container mt-4">
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

//         .modal-content {
//           overflow: visible !important;
//         }
//         .modal-body {
//           overflow: visible !important;
//         }
//         .form-select {
//           position: relative;
//         }
//         .modal.show .dropdown-menu {
//           position: absolute !important;
//           transform: translate3d(0px, 40px, 0px) !important;
//           top: 100% !important;
//           bottom: auto !important;
//           left: 0px !important;
//           will-change: transform !important;
//         }
//         select.form-select option {
//           padding: 8px 12px;
//         }
//         select.form-select {
//           max-height: 200px;
//           overflow-y: auto;
//         }
//       `}</style>

//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="fw-bold">Manage Transfer</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button variant="success" onClick={handleCreate}>
//             <i className="bi bi-plus-lg"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       <div
//         className="card border-0 shadow-sm rounded-4 p-3"
//         style={{ height: "100%" }}
//       >
//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               style={{ width: "80px", height: "40px" }}
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//             >
//               {[10, 25, 50, 100].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <input
//               type="text"
//               className="form-control form-control-sm"
//               style={{ maxWidth: "250px" }}
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="flex-grow-1">
//           {loading ? (
//             <div className="text-center py-5">
//               <Spinner animation="border" variant="success" />
//             </div>
//           ) : (
//             <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
//               <thead className="bg-light">
//                 <tr>
//                   <th>Employee Name</th>
//                   <th>Site</th>
//                   <th>Department</th>
//                   <th>Designation</th>
//                   <th>Transfer Date</th>
//                   <th>Description</th>
//                   <th className="text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((t) => (
//                     <tr key={t.id} className="align-middle">
//                       <td>
//                         {t.employee
//                           ? `${t.employee.name} (EMP-ID: ${
//                               t.employee.employee_id || t.employee.id
//                             })`
//                           : getName(employees, t.employee_id)}
//                       </td>
//                       <td>
//                         {t.branch?.name || getName(branches, t.branch_id)}
//                       </td>
//                       <td>
//                         {t.department?.name ||
//                           getName(allDepartments, t.department_id)}
//                       </td>
//                       <td>
//                         {t.designation?.name ||
//                           getName(allDesignations, t.designation_id)}
//                       </td>
//                       <td>
//                         {new Date(t.transfer_date).toLocaleDateString("en-US", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         })}
//                       </td>
//                       <td
//                         style={{
//                           width: "250px",
//                           whiteSpace: "normal",
//                           wordWrap: "break-word",
//                         }}
//                       >
//                         {t.description}
//                       </td>
//                       <td className="text-center">
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <button
//                             className="btn btn-sm btn-info me-1"
//                             onClick={() => handleEdit(t)}
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
//                             onClick={() => handleDelete(t.id)}
//                           >
//                             <i className="bi bi-trash-fill text-white"></i>
//                           </button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="text-center">
//                       No transfers found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Pagination Footer */}
//         <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//           <div className="small text-muted">
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, filteredTransfers.length)} of{" "}
//             {filteredTransfers.length} entries
//           </div>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 >
//                   «
//                 </button>
//               </li>

//               {pageNumbers.map((num) => (
//                 <li
//                   key={num}
//                   className={`page-item ${currentPage === num ? "active" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(num)}
//                   >
//                     {num}
//                   </button>
//                 </li>
//               ))}

//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(p + 1, totalPages))
//                   }
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
//             {editingTransfer ? "Edit Transfer" : "Create New Transfer"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Site <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="branch_id"
//                 value={formData.branch_id}
//                 onChange={handleChange}
//                 isInvalid={!!validationErrors.branch_id}
//               >
//                 <option value="">Select Site</option>
//                 {branches.map((b) => (
//                   <option key={b.id} value={b.id}>
//                     {b.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.branch_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Department <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="department_id"
//                 value={formData.department_id}
//                 onChange={handleChange}
//                 disabled={!formData.branch_id}
//                 isInvalid={!!validationErrors.department_id}
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.department_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Designation <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="designation_id"
//                 value={formData.designation_id}
//                 onChange={handleChange}
//                 disabled={!formData.department_id}
//                 isInvalid={!!validationErrors.designation_id}
//               >
//                 <option value="">Select Designation</option>
//                 {designations.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.designation_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Employee <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleChange}
//                 disabled={!formData.designation_id}
//                 isInvalid={!!validationErrors.employee_id}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.length === 0 ? (
//                   <option value="" disabled>
//                     No employees found for this designation
//                   </option>
//                 ) : (
//                   employees.map((e) => (
//                     <option key={e.employee_id} value={e.employee_id}>
//                       {e.user?.name || e.name} (Emp-id:{e.employee_id})
//                     </option>
//                   ))
//                 )}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.employee_id}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Transfer Date <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="date"
//                 name="transfer_date"
//                 value={formData.transfer_date}
//                 onChange={handleChange}
//                 max="9999-12-31"
//                 isInvalid={!!validationErrors.transfer_date}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {validationErrors.transfer_date}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editingTransfer ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default TransferList;

import React, { useEffect, useState } from "react";
import {
  getTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  getEmployees,
  getBranches,
} from "../../../services/hrmService";

import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";

import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const TransferList = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee_id: "",
    branch_id: "",
    department_id: "",
    designation_id: "",
    transfer_date: "",
    description: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, searchTerm, allDepartments, allDesignations]);

  // Fixed: Load departments when branch changes
  const handleBranchChange = async (e) => {
    const branch_id = Number(e.target.value);

    setFormData({
      ...formData,
      branch_id,
      department_id: "",
      designation_id: "",
      employee_id: "",
    });

    if (branch_id) {
      try {
        console.log("Fetching departments for branch:", branch_id);
        const deptData = await departmentService.getByBranch(branch_id);
        console.log("Fetched departments:", deptData);
        setDepartments(deptData || []);
        setDesignations([]);
        setEmployees(allEmployees);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setDepartments([]);
        setDesignations([]);
        setEmployees(allEmployees);
      }
    } else {
      setDepartments([]);
      setDesignations([]);
      setEmployees(allEmployees);
    }
  };

  // Fixed: Load designations when department changes
  const handleDepartmentChange = async (e) => {
    const department_id = e.target.value;

    setFormData({
      ...formData,
      department_id,
      designation_id: "",
      employee_id: "",
    });

    if (department_id) {
      try {
        console.log("Fetching designations for department:", department_id);
        const desigData = await designationService.getByDepartment(
          department_id
        );
        console.log("Fetched designations:", desigData);
        setDesignations(desigData || []);
        setEmployees(allEmployees);
      } catch (err) {
        console.error("Failed to fetch designations:", err);
        setDesignations([]);
        setEmployees(allEmployees);
      }
    } else {
      setDesignations([]);
      setEmployees(allEmployees);
    }
  };

  // Fixed: Client-side filtering by designation for employees - Only show active employees
  const handleDesignationChange = async (e) => {
    const designation_id = e.target.value;

    console.log("Designation changed to:", designation_id);

    setFormData((prev) => ({
      ...prev,
      designation_id,
      employee_id: "",
    }));

    if (designation_id) {
      try {
        console.log("Filtering employees for designation:", designation_id);

        // Filter employees by designation_id AND is_active status
        const filteredEmployees = allEmployees.filter(
          (emp) =>
            emp.designation_id &&
            Number(emp.designation_id) === Number(designation_id) &&
            emp.is_active === true // Only show active employees
        );

        console.log(
          "Filtered active employees count:",
          filteredEmployees.length
        );
        setEmployees(filteredEmployees);
      } catch (err) {
        console.error("Failed to filter employees by designation:", err);
        setEmployees(allEmployees.filter((emp) => emp.is_active === true));
      }
    } else {
      // If designation is cleared, show all active employees
      setEmployees(allEmployees.filter((emp) => emp.is_active === true));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "branch_id") {
      handleBranchChange(e);
    } else if (name === "department_id") {
      handleDepartmentChange(e);
    } else if (name === "designation_id") {
      handleDesignationChange(e);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [
        transferData,
        employeeData,
        branchData,
        allDeptData,
        allDesigData,
      ] = await Promise.all([
        getTransfers(),
        getEmployees(),
        getBranches(),
        departmentService.getAll(),
        designationService.getAll(),
      ]);

      const formattedTransfers = transferData.data || transferData;
      setTransfers(formattedTransfers);

      // Store all employees for client-side filtering - Only active employees
      const employeesWithEmployeeId = (employeeData || []).map((emp) => ({
        ...emp,
        employee_id: emp.employee_id || emp.id,
      }));

      // Filter only active employees
      const activeEmployees = employeesWithEmployeeId.filter(
        (emp) => emp.is_active === true
      );

      console.log("Total employees:", employeesWithEmployeeId.length);
      console.log("Active employees:", activeEmployees.length);

      setEmployees(activeEmployees);
      setAllEmployees(activeEmployees);

      setBranches(branchData);
      setAllDepartments(allDeptData || []);
      setAllDesignations(allDesigData || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filterTransfers = () => {
    const term = searchTerm.toLowerCase();
    const filtered = transfers.filter((t) => {
      const emp = getName(employees, t.employee_id);
      const branch = t.branch?.name || getName(branches, t.branch_id);
      const dept =
        t.department?.name || getName(allDepartments, t.department_id);
      const desig =
        t.designation?.name || getName(allDesignations, t.designation_id);

      return (
        emp.toLowerCase().includes(term) ||
        branch.toLowerCase().includes(term) ||
        dept.toLowerCase().includes(term) ||
        desig.toLowerCase().includes(term) ||
        (t.description?.toLowerCase() || "").includes(term)
      );
    });
    setFilteredTransfers(filtered);
  };

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      branch_id: "",
      department_id: "",
      designation_id: "",
      transfer_date: "",
      description: "",
    });
    setEditingTransfer(null);
    setDepartments([]);
    setDesignations([]);
    setEmployees(allEmployees); // This already contains only active employees
    setShowModal(true);
  };

  const handleEdit = (transfer) => {
    setFormData({
      employee_id: transfer.employee_id,
      branch_id: transfer.branch_id || "",
      department_id: transfer.department_id || "",
      designation_id: transfer.designation_id || "",
      transfer_date: transfer.transfer_date,
      description: transfer.description || "",
    });
    setEditingTransfer(transfer);

    // Load departments and designations for the transfer's branch and department
    if (transfer.branch_id) {
      departmentService.getByBranch(transfer.branch_id).then((data) => {
        console.log("Edit - Fetched departments:", data);
        setDepartments(data || []);

        if (transfer.department_id) {
          designationService
            .getByDepartment(transfer.department_id)
            .then((desigData) => {
              console.log("Edit - Fetched designations:", desigData);
              setDesignations(desigData || []);

              if (transfer.designation_id) {
                // Filter employees by designation AND active status
                const filteredEmployees = allEmployees.filter(
                  (emp) =>
                    emp.designation_id &&
                    Number(emp.designation_id) ===
                      Number(transfer.designation_id) &&
                    emp.is_active === true
                );
                setEmployees(filteredEmployees);
              } else {
                setEmployees(allEmployees); // Already filtered to active only
              }
            });
        } else {
          setEmployees(allEmployees); // Already filtered to active only
        }
      });
    } else {
      setEmployees(allEmployees); // Already filtered to active only
    }

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
                  await deleteTransfer(id);
                  await loadInitialData();
                  toast.success("Transfer deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting transfer:", error);
                  toast.error("Failed to delete transfer");
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

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.branch_id) errors.branch_id = "Branch is required";
    if (!formData.department_id)
      errors.department_id = "Department is required";
    if (!formData.designation_id)
      errors.designation_id = "Designation is required";
    if (!formData.employee_id) errors.employee_id = "Employee is required";
    if (!formData.transfer_date)
      errors.transfer_date = "Transfer Date is required";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        branch_id: Number(formData.branch_id),
        department_id: Number(formData.department_id),
        designation_id: Number(formData.designation_id),
        employee_id: String(formData.employee_id),
        transfer_date: formData.transfer_date,
        description: formData.description || "",
      };

      console.log("Submitting payload:", payload);

      if (editingTransfer) {
        await updateTransfer(editingTransfer.id, payload);
        toast.success("Transfer successfully updated.", {
          icon: false,
        });
      } else {
        await createTransfer(payload);
        toast.success("Transfer successfully created.", {
          icon: false,
        });
      }

      await loadInitialData();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving transfer:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "Failed to save transfer.";
      toast.error(errorMessage);
    }
  };

  const getName = (list, id) => {
    const item = list.find(
      (i) => String(i.employee_id) === String(id) || String(i.id) === String(id)
    );

    if (!item) return "Unknown";

    if (item.employee_id) {
      return `${item.user?.name || item.name} (EMP-ID: ${item.employee_id})`;
    }

    return item.name || item.user?.name || "Unknown";
  };

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setValidationErrors({});
      setEmployees(allEmployees); // Reset to active employees only
    }, 400);
  };

  // Pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredTransfers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransfers.length / entriesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
        
        .modal-content {
          overflow: visible !important;
        }
        .modal-body {
          overflow: visible !important;
        }
        .form-select {
          position: relative;
        }
        .modal.show .dropdown-menu {
          position: absolute !important;
          transform: translate3d(0px, 40px, 0px) !important;
          top: 100% !important;
          bottom: auto !important;
          left: 0px !important;
          will-change: transform !important;
        }
        select.form-select option {
          padding: 8px 12px;
        }
        select.form-select {
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Transfer</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button variant="success" onClick={handleCreate}>
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 p-3"
        style={{ height: "100%" }}
      >
        {/* Controls */}
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
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: "250px" }}
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
        <div className="flex-grow-1">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <table className="table table-bordered table-hover table-striped text-center align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Employee Name</th>
                  <th>Site</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Transfer Date</th>
                  <th>Description</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((t) => (
                    <tr key={t.id} className="align-middle">
                      <td>
                        {t.employee
                          ? `${t.employee.name} (EMP-ID: ${
                              t.employee.employee_id || t.employee.id
                            })`
                          : getName(employees, t.employee_id)}
                      </td>
                      <td>
                        {t.branch?.name || getName(branches, t.branch_id)}
                      </td>
                      <td>
                        {t.department?.name ||
                          getName(allDepartments, t.department_id)}
                      </td>
                      <td>
                        {t.designation?.name ||
                          getName(allDesignations, t.designation_id)}
                      </td>
                      <td>
                        {new Date(t.transfer_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          width: "250px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                      >
                        {t.description}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => handleEdit(t)}
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
                            onClick={() => handleDelete(t.id)}
                          >
                            <i className="bi bi-trash-fill text-white"></i>
                          </button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="small text-muted">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredTransfers.length)} of{" "}
            {filteredTransfers.length} entries
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  «
                </button>
              </li>

              {pageNumbers.map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
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
            {editingTransfer ? "Edit Transfer" : "Create New Transfer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Site <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                isInvalid={!!validationErrors.branch_id}
              >
                <option value="">Select Site</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.branch_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Department <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                disabled={!formData.branch_id}
                isInvalid={!!validationErrors.department_id}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.department_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Designation <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="designation_id"
                value={formData.designation_id}
                onChange={handleChange}
                disabled={!formData.department_id}
                isInvalid={!!validationErrors.designation_id}
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.designation_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                disabled={!formData.designation_id}
                isInvalid={!!validationErrors.employee_id}
              >
                <option value="">Select Employee</option>
                {employees.length === 0 ? (
                  <option value="" disabled>
                    No active employees found for this designation
                  </option>
                ) : (
                  employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.user?.name || e.name} (Emp-id:{e.employee_id})
                    </option>
                  ))
                )}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.employee_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Transfer Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleChange}
                max="9999-12-31"
                isInvalid={!!validationErrors.transfer_date}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.transfer_date}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editingTransfer ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransferList;
