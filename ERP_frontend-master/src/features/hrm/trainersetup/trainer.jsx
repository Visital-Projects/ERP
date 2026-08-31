import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Table,
  Pagination,
} from "react-bootstrap"; // <-- import Form, Table, Pagination
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getBranches,
} from "../../../services/hrmService";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Trainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    branch: "",
    firstname: "",
    lastname: "",
    contact: "",
    email: "",
    address: "",
    expertise: "",
  });
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch trainers and branches on mount
  useEffect(() => {
    fetchTrainerList();
    fetchBranches();
  }, []);

  const fetchTrainerList = async () => {
    const data = await getTrainers();
    setTrainers(data || []);
  };

  const fetchBranches = async () => {
    const data = await getBranches();
    setBranches(data || []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (editingTrainerId) {
        await updateTrainer(editingTrainerId, formData);
      } else {
        await createTrainer(formData);
      }
      setShowModal(false);
      resetForm();
      fetchTrainerList();
    } catch (err) {
      console.error("Error saving trainer:", err);
      alert("Failed to save trainer.");
    }
  };

  const handleEdit = (trainer) => {
    setFormData({
      branch: trainer.branch || "",
      firstname: trainer.firstname || "",
      lastname: trainer.lastname || "",
      contact: trainer.contact || "",
      email: trainer.email || "",
      address: trainer.address || "",
      expertise: trainer.expertise || "",
    });
    setEditingTrainerId(trainer.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trainer?")) {
      await deleteTrainer(id);
      fetchTrainerList();
    }
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      firstname: "",
      lastname: "",
      contact: "",
      email: "",
      address: "",
      expertise: "",
    });
    setEditingTrainerId(null);
  };

  // Filter trainers based on search
  const filteredTrainers = trainers.filter((t) =>
    `${t.firstname || ""} ${t.lastname || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredTrainers.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredTrainers.length / entriesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Trainer</h4>
       <button
  className="btn btn-success d-flex align-items-center justify-content-center p-0"
  style={{ width: "32px", height: "32px", borderRadius: "6px" }}
  onClick={() => {
    resetForm();
    setShowModal(true);
  }}
>
  <i className="bi bi-plus-lg fs-6 text-white"></i>
</button>

      </div>

      {/* Card containing search, table, pagination */}
      <div className="card p-4 shadow-sm rounded">
        {/* Entries per page and Search */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
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
            <span>entries per page</span>
          </div>

          <Form.Control
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: "250px" }}
          />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <Table bordered hover className="mb-3">
            <thead className="table-light">
              <tr>
                <th>Branch</th>
                <th>Full Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((trainer) => (
                  <tr key={trainer.id}>
                    <td>{trainer.branch || "N/A"}</td>
                    <td>{`${trainer.firstname || ""} ${trainer.lastname || ""}`}</td>
                    <td>{trainer.contact}</td>
                    <td>{trainer.email}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() => handleEdit(trainer)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(trainer.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No trainers found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Showing{" "}
            {filteredTrainers.length === 0 ? 0 : indexOfFirstEntry + 1} to{" "}
            {Math.min(indexOfLastEntry, filteredTrainers.length)} of{" "}
            {filteredTrainers.length} entries
          </div>

          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages).keys()].map((num) => (
              <Pagination.Item
                key={num + 1}
                active={currentPage === num + 1}
                onClick={() => handlePageChange(num + 1)}
              >
                {num + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTrainerId ? "Edit Trainer" : "Create Trainer"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch *</Form.Label>
                    <Form.Select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <Form.Label>Contact *</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Expertise</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="expertise"
                      rows={3}
                      value={formData.expertise}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Form>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  {editingTrainerId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainer;
