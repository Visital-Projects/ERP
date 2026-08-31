// // src/components/DocumentUploads.jsx
// import React, { useState, useEffect } from "react";
// import documentService from "../../services/documentsetupService";
// import { fetchRoles } from "../../services/roleService";

// const DocumentUploads = () => {
//   const [documents, setDocuments] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [rolesLoading, setRolesLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingDocument, setEditingDocument] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     role: "",
//     description: "",
//     document: null,
//   });

//   const BASE_URL = import.meta.env.VITE_BASE_URL || "";

//   // Fetch all roles
//   const fetchAllRoles = async () => {
//     try {
//       setRolesLoading(true);
//       const response = await fetchRoles();
//       setRoles(response.data || response);
//     } catch (err) {
//       console.error("Error fetching roles:", err);
//       setError("Failed to fetch roles");
//     } finally {
//       setRolesLoading(false);
//     }
//   };

//   // Fetch all documents
//   const fetchAllDocuments = async () => {
//     try {
//       setLoading(true);
//       const data = await documentService.getAllDocuments();
//       setDocuments(data);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch documents");
//       console.error("Error fetching documents:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllDocuments();
//     fetchAllRoles();
//   }, []);

//   // Get role name by ID for display purposes
//   const getRoleName = (roleId) => {
//     if (rolesLoading) return "Loading...";

//     const role = roles.find((r) => r.id.toString() === roleId.toString());
//     return role ? role.name : `Role #${roleId}`;
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle file input with size validation
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const maxSize = 10 * 1024 * 1024; // 10MB
//     if (file.size > maxSize) {
//       setError("File size must be less than 10MB");
//       e.target.value = "";
//       return;
//     }

//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       setError(
//         "File type not allowed. Please upload JPG, PNG, PDF, or DOC files."
//       );
//       e.target.value = "";
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       document: file,
//     }));
//   };

//   // Open modal for create/edit
//   const handleShowModal = (document = null) => {
//     if (document) {
//       setEditingDocument(document);
//       setFormData({
//         name: document.name,
//         role: document.role.toString(),
//         description: document.description || "",
//         document: null,
//       });
//     } else {
//       setEditingDocument(null);
//       setFormData({
//         name: "",
//         role: "",
//         description: "",
//         document: null,
//       });
//     }
//     setShowModal(true);
//     setError("");
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingDocument(null);
//     setFormData({
//       name: "",
//       role: "",
//       description: "",
//       document: null,
//     });
//     setError("");
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;

//     try {
//       setSubmitting(true);
//       setError("");

//       const submitData = new FormData();
//       submitData.append("name", formData.name);
//       submitData.append("role", formData.role);
//       submitData.append("description", formData.description);

//       if (formData.document) {
//         submitData.append("document", formData.document);
//       }

//       if (editingDocument) {
//         await documentService.updateDocument(editingDocument.id, submitData);
//         setSuccess("Document updated successfully");
//       } else {
//         await documentService.createDocument(submitData);
//         setSuccess("Document created successfully");
//       }

//       handleCloseModal();
//       fetchAllDocuments();
//     } catch (err) {
//       console.error("Error saving document:", err);

//       if (err.code === "ERR_NETWORK") {
//         setError(
//           "Network error - please check your connection and try again. If the problem persists, the file may be too large."
//         );
//       } else if (err.response?.status === 413) {
//         setError("File too large - please choose a smaller file (max 10MB)");
//       } else {
//         setError(
//           "Failed to save document: " +
//             (err.response?.data?.message || err.message || "Unknown error")
//         );
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle delete document
//   const handleDelete = async (documentId) => {
//     if (window.confirm("Are you sure you want to delete this document?")) {
//       try {
//         await documentService.deleteDocument(documentId);
//         setSuccess("Document deleted successfully");
//         fetchAllDocuments();
//       } catch (err) {
//         setError(
//           "Failed to delete document: " +
//             (err.response?.data?.message || err.message)
//         );
//         console.error("Error deleting document:", err);
//       }
//     }
//   };

//   // Handle preview (just opens in new tab, no download)
//   const handlePreviewDocument = async (doc) => {
//     setError("");
//     try {
//       const fileName = doc.document;
//       if (!fileName) throw new Error("Invalid file name");

