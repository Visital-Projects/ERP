// // src/components/HRM/Loans/LoanOptionList.jsx
// import React, { useEffect, useState } from "react";
// import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import loanOptionService from "../../../services/loanOptionService";

// const LoanOptionList = () => {
//   const [loanOptions, setLoanOptions] = useState([]);
//   const [formData, setFormData] = useState({ name: "" });
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   // Fetch loan options
//   const fetchLoanOptions = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const data = await loanOptionService.getAllLoanOptions();
//       setLoanOptions(data || []);
//     } catch (err) {
//       console.error("Error fetching loan options:", err);
//       setError("Failed to load loan options.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLoanOptions();
//   }, []);

//   // Save (create/update)
//   const handleSave = async () => {
//     if (!formData.name.trim()) {
//       setError("Loan option name is required");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       if (editId) {
//         await loanOptionService.updateLoanOption(editId, formData);
//       } else {
//         await loanOptionService.createLoanOption(formData);
//       }
//       setFormData({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchLoanOptions();
//     } catch (err) {
//       console.error("Error saving loan option:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to save loan option"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (option) => {
//     setFormData({ name: option.name });
//     setEditId(option.id);
//     setShowModal(true);
//     setError("");
//   };

//   // const handleDelete = async (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="bg-white p-4 rounded shadow text-center">
//   //         <h5>Are you sure?</h5>
//   //         <p>This will permanently delete the loan option.</p>
//   //         <Button
//   //           variant="secondary"
//   //           onClick={onClose}
//   //           className="me-2"
//   //           disabled={loading}
//   //         >
//   //           Cancel
//   //         </Button>
//   //         <Button
//   //           variant="danger"
//   //           onClick={async () => {
//   //             try {
//   //               setLoading(true);
//   //               await loanOptionService.deleteLoanOption(id);
//   //               fetchLoanOptions();
//   //             } catch (err) {
//   //               console.error("Error deleting loan option:", err);
//   //               setError(
//   //                 err.response?.data?.message || "Failed to delete loan option"
//   //               );
//   //             } finally {
//   //               setLoading(false);
//   //             }
//   //             onClose();
//   //           }}
//   //           disabled={loading}
//   //         >
//   //           {loading ? "Deleting..." : "Delete"}
//   //         </Button>
//   //       </div>
//   //     ),
//   //   });
//   // };

//   // Filter and paginate

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action can not be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 setLoading(true);
//                 await loanOptionService.deleteLoanOption(id);
//                 fetchLoanOptions();
//                 onClose();
//               }}
//             >
//               Yes
//             </Button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 400); // match animation duration
//   };

//   const filteredOptions = loanOptions.filter((opt) =>
//     opt.name?.toLowerCase().includes(search.toLowerCase())
//   );
//   const totalEntries = filteredOptions.length;
//   const totalPages = Math.ceil(totalEntries / entriesPerPage);
//   const paginatedOptions = filteredOptions.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   const openCreateModal = () => {
//     setFormData({ name: "" });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({ name: "" });
//     setEditId(null);
//     setError("");
//   };

//   return (
//     <div className="container mt-4">
//       <style>{`
//           @keyframes slideInUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes slideOutUp {
//             from { transform: translateY(0); opacity: 1; }
//             to { transform: translateY(-100%); opacity: 0; }
//           }
//           .custom-slide-modal.open .modal-dialog {
//             animation: slideInUp 0.7s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.7s ease forwards;
//           }
//         `}</style>
//       <div className="bg-white p-4 shadow rounded">
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div>
//             <h5 className="fw-bold mb-0">Manage Loan Options</h5>
//             {/* <div className="text-muted">Dashboard &gt; Loan Options</div> */}
//           </div>
//           {/* <Button
//             variant="success"
//             onClick={openCreateModal}
//             disabled={loading}
//           >
//             <i className="bi bi-plus-lg"></i>
//           </Button> */}
//           <Button variant="success" onClick={() => setShowModal(true)}>
//             +
//           </Button>
//         </div>

