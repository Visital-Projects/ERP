import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Breadcrumb,
  Badge,
} from "react-bootstrap";
import {
  Download,
  ArrowClockwise,
  Filter,
  CashStack,
  CreditCard,
  Calculator,
  Eye,
} from "react-bootstrap-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import salebillService from "../../../../services/salebillService";
import branchService from "../../../../services/branchService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import IncomeSummaryPreviewModal from "./IncomeSummaryPreviewModal";

// Icons
const ExcelIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const PDFIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H9" />
  </svg>
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper functions
const shortMonth = (m) => m.substring(0, 3).toUpperCase();
const formatINR = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Get current date in YYYY-MM-DD format
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

// Filter types
const FILTER_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  FINANCIAL_YEAR: "financial_year",
};

// Financial year options
const getFinancialYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(`${i}-${i + 1}`);
  }
  return years;
};

const formatINRForPDF = (value = 0) =>
  `Rs. ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const IncomeSummary = () => {
  // State variables
  const [filterType, setFilterType] = useState(FILTER_TYPES.MONTHLY);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedQuarterYear, setSelectedQuarterYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(
    "2024-2025"
  );
  // Daily and Weekly states
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const [weekYear, setWeekYear] = useState(new Date().getFullYear().toString());
  
  // Branch filter state
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchFilterEnabled, setBranchFilterEnabled] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Data states
  const [saleBills, setSaleBills] = useState([]);

  // Aggregated data
  const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
  const [monthlyPaidInvoice, setMonthlyPaidInvoice] = useState(Array(12).fill(0));
  const [monthlyGST, setMonthlyGST] = useState(Array(12).fill(0));
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0));
  const [chartData, setChartData] = useState([]);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getAll();
        if (response && Array.isArray(response)) {
          setBranches(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setBranches(response.data);
        }
        console.log("Branches fetched:", response);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    fetchBranches();
  }, []);

  // Helper function to extract data from API response
  const extractDataFromResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    } else if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && typeof response === "object") {
      for (const key in response) {
        if (Array.isArray(response[key])) {
          return response[key];
        }
      }
    }
    return [];
  };

  // Get quarter from month
  // const getQuarterFromMonth = (month) => {
  //   if (month >= 1 && month <= 3) return "Q1";
  //   if (month >= 4 && month <= 6) return "Q2";
  //   if (month >= 7 && month <= 9) return "Q3";
  //   if (month >= 10 && month <= 12) return "Q4";
  //   return "Q1";
  // };
const getQuarterFromMonth = (month) => {
  if (month >= 1 && month <= 4) return "Q1"; // Jan-Apr
  if (month >= 5 && month <= 8) return "Q2"; // May-Aug
  if (month >= 9 && month <= 12) return "Q3"; // Sep-Dec
  return "Q1";
};
  // Get month range for quarter
  // const getMonthRangeForQuarter = (quarter) => {
  //   switch (quarter) {
  //     case "Q1":
  //       return { start: 1, end: 3 };
  //     case "Q2":
  //       return { start: 4, end: 6 };
  //     case "Q3":
  //       return { start: 7, end: 9 };
  //     case "Q4":
  //       return { start: 10, end: 12 };
  //     default:
  //       return { start: 1, end: 3 };
  //   }
  // };
const getMonthRangeForQuarter = (quarter) => {
  switch (quarter) {
    case "Q1":
      return { start: 1, end: 4 }; // Jan-Apr
    case "Q2":
      return { start: 5, end: 8 }; // May-Aug
    case "Q3":
      return { start: 9, end: 12 }; // Sep-Dec
    default:
      return { start: 1, end: 4 };
  }
};
  // Get financial year months
  const getFinancialYearMonths = (financialYear) => {
    const [startYear, endYear] = financialYear.split("-").map(Number);
    return {
      startMonth: 4,
      endMonth: 3,
      startYear: startYear,
      endYear: endYear,
    };
  };

  // Check if date falls within filter range
  const isDateInRange = (date, filterType, filterData) => {
    const filterDate = new Date(date);
    const filterMonth = filterDate.getMonth() + 1;
    const filterYear = filterDate.getFullYear();
    const filterDay = filterDate.getDate();

    switch (filterType) {
      case "daily":
        if (!filterData.date) return true;
        const selectedDateObj = new Date(filterData.date);
        return (
          filterDay === selectedDateObj.getDate() &&
          filterMonth === selectedDateObj.getMonth() + 1 &&
          filterYear === selectedDateObj.getFullYear()
        );

      case "weekly":
        if (!filterData.weekNumber || !filterData.weekYear) return true;
        const weekRange = getWeekRange(
          Number(filterData.weekNumber),
          Number(filterData.weekYear)
        );
        return filterDate >= weekRange.start && filterDate <= weekRange.end;

      case "monthly":
        return (
          filterMonth === parseInt(filterData.month) &&
          filterYear === parseInt(filterData.year)
        );

      case "quarterly":
        const quarterRange = getMonthRangeForQuarter(filterData.quarter);
        return (
          filterMonth >= quarterRange.start &&
          filterMonth <= quarterRange.end &&
          filterYear === parseInt(filterData.year)
        );

      case "financial_year":
        const fyRange = getFinancialYearMonths(filterData.financialYear);
        if (
          filterMonth >= fyRange.startMonth &&
          filterMonth <= 12 &&
          filterYear === fyRange.startYear
        ) {
          return true;
        }
        if (
          filterMonth >= 1 &&
          filterMonth <= fyRange.endMonth &&
          filterYear === fyRange.endYear
        ) {
          return true;
        }
        return false;

      default:
        return true;
    }
  };
// Check if branch matches
const isBranchMatch = (item, branchId) => {
  if (!branchId || branchId === "") return true;

  try {
    const branchIdNum = Number(branchId);

    if (item.assigned_to) {
      return Number(item.assigned_to) === branchIdNum;
    }

    if (item.branch_id) {
      return Number(item.branch_id) === branchIdNum;
    }

    return !branchFilterEnabled;
  } catch (err) {
    console.error("Error in branch matching:", err);
    return true;
  }
};

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await salebillService.getAllSaleBills();
      const saleBillData = extractDataFromResponse(response);
      setSaleBills(saleBillData);

      const filterData = getCurrentFilterData();
      processData(saleBillData, filterData);
    } catch (err) {
      console.error("Error fetching sale bills:", err);
    }
  };

  // Get current filter data based on filter type
  const getCurrentFilterData = () => {
    switch (filterType) {
      case "daily":
        return {
          type: "daily",
          date: selectedDate,
        };

      case "weekly":
        return {
          type: "weekly",
          weekNumber: weekNumber,
          weekYear: weekYear,
        };

      case "monthly":
        return {
          type: "monthly",
          month: selectedMonth,
          year: selectedYear,
        };

      case "quarterly":
        return {
          type: "quarterly",
          quarter: selectedQuarter,
          year: selectedQuarterYear,
        };

      case "financial_year":
        return {
          type: "financial_year",
          financialYear: selectedFinancialYear,
        };

      default:
        return {
          type: "monthly",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear().toString(),
        };
    }
  };

  // Process and aggregate data for sale invoices
  const processData = (saleBillData, filterData) => {
    const revenueByMonth = Array(12).fill(0);
    const paidInvoiceByMonth = Array(12).fill(0);
    const gstByMonth = Array(12).fill(0);

    console.log("Processing sale bills with branch:", selectedBranch);
    console.log("Branch filter enabled:", branchFilterEnabled);

    if (Array.isArray(saleBillData)) {
      saleBillData.forEach((saleBill) => {
        try {
          const dateStr = saleBill.invoice_date || saleBill.created_at || saleBill.updated_at;
          if (!dateStr) return;

          const date = new Date(dateStr);
          const dateInRange = isDateInRange(date, filterData.type, filterData);
          const branchMatch = isBranchMatch(saleBill, selectedBranch);

          const baseAmount = Array.isArray(saleBill.services)
            ? saleBill.services.reduce((sum, service) => sum + (Number(service.amount || 0)), 0)
            : 0;

          const gstAmount = Array.isArray(saleBill.services)
            ? saleBill.services.reduce((sum, service) => sum + (Number(service.tax_amount || 0)), 0)
            : 0;

          const totalInvoiceAmount = baseAmount + gstAmount;

          if (dateInRange && branchMatch) {
            const month = date.getMonth();
            revenueByMonth[month] += baseAmount;

            const isPaid = saleBill.status && saleBill.status.toLowerCase() === "paid";
            if (isPaid) {
              paidInvoiceByMonth[month] += baseAmount;
              gstByMonth[month] += gstAmount;
            }
          }
        } catch (dateErr) {
          console.warn("Error processing sale bill:", dateErr, saleBill);
        }
      });
    }

    console.log("Revenue by month:", revenueByMonth);
    console.log("Paid invoice by month:", paidInvoiceByMonth);
    console.log("GST by month:", gstByMonth);

    const incomeByMonth = paidInvoiceByMonth.map((amount, index) => amount + gstByMonth[index]);

    setMonthlyRevenue(revenueByMonth);
    setMonthlyPaidInvoice(paidInvoiceByMonth);
    setMonthlyGST(gstByMonth);
    setMonthlyIncome(incomeByMonth);

// Prepare chart data - SHOW ONLY FILTERED PERIOD
let chartData = [];

switch (filterData.type) {
  case "daily":
    // Show single day
    chartData = [{
      name: new Date(filterData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      Income: incomeByMonth[new Date(filterData.date).getMonth()] || 0,
      Revenue: revenueByMonth[new Date(filterData.date).getMonth()] || 0,
    }];
    break;

  case "weekly":
    // Show days of the week
    const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
    chartData = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekRange.start);
      day.setDate(weekRange.start.getDate() + i);
      chartData.push({
        name: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        Income: 0, // You need daily aggregation
        Revenue: 0, // You need daily aggregation
      });
    }
    break;

  case "monthly":
    // Show single month
    const monthIndex = parseInt(filterData.month) - 1;
    chartData = [{
      name: months[monthIndex].substring(0, 3),
      fullName: months[monthIndex],
      Income: incomeByMonth[monthIndex] || 0,
      Revenue: revenueByMonth[monthIndex] || 0,
    }];
    break;

  case "quarterly":
    // Show 4 months for the selected quarter
    const quarterRange = getMonthRangeForQuarter(filterData.quarter);
    chartData = [];
    for (let i = quarterRange.start - 1; i < quarterRange.end; i++) {
      chartData.push({
        name: months[i].substring(0, 3),
        fullName: months[i],
        Income: incomeByMonth[i] || 0,
        Revenue: revenueByMonth[i] || 0,
      });
    }
    break;

  case "financial_year":
    // Show Apr to Mar (12 months in correct order)
    const fyOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];
    chartData = fyOrder.map((monthIndex) => ({
      name: months[monthIndex].substring(0, 3),
      fullName: months[monthIndex],
      Income: incomeByMonth[monthIndex] || 0,
      Revenue: revenueByMonth[monthIndex] || 0,
    }));
    break;

  default:
    // Default - show all 12 months
    chartData = months.map((month, index) => ({
      name: month.substring(0, 3),
      fullName: month,
      Income: incomeByMonth[index] || 0,
      Revenue: revenueByMonth[index] || 0,
    }));
}

    setChartData(chartData);
  };

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    setBranchFilterEnabled(Boolean(value));
  };

  // Calculate totals
  const calculateTotals = () => {
    const revenueTotal = monthlyRevenue.reduce((a, b) => a + b, 0);
    const paidInvoiceTotal = monthlyPaidInvoice.reduce((a, b) => a + b, 0);
    const gstTotal = monthlyGST.reduce((a, b) => a + b, 0);
    const incomeTotal = paidInvoiceTotal + gstTotal;

    return {
      revenueTotal,
      paidInvoiceTotal,
      gstTotal,
      incomeTotal,
    };
  };

  const totals = calculateTotals();

  // Reset filters to current month/year
  const resetFilters = () => {
    const currentDate = new Date();
    setFilterType(FILTER_TYPES.MONTHLY);
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear().toString());
    setSelectedQuarter(getQuarterFromMonth(currentDate.getMonth() + 1));
    setSelectedQuarterYear(currentDate.getFullYear().toString());
    setSelectedDate(getCurrentDate());
    setWeekNumber(getWeekNumber(currentDate));
    setWeekYear(currentDate.getFullYear().toString());
    setSelectedBranch("");
    setBranchFilterEnabled(false);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth >= 4) {
      setSelectedFinancialYear(`${currentYear}-${currentYear + 1}`);
    } else {
      setSelectedFinancialYear(`${currentYear - 1}-${currentYear}`);
    }

    setTimeout(() => {
      const filterData = getCurrentFilterData();
      processData(saleBills, filterData);
    }, 100);
  };

  // Get filter heading
  const getFilterHeading = () => {
    let parts = [];

    if (filterType === FILTER_TYPES.DAILY) {
      const dateObj = new Date(selectedDate);
      parts.push(`Date: ${dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
    }

    if (filterType === FILTER_TYPES.WEEKLY) {
      const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
      const start = weekRange.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const end = weekRange.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      parts.push(`Week ${weekNumber}, ${weekYear} (${start} - ${end})`);
    }

    if (filterType === FILTER_TYPES.MONTHLY) {
      parts.push(`Month: ${months[selectedMonth - 1]} ${selectedYear}`);
    }

    if (filterType === FILTER_TYPES.QUARTERLY) {
      parts.push(`Quarter: ${selectedQuarter} ${selectedQuarterYear}`);
    }

    if (filterType === FILTER_TYPES.FINANCIAL_YEAR) {
      parts.push(`Financial Year: ${selectedFinancialYear}`);
    }

    if (selectedBranch) {
      const selectedBranchObj = branches.find(b => 
        String(b.id) === String(selectedBranch) || 
        Number(b.id) === Number(selectedBranch)
      );
      const branchName = selectedBranchObj?.name || `Branch ${selectedBranch}`;
      parts.push(`Site: ${branchName}`);
    }

    return parts.join(" | ");
  };

  // Export to Excel
  const exportToExcel = () => {
    const filterData = getCurrentFilterData();
    const filterHeading = getFilterHeading();
    
    const excelData = [];

    excelData.push(["INCOME SUMMARY REPORT"]);
    excelData.push([filterHeading]);
    excelData.push([]);

    let headers = ["CATEGORY"];
    
    if (filterType === FILTER_TYPES.DAILY || filterType === FILTER_TYPES.WEEKLY || 
        filterType === FILTER_TYPES.MONTHLY || filterType === FILTER_TYPES.FINANCIAL_YEAR) {
      headers = [...headers, ...months];
    } else if (filterType === FILTER_TYPES.QUARTERLY) {
      const quarterRange = getMonthRangeForQuarter(selectedQuarter);
      const quarterMonths = months.slice(quarterRange.start - 1, quarterRange.end);
      headers = [...headers, ...quarterMonths];
    }
    
    excelData.push(headers);

    // Revenue row
    const revenueRow = ["Revenue (All Sale Invoices Base Amount)"];
    if (filterType === FILTER_TYPES.QUARTERLY) {
      const quarterRange = getMonthRangeForQuarter(selectedQuarter);
      for (let i = quarterRange.start - 1; i < quarterRange.end; i++) {
        revenueRow.push(monthlyRevenue[i] || 0);
      }
    } else {
      revenueRow.push(...monthlyRevenue.map((amount) => amount || 0));
    }
    excelData.push(revenueRow);

    // Paid Invoice row
    const invoiceRow = ["Paid Invoice (Paid Sale Invoices Base Amount)"];
    if (filterType === FILTER_TYPES.QUARTERLY) {
      const quarterRange = getMonthRangeForQuarter(selectedQuarter);
      for (let i = quarterRange.start - 1; i < quarterRange.end; i++) {
        invoiceRow.push(monthlyPaidInvoice[i] || 0);
      }
    } else {
      invoiceRow.push(...monthlyPaidInvoice.map((amount) => amount || 0));
    }
    excelData.push(invoiceRow);

    // GST row
    const gstRow = ["GST (Paid Sale Invoices)"];
    if (filterType === FILTER_TYPES.QUARTERLY) {
      const quarterRange = getMonthRangeForQuarter(selectedQuarter);
      for (let i = quarterRange.start - 1; i < quarterRange.end; i++) {
        gstRow.push(monthlyGST[i] || 0);
      }
    } else {
      gstRow.push(...monthlyGST.map((amount) => amount || 0));
    }
    excelData.push(gstRow);

    // Income row
    const incomeRow = ["Income (= Paid Sale Invoice Total)"];
    if (filterType === FILTER_TYPES.QUARTERLY) {
      const quarterRange = getMonthRangeForQuarter(selectedQuarter);
      for (let i = quarterRange.start - 1; i < quarterRange.end; i++) {
        incomeRow.push(monthlyIncome[i] || 0);
      }
    } else {
      incomeRow.push(...monthlyIncome.map((amount) => amount || 0));
    }
    excelData.push(incomeRow);

    excelData.push([]);
    excelData.push(["SUMMARY"]);
    excelData.push(["Total Revenue (All Sale Invoices):", formatINR(totals.revenueTotal)]);
    excelData.push(["Total Paid Invoice:", formatINR(totals.paidInvoiceTotal)]);
    excelData.push(["Total GST:", formatINR(totals.gstTotal)]);
    excelData.push(["Total Income:", formatINR(totals.incomeTotal)]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wscols = [
      { wch: 35 },
      ...Array(12).fill({ wch: 15 }),
    ];
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Summary");

    let fileName = `Income_Summary_${filterHeading.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const filterHeading = getFilterHeading();

      const pdf = new jsPDF("landscape", "mm", "a4");

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("INCOME SUMMARY REPORT", 148, 15, { align: "center" });

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(filterHeading, 148, 25, { align: "center" });

      const monthHeaders =
        filterType === FILTER_TYPES.QUARTERLY
          ? (() => {
              const q = getMonthRangeForQuarter(selectedQuarter);
              return months
                .slice(q.start - 1, q.end)
                .map(m => m.substring(0, 3));
            })()
          : months.map(m => m.substring(0, 3));

      const tableHead = [["CATEGORY", ...monthHeaders]];

      const tableBody = [
        ["Revenue (All Sale Invoices Base Amount)", ...monthlyRevenue],
        ["Paid Invoice (Paid Sale Invoices Base Amount)", ...monthlyPaidInvoice],
        ["GST (Paid Sale Invoices)", ...monthlyGST],
        ["Income (= Paid Sale Invoice Total)", ...monthlyIncome],
      ];

      autoTable(pdf, {
        head: tableHead,
        body: tableBody,
        startY: 40,
        theme: "grid",

        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "right",
        },

        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          halign: "center",
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            halign: "left",
            cellWidth: 55,
            fontStyle: "bold",
          },
        },

        didParseCell: (data) => {
          if (data.section === "body" && data.column.index !== 0) {
            const value = Number(data.cell.raw || 0);
            data.cell.text = [formatINRForPDF(value)];
          }
        },

        margin: { left: 10, right: 10 },
      });

      const finalY = pdf.lastAutoTable.finalY + 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("SUMMARY", 20, finalY);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      pdf.text(
        `Total Revenue (All Sale Invoices): ${formatINRForPDF(totals.revenueTotal)}`,
        20,
        finalY + 8
      );

      pdf.text(
        `Total Paid Invoice: ${formatINRForPDF(totals.paidInvoiceTotal)}`,
        20,
        finalY + 15
      );

      pdf.text(
        `Total GST: ${formatINRForPDF(totals.gstTotal)}`,
        20,
        finalY + 22
      );

      pdf.text(
        `Total Income: ${formatINRForPDF(totals.incomeTotal)}`,
        20,
        finalY + 29
      );

      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        "Report generated from Income Summary Dashboard",
        148,
        200,
        { align: "center" }
      );

      pdf.save(
        `Income_Summary_${filterHeading.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      );
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear.toString());
    setSelectedQuarter(getQuarterFromMonth(currentMonth));
    setSelectedQuarterYear(currentYear.toString());
    setSelectedDate(getCurrentDate());
    setWeekNumber(getWeekNumber(currentDate));
    setWeekYear(currentYear.toString());

    if (currentMonth >= 4) {
      setSelectedFinancialYear(`${currentYear}-${currentYear + 1}`);
    } else {
      setSelectedFinancialYear(`${currentYear - 1}-${currentYear}`);
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    if (!saleBills.length) return;

    const filterData = getCurrentFilterData();
    processData(saleBills, filterData);

  }, [
    filterType,
    selectedMonth,
    selectedYear,
    selectedQuarter,
    selectedQuarterYear,
    selectedFinancialYear,
    selectedDate,
    weekNumber,
    weekYear,
    selectedBranch,
    branchFilterEnabled,
    saleBills,
  ]);

  // if (loading) {
  //   return (
  //     <div className="income-page">
  //       <div className="income-header">
  //         <h2>Income Summary</h2>
  //         <p className="breadcrumb">Dashboard &gt; Income Summary</p>
  //       </div>
  //       <div className="loading-message">Loading data...</div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="income-page">
        <div className="income-header">
          <h2>Income Summary</h2>
          <p className="breadcrumb">Dashboard &gt; Income Summary</p>
        </div>
        <div className="error-message">{error}</div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={fetchAllData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }
