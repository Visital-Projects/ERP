import React, { useEffect, useState } from "react";
import {
  getAwardTypes,
  createAwardType,
  updateAwardType,
  deleteAwardType,
} from "../../../services/awardTypeService";
import { Modal, Button, Form,Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const AwardTypeList = () => {
  const [awardTypes, setAwardTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", created_by: 1 });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [validationError, setValidationError] = useState(""); // ✅ validation
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false); // ? for animation

  useEffect(() => {
    loadAwardTypes();
  }, []);

  // ? Load award types correctly
  const loadAwardTypes = async () => {
    try {
      const res = await getAwardTypes(); // res is already array
      setAwardTypes(res || []);
    } catch (err) {
      console.error("Error loading award types", err);
    }finally{
      setLoading(false)
    }
  };

  const handleSave = async () => {
    // ✅ Validate required field
    if (!formData.name.trim()) {
      setValidationError("Award type name is required");
      return; // Stop if validation fails
    }

    // Clear previous validation error
    setValidationError("");

    try {
      if (editId) {
        // Update existing award type
        await updateAwardType(editId, formData);
        toast.success("Award successfully updated.", { icon: false });
      } else {
        // Create new award type
        await createAwardType(formData);
        toast.success("Award successfully created.", { icon: false });
      }

      // Reset form and close modal
      setFormData({ name: "", created_by: 1 });
      setEditId(null);
      handleCloseModal();

      // Reload data
      loadAwardTypes();
    } catch (err) {
      console.error("Error saving award type:", err);
      toast.error("Failed to save award type. Please try again.", {
        icon: false,
      });
    }
  };

  const handleEdit = (type) => {
    setFormData({ name: type.name, created_by: type.created_by || 1 });
    setEditId(type.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action can not be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                await deleteAwardType(id);
                loadAwardTypes();
                onClose();
                toast.success("Award deleted successfully.", {
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
      setFormData({ name: "", created_by: 1 });
      setEditId(null);
      setValidationError(""); // reset validation
    }, 400);
  };

  const filtered = awardTypes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
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
        <h5 className="fw-bold mb-0">Manage Award Types</h5>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button variant="success" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* ? Pagination & Search Controls */}
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

      {/* ? Table */}
      <div className="table-responsive">
         {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit</Tooltip>}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(t)}
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
                        onClick={() => handleDelete(t.id)}
                      >
                        <FaTrash />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>)}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filtered.length)} of{" "}
          {filtered.length} entries
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

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit" : "Create"} Award Type</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter award type name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isInvalid={!!validationError} // red border if validation fails
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
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

export default AwardTypeList;
