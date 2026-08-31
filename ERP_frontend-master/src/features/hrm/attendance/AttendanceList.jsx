
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
  Row,
  Col,
  Card,
  Badge,
  Container,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../../components/BreadCrumb";
import {
  getBranches,
  getDepartments,
  getEmployees,
} from "../../../services/hrmService";
import attendanceService from "../../../services/attendanceService";
import {
  FaSearch,
  FaSyncAlt,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaBusinessTime,
  FaSignInAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PaginationDots from "../../../components/Pagination";

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showEmployeeAttendanceModal, setShowEmployeeAttendanceModal] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [employeeAttendanceLoading, setEmployeeAttendanceLoading] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clock-in/Clock-out functionality
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockEmployee, setClockEmployee] = useState(null);
  const [clockTimestamp, setClockTimestamp] = useState("");
  const [clockSubmitting, setClockSubmitting] = useState(false);
  const [clockAction, setClockAction] = useState(""); // 'in' or 'out'

  const [filters, setFilters] = useState({
    type: "Monthly",
    month: new Date().toISOString().slice(0, 7),
    date: new Date().toISOString().slice(0, 10),
    branch_id: "",
    department_id: "",
    employee_type: "",
    search: "",
  });

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentRecord, setCurrentRecord] = useState({
    id: null,
    employee_id: "",
    date: "",
    status: "Present",
    clock_in_hours: "00",
    clock_in_minutes: "00",
    clock_in_seconds: "00",
    clock_out_hours: "00",
    clock_out_minutes: "00",
    clock_out_seconds: "00",
    late_hours: "00",
    late_minutes: "00",
    late_seconds: "00",
    early_leaving_hours: "00",
    early_leaving_minutes: "00",
    early_leaving_seconds: "00",
    overtime_hours: "00",
    overtime_minutes: "00",
    overtime_seconds: "00",
    total_rest: 0,
    reason: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, bg: type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 700);
  };

  const handleCloseEmployeeAttendanceModal = () => {
    setShowEmployeeAttendanceModal(false);
    setSelectedEmployee(null);
    setEmployeeAttendance([]);
  };

  // Handle clock modal
  const handleCloseClockModal = () => {
    setShowClockModal(false);
    setClockEmployee(null);
    setClockTimestamp("");
    setClockAction("");
  };

  useEffect(() => {
    loadInitialData();
    loadAttendance();
  }, []);

  useEffect(() => {
    if (filters.employee_type) {
      loadAttendance();
    }
  }, [filters.employee_type]);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceData]);

  const loadInitialData = async () => {
    try {
      const [branchesData, departmentsData, employeesData] = await Promise.all([
        getBranches(),
        getDepartments(),
        getEmployees(),
      ]);

      setBranches(branchesData);

      let departmentsList = [];
      if (Array.isArray(departmentsData)) {
        departmentsList = departmentsData;
      } else if (departmentsData && Array.isArray(departmentsData.data)) {
        departmentsList = departmentsData.data;
      } else if (
        departmentsData &&
        departmentsData.success &&
        Array.isArray(departmentsData.data)
      ) {
        departmentsList = departmentsData.data;
      }

      setDepartments(departmentsList);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = {};

      // Handle "Not Set" filter - send null or empty string to API
      if (filters.employee_type) {
        if (filters.employee_type === "Not Set") {
          params.employee_type = null;
        } else {
          params.employee_type = filters.employee_type;
        }
      }

      const response = await attendanceService.getAll(params);
      if (response.data.success) {
        setAttendanceData(response.data.data);
        console.log("Attendance data loaded:", response.data.data);

        // Debug: Check early leaving values in the response
        response.data.data.forEach((record, index) => {
          console.log(`Record ${index}:`, {
            id: record.id,
            employee: record.employee?.name,
            early_leaving: record.early_leaving,
            clock_out: record.clock_out,
            overtime: record.overtime,
          });
        });
      } else {
        console.error("Failed to load attendance:", response.data.message);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeAttendance = async (
    employeeId,
    employeeCode,
    month = null
  ) => {
    setEmployeeAttendanceLoading(true);
    try {
      const params = {};

      if (month) {
        const [yearPart, monthPart] = month.split("-");
        params.month = parseInt(monthPart);
        params.year = parseInt(yearPart);
      } else {
        const now = new Date();
        params.month = now.getMonth() + 1;
        params.year = now.getFullYear();
      }

      const response = await attendanceService.getEmployeeAttendanceSummary(
        employeeCode,
        params
      );

      if (response.data && response.data.success) {
        setEmployeeAttendance(response.data.data);
      } else {
        console.error(
          "Failed to load employee attendance:",
          response.data?.message
        );
        setEmployeeAttendance([]);
        showToast("No attendance records found for this employee", "warning");
      }
    } catch (error) {
      console.error("Error loading employee attendance:", error);
      setEmployeeAttendance([]);
      showToast("Error loading employee attendance data", "danger");
    } finally {
      setEmployeeAttendanceLoading(false);
    }
  };

  const handleEmployeeClick = async (
    employeeId,
    employeeCode,
    employeeName
  ) => {
    setSelectedEmployee({
      id: employeeId,
      code: employeeCode,
      name: employeeName,
    });

    const selectedMonth =
      filters.type === "Monthly"
        ? filters.month
        : new Date().toISOString().slice(0, 7);

    await loadEmployeeAttendance(employeeId, employeeCode, selectedMonth);
    setShowEmployeeAttendanceModal(true);
  };

  // Handle clock-in/clock-out
  const handleClockAction = async (
    employee,
    action,
    attendanceRecord = null
  ) => {
    let shiftInfo = null;
    let defaultTimestamp = new Date();

    // If it's clock-out and we have attendance record with shift info
    if (action === "out" && attendanceRecord?.shift) {
      shiftInfo = attendanceRecord.shift;
    }

    setClockEmployee({
      ...employee,
      shiftInfo: shiftInfo,
    });
    setClockAction(action);

    const formattedTimestamp = defaultTimestamp.toISOString().slice(0, 16);
    setClockTimestamp(formattedTimestamp);
    setShowClockModal(true);
  };

  // Submit clock-in/clock-out
  const handleClockSubmit = async (e) => {
    e.preventDefault();
    setClockSubmitting(true);

    try {
      if (!clockEmployee || !clockTimestamp || !clockAction) {
        showToast("Employee and timestamp are required", "danger");
        return;
      }

      // Convert timestamp to proper format
      const timestamp = new Date(clockTimestamp);
      const date = timestamp.toISOString().slice(0, 10);
      const time = timestamp.toTimeString().slice(0, 8); // HH:MM:SS

      if (clockAction === "in") {
        // Handle clock-in using verifyAttendance
        const response = await attendanceService.verifyAttendance(
          clockEmployee.employee_id,
          { timestamp: timestamp.toISOString() }
        );

        if (response.data.success) {
          showToast(
            `Clock-in recorded successfully for ${clockEmployee.name}`,
            "success"
          );
          handleCloseClockModal();
          await loadAttendance();
        } else {
          showToast(
            response.data.message || `Failed to record clock-in`,
            "danger"
          );
        }
      } else if (clockAction === "out") {
        // For clock-out, determine whether to use early leaving or overtime API
        const clockOutData = {
          date: date,
          clock_out: time, // HH:MM:SS format only
          reason: "Work completion via clock-out",
        };

        // Determine if it's overtime based on shift end time
        let isOvertime = false;
        let isEarlyLeaving = false;

        if (clockEmployee.shiftInfo) {
          // Use shift information to determine overtime vs early leaving
          const shiftStartTime = clockEmployee.shiftInfo.start_time;
          const shiftEndTime = clockEmployee.shiftInfo.end_time;

          // Create shift end datetime for comparison
          const shiftEndDateTime = new Date(date);
          const [shiftEndHours, shiftEndMinutes] = shiftEndTime
            .split(":")
            .map(Number);
          shiftEndDateTime.setHours(shiftEndHours, shiftEndMinutes, 0);

          // Handle overnight shifts (if shift end is earlier than start, it's overnight)
          if (shiftEndTime < shiftStartTime) {
            shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1); // Next day
          }

          isOvertime = timestamp > shiftEndDateTime;

          // For early leaving: if clock-out is before shift end time AND it's not way too early (like before shift start)
          const shiftStartDateTime = new Date(date);
          const [shiftStartHours, shiftStartMinutes] = shiftStartTime
            .split(":")
            .map(Number);
          shiftStartDateTime.setHours(shiftStartHours, shiftStartMinutes, 0);

          // If clock-out is after shift start but before shift end, it's early leaving
          isEarlyLeaving =
            timestamp > shiftStartDateTime && timestamp < shiftEndDateTime;
        } else {
          // Fallback: if no shift info, use typical work hours (9 AM to 6 PM)
          const typicalShiftStart = new Date(date + "T09:00:00");
          const typicalShiftEnd = new Date(date + "T18:00:00");
          isOvertime = timestamp > typicalShiftEnd;
          isEarlyLeaving =
            timestamp > typicalShiftStart && timestamp < typicalShiftEnd;
        }

        let response;
        let apiType = "";

        if (isOvertime) {
          // Use OVERTIME API for clock-outs after shift end
          apiType = "OVERTIME";
          response = await attendanceService.updateOvertime(
            clockEmployee.employee_id,
            clockOutData
          );
        } else if (isEarlyLeaving) {
          // Use EARLY LEAVING API for clock-outs before shift end but after shift start
          apiType = "EARLY_LEAVING";
          response = await attendanceService.updateEarlyLeaving(
            clockEmployee.employee_id,
            clockOutData
          );
        } else {
          // Use OVERTIME API as fallback for any other cases
          apiType = "OVERTIME_FALLBACK";
          response = await attendanceService.updateOvertime(
            clockEmployee.employee_id,
            clockOutData
          );
        }

        if (response.data.success) {
          let message = `Clock-out recorded successfully`;

          if (apiType === "OVERTIME") {
            message += " (overtime)";
          } else if (apiType === "EARLY_LEAVING") {
            message += " (early leaving)";
          }

          message += ` for ${clockEmployee.name}`;

          showToast(message, "success");
          handleCloseClockModal();
          await loadAttendance();
        } else {
          showToast(
            response.data.message || `Failed to record clock-out`,
            "danger"
          );
        }
      }
    } catch (error) {
      console.error("Clock action error:", error);
      const errorMessage =
        error.response?.data?.message ||
        `Failed to record ${clockAction === "in" ? "clock-in" : "clock-out"}`;
      showToast(errorMessage, "danger");
    } finally {
      setClockSubmitting(false);
    }
  };

  const getEmployeeType = (employeeId) => {
    const employee = employees.find((emp) => emp.id == employeeId);
    return employee?.employee_type || "Not Set";
  };

  const getFilteredDepartments = () => {
    if (!filters.branch_id) return departments;

    const branchEmployees = employees.filter(
      (emp) => emp.branch_id == filters.branch_id
    );

    const departmentIds = [
      ...new Set(branchEmployees.map((emp) => emp.department_id)),
    ];

    return departments.filter(
      (dept) =>
        departmentIds.includes(dept.id) || dept.branch_id == filters.branch_id
    );
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    if (filters.branch_id) {
      filtered = filtered.filter(
        (item) => item.employee?.branch_id == filters.branch_id
      );
    }

    if (filters.department_id) {
      filtered = filtered.filter(
        (item) => item.employee?.department_id == filters.department_id
      );
    }

    if (filters.type === "Monthly" && filters.month) {
      filtered = filtered.filter(
        (item) => item.date.slice(0, 7) === filters.month
      );
    } else if (filters.type === "Daily" && filters.date) {
      filtered = filtered.filter((item) => item.date === filters.date);
    }

    // Filter by employee type
    if (filters.employee_type) {
      filtered = filtered.filter((item) => {
        const employeeType = getEmployeeType(
          item.employee_id || item.employee?.id
        );
        return employeeType === filters.employee_type;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.employee?.name?.toLowerCase().includes(searchLower) ||
          item.employee?.employee_id?.toLowerCase().includes(searchLower) ||
          item.status?.toLowerCase().includes(searchLower) ||
          item.reason?.toLowerCase().includes(searchLower) ||
          item.shift?.title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getBranchName = (branchId) => {
    if (!branchId) return "No Branch";
    const branch = branches.find((b) => b.id == branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "No Department";
    const department = departments.find((d) => d.id == departmentId);
    return department ? department.name : `Department ${departmentId}`;
  };

  const getShiftName = (shift) => {
    if (!shift) return "No Shift";
    return shift.title || `Shift ${shift.id}`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      if (name === "branch_id") {
        return {
          ...prev,
          [name]: value,
          department_id: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleRefresh = () => {
    loadAttendance();
    setFilters({
      type: "Monthly",
      month: new Date().toISOString().slice(0, 7),
      date: new Date().toISOString().slice(0, 10),
      branch_id: "",
      department_id: "",
      employee_type: "",
      search: "",
    });
  };

  const handleSearch = () => {
    loadAttendance();
  };

  const parseTimeString = (timeString) => {
    if (!timeString || timeString === "00:00:00") {
      return { hours: "00", minutes: "00", seconds: "00" };
    }

    const timeOnly = timeString.includes(" ")
      ? timeString.split(" ")[1]
      : timeString;
    const [hours = "00", minutes = "00", seconds = "00"] = timeOnly.split(":");

    return {
      hours: hours.padStart(2, "0"),
      minutes: minutes.padStart(2, "0"),
      seconds: seconds.padStart(2, "0"),
    };
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record); // Debug log

    const clockInTime = parseTimeString(record.clock_in);
    const clockOutTime = parseTimeString(record.clock_out);
    const lateTime = parseTimeString(record.late);
    const earlyLeavingTime = parseTimeString(record.early_leaving);
    const overtimeTime = parseTimeString(record.overtime);

    const employeeId = record.employee_id || record.employee?.id;

    setCurrentRecord({
      id: record.id,
      employee_id: employeeId,
      date: record.date,
      status: record.status || "Present",
      clock_in_hours: clockInTime.hours,
      clock_in_minutes: clockInTime.minutes,
      clock_in_seconds: clockInTime.seconds,
      clock_out_hours: clockOutTime.hours,
      clock_out_minutes: clockOutTime.minutes,
      clock_out_seconds: clockOutTime.seconds,
      late_hours: lateTime.hours,
      late_minutes: lateTime.minutes,
      late_seconds: lateTime.seconds,
      early_leaving_hours: earlyLeavingTime.hours,
      early_leaving_minutes: earlyLeavingTime.minutes,
      early_leaving_seconds: earlyLeavingTime.seconds,
      overtime_hours: overtimeTime.hours,
      overtime_minutes: overtimeTime.minutes,
      overtime_seconds: overtimeTime.seconds,
      total_rest: record.total_rest || 0,
      reason: record.reason || "",
      shift: record.shift, // Add shift info for early leaving calculation
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action can not be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                try {
                  await attendanceService.delete(id);
                  onClose();
                  showToast(
                    "Attendance record deleted successfully!",
                    "success"
                  );
                  loadAttendance();
                } catch (error) {
                  console.error("Delete failed:", error);
                  onClose();
                  showToast("Failed to delete attendance record!", "danger");
                }
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  const hasEarlyLeaving = () => {
    return (
      currentRecord.early_leaving_hours !== "00" ||
      currentRecord.early_leaving_minutes !== "00"
    );
  };

  const hasOvertimeSet = () => {
    return (
      currentRecord.overtime_hours !== "00" ||
      currentRecord.overtime_minutes !== "00"
    );
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;

    setCurrentRecord((prev) => {
      const newRecord = { ...prev, [name]: value };

      // If changing early leaving fields
      if (name.startsWith("early_leaving_")) {
        const earlyHasValue =
          (name === "early_leaving_hours" && value !== "00") ||
          (name === "early_leaving_minutes" && value !== "00") ||
          (name !== "early_leaving_hours" &&
            newRecord.early_leaving_hours !== "00") ||
          (name !== "early_leaving_minutes" &&
            newRecord.early_leaving_minutes !== "00");

        // If early leaving has value, reset overtime
        if (earlyHasValue) {
          newRecord.overtime_hours = "00";
          newRecord.overtime_minutes = "00";
          newRecord.overtime_seconds = "00";
        }
      }

      // If changing overtime fields
      if (name.startsWith("overtime_")) {
        const overtimeHasValue =
          (name === "overtime_hours" && value !== "00") ||
          (name === "overtime_minutes" && value !== "00") ||
          (name !== "overtime_hours" && newRecord.overtime_hours !== "00") ||
          (name !== "overtime_minutes" && newRecord.overtime_minutes !== "00");

        // If overtime has value, reset early leaving
        if (overtimeHasValue) {
          newRecord.early_leaving_hours = "00";
          newRecord.early_leaving_minutes = "00";
          newRecord.early_leaving_seconds = "00";
        }
      }

      return newRecord;
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!currentRecord.employee_id) {
        throw new Error("Employee ID is missing from the record");
      }

      // combine time components
      const clock_in = `${currentRecord.clock_in_hours}:${currentRecord.clock_in_minutes}:${currentRecord.clock_in_seconds}`;
      const clock_out = `${currentRecord.clock_out_hours}:${currentRecord.clock_out_minutes}:${currentRecord.clock_out_seconds}`;
      const early_leaving = `${currentRecord.early_leaving_hours}:${currentRecord.early_leaving_minutes}:${currentRecord.early_leaving_seconds}`;
      const overtime = `${currentRecord.overtime_hours}:${currentRecord.overtime_minutes}:${currentRecord.overtime_seconds}`;

      const employee = employees.find(
        (emp) =>
          emp.id == currentRecord.employee_id ||
          emp.employee_id == currentRecord.employee_id
      );

      if (!employee) {
        throw new Error(
          `Employee not found. Looking for ID: ${currentRecord.employee_id}`
        );
      }

      const employeeCode = employee.employee_id;
      let successCount = 0;

      // helpers - convert "HH:MM:SS" to seconds for comparison
      const timeToSeconds = (t) => {
        if (!t) return 0;
        const parts = t.split(":");
        const hh = parseInt(parts[0] || "0", 10);
        const mm = parseInt(parts[1] || "0", 10);
        const ss = parseInt(parts[2] || "0", 10);
        return hh * 3600 + mm * 60 + ss;
      };

      const hasEarlyLeaving = early_leaving && early_leaving !== "00:00:00";
      const hasOvertime = overtime && overtime !== "00:00:00";
      const hasClockOut = clock_out && clock_out !== "00:00:00";

      // Determine early-leaving by comparing clock_out vs shift times
      let isEarlyLeaving = hasEarlyLeaving;

      // If shift info is available in currentRecord, use it
      if (!isEarlyLeaving && currentRecord.shift && hasClockOut) {
        const shift = currentRecord.shift;
        const shiftStartSec = timeToSeconds(shift.start_time || "00:00:00");
        const shiftEndSec = timeToSeconds(shift.end_time || "00:00:00");
        const clockOutSec = timeToSeconds(clock_out);

        // handle overnight shift: if shiftEnd < shiftStart then end is next day
        if (shiftEndSec < shiftStartSec) {
          const adjustedClockOutSec =
            clockOutSec < shiftStartSec ? clockOutSec + 24 * 3600 : clockOutSec;
          isEarlyLeaving =
            adjustedClockOutSec <
            shiftStartSec +
              (shiftEndSec < shiftStartSec
                ? shiftEndSec + 24 * 3600
                : shiftEndSec);
          isEarlyLeaving =
            isEarlyLeaving && adjustedClockOutSec > shiftStartSec;
        } else {
          // normal day shift
          isEarlyLeaving =
            clockOutSec > shiftStartSec && clockOutSec < shiftEndSec;
        }

        console.log("Early leaving calculation:", {
          shiftStart: shift.start_time,
          shiftEnd: shift.end_time,
          clock_out,
          isEarlyLeaving,
          shiftStartSec,
          shiftEndSec,
          clockOutSec,
        });
      }

      // --- 1) EARLY LEAVING (if determined) ---
      if (isEarlyLeaving && hasClockOut) {
        try {
          const earlyLeavingData = {
            date: currentRecord.date,
            clock_out: clock_out,
            reason: currentRecord.reason || "Updated via attendance edit",
          };
          console.log("🟡 Attempting Early Leaving API:", earlyLeavingData);
          const earlyResponse = await attendanceService.updateEarlyLeaving(
            employeeCode,
            earlyLeavingData
          );

          console.log("✅ Early Leaving Success:", earlyResponse.data);
          successCount++;
          showToast("Early leaving updated successfully!", "success");

          // Close modal and refresh immediately
          setIsClosing(true);
          setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
            loadAttendance();
          }, 700);
          return;
        } catch (error) {
          console.error(
            "❌ Early Leaving Failed:",
            error.response?.data || error.message
          );
          // Continue with other operations
        }
      }

      // --- 2) OVERTIME if present ---
      if (hasOvertime) {
        try {
          const overtimeData = {
            date: currentRecord.date,
            clock_out: clock_out,
            reason: currentRecord.reason || "Updated via attendance edit",
          };
          console.log("🟡 Attempting Overtime API:", overtimeData);
          const overtimeResponse = await attendanceService.updateOvertime(
            employeeCode,
            overtimeData
          );
          console.log("✅ Overtime Success:", overtimeResponse.data);
          successCount++;
          showToast("Overtime updated successfully!", "success");
        } catch (error) {
          console.error(
            "❌ Overtime Failed:",
            error.response?.data || error.message
          );
        }
      }

      // --- 3) If only clock_out provided (but not early or overtime), update via overtime endpoint as fallback ---
      if (hasClockOut && !isEarlyLeaving && !hasOvertime) {
        try {
          const clockOutData = {
            date: currentRecord.date,
            clock_out: clock_out,
            reason: currentRecord.reason || "Updated via attendance edit",
          };
          console.log(
            "🟡 Attempting Clock Out via Overtime API:",
            clockOutData
          );
          await attendanceService.updateOvertime(employeeCode, clockOutData);
          showToast("Clock-out time updated successfully!", "success");
          successCount++;
        } catch (error) {
          console.error(
            "❌ Clock Out Update Failed:",
            error.response?.data || error.message
          );
        }
      }

      // final success handling
      if (successCount > 0) {
        setIsClosing(true);
        setTimeout(() => {
          setShowModal(false);
          setIsClosing(false);
          loadAttendance();
        }, 700);
      } else {
        throw new Error("All update operations failed");
      }
    } catch (error) {
      console.error("Update failed:", error);
      let errorMessage = "Failed to update attendance!";

      if (error.response?.status === 404) {
        errorMessage =
          "Attendance record not found. Please refresh and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid data provided.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // FIXED: Enhanced formatEarlyLeaving function
  const formatEarlyLeaving = (timeString) => {
    console.log("🔍 formatEarlyLeaving input:", timeString); // Debug log

    if (!timeString || timeString === "00:00:00" || timeString === "00:00") {
      return "-";
    }

    // Handle both formats: "HH:MM:SS" and "YYYY-MM-DD HH:MM:SS"
    let timePart = timeString;
    if (timeString.includes(" ")) {
      timePart = timeString.split(" ")[1];
    }

    // Remove seconds if present
    const timeWithoutSeconds = timePart.split(":").slice(0, 2).join(":");
    const [hours, minutes] = timeWithoutSeconds.split(":");

    // Show only if there's actual early leaving time
    if (hours === "00" && minutes === "00") return "-";

    const formattedTime = `${hours}h:${minutes}m`;
    console.log("✅ formatEarlyLeaving output:", formattedTime); // Debug log
    return formattedTime;
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "00:00:00") return "-";
    if (timeString.includes(" ")) {
      const timePart = timeString.split(" ")[1];
      return timePart.slice(0, 5);
    }
    return timeString.slice(0, 5);
  };

  const formatOvertime = (timeString) => {
    if (!timeString || timeString === "00:00:00") return "-";

    if (timeString.includes(" ")) {
      const timePart = timeString.split(" ")[1];
      const [hours, minutes] = timePart.split(":");
      return `${hours}h:${minutes}m`;
    }

    const [hours, minutes] = timeString.split(":");
    return `${hours}h:${minutes}m`;
  };

  const formatShiftTime = (timeString) => {
    if (!timeString) return "-";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  const getEmployeeDetails = (attendanceRecord) => {
    if (attendanceRecord.employee) {
      const employee = attendanceRecord.employee;
      const employeeType = getEmployeeType(employee.id);

      return {
        name: employee.name || "Unknown",
        employee_id: employee.employee_id || "N/A",
        employee_type: employeeType,
        branch_name: getBranchName(employee.branch_id),
        department_name: getDepartmentName(employee.department_id),
      };
    }

    const employee = employees.find(
      (emp) => emp.id === attendanceRecord.employee_id
    );
    if (employee) {
      const employeeType = getEmployeeType(employee.id);

      return {
        name: employee.name || "Unknown",
        employee_id: employee.employee_id || "N/A",
        employee_type: employeeType,
        branch_name: getBranchName(employee.branch_id),
        department_name: getDepartmentName(employee.department_id),
      };
    }

    return {
      name: "Unknown",
      employee_id: "N/A",
      employee_type: "Not Set",
      branch_name: "Unknown Branch",
      department_name: "Unknown Department",
    };
  };

  const getEmployeeName = (employeeId) => {
    const attendanceRecord = attendanceData.find(
      (item) => item.employee_id === employeeId
    );
    if (attendanceRecord?.employee?.name) {
      return attendanceRecord.employee.name;
    }
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "Unknown";
  };

  const generateTimeOptions = (type, min = null, max = null) => {
    const options = [];

    if (type === "hours") {
      for (let i = 0; i <= 23; i++) {
        const value = i.toString().padStart(2, "0");
        options.push(
          <option key={value} value={value}>
            {value}
          </option>
        );
      }
    } else {
      for (let i = 0; i <= 59; i++) {
        const value = i.toString().padStart(2, "0");
        options.push(
          <option key={value} value={value}>
            {value}
          </option>
        );
      }
    }

    return options;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "success";
      case "Absent":
        return "danger";
      case "Late":
        return "warning";
      case "Half Day":
        return "info";
      case "On Leave":
        return "secondary";
      default:
        return "light";
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatPeriodDisplay = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return "No records";
    }

    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const startDate = new Date(sortedRecords[0].date);
    const endDate = new Date(sortedRecords[sortedRecords.length - 1].date);

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

  // Check if employee can clock in (no attendance record for today)
  const canClockIn = (employeeId, employeeCode) => {
    const today = new Date().toISOString().slice(0, 10);
    const hasAttendanceToday = attendanceData.some(
      (item) =>
        (item.employee_id === employeeId ||
          item.employee?.employee_id === employeeCode) &&
        item.date === today
    );
    return !hasAttendanceToday;
  };

  // Check if employee can clock out (has clocked in but not clocked out)
  const canClockOut = (attendanceRecord) => {
    return (
      attendanceRecord.status === "Present" &&
      attendanceRecord.clock_in &&
      attendanceRecord.clock_in !== "00:00:00" &&
      (!attendanceRecord.clock_out || attendanceRecord.clock_out === "00:00:00")
    );
  };

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }

        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .custom-slide-modal.open .modal-dialog {
          animation: slideInUp 0.7s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.7s ease forwards;
        }

        .btn-pink {
          background-color: #f5365c;
          color: #fff;
          border: none;
        }
        .btn-pink:hover {
          background-color: #e43156;
          color: #fff;
        }
        .btn-pink:active,
        .btn-pink:focus {
          background-color: #f5365c !important;
          box-shadow: none !important;
        }

        .btn-brown {
          background-color: #563d7c;
          color: #fff;
          border: none;
        }
        .btn-brown:hover {
          background-color: #4a366c;
          color: #fff;
        }

        .btn-clock-in {
          background-color: #28a745;
          color: #fff;
          border: none;
        }
        .btn-clock-in:hover {
          background-color: #218838;
          color: #fff;
        }

        .btn-clock-out {
          background-color: #17a2b8;
          color: #fff;
          border: none;
        }
        .btn-clock-out:hover {
          background-color: #138496;
          color: #fff;
        }

        .square-btn {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 16px;
          border-radius: 6px;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
        }

        .employee-type-badge {
          font-size: 0.75em;
          padding: 0.25em 0.5em;
        }

        .time-select-group {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .time-select-group select {
          flex: 1;
        }
        .time-separator {
          font-weight: bold;
          color: #666;
        }
        .reason-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shift-info {
          font-size: 0.8em;
          color: #666;
        }

        .employee-name-clickable {
          cursor: pointer;
          color: #007bff;
          text-decoration: none;
          transition: color 0.2s;
        }
        .employee-name-clickable:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-top: 15px;
        }

        .calendar-day {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          min-height: 140px;
          background: white;
          transition: all 0.2s ease;
          position: relative;
        }

        .calendar-day:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .calendar-day.weekend {
          background-color: #f8f9fa;
        }

        .calendar-day.absent-day {
          background-color: #fff5f5;
          border-color: #e55353;
        }

        .calendar-day-header {
          font-weight: 600;
          font-size: 0.8em;
          margin-bottom: 4px;
          color: #495057;
        }

        .calendar-day-number {
          font-size: 1.1em;
          font-weight: bold;
          margin-bottom: 4px;
          color: #2c3e50;
        }

        .calendar-status {
          font-size: 0.7em;
          padding: 3px 8px;
          border-radius: 12px;
          margin-bottom: 5px;
        }

        .calendar-day .small {
          font-size: 0.7em;
          line-height: 1.2;
        }

        .calendar-day .text-success {
          color: #28a745 !important;
        }

        .calendar-day .text-warning {
          color: #ffc107 !important;
        }

        .calendar-day .text-info {
          color: #17a2b8 !important;
        }

        .calendar-day .text-primary {
          color: #007bff !important;
        }

        .calendar-day .text-muted {
          color: #6c757d !important;
        }

        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .summary-card .card-body {
          padding: 1rem;
        }

        .time-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 2px;
        }

        .attendance-summary-card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>

      <h4 className="fw-semibold">Manage Attendance List</h4>
      <BreadCrumb pathname={location.pathname} onNavigate={navigate} />

      {/* Filters Section */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="row align-items-end g-3">
          <div className="col-md-2">
            <label className="form-label fw-bold d-block mb-2">Type</label>
            <div className="d-flex rounded-pill bg-light p-1 gap-1">
              <div
                className={`flex-fill text-center py-1 rounded-pill ${
                  filters.type === "Monthly"
                    ? "bg-success text-white fw-semibold"
                    : "text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleTypeChange("Monthly")}
              >
                Monthly
              </div>
              <div
                className={`flex-fill text-center py-1 rounded-pill ${
                  filters.type === "Daily"
                    ? "bg-success text-white fw-semibold"
                    : "text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleTypeChange("Daily")}
              >
                Daily
              </div>
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">
              {filters.type === "Monthly" ? "Month" : "Date"}
            </label>
            {filters.type === "Monthly" ? (
              <input
                type="month"
                className="form-control"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
              />
            ) : (
              <input
                type="date"
                className="form-control"
                name="date"
                value={filters.date || ""}
                onChange={handleFilterChange}
              />
            )}
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Site</label>
            <select
              className="form-select"
              name="branch_id"
              value={filters.branch_id}
              onChange={handleFilterChange}
            >
              <option value="">Select Site</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Department</label>
            <select
              className="form-select"
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
            >
              <option value="">Select Department</option>
              {getFilteredDepartments().map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Employee Type</label>
            <Form.Select
              className="form-select"
              name="employee_type"
              value={filters.employee_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Permanent">Permanent</option>
              <option value="Contractual">Contractual</option>
              <option value="Not Set">Not Set</option>
            </Form.Select>
          </div>

          <div className="col-md-2 d-flex gap-2 justify-content-end">
            <OverlayTrigger placement="top" overlay={<Tooltip>Apply</Tooltip>}>
              <button
                className="btn btn-success square-btn"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>Reset</Tooltip>}>
              <button
                className="btn btn-pink square-btn"
                onClick={handleRefresh}
              >
                <FaSyncAlt />
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </div>

      {/* Combined Entries + Search + Table + Pagination */}
      <div className="bg-white p-3 mb-4 rounded shadow-sm mt-3">
        {/* Entries & Search */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              className=""
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex align-items-center">
            <input
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              name="search"
              placeholder="Search..."
              className="form-control form-control-sm"
              style={{ maxWidth: "200px" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Shift</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Early Leaving</th>
                <th>Overtime</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-3 text-success">
                    <div
                      className="spinner-border spinner-border-sm me-2 "
                      role="status"
                    ></div>
                    Loading attendance data...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-3">
                    No records found.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => {
                  const employee = getEmployeeDetails(item);
                  const employeeId = item.employee_id || item.employee?.id;
                  const employeeCode = employee.employee_id;

                  const canDoClockIn = canClockIn(employeeId, employeeCode);
                  const canDoClockOut = canClockOut(item);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div
                            className="employee-name-clickable fw-semibold"
                            onClick={() =>
                              handleEmployeeClick(
                                employeeId,
                                employeeCode,
                                employee.name
                              )
                            }
                            title="Click to view monthly attendance"
                          >
                            {employee.name} (EMP - {employee.employee_id})
                          </div>
                          <span
                            className={`badge employee-type-badge ${
                              employee.employee_type === "Permanent"
                                ? "bg-primary"
                                : employee.employee_type === "Contractual"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {employee.employee_type}
                          </span>
                          <br />
                        </div>
                      </td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "Present"
                              ? "bg-success"
                              : item.status === "Absent"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.shift ? (
                          <div className="shift-info">
                            <div className="fw-semibold">
                              {item.shift.title}
                            </div>
                            <small>
                              {formatShiftTime(item.shift.start_time)} -{" "}
                              {formatShiftTime(item.shift.end_time)}
                              {item.shift.end_time < item.shift.start_time && (
                                <span className="badge bg-warning text-dark ms-1">
                                  Overnight
                                </span>
                              )}
                            </small>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{formatTime(item.clock_in)}</td>
                      <td>
                        {formatTime(item.clock_out)}
                        {canDoClockOut && (
                          <div className="mt-1">
                            <Badge bg="warning" text="dark" className="small">
                              Pending
                            </Badge>
                          </div>
                        )}
                      </td>
                      {/* FIXED: Early Leaving Cell with Debug Info */}
                      <td>
                        {console.log(
                          `Early leaving for ${employee.name}:`,
                          item.early_leaving
                        )}
                        {formatEarlyLeaving(item.early_leaving)}
                        {item.early_leaving &&
                          item.early_leaving !== "00:00:00" && (
                            <div className="mt-1">
                              <Badge bg="warning" text="dark" className="small">
                                Early
                              </Badge>
                            </div>
                          )}
                      </td>
                      {/* <td>{formatOvertime(item.overtime)} 

                      </td> */}

                      <td>
                        {formatOvertime(item.overtime)}
                        {item.overtime &&
                          item.overtime !== "00:00:00" &&
                          item.overtime !== "00:00" && (
                            <div className="mt-1">
                              <Badge bg="info" className="small">
                                Overtime
                              </Badge>
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          width: "400px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                        className="reason-cell"
                        title={item.reason}
                      >
                        {item.reason || "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {/* Clock In Button */}

                          {/* {canDoClockIn && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Clock In</Tooltip>}
                            >
                              <button
                                className="btn btn-clock-in btn-sm square-btn"
                                onClick={() =>
                                  handleClockAction(
                                    {
                                      id: employeeId,
                                      employee_id: employeeCode,
                                      name: employee.name,
                                    },
                                    "in"
                                  )
                                }
                              >
                                <FaSignInAlt />
                              </button>
                            </OverlayTrigger>
                          )} */}

                          {/* Clock Out Button */}
                          {/* {canDoClockOut && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Clock Out</Tooltip>}
                            >
                              <button
                                className="btn btn-clock-out btn-sm square-btn"
                                onClick={() =>
                                  handleClockAction(
                                    {
                                      id: employeeId,
                                      employee_id: employeeCode,
                                      name: employee.name,
                                    },
                                    "out",
                                    item
                                  )
                                }
                              >
                                <FaSignOutAlt />
                              </button>
                            </OverlayTrigger>
                          )} */}

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn btn-info btn-sm square-btn"
                              onClick={() => handleEdit(item)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <button
                              className="btn btn-danger btn-sm square-btn"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-trash-fill text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

<PaginationDots
  totalPages={totalPages}
  currentPage={currentPage}
  onPageChange={handlePageChange}
/>
      </div>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
          bg={toast.bg}
        >
          <Toast.Body className="text-white fw-semibold">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
          padding: 0,
        }}
        contentClassName="p-0"
        size="lg"
      >
        <Form onSubmit={handleModalSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Attendance</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex justify-content-between w-full">
              {/* Employee */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Employee<span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={getEmployeeName(currentRecord.employee_id)}
                  readOnly
                  disabled
                />
              </Form.Group>

              {/* Date */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Date<span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={currentRecord.date || ""}
                  onChange={handleModalChange}
                  required
                  disabled
                />
              </Form.Group>

              {/* Status */}
              <Form.Group className="mb-3" style={{ width: "200px" }}>
                <Form.Label>
                  Status<span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="status"
                  value={currentRecord.status || ""}
                  onChange={handleModalChange}
                  required
                  disabled
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="d-flex justify-content-between">
              <Form.Group className="mb-3 w-full" style={{ width: "300px" }}>
                <Form.Label>Clock In</Form.Label>
                <div className="time-select-group  d-flex align-items-center gap-2 justify-content-center">
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Hour
                    </Form.Text>
                    <Form.Select
                      name="clock_in_hours"
                      value={currentRecord.clock_in_hours}
                      onChange={handleModalChange}
                      disabled={true}
                    >
                      {generateTimeOptions("hours")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Minute
                    </Form.Text>
                    <Form.Select
                      name="clock_in_minutes"
                      value={currentRecord.clock_in_minutes}
                      onChange={handleModalChange}
                      disabled={true}
                    >
                      {generateTimeOptions("minutes")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Second
                    </Form.Text>

                    <Form.Select
                      name="clock_in_seconds"
                      value={currentRecord.clock_in_seconds}
                      onChange={handleModalChange}
                      disabled={true}
                    >
                      {generateTimeOptions("seconds")}
                    </Form.Select>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-3" style={{ width: "300px" }}>
                <Form.Label>Clock Out</Form.Label>
                <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Hour
                    </Form.Text>
                    <Form.Select
                      name="clock_out_hours"
                      value={currentRecord.clock_out_hours}
                      onChange={handleModalChange}
                    >
                      {generateTimeOptions("hours")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Minute
                    </Form.Text>
                    <Form.Select
                      name="clock_out_minutes"
                      value={currentRecord.clock_out_minutes}
                      onChange={handleModalChange}
                    >
                      {generateTimeOptions("minutes")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Second
                    </Form.Text>
                    <Form.Select
                      name="clock_out_seconds"
                      value={currentRecord.clock_out_seconds}
                      onChange={handleModalChange}
                    >
                      {generateTimeOptions("seconds")}
                    </Form.Select>
                  </div>
                </div>
              </Form.Group>
            </div>
            <div className="d-flex w-full justify-content-between">
              <Form.Group className="mb-3" style={{ width: "300px" }}>
                <Form.Label>Early Leaving</Form.Label>
                <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Hour
                    </Form.Text>
                    <Form.Select
                      name="early_leaving_hours"
                      value={currentRecord.early_leaving_hours}
                      onChange={handleModalChange}
                      disabled={true}
                    >
                      {generateTimeOptions("hours")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Minute
                    </Form.Text>
                    <Form.Select
                      name="early_leaving_minutes"
                      value={currentRecord.early_leaving_minutes}
                      onChange={handleModalChange}
                      disabled={true}
                    >
                      {generateTimeOptions("minutes")}
                    </Form.Select>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-3" style={{ width: "300px" }}>
                <Form.Label>Overtime</Form.Label>
                <div className="time-select-group d-flex align-items-center gap-2 justify-content-center">
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Hour
                    </Form.Text>
                    <Form.Select
                      name="overtime_hours"
                      value={currentRecord.overtime_hours}
                      onChange={handleModalChange}
                      // disabled={hasEarlyLeaving()}
                      disabled={true}
                    >
                      {generateTimeOptions("hours")}
                    </Form.Select>
                  </div>
                  <span className="time-separator mt-4">:</span>
                  <div className="d-flex flex-column w-100">
                    <Form.Text className="text-muted d-block text-center">
                      Minute
                    </Form.Text>
                    <Form.Select
                      name="overtime_minutes"
                      value={currentRecord.overtime_minutes}
                      onChange={handleModalChange}
                      // disabled={hasEarlyLeaving()}
                      disabled={true}
                    >
                      {generateTimeOptions("minutes")}
                    </Form.Select>
                  </div>
                </div>
              </Form.Group>
            </div>
            <Form.Group className="">
              <Form.Label className="required-field">
                Reason<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={currentRecord.reason || ""}
                onChange={handleModalChange}
                placeholder="Enter reason for attendance modification..."
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a reason for the attendance modification.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                    aria-hidden="true"
                  />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Clock In/Out Modal */}
      <Modal show={showClockModal} onHide={handleCloseClockModal} centered>
        <Form onSubmit={handleClockSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {clockAction === "in" ? <FaSignInAlt /> : <FaSignOutAlt />}
              {clockAction === "in" ? " Clock In" : " Clock Out"} Employee
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {clockEmployee && (
              <div className="mb-3">
                <p>
                  <strong>Employee:</strong> {clockEmployee.name}
                </p>
                <p>
                  <strong>Employee ID:</strong> {clockEmployee.employee_id}
                </p>
                {clockAction === "out" && clockEmployee.shiftInfo && (
                  <div className="alert alert-info py-2">
                    <small>
                      <strong>Shift:</strong> {clockEmployee.shiftInfo.title}{" "}
                      <br />
                      <strong>Time:</strong>{" "}
                      {clockEmployee.shiftInfo.start_time} -{" "}
                      {clockEmployee.shiftInfo.end_time}
                      {clockEmployee.shiftInfo.end_time <
                        clockEmployee.shiftInfo.start_time && (
                        <span className="badge bg-warning text-dark ms-2">
                          Overnight Shift
                        </span>
                      )}
                    </small>
                  </div>
                )}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {clockAction === "in" ? "Clock In" : "Clock Out"} Timestamp{" "}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="datetime-local"
                value={clockTimestamp}
                onChange={(e) => setClockTimestamp(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Select the date and time for{" "}
                {clockAction === "in" ? "clock in" : "clock out"}
                {clockAction === "out" && clockEmployee?.shiftInfo && (
                  <div className="mt-2 p-2 bg-light rounded small">
                    <strong>Clock-out Rules:</strong>
                    <br />• Before shift end:{" "}
                    <span className="text-warning">Early Leaving</span>
                    <br />• After shift end:{" "}
                    <span className="text-success">Overtime</span>
                    <br />• Shift ends at:{" "}
                    <strong>{clockEmployee.shiftInfo.end_time}</strong>
                    {clockEmployee.shiftInfo.end_time <
                      clockEmployee.shiftInfo.start_time && (
                      <div className="text-warning mt-1">
                        ⚠️ Overnight Shift: Ends next day at{" "}
                        {clockEmployee.shiftInfo.end_time}
                      </div>
                    )}
                  </div>
                )}
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseClockModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={clockAction === "in" ? "success" : "primary"}
              disabled={clockSubmitting}
            >
              {clockSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                    aria-hidden="true"
                  />
                  Processing...
                </>
              ) : (
                <>
                  {clockAction === "in" ? <FaSignInAlt /> : <FaSignOutAlt />}
                  {clockAction === "in" ? " Clock In" : " Clock Out"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Employee Attendance Modal */}
      <Modal
        show={showEmployeeAttendanceModal}
        onHide={handleCloseEmployeeAttendanceModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="align-items-center">
          <Container fluid>
            <Row className="align-items-center w-100">
              <Col md={9}>
                <Modal.Title>
                  <FaUser className="me-2" />
                  {selectedEmployee?.name} - Monthly Attendance
                </Modal.Title>
              </Col>

              <Col md={3}>
                <Card className="attendance-summary-card bg-light mb-0">
                  <Card.Body className="text-center py-2">
                    <h6 className="mb-1 text-dark">Month</h6>
                    <small className="text-muted">
                      {formatPeriodDisplay(employeeAttendance)}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Modal.Header>

        <Modal.Body>
          {employeeAttendanceLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading attendance data...</p>
            </div>
          ) : employeeAttendance.length === 0 ? (
            <div className="text-center py-4">
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <p>No attendance records found for this employee.</p>
            </div>
          ) : (
            <>
              <Row className="">
                <Col md={4}>
                  <Card className="summary-card">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1 text-white fs-2">
                        {employeeAttendance.length}
                      </h5>
                      <small>Total Records</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="attendance-summary-card bg-danger text-white">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1 text-white fs-2">
                        {
                          employeeAttendance.filter(
                            (record) => record.status === "Absent"
                          ).length
                        }
                      </h5>
                      <small>Total Absent</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="attendance-summary-card bg-success text-white">
                    <Card.Body className="text-center py-3">
                      <h5 className="mb-1 text-white fs-2">
                        {
                          employeeAttendance.filter(
                            (record) => record.status === "Present"
                          ).length
                        }
                      </h5>
                      <small>Present Days</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              {/* Enhanced Calendar Grid */}
              <Row className="mt-4 g-3">
  {employeeAttendance.map((record) => {
    const date = new Date(record.date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const clockInTime = formatTime(record.clock_in);
    const earlyLeavingTime = formatEarlyLeaving(record.early_leaving);
    const overtimeTime = formatOvertime(record.overtime);
    const shiftName = record.shift?.title || "-";
    const shiftTime = record.shift
      ? `${formatShiftTime(record.shift.start_time)}-${formatShiftTime(
          record.shift.end_time
        )}`
      : "";

    return (
      <Col md={2} key={record.date}>
        <Card
          className={`calendar-day h-100 shadow-sm ${
            isWeekend ? "weekend" : ""
          } ${record.status === "Absent" ? "border-danger" : ""}`}
        >
          <Card.Body className="p-2">

            <div className="fw-bold">
              {formatDisplayDate(record.date)}
            </div>

            <div className="small text-muted">
              {getDayName(record.date)}
            </div>

            <Badge
              bg={getStatusBadge(record.status)}
              className="mt-1 mb-1"
            >
              {record.status}
            </Badge>

            {shiftName !== "-" && (
              <div className="small text-primary fw-semibold">
                {shiftName}
              </div>
            )}

            {shiftTime && (
              <div className="small text-muted">
                {shiftTime}
              </div>
            )}

            {clockInTime !== "-" && (
              <div className="small text-success mt-1">
                <FaClock size={10} /> In: {clockInTime}
              </div>
            )}

            {earlyLeavingTime !== "-" && (
              <div className="small text-warning mt-1">
                <FaSignOutAlt size={10} /> Early: {earlyLeavingTime}
              </div>
            )}

            {overtimeTime !== "-" && (
              <div className="small text-info mt-1">
                <FaBusinessTime size={10} /> OT: {overtimeTime}
              </div>
            )}

          </Card.Body>
        </Card>
      </Col>
    );
  })}
</Row>

            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseEmployeeAttendanceModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceList;
