import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getEmployees,
  getBranches,
} from "../../../services/hrmService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]); // Store all employees for client-side filtering

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    branch_id: "",
    department_id: "",
    employee_id: "",
    designation_id: "",
    description: "",
  });

  const [isClosingModal, setIsClosingModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchAnnouncements();
    fetchBranches();
    fetchAllEmployees(); // Fetch all employees once
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    const data = await getBranches();
    setBranches(data || []);
  };

  // Fetch all employees for client-side filtering
  // const fetchAllEmployees = async () => {
  //   try {
  //     const empData = await getEmployees({});
  //     const employeesWithEmployeeId = (empData || []).map((emp) => ({
  //       ...emp,
  //       employee_id: emp.employee_id || emp.id,
  //     }));
  //     setAllEmployees(employeesWithEmployeeId);
  //   } catch (err) {
  //     console.error("Failed to fetch all employees:", err);
  //     setAllEmployees([]);
  //   }
  // };

  const fetchAllEmployees = async () => {
    try {
      const empData = await getEmployees({});
      // ✅ Filter only active employees
      const activeEmployees = (empData || [])
        .filter((emp) => emp.is_active === true)
        .map((emp) => ({
          ...emp,
          employee_id: emp.employee_id || emp.id,
        }));

      console.log("Total employees:", empData.length);
      console.log("Active employees:", activeEmployees.length);

      setAllEmployees(activeEmployees);
    } catch (err) {
      console.error("Failed to fetch all employees:", err);
      setAllEmployees([]);
    }
  };

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
        const deptData = await departmentService.getByBranch(branch_id);
        setDepartments(deptData || []);
        setDesignations([]);
        setEmployees([]);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setDepartments([]);
        setDesignations([]);
        setEmployees([]);
      }
    } else {
      setDepartments([]);
      setDesignations([]);
      setEmployees([]);
    }
  };

  const handleDepartmentChange = async (e) => {
    const department_id = e.target.value;
    setFormData({
      ...formData,
      department_id,
      designation_id: "",
      employee_id: "",
    });

    if (department_id) {
      const desigData = await designationService.getByDepartment(department_id);
      setDesignations(desigData || []);
      setEmployees([]); // Clear employees when department changes
    } else {
      setDesignations([]);
      setEmployees([]);
    }
  };

  // Fixed: Client-side filtering by designation
  const handleDesignationChange = async (e) => {
    const designation_id = e.target.value;

    console.log("Designation changed to:", designation_id);

    // Update form data first
    setFormData((prev) => ({
      ...prev,
      designation_id,
      employee_id: "", // Reset employee when designation changes
    }));

    // Filter employees client-side by designation
    if (designation_id) {
      try {
        console.log("Filtering employees for designation:", designation_id);
        console.log("All employees count:", allEmployees.length);

        // Filter employees by designation_id
        const filteredEmployees = allEmployees.filter(
          (emp) =>
            emp.designation_id &&
            Number(emp.designation_id) === Number(designation_id)
        );

        console.log("Filtered employees:", filteredEmployees);
        console.log("Filtered employees count:", filteredEmployees.length);

        setEmployees(filteredEmployees);
      } catch (err) {
        console.error("Failed to filter employees by designation:", err);
        setEmployees([]);
      }
    } else {
      // If designation is cleared, clear employees
      setEmployees([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If designation is changing, use the special handler
    if (name === "designation_id") {
      handleDesignationChange(e);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      start_date: formData.start_date,
      end_date: formData.end_date,
      branch_id: Number(formData.branch_id),
      department_id: Number(formData.department_id),
      description: formData.description,
    };

    if (formData.designation_id)
      payload.designation_id = Number(formData.designation_id);
    if (formData.employee_id)
      payload.employee_id = Number(formData.employee_id);

    console.log("Submitting payload:", payload);

    try {
      if (editId) {
        await updateAnnouncement(editId, payload);
        toast.success("Announcement successfully updated.", { icon: false });
      } else {
        await createAnnouncement(payload);
        toast.success("Announcement successfully created.", { icon: false });
      }
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(
        "Failed to save announcement:",
        err.response?.data || err.message || err
      );
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      start_date: "",
      end_date: "",
      branch_id: "",
      department_id: "",
      employee_id: "",
      designation_id: "",
      description: "",
    });
    setDepartments([]);
    setEmployees([]);
    setDesignations([]);
    setEditId(null);
    setLoadingEdit(false);
  };

  const handleEdit = async (announcement) => {
    setLoadingEdit(true);
    setEditId(announcement.id);

    setFormData({
      ...announcement,
      employee_id: announcement.employee_id || announcement.employee_table_id,
    });

    setShowModal(true);

    try {
      const fetchPromises = [];

      if (announcement.branch_id) {
        fetchPromises.push(
          departmentService
            .getByBranch(announcement.branch_id)
            .then((deptData) => {
              setDepartments(deptData || []);
            })
        );
      }

      if (announcement.department_id) {
        fetchPromises.push(
          designationService
            .getByDepartment(announcement.department_id)
            .then((desigData) => {
              // Handle designations
              let updatedDesigData = desigData || [];
              if (
                announcement.designation_id &&
                !updatedDesigData.some(
                  (d) => d.id === announcement.designation_id
                )
              ) {
                updatedDesigData.push({
                  id: announcement.designation_id,
                  name: announcement.designation_name || "Unknown",
                });
              }
              setDesignations(
                Array.from(
                  new Map(updatedDesigData.map((d) => [d.id, d])).values()
                )
              );

              // Filter employees client-side for edit
              if (announcement.designation_id) {
                const filteredEmployees = allEmployees.filter(
                  (emp) =>
                    emp.designation_id &&
                    Number(emp.designation_id) ===
                      Number(announcement.designation_id)
                );

                let updatedEmpData = filteredEmployees.map((emp) => ({
                  ...emp,
                  employee_id: emp.employee_id || emp.id,
                }));

                if (
                  announcement.employee_id &&
                  !updatedEmpData.some(
                    (e) => e.employee_id === announcement.employee_id
                  )
                ) {
                  updatedEmpData.push({
                    id: announcement.employee_id,
                    employee_id: announcement.employee_id,
                    name: announcement.employee_name || "Unknown",
                  });
                }
                setEmployees(
                  Array.from(
                    new Map(
                      updatedEmpData.map((e) => [e.employee_id, e])
                    ).values()
                  )
                );
              }
            })
        );
      }

      await Promise.all(fetchPromises);
    } catch (error) {
      console.error("Error fetching edit data:", error);
    } finally {
      setLoadingEdit(false);
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
                  await deleteAnnouncement(id);
                  await fetchAnnouncements();
                  toast.success("Announcement deleted successfully.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Failed to delete announcement:", err);
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

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 700);
  };

  const filteredData = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

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
  
  /* Fix for dropdown direction in modal */
  .modal-content {
    overflow: visible !important;
  }
  .modal-body {
    overflow: visible !important;
  }
  .form-select {
    position: relative;
  }
  /* Ensure dropdown opens downwards */
  .modal.show .dropdown-menu {
    position: absolute !important;
    transform: translate3d(0px, 40px, 0px) !important;
    top: 100% !important;
    bottom: auto !important;
    left: 0px !important;
    will-change: transform !important;
  }
  /* Limit dropdown height and add scroll */
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
          <h4 className="fw-bold">Manage Announcements</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={(props) => <Tooltip {...props}>Create</Tooltip>}
        >
          <Button
            variant="success"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Table + Pagination */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="d-flex justify-content-between mb-2 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              style={{ width: "80px" }}
              className="form-select me-2"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </div>
          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "200px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-0"
          />
        </div>

        <div style={{ overflowY: "auto" }}>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status" variant="success">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <table
              className="table table-borderless align-middle text-nowrap mb-0 table-striped table-hover"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No announcements found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item.id}>
                      {/* <td>{item.title}</td> */}
                      <td
                        style={{
                          maxWidth: "200px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.title}
                      </td>

                      <td>
                        {item.start_date
                          ? new Date(item.start_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {item.end_date
                          ? new Date(item.end_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        style={{
                          width: "100px",
                          maxWidth: "250px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.description || "-"}
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={loadingEdit}
                          >
                            {loadingEdit ? (
                              <div
                                className="spinner-border spinner-border-sm"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            ) : (
                              <i className="bi bi-pencil-fill text-white"></i>
                            )}
                          </Button>
                        </OverlayTrigger>{" "}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
        size="md"
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Announcement" : "Create Announcement"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingEdit && (
            <div className="text-center mb-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading announcement data...</p>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Announcement Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loadingEdit}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Site</Form.Label>
                <Form.Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleBranchChange}
                  required
                  disabled={loadingEdit}
                >
                  <option value="">Select Site</option>
                  {branches.map((b) => (
                    <option key={b.id} value={Number(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleDepartmentChange}
                  required
                  disabled={loadingEdit || !formData.branch_id}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Select
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  disabled={loadingEdit || !formData.department_id}
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Employee</Form.Label>
                <Form.Select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  disabled={loadingEdit || !formData.designation_id}
                >
                  <option value="">Select Employee</option>
                  {employees.length === 0 ? (
                    <option value="" disabled>
                      No employees found for this designation
                    </option>
                  ) : (
                    employees.map((e) => (
                      <option key={e.id} value={e.employee_id}>
                        {e.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  max="9999-12-31"
                  required
                  disabled={loadingEdit}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  max="9999-12-31"
                  required
                  disabled={loadingEdit}
                />
              </div>

              <div className="col-12 mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loadingEdit}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={closeModal}
                disabled={loadingEdit}
              >
                Close
              </Button>
              <Button type="submit" variant="success" disabled={loadingEdit}>
                {loadingEdit ? "Loading..." : editId ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AnnouncementList;