//         {error && (
//           <Alert variant="danger" onClose={() => setError("")} dismissible>
//             {error}
//           </Alert>
//         )}

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
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </Form.Select>
//             <span className="ms-2">entries per page</span>
//           </div>
//           <Form.Control
//             type="text"
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setCurrentPage(1);
//             }}
//             style={{ maxWidth: "250px" }}
//             disabled={loading}
//           />
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         ) : (
//           <>
//             <div className="table-responsive">
//               <table className="table table-bordered table-hover table-striped">
//                 <thead className="table-light">
//                   <tr>
//                     {/* <th>ID</th> */}
//                     <th>Name</th>
//                     <th style={{ width: "120px" }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedOptions.length > 0 ? (
//                     paginatedOptions.map((opt) => (
//                       <tr key={opt.id}>
//                         {/* <td>{opt.id}</td> */}
//                         <td>{opt.name}</td>
//                         <td>
//                           <Button
//                             variant="info"
//                             size="sm"
//                             className="me-2"
//                             onClick={() => handleEdit(opt)}
//                             disabled={loading}
//                           >
//                             <FaEdit />
//                           </Button>
//                           <Button
//                             variant="danger"
//                             size="sm"
//                             onClick={() => handleDelete(opt.id)}
//                             disabled={loading}
//                           >
//                             <FaTrash />
//                           </Button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="3" className="text-center">
//                         {loanOptions.length === 0
//                           ? "No loan options found."
//                           : "No matching loan options found."}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {/* {totalPages > 1 && (
//               <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
//                 <small>
//                   Showing{" "}
//                   {Math.min(
//                     (currentPage - 1) * entriesPerPage + 1,
//                     totalEntries
//                   )}{" "}
//                   to {Math.min(currentPage * entriesPerPage, totalEntries)} of{" "}
//                   {totalEntries} entries
//                 </small>
//                 <div>
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     disabled={currentPage === 1 || loading}
//                     onClick={() => setCurrentPage(currentPage - 1)}
//                     className="me-2"
//                   >
//                     Prev
//                   </Button>
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     disabled={currentPage === totalPages || loading}
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             )} */}

//             <div className="d-flex justify-content-between align-items-center">
//               <div className="small text-muted">
//                 Showing {filteredOptions.length === 0 ? 0 : startIndex + 1} to{" "}
//                 {Math.min(startIndex + entriesPerPage, filteredOptions.length)}{" "}
//                 of {filteredOptions.length} entries
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
//           </>
//         )}

//         {/* Modal */}
//         {/* <Modal show={showModal} onHide={closeModal} centered >
//           <Modal.Header closeButton>
//             <Modal.Title>{editId ? "Edit" : "Create"} Loan Option</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {error && <Alert variant="danger">{error}</Alert>}
//             <Form.Group className="mb-3">
//               <Form.Label>Loan Option Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 disabled={loading}
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={closeModal} disabled={loading}>
//               Cancel
//             </Button>
//             <Button variant="success" onClick={handleSave} disabled={loading}>
//               {loading ? (
//                 <Spinner animation="border" size="sm" />
//               ) : editId ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Modal> */}

//         <Modal
//           show={showModal}
//           onHide={handleCloseModal}
//           centered
//           className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>{editId ? "Edit" : "Create"} Loan Option</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {error && <Alert variant="danger">{error}</Alert>}
//             <Form.Group className="mb-3">
//               <Form.Label>Loan Option Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 disabled={loading}
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={handleCloseModal}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button variant="success" onClick={handleSave} disabled={loading}>
//               {loading ? (
//                 <Spinner animation="border" size="sm" />
//               ) : editId ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default LoanOptionList;

// import React, { useEffect, useState } from "react";
// import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import loanOptionService from "../../../services/loanOptionService";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const LoanOptionList = () => {
//   const [loanOptions, setLoanOptions] = useState([]);
//   const [formData, setFormData] = useState({ name: "" });
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const [isClosing, setIsClosing] = useState(false); // ? for animation

//   // Fetch loan options
//   const fetchLoanOptions = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const data = await loanOptionService.getAllLoanOptions();
//       setLoanOptions(data || []);
//     } catch (err) {
//       console.error("Error fetching loan options:", err);
//       setError("Failed to load loan options.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLoanOptions();
//   }, []);

