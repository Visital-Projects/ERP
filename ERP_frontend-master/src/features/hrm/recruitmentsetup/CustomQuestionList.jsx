import React, { useEffect, useState } from "react";
import {
  getCustomQuestions,
  createCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
} from "../../../services/recruitmentSetupService";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const CustomQuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({ question: "", is_required: "No" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQuestions = async () => {
    try {
      const res = await getCustomQuestions();
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Error fetching custom questions", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSave = async () => {
    try {
      if (editId) {
        await updateCustomQuestion(editId, formData);
      } else {
        await createCustomQuestion(formData);
      }
      setFormData({ question: "", is_required: "No" });
      setEditId(null);
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Error saving question", err);
    }
  };

  const handleEdit = (item) => {
    setFormData({ question: item.question, is_required: item.is_required });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="bg-white p-4 rounded shadow text-center">
          <h5>Are you sure?</h5>
          <p>This will permanently delete the question.</p>
          <Button variant="secondary" onClick={onClose} className="me-2">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await deleteCustomQuestion(id);
              fetchQuestions();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (question = null) => {
    if (question) {
      handleEdit(question);
    } else {
      setFormData({ question: "", is_required: "No" });
      setEditId(null);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setFormData({ question: "", is_required: "No" });
    setEditId(null);
    setShowModal(false);
  };

  // Filter, paginate
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredQuestions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0 fw-bold">Manage Custom Question</h4>
          <small className="text-success">Dashboard &gt; Custom-Question</small>
        </div>
        <button
          className="btn btn-success d-flex align-items-center justify-content-center p-0"
          style={{ width: "32px", height: "32px", borderRadius: "6px" }}
          onClick={() => openModal()}
        >
          <i className="bi bi-plus-lg fs-6"></i>
        </button>
      </div>

      <div className="bg-white p-3 rounded shadow-sm">
        {/* Search + Entries */}
        <div className="d-flex justify-content-between align-items-center mb-2">
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
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span>entries per page</span>
          </div>
          <div>
            <input
              type="text"
              className="form-control form-control-sm"
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
        <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
              <th>Question</th>
              <th>Required</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentQuestions.length > 0 ? (
              currentQuestions.map((q) => (
                <tr key={q.id}>
                  <td>{q.question}</td>
                  <td>
                    <span
                      className={`btn btn-sm fw-bold px-3 py-1 ${
                        q.is_required === "Yes" ? "btn-success" : "btn-secondary"
                      }`}
                      style={{
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        pointerEvents: "none",
                      }}
                    >
                      {q.is_required}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => openModal(q)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(q.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <span>
            Showing{" "}
            {filteredQuestions.length === 0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(startIndex + entriesPerPage, filteredQuestions.length)} of{" "}
            {filteredQuestions.length} entries
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                <li
                  key={page}
                  className={`page-item ${currentPage === page ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Question" : "Create Question"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="question">
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-3" controlId="is_required">
              <Form.Label>Is Required?</Form.Label>
              <Form.Select
                name="is_required"
                value={formData.is_required}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleSave}>
            {editId ? "Update" : "Create"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomQuestionList;
