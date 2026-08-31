import React, { useEffect, useState } from "react";
import {
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
} from "../../../services/jobCategoryService";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const JobCategoryList = () => {
  const [jobCategories, setJobCategories] = useState([]);
  const [formData, setFormData] = useState({ title: "", created_by: 2 });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [isClosing, setIsClosing] = useState(false); // ✅ for animation

  useEffect(() => {
    loadJobCategories();
  }, []);

  const loadJobCategories = async () => {
    try {
      const data = await getJobCategories();
      setJobCategories(data); // ✅ now it sets the correct array
    } catch (err) {
      console.error("Failed to load job categories", err);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateJobCategory(editId, formData);
      } else {
        await createJobCategory(formData);
      }
      handleCloseModal();
      setFormData({ title: "", created_by: 2 });
      setEditId(null);
      loadJobCategories();
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title, created_by: item.created_by });
    setEditId(item.id);
    setShowModal(true);
  };

  // const handleDelete = (id) => {
  //   confirmAlert({
  //     customUI: ({ onClose }) => (
  //       <div className="custom-ui bg-white p-4 rounded shadow text-center">
  //         <h5>Are you sure?</h5>
  //         <p>This action cannot be undone.</p>
  //         <Button variant="secondary" onClick={onClose} className="me-2">Cancel</Button>
  //         <Button variant="danger" onClick={async () => {
  //           await deleteJobCategory(id);
  //           loadJobCategories();
  //           onClose();
  //         }}>Delete</Button>
  //       </div>
  //     )
  //   });
  // };

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
                await deleteJobCategory(id);
                loadJobCategories();
                onClose();
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
    }, 400); // match animation duration
  };

  const filtered = jobCategories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
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
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold mb-0">Manage Job Categories</h5>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <Form.Select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          style={{ width: "100px" }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="Search job category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "250px" }}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </Button>
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
        </table>
      </div>

      {/* <div className="d-flex justify-content-between align-items-center">
        <span>
          Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filtered.length)} of{" "}
          {filtered.length}
        </span>
        <ul className="pagination pagination-sm mb-0">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </div> */}

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
      {/* 
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit" : "Create"} Job Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter job category title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal> */}
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
          <Modal.Title>{editId ? "Edit" : "Create"} Job Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter job category title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
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

export default JobCategoryList;