//   // Save (create/update)
//   const handleSave = async () => {
//     if (!formData.name.trim()) {
//       setError("Loan option name is required");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       if (editId) {
//         await loanOptionService.updateLoanOption(editId, formData);
//         toast.success("Loan successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await loanOptionService.createLoanOption(formData);
//         toast.success("Loan successfully created.", {
//           icon: false,
//         });
//       }
//       setFormData({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchLoanOptions();
//     } catch (err) {
//       console.error("Error saving loan option:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to save loan option"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (option) => {
//     setFormData({ name: option.name });
//     setEditId(option.id);
//     setShowModal(true);
//     setError("");
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action can not be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 setLoading(true);
//                 await loanOptionService.deleteLoanOption(id);
//                 fetchLoanOptions();
//                 onClose();
//                 toast.success("Loan deleted successfully .", {
//                   icon: false,
//                 });
//               }}
//             >
//               Yes
//             </Button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 400); // match animation duration
//   };

//   const filteredOptions = loanOptions.filter((opt) =>
//     opt.name?.toLowerCase().includes(search.toLowerCase())
//   );
//   const totalEntries = filteredOptions.length;
//   const totalPages = Math.ceil(totalEntries / entriesPerPage);
//   const paginatedOptions = filteredOptions.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   const openCreateModal = () => {
//     setFormData({ name: "" });
//     setEditId(null);
//     setShowModal(true);
//     setError("");
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({ name: "" });
//     setEditId(null);
//     setError("");
//   };

//   return (
//     <div className="container mt-4">
//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
//       <style>{`
//           @keyframes slideInUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes slideOutUp {
//             from { transform: translateY(0); opacity: 1; }
//             to { transform: translateY(-100%); opacity: 0; }
//           }
//           .custom-slide-modal.open .modal-dialog {
//             animation: slideInUp 0.7s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.7s ease forwards;
//           }
//         `}</style>
//       <div className="bg-white p-4 shadow rounded">
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div>
//             <h5 className="fw-bold mb-0">Manage Loan Options</h5>
//             {/* <div className="text-muted">Dashboard > Loan Options</div> */}
//           </div>

//           <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//             <Button variant="success" onClick={() => setShowModal(true)}>
//               <i className="bi bi-plus-lg fs-6"></i>
//             </Button>
//           </OverlayTrigger>
//         </div>

//         {error && (
//           <Alert variant="danger" onClose={() => setError("")} dismissible>
//             {error}
//           </Alert>
//         )}

//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
//           <div className="d-flex align-items-center">
//             <Form.Select
//               className="entries-select"
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//               disabled={loading}
//             >
//               <option value="5">5</option>
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </Form.Select>
//             <span className="ms-2">entries per page</span>
//           </div>
//           <Form.Control
//             className="entries-select"
//             type="text"
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setCurrentPage(1);
//             }}
//             style={{ maxWidth: "250px" }}
//             disabled={loading}
//           />
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         ) : (
//           <>
//             <div className="table-responsive">
//               <table className="table table-bordered table-hover table-striped">
//                 <thead className="table-light">
//                   <tr>
//                     {/* <th>ID</th> */}
//                     <th>Name</th>
//                     <th style={{ width: "120px" }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedOptions.length > 0 ? (
//                     paginatedOptions.map((opt) => (
//                       <tr key={opt.id}>
//                         {/* <td>{opt.id}</td> */}
//                         <td>{opt.name}</td>
//                         <td>
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Edit</Tooltip>}
//                           >
//                             <Button
//                               variant="info"
//                               size="sm"
//                               className="me-2"
//                               onClick={() => handleEdit(opt)}
//                               disabled={loading}
//                             >
//                               <FaEdit />
//                             </Button>
//                           </OverlayTrigger>
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={<Tooltip>Delete</Tooltip>}
//                           >
//                             <Button
//                               variant="danger"
//                               size="sm"
//                               onClick={() => handleDelete(opt.id)}
//                               disabled={loading}
//                             >
//                               <FaTrash />
//                             </Button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="3" className="text-center">
//                         {loanOptions.length === 0
//                           ? "No loan options found."
//                           : "No matching loan options found."}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="d-flex justify-content-between align-items-center">
//               <div className="small text-muted">
//                 Showing {filteredOptions.length === 0 ? 0 : startIndex + 1} to{" "}
//                 {Math.min(startIndex + entriesPerPage, filteredOptions.length)}{" "}
//                 of {filteredOptions.length} entries
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
//           </>
//         )}
//         <Modal
//           show={showModal}
//           onHide={handleCloseModal}
//           centered
//           className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>{editId ? "Edit" : "Create"} Loan Option</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {error && <Alert variant="danger">{error}</Alert>}
//             <Form.Group className="mb-3">
//               <Form.Label>Loan Option Name <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 disabled={loading}
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={handleCloseModal}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button variant="success" onClick={handleSave} disabled={loading}>
//               {loading ? (
//                 <Spinner animation="border" size="sm" />
//               ) : editId ? (
//                 "Update"
//               ) : (
//                 "Create"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default LoanOptionList;

