import React, { useEffect, useState } from "react";
import {
  getPerformanceTypes,
  createPerformanceType,
  updatePerformanceType,
  deletePerformanceType,
} from "../../../services/performanceTypeService";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const PerformanceTypeList = () => {
  const [performanceTypes, setPerformanceTypes] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isClosingModal, setIsClosingModal] = useState(false); // ✅ for animation

  // Load performance types
  useEffect(() => {
    loadPerformanceTypes();
  }, []);

  const loadPerformanceTypes = async () => {
    try {
      const data = await getPerformanceTypes(); // service returns array
      setPerformanceTypes(data);
    } catch (err) {
      console.error("Failed to load performance types", err);
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      if (editId) {
        await updatePerformanceType(editId, formData);
      } else {
        await createPerformanceType(formData);
      }
      handleCloseModal();
      setFormData({ name: "" });
      setEditId(null);
      loadPerformanceTypes();
    } catch (err) {
      console.error("Failed to save performance type", err);
    }
  };

  // Edit
  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditId(item.id);
    setShowModal(true);
  };

  // Delete
  // const handleDelete = (id) => {
  //   confirmAlert({
  //     customUI: ({ onClose }) => (
  //       <div className="custom-ui bg-white p-4 rounded shadow text-center">
  //         <h5>Are you sure?</h5>
  //         <p>This action cannot be undone.</p>
  //         <Button variant="secondary" onClick={onClose} className="me-2">
  //           Cancel
  //         </Button>
  //         <Button
  //           variant="danger"
  //           onClick={async () => {
  //             await deletePerformanceType(id);
  //             loadPerformanceTypes();
  //             onClose();
  //           }}
  //         >
  //           Delete
  //         </Button>
  //       </div>
  //     ),
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
                await deletePerformanceType(id);
                loadPerformanceTypes();
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

  // ✅ Modal close with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  // Filtered list for search
  const filtered = performanceTypes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (currentPage - 1) * entriesPerPage;

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      {/* ✅ Inline CSS Animations */}
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
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold mb-0">Manage Performance Types</h5>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      {/* Search & Entries */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 ms-2"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>entries per page</span>
        </div>
        <Form.Control
          type="text"
          placeholder="Search..."
          style={{ maxWidth: "250px" }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
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

      {/* Pagination */}
      {/* {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-end">
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
          </ul>
        </nav>
      )} */}

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
            {Array.from({ length: pageNumbers }, (_, i) => (
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
                currentPage === pageNumbers ? "disabled" : ""
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
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit" : "Create"} Performance Type
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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

export default PerformanceTypeList;
