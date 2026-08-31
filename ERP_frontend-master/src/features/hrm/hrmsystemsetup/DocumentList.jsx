// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import documentService from "../../../services/documentService";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { confirmAlert } from "react-confirm-alert";

// const DocumentList = () => {
//   const [documents, setDocuments] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newDocument, setNewDocument] = useState({
//     name: "",
//     is_required: "yes",
//   });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const fetchDocuments = async () => {
//     try {
//       const res = await documentService.getAll();
//       const docs = Array.isArray(res?.data?.data) ? res.data.data : [];
//       setDocuments(docs);
//     } catch (error) {
//       console.error("Failed to fetch documents:", error);
//       setDocuments([]);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await documentService.update(editId, newDocument);
//       } else {
//         await documentService.create(newDocument);
//       }
//       setNewDocument({ name: "", is_required: "yes" });
//       setEditId(null);
//       handleCloseModal();
//       fetchDocuments();
//     } catch (error) {
//       console.error("Error saving document:", error);
//     }
//   };

//   const handleEdit = (doc) => {
//     setEditId(doc.id);
//     setNewDocument({ name: doc.name, is_required: doc.is_required });
//     setShowModal(true);
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
//                 await documentService.remove(id);
//                 fetchDocuments();
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

//   const filteredDocuments = documents.filter((d) =>
//     d.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentDocuments = filteredDocuments.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredDocuments.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">
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
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Document Type</h5>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           +
//         </Button>
//       </div>

//       {/* Search and Entries per Page */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 ms-2"
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//             <option value="100">100</option>
//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           className="form-control-sm"
//           style={{ maxWidth: "250px" }}
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       {/* Table */}
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Document Name</th>
//               <th>Required</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentDocuments.length > 0 ? (
//               currentDocuments.map((doc) => (
//                 <tr key={doc.id}>
//                   <td>{doc.name}</td>
//                   <td>
//                     <span
//                       className={`badge px-3 py-2 fw-semibold ${
//                         doc.is_required === "yes"
//                           ? "bg-success text-white"
//                           : "bg-danger text-white"
//                       }`}
//                       style={{ borderRadius: "6px" }} // You can tweak this value or remove it for square corners
//                     >
//                       {doc.is_required === "yes" ? "Required" : "Not Required"}
//                     </span>
//                   </td>
//                   <td>
//                     <Button
//                       className="btn btn-info btn-sm me-2 square-btn"
//                       onClick={() => handleEdit(doc)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       className="btn btn-danger btn-sm square-btn"
//                       onClick={() => handleDelete(doc.id)}
//                     >
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="text-center">
//                   No documents found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {/* <div className="d-flex justify-content-between align-items-center mt-3">
//         <span>
//           Showing {filteredDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredDocuments.length)} of{" "}
//           {filteredDocuments.length} entries
//         </span>
//         <nav>
//           <ul className="pagination pagination-sm mb-0">
//             {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
//               <li
//                 key={page}
//                 className={`page-item ${currentPage === page ? "active" : ""}`}
//               >
//                 <button className="page-link" onClick={() => setCurrentPage(page)}>
//                   {page}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div> */}
//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredDocuments.length)} of{" "}
//           {filteredDocuments.length} entries
//         </div>
//         <div>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 «
//               </button>
//             </li>
//             {Array.from({ length: pageCount }, (_, i) => (
//               <li
//                 key={i + 1}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${
//                 currentPage === pageCount ? "disabled" : ""
//               }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 »
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Modal */}
//       {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Document" : "Create Document"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Document Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newDocument.name}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, name: e.target.value })
//               }
//               placeholder="Enter document name"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Is Required?</Form.Label>
//             <Form.Select
//               value={newDocument.is_required}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, is_required: e.target.value })
//               }
//             >
//               <option value="yes">Yes</option>
//               <option value="no">No</option>
//             </Form.Select>
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal> */}

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Document" : "Create Document"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Document Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newDocument.name}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, name: e.target.value })
//               }
//               placeholder="Enter document name"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Is Required?</Form.Label>
//             <Form.Select
//               value={newDocument.is_required}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, is_required: e.target.value })
//               }
//             >
//               <option value="yes">Yes</option>
//               <option value="no">No</option>
//             </Form.Select>
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default DocumentList;






















// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import documentService from "../../../services/documentService";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { confirmAlert } from "react-confirm-alert";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const DocumentList = () => {
//   const [documents, setDocuments] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newDocument, setNewDocument] = useState({
//     name: "",
//     is_required: "yes",
//   });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false); // ? for animation

//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const fetchDocuments = async () => {
//     try {
//       const res = await documentService.getAll();
//       const docs = Array.isArray(res?.data?.data) ? res.data.data : [];
//       setDocuments(docs);
//     } catch (error) {
//       console.error("Failed to fetch documents:", error);
//       setDocuments([]);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await documentService.update(editId, newDocument);
//         toast.success("Document successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await documentService.create(newDocument);
//         toast.success("Document successfully created.", {
//           icon: false,
//         });
//       }
//       setNewDocument({ name: "", is_required: "yes" });
//       setEditId(null);
//       handleCloseModal();
//       fetchDocuments();
//     } catch (error) {
//       console.error("Error saving document:", error);
//     }
//   };

//   const handleEdit = (doc) => {
//     setEditId(doc.id);
//     setNewDocument({ name: doc.name, is_required: doc.is_required });
//     setShowModal(true);
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
//                 await documentService.remove(id);
//                 fetchDocuments();
//                 onClose();
//                 toast.success("Documnent deleted successfully .", {
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

