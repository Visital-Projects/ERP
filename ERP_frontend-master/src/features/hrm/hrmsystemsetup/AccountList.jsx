import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  fetchAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../../../services/accountnameService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ account_name: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAccounts();
      // sort descending by id (newest first)
      const sortedData = data.sort((a, b) => b.id - a.id);
      setAccounts(sortedData);
      setError("");
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to fetch accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      if (editId) {
        await updateAccount(editId, newAccount);
      } else {
        await createAccount(newAccount);
      }
      setNewAccount({ account_name: "" });
      setEditId(null);
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      setError(
        error.response?.data?.message ||
          "Error saving account. Please try again."
      );
    }
  };

  const handleEdit = (account) => {
    setEditId(account.id);
    setNewAccount({ account_name: account.account_name });
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
                try {
                  await deleteAccount(id);
                  fetchAccounts();
                  onClose();
                } catch (error) {
                  console.error("Error deleting account:", error);
                  setError(
                    error.response?.data?.message ||
                      "Error deleting account. Please try again."
                  );
                }
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
      setNewAccount({ account_name: "" });
      setEditId(null);
      setError("");
    }, 400);
  };

  const filteredAccounts = accounts.filter((a) =>
    a.account_name?.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredAccounts.length / entriesPerPage);

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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Accounts</h5>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Search + Entries Per Page */}
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
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries per page</span>
        </div>
        <Form.Control
          type="text"
          className="form-control-sm"
          style={{ maxWidth: "250px" }}
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Account Name</th>
                  <th>Created At</th>
                  <th style={{ width: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.length > 0 ? (
                  currentAccounts.map((account) => (
                    <tr key={account.id}>
                      <td>{account.id}</td>
                      <td>{account.account_name}</td>
                      <td>
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          className="btn btn-info btn-sm me-2 square-btn"
                          onClick={() => handleEdit(account)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          className="btn btn-danger btn-sm square-btn"
                          onClick={() => handleDelete(account.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      {accounts.length === 0
                        ? "No accounts found. Click the + button to create one."
                        : "No matching accounts found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Showing {filteredAccounts.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + entriesPerPage, filteredAccounts.length)}{" "}
              of {filteredAccounts.length} entries
            </div>
            <div>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                </li>
                {Array.from({ length: pageCount }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
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
                    disabled={currentPage === pageCount}
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
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Account" : "Create Account"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Account Name</Form.Label>
            <Form.Control
              type="text"
              value={newAccount.account_name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, account_name: e.target.value })
              }
              placeholder="Enter account name"
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

export default AccountList;