import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Spinner, Alert, } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import loanOptionService from "../../../services/loanOptionService";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const LoanOptionList = () => {
  const [loanOptions, setLoanOptions] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // API errors
  const [validationError, setValidationError] = useState(""); // Validation error
  const [isClosing, setIsClosing] = useState(false); // for animation

  const startIndex = (currentPage - 1) * entriesPerPage;

  useEffect(() => {
    fetchLoanOptions();
  }, []);

  const fetchLoanOptions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loanOptionService.getAllLoanOptions();
      setLoanOptions(data || []);
    } catch (err) {
      console.error("Error fetching loan options:", err);
      setError("Failed to load loan options.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // ✅ Form validation
    if (!formData.name.trim()) {
      setValidationError("Loan option name is required");
      return;
    }

    setValidationError("");
    setError("");

    try {
      setLoading(true);
      if (editId) {
        await loanOptionService.updateLoanOption(editId, formData);
        toast.success("Loan successfully updated.", { icon: false });
      } else {
        await loanOptionService.createLoanOption(formData);
        toast.success("Loan successfully created.", { icon: false });
      }
      setFormData({ name: "" });
      setEditId(null);
      handleCloseModal();
      fetchLoanOptions();
    } catch (err) {
      console.error("Error saving loan option:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save loan option"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (option) => {
    setFormData({ name: option.name });
    setEditId(option.id);
    setShowModal(true);
    setError("");
    setValidationError("");
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                setLoading(true);
                await loanOptionService.deleteLoanOption(id);
                fetchLoanOptions();
                onClose();
                toast.success("Loan deleted successfully.", { icon: false });
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setFormData({ name: "" });
      setEditId(null);
      setError("");
      setValidationError("");
    }, 400);
  };

  const filteredOptions = loanOptions.filter((opt) =>
    opt.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalEntries = filteredOptions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedOptions = filteredOptions.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="container mt-4">
      <div className="bg-white p-4 shadow rounded">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Manage Loan Options</h5>
          <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
            <Button variant="success" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg fs-6"></i>
            </Button>
          </OverlayTrigger>
        </div>
         <div className="d-flex justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <Form.Select
                    className=" me-2"
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ width: "80px" }}
                  >
                   
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                  
                </div>
                <Form.Control
                  className=""
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: "250px" }}
                />
              </div>

        {/* Table */}
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status" variant="success">
              <span className="visually-hidden" >Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOptions.length > 0 ? (
                    paginatedOptions.map((opt) => (
                      <tr key={opt.id}>
                        <td>{opt.name}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(opt)}
                            >
                              <i className="bi bi-pencil text-white"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(opt.id)}
                            >
                              <FaTrash />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        {loanOptions.length === 0
                          ? "No loan options found."
                          : "No matching loan options found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center">
  <div className="small text-muted">
    Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
    {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
  </div>
  <div>
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          «
        </button>
      </li>
      {Array.from({ length: totalPages }, (_, i) => (
        <li
          key={i + 1}
          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        </li>
      ))}
      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </li>
    </ul>
  </div>
</div>

          </>
          
        )}
        

        {/* Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        >
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit" : "Create"} Loan Option</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                Loan Option Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isInvalid={!!validationError} // red border if invalid
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave}>
              {editId ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default LoanOptionList;
