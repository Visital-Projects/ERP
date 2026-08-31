import React, { useEffect, useState } from "react";
import {
  fetchBankTransfers,
  createBankTransfer,
  updateBankTransfer,
  deleteBankTransfer,
} from "../../../services/AccountingSetup";
import { fetchAllAccounts } from "../../../services/accountnameService";
import { Modal, Button, Form, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import BreadCrumb from "../../../components/BreadCrumb";
import { useLocation } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";

const BankBalanceTransfer = () => {
  const location = useLocation();
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const initialFormData = {
    from_account: "",
    to_account: "",
    amount: "",
    date: "",
    payment_method: "bank transfer",
    reference: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadTransfers();
    loadAccounts();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const data = await fetchBankTransfers();
      setTransfers(data);
    } catch (err) {
      setError("Failed to fetch transfers.");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const handleShowModal = (transfer = null) => {
    if (transfer) {
      setIsEditing(true);
      setCurrentTransfer(transfer);
      setFormData({ ...transfer });
    } else {
      setIsEditing(false);
      setCurrentTransfer(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateBankTransfer(currentTransfer.id, formData);
      } else {
        await createBankTransfer(formData);
      }
      await loadTransfers();
      handleCloseModal();
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save transfer.");
    }
  };

const handleDelete = (id) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
        <div style={{ fontSize: "50px", color: "#ff9900" }}>!</div>
        <h4 className="fw-bold mt-2">Are you sure?</h4>
        <p>This action cannot be undone. Do you want to continue?</p>
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-danger me-2 px-4"
            onClick={onClose}
          >
            No
          </button>
          <button
            className="btn btn-success px-4"
            onClick={async () => {
              try {
                await deleteBankTransfer(id);
                await loadTransfers(); // refresh table
                toast.success("Transfer deleted successfully.", { icon: false });
              } catch (err) {
                console.error("Failed to delete transfer:", err);
                toast.error("Failed to delete transfer.");
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

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Bank Balance Transfers</h3>
          <BreadCrumb pathname={location.pathname} />
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>New Transfer</Tooltip>}>
          <Button  variant="success" onClick={() => handleShowModal()}>
           <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {error && <p className="text-danger">{error}</p>}

          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : transfers.length === 0 ? (
            <p className="text-muted">No transfers found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t, idx) => (
                    <tr key={t.id}>
                      <td>{idx + 1}</td>
                      <td>{t.fromAccount?.holder_name || t.from_account}</td>
                      <td>{t.toAccount?.holder_name || t.to_account}</td>
                      <td>
  ₹{Number(t.amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>
                      <td>{t.date}</td>
                      <td>{t.reference}</td>
                      <td>{t.description}</td>
                      <td className="text-center">
                        <div className="btn-group">
                          <OverlayTrigger placement="top" overlay={<Tooltip>Edit Transfer</Tooltip>}>
                            <Button size="sm" variant="info" onClick={() => handleShowModal(t)}>
                              <i className="bi bi-pencil text-white"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip>Delete Transfer</Tooltip>}>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>
                              <i className="bi bi-trash text-white"></i>
                            </Button>
                          </OverlayTrigger>
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

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Bank Transfer" : "Create Bank Transfer"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>From Account<span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="from_account"
                    value={formData.from_account}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Bank</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.holder_name} - {acc.bank_name}
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted">
                    Create account here. <a href="/create-account" className="text-success">Create account</a>
                  </small>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>To Account<span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="to_account"
                    value={formData.to_account}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Bank</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.holder_name} - {acc.bank_name}
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted">
                    Create account here. <a href="/create-account" className="text-success">Create account</a>
                  </small>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Amount<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="dd-mm-yyyy"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Reference</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description<span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="success" type="submit">{isEditing ? "Update" : "Create"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <div className="mb-3">
            <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: "6rem" }}></i>
          </div>
          <h5>Are you sure?</h5>
          <p className="text-muted">This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="danger" onClick={() => setShowDeleteModal(false)}>
              No
            </Button>
            <Button variant="success" onClick={handleDelete}>
              Yes
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BankBalanceTransfer;