//       const base = BASE_URL.replace(/\/$/, "");
//       const directUrl = /^https?:\/\//i.test(fileName)
//         ? fileName
//         : `${base}/uploads/document_uploads/${encodeURIComponent(fileName)}`;

//       // Open directly in new tab (no fetch needed, browser will handle preview)
//       window.open(directUrl, "_blank");
//     } catch (err) {
//       console.error("Preview error:", err);
//       setError("Failed to preview file. See console for details.");
//     }
//   };

//   const handleViewDocument = async (doc) => {
//     setError("");
//     try {
//       const fileName = doc.document;
//       if (!fileName) throw new Error("Invalid file name");

//       const base = BASE_URL.replace(/\/$/, "");
//       const fileUrl = /^https?:\/\//i.test(fileName)
//         ? fileName
//         : `${base}/uploads/document_uploads/${encodeURIComponent(fileName)}`;

//       // Always force download
//       const res = await fetch(fileUrl);
//       if (!res.ok) throw new Error("File not found");

//       const blob = await res.blob();
//       const blobUrl = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = blobUrl;

//       // Use file name from server header or fallback to original
//       const cd = res.headers.get("content-disposition");
//       let downloadName = fileName;
//       if (cd) {
//         const m = cd.match(/filename="?([^";]+)"?/);
//         if (m && m[1]) downloadName = m[1];
//       }
//       a.download = decodeURIComponent(downloadName);

//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(blobUrl);
//     } catch (err) {
//       console.error("Download error:", err);
//       setError("Failed to download file.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container-fluid document-uploads">
//         <div
//           className="d-flex justify-content-center align-items-center"
//           style={{ height: "50vh" }}
//         >
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <span className="ms-2">Loading documents...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid document-uploads">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="mb-0">Document Uploads</h2>
//         <button className="btn btn-primary" onClick={() => handleShowModal()}>
//           <i className="bi bi-plus-circle me-2"></i>Upload Document
//         </button>
//       </div>

//       {/* Error/Success Messages */}
//       {error && (
//         <div
//           className="alert alert-danger alert-dismissible fade show"
//           role="alert"
//         >
//           {error}
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() => setError("")}
//           ></button>
//         </div>
//       )}

//       {success && (
//         <div
//           className="alert alert-success alert-dismissible fade show"
//           role="alert"
//         >
//           {success}
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() => setSuccess("")}
//           ></button>
//         </div>
//       )}

//       {/* Documents Table */}
//       <div className="card">
//         <div className="card-body">
//           {documents.length === 0 ? (
//             <div className="text-center py-4">
//               <i className="bi bi-folder-x display-4 text-muted"></i>
//               <p className="mt-3">
//                 No documents found. Upload your first document.
//               </p>
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Document</th>
//                     <th>Role</th>
//                     <th>Description</th>

