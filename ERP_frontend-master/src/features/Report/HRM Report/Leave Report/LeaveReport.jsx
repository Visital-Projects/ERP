import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Form, Button, Table, Badge, Container, Breadcrumb } from "react-bootstrap";
import { Search, ArrowClockwise, FileExcel, FilePdf, Person, PersonCheck, PersonX, Clock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { fetchLeaves } from "../../../../services/hrmService";
import branchService from "../../../../services/branchService";
import LeaveReportPreviewModal from "./LeaveReportPreviewModal";

// Helper to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get week number from date
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Helper to get start and end of week from week number and year
const getWeekRange = (weekNumber, year) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (weekNumber - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay());
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return { start: weekStart, end: weekEnd };
};

const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1; // 1–12
  if (month <= 3) return "q1";
  if (month <= 6) return "q2";
  if (month <= 9) return "q3";
  return "q4";
};
const LeaveReport = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [leavesData, setLeavesData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Date filters - DEFAULT TO CURRENT MONTH
  const [dateFilterType, setDateFilterType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const [selectedQuarterYear, setSelectedQuarterYear] = useState(new Date().getFullYear());
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const [weekYear, setWeekYear] = useState(new Date().getFullYear());

  const [showPreview, setShowPreview] = useState(false);
const [previewData, setPreviewData] = useState([]);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Generate month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Generate quarter options
  const quarters = [
    { value: "q1", label: "Q1 (Jan-Mar)" },
    { value: "q2", label: "Q2 (Apr-Jun)" },
    { value: "q3", label: "Q3 (Jul-Sep)" },
    { value: "q4", label: "Q4 (Oct-Dec)" }
  ];

  // Generate financial year options
  const financialYears = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    financialYears.push(`${i}-${i + 1}`);
  }

  // Get quarter date ranges
  const getQuarterDateRange = (quarter, year) => {
    switch(quarter) {
      case 'q1': return { start: `${year}-01-01`, end: `${year}-03-31` };
      case 'q2': return { start: `${year}-04-01`, end: `${year}-06-30` };
      case 'q3': return { start: `${year}-07-01`, end: `${year}-09-30` };
      case 'q4': return { start: `${year}-10-01`, end: `${year}-12-31` };
      default: return null;
    }
  };

  // Get financial year date range
  const getFinancialYearDateRange = (financialYear) => {
    const [startYear] = financialYear.split('-').map(Number);
    return {
      start: `${startYear}-04-01`,
      end: `${startYear + 1}-03-31`
    };
  };

  // Check if date is within filter range - FIXED FUNCTION
  const isDateInRange = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    
    switch(dateFilterType) {
      case 'daily':
        if (!selectedDate) return true;
        const selectedDay = new Date(selectedDate);
        return date.getDate() === selectedDay.getDate() && 
               date.getMonth() === selectedDay.getMonth() && 
               date.getFullYear() === selectedDay.getFullYear();
        
      case 'weekly':
        if (!weekNumber || !weekYear) return true;
        const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
        return date >= weekRange.start && date <= weekRange.end;
        
      case 'monthly':
        if (!selectedMonth || !selectedYear) return true;
        const targetMonth = new Date(`${selectedYear}-${selectedMonth}-01`);
        return date.getMonth() === targetMonth.getMonth() && 
               date.getFullYear() === targetMonth.getFullYear();
        
      case 'quarterly':
        if (!selectedQuarter || !selectedQuarterYear) return true;
        const range = getQuarterDateRange(selectedQuarter, selectedQuarterYear);
        const quarterStart = new Date(range.start);
        const quarterEnd = new Date(range.end);
        return date >= quarterStart && date <= quarterEnd;
        
      case 'financialYear':
        if (!selectedFinancialYear) return true;
        const fyRange = getFinancialYearDateRange(selectedFinancialYear);
        const fyStart = new Date(fyRange.start);
        const fyEnd = new Date(fyRange.end);
        return date >= fyStart && date <= fyEnd;
        
      default:
        return true;
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [entries, search, selectedBranch, selectedDepartment, dateFilterType]);
  useEffect(() => {
  if (dateFilterType === "quarterly") {
    setSelectedQuarter(getCurrentQuarter());
    setSelectedQuarterYear(new Date().getFullYear());
  }
}, [dateFilterType]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await branchService.getAll();
        setBranches(branchesData);
      } catch (err) {
        console.error(err);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    if (leavesData.length > 0) {
      const uniqueDepartments = [
        ...new Set(
          leavesData
            .filter(l => l.employee?.department)
            .map(l => l.employee.department)
        )
      ];
      setDepartments(uniqueDepartments);
    } else {
      setDepartments([]);
    }
  }, [leavesData]);

  // Fetch all leaves data initially
  useEffect(() => {
    const loadLeaves = async () => {
      setLoading(true);
      try {
        const leaves = await fetchLeaves(); // Fetch all leaves without filters
        setLeavesData(leaves);
      } catch (error) {
        console.error("Error loading leaves:", error);
        setLeavesData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaves();
  }, []);

  // Process leaves data to group by employee with filters applied
  const processEmployeeLeaveData = () => {
    const employeeMap = {};
    
    // First, filter leaves data by date range and branch
    const filteredLeaves = leavesData.filter(leave => {
      // Check if leave is within selected date range
      const isWithinDateRange = isDateInRange(leave.applied_on) || 
                                isDateInRange(leave.start_date) || 
                                isDateInRange(leave.end_date);
      
      // Check if leave matches selected branch
      const matchesBranch = !selectedBranch || 
                           (leave.employee && leave.employee.branch_id == selectedBranch);
      
      return isWithinDateRange && matchesBranch;
    });
    
    // Now process the filtered leaves
    filteredLeaves.forEach(leave => {
      const employee = leave.employee;
      if (!employee) return;
      
      const empId = employee.employee_id;
      
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          id: `#${empId}`,
          employeeId: empId,
          name: employee.name,
          branch_id: employee.branch_id,
          branch_name: branches.find(b => b.id == employee.branch_id)?.name || 'Unknown',
          approved: 0,
          approvedDays: 0,
          rejected: 0,
          pending: 0,
          totalLeaves: 0,
          leaveDetails: {
            approved: [],
            rejected: [],
            pending: []
          }
        };
      }
      
      const status = leave.status?.toLowerCase();
      const leaveDetails = {
        id: leave.id,
        startDate: leave.start_date,
        endDate: leave.end_date,
        leaveType: leave.leave_type?.title || 'N/A',
        reason: leave.leave_reason,
        totalDays: parseFloat(leave.total_leave_days) || 0,
        status: leave.status,
        appliedOn: leave.applied_on
      };
      
      if (status === 'approved') {
        employeeMap[empId].approved++;
        employeeMap[empId].approvedDays += leaveDetails.totalDays;
        employeeMap[empId].leaveDetails.approved.push(leaveDetails);
      } else if (status === 'rejected') {
        employeeMap[empId].rejected++;
        employeeMap[empId].leaveDetails.rejected.push(leaveDetails);
      } else {
        employeeMap[empId].pending++;
        employeeMap[empId].leaveDetails.pending.push(leaveDetails);
      }
      
      employeeMap[empId].totalLeaves++;
    });
    
    // Convert to array and apply additional filters
    let result = Object.values(employeeMap);
    
    // Apply department filter
    if (selectedDepartment) {
      result = result.filter(emp => 
        filteredLeaves.some(leave => 
          leave.employee?.employee_id === emp.employeeId && 
          leave.employee?.department === selectedDepartment
        )
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.id.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  };

  const handleViewDetails = (employee, leaveType) => {
    setSelectedEmployee({ ...employee, leaveType });
    setShowDetails(true);
  };

  const getFilterTitle = () => {
    if (dateFilterType === "daily") {
      const dateObj = new Date(selectedDate);
      return `Leave Report – ${dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
    }

    if (dateFilterType === "weekly") {
      const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
      const start = weekRange.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const end = weekRange.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `Leave Report – Week ${weekNumber}, ${weekYear} (${start} - ${end})`;
    }

    if (dateFilterType === "monthly") {
      const monthName = months.find(m => m.value === selectedMonth)?.label;
      return `Leave Report – ${monthName} ${selectedYear}`;
    }

    if (dateFilterType === "quarterly") {
      const quarterLabel = quarters.find(q => q.value === selectedQuarter)?.label;
      return `Leave Report – ${quarterLabel} ${selectedQuarterYear}`;
    }

    if (dateFilterType === "financialYear") {
      return `Leave Report – FY ${selectedFinancialYear}`;
    }

    return "Leave Report";
  };

  // const handleExportExcel = () => {
  //   const employeeData = processEmployeeLeaveData();
  //   const exportData = employeeData.map((emp) => ({
  //     "Employee ID": emp.id,
  //     "Employee Name": emp.name,
  //     "Site": emp.branch_name,
  //     "Approved Leaves": emp.approved,
  //     "Rejected Leaves": emp.rejected,
  //     "Pending Leaves": emp.pending,
  //     "Total Leaves": emp.totalLeaves
  //   }));
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, getFilterTitle());
  //   XLSX.writeFile(workbook, `LeaveReport_${new Date().toISOString().split('T')[0]}.xlsx`);
  // };
const handleExportExcel = () => {
  const employeeData = processEmployeeLeaveData();
  const exportData = employeeData.map((emp) => ({
    "Employee ID": emp.id,
    "Employee Name": emp.name,
    "Site": emp.branch_name,
    "Approved Leaves": emp.approved,
    "Rejected Leaves": emp.rejected,
    "Pending Leaves": emp.pending,
    "Total Leaves": emp.totalLeaves
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Employee ID
    { wch: 20 }, // Employee Name
    { wch: 30 }, // Site (increase width for long names)
    { wch: 15 }, // Approved
    { wch: 15 }, // Rejected
    { wch: 15 }, // Pending
    { wch: 15 }, // Total
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, getFilterTitle());
  XLSX.writeFile(workbook, `LeaveReport_${new Date().toISOString().split('T')[0]}.xlsx`);
};
  const handleExportPDF = () => {
    const employeeData = processEmployeeLeaveData();
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text(getFilterTitle(), 14, 15);

    // autoTable(doc, {
    //   head: [[
    //     "Employee ID",
    //     "Employee Name",
    //     "Approved",
    //     "Rejected",
    //     "Pending",
    //     "Total"
    //   ]],
    //   body: employeeData.map((emp) => [
    //     emp.id,
    //     emp.name,
    //     emp.approved.toString(),
    //     emp.rejected.toString(),
    //     emp.pending.toString(),
    //     emp.totalLeaves.toString()
    //   ]),
    //   startY: 22,
    //   theme: "striped",
    //   styles: { fontSize: 9 },
    //   headStyles: { fillColor: [72, 66, 109], textColor: 255 },
    // });
autoTable(doc, {
  head: [[
    "Employee ID",
    "Employee Name",
    "Site",
    "Approved",
    "Rejected",
    "Pending",
    "Total"
  ]],
  body: employeeData.map((emp) => [
    emp.id,
    emp.name,
    emp.branch_name,
    emp.approved.toString(),
    emp.rejected.toString(),
    emp.pending.toString(),
    emp.totalLeaves.toString()
  ]),
  startY: 22,
  theme: "striped",
  styles: { fontSize: 9 },
  columnStyles: {
    2: { cellWidth: 'wrap' } // Site column wraps text
  },
  headStyles: { fillColor: [72, 66, 109], textColor: 255 },
});
    doc.save(`LeaveReport_${new Date().toISOString().split("T")[0]}.pdf`);
  };
const handlePreview = () => {
  const employeeData = processEmployeeLeaveData();
  const preview = employeeData.map((emp) => ({
    "Employee ID": emp.id,
    "Employee Name": emp.name,
    "Site": emp.branch_name,
    "Approved Leaves": emp.approved,
    "Rejected Leaves": emp.rejected,
    "Pending Leaves": emp.pending,
    "Total Leaves": emp.totalLeaves
  }));
  setPreviewData(preview);
  setShowPreview(true);
};
  const handleResetFilters = () => {
    setSelectedBranch("");
    setSelectedDepartment("");
    setDateFilterType("monthly");
    setSelectedMonth(currentMonth);
    setSelectedYear(new Date().getFullYear());
    setSelectedQuarter("");
    setSelectedQuarterYear(new Date().getFullYear());
    setSelectedFinancialYear("");
    setSelectedDate(getCurrentDate());
    setWeekNumber(getWeekNumber(new Date()));
    setWeekYear(new Date().getFullYear());
    setSearch("");
  };

  // Calculate totals
  const employeeData = processEmployeeLeaveData();
  const totalApproved = employeeData.reduce((a, b) => a + b.approved, 0);
  const totalRejected = employeeData.reduce((a, b) => a + b.rejected, 0);
  const totalPending = employeeData.reduce((a, b) => a + b.pending, 0);
  const totalLeaves = employeeData.reduce((a, b) => a + b.totalLeaves, 0);

  // Pagination Logic
  const totalPages = Math.ceil(employeeData.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = employeeData.slice(startIndex, startIndex + entries);

  return (
    <div className="p-3 shadow-sm border-0 overflow-x-hidden">
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Leave Report</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Leave Report</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
  <Button variant="info" onClick={handlePreview}>
    Preview
  </Button>

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
    <Row className="g-3 align-items-end flex-nowrap">

      {/* Date Filter Type */}
      <Col md={2}>
        <Form.Label>Date Range Type</Form.Label>
        <Form.Select
          value={dateFilterType}
          onChange={(e) => setDateFilterType(e.target.value)}
        >
          {/* <option value="daily">Daily</option>
          <option value="weekly">Weekly</option> */}
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="financialYear">Financial Year</option>
        </Form.Select>
      </Col>

      {/* Daily Filter */}
      {dateFilterType === "daily" && (
        <Col md="auto">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Col>
      )}

      {/* Weekly Filter */}
      {dateFilterType === "weekly" && (
        <>
          <Col md={3}>
            <Form.Label>Week Number</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="53"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              className="border-secondary"
            />
          </Col>

          <Col md={3}>
            <Form.Label>Year</Form.Label>
            <Form.Select
              value={weekYear}
              onChange={(e) => setWeekYear(parseInt(e.target.value))}
              className="border-secondary"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Col>
        </>
      )}

      {/* Monthly Filter */}
      {dateFilterType === "monthly" && (
        <>
          <Col md={3}>
            <Form.Label>Month</Form.Label>
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Year</Form.Label>
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Col>
        </>
      )}

      {/* Quarterly Filter */}
      {dateFilterType === "quarterly" && (
        <>
          <Col md={3}>
            <Form.Label>Quarter</Form.Label>
            <Form.Select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="">Select Quarter</option>
              {quarters.map((quarter) => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Year</Form.Label>
            <Form.Select
              value={selectedQuarterYear}
              onChange={(e) => setSelectedQuarterYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Col>
        </>
      )}

      {/* Financial Year Filter */}
      {dateFilterType === "financialYear" && (
        <Col md={3}>
          <Form.Label>Financial Year</Form.Label>
          <Form.Select
            value={selectedFinancialYear}
            onChange={(e) => setSelectedFinancialYear(e.target.value)}
          >
            <option value="">Select Financial Year</option>
            {financialYears.map((fy) => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </Form.Select>
        </Col>
      )}

      {/* Site Filter */}
      <Col md={3}>
        <Form.Label>Site</Form.Label>
        <Form.Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="">All Sites</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* Action Button */}
      <Col md={1} className="d-flex gap-2">
        <Button variant="danger" onClick={handleResetFilters}>
          <ArrowClockwise />
        </Button>
      </Col>

    </Row>
  </Card.Body>
</Card>


      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0">Approved Leaves</h6>
                <div className="bg-success bg-opacity-10 p-2 rounded">
                  <PersonCheck className="text-success" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-success">{totalApproved}</h3>
              <div className="mt-auto pt-3">
                <small className="text-muted">Total approved leave requests</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0">Rejected Leaves</h6>
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <PersonX className="text-danger" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-danger">{totalRejected}</h3>
              <div className="mt-auto pt-3">
                <small className="text-muted">Total rejected leave requests</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0">Pending Leaves</h6>
                <div className="bg-warning bg-opacity-10 p-2 rounded">
                  <Clock className="text-warning" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-warning">{totalPending}</h3>
              <div className="mt-auto pt-3">
                <small className="text-muted">Leave requests awaiting approval</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0">Total Leaves</h6>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <Person className="text-primary" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totalLeaves}</h3>
              <div className="mt-auto pt-3">
                <small className="text-muted">All leave requests processed</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <div className="mb-4">
        {/* Table Header Controls */}
        <Row className="align-items-center mb-3">
          <Col md={4}>
            <h5 className="mb-0">Leave Details</h5>
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
                    placeholder="Search by employee name or ID..."
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
            <p className="mt-2 text-muted">Loading leave data...</p>
          </div>
        ) : (
          <Table responsive hover bordered>
            <thead className="table-light">
              <tr>
                <th>EMPLOYEE ID</th>
                <th>EMPLOYEE NAME</th>
                <th>Site</th>
                <th>APPROVED LEAVES</th>
                <th>TOTAL DAYS</th> 
                <th>REJECTED LEAVES</th>
                <th>PENDING LEAVES</th>
                <th>TOTAL LEAVES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((emp, i) => (
                <tr key={i}>
                  <td>
                    <div className="fw-semibold">{emp.id}</div>
                  </td>
                  <td>
                    <div className="text-capitalize">{emp.name}</div>
                  </td>
                  <td>
                    <div className="small">{emp.branch_name}</div>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleViewDetails(emp, 'approved')}
                      disabled={emp.approved === 0}
                    >
                      {emp.approved} View
                    </Button>
                  </td>
                  <td>
  <Badge bg="success" className="fs-6">
    {emp.approvedDays}
  </Badge>
</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleViewDetails(emp, 'rejected')}
                      disabled={emp.rejected === 0}
                    >
                      {emp.rejected} View
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-warning"
                      onClick={() => handleViewDetails(emp, 'pending')}
                      disabled={emp.pending === 0}
                    >
                      {emp.pending} View
                    </Button>
                  </td>
                  <td>
                    <Badge bg="info" className="fs-6">
                      {emp.totalLeaves}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {!loading && employeeData.length === 0 && (
          <div className="text-center py-5">
            <div className="text-muted mb-2">No leave records found</div>
            <small className="text-muted">
              Try adjusting your filters or select a different date range
            </small>
          </div>
        )}
      </div>

      {/* Modal for leave details */}
      <LeaveDetailsModal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        employee={selectedEmployee}
      />
      <LeaveReportPreviewModal
  show={showPreview}
  onHide={() => setShowPreview(false)}
  data={previewData}
  title={getFilterTitle()}
/>
    </div>
  );
};

export default LeaveReport;