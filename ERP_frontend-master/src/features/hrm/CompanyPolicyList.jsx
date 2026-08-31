import React, { useEffect, useState } from "react";
import {
  getCompanyPolicies,
  createCompanyPolicy,
  updateCompanyPolicy,
  deleteCompanyPolicy,
} from "../../services/companyPolicyService";
import { getBranches } from "../../services/hrmService";
import {
  Table,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Pencil, Trash, Download, Eye } from "react-bootstrap-icons";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import { toast } from "react-toastify";
const BASE_URL = import.meta.env.VITE_AVATARS_BASE_URL;
const CompanyPolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState({
    policies: false,
    branches: false,
    form: false,
    delete: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    branch: "",
    title: "",
    description: "",
    attachment: null,
  });
  const navigate = useNavigate(); // ? Added
  const location = useLocation(); // ? Added
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchData = async () => {
    setIsLoading((prev) => ({ ...prev, policies: true }));
    setError(null);
    try {
      const data = await getCompanyPolicies();
      setPolicies(data || []);
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError("Failed to fetch policies. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, policies: false }));
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    setIsLoading((prev) => ({ ...prev, branches: true }));
    try {
      const data = await getBranches();
      setBranches(data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to fetch branches. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, branches: false }));
    }
  };

  useEffect(() => {
    fetchData();
    fetchBranches();
  }, []);

  const handleShowModal = (policy = null) => {
    setEditingPolicy(policy);
    if (policy) {
      setForm({
        branch: policy.branch,
        title: policy.title,
        description: policy.description || "",
        attachment: null,
      });
    } else {
      setForm({
        branch: "",
        title: "",
        description: "",
        attachment: null,
      });
    }
    setPreviewImage(null);
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  //   setEditingPolicy(null);
  //   setError(null);
  //   setSuccess(null);
  // };

  // ? Modified to animate before close
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingPolicy(null);
      setPreviewImage(null);
      setError(null);
      setSuccess(null);
    }, 400);
  };
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading((prev) => ({ ...prev, form: true }));

    // Create FormData object
    const formData = new FormData();
    formData.append("branch", form.branch);
    formData.append("title", form.title);
    formData.append("description", form.description);

    // Only append attachment if it exists
    if (form.attachment instanceof File) {
      formData.append("attachment", form.attachment);
    }

    try {
      if (editingPolicy) {
        await updateCompanyPolicy(editingPolicy.id, {
          branch: form.branch,
          title: form.title,
          description: form.description,
          attachment: form.attachment,
        });
        setSuccess("Policy updated successfully!");
        toast.success("Policy successfully updated.", {
          icon: false,
        });
      } else {
        await createCompanyPolicy({
          branch: form.branch,
          title: form.title,
          description: form.description,
          attachment: form.attachment,
        });
        setSuccess("Policy created successfully!");
        toast.success("Policy successfully created.", {
          icon: false,
        });
      }
      fetchData();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      console.error("Error saving policy:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save policy. Please try again."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure you want to delete this policy?')) {
  //     setIsLoading(prev => ({ ...prev, delete: true }));
  //     try {
  //       await deleteCompanyPolicy(id);
  //       setSuccess('Policy deleted successfully!');
  //       fetchData();
  //     } catch (err) {
  //       console.error('Error deleting policy:', err);
  //       setError('Failed to delete policy. Please try again.');
  //     } finally {
  //       setIsLoading(prev => ({ ...prev, delete: false }));
  //     }
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
                  await deleteCompanyPolicy(id);
                  {
                    /* ? document delete service */
                  }
                  fetchData();
                  {
                    /* ? refresh document list */
                  }
                  toast.success("Policy deleted successfully.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Failed to delete document:", err);
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
  const handleDownload = async (filename) => {
    const fileUrl = `${BASE_URL}/company_policies/${filename}`;
    // const fileUrl = `https://erpcopy2.vnvision.in/uploads/company_policies/${filename}`;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the file.");
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id == branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  useEffect(() => {
    getFilteredData();
  }, [policies, searchTerm]);

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    const filtered = policies.filter((t) => {
      const emp = getBranchName(t.branch);
      const branch = t.title;
      const dept = t.description;
      return (
        emp.toLowerCase().includes(term) ||
        branch.toLowerCase().includes(term) ||
        dept.toLowerCase().includes(term) ||
        (t.description?.toLowerCase() || "").includes(term)
      );
    });
    setFilteredData(filtered);
  };
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="container mt-4">
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
      {/* ? Inline modal animation CSS */}
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
          <h4>Manage Company Policy</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            className="btn btn-success"
            variant="success"
            onClick={() => handleShowModal()}
            disabled={isLoading.branches || isLoading.policies}
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <div
        className="card border-0 shadow-sm rounded-4 p-3"
        style={{ height: "100%" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="d-flex align-items-center mb-2">
            <select
              className="form-select me-2"
              style={{ width: "80px" }}
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
        <div className="flex-grow-1">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status" variant="success">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <table className="table table-bordered table-hover table-striped text-center align-middle mb-0 ms-1 me-1">
              <thead className="bg-light ">
                <tr>
                  <th>Site</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th className="text-center">Attachment</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {policies.length > 0 ? (
                  currentItems.map((policy) => (
                    <tr key={policy.id}>
                      <td>{getBranchName(policy.branch)}</td>
                      <td>{policy.title}</td>
                      <td
                        style={{
                          width: "400px", // fixed width
                          whiteSpace: "normal", // allow wrapping
                          wordWrap: "break-word",
                          // break long words
                        }}
                      >
                        {policy.description || "-"}
                      </td>
                      <td className="text-center">
                        {policy.attachment ? (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Download</Tooltip>}
                            >
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  handleDownload(policy.attachment)
                                }
                                title="Download"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
                              <a
                                href={`${BASE_URL}/company_policies/${policy.attachment}`}
                                // href={`https://erpcopy2.vnvision.in/uploads/company_policies/${policy.attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-warning"
                              >
                                <i className="bi bi-eye text-white"></i>
                              </a>
                            </OverlayTrigger>
                          </>
                        ) : (
                          <span className="text-muted">No file</span>
                        )}
                      </td>

                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(policy)}
                            disabled={isLoading.form || isLoading.delete}
                          >
                            <i className="bi bi-pencil-fill text-white"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(policy.id)}
                            disabled={isLoading.delete}
                          >
                            {isLoading.delete && policy.id === deletingId ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <i className="bi bi-trash-fill text-white"></i>
                            )}
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No policies found
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
            {Math.min(indexOfLastItem, filteredData.length)} of{" "}
            {filteredData.length} entries
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
                >
                  «
                </button>
              </li>

              {/* Page Numbers */}
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
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPolicy
              ? "Edit Company Policy"
              : "Create New Company Policy"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                Site <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
                disabled={isLoading.form}
              >
                <option value="">Select Site</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                disabled={isLoading.form}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={isLoading.form}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attachment</Form.Label>
              {/* <Form.Control
                type="file"
                name="attachment"
                onChange={handleChange}
                disabled={isLoading.form}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              /> */}
              <Form.Control
                type="file"
                name="attachment"
                onChange={(e) => {
                  handleChange(e);
                  const file = e.target.files[0];
                  if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setPreviewImage(null);
                  }
                }}
                disabled={isLoading.form}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />

              {previewImage && (
                <div className="mt-2 text-center">
                  <img
                    src={previewImage}
                    alt="Attachment Preview"
                    style={{
                      maxWidth: "50%",
                      maxHeight: "100px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}

              {editingPolicy?.attachment_url && (
                <div className="mt-1">
                  <small className="text-muted">
                    Current:{" "}
                    <a
                      href={editingPolicy.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </small>
                </div>
              )}
              <small className="text-muted">
                Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
              </small>
            </Form.Group>

            {/* <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
                disabled={isLoading.form}
              >
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={isLoading.form}>
                {isLoading.form ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {editingPolicy ? "Updating..." : "Creating..."}
                  </>
                ) : editingPolicy ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div> */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {isLoading.form ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editingPolicy ? "Updating..." : "Creating..."}
              </>
            ) : editingPolicy ? (
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

export default CompanyPolicyList;

// import React, { useEffect, useState } from "react";
// import {
//   getCompanyPolicies,
//   createCompanyPolicy,
//   updateCompanyPolicy,
//   deleteCompanyPolicy,
// } from "../../services/companyPolicyService";
// import { getBranches } from "../../services/hrmService";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   OverlayTrigger,
//   Tooltip,
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import { Pencil, Trash, Download, Eye } from "react-bootstrap-icons";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../components/BreadCrumb";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import { toast } from "react-toastify";

// const CompanyPolicyList = () => {
//   const [policies, setPolicies] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingPolicy, setEditingPolicy] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isLoading, setIsLoading] = useState({
//     policies: false,
//     branches: false,
//     form: false,
//     delete: false,
//   });
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [form, setForm] = useState({
//     branch: "",
//     title: "",
//     description: "",
//     attachment: null,
//   });
//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [isClosingModal, setIsClosingModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filteredData, setFilteredData] = useState([]);
//   const [validationErrors, setValidationErrors] = useState({});

//   const fetchData = async () => {
//     setIsLoading((prev) => ({ ...prev, policies: true }));
//     setError(null);
//     try {
//       const data = await getCompanyPolicies();
//       setPolicies(data || []);
//     } catch (err) {
//       console.error("Error fetching policies:", err);
//       setError("Failed to fetch policies. Please try again.");
//     } finally {
//       setIsLoading((prev) => ({ ...prev, policies: false }));
//       setLoading(false);
//     }
//   };

//   const fetchBranches = async () => {
//     setIsLoading((prev) => ({ ...prev, branches: true }));
//     try {
//       const data = await getBranches();
//       setBranches(data || []);
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//       setError("Failed to fetch branches. Please try again.");
//     } finally {
//       setIsLoading((prev) => ({ ...prev, branches: false }));
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchBranches();
//   }, []);

//   const handleShowModal = (policy = null) => {
//     setEditingPolicy(policy);
//     if (policy) {
//       setForm({
//         branch: policy.branch,
//         title: policy.title,
//         description: policy.description || "",
//         attachment: null,
//       });
//     } else {
//       setForm({
//         branch: "",
//         title: "",
//         description: "",
//         attachment: null,
//       });
//     }
//     setShowModal(true);
//     setError(null);
//     setSuccess(null);
//   };

//   // const handleCloseModal = () => {
//   //   setShowModal(false);
//   //   setEditingPolicy(null);
//   //   setError(null);
//   //   setSuccess(null);
//   // };

//   // ? Modified to animate before close
//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setEditingPolicy(null);
//       setError(null);
//       setSuccess(null);
//     }, 400);
//   };
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     // e.preventDefault();
//     // setError(null);
//     // setSuccess(null);
//     // setIsLoading((prev) => ({ ...prev, form: true }));

//     // // Create FormData object
//     // const formData = new FormData();
//     // formData.append("branch", form.branch);
//     // formData.append("title", form.title);
//     // formData.append("description", form.description);

//     // // Only append attachment if it exists
//     // if (form.attachment instanceof File) {
//     //   formData.append("attachment", form.attachment);
//     // }

//      const errors = {};
//     if (!form.branch) errors.branch = "Branch is required";
//     if (!form.title) errors.title= "Title is required";
//     // if (!formData.employee_id) errors.employee_id = "Employee is required";
//     // if (!formData.transfer_date) errors.transfer_date = "Transfer Date is required";

//     setValidationErrors(errors);
//     if (Object.keys(errors).length > 0) return; // stop if validation fails

//     try {
//       if (editingPolicy) {
//         await updateCompanyPolicy(editingPolicy.id, {
//           branch: form.branch,
//           title: form.title,
//           description: form.description,
//           attachment: form.attachment,
//         });
//         setSuccess("Policy updated successfully!");
//         toast.success("Policy successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await createCompanyPolicy({
//           branch: form.branch,
//           title: form.title,
//           description: form.description,
//           attachment: form.attachment,
//         });
//         setSuccess("Policy created successfully!");
//         toast.success("Policy successfully created.", {
//           icon: false,
//         });
//       }
//       fetchData();
//       setTimeout(() => handleCloseModal(), 1500);
//     } catch (err) {
//       console.error("Error saving policy:", err);
//       setError(
//         err.response?.data?.message ||
//           "Failed to save policy. Please try again."
//       );
//     } finally {
//       setIsLoading((prev) => ({ ...prev, form: false }));
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm('Are you sure you want to delete this policy?')) {
//   //     setIsLoading(prev => ({ ...prev, delete: true }));
//   //     try {
//   //       await deleteCompanyPolicy(id);
//   //       setSuccess('Policy deleted successfully!');
//   //       fetchData();
//   //     } catch (err) {
//   //       console.error('Error deleting policy:', err);
//   //       setError('Failed to delete policy. Please try again.');
//   //     } finally {
//   //       setIsLoading(prev => ({ ...prev, delete: false }));
//   //     }
//   //   }
//   // };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}></div>
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
//                   await deleteCompanyPolicy(id);
//                   {
//                     /* ? document delete service */
//                   }
//                   fetchData();
//                   {
//                     /* ? refresh document list */
//                   }
//                   toast.success("Policy deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (err) {
//                   console.error("Failed to delete document:", err);
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
//   const handleDownload = async (filename) => {
//     const fileUrl = `https://erpv1.vnvision.in/uploads/company_policies/${filename}`;

//     try {
//       const response = await fetch(fileUrl);
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = downloadUrl;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(downloadUrl);
//     } catch (error) {
//       console.error("Download error:", error);
//       alert("Failed to download the file.");
//     }
//   };

//   const getBranchName = (branchId) => {
//     const branch = branches.find((b) => b.id == branchId);
//     return branch ? branch.name : "Unknown Branch";
//   };

//   useEffect(() => {
//     getFilteredData();
//   }, [policies, searchTerm]);

//   const getFilteredData = () => {
//     const term = searchTerm.toLowerCase();
//     const filtered = policies.filter((t) => {
//       const emp = getBranchName(t.branch);
//       const branch = t.title;
//       const dept = t.description;
//       return (
//         emp.toLowerCase().includes(term) ||
//         branch.toLowerCase().includes(term) ||
//         dept.toLowerCase().includes(term) ||
//         (t.description?.toLowerCase() || "").includes(term)
//       );
//     });
//     setFilteredData(filtered);
//   };
//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="container mt-4">
//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
//       {/* ? Inline modal animation CSS */}
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
//           <h4>Manage Company Policy</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//           <Button
//             className="btn btn-success"
//             variant="success"
//             onClick={() => handleShowModal()}
//             disabled={isLoading.branches || isLoading.policies}
//           >
//             <i className="bi bi-plus-lg"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>
//       {error && (
//         <Alert variant="danger" onClose={() => setError(null)} dismissible>
//           {error}
//         </Alert>
//       )}
//       {success && (
//         <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
//           {success}
//         </Alert>
//       )}

//       <div
//         className="card border-0 shadow-sm rounded-4 p-3"
//         style={{ height: "100%" }}
//       >
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               style={{ width: "80px" }}
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
//         <div className="flex-grow-1">
//           {loading ? (
//             <div className="text-center p-4">
//               <Spinner animation="border" role="status" variant="success">
//                 <span className="visually-hidden">Loading...</span>
//               </Spinner>
//             </div>
//           ) : (
//             <table className="table table-bordered table-hover table-striped text-center align-middle mb-0 ms-1 me-1">
//               <thead className="bg-light ">
//                 <tr>
//                   <th>Site</th>
//                   <th>Title</th>
//                   <th>Description</th>
//                   <th className="text-center">Attachment</th>
//                   <th className="text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {policies.length > 0 ? (
//                   currentItems.map((policy) => (
//                     <tr key={policy.id}>
//                       <td>{getBranchName(policy.branch)}</td>
//                       <td>{policy.title}</td>
//                       <td  style={{
//             width: "400px",       // fixed width
//             whiteSpace: "normal", // allow wrapping
//             wordWrap: "break-word",
//              // break long words
//           }}>{policy.description || "-"}</td>
//                       <td className="text-center">
//                         {policy.attachment ? (
//                           <>
//                             <OverlayTrigger
//                               placement="top"
//                               overlay={<Tooltip>Download</Tooltip>}
//                             >
//                               <button
//                                 type="button"
//                                 className="btn btn-success btn-sm"
//                                 onClick={() =>
//                                   handleDownload(policy.attachment)
//                                 }
//                                 title="Download"
//                               >
//                                 <i className="bi bi-download"></i>
//                               </button>
//                             </OverlayTrigger>

//                             <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
//                               <a
//                                 href={`https://erpcopy.vnvision.in/uploads/company_policies/${policy.attachment}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="btn btn-sm btn-warning"
//                               >
//                                 <i className="bi bi-eye text-white"></i>
//                               </a>
//                             </OverlayTrigger>
//                           </>
//                         ) : (
//                           <span className="text-muted">No file</span>
//                         )}
//                       </td>

//                       <td className="text-center">
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Edit</Tooltip>}
//                         >
//                           <Button
//                             variant="info"
//                             size="sm"
//                             className="me-2"
//                             onClick={() => handleShowModal(policy)}
//                             disabled={isLoading.form || isLoading.delete}
//                           >
//                             <i className="bi bi-pencil-fill text-white"></i>
//                           </Button>
//                         </OverlayTrigger>
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={<Tooltip>Delete</Tooltip>}
//                         >
//                           <Button
//                             variant="danger"
//                             size="sm"
//                             onClick={() => handleDelete(policy.id)}
//                             disabled={isLoading.delete}
//                           >
//                             {isLoading.delete && policy.id === deletingId ? (
//                               <Spinner animation="border" size="sm" />
//                             ) : (
//                               <i className="bi bi-trash-fill text-white"></i>
//                             )}
//                           </Button>
//                         </OverlayTrigger>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center text-muted py-4">
//                       No policies found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
//         <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
//           <div className="small text-muted">
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, filteredData.length)} of{" "}
//             {filteredData.length} entries
//           </div>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {/* Left Arrow */}
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

//               {/* Page Numbers */}
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

//               {/* Right Arrow */}
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

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingPolicy
//               ? "Edit Company Policy"
//               : "Create New Company Policy"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {error && <Alert variant="danger">{error}</Alert>}
//           {success && <Alert variant="success">{success}</Alert>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Site <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 name="branch"
//                 value={form.branch}
//                 onChange={handleChange}
//                 required
//                 disabled={isLoading.form}
//                 isInvalid={!!validationErrors.branch}
//               >
//                 <option value="">Select Site</option>
//                 {branches.map((branch) => (
//                   <option key={branch.id} value={branch.id}>
//                     {branch.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <Form.Control.Feedback type="invalid">
//                               {validationErrors.branch}
//                             </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Title <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 name="title"
//                 value={form.title}
//                 onChange={handleChange}
//                 required
//                 disabled={isLoading.form}
//                 isInvalid={!!validationErrors.title}
//               />
//               <Form.Control.Feedback type="invalid">
//                               {validationErrors.title}
//                             </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={4}
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 disabled={isLoading.form}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Attachment</Form.Label>
//               <Form.Control
//                 type="file"
//                 name="attachment"
//                 onChange={handleChange}
//                 disabled={isLoading.form}
//                 accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
//               />
//               {editingPolicy?.attachment_url && (
//                 <div className="mt-1">
//                   <small className="text-muted">
//                     Current:{" "}
//                     <a
//                       href={editingPolicy.attachment_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       View File
//                     </a>
//                   </small>
//                 </div>
//               )}
//               <small className="text-muted">
//                 Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
//               </small>
//             </Form.Group>

//             {/* <div className="d-flex justify-content-end">
//               <Button
//                 variant="secondary"
//                 onClick={handleCloseModal}
//                 className="me-2"
//                 disabled={isLoading.form}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="success" disabled={isLoading.form}>
//                 {isLoading.form ? (
//                   <>
//                     <Spinner animation="border" size="sm" className="me-2" />
//                     {editingPolicy ? "Updating..." : "Creating..."}
//                   </>
//                 ) : editingPolicy ? (
//                   "Update"
//                 ) : (
//                   "Create"
//                 )}
//               </Button>
//             </div> */}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {isLoading.form ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 {editingPolicy ? "Updating..." : "Creating..."}
//               </>
//             ) : editingPolicy ? (
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

// export default CompanyPolicyList;
