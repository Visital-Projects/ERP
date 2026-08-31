import React, { useEffect, useState, useMemo } from "react";
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
} from "react-bootstrap";
import {
  Search,
  ArrowClockwise,
  FileExcel,
  FilePdf,
  Filter,
  Calendar,
} from "react-bootstrap-icons";
import workOrderService from "../../../../services/workOrderService";
import purchaseService from "../../../../services/purchaseService";
import branchService from "../../../../services/branchService";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InvoicePreviewModal from "./InvoiceSummaryPreviewModal";

const getCurrentDefaults = () => {
  const today = new Date();

  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString();
  const day = today.getDate().toString();

  const quarterIndex = Math.floor(today.getMonth() / 3);
  const quarters = ["q1", "q2", "q3", "q4"];

  // Financial year (India: Apr–Mar)
  const fyStart =
    today.getMonth() >= 3
      ? `${today.getFullYear()}-${today.getFullYear() + 1}`
      : `${today.getFullYear() - 1}-${today.getFullYear()}`;

  return {
    daily: { day, month, year },
    weekly: { week: "1", month, year }, // default to week 1 of current month
    monthly: { month, year },
    quarterly: quarters[quarterIndex],
    financialYear: fyStart,
  };
};

const formatINRForPDF = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const InvoiceSummary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  
  // New state for additional filters
  const [vendorFilter, setVendorFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [timePeriodFilter, setTimePeriodFilter] = useState("");
  const [financialYearFilter, setFinancialYearFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: ""
  });
  
  // New state for time period specific selectors
  const [dailyFilter, setDailyFilter] = useState({
    day: "",
    month: "",
    year: ""
  });
  const [weeklyFilter, setWeeklyFilter] = useState({
    week: "",
    month: "",
    year: ""
  });
  const [monthlyFilter, setMonthlyFilter] = useState({
    month: "",
    year: ""
  });
  const [quarterlyFilter, setQuarterlyFilter] = useState("");
  
  // Data states
  const [woData, setWoData] = useState([]);
  const [woInvoices, setWoInvoices] = useState([]);
  const [poData, setPoData] = useState([]);
  const [poInvoices, setPoInvoices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Filter states
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch WO data
        const woRes = await workOrderService.getAllWorkOrders();
        if (woRes.success) setWoData(woRes.data || []);

        // Fetch WO invoices
        const woInvRes = await workOrderService.getAllInvoices();
        if (woInvRes.success) setWoInvoices(woInvRes.data || []);

        // Fetch PO data
        const poRes = await purchaseService.getAllPurchases();
        if (poRes.success) {
          setPoData(poRes.data || []);
          // Extract unique vendors from PO data
          const uniqueVendors = [...new Set(poRes.data.map(po => po.vendor_name).filter(Boolean))];
          setVendors(uniqueVendors);
        }

        // Fetch PO invoices
        const poInvRes = await purchaseService.getAllPurchaseOrderInvoices();
        if (poInvRes.success) setPoInvoices(poInvRes.data || []);

        // Fetch branches
        const branchesRes = await branchService.getAll();
        setBranches(branchesRes || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
useEffect(() => {
  const defaults = getCurrentDefaults();

  // 🔹 Default view = CURRENT MONTH
  setTimePeriodFilter("monthly");
  setMonthlyFilter(defaults.monthly);

  // Optional: preload others so switching is instant
  setDailyFilter(defaults.daily);
  setWeeklyFilter(defaults.weekly);
  setQuarterlyFilter(defaults.quarterly);
  setFinancialYearFilter(defaults.financialYear);

  setCurrentPage(1);
}, []);
  // Calculate financial years
  const financialYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(`${i}-${i + 1}`);
    }
    return years.reverse();
  }, []);

  // Get weeks in a month
  const getWeeksInMonth = (month, year) => {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let currentWeek = 1;
    let currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }
      
      weeks.push({
        week: currentWeek,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        label: `Week ${currentWeek} (${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short' })})`
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      currentWeek++;
    }
    
    return weeks;
  };

  // Generate months for select
  const months = useMemo(() => [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ], []);

  // Generate years for select
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsArr = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      yearsArr.push(i);
    }
    return yearsArr.reverse();
  }, []);

  // Get days in month
  const getDaysInMonth = (month, year) => {
    const days = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Get weeks for current monthly selection
  const weeksForMonth = useMemo(() => {
    if (weeklyFilter.month && weeklyFilter.year) {
      return getWeeksInMonth(parseInt(weeklyFilter.month), parseInt(weeklyFilter.year));
    }
    return [];
  }, [weeklyFilter.month, weeklyFilter.year]);

  // Get date range based on time period selection
  const getDateRangeFromTimePeriod = () => {
    const today = new Date();
    
    switch (timePeriodFilter) {
      case "daily":
        if (dailyFilter.day && dailyFilter.month && dailyFilter.year) {
          const start = new Date(dailyFilter.year, dailyFilter.month - 1, dailyFilter.day);
          const end = new Date(dailyFilter.year, dailyFilter.month - 1, dailyFilter.day);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        break;
        
      case "weekly":
        if (weeklyFilter.week && weeklyFilter.month && weeklyFilter.year) {
          const weekData = weeksForMonth.find(w => w.week.toString() === weeklyFilter.week);
          if (weekData) {
            const start = new Date(weekData.startDate);
            const end = new Date(weekData.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
          }
        }
        break;
        
      case "monthly":
        if (monthlyFilter.month && monthlyFilter.year) {
          const start = new Date(monthlyFilter.year, monthlyFilter.month - 1, 1);
          const end = new Date(monthlyFilter.year, monthlyFilter.month, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        break;
        
      case "quarterly":
        if (quarterlyFilter) {
          let startMonth;
          let quarterName;
          
          switch (quarterlyFilter) {
            case "q1":
              startMonth = 0; // January
              quarterName = "Q1 (Jan-Mar)";
              break;
            case "q2":
              startMonth = 3; // April
              quarterName = "Q2 (Apr-Jun)";
              break;
            case "q3":
              startMonth = 6; // July
              quarterName = "Q3 (Jul-Sep)";
              break;
            case "q4":
              startMonth = 9; // October
              quarterName = "Q4 (Oct-Dec)";
              break;
            default:
              return null;
          }
          
          const currentYear = monthlyFilter.year || new Date().getFullYear();
          const start = new Date(currentYear, startMonth, 1);
          const end = new Date(currentYear, startMonth + 3, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return { start, end, quarterName };
        }
        break;
        
      default:
        return null;
    }
    return null;
  };

  // Calculate date range for financial year selection
  const getFinancialYearDateRange = (financialYear) => {
    if (!financialYear) return null;
    const [startYear] = financialYear.split('-').map(Number);
    const start = new Date(startYear, 3, 1); // April 1
    const end = new Date(startYear + 1, 2, 31); // March 31 next year
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

// Process and merge data
const processedData = useMemo(() => {
  const result = {};

  // Process POs
  poData.forEach((po) => {
    const poNumber = po.po_number;
    const poInvoicesForPo = poInvoices.filter(
      (inv) => inv.po_number === poNumber
    );

    // NEW: Calculate invoice statistics
    const totalInvoicesCreated = poInvoicesForPo.length;
    const pendingInvoices = poInvoicesForPo.filter(
      (inv) => inv.status?.toLowerCase() === "pending"
    );
    const totalPendingInvoices = pendingInvoices.length;
    
    // NEW: Calculate due amount from pending invoices
const dueAmountFromPending = pendingInvoices.reduce(
  (sum, inv) => {
    // If remaining_amount is available and non-zero, use it
    if (inv.remaining_amount && parseFloat(inv.remaining_amount) > 0) {
      return sum + parseFloat(inv.remaining_amount);
    }
    // Otherwise, calculate from payment_amount (assuming nothing paid yet)
    return sum + parseFloat(inv.payment_amount || 0);
  },
  0
);

    // Calculate total paid from paid invoices
    const paidInvoices = poInvoicesForPo.filter(
      (inv) => inv.status?.toLowerCase() === "paid"
    );

    const totalBaseAmount = parseFloat(po.total_amount) || 0;
    const totalPaid = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    // Calculate tax from paid invoices only
    const totalTax = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.gst_amount || 0),
      0
    );

    const totalInvoiced = poInvoicesForPo.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    // Determine status
    let status = "Pending";
    if (poInvoicesForPo.length > 0) {
      const allPaid = poInvoicesForPo.every(
        (inv) => inv.status?.toLowerCase() === "paid"
      );
      const somePaid = poInvoicesForPo.some(
        (inv) => inv.status?.toLowerCase() === "paid"
      );

      if (allPaid) status = "Paid";
      else if (somePaid) status = "Partially Paid";
    }

    // Calculate excess
    const excessAmount = Math.max(0, totalPaid - totalInvoiced);
    
    // Find the latest invoice date
    let latestInvoiceDate = null;
    if (poInvoicesForPo.length > 0) {
      const invoiceDates = poInvoicesForPo
        .map(inv => inv.created_at ? new Date(inv.created_at).getTime() : 0)
        .filter(date => date > 0);
      
      if (invoiceDates.length > 0) {
        latestInvoiceDate = new Date(Math.max(...invoiceDates));
      }
    }
    
    const filterDate = latestInvoiceDate || new Date(po.po_date || po.created_at);

    result[poNumber] = {
      type: "PO",
      number: poNumber,
      baseAmount: totalBaseAmount,
      tax: totalTax,
      totalAmount: totalBaseAmount,
      totalPaid: totalPaid,
      totalInvoiced: totalInvoiced,
      dueAmount: dueAmountFromPending, // UPDATED: Now using pending invoices remaining amount
      excessAmount: excessAmount,
      status: status,
      poData: po,
      invoices: poInvoicesForPo,
      vendor: po.vendor_name,
      branch: po.branch,
      createdDate: po.po_date || po.created_at,
      latestInvoiceDate: filterDate,
      // NEW: Add invoice statistics
      invoiceStats: {
        totalCreated: totalInvoicesCreated,
        pendingCount: totalPendingInvoices,
        paidCount: paidInvoices.length,
        pendingAmount: dueAmountFromPending
      }
    };
  });

  // Process WOs
  woData.forEach((wo) => {
    const woNumber = wo.wo_number;
    const woInvoicesForWo = woInvoices.filter(
      (inv) => inv.wo_number === woNumber
    );

    // NEW: Calculate invoice statistics
    const totalInvoicesCreated = woInvoicesForWo.length;
    const pendingInvoices = woInvoicesForWo.filter(
      (inv) => inv.status?.toLowerCase() === "pending"
    );
    const totalPendingInvoices = pendingInvoices.length;
const dueAmountFromPending = pendingInvoices.reduce(
  (sum, inv) => {
    // If remaining_amount is available and non-zero, use it
    if (inv.remaining_amount && parseFloat(inv.remaining_amount) > 0) {
      return sum + parseFloat(inv.remaining_amount);
    }
    // Otherwise, calculate from payment_amount (assuming nothing paid yet)
    return sum + parseFloat(inv.payment_amount || 0);
  },
  0
);

    // Calculate total paid from paid invoices
    const paidInvoices = woInvoicesForWo.filter(
      (inv) => inv.status?.toLowerCase() === "paid"
    );

    const totalBaseAmount = parseFloat(wo.work_order_amount) || 0;
    const totalPaid = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount || 0),
      0
    );

    // Calculate tax from paid invoices only
    const totalTax = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.gst_amount || 0),
      0
    );

    const totalInvoiced = parseFloat(wo.total_invoiced_amount) || 0;
    const excessAmount = parseFloat(wo.excess_amount) || 0;

    // Determine status
    let status = "Pending";
    if (woInvoicesForWo.length > 0) {
      const allPaid = woInvoicesForWo.every(
        (inv) => inv.status?.toLowerCase() === "paid"
      );
      const somePaid = woInvoicesForWo.some(
        (inv) => inv.status?.toLowerCase() === "paid"
      );

      if (allPaid) status = "Paid";
      else if (somePaid) status = "Partially Paid";
    }

    // Calculate due
    // const dueAmount = Math.max(0, totalBaseAmount - totalPaid);
    
    // Find the latest invoice date
    let latestInvoiceDate = null;
    if (woInvoicesForWo.length > 0) {
      const invoiceDates = woInvoicesForWo
        .map(inv => inv.created_at ? new Date(inv.created_at).getTime() : 0)
        .filter(date => date > 0);
      
      if (invoiceDates.length > 0) {
        latestInvoiceDate = new Date(Math.max(...invoiceDates));
      }
    }
    
    const filterDate = latestInvoiceDate || new Date(wo.issue_date || wo.created_at);

    result[woNumber] = {
      type: "WO",
      number: woNumber,
      baseAmount: totalBaseAmount,
      tax: totalTax,
      totalAmount: totalBaseAmount + excessAmount,
      totalPaid: totalPaid,
      totalInvoiced: totalInvoiced,
      dueAmount: dueAmountFromPending, // UPDATED: Now using pending invoices remaining amount
      excessAmount: excessAmount,
      status: status,
      woData: wo,
      invoices: woInvoicesForWo,
      vendor: null,
      branch: wo.assignedBranch,
      createdDate: wo.issue_date || wo.created_at,
      latestInvoiceDate: filterDate,
      // NEW: Add invoice statistics
      invoiceStats: {
        totalCreated: totalInvoicesCreated,
        pendingCount: totalPendingInvoices,
        paidCount: paidInvoices.length,
        pendingAmount: dueAmountFromPending
      }
    };
  });

  return Object.values(result);
}, [woData, woInvoices, poData, poInvoices]);

  // Apply filters
  const filteredData = useMemo(() => {
    let data = [...processedData];

    // Type filter
    if (selectedType !== "all") {
      data = data.filter((item) => item.type === selectedType);
    }

    // Status filter
    if (selectedStatus) {
      data = data.filter((item) => {
        if (selectedStatus === "paid") return item.status === "Paid";
        if (selectedStatus === "pending") return item.status === "Pending";
        if (selectedStatus === "partially") return item.status === "Partially Paid";
        return true;
      });
    }

    // Vendor filter (only for POs)
    if (vendorFilter) {
      data = data.filter((item) => 
        item.type === "PO" && item.vendor?.toLowerCase().includes(vendorFilter.toLowerCase())
      );
    }

    // Branch filter
    if (branchFilter) {
      data = data.filter((item) => {
        if (item.type === "PO") {
          return item.branch?.id?.toString() === branchFilter || 
                 item.branch?.name?.toLowerCase().includes(branchFilter.toLowerCase());
        } else if (item.type === "WO") {
          return item.branch?.id?.toString() === branchFilter || 
                 item.branch?.name?.toLowerCase().includes(branchFilter.toLowerCase());
        }
        return false;
      });
    }

// Time period filter with specific selectors - ONLY SHOW LATEST INVOICE
if (timePeriodFilter) {
  const dateRange = getDateRangeFromTimePeriod();
  if (dateRange) {
    data = data.filter((item) => {
      // Check if the latest invoice date falls within the range
      const itemDate = item.latestInvoiceDate ? new Date(item.latestInvoiceDate) : null;
      
      // If there's no invoice date at all, don't include in time period filter
      if (!itemDate) return false;
      
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }
}

// Financial year filter - ONLY SHOW LATEST INVOICE
if (financialYearFilter) {
  const dateRange = getFinancialYearDateRange(financialYearFilter);
  if (dateRange) {
    data = data.filter((item) => {
      // Check if the latest invoice date falls within the financial year
      const itemDate = item.latestInvoiceDate ? new Date(item.latestInvoiceDate) : null;
      
      // If there's no invoice date at all, don't include in financial year filter
      if (!itemDate) return false;
      
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }
}

// Date range filter - ONLY SHOW LATEST INVOICE
if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
  const startDate = dateRangeFilter.startDate ? new Date(dateRangeFilter.startDate) : null;
  const endDate = dateRangeFilter.endDate ? new Date(dateRangeFilter.endDate) : null;
  
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);
  
  data = data.filter((item) => {
    // Check if the latest invoice date falls within the custom date range
    const itemDate = item.latestInvoiceDate ? new Date(item.latestInvoiceDate) : null;
    
    // If there's no invoice date at all, skip this filter (include all)
    if (!itemDate) return true;
    
    const afterStart = !startDate || itemDate >= startDate;
    const beforeEnd = !endDate || itemDate <= endDate;
    return afterStart && beforeEnd;
  });
}

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.number.toLowerCase().includes(searchLower) ||
          (item.vendor && item.vendor.toLowerCase().includes(searchLower)) ||
          (item.branch?.name && item.branch.name.toLowerCase().includes(searchLower))
      );
    }

    return data;
  }, [
    processedData, 
    selectedType, 
    selectedStatus, 
    vendorFilter, 
    branchFilter, 
    timePeriodFilter, 
    financialYearFilter, 
    dateRangeFilter, 
    search,
    dailyFilter,
    weeklyFilter,
    monthlyFilter,
    quarterlyFilter,
    weeksForMonth
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

// Calculate totals
const totals = useMemo(() => {
  return filteredData.reduce(
    (acc, item) => {
      return {
        baseAmount: acc.baseAmount + item.baseAmount,
        tax: acc.tax + item.tax,
        totalAmount: acc.totalAmount + item.totalAmount,
        totalPaid: acc.totalPaid + item.totalPaid,
        dueAmount: acc.dueAmount + item.dueAmount,
        excessAmount: acc.excessAmount + item.excessAmount,
        totalInvoiced: acc.totalInvoiced + item.totalInvoiced,
        count: acc.count + 1,
        // NEW: Total invoice statistics
        totalInvoices: acc.totalInvoices + (item.invoiceStats?.totalCreated || 0),
        pendingInvoices: acc.pendingInvoices + (item.invoiceStats?.pendingCount || 0),
        paidInvoices: acc.paidInvoices + (item.invoiceStats?.paidCount || 0),
      };
    },
    {
      baseAmount: 0,
      tax: 0,
      totalAmount: 0, 
      totalPaid: 0,
      dueAmount: 0,
      excessAmount: 0,
      totalInvoiced: 0,
      count: 0,
      totalInvoices: 0,
      pendingInvoices: 0,
      paidInvoices: 0,
    }
  );
}, [filteredData]);

  // Helper functions
  const formatINR = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Partially Paid":
        return "warning";
      case "Pending":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Reset time period specific filters
  const resetTimePeriodFilters = () => {
    setDailyFilter({ day: "", month: "", year: "" });
    setWeeklyFilter({ week: "", month: "", year: "" });
    setMonthlyFilter({ month: "", year: "" });
    setQuarterlyFilter("");
  };

  // Handle time period change
  const handleTimePeriodChange = (value) => {
    setTimePeriodFilter(value);
    resetTimePeriodFilters();
    setFinancialYearFilter("");
    setDateRangeFilter({ startDate: "", endDate: "" });
    
    // Set current date values if available
    const today = new Date();
    if (value === "daily") {
      setDailyFilter({
        day: today.getDate().toString(),
        month: (today.getMonth() + 1).toString(),
        year: today.getFullYear().toString()
      });
    }  else if (value === "weekly") {
  const weeks = getWeeksInMonth(
    today.getMonth() + 1,
    today.getFullYear()
  );

  const currentWeek =
    weeks.find(
      w => today >= w.startDate && today <= w.endDate
    )?.week || "1";

  setWeeklyFilter({
    week: currentWeek.toString(),
    month: currentMonth,
    year: currentYear
  });
} else if (value === "monthly") {
      setMonthlyFilter({
        month: (today.getMonth() + 1).toString(),
        year: today.getFullYear().toString()
      });
    } else if (value === "quarterly") {
      const quarter = Math.floor(today.getMonth() / 3);
      const quarters = ["q1", "q2", "q3", "q4"];
      setQuarterlyFilter(quarters[quarter]);
    }
  };

  // Get days for current monthly selection
  const daysForMonth = useMemo(() => {
    if (dailyFilter.month && dailyFilter.year) {
      return getDaysInMonth(parseInt(dailyFilter.month), parseInt(dailyFilter.year));
    }
    return [];
  }, [dailyFilter.month, dailyFilter.year]);

  // Export functions
  const handleExportExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Number": item.number,
      "Type": item.type,
      "Vendor": item.vendor || null,
      "Branch": item.branch?.name || null,
      "Base Amount": item.baseAmount,
      "Tax": item.tax,
      // "Total Amount": item.totalAmount,
      "Paid Amount": item.totalPaid,
      "Due Amount": item.dueAmount,
      "Excess Amount": item.excessAmount,
      "Status": item.status,
      // "Created Date": item.createdDate,
    }));
