
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table, Modal, Spinner, } from "react-bootstrap";
import salaryService from "../../../../services/salaryService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import PayslipModal from "./PayslipModal";
import OTPayslipModal from "./otpayslipModal";
import OTpayslip from "./OTpayslip";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../../../components/BreadCrumb";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./payslip.css";
import PaginationDots from "../../../../components/Pagination";
import ExcelPreviewModal from "./PreviewModal";
import ConfirmDeleteModal from "../../../../components/ConfirmDeleteModal";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

const PayslipPage = () => {
  const navigate = useNavigate();

  // Get current month and year
  const getCurrentMonth = () => {
    const date = new Date();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return monthNames[date.getMonth()];
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  // Set default to current month/year
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [payslipSummary, setPayslipSummary] = useState(null);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [monthYearLoading, setMonthYearLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [excelGenerating, setExcelGenerating] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [otCurrentPage, setOTCurrentPage] = useState(1);
  const [viewPayslipModal, setViewPayslipModal] = useState(false);
  const [viewOTPayslipModal, setViewOTPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [bulkPaymentLoading, setBulkPaymentLoading] = useState(false);
  const [refreshOTTrigger, setRefreshOTTrigger] = useState(false);

  let [progress, setProgress] = useState(0);
  let [openGenreratePlayslip, setOpenGenreratePlayslip] = useState(false);

  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewPDFUrl, setPreviewPDFUrl] = useState("");
  const [hasPayslipsForCurrentMonth, setHasPayslipsForCurrentMonth] = useState(false);
  const [hasOTPayslipsForCurrentMonth, setHasOTPayslipsForCurrentMonth] = useState(false);
  const [otGenerationLoading, setOTGenerationLoading] = useState(false);
  const [filteredOTCount, setFilteredOTCount] = useState(0);


  const [filterType, setFilterType] = useState('gross'); // 'gross' or 'ot'

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  const years = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  const monthNumber = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };

  const fetchPayslips = async (targetMonth = null, targetYear = null, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setMonthYearLoading(true);
      }

      const currentMonth = targetMonth || month;
      const currentYear = targetYear || year;
      const selectedMonth = monthNumber[currentMonth];
      const salary_month = `${currentYear}-${selectedMonth}`;

      console.log("🔄 Fetching payslips for:", {
        currentMonth,
        currentYear,
        salary_month,
      });

      const res = await salaryService.getPayslips(1, 1000, salary_month);

      if (res.success) {
        setPayslipSummary(res.summary || null);
        if (res.data && res.data.length > 0) {
          setHasPayslipsForCurrentMonth(true);

          const formattedData = res.data.map((p) => {
            const employeeDetails = p.employee || {};
            const additionalDetails = p.employee_additional_details || {};

            // ✅ FINAL SAFE FALLBACK LOGIC
            const branchName = p.employee?.branch?.name || "-";

            const departmentName = p.employee?.department?.name || "-";

            const designationName = p.employee?.designation?.name || "-";

            const employeeId = p.employee_id || "N/A";

            return {
              ...p,

              id: employeeId ? `#EMP${String(employeeId).padStart(5, "0")}` : "N/A",
              rawId: employeeId,

              name: p.employee?.name || "N/A",
              position: designationName,
              joining_date: p.employee?.company_doj || null,
              salaryDate: p.salary_month,
              payrollType: "Monthly",

              // formatted values for table
              salary: Number(p.fixed_gross_per_month || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),

              netSalary: Number(p.salary || 0).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),

              // IMPORTANT: raw values for modal
              fixed_gross_per_month: p.fixed_gross_per_month || 0,
              salary_value: p.salary || 0,
              per_day_payment: p.per_day_payment || 0,
              attendance: p.attendance || 0,
              nh: p.nh || 0,
              total: p.total || 0,

              status: p.status === "paid" ? "Paid" : "Unpaid",
              salarySlip: p.payslip_no || "-",

              branch: branchName,
              department: departmentName,
              createdAt: p.created_at,

              company_doj: p.employee?.company_doj || null
            };
          });

          const sortedData = formattedData.sort((a, b) => {
            const idA = a.rawId || 0;
            const idB = b.rawId || 0;
            return idA - idB;
          });

          setAllEmployees(sortedData);
          setEmployees(sortedData);

          console.log(`✅ Loaded ${sortedData.length} payslips for ${currentMonth} ${currentYear}`);
        } else {
          setHasPayslipsForCurrentMonth(false);
          setAllEmployees([]);
          setEmployees([]);
          console.log(`❌ No payslips found for ${currentMonth} ${currentYear}`);
        }
      }
    } catch (err) {
      console.error("Error fetching payslips:", err);
      setHasPayslipsForCurrentMonth(false);
      toast.error("Failed to fetch payslips");
    } finally {
      setInitialLoading(false);
      setMonthYearLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips(month, year, true);
  }, []);

  useEffect(() => {
    if (month && year && !initialLoading) {
      console.log(`🔄 Auto-checking payslips for ${month} ${year}`);
      fetchPayslips(month, year, false);
    }
  }, [month, year]);

  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, search, entries]);

  const handleGeneratePayslip = async () => {
    setGenerationLoading(true);

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    console.log("🔍 Debug Generate Payslip:", {
      currentMonth: month,
      selectedMonth: selectedMonth,
      year: year,
      selectedDate: selectedDate,
    });

    if (!selectedMonth) {
      toast.error(`Invalid month selected: ${month}. Please select a valid month.`);
      setGenerationLoading(false);
      return;
    }

    // Change this to use query parameters
    const params = {
      month: selectedMonth,
      year: year,
    };

    console.log("📦 Sending params to backend:", params);

    try {
      // Make sure your salaryService sends these as query params
      const res = await salaryService.bulkGeneratePayslips(params);

      if (res.success) {
        const summary = res.summary || {};
        toast(
          <div>
            <strong>Payslip Generation Completed</strong>
            <br />
            <small>Generated {res.total_generated || 0} payslips</small>
          </div>,
          { position: "top-right", autoClose: 6000 }
        );

        await fetchPayslips(month, year, false);
        closeModal();
      } else {
        toast.error(res.message || "Failed to generate payslip", {
          position: "top-right",
        });
      }
    } catch (err) {
      console.error("Payslip generation error:", err);
      toast.error(
        <div>
          <strong>Generation Failed</strong>
          <br />
          <small>
            {err.response?.data?.message ||
              err.response?.data?.error ||
              "Something went wrong while generating payslips"}
          </small>
        </div>,
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      setGenerationLoading(false);
    }
  };




  const handleGenerateOTPayslip = async () => {
    setOTGenerationLoading(true);

    const selectedMonth = monthNumber[month];

    if (!selectedMonth) {
      toast.error(`Invalid month selected: ${month}. Please select a valid month.`);
      setOTGenerationLoading(false);
      return;
    }

    try {
      const res = await salaryService.bulkGenerateOTPayslips({
        month: selectedMonth,
        year: year,
      });

      // Case 1: Successfully generated new payslips
      if (res.success === true) {
        toast.success(
          <div>
            <strong>✅ OT Payslip Generation Completed</strong>
            <br />
            <small>Generated {res.total_generated || 0} OT payslips</small>
          </div>,
          { autoClose: 6000 }
        );

        setHasOTPayslipsForCurrentMonth(true);
        setRefreshOTTrigger(prev => !prev);
        closeModal();
      }
      // Case 2: Payslips already exist (this is NOT an error!)
      else if (res.message === "OT salary payslips already generated for this month") {
        toast.info(
          <div>
            <strong>ℹ️ OT Payslips Already Exist</strong>
            <br />
            <small>Payslips for {month} {year} have already been generated</small>
          </div>,
          { autoClose: 4000 }
        );

        // Still set the state to show they exist and refresh data
        setHasOTPayslipsForCurrentMonth(true);
        setRefreshOTTrigger(prev => !prev);
        closeModal();
      }
      // Case 3: Other errors
      else {
        toast.error(res.message || "Failed to generate OT payslip");
      }
    } catch (err) {
      // Handle case where error response contains the "already generated" message
      if (err.response?.data?.message === "OT salary payslips already generated for this month") {
        toast.info(
          <div>
            <strong>ℹ️ OT Payslips Already Exist</strong>
            <br />
            <small>Payslips for {month} {year} have already been generated</small>
          </div>,
          { autoClose: 4000 }
        );

        setHasOTPayslipsForCurrentMonth(true);
        setRefreshOTTrigger(prev => !prev);
        closeModal();
      } else {
        console.error("OT Payslip generation error:", err);
        toast.error(
          <div>
            <strong>Generation Failed</strong>
            <br />
            <small>{err.response?.data?.message || "Something went wrong"}</small>
          </div>,
          { autoClose: 5000 }
        );
      }
    } finally {
      setOTGenerationLoading(false);
    }
  };

  const isEmployeeEligibleForMonth = (
    employee,
    selectedMonth,
    selectedYear
  ) => {
    if (!employee.company_doj && !employee.joining_date) {
      return true;
    }

    const joinDate = new Date(employee.company_doj || employee.joining_date);
    const payslipMonthEnd = new Date(selectedYear, selectedMonth, 0);

    return joinDate <= payslipMonthEnd;
  };

  const handleBulkPayment = async () => {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const unpaidPayslips = filteredEmployees.filter(
      (emp) => emp.status === "Unpaid" || emp.status === "unpaid"
    );

    if (unpaidPayslips.length === 0) {
      toast.info(
        <div>
          <strong>No Unpaid Payslips</strong>
          <br />
          <small>
            All payslips for {month} {year} are already paid.
          </small>
        </div>,
        { icon: false }
      );
      return;
    }

    const totalAmount = Number(payslipSummary?.total_gross_salary || 0);

    ConfirmDeleteModal({
      onConfirm: async () => {
        await processBulkPayment();
      },
      title: "Process Bulk Payment?",
      message: (
        <div className="my-3 p-3 bg-light rounded">
          <p className="mb-1">
            <strong>Period:</strong> {month} {year}
          </p>
          <p className="mb-1">
            <strong>Payslips to pay:</strong> {unpaidPayslips.length}
          </p>
          {/* <p className="mb-0">
          <strong>Total Amount:</strong> ₹
          {totalAmount.toLocaleString("en-IN")}
        </p> */}
          <p className="mt-3 mb-0">This will mark all unpaid payslips as paid. Continue?</p>
        </div>
      ),
      iconColor: "#28a745",
      singleButton: false,
    });

    const processBulkPayment = async () => {
      try {
        setBulkPaymentLoading(true);

        // You don't need to send payment_data anymore since backend doesn't use it
        // Just pass the salary_month to trigger the API
        const res = await salaryService.bulkPayment(`${year}-${selectedMonth}`);

        if (res.success) {
          toast.success(
            <div>
              <strong>✅ Payment Processed Successfully</strong>
              <br />
              <small>{res.message}</small>
              {res.data && (
                <>
                  <br />
                  <small>
                    <strong>Paid Amount:</strong> ₹
                    {res.data.total_gross_paid_amount?.toLocaleString("en-IN")}
                  </small>
                  <br />
                  <small>
                    <strong>Employees Paid:</strong> {res.data.total_paid_employees} / {res.data.total_employees}
                  </small>
                </>
              )}
            </div>,
            { autoClose: 6000 }
          );

          // Refresh the payslips to show updated status
          await fetchPayslips(month, year, false);
        } else {
          throw new Error(res.message || "Payment failed");
        }
      } catch (error) {
        console.error("Bulk payment error:", error);

        let errorMessage = "Please try again";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(
          <div>
            <strong>❌ Payment Failed</strong>
            <br />
            <small>{errorMessage}</small>
          </div>,
          { autoClose: 5000 }
        );
      } finally {
        setBulkPaymentLoading(false);
      }
    };
  };


  const handleOTBulkPayment = async () => {
    const selectedMonth = monthNumber[month];
    const salaryMonth = `${year}-${selectedMonth}`;

    ConfirmDeleteModal({
      onConfirm: async () => {
        try {
          setBulkPaymentLoading(true);
          const res = await salaryService.bulkOTPayment(salaryMonth);

          if (res.success) {
            toast.success(
              <div>
                <strong>✅ OT Payment Processed Successfully</strong>
                <br />
                <small>{res.message}</small>
                {res.summary && (
                  <>
                    <br />
                    <small>
                      <strong>Paid:</strong> {res.summary.total_paid_employees} employees
                    </small>
                    <br />
                    <small>
                      <strong>Amount:</strong> ₹{res.summary.final_total_ot_amount?.toLocaleString('en-IN')}
                    </small>
                  </>
                )}
              </div>,
              { autoClose: 6000 }
            );

            // Force a refresh of the OT data by toggling the key
            setRefreshOTTrigger(prev => !prev);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment failed");
        } finally {
          setBulkPaymentLoading(false);
        }
      },
      title: "Process Bulk OT Payment?",
      message: (
        <div className="my-3 p-3 bg-light rounded">
          <p className="mb-1">
            <strong>Period:</strong> {month} {year}
          </p>
          <p className="mb-1">
            <strong>Payment Type:</strong> Overtime (OT)
          </p>
          <p className="mt-3 mb-0">This will mark all unpaid OT payslips as paid. Continue?</p>
        </div>
      ),
      iconColor: "#ffc107",
      singleButton: false,
    });
  };
  const filteredEmployees = React.useMemo(() => {
    if (!month) return [];

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    console.log("🔍 Filtering for:", selectedDate);
    console.log("🔍 All employees count:", allEmployees.length);

    const monthFiltered = allEmployees.filter((emp) => {
      const hasExactSalaryDate =
        emp.salaryDate && emp.salaryDate.startsWith(selectedDate);
      const hasExactCreatedAt =
        emp.createdAt && emp.createdAt.startsWith(selectedDate);

      return hasExactSalaryDate || hasExactCreatedAt;
    });

    console.log(
      `📊 Found ${monthFiltered.length} payslips for ${month} ${year}`
    );

    if (monthFiltered.length === 0) {
      return [];
    }

    const searchFiltered = monthFiltered.filter(
      (emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase())
    );

    const sortedFiltered = searchFiltered.sort((a, b) => {
      const idA = a.rawId || 0;
      const idB = b.rawId || 0;
      return idA - idB;
    });

    return sortedFiltered;
  }, [allEmployees, month, year, search]);

  const previewExcel = () => {
    if (!hasPayslipsForCurrentMonth) {
      toast.info(`No payslip data for ${month} ${year}`);
      return;
    }

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate?.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    if (monthEmployees.length === 0) {
      toast.info(`No payslip data for ${month} ${year}`);
      return;
    }

    // Use the SAME logic as generateExcel to ensure consistency
    const extractNumericValue = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const num = parseFloat(value.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };
    const rows = monthEmployees.map((emp) => {
      // Get data directly from API response structure
      const employeeDetails = emp.employee_details || {};
      const additionalDetails = emp.employee_additional_details || {};
      const attendance = additionalDetails.attendance || {};

      // Get date of joining - check all possible locations
      let dateOfJoining = "";
      if (employeeDetails.company_doj_display) {
        dateOfJoining = employeeDetails.company_doj_display;
      } else if (employeeDetails.company_doj) {
        dateOfJoining = formatDate(employeeDetails.company_doj);
      } else if (additionalDetails.employee_basic?.company_doj) {
        dateOfJoining = formatDate(additionalDetails.employee_basic.company_doj);
      } else {
        dateOfJoining = "N/A";
      }

      // Get branch, department, designation names
      const branchName =
        additionalDetails.branch?.name ||
        employeeDetails.branch ||
        "-";

      const departmentName =
        additionalDetails.department?.name ||
        employeeDetails.department ||
        "-";

      const designationName =
        additionalDetails.designation?.name ||
        employeeDetails.designation ||
        "-";

      // Use direct API values
      const basicSalary = Number(emp.basic_salary) || 0;
      const allowance = Number(emp.allowance) || 0;
      const commission = Number(emp.commission) || 0;
      const otherPayment = Number(emp.other_payment) || 0;
      const overtime = Number(emp.overtime) || 0;

      // Calculate gross salary directly from API
      const grossSalary = Number(emp.gross_salary) || 0;

      // Use net_payble from API (note: field name is net_payble, not net_payable)
      const netSalary = Number(emp.net_payble) || 0;

      // Get deduction values from API
      const advancePayment = Number(emp.advance_payment) || 0;
      const esiDeduction = Number(emp.esi_deduction) || 0;
      const loan = Number(emp.loan) || 0;
      const pfDeduction = Number(emp.pf_deduction) || 0;
      const saturationDeduction = Number(emp.saturation_deduction) || 0;


      const earlyLeaving =
        attendance.earlyLeaving ??
        Number(emp.early_leaving) ??
        0;

      // Calculate total deductions
      const totalDeductions =
        advancePayment +
        esiDeduction +
        loan +
        pfDeduction +
        earlyLeaving;
      const noOfDaysPresent = attendance.actualWorkingDays ?? 0;


      return {
        "EMPLOYEE ID": emp.id ? `#EMP${String(emp.rawId || emp.employee_id).padStart(5, "0")}` : "",
        "NAME": employeeDetails.name || "",
        "DESIGNATION": designationName,
        "DEPARTMENT": departmentName,
        "SITE": branchName,
        "PAYROLL TYPE": "Monthly",
        "NO. OF DAYS PRESENT": noOfDaysPresent,
        "BASIC SALARY": basicSalary,
        "ALLOWANCE": allowance,
        "COMMISSION": commission,
        "OTHER PAYMENT": otherPayment,
        "OVERTIME": overtime,
        "ADVANCE PAYMENT": advancePayment,
        "ESI_DEDUCTION": esiDeduction,
        "LOAN": loan,
        "PF_DEDUCTION": pfDeduction,
        "EARLY LEAVING": earlyLeaving,
        // "SATURATION_DEDUCTION": saturationDeduction,
        "TOTAL DEDUCTIONS": totalDeductions,
        "NET SALARY": grossSalary,
        // "NET SALARY": netSalary,
        "STATUS": emp.status === "paid" ? "Paid" : "Unpaid",
        "DATE OF JOINING": dateOfJoining,
        "PAYSLIP MONTH": emp.salary_month_display || `${month} ${year}`,
        // "WORKING DAYS": `${attendance.actualWorkingDays || 0}/${attendance.branchWorkingDays || 0}`,
        "SKILL WAGES": Number(emp.skill_wages) || 0,
      };
    });

    setPreviewData(rows);
    setShowExcelPreview(true);
  };

  const generateExcel = () => {
    setExcelGenerating(true);

    if (!hasPayslipsForCurrentMonth) {
      toast.info(`No payslip data for ${month} ${year}`);
      setExcelGenerating(false);
      return;
    }

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate?.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    if (monthEmployees.length === 0) {
      toast.info(`No payslip data for ${month} ${year}`);
      setExcelGenerating(false);
      return;
    }

    const extractNumericValue = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const num = parseFloat(value.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    const headers = [
      "EMPLOYEE ID",
      "NAME",
      "DESIGNATION",
      "DEPARTMENT",
      "BRANCH",
      "PAYROLL TYPE",
      "NO. OF DAYS PRESENT",
      "BASIC SALARY",
      "ALLOWANCE",
      "COMMISSION",
      "OTHER PAYMENT",
      "OVERTIME",
      "ADVANCE PAYMENT",
      "ESI_DEDUCTION",
      "LOAN",
      "PF_DEDUCTION",
      // "SATURATION_DEDUCTION",
      "GROSS SALARY",
      "NET SALARY",
      "STATUS",
      "DATE OF JOINING",
      "PAYSLIP MONTH",
    ];

    const rows = monthEmployees.map((emp) => {
      let grossSalary = 0;
      let netSalary = 0;

      // Gross Salary
      if (emp.calculation_breakdown?.gross_salary) {
        grossSalary = Number(emp.calculation_breakdown.gross_salary);
      } else {
        grossSalary =
          (Number(emp.basic_salary) || 0) +
          (Number(emp.allowance) || 0) +
          (Number(emp.commission) || 0) +
          (Number(emp.other_payment) || 0) +
          (Number(emp.overtime) || 0);
      }

      // Net Salary
      if (emp.netSalary && typeof emp.netSalary === "string") {
        netSalary = extractNumericValue(emp.netSalary);
      } else if (emp.net_payable !== undefined) {
        netSalary = Number(emp.net_payable);
      } else if (emp.net_payble !== undefined) {
        netSalary = Number(emp.net_payble);
      } else {
        netSalary = grossSalary - (emp.saturation_deduction || 0);
      }

      let dateOfJoining = "";
      if (emp.employee_details?.company_doj_display) {
        dateOfJoining = emp.employee_details.company_doj_display;
      }
      else if (emp.employee_details?.company_doj) {
        dateOfJoining = formatDate(emp.employee_details.company_doj);
      }
      else if (emp.employee_additional_details?.employee_basic?.company_doj) {
        dateOfJoining = formatDate(emp.employee_additional_details.employee_basic.company_doj);
      }
      else if (emp.calculation_breakdown?.employee?.company_doj) {
        dateOfJoining = formatDate(emp.calculation_breakdown.employee.company_doj);
      }
      else if (emp.company_doj) {
        dateOfJoining = formatDate(emp.company_doj);
      } else {
        dateOfJoining = "N/A";
      }
      const noOfDaysPresent =
        emp.employee_additional_details?.attendance?.actualWorkingDays ??
        emp.calculation_breakdown?.attendance?.actualWorkingDays ??
        "N/A";

      return {
        "EMPLOYEE ID": emp.id || "",
        NAME: emp.name || "",
        DESIGNATION: emp.position || "",
        DEPARTMENT: emp.department || "",
        BRANCH: emp.branch || "",
        "PAYROLL TYPE": emp.payrollType || "Monthly",
        "NO. OF DAYS PRESENT": noOfDaysPresent,
        "BASIC SALARY": Number(emp.basic_salary) || 0,
        ALLOWANCE: Number(emp.allowance) || 0,
        COMMISSION: Number(emp.commission) || 0,
        "OTHER PAYMENT": Number(emp.other_payment) || 0,
        OVERTIME: Number(emp.overtime) || 0,
        "ADVANCE PAYMENT": Number(emp.advance_payment) || 0,
        ESI_DEDUCTION: Number(emp.esi_deduction) || 0,
        LOAN: Number(emp.loan) || 0,
        PF_DEDUCTION: Number(emp.pf_deduction) || 0,
        // SATURATION_DEDUCTION: Number(emp.saturation_deduction) || 0,
        "GROSS SALARY": grossSalary,
        // "NET SALARY": netSalary,
        "NET SALARY": grossSalary,
        STATUS: emp.status || "",
        "DATE OF JOINING": dateOfJoining,
        "PAYSLIP MONTH": emp.salaryDate || `${month} ${year}`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: headers,
      skipHeader: false,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Payslips_${month}_${year}`);

    try {
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Payslips_${month}_${year}_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;

      saveAs(data, fileName);
      toast.success(`Excel downloaded: ${fileName}`);
    } catch (error) {
      console.error(error);
      toast.error("Excel generation failed");
    } finally {
      setExcelGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!hasPayslipsForCurrentMonth) {
      toast.info(`No payslip data for ${month} ${year}`);
      return;
    }

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate?.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    if (monthEmployees.length === 0) {
      toast.info(`No payslip data for ${month} ${year}`);
      return;
    }

    setPdfGenerating(true);
    setOpenGenreratePlayslip(true);
    setProgress(0);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const formatNumber = (num) => {
        const formatted = Number(num || 0).toFixed(2);
        return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      const getDeductionsForPDF = (emp) => {
        const deductions = [];

        const deductionMap = [
          { key: "pf_deduction", label: "PF (Provident Fund)" },
          { key: "esi_deduction", label: "ESI (Employee State Insurance)" },
          { key: "early_leaving", label: "Early Leaving Deduction" },
          { key: "advance_payment", label: "Advance Payment" },
          { key: "loan", label: "Loan Deduction" },
          { key: "leave_deduction", label: "Leave Deduction" },
        ];

        deductionMap.forEach(({ key, label }) => {
          const amount = Number(emp[key] || 0);
          if (amount > 0) {
            deductions.push({
              name: label,
              amount,
            });
          }
        });

        return deductions;
      };


      for (let i = 0; i < monthEmployees.length; i++) {
        const emp = monthEmployees[i];

        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        tempContainer.style.width = "210mm";
        tempContainer.style.padding = "20px";
        tempContainer.style.backgroundColor = "#ffffff";
        document.body.appendChild(tempContainer);

        try {
          const deductions = getDeductionsForPDF(emp);

          const deductionRows = deductions
            .map(
              (d) => `
      <tr>
        <td style="padding:6px; border-left:1px solid #000;">
          ${d.name}
        </td>
        <td style="padding:6px; text-align:right;">
          ${formatNumber(d.amount)}
        </td>
      </tr>
    `
            )
            .join("");

          const basicSalary = emp.basic_salary || 0;
          const allowance = emp.allowance || 0;
          const commission = emp.commission || 0;
          const otherPayment = emp.other_payment || 0;
          const overtime = emp.overtime || 0;
          const grossSalary = emp.calculation_breakdown?.gross_salary ||
            Number(basicSalary) + Number(allowance) + Number(commission) +
            Number(otherPayment) + Number(overtime);
          const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

          let netSalary = 0;
          if (emp.netSalary && typeof emp.netSalary === "string") {
            const match = emp.netSalary.match(/[\d,]+\.?\d*/);
            netSalary = match ? Number(match[0].replace(/,/g, "")) : 0;
          } else if (emp.net_payable !== undefined) {
            netSalary = Number(emp.net_payable);
          } else if (emp.net_payble !== undefined) {
            netSalary = Number(emp.net_payble);
          } else {
            netSalary = grossSalary - totalDeductions;
          }

          const amountInWords = (amount) => {
            // Simple conversion
            const num = Math.floor(amount);
            if (num === 0) return "Zero";
            return `${num} only`;
          };


          tempContainer.innerHTML = `
<div style="
  width:760px;
  padding:25px;
  font-family:Arial, sans-serif;
  color:#000;
  border:1px solid #000;
  box-sizing:border-box;
">

  <div style="text-align:center; margin-bottom:10px;">
    <div style="font-size:18px; font-weight:bold;">
      Venkateswar Engineering Works
    </div>
    <div style="font-size:14px;">
      Salary Slip for the Month of ${monthNumber[month]}/${year}
    </div>
  </div>

  <table style="width:100%; font-size:13px; margin-bottom:10px;">
    <tr>
      <td style="width:50%;">
        <strong>Emp ID:</strong> ${emp.id || "N/A"}<br/>
        <strong>Department:</strong> ${emp.department || "N/A"}<br/>
        <strong>Date of Joining:</strong> ${emp.employee_details?.company_doj_display || "N/A"
            }<br/>
        <strong>No. of Present Days:</strong> ${emp.employee_additional_details?.attendance?.actualWorkingDays ?? "N/A"
            }
      </td>
      <td style="width:50%;">
        <strong>Employee Name:</strong> ${emp.name || "N/A"}<br/>
        <strong>Designation:</strong> ${emp.position || "N/A"}<br/>
        <strong>Site:</strong> ${emp.branch || "N/A"}
      </td>
    </tr>
  </table>

  <table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #000;">
    <tr style="font-weight:bold; border-bottom:1px solid #000;">
      <td style="padding:6px; width:35%;">Earnings</td>
      <td style="padding:6px; width:15%; text-align:right;">Amount</td>
      <td style="padding:6px; width:35%; border-left:1px solid #000;">Deductions</td>
      <td style="padding:6px; width:15%; text-align:right;">Amount</td>
    </tr>

    <tr>
      <td style="padding:6px;">Basic</td>
      <td style="padding:6px; text-align:right;">${formatNumber(basicSalary)}</td>
      <td style="padding:0; border-left:1px solid #000;" rowspan="5" colspan="2">
        <table style="width:100%; border-collapse:collapse;">
          ${deductionRows}
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:6px;">Allowance</td>
      <td style="padding:6px; text-align:right;">${formatNumber(allowance)}</td>
    </tr>

    <tr>
      <td style="padding:6px;">Commission</td>
      <td style="padding:6px; text-align:right;">${formatNumber(commission)}</td>
    </tr>

    <tr>
      <td style="padding:6px;">Other Payment</td>
      <td style="padding:6px; text-align:right;">${formatNumber(otherPayment)}</td>
    </tr>

    <tr>
      <td style="padding:6px;">Overtime</td>
      <td style="padding:6px; text-align:right;">${formatNumber(overtime)}</td>
    </tr>

    <tr style="border-top:1px solid #000; font-weight:bold;">
      <td style="padding:6px;">Gross Salary</td>
      <td style="padding:6px; text-align:right;">${formatNumber(grossSalary)}</td>
      <td style="padding:6px; border-left:1px solid #000;">Total Deduction</td>
      <td style="padding:6px; text-align:right;">${formatNumber(totalDeductions)}</td>
    </tr>

    <tr style="font-weight:bold;">
      <td colspan="4" style="padding:6px; border-top:1px solid #000;">
        Net Pay : ${formatNumber(grossSalary)}
      </td>
    </tr>

    <tr>
      <td colspan="4" style="padding:20px 15px 6px 6px; text-align:right;">
        Signature
      </td>
    </tr>
  </table>
</div>
`;



          // Net Pay : ${formatNumber(netSalary)}
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL("image/jpeg", 0.9);

          if (i > 0) pdf.addPage();

          const imgProps = pdf.getImageProperties(imgData);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const slipWidth = 170;
          const slipHeight = (imgProps.height * slipWidth) / imgProps.width;
          const x = (pageWidth - slipWidth) / 2;
          const y = 30;

          pdf.addImage(imgData, "JPEG", x, y, slipWidth, slipHeight);

        } finally {
          document.body.removeChild(tempContainer);
        }

        setProgress(Math.round(((i + 1) / monthEmployees.length) * 100));
      }

      pdf.save(`Employee_Payslips_${month}_${year}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
      setOpenGenreratePlayslip(false);
      setProgress(0);
    }
  };


  function getMonthEmployees() {
    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthEmployees = allEmployees.filter(
      (emp) =>
        emp.salaryDate.startsWith(selectedDate) ||
        (emp.createdAt && emp.createdAt.startsWith(selectedDate))
    );

    return monthEmployees;
  }

  const pageCount = Math.ceil(filteredEmployees.length / entries);
  const otPageCount = Math.ceil(filteredOTCount / entries); // Add this line
  const startIndex = (currentPage - 1) * entries;
  const currentData = filteredEmployees.slice(startIndex, startIndex + entries);

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
                  await salaryService.softDeletePayslip(id);
                  toast.success("Payslip deleted successfully.", {
                    icon: false,
                  });
                  fetchPayslips(month, year, false);
                } catch (err) {
                  console.error("Failed to delete payslip:", err);
                  toast.error("Failed to delete payslip. Please try again.", {
                    icon: false,
                  });
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  return (
    <>
      <style>{`
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
        .preview-table {
          max-height: 400px;
          overflow-y: auto;
        }
        .preview-image {
          max-width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
      <Container fluid className="p-4">
        <h4 className="mb-1">Payslip</h4>
        <p>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </p>

        {/* Generate Payslip */}
        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <Row className="align-items-end justify-content-end">

            {/* NEW FILTER DROPDOWN */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter By</Form.Label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '50px',
                  padding: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div
                    onClick={() => setFilterType('gross')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '50px',
                      background: filterType === 'gross' ? 'var(--bs-success)' : 'transparent',
                      color: filterType === 'gross' ? 'white' : '#6c757d',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: filterType === 'gross' ? '600' : '400',
                      transition: 'all 0.2s ease',
                      boxShadow: filterType === 'gross' ? '0 2px 5px rgba(25, 135, 84, 0.3)' : 'none'
                    }}
                  >
                    Gross Salary
                  </div>
                  <div
                    onClick={() => setFilterType('ot')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '50px',
                      background: filterType === 'ot' ? 'var(--bs-success)' : 'transparent',
                      color: filterType === 'ot' ? 'white' : '#6c757d',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: filterType === 'ot' ? '600' : '400',
                      transition: 'all 0.2s ease',
                      boxShadow: filterType === 'ot' ? '0 2px 5px rgba(25, 135, 84, 0.3)' : 'none'
                    }}
                  >
                    Overtime (OT)
                  </div>
                </div>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Select Month</Form.Label>
                <Form.Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={monthYearLoading}
                >
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Select Year</Form.Label>
                <Form.Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={monthYearLoading}
                >
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              {monthYearLoading ? (
                <div className="mt-3 text-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  {/* Gross Salary Section */}
                  {filterType === 'gross' && (
                    !hasPayslipsForCurrentMonth && !initialLoading ? (
                      <Button
                        className="mt-3 w-100"
                        variant="success"
                        onClick={() => setShowModal(true)}
                        disabled={generationLoading}
                      >
                        {generationLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Payslip"
                        )}
                      </Button>
                    ) : hasPayslipsForCurrentMonth && (
                      <div className="mt-3 text-center">
                        <p className="text-success mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          Payslips ready
                        </p>
                      </div>
                    )
                  )}

                  {/* OT Section */}
                  {filterType === 'ot' && (
                    !hasOTPayslipsForCurrentMonth && !initialLoading ? (
                      <Button
                        className="mt-3 w-100"
                        variant="success"
                        onClick={handleGenerateOTPayslip}
                        disabled={otGenerationLoading}
                      >
                        {otGenerationLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating...
                          </>
                        ) : (
                          "Generate Payslip"
                        )}
                      </Button>
                    ) : hasOTPayslipsForCurrentMonth && (
                      <div className="mt-3 text-center">
                        <p className="text-success mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          OT Payslips ready
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </Col>
          </Row>
        </div>

        {/* Find Employee Payslip */}
        <div className="bg-white p-4 rounded shadow-sm">
          <Row className="align-items-center mb-3">
            <Col>
              <h6 className="fw-bold mb-0">Find Employee Payslip</h6>
              {hasPayslipsForCurrentMonth && (
                <small className="text-muted">
                  Showing payslips for: <strong>{month} {year}</strong>
                </small>
              )}
            </Col>

            {hasPayslipsForCurrentMonth && filteredEmployees.length > 0 && (
              <>
                <Col md="auto">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Export to Excel/PDF</Tooltip>}
                  >
                    <Dropdown as={ButtonGroup}>
                      <Button
                        variant="success"
                        disabled={excelGenerating || pdfGenerating}
                      >
                        {excelGenerating ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating Excel...
                          </>
                        ) : pdfGenerating ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating PDF...
                          </>
                        ) : (
                          "Export"
                        )}
                      </Button>
                      <Dropdown.Toggle
                        split
                        variant="success"
                        id="dropdown-export"
                        disabled={excelGenerating || pdfGenerating}
                      />

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={previewExcel}
                          disabled={excelGenerating}
                        >
                          Preview Excel
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={generateExcel}
                          disabled={excelGenerating}
                        >
                          {excelGenerating ? "Generating..." : "Download Excel"}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={generatePDF}
                          disabled={pdfGenerating}
                        >
                          {pdfGenerating ? "Generating..." : "Download PDF"}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </OverlayTrigger>
                </Col>
                <Col md="auto">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Bulk Payment</Tooltip>}
                  >
                    <Button
                      variant={filterType === 'gross' ? "success" : "success"}
                      onClick={filterType === 'gross' ? handleBulkPayment : handleOTBulkPayment}
                      disabled={bulkPaymentLoading}
                    >
                      {bulkPaymentLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        filterType === 'gross' ? "Bulk Payment" : "Bulk OT Payment"
                      )}
                    </Button>
                  </OverlayTrigger>
                </Col>
              </>
            )}
          </Row>

          {hasPayslipsForCurrentMonth && filteredEmployees.length > 0 && (
            <Row className="mb-2 align-items-center">
              <Col md={2}>
                <Form.Select
                  value={entries}
                  onChange={(e) => setEntries(Number(e.target.value))}
                >
                  <option value={5}>5 entries</option>
                  <option value={10}>10 entries</option>
                  <option value={20}>20 entries</option>
                  <option value={50}>50 entries</option>
                </Form.Select>
              </Col>
              <Col md={{ span: 2, offset: 8 }}>
                <Form.Control
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
            </Row>
          )}

          {initialLoading ? (
            <div className="d-flex justify-content-center align-items-center my-5 py-5">
              <Spinner animation="border" variant="success" size="lg" />
              <span className="ms-3 fs-5">Loading payslip data...</span>
            </div>
          ) : hasPayslipsForCurrentMonth && filteredEmployees.length > 0 ? (
            <>
              {filterType === 'gross' ? (
                /* Gross Salary Table */
                <>
                  <Table hover responsive striped>
                    <thead>
                      <tr>
                        <th>EMPLOYEE ID</th>
                        <th>NAME</th>
                        <th>SITE</th>
                        <th>DEPARTMENT</th>
                        <th>PAYROLL TYPE</th>
                        <th>SALARY</th>
                        <th>NET SALARY</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((emp, idx) => (
                        <tr key={idx}>
                          <td>
                            <Button
                              variant="outline-success"
                              className="px-3 py-1"
                              onClick={() => navigate(`/employees/${emp.rawId}`)}
                            >
                              {emp.id}
                            </Button>
                          </td>
                          <td>{emp.name}</td>
                          <td>{emp.branch}</td>
                          <td>{emp.department}</td>
                          <td>{emp.payrollType}</td>
                          <td>{emp.salary}</td>
                          <td>{emp.netSalary}</td>
                          <td>
                            <Button
                              size="sm"
                              variant={emp.status === "Paid" ? "success" : "warning"}
                            >
                              {emp.status}
                            </Button>
                          </td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>View</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="warning"
                                className="me-2"
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  setViewPayslipModal(true);
                                }}
                              >
                                <i className="bi bi-file-earmark-text"></i>
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(emp.employee_id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Gross Salary Pagination */}
                  <PaginationDots
                    totalPages={pageCount}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                /* OT (Overtime) Table */
                <>
                  <OTpayslip
                    month={month}
                    year={year}
                    search={search}
                    entries={entries}
                    currentPage={otCurrentPage}
                    onPageChange={setOTCurrentPage}
                    onLoading={setMonthYearLoading}
                    onDataLoaded={setHasOTPayslipsForCurrentMonth}
                    onTotalCount={setFilteredOTCount}
                    refreshTrigger={refreshOTTrigger}  // Add this line
                    key={refreshOTTrigger}  // Keep this
                  />

                  {/* OT Salary Pagination */}
                  <PaginationDots
                    totalPages={otPageCount}
                    currentPage={otCurrentPage}
                    onPageChange={setOTCurrentPage}
                  />
                </>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              {month && year ? (
                <>
                  <div className="mb-4">
                    <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                  </div>
                  <h5 className="text-muted mt-3">
                    {filterType === 'gross' ? 'No Payslips Found' : 'No OT Data Found'}
                  </h5>
                  <p className="text-muted">
                    No {filterType === 'gross' ? 'payslip' : 'overtime'} data found for <strong>{month} {year}</strong>
                  </p>
                  {filterType === 'gross' && (
                    <p className="text-muted small mb-4">
                      <strong>Note:</strong> Payslips will only be generated for employees who joined on or before the end of {month} {year}.
                    </p>
                  )}
                  {filterType === 'gross' && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => setShowModal(true)}
                      disabled={monthYearLoading}
                    >
                      {monthYearLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Generating...
                        </>
                      ) : (
                        `Generate Payslips for ${month} ${year}`
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h5 className="text-muted mt-3">Select a Month and Year</h5>
                  <p className="text-muted">
                    Please select a month and year to view data
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </Container>


      <PayslipModal
        show={viewPayslipModal}
        onHide={() => setViewPayslipModal(false)}
        employee={selectedEmployee}
        onSalaryUpdated={() => fetchPayslips(month, year, false)}
      />

      <OTPayslipModal
        show={viewOTPayslipModal}
        onHide={() => setViewOTPayslipModal(false)}
        employee={selectedEmployee}
        onOTUpdated={() => fetchPayslips(month, year, false)}
      />
      <ExcelPreviewModal
        show={showExcelPreview}
        onHide={() => setShowExcelPreview(false)}
        previewData={previewData}
        month={month}
        year={year}
        onDownload={generateExcel}
      />

      <Modal
        show={showPDFPreview}
        onHide={() => setShowPDFPreview(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            PDF Preview - {month} {year}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="text-muted mb-3">
            First page preview (Sample Employee)
          </p>
          {previewPDFUrl && (
            <img
              src={previewPDFUrl}
              alt="PDF Preview"
              className="preview-image"
            />
          )}
          <p className="text-muted mt-3">
            This preview shows the first employee's payslip. The full PDF will
            contain all {getMonthEmployees().length} employees.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPDFPreview(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              generatePDF();
              setShowPDFPreview(false);
            }}
          >
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        centered
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
        className={`custom-slide-modal ${false ? "closing" : "open"}`}
        show={openGenreratePlayslip && getMonthEmployees().length != 0}
        size="md"
      >
        <div className="text-center py-4">
          <Spinner animation="border" variant="success" />
        </div>
        <h3 className="text-center text-success text-bold">
          Preparing PDF Download
        </h3>
        <p className="text-center">
          Generate payslips{" "}
          {(
            (progress /
              (getMonthEmployees()?.length == 0
                ? 1
                : getMonthEmployees()?.length)) *
            100
          ).toFixed(0)}
          % complete
        </p>
        <div class="progress mb-2 flex mx-auto" style={{ width: "90%" }}>
          <div
            class="progress-bar bg-success progress-bar-striped"
            role="progressbar"
            style={{
              width: `${(progress /
                (getMonthEmployees()?.length == 0
                  ? 1
                  : getMonthEmployees()?.length)) *
                100
                }%`,
            }}
            aria-valuenow="10"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <p className="text-center">
          Processing {getMonthEmployees()?.length} employees for {month} {year}
        </p>
      </Modal>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Generate Payslip ?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{`${month} ${year}`}</h5>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button
            style={{ cursor: generationLoading ? "default" : "pointer" }}
            className="btn btn-success bg-success"
            onClick={() => {
              handleGeneratePayslip();
            }}
            disabled={generationLoading}
          >
            {generationLoading ? (
              <div className="d-flex m-0 justify-content-center align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Generating...
              </div>
            ) : (
              "Generate"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PayslipPage;