//                     {/* <th>Created At</th> */}
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents.map((document) => (
//                     <tr key={document.id}>
//                       <td className="align-middle">{document.name}</td>
//                       <td className="align-middle">
//                         <span className="badge bg-secondary">
//                           {getRoleName(document.role)}
//                         </span>
//                       </td>
//                       <td className="align-middle">{document.description}</td>

//                       <td className="align-middle">
//                         <div className="btn-group" role="group">
//                           <button
//                             type="button"
//                             className="btn btn-success btn-sm"
//                             onClick={() => handleViewDocument(document)}
//                             title="Download"
//                           >
//                             <i className="bi bi-download"></i>
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-secondary btn-sm"
//                             onClick={() => handlePreviewDocument(document)}
//                             title="Preview"
//                           >
//                             <i className="bi bi-arrows-fullscreen"></i>
//                           </button>
//                         </div>
//                       </td>

//                       {/* <td className="align-middle">
//                         {new Date(document.created_at).toLocaleDateString()}
//                       </td> */}
//                       <td className="align-middle">
//                         <div className="btn-group" role="group">
//                           {/* <button
//                             type="button"
//                             className="btn btn-sm btn-outline-primary"
//                             onClick={() => handleViewDocument(document)}
//                             title="View / Download Document"
//                           >
//                             <i className="bi bi-download"></i>
//                           </button> */}
//                           <button
//                             type="button"
//                             className="btn btn-sm btn-outline-secondary"
//                             onClick={() => handleShowModal(document)}
//                             title="Edit"
//                           >
//                             <i className="bi bi-pencil"></i>
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-sm btn-outline-danger"
//                             onClick={() => handleDelete(document.id)}
//                             title="Delete"
//                           >
//                             <i className="bi bi-trash"></i>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Create/Edit Modal */}
//       <div
//         className={`modal fade ${showModal ? "show" : ""}`}
//         style={{ display: showModal ? "block" : "none" }}
//         tabIndex="-1"
//       >
//         <div className="modal-dialog modal-lg">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">
//                 {editingDocument ? "Edit Document" : "Upload New Document"}
//               </h5>
//               <button
//                 type="button"
//                 className="btn-close"
//                 onClick={handleCloseModal}
//                 disabled={submitting}
//               ></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 {/* name, role, description, file inputs (unchanged) */}
//                 <div className="mb-3">
//                   <label htmlFor="name" className="form-label">
//                     Name <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     required
//                     disabled={submitting}
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label htmlFor="role" className="form-label">
//                     Role <span className="text-danger">*</span>
//                   </label>
//                   {rolesLoading ? (
//                     <div className="form-control">Loading roles...</div>
//                   ) : (
//                     <select
//                       className="form-select"
//                       id="role"
//                       name="role"
//                       value={formData.role}
//                       onChange={handleInputChange}
//                       required
//                       disabled={submitting}
//                     >
//                       <option value="">Select Role</option>
//                       {roles
//                         .filter(
//                           (role) =>
//                             role.name.toLowerCase() !== "super admin" &&
//                             role.name.toLowerCase() !== "company"
//                         )
//                         .map((role) => (
//                           <option key={role.id} value={role.id}>
//                             {role.name}
//                           </option>
//                         ))}
//                     </select>
//                   )}
//                 </div>

//                 <div className="mb-3">
//                   <label htmlFor="description" className="form-label">
//                     Description
//                   </label>
//                   <textarea
//                     className="form-control"
//                     id="description"
//                     name="description"
//                     rows="3"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     disabled={submitting}
//                   ></textarea>
//                 </div>

//                 <div className="mb-3">
//                   <label htmlFor="document" className="form-label">
//                     Document{" "}
//                     {!editingDocument && <span className="text-danger">*</span>}
//                   </label>
//                   <input
//                     type="file"
//                     className="form-control"
//                     id="document"
//                     onChange={handleFileChange}
//                     accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
//                     disabled={submitting}
//                     required={!editingDocument}
//                   />
//                   <div className="form-text">
//                     Maximum file size: 10MB. Allowed types: JPG, PNG, PDF, DOC,
//                     DOCX.
//                     {editingDocument &&
//                       " Leave empty to keep the current document."}
//                   </div>
//                   {formData.document && (
//                     <div className="form-text text-success">
//                       Selected: {formData.document.name}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                   disabled={submitting}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn btn-primary"
//                   disabled={submitting}
//                 >
//                   {submitting ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2"></span>
//                       {editingDocument ? "Updating..." : "Uploading..."}
//                     </>
//                   ) : editingDocument ? (
//                     "Update"
//                   ) : (
//                     "Upload"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Modal backdrop */}
//       {showModal && (
//         <div
//           className="modal-backdrop fade show"
//           onClick={submitting ? undefined : handleCloseModal}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default DocumentUploads;

// src/components/DocumentUploads.jsx
import React, { useState, useEffect } from "react";
import documentService from "../../services/documentsetupService";
import { fetchRoles } from "../../services/roleService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import BreadCrumb from "../../components/BreadCrumb";
import { Plus } from "react-bootstrap-icons";
import {
  Button,
  Modal,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

const DocumentUploads = () => {
  const [documents, setDocuments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    document: null,
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  // Fetch all roles
  const fetchAllRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetchRoles();
      setRoles(response.data || response);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles");
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch all documents
  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAllDocuments();
      setDocuments(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
    fetchAllRoles();
  }, []);

  // Get role name by ID for display purposes
  const getRoleName = (roleId) => {
    if (rolesLoading) return "Loading...";
    const role = roles.find((r) => r.id.toString() === roleId.toString());
    return role ? role.name : `Role #${roleId}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "File type not allowed. Please upload JPG, PNG, PDF, or DOC files."
      );
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      document: file,
    }));
  };

  const handleShowModal = (document = null) => {
    if (document) {
      setEditingDocument(document);
      setFormData({
        name: document.name,
        role: document.role.toString(),
        description: document.description || "",
        document: null,
      });
    } else {
      setEditingDocument(null);
      setFormData({
        name: "",
        role: "",
        description: "",
        document: null,
      });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDocument(null);
    setFormData({
      name: "",
      role: "",
      description: "",
      document: null,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("role", formData.role);
      submitData.append("description", formData.description);

      if (formData.document) {
        submitData.append("document", formData.document);
      }

      if (editingDocument) {
        await documentService.updateDocument(editingDocument.id, submitData);
        setSuccess("Document updated successfully");
      } else {
        await documentService.createDocument(submitData);
        setSuccess("Document created successfully");
      }

      handleCloseModal();
      fetchAllDocuments();
    } catch (err) {
      console.error("Error saving document:", err);

      if (err.code === "ERR_NETWORK") {
        setError(
          "Network error - please check your connection and try again. If the problem persists, the file may be too large."
        );
      } else if (err.response?.status === 413) {
        setError("File too large - please choose a smaller file (max 10MB)");
      } else {
        setError(
          "Failed to save document: " +
            (err.response?.data?.message || err.message || "Unknown error")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (documentId) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>!</div>
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
                  await documentService.deleteDocument(documentId);
                  await fetchAllDocuments();
                  toast.success("Document deleted successfully.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Failed to delete document:", err);
                  toast.error("Failed to delete document.");
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

  if (loading) {
    return (
      <div className="container-fluid document-uploads">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 my-4 document-uploads">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Document Uploads</h3>
          <BreadCrumb pathname={location.pathname} />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Upload Document</Tooltip>}
        >
          <Button
            size="sm"
            className="rounded-1"
            variant="success"
            onClick={() => handleShowModal()}
          >
            <Plus />
          </Button>
        </OverlayTrigger>
      </div>

      {/* Error/Success Messages */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Documents Table */}
      <div className="card">
        <div className="card-body">
          {documents.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-folder-x display-4 text-muted"></i>
              <p className="mt-3">
                No documents found. Upload your first document.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Document</th>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.name}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              const fileName = document.document;
                              const base = BASE_URL.replace(/\/$/, "");
                              const fileUrl = /^https?:\/\//i.test(fileName)
                                ? fileName
                                : `${base}/uploads/document_uploads/${encodeURIComponent(
                                    fileName
                                  )}`;
                              const a = document.createElement("a");
                              a.href = fileUrl;
                              a.download = fileName;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            }}
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              const fileName = document.document;
                              const base = BASE_URL.replace(/\/$/, "");
                              const directUrl = /^https?:\/\//i.test(fileName)
                                ? fileName
                                : `${base}/uploads/document_uploads/${encodeURIComponent(
                                    fileName
                                  )}`;
                              window.open(directUrl, "_blank");
                            }}
                          >
                            <i className="bi bi-arrows-fullscreen"></i>
                          </button>
                        </div>
                      </td>
                      <td>{getRoleName(document.role)}</td>
                      <td>{document.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleShowModal(document)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(document.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal using react-bootstrap Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDocument ? "Edit Document" : "Upload New Document"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Role <span className="text-danger">*</span>
              </Form.Label>
              {rolesLoading ? (
                <Form.Control disabled value="Loading roles..." />
              ) : (
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                >
                  <option value="">Select Role</option>
                  {roles
                    .filter(
                      (role) =>
                        role.name.toLowerCase() !== "super admin" &&
                        role.name.toLowerCase() !== "company"
                    )
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </Form.Select>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Document{" "}
                {!editingDocument && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                disabled={submitting}
                required={!editingDocument}
              />
              <div className="form-text">
                Maximum file size: 10MB. Allowed types: JPG, PNG, PDF, DOC,
                DOCX.
                {editingDocument &&
                  " Leave empty to keep the current document."}
              </div>
              {formData.document && (
                <div className="form-text text-success">
                  Selected: {formData.document.name}
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {editingDocument ? "Updating..." : "Uploading..."}
                </>
              ) : editingDocument ? (
                "Update"
              ) : (
                "Upload"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentUploads;