const totalRow = {
  "Number": "TOTAL",
  "Type": "",
  "Vendor": "",
  "Branch": "",
  "Base Amount": filteredData.reduce((sum, i) => sum + (i.baseAmount || 0), 0),
  "Tax": filteredData.reduce((sum, i) => sum + (i.tax || 0), 0),
  // "Total Amount": filteredData.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  "Paid Amount": filteredData.reduce((sum, i) => sum + (i.totalPaid || 0), 0),
  "Due Amount": filteredData.reduce((sum, i) => sum + (i.dueAmount || 0), 0),
  "Excess Amount": filteredData.reduce((sum, i) => sum + (i.excessAmount || 0), 0),
  "Status": ""
};

// Add total row at bottom
exportData.push(totalRow);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const columnWidths = Object.keys(exportData[0] || {}).map(key => ({
  wch: Math.max(
    key.length,
    ...exportData.map(row =>
      row[key] ? row[key].toString().length : 0
    )
  ) + 2
}));

worksheet["!cols"] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Summary");
    XLSX.writeFile(
      workbook,
      `InvoiceSummary_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
doc.setFont("helvetica", "normal");
doc.setCharSpace(0);
doc.setFontSize(16);
    doc.text("Invoice Summary Report", 14, 15);

    // Add filter info
    doc.setFontSize(10);
    let yPos = 25;
    
    if (selectedType !== "all") {
      doc.text(`Type: ${selectedType}`, 14, yPos);
      yPos += 5;
    }
    
    if (selectedStatus) {
      doc.text(`Status: ${selectedStatus}`, 14, yPos);
      yPos += 5;
    }
    
    if (vendorFilter) {
      doc.text(`Vendor: ${vendorFilter}`, 14, yPos);
      yPos += 5;
    }
    
    if (branchFilter) {
      const branchName = branches.find(b => b.id?.toString() === branchFilter)?.name || branchFilter;
      doc.text(`Branch: ${branchName}`, 14, yPos);
      yPos += 5;
    }
    
    if (timePeriodFilter) {
      let timePeriodText = timePeriodFilter;
      if (timePeriodFilter === "daily" && dailyFilter.day && dailyFilter.month && dailyFilter.year) {
        const date = new Date(dailyFilter.year, dailyFilter.month - 1, dailyFilter.day);
        timePeriodText = `Daily: ${date.toLocaleDateString('en-IN')}`;
      } else if (timePeriodFilter === "weekly" && weeklyFilter.week && weeklyFilter.month && weeklyFilter.year) {
        const weekData = weeksForMonth.find(w => w.week.toString() === weeklyFilter.week);
        if (weekData) {
          timePeriodText = `Weekly: ${weekData.label}`;
        }
      } else if (timePeriodFilter === "monthly" && monthlyFilter.month && monthlyFilter.year) {
        const monthName = months.find(m => m.value.toString() === monthlyFilter.month)?.label;
        timePeriodText = `Monthly: ${monthName} ${monthlyFilter.year}`;
      } else if (timePeriodFilter === "quarterly" && quarterlyFilter) {
        const quarterNames = {
          q1: "Q1 (January - March)",
          q2: "Q2 (April - June)",
          q3: "Q3 (July - September)",
          q4: "Q4 (October - December)"
        };
        timePeriodText = `Quarterly: ${quarterNames[quarterlyFilter] || quarterlyFilter}`;
      }
      doc.text(`Time Period: ${timePeriodText}`, 14, yPos);
      yPos += 5;
    }
    
    if (financialYearFilter) {
      doc.text(`Financial Year: ${financialYearFilter}`, 14, yPos);
      yPos += 5;
    }
    
    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
      const dateRangeText = `${dateRangeFilter.startDate || ''} to ${dateRangeFilter.endDate || ''}`;
      doc.text(`Date Range: ${dateRangeText}`, 14, yPos);
      yPos += 5;
    }
    
    // Add summary
    doc.text(`Total Records: ${totals.count}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Base Amount: ${formatINRForPDF(totals.baseAmount)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Tax: ${formatINRForPDF(totals.tax)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Paid: ${formatINRForPDF(totals.totalPaid)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Due: ${formatINRForPDF(totals.dueAmount)}`, 14, yPos);

    autoTable(doc, {
head: [
  [
    "Number",
    "Type",
    "Vendor",
    "Site",
    "Base Amount",
    "Tax",
    // "Total Amount",
    "Paid",
    "Due",
    "Excess",
    "Status",
  ],
],
body: [
  ...filteredData.map((item) => [
    item.number,
    item.type,
    item.vendor || null,
    item.branch?.name || null,
    formatINRForPDF(item.baseAmount),
    formatINRForPDF(item.tax),
    // formatINRForPDF(item.totalAmount),
    formatINRForPDF(item.totalPaid),
    formatINRForPDF(item.dueAmount),
    formatINRForPDF(item.excessAmount),
    item.status,
  ]),
  [
    "TOTAL",
    "",
    "",
    "",
    formatINRForPDF(totals.baseAmount),
    formatINRForPDF(totals.tax),
    formatINRForPDF(
      filteredData.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    ),
    formatINRForPDF(totals.totalPaid),
    formatINRForPDF(totals.dueAmount),
    formatINRForPDF(totals.excessAmount),
    "",
  ],
],

      startY: yPos + 10,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`InvoiceSummary_${new Date().toISOString().split("T")[0]}.pdf`);
  };

const handlePreview = () => {
  const preview = filteredData.map((item) => ({
    "Number": item.number,
    "Type": item.type,
    "Vendor": item.vendor || null,
    "Site": item.branch?.name || null,
    "Base Amount": formatINR(item.baseAmount),
    "Tax": formatINR(item.tax),
    // "Total Amount": formatINR(item.totalAmount),
    "Paid Amount": formatINR(item.totalPaid),
    "Due Amount": formatINR(item.dueAmount),
    "Excess Amount": formatINR(item.excessAmount),
    "Status": item.status,
  }));

  // 🔹 Add Grand Total Row
  preview.push({
    "Number": "TOTAL",
    "Type": "",
    "Vendor": "",
    "Site": "",
    "Base Amount": formatINR(totals.baseAmount),
    "Tax": formatINR(totals.tax),
//     "Total Amount": formatINR(
//   filteredData.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
// ),
    "Paid Amount": formatINR(totals.totalPaid),
    "Due Amount": formatINR(totals.dueAmount),
    "Excess Amount": formatINR(totals.excessAmount),
    "Status": "",
  });

  setPreviewData(preview);
  setShowPreview(true);
};


  const handleResetFilters = () => {
    setSelectedType("all");
    setSelectedStatus("");
    setVendorFilter("");
    setBranchFilter("");
    setTimePeriodFilter("");
    setFinancialYearFilter("");
    setDateRangeFilter({ startDate: "", endDate: "" });
    resetTimePeriodFilters();
    setSearch("");
    setCurrentPage(1);
  };

  const handleViewDetails = (item) => {
    if (item.type === "WO" && item.woData?.id) {
      navigate(`/works/orders/${item.woData.id}`);
    } else if (item.type === "PO" && item.poData?.id) {
      navigate(`/purchase-orders/${item.poData.id}`);
    }
  };
// Add this function to your component
const getFilterSummaryText = () => {
  const filters = [];
  
  if (selectedType !== "all") {
    filters.push(`Type: ${selectedType}`);
  }
  
  if (selectedStatus) {
    filters.push(`Status: ${selectedStatus}`);
  }
  
  if (vendorFilter) {
    filters.push(`Vendor: ${vendorFilter}`);
  }
  
  if (branchFilter) {
    const branchName = branches.find(b => b.id === branchFilter)?.name;
    if (branchName) filters.push(`Branch: ${branchName}`);
  }
  
  if (timePeriodFilter) {
    let periodText = `Period: ${timePeriodFilter}`;
    
    if (timePeriodFilter === "daily" && dailyFilter.year && dailyFilter.month && dailyFilter.day) {
      const date = new Date(dailyFilter.year, dailyFilter.month - 1, dailyFilter.day);
      periodText = `Daily: ${date.toLocaleDateString('en-IN')}`;
    } else if (timePeriodFilter === "weekly" && weeklyFilter.year && weeklyFilter.month && weeklyFilter.week) {
      const monthName = months.find(m => m.value.toString() === weeklyFilter.month)?.label;
      periodText = `Weekly: Week ${weeklyFilter.week} of ${monthName} ${weeklyFilter.year}`;
    } else if (timePeriodFilter === "monthly" && monthlyFilter.year && monthlyFilter.month) {
      const monthName = months.find(m => m.value.toString() === monthlyFilter.month)?.label;
      periodText = `Monthly: ${monthName} ${monthlyFilter.year}`;
    } else if (timePeriodFilter === "quarterly" && quarterlyFilter && monthlyFilter.year) {
      const quarterNames = {
        q1: "Q1 (Jan - Mar)",
        q2: "Q2 (Apr - Jun)",
        q3: "Q3 (Jul - Sep)",
        q4: "Q4 (Oct - Dec)"
      };
      periodText = `Quarterly: ${quarterNames[quarterlyFilter]} ${monthlyFilter.year}`;
    } else if (timePeriodFilter === "financial_year" && financialYearFilter) {
      periodText = `Financial Year: ${financialYearFilter}`;
    }
    
    filters.push(periodText);
  }
  
  return filters.length > 0 ? filters.join(" • ") : "No filters applied";
};
  return (
    <Container fluid className="p-3">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Invoice Summary</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Invoice Summary</Breadcrumb.Item>
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
<Card className="mb-4 border shadow-sm">
  <Card.Body className="p-4">
    <div className="d-flex align-items-center mb-3">
      <Filter className="me-2 text-primary" />
      <h5 className="mb-0">Filter Options</h5>
    </div>
    
    <Row className="g-3 align-items-end">
      {/* Type Filter */}
      <Col xs="auto" style={{ minWidth: '150px' }}>
        <Form.Group>
          <Form.Label className="fw-medium">Type</Form.Label>
          <Form.Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border-secondary"
          >
            <option value="all">All Types</option>
            <option value="WO">Work Orders</option>
            <option value="PO">Purchase Orders</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Status Filter */}
      <Col xs="auto" style={{ minWidth: '150px' }}>
        <Form.Group>
          <Form.Label className="fw-medium">Status</Form.Label>
          <Form.Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-secondary"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially">Partially Paid</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Time Period Filter Type */}
      <Col xs="auto" style={{ minWidth: '150px' }}>
        <Form.Group>
          <Form.Label className="fw-medium">Time Period</Form.Label>
          <Form.Select
            value={timePeriodFilter}
            onChange={(e) => {
              const value = e.target.value;
              setTimePeriodFilter(value);
              
              // Reset all time period specific filters
              setDailyFilter({ day: "", month: "", year: "" });
              setWeeklyFilter({ week: "", month: "", year: "" });
              setMonthlyFilter({ month: "", year: "" });
              setQuarterlyFilter("");
              setFinancialYearFilter("");
              setDateRangeFilter({ startDate: "", endDate: "" });
              
              // Set default values for current selection
              const today = new Date();
              const currentYear = today.getFullYear().toString();
              const currentMonth = (today.getMonth() + 1).toString();
              
              if (value === "daily") {
                setDailyFilter({
                  day: today.getDate().toString(),
                  month: currentMonth,
                  year: currentYear
                });
              } else if (value === "weekly") {
                // Default to first week of current month
                setWeeklyFilter({
                  week: "1",
                  month: currentMonth,
                  year: currentYear
                });
              } else if (value === "monthly") {
                setMonthlyFilter({
                  month: currentMonth,
                  year: currentYear
                });
              } else if (value === "quarterly") {
                const quarter = Math.floor(today.getMonth() / 3);
                const quarters = ["q1", "q2", "q3", "q4"];
                setQuarterlyFilter(quarters[quarter]);
                setMonthlyFilter(prev => ({ ...prev, year: currentYear }));
              } else if (value === "financial_year") {
                // Set default financial year (current year - current year+1)
                const currentYearNum = today.getFullYear();
                const nextYearNum = currentYearNum + 1;
                const defaultFY = `${currentYearNum}-${nextYearNum}`;
                if (financialYears.includes(defaultFY)) {
                  setFinancialYearFilter(defaultFY);
                }
              }
            }}
            className="border-secondary"
          >
            <option value="">Select Period</option>
            {/* <option value="daily">Daily</option>
            <option value="weekly">Weekly</option> */}
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="financial_year">Financial Year</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Daily Filter */}
      {timePeriodFilter === "daily" && (
        <Col xs="auto" style={{ minWidth: '150px' }}>
          <Form.Group>
            <Form.Label className="fw-medium">Date</Form.Label>
            <Form.Control
              type="date"
              value={(() => {
                if (dailyFilter.year && dailyFilter.month && dailyFilter.day) {
                  const year = dailyFilter.year;
                  const month = dailyFilter.month.padStart(2, '0');
                  const day = dailyFilter.day.padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }
                return '';
              })()}
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  setDailyFilter({
                    day: date.getDate().toString(),
                    month: (date.getMonth() + 1).toString(),
                    year: date.getFullYear().toString()
                  });
                }
              }}
              className="border-secondary"
            />
          </Form.Group>
        </Col>
      )}

      {/* Weekly Filter */}
      {timePeriodFilter === "weekly" && (
        <>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Week</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={weeksForMonth.length || 53}
                value={weeklyFilter.week}
                onChange={(e) => setWeeklyFilter(prev => ({ ...prev, week: e.target.value }))}
                className="border-secondary"
                placeholder="Week #"
                disabled={!weeklyFilter.month || !weeklyFilter.year}
              />
            </Form.Group>
          </Col>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Month</Form.Label>
              <Form.Select
                value={weeklyFilter.month}
                onChange={(e) => setWeeklyFilter(prev => ({ ...prev, month: e.target.value, week: "" }))}
                className="border-secondary"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Year</Form.Label>
              <Form.Select
                value={weeklyFilter.year}
                onChange={(e) => setWeeklyFilter(prev => ({ ...prev, year: e.target.value, week: "" }))}
                className="border-secondary"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </>
      )}

      {/* Monthly Filter */}
      {timePeriodFilter === "monthly" && (
        <>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Month</Form.Label>
              <Form.Select
                value={monthlyFilter.month}
                onChange={(e) => setMonthlyFilter(prev => ({ ...prev, month: e.target.value }))}
                className="border-secondary"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Year</Form.Label>
              <Form.Select
                value={monthlyFilter.year}
                onChange={(e) => setMonthlyFilter(prev => ({ ...prev, year: e.target.value }))}
                className="border-secondary"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </>
      )}

      {/* Quarterly Filter */}
      {timePeriodFilter === "quarterly" && (
        <>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Quarter</Form.Label>
              <Form.Select
                value={quarterlyFilter}
                onChange={(e) => setQuarterlyFilter(e.target.value)}
                className="border-secondary"
              >
                <option value="">Select Quarter</option>
                <option value="q1">Q1 (Jan - Mar)</option>
                <option value="q2">Q2 (Apr - Jun)</option>
                <option value="q3">Q3 (Jul - Sep)</option>
                <option value="q4">Q4 (Oct - Dec)</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs="auto" style={{ minWidth: '150px' }}>
            <Form.Group>
              <Form.Label className="fw-medium">Year</Form.Label>
              <Form.Select
                value={monthlyFilter.year}
                onChange={(e) => setMonthlyFilter(prev => ({ ...prev, year: e.target.value }))}
                className="border-secondary"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </>
      )}

      {/* Financial Year Filter */}
      {timePeriodFilter === "financial_year" && (
        <Col xs="auto" style={{ minWidth: '180px' }}>
          <Form.Group>
            <Form.Label className="fw-medium">Financial Year</Form.Label>
            <Form.Select
              value={financialYearFilter}
              onChange={(e) => setFinancialYearFilter(e.target.value)}
              className="border-secondary"
            >
              <option value="">Select Financial Year</option>
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      )}

      {/* Vendor Filter */}
      <Col xs="auto" style={{ minWidth: '180px' }}>
        <Form.Group>
          <Form.Label className="fw-medium">Vendor (PO only)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filter by vendor"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            list="vendor-list"
            className="border-secondary mb-0"
          />
          <datalist id="vendor-list">
            {vendors.map((vendor, index) => (
              <option key={index} value={vendor} />
            ))}
          </datalist>
        </Form.Group>
      </Col>

      {/* Branch Filter */}
      <Col xs="auto" style={{ minWidth: '150px' }}>
        <Form.Group>
          <Form.Label className="fw-medium">Site</Form.Label>
          <Form.Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border-secondary"
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

      {/* Action Buttons */}
      <Col xs="auto" className="ms-auto">
        <div className="d-flex gap-2">
          <Button
            variant="danger"
            onClick={handleResetFilters}
            title="Reset All Filters"
          >
            <ArrowClockwise /> Reset
          </Button>
        </div>
      </Col>
    </Row>
    
    {/* Filter Summary */}
    <div className="mt-3 pt-3 border-top">
      <div className="d-flex align-items-center">
        <Badge bg="light" text="dark" className="me-2">
          Active Filters:
        </Badge>
        <span className="fw-semibold">{getFilterSummaryText()}</span>
      </div>
    </div>
  </Card.Body>
</Card>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Base</h6>
                  <h4 className="fw-bold mb-0">
                    {formatINR(totals.baseAmount)}
                  </h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <div className="text-primary fw-bold">₹</div>
                </div>
              </div>
              <small className="text-muted d-block">
  base amount of PO + WO during issued period
</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="border-0 shadow-sm h-100" >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Tax</h6>
                  <h4 className="fw-bold mb-0 text-info">
                    {formatINR(totals.tax)}
                  </h4>
                </div>
                <div className="bg-info bg-opacity-10 p-2 rounded">
                  <div className="text-info fw-bold">%</div>
                </div>
              </div>
              <small className="text-muted d-block">
  Total tax collected from PO + WO invoices
</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Paid</h6>
                  <h4 className="fw-bold mb-0 text-success">
                    {formatINR(totals.totalPaid)}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-2 rounded">
                  <div className="text-success fw-bold">✓</div>
                </div>
              </div>
              {/* <small className="text-muted">Amount received</small> */}
              <small className="text-muted d-block">
  Total amount paid for both PO + WO invoices
</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Due</h6>
                  <h4 className="fw-bold mb-0 text-warning">
                    {formatINR(totals.dueAmount)}
                  </h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-2 rounded">
                  <div className="text-warning fw-bold">!</div>
                </div>
              </div>
              {/* <small className="text-muted">Outstanding</small> */}
              <small className="text-muted d-block">
  Remaining unpaid amount of PO + WO invoices
</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Excess</h6>
                  <h4 className="fw-bold mb-0 text-danger">
                    {formatINR(totals.excessAmount)}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <div className="text-danger fw-bold">+</div>
                </div>
              </div>
              {/* <small className="text-muted">Overpayments</small> */}
              <small className="text-muted d-block">
  Amount exceeded over invoiced value for PO + WO
</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Invoiced</h6>
                  <h4 className="fw-bold mb-0 text-purple">
                    {formatINR(totals.totalInvoiced)}
                  </h4>
                </div>
                <div className="bg-purple bg-opacity-10 p-2 rounded">
                  <div className="text-purple fw-bold">📄</div>
                </div>
              </div>
              {/* <small className="text-muted">All invoices</small> */}
              <small className="text-muted d-block">
  Total base amount invoiced from PO + WO
</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Card className="shadow-sm">
        <Card.Body>
          
    <Row className="g-3 align-items-end my-3">
      <Col xs="auto">
        <Form.Group>
          <Form.Label className="fw-medium">Show Entries</Form.Label>
          <Form.Select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className="border-secondary"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading data...</p>
            </div>
          ) : (
            <>
<Table responsive hover className="mb-0">
  <thead className="table-light">
    <tr>
      <th>NUMBER</th>
      <th>TYPE</th>
      <th>INVOICES</th> {/* NEW: Show invoice stats */}
      <th>BASE AMOUNT</th>
      <th>TAX</th>
      {/* <th>TOTAL AMOUNT</th> */}
      <th>STATUS</th>
      <th>PAID AMOUNT</th>
      <th>DUE AMOUNT</th>
      <th>EXCESS AMOUNT</th>
      <th>ACTIONS</th>
    </tr>
  </thead>
  <tbody>
    {paginatedData.length > 0 ? (
      paginatedData.map((item, index) => (
        <tr key={`${item.type}-${item.number}-${index}`}>
          <td>
            <strong>{item.number}</strong>
            {item.vendor && (
              <div className="small text-muted">
                {item.vendor}
              </div>
            )}
            {item.branch?.name && (
              <div className="small text-muted">
                {item.branch.name}
              </div>
            )}
          </td>
          <td>
            <Badge
              bg={item.type === "WO" ? "primary" : "secondary"}
            >
              {item.type}
            </Badge>
          </td>
          <td> 
            <div>
              <span className="fw-bold">{item.invoiceStats?.totalCreated || 0}</span> total
            </div>
            {item.invoiceStats?.pendingCount > 0 && (
              <div className="small text-warning">
                <span className="fw-bold">{item.invoiceStats.pendingCount}</span> pending
              </div>
            )}
            {item.invoiceStats?.paidCount > 0 && (
              <div className="small text-success">
                <span className="fw-bold">{item.invoiceStats.paidCount}</span> paid
              </div>
            )}
          </td>
          <td>{formatINR(item.baseAmount)}</td>
          <td>{formatINR(item.tax)}</td>
          {/* <td>
            {formatINR(item.totalAmount)}
            {item.excessAmount > 0 && (
              <div className="small text-danger">
                +{formatINR(item.excessAmount)} excess
              </div>
            )}
          </td> */}
          <td>
            <Badge bg={getStatusVariant(item.status)}>
              {item.status}
            </Badge>
          </td>
          <td>{formatINR(item.totalPaid)}</td>
          <td>
            {formatINR(item.dueAmount)}
            {item.invoiceStats?.pendingCount > 0 && (
              <div className="small text-muted">
                from {item.invoiceStats.pendingCount} pending invoice{item.invoiceStats.pendingCount > 1 ? 's' : ''}
              </div>
            )}
          </td>
          <td>{formatINR(item.excessAmount)}</td>
          <td>
            <Button
              size="sm"
              variant="success"
              onClick={() => handleViewDetails(item)}
            >
              View Details
            </Button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="11" className="text-center py-4">
          <div className="text-muted">
            No data found. Try adjusting your filters.
          </div>
        </td>
      </tr>
    )}
  </tbody>
</Table>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + entries, filteredData.length)} of{" "}
                    {filteredData.length} entries
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <div className="d-flex align-items-center">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Preview Modal */}
      <InvoicePreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        data={previewData}
        title="Invoice Summary Preview"
      />
    </Container>
  );
};

export default InvoiceSummary;