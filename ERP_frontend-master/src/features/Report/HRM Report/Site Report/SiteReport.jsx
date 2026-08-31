// HRAnalyticsReport.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Container,
  Breadcrumb,
  ListGroup,
} from "react-bootstrap";
import { Search, ArrowClockwise, FileExcel, FilePdf, Building,  Phone, Clock, Calendar, People, ChevronRight, CheckCircle, XCircle } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getEmployees } from "../../../../services/hrmService";
import { getBranches } from "../../../../services/branchService";
import PaginationDots from '../../../../components/Pagination'

const HRAnalyticsReport = () => {
    const user = JSON.parse(localStorage.getItem("user"));
  console.log("USER FROM STORAGE 👉", user);
  const userType = user?.type;
  const normalizedUserType = userType
  ?.toLowerCase()
  .replace(/\s+/g, "_");
  const isBranchManager = normalizedUserType === "branch_manager";
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBranch, setExpandedBranch] = useState(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department?.name).filter(Boolean))];
  
  // Get unique employee types
  const employeeTypes = [...new Set(employees.map(emp => emp.employee_type).filter(Boolean))];

  // Calculate employees per branch for analytics
  const getEmployeeCountByBranch = (branchId) => {
    return employees.filter(emp => emp.branch?.id === branchId).length;
  };

  // Calculate active employees per branch
  const getActiveEmployeeCountByBranch = (branchId) => {
    return employees.filter(emp => emp.branch?.id === branchId && emp.is_active).length;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [entries, search, selectedBranch, selectedDepartment, selectedEmployeeType, selectedStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empData, branchData] = await Promise.all([
          getEmployees(),
          getBranches()
        ]);
        setEmployees(empData);
        setBranches(branchData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    console.log("Branch object sample:", branches[0]);
  }, []);

  // Filter employees based on all criteria
  const filteredEmployees = employees.filter(emp => {
    // Branch filter
    if (selectedBranch && emp.branch?.id !== parseInt(selectedBranch)) {
      return false;
    }

    // Department filter
    if (selectedDepartment && emp.department?.name !== selectedDepartment) {
      return false;
    }

    // Employee type filter
    if (selectedEmployeeType && emp.employee_type !== selectedEmployeeType) {
      return false;
    }

    // Status filter
    if (selectedStatus) {
      if (selectedStatus === "active" && !emp.is_active) return false;
      if (selectedStatus === "inactive" && emp.is_active) return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        emp.employee_id?.toLowerCase().includes(searchLower) ||
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.department?.name?.toLowerCase().includes(searchLower) ||
        emp.designation?.name?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredEmployees.slice(startIndex, startIndex + entries);

  // Format data for display
  const formatData = (emp) => ({
    // id: emp.id,
    employeeId: emp.employee_id || null,
    name: emp.name || null,
    branch: emp.branch?.name || null,
    department: emp.department?.name || null,
    designation: emp.designation?.name || null,
    employeeType: emp.employee_type || null,
    contact: emp.phone || null,
    email: emp.email || null,
    status: emp.is_active ? "Active" : "Inactive",
  });

  const statusVariant = (status) => {
    return status === "Active" ? "success" : "danger";
  };

  // Export functions
  const handleExportExcel = () => {
    const exportData = filteredEmployees.map(formatData);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
          worksheet["!cols"] = [
    { wch: 12 }, 
    { wch: 30 }, 
    { wch: 35 }, 
    { wch: 25 },
    { wch: 20 }, 
    { wch: 18 }, 
    { wch: 15 }, 
    { wch: 32 }, 
    { wch: 14 }, 
    // { wch: 14 }, 
  ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Site Report");
    XLSX.writeFile(workbook, `SiteReport_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(14);
    doc.text("Site Report", 14, 15);

    autoTable(doc, {
      head: [[
        "Emp ID",
        "Name",
        "Site",
        "Department",
        "Designation",
        "Type",
        "Status",
        "Contact",
        "Email"
      ]],
      body: filteredEmployees.map(emp => {
        const data = formatData(emp);
        return [
          data.employeeId,
          data.name,
          data.branch,
          data.department,
          data.designation,
          data.employeeType,
          data.status,
          data.contact,
          data.email
        ];
      }),
      startY: 22,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [72, 66, 109], textColor: 255 },
    });

    doc.save(`SiteReport_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleResetFilters = () => {
    setSelectedBranch("");
    setSelectedDepartment("");
    setSelectedEmployeeType("");
    setSelectedStatus("");
    setSearch("");
  };

  // Toggle branch details
  const toggleBranchDetails = (branchId) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Site Report</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Site Report</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
          <Button variant="success" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="danger" onClick={handleExportPDF}>
            Export PDF
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
{!isBranchManager && (
            <Col md={3}>
              <Form.Label>Site</Form.Label>
              <Form.Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">All Sites</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({getEmployeeCountByBranch(branch.id)} employees)
                  </option>
                ))}
              </Form.Select>
            </Col>
)}
            {/* Department Filter */}
            <Col md={3}>
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Employee Type Filter */}
            <Col md={2}>
              <Form.Label>Employee Type</Form.Label>
              <Form.Select
                value={selectedEmployeeType}
                onChange={(e) => setSelectedEmployeeType(e.target.value)}
              >
                <option value="">All Types</option>
                {employeeTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Status Filter */}
            <Col md={2}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>

            {/* Reset Button */}
            <Col md={2}>
              <Button variant="danger" onClick={handleResetFilters} className="w-100">
                <ArrowClockwise className="me-1" /> Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* Enhanced Branch List as Compact List */}
      {branches.length > 0 && (
        <Card className="mb-4">
          <Card.Body className="p-3">
            <Row className="mb-3 align-items-center">
              <Col>
                <h6 className="mb-0 d-flex align-items-center">
                  <Building className="me-2" /> Sites List
                </h6>
                <small className="text-muted">
                  Showing {branches.length} sites
                </small>
              </Col>
              <Col className="text-end">
                <Badge bg="info" className="me-2">
                  Total Employees: {employees.length}
                </Badge>
              </Col>
            </Row>

            <Row className="g-2 my-3 justify-content-center">
              <Col xs={4} sm={3}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <Building className="me-2 text-primary" size={16} />
                  <div>
                    <div className="fw-bold">{branches.length}</div>
                    <small className="text-muted">Sites</small>
                  </div>
                </div>
              </Col>
              <Col xs={4} sm={3}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <People className="me-2 text-success" size={16} />
                  <div>
                    <div className="fw-bold">
                      {branches.reduce((acc, branch) => acc + getEmployeeCountByBranch(branch.id), 0)}
                    </div>
                    <small className="text-muted">Employees</small>
                  </div>
                </div>
              </Col>
              {/* <Col xs={6} sm={3}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <Clock className="me-2 text-warning" size={16} />
                  <div>
                    <div className="fw-bold">
                      {Math.round(branches.reduce((acc, branch) => acc + (branch.working_hours || 8), 0) / branches.length)}h
                    </div>
                    <small className="text-muted">Avg Hours</small>
                  </div>
                </div>
              </Col> */}
              <Col xs={4} sm={3}>
                <div className="p-2 bg-light rounded d-flex align-items-center">
                  <CheckCircle className="me-2 text-info" size={16} />
                  <div>
                    <div className="fw-bold">
                      {branches.filter(b => b.clock_out).length}
                    </div>
                    <small className="text-muted">Clock-out Enabled</small>
                  </div>
                </div>
              </Col>
            </Row>
            {/* Sites List - Compact Layout */}
            <ListGroup variant="flush" className="border rounded">
              {branches.map((branch, index) => {
                const employeeCount = getEmployeeCountByBranch(branch.id);
                const activeEmployees = getActiveEmployeeCountByBranch(branch.id);
                const isSelected = selectedBranch === branch.id.toString();
                const isExpanded = expandedBranch === branch.id;
                
                return (
                  <React.Fragment key={branch.id}>
                    <ListGroup.Item 
                      className={`p-3 ${isSelected ? 'bg-light' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleBranchDetails(branch.id)}
                    >
                      <Row className="align-items-center">
                        <Col md={3} className="text-center">
                          <Badge bg="light" text="dark" className="rounded-circle p-2">
                            {index + 1}
                          </Badge>
                        </Col>
                        <Col md={5}>
                          <div className="d-flex align-items-center">
                            <Building className="me-2 text-primary" size={18} />
                            <div>
                              <strong className="d-block">{branch.name}</strong>
                              {/* <small className="text-muted">
                                ID: {branch.id}
                              </small> */}
                            </div>
                          </div>
                        </Col>
                        <Col md={2}>
                          <div className="d-flex align-items-center">
                            <People size={14} className="me-1 text-success" />
                            <span className="fw-bold me-1">{employeeCount}</span>
                            <small className="text-muted">
                              ({activeEmployees} active)
                            </small>
                          </div>
                        </Col>
                        <Col md={2}>
                          <div className="d-flex align-items-center">
                            <Clock size={14} className="me-1 text-primary" />
                            <span>{branch.working_hours || 8}h/day</span>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </React.Fragment>
                );
              })}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
      {/* Data Table */}
      <div className="mb-4">
        {/* Table Header Controls */}
        <Row className="align-items-center mb-3">
          <Col md={4}>
            <h5 className="mb-0">Employee Details</h5>
            <small className="text-muted">
              Total: {filteredEmployees.length} employees | 
              {selectedBranch && ` Site: ${branches.find(b => b.id.toString() === selectedBranch)?.name}`}
            </small>
          </Col>

          <Col md={8}>
            <div className="d-flex justify-content-end gap-3">
              <div style={{ width: "120px" }}>
                <Form.Select
                  value={entries}
                  onChange={(e) => setEntries(e.target.value)}
                  size="sm"
                >
                  <option value={10}>Show 10</option>
                  <option value={25}>Show 25</option>
                  <option value={50}>Show 50</option>
                  <option value={100}>Show 100</option>
                </Form.Select>
              </div>

              <div style={{ width: "250px" }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} />
                  </span>
                  <Form.Control
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading employee data...</p>
          </div>
        ) : (
          <Table responsive hover bordered>
            <thead className="table-light">
              <tr>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>SITE</th>
                <th>DEPARTMENT</th>
                <th>DESIGNATION</th>
                <th>TYPE</th>
                <th>CONTACT</th>
                <th>EMAIL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((emp) => {
                const data = formatData(emp);
                return (
                  <tr key={emp.id}>
                    <td>
                      <strong>{data.employeeId}</strong>
                    </td>
                    <td>{data.name}</td>
                    <td
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {data.branch}
                    </td>
                    <td
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        maxWidth: "180px",
                      }}
                    >
                      {data.department}
                    </td>
                    <td>{data.designation}</td>
                    <td>
                      <Badge bg={data.employeeType === "Permanent" ? "primary" : "secondary"}>
                        {data.employeeType}
                      </Badge>
                    </td>
                    <td>{data.contact}</td>
                    <td>{data.email}</td>
                    <td>
                      <Badge bg={statusVariant(data.status)}>
                        {data.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {!loading && filteredEmployees.length === 0 && (
          <div className="text-center py-5">
            <div className="text-muted mb-2">No employees found</div>
            <small className="text-muted">
              Try adjusting your filters or search criteria
            </small>
          </div>
        )}

        <PaginationDots
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </Container>
  );
};

export default HRAnalyticsReport;