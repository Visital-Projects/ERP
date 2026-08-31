import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import designationService from "../../../services/designationService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const DesignationList = () => {
  const [designations, setDesignations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDesignation, setNewDesignation] = useState({
    name: "",
    branch_id: "",
    department_id: "",
    overtime_rate: "",
  });
  const [errors, setErrors] = useState({}); // validation errors
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDesignations();
    fetchBranches();
    fetchDepartments();
  }, []);

  const fetchDesignations = async () => {
    try {
      const res = await designationService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setDesignations(data);
    } catch (error) {
      console.error("Failed to fetch designations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      setBranches(res.data || res);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data || res);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  // validate fields before save
  const validateForm = () => {
    const newErrors = {};
    if (!newDesignation.name.trim())
      newErrors.name = "Designation name is required.";
    if (!newDesignation.branch_id)
      newErrors.branch_id = "Branch selection is required.";
    if (!newDesignation.department_id)
      newErrors.department_id = "Department selection is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: newDesignation.name.trim(),
        branch_id: Number(newDesignation.branch_id),
        department_id: Number(newDesignation.department_id),
        overtime_rate: Number(newDesignation.overtime_rate),
        created_by: 1,
      };

      if (editId) {
        await designationService.update(editId, payload);
        toast.success("Designation successfully updated.", { icon: false });
      } else {
        await designationService.create(payload);
        toast.success("Designation successfully created.", { icon: false });
      }
      if (
        !newDesignation.overtime_rate ||
        Number(newDesignation.overtime_rate) <= 0
      )
        newErrors.overtime_rate = "Overtime rate must be greater than 0.";

      setNewDesignation({ name: "", branch_id: "", department_id: "" });
      setEditId(null);
      setErrors({});
      handleCloseModal();
      fetchDesignations();
      // {
      //   location.state?.from
      //     ? navigate("/employees/create", {
      //         state: { from: location.pathname },
      //       })
      //     : navigate(0);
      // }
      if (location.state?.from) {
        navigate("/employees/create", {
          state: { from: location.pathname },
        });
      }
    } catch (error) {
      console.error("Error saving designation:", error);
    }
  };

  const handleEdit = (designation) => {
    setEditId(designation.id);
    setNewDesignation({
      name: designation.name,
      branch_id: String(designation.branch_id || ""),
      department_id: String(designation.department_id || ""),
      overtime_rate: designation.overtime_rate || "",
    });
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
                await designationService.remove(id);
                fetchDesignations();
                onClose();
                toast.success("Designation deleted successfully.", {
                  icon: false,
                });
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

  const filteredDesignations = designations.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentDesignations = filteredDesignations.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredDesignations.length / entriesPerPage);

  const getDepartmentName = (depId) =>
    departments.find((d) => d.id === depId)?.name || "N/A";
  const getBranchName = (branchId) =>
    branches.find((b) => b.id === branchId)?.name || "N/A";

  const filteredDepartments = departments.filter(
    (d) => d.branch_id === Number(newDesignation.branch_id)
  );

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
        <h5 className="fw-bold">Manage Designations</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setNewDesignation({ name: "", branch_id: "", department_id: "" });
              setErrors({});
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search and pagination */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center ">
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
                <th>Designation</th>
                <th>Department</th>
                <th>Site</th>
                <th>Overtime Rate</th>

                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDesignations.length > 0 ? (
                currentDesignations.map((designation) => (
                  <tr key={designation.id}>
                    <td>{designation.name}</td>
                    <td>{getDepartmentName(designation.department_id)}</td>
                    <td>{getBranchName(designation.branch_id)}</td>
                    <td>{designation.overtime_rate}</td>

                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleEdit(designation)}
                        >
                          <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(designation.id)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No designations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredDesignations.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredDesignations.length)}{" "}
          of {filteredDesignations.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
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
            <li
              className={`page-item ${
                currentPage === pageCount ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
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
          <Modal.Title>
            {editId ? "Edit Designation" : "Create Designation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Designation Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter designation name"
                value={newDesignation.name}
                onChange={(e) => {
                  setNewDesignation({
                    ...newDesignation,
                    name: e.target.value,
                  });
                  setErrors({ ...errors, name: "" });
                }}
                className={errors.name ? "is-invalid" : ""}
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Site <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={newDesignation.branch_id}
                onChange={(e) => {
                  setNewDesignation({
                    ...newDesignation,
                    branch_id: e.target.value,
                    department_id: "",
                  });
                  setErrors({ ...errors, branch_id: "" });
                }}
                className={errors.branch_id ? "is-invalid" : ""}
              >
                <option value="">Select Site</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
              {errors.branch_id && (
                <div className="invalid-feedback">{errors.branch_id}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Department <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={newDesignation.department_id}
                onChange={(e) => {
                  setNewDesignation({
                    ...newDesignation,
                    department_id: e.target.value,
                  });
                  setErrors({ ...errors, department_id: "" });
                }}
                className={errors.department_id ? "is-invalid" : ""}
                disabled={!newDesignation.branch_id}
              >
                <option value="">Select Department</option>
                {filteredDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Form.Select>
              {errors.department_id && (
                <div className="invalid-feedback">{errors.department_id}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Overtime Rate <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1.25"
                value={newDesignation.overtime_rate}
                onChange={(e) => {
                  setNewDesignation({
                    ...newDesignation,
                    overtime_rate: e.target.value,
                  });
                  setErrors({ ...errors, overtime_rate: "" });
                }}
                className={errors.overtime_rate ? "is-invalid" : ""}
              />
              {errors.overtime_rate && (
                <div className="invalid-feedback">{errors.overtime_rate}</div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editId ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DesignationList;
