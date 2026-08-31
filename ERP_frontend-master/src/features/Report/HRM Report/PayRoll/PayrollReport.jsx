import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Spinner,
  Card,
  Alert,
  InputGroup
} from "react-bootstrap";
import {
  Search,
  ArrowClockwise,
  Download,
  Calendar,
  Building,
  Filter,
  CashStack,
  Person,
  FileText
} from "react-bootstrap-icons";
import apiClient from "../../../../services/apiClient";
import branchService from "../../../../services/branchService";
import PaginationDots from "../../../../components/Pagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import '../../Report.css'

const formatINR = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Helper function to get the latest available month
const getLatestMonth = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Format as YYYY-MM with leading zero for month
  const currentMonthFormatted = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
  
  // For January, we might want to check if December of previous year is available
  // But for now, we'll assume current month is available
  return currentMonthFormatted;
};

// Helper function to get the previous month
const getPreviousMonth = () => {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth(); // Get current month (0-indexed)
  
  if (month === 0) {
    // If current month is January, go to December of previous year
    month = 12;
    year -= 1;
  }
  
  // Format as YYYY-MM with leading zero for month
  return `${year}-${month.toString().padStart(2, '0')}`;
};

const PayrollReport = () => {
  const [type, setType] = useState("monthly");
  
  // Set default month to current month
  const [month, setMonth] = useState(getLatestMonth());
  
  // Set default date to current date
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  const [date, setDate] = useState(formattedDate);
  
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  
  // New state for pagination from API
  const [totalRecords, setTotalRecords] = useState(0);
  const [apiSummary, setApiSummary] = useState(null);
  
  // Update summary to match API structure
  const [summary, setSummary] = useState({
    totalBasicSalary: 0,
    totalNetSalary: 0,
    totalAllowance: 0,
    totalCommission: 0,
    totalLoan: 0,
    totalSaturationDeduction: 0,
    totalOtherPayment: 0,
    totalOvertime: 0,
    totalGrossSalary: 0,
    totalPfDeduction: 0,
    totalEsiDeduction: 0,
    totalSkillWages: 0,
    totalEarlyLeavingDeduction: 0
  });

  // Function to check if current month has data and fallback to previous month if not
  const determineDefaultMonth = async () => {
    try {
      // First, try to fetch current month's data
      const currentMonth = getLatestMonth();
      const [year, monthNum] = currentMonth.split("-").map(Number);
      
      const testResponse = await apiClient.get(`/payslips/${year}/${monthNum}`, {
        params: { limit: 1 }
      });
      
      // If current month has data, use it
      if (testResponse.data.success && testResponse.data.data && testResponse.data.data.length > 0) {
        return currentMonth;
      }
      
      // If no data in current month, try previous month
      const prevMonth = getPreviousMonth();
      const [prevYear, prevMonthNum] = prevMonth.split("-").map(Number);
      
      const prevTestResponse = await apiClient.get(`/payslips/${prevYear}/${prevMonthNum}`, {
        params: { limit: 1 }
      });
      
      // If previous month has data, use it
      if (prevTestResponse.data.success && prevTestResponse.data.data && prevTestResponse.data.data.length > 0) {
        return prevMonth;
      }
      
      // If neither has data, default to current month
      return currentMonth;
      
    } catch (error) {
      console.error("Error checking available months:", error);
      // Default to current month on error
      return getLatestMonth();
    }
  };

  // Fetch branches on component mount and set default month
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch branches
        const branchesData = await branchService.getAll();
        setBranches(branchesData);
        
        // Determine and set the default month (latest available)
        const defaultMonth = await determineDefaultMonth();
        setMonth(defaultMonth);
        
        // Set current date for daily reports
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        setDate(formattedDate);
        
        // Mock data (you can replace with actual API calls)
        const mockDesignations = [
          { id: 1, name: "Manager" },
          { id: 2, name: "Supervisor" },
          { id: 3, name: "Technician" },
          { id: 4, name: "Cashier" }
        ];
        setDesignations(mockDesignations);
        
        const mockEmployees = [
          { id: "10", name: "AJAYA KUMAR  SETHY", branch_id: 219 },
          { id: "9", name: "BISWAKESAN SAHOO", branch_id: 219 }
        ];
        setAllEmployees(mockEmployees);
        setEmployees(mockEmployees);
        
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };
    
    initializeData();
  }, []);

  // Filter employees based on selected branch
  useEffect(() => {
    if (!selectedBranch) {
      setEmployees(allEmployees);
    } else {
      setEmployees(
        allEmployees.filter(emp =>
          emp.branch_id === Number(selectedBranch)
        )
      );
    }
  }, [selectedBranch, allEmployees]);

  // New function to fetch payslips data
  const fetchPayrollReport = async () => {
    try {
      setLoading(true);

      // Extract year and month for API call
      let year, monthNum;
      if (type === "monthly") {
        [year, monthNum] = month.split("-").map(Number);
      } else {
        // For daily reports, you might need a different endpoint
        const dateObj = new Date(date);
        year = dateObj.getFullYear();
        monthNum = dateObj.getMonth() + 1;
      }

      // Build query parameters
      const params = {
        page: currentPage,
        limit: entriesPerPage,
        ...(selectedBranch && { branch_id: selectedBranch }),
        ...(selectedEmployee && { employee_id: selectedEmployee }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log("🔍 Fetching payslips with params:", {
        year,
        month: monthNum,
        ...params
      });

      // Call the payslips API
      const response = await apiClient.get(`/payslips/${year}/${monthNum}`, { params });

      console.log("✅ Payslips API Response:", response.data);

      if (response.data.success) {
        const payslips = response.data.data || [];

        setPayrollData(payslips);
        setTotalRecords(payslips.length);

        // 🔥 Calculate summary from payslips array
        const calculatedSummary = payslips.reduce(
          (acc, emp) => {
            acc.totalBasicSalary += emp.basic_salary || 0;
            acc.totalNetSalary += emp.net_payble || 0;
            acc.totalAllowance += emp.allowance || 0;
            acc.totalCommission += emp.commission || 0;
            acc.totalLoan += emp.loan || 0;
            acc.totalSaturationDeduction += emp.saturation_deduction || 0;
            acc.totalOtherPayment += emp.other_payment || 0;
            acc.totalOvertime += emp.overtime || 0;
            acc.totalGrossSalary += emp.gross_salary || 0;
            acc.totalPfDeduction += emp.pf_deduction || 0;
            acc.totalEsiDeduction += emp.esi_deduction || 0;
            acc.totalSkillWages += emp.skill_wages || 0;
            acc.totalEarlyLeavingDeduction += emp.early_leaving || 0;

            return acc;
          },
          {
            totalBasicSalary: 0,
            totalNetSalary: 0,
            totalAllowance: 0,
            totalCommission: 0,
            totalLoan: 0,
            totalSaturationDeduction: 0,
            totalOtherPayment: 0,
            totalOvertime: 0,
            totalGrossSalary: 0,
            totalPfDeduction: 0,
            totalEsiDeduction: 0,
            totalSkillWages: 0,
            totalEarlyLeavingDeduction: 0
          }
        );

        setSummary(calculatedSummary);
const backendSummary = response.data.summary || {};
setApiSummary({
  ...backendSummary,
  total_unpaid: payslips.filter(p => p.status === "unpaid").length,
  total_employees: backendSummary.total_payslips || payslips.length,
  month: monthNum,
  year: year
});

      } else {
        setPayrollData([]);
        setTotalRecords(0);
        setApiSummary(null);
      }
    } catch (error) {
      console.error("❌ Failed to fetch payroll report:", error);
      setPayrollData([]);
      setTotalRecords(0);
      setApiSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Load payroll data when filters change
  useEffect(() => {
    // Prevent API call when required inputs are missing
    if (type === "monthly" && !month) return;
    if (type === "daily" && !date) return;

    fetchPayrollReport();
  }, [
    type,
    month,
    date,
    currentPage,
    entriesPerPage,
    selectedBranch,
    selectedEmployee,
    searchTerm
  ]);

  const handleReset = async () => {
    setType("monthly");
    
    // Reset to latest available month
    const defaultMonth = await determineDefaultMonth();
    setMonth(defaultMonth);
    
    // Reset current date
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    setDate(formattedDate);
    
    setSelectedBranch("");
    setSelectedDesignation("");
    setSelectedEmployee("");
    setSearchTerm("");
    setEntriesPerPage(10);
    setCurrentPage(1);
    
    // Fetch report with reset values
    fetchPayrollReport();
  };

  // Filter data locally (optional, API already filters)
  const filteredData = payrollData.filter(emp => {
    const matchesSearch =
      emp.employee_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toString().includes(searchTerm);

    const matchesBranch =
      !selectedBranch || 
      emp.employee_additional_details?.branch?.id === Number(selectedBranch);

    return matchesSearch && matchesBranch;
  });

  // Calculate pagination from API data
  const totalPages = Math.ceil(totalRecords / entriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }

    // Shape data for Excel based on new API structure
    const excelData = filteredData.map(emp => ({
      "Employee ID": emp.employee_id,
      "Employee Name": emp.employee_details?.name || emp.employee_additional_details?.employee_basic?.name,
      "Status": emp.status === 'unpaid' ? 'Unpaid' : 'Paid',
      "Basic Salary": emp.basic_salary,
      "Skill Wages": emp.skill_wages,
      "Allowance": emp.allowance,
      "Overtime": emp.overtime,
      "PF Deduction": emp.pf_deduction,
      "ESI Deduction": emp.esi_deduction,
      "Total Deduction": emp.saturation_deduction,
      "Net Payable": emp.gross_salary,
      "Month": emp.salary_month_display,
      "Site": emp.employee_details?.branch,
      "Department": emp.employee_details?.department,
      "Designation": emp.employee_details?.designation,
      "Skill Level": emp.employee_details?.skill
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const columnWidths = Object.keys(excelData[0]).map(key => ({
  wch: Math.max(
    key.length,
    ...excelData.map(row =>
      row[key] ? row[key].toString().length : 0
    )
  ) + 2
}));

worksheet["!cols"] = columnWidths;
// worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
// const range = XLSX.utils.decode_range(worksheet["!ref"]);
// worksheet["!autofilter"] = {
//   ref: XLSX.utils.encode_range(range)
// };

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Report");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // File name based on filter
    const fileName = `Payslip_Report_${month || date}.xlsx`;

    // Save file
    const fileData = new Blob(
      [excelBuffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    saveAs(fileData, fileName);
  };

  // Updated summary cards with more fields
  const summaryCards = [
    {
      label: "Total Employees",
      value: apiSummary?.total_payslips || 0,
      icon: <Person size={20} />,
      color: "primary",
      format: "number"
    },
    {
      label: "Total Basic Salary",
      value: formatINR(summary.totalBasicSalary),
      icon: "💰",
      color: "dark"
    },
    {
      label: "Total Net Payable",
      value: formatINR(apiSummary?.total_gross_salary || 0),
      icon: <CashStack size={20} />,
      color: "success"
    },
    {
      label: "Total PF Deduction",
      value: formatINR(summary.totalPfDeduction),
      icon: "🏦",
      color: "warning"
    },
    {
      label: "Total ESI Deduction",
      value: formatINR(summary.totalEsiDeduction),
      icon: "🏥",
      color: "secondary"
    },
    {
      label: "Total Overtime",
      value: formatINR(summary.totalOvertime),
      icon: "⏰",
      color: "orange"
    },
    {
      label: "Unpaid Payslips",
      value: apiSummary?.total_unpaid || 0,
      icon: <FileText size={20} />,
      color: "danger",
      format: "number"
    }
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="fw-semibold mb-2">Payroll Report</h4>
            <div className="text-muted">
              <small>Dashboard &gt; Payroll &gt; Report</small>
            </div>
          </div>
          <Button 
            variant="success" 
            onClick={handleExport}
            className="d-flex align-items-center gap-2"
            disabled={!payrollData.length}
          >
            <Download size={18} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm mb-4">
        <div className="bg-white border rounded-top p-3 mb-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Filter size={20} className="text-primary" />
              <h6 className="mb-0 fw-semibold">Filters</h6>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <Card.Body className="border border-top-0 rounded-bottom">
            <Row className="g-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-medium small mb-2">
                    <Calendar size={14} className="me-1" />
                    Report Type
                  </Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      label="Monthly"
                      name="type"
                      id="monthly"
                      checked={type === "monthly"}
                      onChange={() => setType("monthly")}
                      className="green-radio"
                    />
                  </div>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-medium small mb-2">
                    <Calendar size={14} className="me-1" />
                    Select Month
                  </Form.Label>
                  <Form.Control 
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-medium small mb-2">
                    <Building size={14} className="me-1" />
                    Site
                  </Form.Label>
                  <Form.Select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="py-2"
                  >
                    <option value="">All Sites</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={1} className="d-flex align-items-end">
                <Button 
                  variant="danger" 
                  onClick={handleReset}
                  title="Reset Filters"
                  className="w-100 py-2"
                >
                  <ArrowClockwise size={18} />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        )}
      </Card>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        {summaryCards.map((card, index) => (
          <Col md={3} key={index}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small fw-medium mb-1">{card.label}</div>
                    <div className="h4 fw-bold mb-0 text-dark">
                      {card.format === "number" ? card.value : card.value}
                    </div>
                  </div>
                  <div className={`text-${card.color}`} style={{ fontSize: '24px' }}>
                    {card.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Data Summary Alert */}
      {apiSummary && (
        <Alert variant="light" className="border mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Report Summary:</strong> Showing{" "}
              <span className="text-primary fw-semibold">{apiSummary.total_payslips} payslips</span>
              {" "}for{" "}
              <span className="text-primary fw-semibold">
                {apiSummary.month}/{apiSummary.year}
              </span>
              {selectedBranch && (
                <span className="ms-2">
                  • Site: <span className="text-primary fw-semibold">
                    {branches.find(b => b.id == selectedBranch)?.name || selectedBranch}
                  </span>
                </span>
              )}
              <div className="mt-2 small">
                <Badge bg="danger" className="me-2">
                  Unpaid: {apiSummary.total_unpaid}
                </Badge>
                <Badge bg="success" className="me-2">
                  Total Employees: {apiSummary.total_employees}
                </Badge>
              </div>
            </div>
            <Badge bg="light" text="dark" className="px-3 py-2">
              {apiSummary.total_payslips} {apiSummary.total_payslips === 1 ? 'Payslip' : 'Payslips'}
            </Badge>
          </div>
        </Alert>
      )}

      {/* Table Card */}
      <div className="bg-white border rounded-top p-3 mb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-semibold">Employee Payslip Details</h6>
            <small className="text-muted">
              Showing generated payslips - {apiSummary?.data_source === "payslips_table" ? "Data from stored payslips" : "Live calculation"}
            </small>
          </div>
          <div className="d-flex gap-2">
            <InputGroup className="w-auto">
              <Form.Select 
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-2"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </Form.Select>
            </InputGroup>
            <InputGroup className="w-auto">
              <InputGroup.Text className="bg-light border-end-0">
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-start-0 py-2"
              />
            </InputGroup>
          </div>
        </div>
      </div>
      
      <div className="border border-top-0 rounded-bottom">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted fw-medium">Loading payroll data...</p>
            <small className="text-muted">Fetching payslip information from database</small>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 fw-semibold text-uppercase small border-0">EMPLOYEE ID</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">EMPLOYEE</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">BRANCH</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">BASIC</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">Net Payble</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">PF/ESI</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">NET PAYABLE</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">ATTENDANCE</th>
<th className="py-3 fw-semibold text-uppercase small border-0">ALLOW / OT</th>
<th className="py-3 fw-semibold text-uppercase small border-0">DEDUCTIONS</th>
                    <th className="py-3 fw-semibold text-uppercase small border-0">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((payslip) => (
                      <tr 
                        key={payslip.id} 
                        className="cursor-pointer"
                        onClick={() => console.log("View payslip details for", payslip.employee_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="py-3">
                          <Badge bg="success" className="px-3 py-2 fw-normal">
                            #{payslip.employee_id}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="fw-medium">
  {payslip.employee_details?.name}
</div>
<small className="text-muted">
  {payslip.employee_details?.designation}
</small>
<br />
<small className="text-muted">
  {payslip.employee_details?.department}
</small>
                        </td>
                        <td className="py-3">
                          <small className="text-muted">{payslip.employee_details?.branch}</small>
                        </td>
                        <td className="py-3 fw-semibold">{formatINR(payslip.basic_salary)}</td>
                        <td className="py-3 fw-semibold">{formatINR(payslip.gross_salary)}</td>
                        <td className="py-3">
                          <div className="small">
                            <div>PF: {formatINR(payslip.pf_deduction)}</div>
                            <div>ESI: {formatINR(payslip.esi_deduction)}</div>
                          </div>
                        </td>
                        <td className="py-3 fw-bold text-primary">{formatINR(payslip.net_payble)}</td>
                        <td className="py-3">
  <div className="small">
    <div>
      {payslip.employee_additional_details?.attendance?.actualWorkingDays}
      {" / "}
      {payslip.employee_additional_details?.attendance?.branchWorkingDays}
    </div>
    <small className="text-muted">Days</small>
  </div>
</td><td className="py-3">
  <div className="small">
    <div>Allow: {formatINR(payslip.allowance)}</div>
    <div>OT: {formatINR(payslip.overtime)}</div>
    <div>Skill: {formatINR(payslip.skill_wages)}</div>
  </div>
</td>
<td className="py-3">
  <div className="small">
    <div>PF: {formatINR(payslip.pf_deduction)}</div>
    <div>ESI: {formatINR(payslip.esi_deduction)}</div>
    {/* <div>Sat: {formatINR(payslip.saturation_deduction)}</div> */}
    <div>Adv: {formatINR(payslip.advance_payment)}</div>
    <div>Early: {formatINR(payslip.early_leaving)}</div>
    <div className="fw-semibold text-danger">
      Total: {formatINR(payslip.total_deduction)}
    </div>
  </div>
</td>

                        <td className="py-3">
                          {payslip.status === "unpaid" ? (
                            <Badge bg="danger" className="px-3 py-2">Unpaid</Badge>
                          ) : payslip.status === "paid" ? (
                            <Badge bg="success" className="px-3 py-2">Paid</Badge>
                          ) : (
                            <Badge bg="secondary" className="px-3 py-2">{payslip.status}</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="py-4">
                          <div className="display-4 text-muted mb-3">📊</div>
                          <h5 className="text-muted mb-2">No payslip data found</h5>
                          <p className="text-muted small">
                            {payrollData.length === 0 
                              ? "No payslips generated for the selected month" 
                              : "No matching records found for your search"}
                          </p>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={handleReset}
                            className="mt-2"
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalRecords > 0 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div className="text-muted small">
                  Showing <strong>{(currentPage - 1) * entriesPerPage + 1}</strong> to{" "}
                  <strong>{Math.min(currentPage * entriesPerPage, totalRecords)}</strong> of{" "}
                  <strong>{totalRecords}</strong> entries
                </div>
                <PaginationDots
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PayrollReport;