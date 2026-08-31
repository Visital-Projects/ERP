import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Alert,
  Form,
  Pagination,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  fetchEmployees,
  removeEmployee,
  selectEmployees,
  selectHrmLoading,
  selectHrmError,
} from "../../../redux/slices/hrmSlice";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import BreadCrumb from "../../../components/BreadCrumb";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const EmployeeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employees = useSelector(selectEmployees) || [];
  const loading = useSelector(selectHrmLoading);
  const error = useSelector(selectHrmError);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all"); 

  // Fetch employees
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Fetch metadata
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [branchRes, deptRes, desigRes] = await Promise.all([
          branchService.getAll(),
          departmentService.getAll(),
          designationService.getAll(),
        ]);
        setBranches(branchRes || []); // Use branchRes directly since service returns array
        setDepartments(deptRes?.data?.data || []);
        setDesignations(desigRes?.data?.data || []);
      } catch (err) {
        console.error("Metadata fetch error:", err);
        setBranches([]);
        setDepartments([]);
        setDesignations([]);
      }
    };
    fetchMetaData();
  }, []);

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  console.log("Deleting employee with ID:", id);
                  await dispatch(removeEmployee(id)).unwrap();
                  toast.success("Employee deleted successfully.");
                } catch (err) {
                  console.error("Failed to delete employee:", err);
                  toast.error(
                    "Failed to delete employee: " +
                      (err.message || "Unknown error")
                  );
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

  const handleCreate = () => {
    navigate("/employees/create");
  };

  // Get status badge variant based on is_active boolean
  const getStatusBadge = (isActive) => {
    return isActive ? "success" : "secondary";
  };

  // Get status text based on is_active boolean
  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  // Get employee type badge variant
  const getEmployeeTypeBadge = (employeeType) => {
    if (employeeType === "Permanent") return "primary";
    if (employeeType === "Contractual") return "warning";
    return "secondary"; // For null/undefined cases
  };

  // Get employee type text
  const getEmployeeTypeText = (employeeType) => {
    if (employeeType === "Permanent") return "Permanent";
    if (employeeType === "Contractual") return "Contractual";
    return "Not Set"; // For null/undefined cases
  };

  // Sort employees by id descending so newest appear first
  const sortedEmployees = [...employees].sort((a, b) => b.id - a.id);

  // Enhanced filter: include status filter, employee type filter, branch filter and search
  const filteredEmployees = sortedEmployees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.employee_id && emp.employee_id.toString().includes(term));

    // Handle status filter based on is_active boolean
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = emp.is_active === true;
    } else if (statusFilter === "inactive") {
      matchesStatus = emp.is_active === false;
    }

    // Handle employee type filter
    let matchesEmployeeType = true;
    if (employeeTypeFilter !== "all") {
      if (employeeTypeFilter === "permanent") {
        matchesEmployeeType = emp.employee_type === "Permanent";
      } else if (employeeTypeFilter === "contractual") {
        matchesEmployeeType = emp.employee_type === "Contractual";
      } else if (employeeTypeFilter === "notset") {
        matchesEmployeeType =
          !emp.employee_type || emp.employee_type === "Not Set";
      }
    }

    // Handle branch filter
    let matchesBranch = true;
    if (branchFilter !== "all") {
      matchesBranch =
        emp.branch?.id?.toString() === branchFilter ||
        emp.branch?.name === branchFilter;
    }

    return (
      matchesSearch && matchesStatus && matchesEmployeeType && matchesBranch
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);
  const indexOfLastEmployee = currentPage * entriesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - entriesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Status options for filter dropdown
  const statusOptions = ["all", "active", "inactive"];
  const employeeTypeOptions = ["all", "permanent", "contractual", "notset"];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-semibold mb-1">Manage Employee</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Create Employee</Tooltip>}
        >
          <Button variant="success" size="sm" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {error && (
        <Alert variant="danger">
          {typeof error === "string" ? error : "Failed to load employees"}
        </Alert>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center mb-3">
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

              {/* Status Filter */}
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "160px" }}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Form.Select>

              {/* Employee Type Filter */}
              <Form.Select
                value={employeeTypeFilter}
                onChange={(e) => {
                  setEmployeeTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "160px" }}
              >
                {employeeTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" && "All Types"}
                    {type === "permanent" && "Permanent"}
                    {type === "contractual" && "Contractual"}
                    {type === "notset" && "Not Set"}
                  </option>
                ))}
              </Form.Select>

              {/* Branch Filter - New Addition */}
              <Form.Select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "160px" }}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            <Form.Control
              type="text"
              placeholder="Search by name, email, or ID..."
              style={{ maxWidth: "250px" }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 text-center table-striped">
                <thead className="table-light">
                  <tr>
                    <th>EMPLOYEE ID</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>BRANCH</th>
                    <th>DEPARTMENT</th>
                    <th>DESIGNATION</th>
                    <th>EMPLOYEE TYPE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((emp) => (
                      <tr key={emp.id} className="align-middle">
                        <td>
                          <Button
                            variant="outline-success"
                            className="px-3 py-1"
                            onClick={() =>
                              navigate(`/employees/${emp.employee_id}`)
                            }
                          >
                            {emp.employee_id
                              ? `EMP${String(emp.employee_id).padStart(5, "0")}`
                              : `EMP${String(emp.id).padStart(5, "0")}`}
                          </Button>
                        </td>
                        <td className="text-capitalize">{emp.name || "-"}</td>
                        <td>{emp.email || "-"}</td>
                        <td>{emp.branch?.name || "-"}</td>
                        <td>{emp.department?.name || "-"}</td>
                        <td>{emp.designation?.name || "-"}</td>
                        <td>
                          <Badge
                            bg={getEmployeeTypeBadge(emp.employee_type)}
                            className="text-capitalize"
                          >
                            {getEmployeeTypeText(emp.employee_type)}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={getStatusBadge(emp.is_active)}
                            className="text-capitalize"
                          >
                            {getStatusText(emp.is_active)}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Edit</Tooltip>}
                            >
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() =>
                                  navigate(`/employees/edit/${emp.employee_id}`)
                                }
                              >
                                <i className="bi bi-pencil text-white"></i>
                              </Button>
                            </OverlayTrigger>
                            {/* <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete</Tooltip>}
                            >
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(emp.employee_id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </OverlayTrigger> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
            <span className="mb-2 mb-md-0 sm">
              Showing{" "}
              {filteredEmployees.length === 0 ? 0 : indexOfFirstEmployee + 1} to{" "}
              {Math.min(
                indexOfFirstEmployee + entriesPerPage,
                filteredEmployees.length
              )}{" "}
              of {filteredEmployees.length} entries
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                {/* Left Arrow */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
                  >
                    «
                  </button>
                </li>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}

                {/* Right Arrow */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
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
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;