//   const filteredDocuments = documents.filter((d) =>
//     d.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentDocuments = filteredDocuments.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredDocuments.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">

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
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Document Type</h5>
//         <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
//           <Button variant="success" onClick={() => setShowModal(true)}>
//             <i className="bi bi-plus-lg fs-6"></i>{" "}
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {/* Search and Entries per Page */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 ms-2 entries-select"
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//             <option value="100">100</option>
//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           className="form-control-sm entries-select"
//           style={{ maxWidth: "250px" }}
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       {/* Table */}
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Document Name</th>
//               <th>Required</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentDocuments.length > 0 ? (
//               currentDocuments.map((doc) => (
//                 <tr key={doc.id}>
//                   <td>{doc.name}</td>
//                   <td>
//                     <span
//                       className={`badge px-3 py-2 fw-semibold ${doc.is_required === "yes"
//                         ? "bg-success text-white"
//                         : "bg-danger text-white"
//                         }`}
//                       style={{ borderRadius: "6px" }} // You can tweak this value or remove it for square corners
//                     >
//                       {doc.is_required === "yes" ? "Required" : "Not Required"}
//                     </span>
//                   </td>
//                   <td>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-info btn-sm me-2 square-btn"
//                         onClick={() => handleEdit(doc)}
//                       >
//                         <FaEdit />
//                       </Button>
//                     </OverlayTrigger>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-danger btn-sm square-btn"
//                         onClick={() => handleDelete(doc.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </OverlayTrigger>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="text-center">
//                   No documents found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredDocuments.length)} of{" "}
//           {filteredDocuments.length} entries
//         </div>
//         <div>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 «
//               </button>
//             </li>
//             {Array.from({ length: pageCount }, (_, i) => (
//               <li
//                 key={i + 1}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${currentPage === pageCount ? "disabled" : ""
//                 }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 »
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Document" : "Create Document"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Document Name <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               value={newDocument.name}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, name: e.target.value })
//               }
//               placeholder="Enter document name"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Is Required?</Form.Label>
//             <Form.Select
//               value={newDocument.is_required}
//               onChange={(e) =>
//                 setNewDocument({ ...newDocument, is_required: e.target.value })
//               }
//             >
//               <option value="yes">Yes</option>
//               <option value="no">No</option>
//             </Form.Select>
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default DocumentList;






















import React, { useState, useEffect } from "react";
import { Modal, Button, Form , Spinner} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import documentService from "../../../services/documentService";
import "react-confirm-alert/src/react-confirm-alert.css";
import { confirmAlert } from "react-confirm-alert";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    is_required: "yes",
  });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getAll();
      const docs = Array.isArray(res?.data?.data) ? res.data.data : [];
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    }
    finally{
      setLoading(false)
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!newDocument.name.trim()) newErrors.name = "Document name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await documentService.update(editId, newDocument);
        toast.success("Document successfully updated.", { icon: false });
      } else {
        await documentService.create(newDocument);
        toast.success("Document successfully created.", { icon: false });
      }
      setNewDocument({ name: "", is_required: "yes" });
      setEditId(null);
      setErrors({});
      handleCloseModal();
      fetchDocuments();
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const handleEdit = (doc) => {
    setEditId(doc.id);
    setNewDocument({ name: doc.name, is_required: doc.is_required });
    setErrors({});
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
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                await documentService.remove(id);
                fetchDocuments();
                onClose();
                toast.success("Document deleted successfully.", { icon: false });
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
      setErrors({});
    }, 400);
  };

  const filteredDocuments = documents.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredDocuments.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
        .is-invalid {
          border-color: #dc3545 !important;
        }
        .invalid-feedback {
          display: block;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Document Type</h5>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setNewDocument({ name: "", is_required: "yes" });
              setErrors({});
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search & entries */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 ms-2 "
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        
        </div>
        <Form.Control
          type="text"
          className="form-control-sm "
          style={{ maxWidth: "250px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
         {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Document Name</th>
              <th>Required</th>
              <th style={{ width: "120px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.length > 0 ? (
              currentDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>
                    <span
                      className={`badge px-3 py-2 fw-semibold ${
                        doc.is_required === "yes"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                      }`}
                      style={{ borderRadius: "6px" }}
                    >
                      {doc.is_required === "yes" ? "Required" : "Not Required"}
                    </span>
                  </td>
                  <td>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                      <Button
                        className="btn btn-info btn-sm me-2 square-btn"
                        onClick={() => handleEdit(doc)}
                      >
                       <i className="bi bi-pencil text-white"></i>
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                      <Button
                        className="btn btn-danger btn-sm square-btn"
                        onClick={() => handleDelete(doc.id)}
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
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>)}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredDocuments.length)} of{" "}
          {filteredDocuments.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
                »
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Document" : "Create Document"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Document Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={newDocument.name}
              onChange={(e) => {
                setNewDocument({ ...newDocument, name: e.target.value });
                setErrors({ ...errors, name: "" });
              }}
              placeholder="Enter document name"
              className={errors.name ? "is-invalid" : ""}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </Form.Group>

          <Form.Group>
            <Form.Label>Is Required?</Form.Label>
            <Form.Select
              value={newDocument.is_required}
              onChange={(e) =>
                setNewDocument({ ...newDocument, is_required: e.target.value })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Form.Select>
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
  );
};

export default DocumentList;
