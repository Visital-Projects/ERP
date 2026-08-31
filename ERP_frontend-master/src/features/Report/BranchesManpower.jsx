// src/pages/BranchesManpower.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import manpowerReportService from "../../services/manpowerReportService";
import BreadCrumb from "../../components/BreadCrumb";

const BranchesManpower = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchBranch, setSearchBranch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      // Fetch all branches manpower report
      const branchList = await manpowerReportService.getAllReports();

      // Only include branches that have manpower data
      const filtered = branchList.filter((b) => b.departments?.length > 0);

      setBranches(filtered);
      setFilteredBranches(filtered);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch branches manpower report");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ✅ Live search
  useEffect(() => {
    if (!searchBranch) {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter((b) =>
        b.branchName.toLowerCase().includes(searchBranch.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
    setCurrentPage(1);
  }, [searchBranch, branches]);

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBranches.length / entriesPerPage);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="fw-semibold mb-1">Branches Manpower</h4>
          {/* <BreadCrumb pathname="/report/branches-manpower" lastLabel="Branches" /> */}
        </div>
      </div>

      {/* Search + Entries */}
      <Row className="align-items-center justify-content-between g-3 mb-3">
        <Col md={1} className="text-end">
          <Form.Select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search branch by name..."
            value={searchBranch}
            onChange={(e) => setSearchBranch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Table */}
      <div className="card p-4 shadow-sm">
        <div className="table-responsive">
          <Table hover className="text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBranches.length > 0 ? (
                currentBranches.map((branch, index) => (
                  <tr
                    key={branch.branchId}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/manpower-report/${branch.branchId}`, {
                        state: { branchName: branch.branchName },
                      })
                    }
                  >
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{branch.branchName}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manpower-report/${branch.branchId}`, {
                            state: { branchName: branch.branchName },
                          });
                        }}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-3">
                    No branches found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <p className="mb-0 small text-muted">
            Showing {filteredBranches.length ? indexOfFirst + 1 : 0} to{" "}
            {Math.min(indexOfLast, filteredBranches.length)} of {filteredBranches.length} entries
          </p>

          <div>
            <Button
              variant="light"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            {[...Array(totalPages).keys()].map((num) => (
              <Button
                key={num}
                variant={currentPage === num + 1 ? "primary" : "light"}
                size="sm"
                className="mx-1"
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </Button>
            ))}
            <Button
              variant="light"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchesManpower;
