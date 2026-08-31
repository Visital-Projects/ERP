import React, { useState, useEffect } from "react";
import {
  getTrainings,
  deleteTraining,
  getEmployees,
  getBranches,
  getTrainers,
  getTrainingTypes,
} from "../../../services/hrmService";
import { Button, Table, Form, Pagination } from "react-bootstrap";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import TrainingFormModal from "./TrainingFormModal";
import TrainingDetailsModal from "./TrainingDetailsModal";
import BreadCrumb from "../../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added

const TrainingList = () => {
  const [trainings, setTrainings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);

  // Pagination and Search
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate(); // ✅ Added
  const location = useLocation(); // ✅ Added

  const fetchAllData = async () => {
    try {
      const [
        trainingsData,
        branchesData,
        employeesData,
        trainersData,
        trainingTypesData,
      ] = await Promise.all([
        getTrainings(),
        getBranches(),
        getEmployees(),
        getTrainers(),
        getTrainingTypes(),
      ]);

      const normalizedTrainers = trainersData.map((t) => ({
        ...t,
        name: `${t.firstname} ${t.lastname}`.trim(),
      }));

      setTrainings(trainingsData);
      setBranches(branchesData);
      setEmployees(employeesData);
      setTrainers(normalizedTrainers);
      setTrainingTypes(trainingTypesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getEntityName = (entities, id) => {
    const entity = entities.find((e) => e.id === id);
    return entity ? entity.name : "-";
  };

  const handleCreate = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this training?")) {
      await deleteTraining(id);
      fetchAllData();
    }
  };

  const handleView = (item) => {
    setViewData(item);
  };

  // Filtered and paginated data
  const filteredTrainings = trainings.filter((t) => {
    const branch = getEntityName(branches, t.branch).toLowerCase();
    const type = getEntityName(trainingTypes, t.training_type).toLowerCase();
    const employee = getEntityName(employees, t.employee).toLowerCase();
    const trainer = getEntityName(trainers, t.trainer).toLowerCase();

    return (
      branch.includes(searchTerm.toLowerCase()) ||
      type.includes(searchTerm.toLowerCase()) ||
      employee.includes(searchTerm.toLowerCase()) ||
      trainer.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredTrainings.length / entriesPerPage);
  const paginatedTrainings = filteredTrainings.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Training</h4>
          {/* <p className="text-success small">Dashboard &gt; Training</p> */}
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <Button variant="success" onClick={handleCreate}>
          <FaPlus />
        </Button>
      </div>

      {/* Search + Entries */}
      <div className="card p-4">
        {/* Top controls: entries per page and search */}
        <div className="d-flex justify-content-between mb-4 align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
            <span>entries per page</span>
          </div>

          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "250px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        <Table responsive hover className="mb-3">
          <thead className="table-light">
            <tr>
              <th>Branch</th>
              <th>Training Type</th>
              <th>Status</th>
              <th>Employee</th>
              <th>Trainer</th>
              <th>Training Duration</th>
              <th>Cost</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrainings.length > 0 ? (
              paginatedTrainings.map((training) => (
                <tr key={training.id}>
                  <td>{getEntityName(branches, training.branch)}</td>
                  <td>
                    {getEntityName(trainingTypes, training.training_type)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        training.status === 1
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {training.status === 1 ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td>{getEntityName(employees, training.employee)}</td>
                  <td>{getEntityName(trainers, training.trainer)}</td>
                  <td>
                    {training.start_date} to {training.end_date}
                  </td>
                  <td>₹{training.training_cost}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-1"
                      onClick={() => handleView(training)}
                    >
                      <FaEye color="white" />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(training)}
                    >
                      <FaEdit color="white" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(training.id)}
                    >
                      <FaTrash color="white" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <p className="text-muted mb-0">
            Showing {paginatedTrainings.length} of {filteredTrainings.length}{" "}
            entries
          </p>
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

      {/* Modals */}
      {showModal && (
        <TrainingFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onRefresh={fetchAllData}
          editData={editData}
          branches={branches}
          employees={employees}
          trainers={trainers}
          trainingTypes={trainingTypes}
        />
      )}

      {viewData && (
        <TrainingDetailsModal
          show={!!viewData}
          onHide={() => setViewData(null)}
          training={viewData}
          onRefresh={fetchAllData}
          branches={branches}
          employees={employees}
          trainers={trainers}
          trainingTypes={trainingTypes}
        />
      )}
    </div>
  );
};

export default TrainingList;