// ✅ Dynamic Y-axis domain based on chart data
const getYAxisDomain = () => {
  if (!chartData || chartData.length === 0) return [0, 100];
  
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.Income || 0, d.Revenue || 0)),
    0
  );
  
  if (maxValue === 0) return [0, 100];
  
  // Add 20% padding to top
  return [0, Math.ceil(maxValue * 1.2)];
};

// ✅ Dynamic X-axis interval - show all labels
const getXAxisInterval = () => 0; // Always show all labels

// ✅ Dynamic X-axis angle based on data length
const getXAxisAngle = () => {
  if (chartData.length > 6) return -45;
  return 0;
};

// ✅ Dynamic X-axis height based on angle
const getXAxisHeight = () => {
  if (chartData.length > 6) return 60;
  return 30;
};
  return (
    <div className="p-3 shadow-sm border-0 overflow-x-hidden">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Income Summary</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Income Summary</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="text-end">
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="info" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
            <Button variant="success" onClick={exportToExcel}>
              Export Excel
            </Button>
            <Button variant="danger" onClick={exportToPDF}>
              Export PDF
            </Button>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3">
                  <CashStack size={20} className="text-success" />
                </div>
                <Badge bg="success" className="px-2 py-1">
                  Revenue
                </Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">
                Total Revenue (Sale Invoice)
              </h6>
              <h3 className="fw-bold text-success mb-2">
                {formatINR(totals.revenueTotal)}
              </h3>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Sale invoice base amount total</span>
                <span className="badge bg-light text-dark">
                  {monthlyRevenue.filter((v) => v > 0).length} months active
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <Badge bg="primary" className="px-2 py-1">
                  Paid Invoice
                </Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">
                Total Paid Invoice
              </h6>
              <h3 className="fw-bold text-primary mb-2">
                {formatINR(totals.paidInvoiceTotal)}
              </h3>
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-light text-dark">
                  {monthlyPaidInvoice.filter((v) => v > 0).length} months active
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                  <Calculator size={20} className="text-warning" />
                </div>
                <Badge bg="warning" className="px-2 py-1">
                  GST
                </Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">
                Total GST Amount
              </h6>
              <h3 className="fw-bold text-warning mb-2">
                {formatINR(totals.gstTotal)}
              </h3>
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-light text-dark">
                  {monthlyGST.filter((v) => v > 0).length} months active
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-info bg-opacity-10 p-2 rounded-3">
                  <Calculator size={20} className="text-info" />
                </div>
                <Badge bg="info" className="px-2 py-1">
                  Total
                </Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">
                Total Income
              </h6>
              <h3 className="fw-bold text-info mb-2">
                {formatINR(totals.incomeTotal)}
              </h3>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Paid invoice base + GST total</span>
                <span className="badge bg-light text-dark">
                  {monthlyIncome.filter((v) => v > 0).length} months active
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Card with Branch Filter */}
      <Card className="mb-4 border shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <Filter className="me-2 text-primary" />
            <h5 className="mb-0">Filter Options</h5>
          </div>

          <Row className="g-3 align-items-end">
            <Col xs="auto" style={{ minWidth: '150px' }}>
              <Form.Group>
                <Form.Label className="fw-medium">Filter Type</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border-secondary"
                >
                  {/* <option value={FILTER_TYPES.DAILY}>Daily</option>
                  <option value={FILTER_TYPES.WEEKLY}>Weekly</option> */}
                  <option value={FILTER_TYPES.MONTHLY}>Monthly</option>
                  <option value={FILTER_TYPES.QUARTERLY}>Quarterly</option>
                  <option value={FILTER_TYPES.FINANCIAL_YEAR}>
                    Financial Year
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Conditional Filter Options */}
            {filterType === FILTER_TYPES.DAILY && (
              <Col xs="auto" style={{ minWidth: '150px' }}>
                <Form.Group>
                  <Form.Label className="fw-medium">Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-secondary"
                  />
                </Form.Group>
              </Col>
            )}

            {filterType === FILTER_TYPES.WEEKLY && (
              <>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Week</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="53"
                      value={weekNumber}
                      onChange={(e) => setWeekNumber(e.target.value)}
                      className="border-secondary"
                      placeholder="Week #"
                    />
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select
                      value={weekYear}
                      onChange={(e) => setWeekYear(e.target.value)}
                      className="border-secondary"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}

            {filterType === FILTER_TYPES.MONTHLY && (
              <>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Month</Form.Label>
                    <Form.Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border-secondary"
                    >
                      {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border-secondary"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}

{filterType === FILTER_TYPES.QUARTERLY && (
  <>
    <Col xs="auto" style={{ minWidth: '150px' }}>
      <Form.Group>
        <Form.Label className="fw-medium">Quarter</Form.Label>
        <Form.Select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="border-secondary"
        >
          <option value="Q1">Q1 (Jan-Apr)</option>
          <option value="Q2">Q2 (May-Aug)</option>
          <option value="Q3">Q3 (Sep-Dec)</option>
          {/* No Q4 */}
        </Form.Select>
      </Form.Group>
    </Col>
    <Col xs="auto" style={{ minWidth: '150px' }}>
      <Form.Group>
        <Form.Label className="fw-medium">Year</Form.Label>
        <Form.Select
          value={selectedQuarterYear}
          onChange={(e) => setSelectedQuarterYear(e.target.value)}
          className="border-secondary"
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </Form.Select>
      </Form.Group>
    </Col>
  </>
)}

            {filterType === FILTER_TYPES.FINANCIAL_YEAR && (
              <Col xs="auto" style={{ minWidth: '180px' }}>
                <Form.Group>
                  <Form.Label className="fw-medium">Financial Year</Form.Label>
                  <Form.Select
                    value={selectedFinancialYear}
                    onChange={(e) => setSelectedFinancialYear(e.target.value)}
                    className="border-secondary"
                  >
                    {getFinancialYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {/* Branch Filter */}
            <Col xs="auto" style={{ minWidth: '200px' }}>
              <Form.Group>
                <Form.Label className="fw-medium">
                  Sites
                </Form.Label>
                <Form.Select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  className="border-secondary"
                >
                  <option value="">All Sites</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name || `Branch ${branch.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Action Buttons */}
            <Col xs="auto" className="ms-auto">
              <div className="d-flex gap-2">
                <Button
                  variant="danger"
                  onClick={resetFilters}
                  title="Reset all filters"
                >
                  <ArrowClockwise /> Reset
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filter Status Display */}
          <div className="mt-3">
            {branchFilterEnabled && (
              <Badge bg="info" className="me-2">
                Branch Filter Active
              </Badge>
            )}
            <small className="text-muted">
              {getFilterHeading()}
            </small>
          </div>
        </Card.Body>
      </Card>

{/* Chart Card - Updated to match Expense Summary UI */}
<Card className="mb-4 border-0 shadow-sm">
  <Card.Body style={{ height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22b573" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22b573" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        
        {/* DYNAMIC X-AXIS - Matches Expense Summary styling */}
        <XAxis 
          dataKey="name" 
          interval={0} // Always show all labels
          angle={chartData.length === 1 ? 0 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? -45 : (chartData.length > 6 ? -45 : 0))}
          textAnchor={chartData.length === 1 ? "middle" : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? "end" : (chartData.length > 6 ? "end" : "middle"))}
          height={chartData.length === 1 ? 30 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? 60 : (chartData.length > 6 ? 60 : 30))}
          tick={{ fontSize: chartData.length === 1 ? 14 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? 11 : (chartData.length > 10 ? 10 : 12)) }}
          tickLine={chartData.length > 1}
          axisLine={chartData.length > 1}
        />
        
        {/* DYNAMIC Y-AXIS */}
        <YAxis 
          tickFormatter={(value) => formatINR(value)}
          domain={getYAxisDomain()}
          width={80}
          tick={{ fontSize: 12 }}
        />
        
        <Tooltip
          formatter={(value) => [formatINR(value), "Amount"]}
          labelFormatter={(label) => {
            const item = chartData.find(d => d.name === label);
            return `Period: ${item?.fullName || label}`;
          }}
        />
        
        <Legend 
          verticalAlign="top"
          height={36}
        />
        
        {/* Income Area - Changed from Line to Area to match Expense Summary */}
        <Area
          type="monotone"
          dataKey="Income"
          stroke="#22b573"
          strokeWidth={2}
          fill="url(#incomeGradient)"
          name="Income"
        />
        
        {/* Revenue Area - Changed from Line to Area to match Expense Summary */}
        <Area
          type="monotone"
          dataKey="Revenue"
          stroke="#8884d8"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>
      {/* Income Summary Table */}
      <div className="mt-4">
        <div className="table-responsive">
          <table className="table table-borderless align-middle mb-0">
            <thead className="border-bottom">
              <tr>
                <th>TYPE</th>
                {months.map((m) => (
                  <th key={m}>{shortMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr>
                <td className="fw-bold">Revenue:</td>
                {monthlyRevenue.map((v, i) => (
                  <td key={i}>{formatINR(v)}</td>
                ))}
              </tr>

              {/* Paid Invoice */}
              <tr>
                <td className="fw-bold">Paid Invoice:</td>
                {monthlyPaidInvoice.map((v, i) => (
                  <td key={i}>{formatINR(v)}</td>
                ))}
              </tr>

              {/* GST */}
              <tr className="fw-bold text-warning">
                <td>GST</td>
                {monthlyGST.map((v, i) => (
                  <td key={i}>{formatINR(v)}</td>
                ))}
              </tr>

              {/* Income */}
              <tr>
                <td className="fw-bold">Income:</td>
                {monthlyIncome.map((v, i) => (
                  <td key={i}>{formatINR(v)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <IncomeSummaryPreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        months={months}
        monthlyRevenue={monthlyRevenue}
        monthlyPaidInvoice={monthlyPaidInvoice}
        monthlyGST={monthlyGST}
        monthlyIncome={monthlyIncome}
        filterHeading={getFilterHeading()}
        exportToExcel={exportToExcel} 
        exportToPDF={exportToPDF} 
      />
    </div>
  );
};

export default IncomeSummary;