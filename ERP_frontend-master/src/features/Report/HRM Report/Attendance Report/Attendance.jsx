// MonthlyAttendanceReport.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Table, Badge, Button, Breadcrumb, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Report.css';
import { Search, ArrowClockwise, FileExcel, FilePdf, CalendarDay, CalendarWeek, CalendarMonth, CalendarEvent, People, Clock, ClockHistory, DoorOpen, CalendarCheck, CalendarX } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchLeaves, getEmployees } from '../../../../services/hrmService';
import branchService from '../../../../services/branchService';
import PaginationDots from '../../../../components/Pagination'
import attendanceService from '../../../../services/attendanceService';
import MonthlyAttendancePreviewModal from './MonthlyAttendancePreviewModal';


const MonthlyAttendanceReport = () => {
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateFilterType, setDateFilterType] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Real data states
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Date filter states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [weekNumber, setWeekNumber] = useState(() => {
    const date = new Date();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });
  
  const [weekYear, setWeekYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedQuarterYear, setSelectedQuarterYear] = useState(new Date().getFullYear());
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('');
  const [leaves, setLeaves] = useState([]);
const [leavesLoading, setLeavesLoading] = useState(true);
const [attendanceData, setAttendanceData] = useState([]);
const [showPreview, setShowPreview] = useState(false);
const [previewData, setPreviewData] = useState([]);
  // Year options
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  
  // Month options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Quarter options
  const quarters = [
    { value: 'q1', label: 'Q1 (Jan-Mar)' },
    { value: 'q2', label: 'Q2 (Apr-Jun)' },
    { value: 'q3', label: 'Q3 (Jul-Sep)' },
    { value: 'q4', label: 'Q4 (Oct-Dec)' }
  ];

  // Financial year options
  const financialYears = [];
  for (let i = new Date().getFullYear(); i >= new Date().getFullYear() - 5; i--) {
    financialYears.push(`${i}-${i + 1}`);
  }

  // Fetch employees and branches on component mount
  useEffect(() => {
    const fetchData = async () => {
      setEmployeesLoading(true);
      setBranchesLoading(true);
      
      try {
        // Fetch employees
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
        
        // Fetch branches
        const branchesData = await branchService.getAll();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setEmployeesLoading(false);
        setBranchesLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter employees based on branch and search
  useEffect(() => {
    let filtered = employees;
    
    // Apply branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(emp => 
        emp.branch && emp.branch.id && emp.branch.id.toString() === selectedBranch.toString()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.employee_id?.toLowerCase().includes(searchLower) ||
        emp.department?.name?.toLowerCase().includes(searchLower) ||
        emp.designation?.name?.toLowerCase().includes(searchLower) ||
        emp.branch?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedBranch, search, employees]);
useEffect(() => {
  const loadLeaves = async () => {
    setLeavesLoading(true);

    try {
      const { start, end } = getDateRange();

      const data = await fetchLeaves({
        start_date: start,
        end_date: end,
        status: "Approved", // important: count only approved
      });

      setLeaves(data);
    } catch (err) {
      console.error("Leave fetch failed", err);
      setLeaves([]);
    } finally {
      setLeavesLoading(false);
    }
  };

  loadLeaves();
}, [
  dateFilterType,
  selectedDate,
  selectedMonth,
  weekNumber,
  weekYear,
  selectedQuarter,
  selectedQuarterYear,
  selectedFinancialYear,
]);
useEffect(() => {
  const loadAttendance = async () => {
    try {
      const { start, end } = getDateRange();

      const res = await attendanceService.getAll({
        start_date: start,
        end_date: end,
      });

      // ✅ normalize response to array ONLY
      const list =
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.data?.data) ? res.data.data :
        Array.isArray(res?.attendance) ? res.attendance :
        [];

      setAttendanceData(list);
    } catch (err) {
      console.error("Attendance fetch failed", err);
      setAttendanceData([]);
    }
  };

  loadAttendance();
}, [
  dateFilterType,
  selectedDate,
  selectedMonth,
  weekNumber,
  weekYear,
  selectedQuarter,
  selectedQuarterYear,
  selectedFinancialYear,
]);


  // Get week range
  const getWeekRange = (weekNumber, year) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    const weekStart = new Date(firstDayOfYear);
    weekStart.setDate(firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return { start: weekStart, end: weekEnd };
  };

  // Get quarter date range
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
const getDateRange = () => {
  if (dateFilterType === "daily" && selectedDate) {
    return { start: selectedDate, end: selectedDate };
  }

  if (dateFilterType === "weekly" && weekNumber && weekYear) {
    const { start, end } = getWeekRange(Number(weekNumber), Number(weekYear));
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }

  if (dateFilterType === "monthly" && selectedMonth) {
    const [year, month] = selectedMonth.split("-");
    const lastDay = new Date(year, month, 0).getDate(); // ✅ FIX
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${lastDay}`,
    };
  }

  if (
    dateFilterType === "quarterly" &&
    selectedQuarter &&
    selectedQuarterYear
  ) {
    return getQuarterDateRange(selectedQuarter, selectedQuarterYear);
  }

  if (
    dateFilterType === "financialYear" &&
    selectedFinancialYear
  ) {
    return getFinancialYearDateRange(selectedFinancialYear);
  }

  // ✅ SAFE FALLBACK (prevents crashes)
  const today = new Date().toISOString().split("T")[0];
  return { start: today, end: today };
};

const timeToMinutes = (time) => {
  if (!time || time === "00:00:00") return 0;
  const [h, m, s] = time.split(":").map(Number);
  return h * 60 + m + Math.floor(s / 60);
};

const minutesToHours = (minutes) =>
  (minutes / 60).toFixed(2);
const calculateAttendancePercent = (employee) => {
  const stats = getAttendanceStats(employee);

  const totalDays = stats.present + stats.leave;
  if (totalDays === 0) return 0;

  return Math.round((stats.present / totalDays) * 100);
};
const getAttendanceStats = (employee) => {
  const range = getDateRange();
  if (!range?.start || !range?.end) {
    return {
      present: 0,
      leave: 0,
      overtime: "0.00",
      earlyLeave: "0.00",
      late: "0.00",
    };
  }

  const { start, end } = range;
  const empId = employee.employee_id?.toString();

  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);

  const records = Array.isArray(attendanceData)
    ? attendanceData.filter((a) => {
        if (a.employee?.employee_id?.toString() !== empId) return false;
        const d = new Date(a.date);
        return d >= rangeStart && d <= rangeEnd;
      })
    : [];

  let presentDays = 0;
  let overtimeMin = 0;
  let earlyLeaveMin = 0;
  let lateMin = 0;

  records.forEach((r) => {
    if (r.status === "Present") presentDays += 1;
    overtimeMin += timeToMinutes(r.overtime);
    earlyLeaveMin += timeToMinutes(r.early_leaving);
    lateMin += timeToMinutes(r.late);
  });

  const leaveDays = getEmployeeLeaveDays(empId);

  return {
    present: presentDays,
    leave: leaveDays,
    overtime: minutesToHours(overtimeMin),
    earlyLeave: minutesToHours(earlyLeaveMin),
    late: minutesToHours(lateMin),
  };
};
const getEmployeeLeaveDays = (employeeId) => {
  const range = getDateRange();
  if (!range?.start || !range?.end) return 0;

  const rangeStart = new Date(range.start);
  const rangeEnd = new Date(range.end);

  return leaves
    .filter((l) => {
      if (
        l.employee_id?.toString() !== employeeId?.toString() ||
        l.status !== "Approved"
      ) return false;

      const leaveStart = new Date(l.start_date);
      const leaveEnd = new Date(l.end_date);

      return leaveStart <= rangeEnd && leaveEnd >= rangeStart;
    })
    .reduce((sum, l) => sum + Number(l.total_leave_days || 0), 0);
};

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Handle branch change
  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedBranch('all');
    setSelectedMonth(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    setDateFilterType('monthly');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setWeekNumber(Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 / 7));
    setWeekYear(new Date().getFullYear());
    setSelectedYear(new Date().getFullYear());
    setSelectedQuarter('');
    setSelectedQuarterYear(new Date().getFullYear());
    setSelectedFinancialYear('');
    setSearch('');
  };

  // Get filter title based on date filter type
  const getFilterTitle = () => {
    if (dateFilterType === 'daily') {
      const dateObj = new Date(selectedDate);
      return `Attendance Summary – ${dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
    }

    if (dateFilterType === 'weekly') {
      const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
      const start = weekRange.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const end = weekRange.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `Attendance Summary – Week ${weekNumber}, ${weekYear} (${start} - ${end})`;
    }
if (dateFilterType === "monthly") {
  const [year, month] = selectedMonth.split("-");
  const monthName = months.find(m => m.value === month)?.label;
  return `Attendance Summary – ${monthName} ${year}`;
}

    if (dateFilterType === 'quarterly') {
      const quarterLabel = quarters.find(q => q.value === selectedQuarter)?.label;
      return `Attendance Summary – ${quarterLabel} ${selectedQuarterYear}`;
    }

    if (dateFilterType === 'financialYear') {
      return `Attendance Summary – FY ${selectedFinancialYear}`;
    }

    return 'Attendance Summary';
  };
const getExcelSheetName = () => {
  if (dateFilterType === "daily") return "Daily Attendance";

  if (dateFilterType === "weekly")
    return `Week ${weekNumber}-${weekYear}`;

  if (dateFilterType === "monthly") {
    const [year, month] = selectedMonth.split("-");
    const monthName = months.find(m => m.value === month)?.label;
    return `${monthName} ${year}`; // e.g. "February 2026"
  }

  if (dateFilterType === "quarterly")
    return `Q-${selectedQuarterYear}`;

  if (dateFilterType === "financialYear")
    return `FY ${selectedFinancialYear}`;

  return "Attendance";
};

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredEmployees.map((emp) => {
      const stats = getAttendanceStats(emp);
      // const attendancePercent = calculateAttendancePercent(emp);
      
      return {
        'Employee ID': emp.employee_id || emp.id,
        'Name': emp.name,
        'Department': emp.department?.name || null,
        'Designation': emp.designation?.name || null,
        'Site': emp.branch?.name || null,
        'Present Days': stats.present,
        'Leave Days': stats.leave,
        'Overtime (hours)': stats.overtime,
        'Early Leave (hours)': stats.earlyLeave,
        'Late (hours)': stats.late,
        // 'Attendance %': attendancePercent
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [
    { wch: 12 }, 
    { wch: 25 }, 
    { wch: 25 }, 
    { wch: 25 },
    { wch: 32 }, 
    { wch: 14 }, 
    { wch: 14 }, 
    { wch: 18 }, 
    { wch: 20 }, 
    { wch: 14 }, 
  ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getExcelSheetName());
    XLSX.writeFile(workbook, `AttendanceReport_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    doc.setFontSize(14);
    doc.text(getFilterTitle(), 14, 15);

    const tableData = filteredEmployees.map((emp) => {
      const stats = getAttendanceStats(emp);
      // const attendancePercent = calculateAttendancePercent(emp);
      
      return [
        emp.employee_id || emp.id,
        emp.name,
        emp.department?.name || null,
        stats.present.toString(),
        stats.leave.toString(),
        stats.overtime,
        stats.earlyLeave,
        stats.late,
        // `${attendancePercent}%`
      ];
    });

    autoTable(doc, {
      head: [[
        'Employee ID',
        'Name',
        'Department',
        'Present Days',
        'Leave Days',
        'Overtime (hrs)',
        'Early Leave (hrs)',
        'Late (hrs)',
        // 'Attendance %'
      ]],
      body: tableData,
      startY: 22,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [72, 66, 109], textColor: 255 },
    });

    doc.save(`AttendanceReport_${new Date().toISOString().split('T')[0]}.pdf`);
  };
// Handle preview button click
const handlePreview = () => {
  const preview = filteredEmployees.map((emp) => {
    const stats = getAttendanceStats(emp);
    const attendancePercent = calculateAttendancePercent(emp);
    
    return {
      "Employee ID": emp.employee_id || emp.id,
      "Name": emp.name,
      "Department": emp.department?.name || null,
      "Designation": emp.designation?.name || null,
      "Site": emp.branch?.name || null,
      "Present Days": stats.present,
      "Leave Days": stats.leave,
      "Overtime (hours)": stats.overtime,
      "Early Leave (hours)": stats.earlyLeave,
      "Late (hours)": stats.late,
      // "Attendance %": `${attendancePercent}%`
    };
  });
  setPreviewData(preview);
  setShowPreview(true);
};
  // Calculate totals from filtered employees
  const calculateTotals = () => {
    let totalPresent = 0;
    let totalLeave = 0;
    let totalOvertime = 0;
    let totalEarlyLeave = 0;
    let totalLate = 0;
    let totalAttendancePercent = 0;

    filteredEmployees.forEach(emp => {
      const stats = getAttendanceStats(emp);
      const attendancePercent = calculateAttendancePercent(emp);
      
      totalPresent += stats.present;
      totalLeave += stats.leave;
      totalOvertime += parseFloat(stats.overtime);
      totalEarlyLeave += parseFloat(stats.earlyLeave);
      totalLate += parseFloat(stats.late);
      totalAttendancePercent += attendancePercent;
    });

    const totalEmployees = filteredEmployees.length;
    const averageAttendance = totalEmployees > 0 ? Math.round(totalAttendancePercent / totalEmployees) : 0;

    return {
      totalPresent,
      totalLeave,
      totalOvertime: totalOvertime.toFixed(2),
      totalEarlyLeave: totalEarlyLeave.toFixed(2),
      totalLate: totalLate.toFixed(2),
      totalEmployees,
      averageAttendance
    };
  };

  const totals = calculateTotals();

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredEmployees.slice(startIndex, startIndex + entries);

  // Status variant for attendance percentage
  const attendanceStatusVariant = (percent) => {
    if (percent >= 90) return 'success';
    if (percent >= 80) return 'warning';
    return 'danger';
  };

  // Format month for display
  const getMonthDisplay = () => {
    const [year, month] = selectedMonth.split('-');
    const monthName = months.find(m => m.value === month)?.label;
    return `${monthName}, ${year}`;
  };

  return (
    <div className="p-3 shadow-sm border-0 overflow-x-hidden">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Manage Monthly Attendance</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Monthly Attendance</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
        <Button variant="info" onClick={handlePreview} disabled={filteredEmployees.length === 0}>
    Preview
  </Button>
          <Button variant="success" onClick={handleExportExcel} disabled={filteredEmployees.length === 0}>
            Export Excel
          </Button>
          <Button variant="danger" onClick={handleExportPDF} disabled={filteredEmployees.length === 0}>
            Export PDF
          </Button>
        </Col>
      </Row>

      {/* Filters - Following Invoice Summary Pattern */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end flex-nowrap">
            {/* Date Filter Type */}
            <Col md="auto">
              <Form.Label>Date Range Type</Form.Label>
              <Form.Select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                disabled={employeesLoading || branchesLoading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="financialYear">Financial Year</option>
              </Form.Select>
            </Col>

            {/* Daily Filter */}
            {dateFilterType === 'daily' && (
              <Col md="auto">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={employeesLoading || branchesLoading}
                />
              </Col>
            )}

            {/* Weekly Filter */}
            {dateFilterType === 'weekly' && (
              <>
                <Col md="auto">
                  <Form.Label>Week Number</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="53"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    className="border-secondary"
                    disabled={employeesLoading || branchesLoading}
                  />
                </Col>
                <Col md="auto">
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={weekYear}
                    onChange={(e) => setWeekYear(parseInt(e.target.value))}
                    className="border-secondary"
                    disabled={employeesLoading || branchesLoading}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Col>
              </>
            )}

            {/* Monthly Filter */}
            {dateFilterType === 'monthly' && (
              <>
                <Col md="auto">
                  <Form.Label>Month</Form.Label>
                  <Form.Control
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    disabled={employeesLoading || branchesLoading}
                  />
                </Col>
              </>
            )}

            {/* Quarterly Filter */}
            {dateFilterType === 'quarterly' && (
              <>
                <Col md="auto">
                  <Form.Label>Quarter</Form.Label>
                  <Form.Select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    disabled={employeesLoading || branchesLoading}
                  >
                    <option value="">Select Quarter</option>
                    {quarters.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={selectedQuarterYear}
                    onChange={(e) => setSelectedQuarterYear(e.target.value)}
                    disabled={employeesLoading || branchesLoading}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Col>
              </>
            )}

            {/* Financial Year Filter */}
            {dateFilterType === 'financialYear' && (
              <Col md={3}>
                <Form.Label>Financial Year</Form.Label>
                <Form.Select
                  value={selectedFinancialYear}
                  onChange={(e) => setSelectedFinancialYear(e.target.value)}
                  disabled={employeesLoading || branchesLoading}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      {fy}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            {/* Branch Filter */}
            <Col md={2}>
              <Form.Label>Site</Form.Label>
              {branchesLoading ? (
                <div className="d-flex align-items-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <small>Loading sites...</small>
                </div>
              ) : (
                <Form.Select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  disabled={employeesLoading || branchesLoading}
                >
                  <option value="all">All Sites</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Col>

            {/* Action Buttons */}
            <Col md={1} className="d-flex gap-2">
              <Button
                variant="danger"
                onClick={handleResetFilters}
                disabled={employeesLoading || branchesLoading}
              >
                <ArrowClockwise />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards - Following Invoice Summary Pattern */}
      <Row className="mb-4 g-3">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Total Present</h6>
                <div className="bg-success bg-opacity-10 p-2 rounded">
                  <CalendarCheck className="text-success" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalPresent}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Total present days</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Total Leave</h6>
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <CalendarX className="text-danger" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalLeave}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Total leave days</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Overtime</h6>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <ClockHistory className="text-primary" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalOvertime}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Total overtime hours</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Early Leave</h6>
                <div className="bg-warning bg-opacity-10 p-2 rounded">
                  <DoorOpen className="text-warning" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalEarlyLeave}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Total early leave hours</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Employee Late</h6>
                <div className="bg-info bg-opacity-10 p-2 rounded">
                  <Clock className="text-info" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalLate}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Total late hours</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-muted mb-0">Total Employees</h6>
                <div className="bg-secondary bg-opacity-10 p-2 rounded">
                  <People className="text-secondary" size={18} />
                </div>
              </div>
              <h3 className="fw-bold mb-0">{totals.totalEmployees}</h3>
              <div className="mt-auto pt-2">
                <small className="text-muted">Average attendance: {totals.averageAttendance}%</small>
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
            <h5 className="mb-0">Employee Attendance Details</h5>
            <small className="text-muted">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
              {selectedBranch !== 'all' && ` in selected branch`}
            </small>
          </Col>

          <Col md={8}>
            <div className="d-flex justify-content-end gap-3">
              <div style={{ width: '120px' }}>
                <Form.Select
                  value={entries}
                  onChange={(e) => setEntries(e.target.value)}
                  size="sm"
                  disabled={employeesLoading || filteredEmployees.length === 0}
                >
                  <option value={10}>Show 10</option>
                  <option value={25}>Show 25</option>
                  <option value={50}>Show 50</option>
                  <option value={100}>Show 100</option>
                </Form.Select>
              </div>

              <div style={{ width: '250px' }}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} />
                  </span>
                  <Form.Control
                    placeholder="Search by name, ID, department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0"
                    size="sm"
                    disabled={employeesLoading}
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Table */}
        {employeesLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading employee data...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-2">No employees found</div>
            <small className="text-muted">
              {selectedBranch !== 'all' 
                ? `No employees found in the selected site. Try selecting "All Sites".`
                : `No employees available or try adjusting your search.`
              }
            </small>
          </div>
        ) : (
          <>
            <Table responsive hover bordered>
              <thead className="table-light">
                <tr>
                  <th>EMPLOYEE</th>
                  <th>Site</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>PRESENT DAYS</th>
                  <th>LEAVE DAYS</th>
                  <th>OVERTIME (HRS)</th>
                  <th>EARLY LEAVE (HRS)</th>
                  <th>LATE (HRS)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((emp) => {
                  const stats = getAttendanceStats(emp);
                  const attendancePercent = calculateAttendancePercent(emp);
                  
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <strong>{emp.name}</strong>
                            <div className="small text-muted">ID: {emp.employee_id || emp.id}</div>
                          </div>
                        </div>
                      </td>
<td style={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: "180px" }}>
  <small>{emp.branch?.name || "N/A"}</small>
</td>
                      <td>
                        <Badge bg="info">
                          {emp.department?.name || null}
                        </Badge>
                      </td>
                      <td>
                        <small>{emp.designation?.name || null}</small>
                      </td>
                      <td>
                        <strong>{stats.present}</strong>
                      </td>
                      <td>
                        <span className={stats.leave > 3 ? 'text-danger' : ''}>
                          {stats.leave}
                        </span>
                      </td>
                      <td>
                        <span>
                          {/* <ClockHistory className="me-1" size={14} /> */}
                          {stats.overtime}
                        </span>
                      </td>
                      <td>
                        <span>
                          {/* <DoorOpen className="me-1" size={14} /> */}
                          {stats.earlyLeave}
                        </span>
                      </td>
                      <td>
                        <span>
                          {/* <Clock className="me-1" size={14} /> */}
                          {stats.late}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
<PaginationDots
  totalPages={totalPages}
  currentPage={currentPage}
  onPageChange={(page) => setCurrentPage(page)}
/>
<MonthlyAttendancePreviewModal
  show={showPreview}
  onHide={() => setShowPreview(false)}
  data={previewData}
  title={getFilterTitle()}
/>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendanceReport;