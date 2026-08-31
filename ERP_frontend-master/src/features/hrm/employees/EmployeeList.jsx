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
  Modal,
} from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
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
import PaginationDots from "../../../components/Pagination";

import { downloadPayrollExcel } from "../../../redux/slices/hrmSlice";
import { downloadBlobFile } from "../../../utils/downloadFile";
import { Dropdown, ButtonGroup } from "react-bootstrap";

import { uploadUsersExcel, exportUsersExcel, } from "../../../services/userService"
import * as XLSX from "xlsx";

const EmployeeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employees = useSelector(selectEmployees) || [];
  const loading = useSelector(selectHrmLoading);
  const error = useSelector(selectHrmError);
  const [faceFilter, setFaceFilter] = useState("all");

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const [showBulkModal, setShowBulkModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelError, setExcelError] = useState("");


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
setDepartments(deptRes || []);
setDesignations(desigRes || []);
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

  // Enhanced filter: include status filter, employee type filter and search
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
    let matchesBranch = true;
    if (branchFilter !== "all") {
      matchesBranch =
        emp.branch?.id?.toString() === branchFilter ||
        emp.branch?.name === branchFilter;
    }

    let matchesFace = true;

    if (faceFilter === "registered") {
      matchesFace = emp.biometric_emp_id !== null;
    } else if (faceFilter === "not_registered") {
      matchesFace = emp.biometric_emp_id === null;
    }


    return (
      matchesSearch && matchesStatus && matchesEmployeeType && matchesBranch &&
      matchesFace
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
  const handleExcelDownload = async () => {
    try {
      const response = await dispatch(
        downloadPayrollExcel({
          month: selectedMonth,
          year: selectedYear,
        })
      ).unwrap();

      const fileName = `Payroll_${selectedYear}-${String(selectedMonth).padStart(2, "0")}.xlsx`;

      downloadBlobFile(response.data, fileName);
      toast.success("Payroll Excel downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    }
  };


  // 👇 ADD THIS NEW FUNCTION FOR TEMPLATE DOWNLOAD
  const handleExportTemplate = async () => {
    try {
      toast.info("Generating Excel template...", {
        icon: false,
      });

      // Call the export function from your service
      await exportUsersExcel();

      toast.success("Excel template downloaded successfully!", {
        icon: false,
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error(error.message || "Failed to download Excel template", {
        icon: false,
      });
    }
  };

const handleExcelUpload = async () => {
  if (!excelFile) {
    toast.error("Please select an Excel file first!");
    return;
  }

  try {
    const response = await uploadUsersExcel(excelFile);

    toast.success(response.message || "Excel uploaded successfully!");
    setExcelFile(null);
    dispatch(fetchEmployees());
  } catch (error) {
    console.error("Excel upload failed:", error);
    toast.error(
      error?.response?.data?.message || "Failed to upload Excel file"
    );
  }
};
  const handlePdfDownload = async () => {
    try {
      const month = 2;
      const year = 2026;

      // 🔁 replace this with your actual PDF thunk
      const response = await dispatch(
        downloadPayrollPdf({ month, year })
      ).unwrap();

      const fileName = `Payroll_${year}-${String(month).padStart(2, "0")}.pdf`;

      downloadBlobFile(response.data, fileName);
      toast.success("Payroll PDF downloaded");
    } catch (err) {
      toast.error("Failed to download PDF");
    }
  };
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-semibold mb-1">Manage Employee</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>

        <div className="d-flex">
          {/* Download Excel Button */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Download Excel Template</Tooltip>}
          >
            <Button
              variant="primary"
              size="sm"
              className="me-2 d-flex align-items-center"
              onClick={handleExportTemplate}
            >
              <i className="bi bi-download me-1"></i> Download Excel
            </Button>
          </OverlayTrigger>

          {/* Create Employee Button */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Create Employee</Tooltip>}
          >
            <Button
              className="btn btn-success d-flex align-items-center justify-content-center"
              style={{ width: "55px", height: "40px", borderRadius: "6px" }}
              variant="success"
              onClick={handleCreate}
            >
              <i className="bi bi-plus-lg fs-6"></i>
            </Button>
          </OverlayTrigger>

          {/* Bulk Upload Button */}
          <Button
            variant="warning"
            size="sm"
            className="ms-2 d-flex align-items-center"
            onClick={() => setShowBulkModal(true)}
          >
            <i className="bi bi-upload me-1"></i> Bulk Upload
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger">
          {typeof error === "string" ? error : "Failed to load employees"}
        </Alert>
      )}

      <div className="card d-flex flex-row gap-2 justify-content-between align-items-center mb-3 px-4" style={{ height: "90px" }}>
        {/* LEFT SIDE: Filters */}
        <div className="d-flex flex-row gap-2 justify-content-start align-items-center">
          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">Status</label>
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
          </div>

          {/* Employee Type Filter */}
          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">EMPLOYEE TYPE</label>
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
          </div>

          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">SITE</label>
            <Form.Select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "250px" }}
            >
              <option value="all">All SITES</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">FACE STATUS</label>
            <Form.Select
              value={faceFilter}
              onChange={(e) => {
                setFaceFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "190px" }}
            >
              <option value="all">All</option>
              <option value="registered">Face Registered</option>
              <option value="not_registered">Face Not Registered</option>
            </Form.Select>
          </div>
        </div>

        {/* RIGHT SIDE: Month, Year, and Export */}
        {/* RIGHT SIDE: Month, Year, and Export */}
        <div className="d-flex flex-row gap-2 align-items-end">
          {/* Month */}
          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">Month</label>
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ width: "140px" }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Year */}
          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="">Year</label>
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ width: "110px" }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Export Button - Now direct download */}
          <div className="d-flex flex-column justify-content-center align-items-start">
            <label htmlFor="" style={{ visibility: "hidden" }}>Export</label>
            <Button
              variant="success"
              className="d-flex align-items-center gap-2"
              style={{
                height: "38px",
                borderRadius: "8px",
                padding: "0 14px",
              }}
              onClick={handleExcelDownload}
            >
              <i className="bi bi-download"></i>
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* LEFT SIDE: Entries per page */}
            <div className="d-flex gap-2 align-items-center">
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
            </div>

            {/* RIGHT SIDE: Search only */}
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="text"
                placeholder="Search by name, email..."
                style={{ maxWidth: "220px" }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table content remains the same */}
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
                    <th>SITE</th>
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



          {/* 👇 ADD THIS BULK UPLOAD MODAL */}
          <Modal
            show={showBulkModal}
            onHide={() => setShowBulkModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Bulk Upload Employees</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <div className="alert alert-info mb-3">
                <small>
                  <strong>Instructions:</strong>
                  <br />
                  1. First, download the Excel template using the "Download Template" button
                  <br />
                  2. Fill in the employee data in the template
                  <br />
                  3. Upload the completed file here
                </small>
              </div>
              <Form noValidate>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>
                    Select Excel File <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => {
                        setExcelFile(e.target.files[0]);
                        setExcelError("");
                      }}
                      isInvalid={!!excelError}
                    />
                    {excelError && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {excelError}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={async () => {
                  if (!excelFile) {
                    setExcelError("Excel file is required");
                    return;
                  }
                  await handleExcelUpload();
                  setShowBulkModal(false);
                }}
              >
                Upload
              </Button>
            </Modal.Footer>
          </Modal>

          <PaginationDots
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

    </div>
  );
};

export default EmployeeList;
