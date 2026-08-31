import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Table, Breadcrumb, Badge } from "react-bootstrap";
import { Download, ArrowClockwise, Filter, CashStack, CreditCard, Calculator, CalendarDay, CalendarWeek, Wallet } from "react-bootstrap-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import expenseService from "../../../../services/expensessService";
import branchService from "../../../../services/branchService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExpenseSummaryPreviewModal from "./ExpenseSummaryPreviewModal";
import branchWalletService from "../../../../services/branchwalletService";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ✅ helper (safe, reusable)
const shortMonth = (m) => m.substring(0, 3).toUpperCase();

const formatINR = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

// Filter types
const FILTER_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  FINANCIAL_YEAR: "financial_year"
};

// Expense type filter
const EXPENSE_TYPE = {
  SITE_EXPENSE: "site_expense",
  COMPANY_EXPENSE: "company_expense"
};

const QUARTER_OPTIONS = [
  { value: "q1", label: "Q1 (Jan - Apr)" },
  { value: "q2", label: "Q2 (May - Aug)" },
  { value: "q3", label: "Q3 (Sep - Dec)" }
  // No Q4 needed as Q3 covers Sep-Dec (4 months)
];

// Financial year options
const FINANCIAL_YEAR_OPTIONS = [
  { value: "2025-2026", label: "2025-2026" },
  { value: "2024-2025", label: "2024-2025" },
  { value: "2023-2024", label: "2023-2024" }
];

// Taxability options
const TAXABILITY_OPTIONS = [
  { value: "all", label: "All (Taxable & Non-Taxable)" },
  { value: "taxable", label: "Taxable Only" },
  { value: "non-taxable", label: "Non-Taxable Only" }
];

const currentMonth = months[new Date().getMonth()];
const currentYear = new Date().getFullYear().toString();
const getCurrentQuarter = () => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 3) return "q1";      // Jan–Apr
  if (month >= 4 && month <= 7) return "q2";      // May–Aug
  return "q3";                                     // Sep–Dec
};

const getCurrentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // FY: April to March
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};


const ExpenseSummary = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("USER FROM STORAGE 👉", user);
  const userType = user?.type;
  const normalizedUserType = userType
  ?.toLowerCase()
  .replace(/\s+/g, "_");
  const isBranchManager = normalizedUserType === "branch_manager";
  const [quarter, setQuarter] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [filterType, setFilterType] = useState(FILTER_TYPES.MONTHLY);
  const [expenseBreakup, setExpenseBreakup] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  // NEW: Daily and Weekly states
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const [weekYear, setWeekYear] = useState(currentYear);
  // NEW: Taxability filter state
  const [taxabilityFilter, setTaxabilityFilter] = useState("all");
  // NEW: Expense type filter state
  const [expenseTypeFilter, setExpenseTypeFilter] = useState(EXPENSE_TYPE.SITE_EXPENSE);
  // NEW: Wallet data state
  const [walletData, setWalletData] = useState([]);
  // NEW: Site wallet summary state
  const [siteWalletSummary, setSiteWalletSummary] = useState({});
  // NEW: Filtered wallet summary state
  const [filteredWalletSummary, setFilteredWalletSummary] = useState({});
  // NEW: Raw data states
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawCreditPurchases, setRawCreditPurchases] = useState([]);
  // NEW: Raw wallet data state
  const [rawWalletData, setRawWalletData] = useState([]);

  // Fetch all data initially
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      const res = await branchService.getAll();
      setBranches(res || []);
    };
    fetchBranches();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilter();
  }, [rawExpenses,rawCreditPurchases,selectedBranch, taxabilityFilter, filterType, month, year, quarter, financialYear, selectedDate, weekNumber, weekYear, expenseTypeFilter]);
useEffect(() => {
  if (isBranchManager) {
    setExpenseTypeFilter(EXPENSE_TYPE.SITE_EXPENSE);
    setSelectedBranch("");
  }
}, [isBranchManager]);
useEffect(() => {
  const now = new Date();

  if (filterType === FILTER_TYPES.DAILY) {
    setSelectedDate(getCurrentDate());
  }

  if (filterType === FILTER_TYPES.WEEKLY) {
    setWeekNumber(getWeekNumber(now));
    setWeekYear(now.getFullYear().toString());
  }

  if (filterType === FILTER_TYPES.MONTHLY) {
    setMonth(months[now.getMonth()]);
    setYear(now.getFullYear().toString());
  }

  if (filterType === FILTER_TYPES.QUARTERLY) {
    setQuarter(getCurrentQuarter());
    setYear(now.getFullYear().toString());
  }

  if (filterType === FILTER_TYPES.FINANCIAL_YEAR) {
    setFinancialYear(getCurrentFinancialYear());
  }

}, [filterType]);

  const fetchAllData = async () => {
    try {
      const [expenseRes, creditRes, walletRes] = await Promise.all([
        expenseService.getAllExpenses(),
        expenseService.getAllCreditPurchases(),
        branchWalletService.getAllWallets(),
      ]);

      // Store raw data
      setRawExpenses(expenseRes?.data || []);
      setRawCreditPurchases(creditRes?.data || []);
      
      // Store raw wallet data
      const walletTransactions = walletRes?.data || [];
      setRawWalletData(walletTransactions);

      // Process initial data without filters - FIXED to include all data
      const initialData = {
        cashSubtotal: Array(12).fill(0),
        cashTax: Array(12).fill(0),
        cashTotal: Array(12).fill(0),
        creditSubtotal: Array(12).fill(0),
        creditTax: Array(12).fill(0),
        creditTotal: Array(12).fill(0)
      };

      // Process all expenses for initial display
      (expenseRes?.data || []).forEach(e => {
        if (!e.payment_date) return;
        const expenseDate = new Date(e.payment_date);
        const expenseMonth = expenseDate.getMonth();
        
        initialData.cashSubtotal[expenseMonth] += Number(e.subtotal || 0);
        initialData.cashTax[expenseMonth] += Number(e.tax_total || 0);
        initialData.cashTotal[expenseMonth] += Number(e.total_amount || 0);
      });

(creditRes?.data || []).forEach((c) => {

  if (!c.payment_status || c.payment_status.trim().toLowerCase() !== "paid") {
    return;
  }

  if (!c.payment_date) return;

  const purchaseDate = new Date(c.payment_date);
  const monthIndex = purchaseDate.getMonth();

  initialData.creditSubtotal[monthIndex] += Number(c.subtotal || 0);
  initialData.creditTax[monthIndex] += Number(c.tax_total || 0);
  initialData.creditTotal[monthIndex] += Number(c.total_amount || 0);
});

      setExpenseBreakup(initialData);
      applyDefaultCurrentMonthFilter(initialData);
      
      // Process initial wallet data without filters
      const walletSummary = processWalletData(walletTransactions);
      setSiteWalletSummary(walletSummary);
      setFilteredWalletSummary(walletSummary);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const processWalletData = (transactions, branchFilter = null, dateFilter = null) => {
    const summary = {};

    transactions.forEach(txn => {
      const branchId = txn.branch_id;
      
      // Apply branch filter if specified
      if (branchFilter && String(branchId) !== String(branchFilter)) {
        return;
      }
      
      // Apply date filter if specified
      if (dateFilter && txn.created_at) {
        const txnDate = new Date(txn.created_at);
        if (!dateFilter(txnDate)) {
          return;
        }
      }

      if (!summary[branchId]) {
        summary[branchId] = {
          branchName: txn.Branch?.name || `Branch ${branchId}`,
          totalCredited: 0,
          totalDebited: 0,
          currentBalance: 0,
          latestTime: null,
          transactions: []
        };
      }

      // Add transaction to branch's transaction list
      summary[branchId].transactions.push(txn);

      if (txn.transaction_type === "credit") {
        summary[branchId].totalCredited += Number(txn.amount || 0);
      }

      if (txn.transaction_type === "debit") {
        summary[branchId].totalDebited += Number(txn.amount || 0);
      }

      // pick the latest balance_after safely
      const txnTime = new Date(txn.created_at).getTime();
      if (
        !summary[branchId].latestTime ||
        txnTime > summary[branchId].latestTime
      ) {
        summary[branchId].latestTime = txnTime;
        summary[branchId].currentBalance = Number(txn.balance_after || 0);
      }
    });

    return summary;
  };

  const processExpenseData = (expenses, creditPurchases) => {
    const cashSubtotal = Array(12).fill(0);
    const cashTax = Array(12).fill(0);
    const cashTotal = Array(12).fill(0);

    const creditSubtotal = Array(12).fill(0);
    const creditTax = Array(12).fill(0);
    const creditTotal = Array(12).fill(0);

    return {
      cashSubtotal,
      cashTax,
      cashTotal,
      creditSubtotal,
      creditTax,
      creditTotal,
    };
  };

  const applyDefaultCurrentMonthFilter = (data) => {
    const monthIndex = months.indexOf(currentMonth);

    const filtered = {
      cashSubtotal: Array(12).fill(0),
      cashTax: Array(12).fill(0),
      cashTotal: Array(12).fill(0),
      creditSubtotal: Array(12).fill(0),
      creditTax: Array(12).fill(0),
      creditTotal: Array(12).fill(0),
    };

    Object.keys(data).forEach((key) => {
      filtered[key][monthIndex] = data[key][monthIndex];
    });

    setFilteredData(filtered);
    setIsFiltered(true);
  };

  const getDateFilterFunction = () => {
    switch (filterType) {
      case FILTER_TYPES.DAILY:
        if (!selectedDate) return null;
        const selected = new Date(selectedDate);
        return (date) => {
          return date.getDate() === selected.getDate() &&
                 date.getMonth() === selected.getMonth() &&
                 date.getFullYear() === selected.getFullYear();
        };
        
      case FILTER_TYPES.WEEKLY:
        if (!weekNumber || !weekYear) return null;
        const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
        return (date) => date >= weekRange.start && date <= weekRange.end;
        
      case FILTER_TYPES.MONTHLY:
        if (!month || !year) return null;
        const monthIndex = months.indexOf(month);
        return (date) => 
          date.getMonth() === monthIndex && 
          date.getFullYear().toString() === year;
        
case FILTER_TYPES.QUARTERLY:
  if (!quarter || !year) return null;
  const quarterMap = {
    q1: [0, 1, 2, 3],      // Jan, Feb, Mar, Apr
    q2: [4, 5, 6, 7],      // May, Jun, Jul, Aug
    q3: [8, 9, 10, 11]     // Sep, Oct, Nov, Dec
  };
  const quarterMonths = quarterMap[quarter] || [];
  return (date) => 
    quarterMonths.includes(date.getMonth()) && 
    date.getFullYear().toString() === year;
        
      case FILTER_TYPES.FINANCIAL_YEAR:
        if (!financialYear) return null;
        const [startYear] = financialYear.split('-');
        const nextYear = parseInt(startYear) + 1;
        const startDate = new Date(startYear, 3, 1); // April 1 of start year
        const endDate = new Date(nextYear, 2, 31); // March 31 of next year
        return (date) => date >= startDate && date <= endDate;
        
      default:
        return null;
    }
  };

  const applyFilter = () => {
    if (!rawExpenses.length && !rawCreditPurchases.length && !rawWalletData.length) return;

    const dateFilter = getDateFilterFunction();

    // Initialize arrays for all months
    let filtered = {
      cashSubtotal: Array(12).fill(0),
      cashTax: Array(12).fill(0),
      cashTotal: Array(12).fill(0),
      creditSubtotal: Array(12).fill(0),
      creditTax: Array(12).fill(0),
      creditTotal: Array(12).fill(0)
    };

    // Process cash expenses
    rawExpenses.forEach((e) => {
      if (!e.payment_date) return;
      if (selectedBranch && String(e.branch_id) !== String(selectedBranch)) return;
      
      // Check taxability for each item - FIXED FOR EMPTY ITEMS ARRAY
      let shouldInclude = true;
      if (taxabilityFilter !== "all") {
        // If expense has no items or empty items array, check tax_total directly
        if (!e.items || e.items.length === 0) {
          const hasTax = Number(e.tax_total || 0) > 0;
          if (taxabilityFilter === "taxable" && !hasTax) {
            shouldInclude = false;
          } else if (taxabilityFilter === "non-taxable" && hasTax) {
            shouldInclude = false;
          }
        } else {
          // Expense has items, check each item's taxability
          if (taxabilityFilter === "taxable") {
            shouldInclude = e.items.some(item => item.is_taxable === true);
          } else if (taxabilityFilter === "non-taxable") {
            shouldInclude = e.items.some(item => item.is_taxable === false);
          }
        }
      }
      
      if (!shouldInclude) return;
      
      const expenseDate = new Date(e.payment_date);
      
      // Apply date filter
      if (dateFilter && !dateFilter(expenseDate)) return;
      
      const expenseMonth = expenseDate.getMonth();
      
      filtered.cashSubtotal[expenseMonth] += Number(e.subtotal || 0);
      filtered.cashTax[expenseMonth] += Number(e.tax_total || 0);
      filtered.cashTotal[expenseMonth] += Number(e.total_amount || 0);
    });

// CREDIT PURCHASES (STRICT PAID ONLY)
rawCreditPurchases.forEach((c) => {
  console.log("STATUS CHECK 👉", c.id, `"${c.payment_status}"`);

  // 1️⃣ Only paid
  if (!c.payment_status || c.payment_status.trim().toLowerCase() !== "paid") {
    return;
  }

  // 2️⃣ Must have payment date
  if (!c.payment_date) return;

  // 3️⃣ Branch filter
  if (selectedBranch && String(c.branch_id) !== String(selectedBranch)) {
    return;
  }

  const purchaseDate = new Date(c.payment_date);

  // 4️⃣ Date filter
  if (dateFilter && !dateFilter(purchaseDate)) {
    return;
  }

  const monthIndex = purchaseDate.getMonth();

  filtered.creditSubtotal[monthIndex] += Number(c.subtotal || 0);
  filtered.creditTax[monthIndex] += Number(c.tax_total || 0);
  filtered.creditTotal[monthIndex] += Number(c.total_amount || 0);
});


    setFilteredData(filtered);
    
    // Process wallet data with same filters
    const filteredWalletSummary = processWalletData(rawWalletData, selectedBranch || null, dateFilter || null);
    setFilteredWalletSummary(filteredWalletSummary);
    
    setIsFiltered(true);
  };

  const clearFilter = () => {
    const now = new Date();

    setFilterType(FILTER_TYPES.MONTHLY);
    setMonth(months[now.getMonth()]);
    setYear(now.getFullYear().toString());
    setQuarter("");
    setFinancialYear("");
    setSelectedBranch("");
    setSelectedDate(getCurrentDate());
    setWeekNumber(getWeekNumber(now));
    setWeekYear(now.getFullYear().toString());
    setTaxabilityFilter("all");
    setExpenseTypeFilter(EXPENSE_TYPE.SITE_EXPENSE);

    // Reset to show all data
    if (expenseBreakup) {
      applyDefaultCurrentMonthFilter(expenseBreakup);
    }
    
    // Reset wallet data to show all
    setFilteredWalletSummary(siteWalletSummary);

    setIsFiltered(false);
  };
// ✅ Dynamic chart data based on filter period
const getChartData = () => {
  // FINANCIAL YEAR - Show Apr to Mar
  if (filterType === FILTER_TYPES.FINANCIAL_YEAR && financialYear) {
    const fyOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];
    return fyOrder.map((monthIndex) => ({
      period: months[monthIndex],
      name: shortMonth(months[monthIndex]),
      fullName: months[monthIndex],
      value: (filteredData?.cashTotal[monthIndex] || 0) +
             (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 0 : (filteredData?.creditTotal[monthIndex] || 0)),
    }));
  }
if (filterType === FILTER_TYPES.QUARTERLY && quarter && year) {
  const quarterMap = {
    q1: [0, 1, 2, 3],      // Jan-Apr
    q2: [4, 5, 6, 7],      // May-Aug
    q3: [8, 9, 10, 11]     // Sep-Dec
  };
  const monthIndices = quarterMap[quarter] || [];
  return monthIndices.map((monthIndex) => ({
    period: months[monthIndex],
    name: shortMonth(months[monthIndex]),
    fullName: months[monthIndex],
    value: (filteredData?.cashTotal[monthIndex] || 0) +
           (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 0 : (filteredData?.creditTotal[monthIndex] || 0)),
  }));
}
  
if (filterType === FILTER_TYPES.MONTHLY && month && year) {
  const monthIndex = months.indexOf(month);
  return [{
    period: months[monthIndex],
    name: shortMonth(months[monthIndex]),
    fullName: `${months[monthIndex]} ${year}`,
    value: (filteredData?.cashTotal[monthIndex] || 0) +
           (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 0 : (filteredData?.creditTotal[monthIndex] || 0)),
  }];
}
  
  // WEEKLY - Show days of the week
  if (filterType === FILTER_TYPES.WEEKLY && weekNumber && weekYear) {
    const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekRange.start);
      day.setDate(weekRange.start.getDate() + i);
      
      // You need to aggregate data by day here
      // This requires daily filtered data from your backend
      days.push({
        period: day.toISOString().split('T')[0],
        name: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        fullName: day.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
        value: 0, // Calculate from daily data
      });
    }
    return days;
  }
  
  // DAILY - Show single day
  if (filterType === FILTER_TYPES.DAILY && selectedDate) {
    const date = new Date(selectedDate);
    return [{
      period: selectedDate,
      name: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      fullName: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      value: 0, // Calculate from daily data
    }];
  }
  
  // DEFAULT - Show all 12 months
  return months.map((m, i) => ({
    period: m,
    name: shortMonth(m),
    fullName: m,
    value: (filteredData?.cashTotal[i] || 0) +
           (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 0 : (filteredData?.creditTotal[i] || 0)),
  }));
};

const chartData = getChartData();

// ✅ Dynamic Y-axis domain based on data
const getYAxisDomain = () => {
  const values = chartData.map(d => d.value);
  const maxValue = Math.max(...values, 0);
  
  if (maxValue === 0) {
    return [0, 100]; // Default range when no data
  }
  
  // Add 20% padding to top
  return [0, Math.ceil(maxValue * 1.2)];
};
// ✅ Dynamic X-axis interval based on number of data points
const getXAxisInterval = () => {
  const dataLength = chartData.length;
  
  // For single data point - show the label
  if (dataLength === 1) {
    return 0;
  }
  
  // For financial year - ALWAYS show all 12 months
  if (filterType === FILTER_TYPES.FINANCIAL_YEAR) {
    return 0; // Show all labels
  }
  
  // For other filters
  if (dataLength <= 12) {
    return 0; // Show all labels
  } else {
    return Math.floor(dataLength / 6); // Show ~6 labels
  }
};
// Calculate totals based on filtered data - FIXED
const calculateTotals = () => {
  if (!filteredData) return { cashTotal: 0, creditTotal: 0, totalTax: 0, overallTotal: 0 };
  
  const cashTotalSum = filteredData.cashTotal.reduce((a, b) => a + b, 0);
  
  // FIX: Always calculate credit total, regardless of expense type
  const creditTotalSum = filteredData.creditTotal.reduce((a, b) => a + b, 0);
  
  const cashTaxSum = filteredData.cashTax.reduce((a, b) => a + b, 0);
  const creditTaxSum = filteredData.creditTax.reduce((a, b) => a + b, 0);
  
  return {
    cashTotal: cashTotalSum,
    creditTotal: creditTotalSum, // Now this will show for site expense too
    totalTax: cashTaxSum + creditTaxSum,
    overallTotal: cashTotalSum + creditTotalSum
  };
};

  const totals = calculateTotals();

  // Calculate wallet totals from filtered wallet data
  const calculateSiteWalletTotals = () => {
    let totalCredited = 0;
    let totalDebited = 0;
    let totalBalance = 0;

    Object.values(filteredWalletSummary).forEach(site => {
      totalCredited += site.totalCredited;
      totalDebited += site.totalDebited;
      totalBalance += site.currentBalance;
    });

    return {
      totalCredited,
      totalDebited,
      totalBalance,
      siteCount: Object.keys(filteredWalletSummary).length
    };
  };

  const walletTotals = calculateSiteWalletTotals();
// Update buildTableData to show both cash and credit for site expense
const buildTableData = () => {
  return months.map((m, i) => {
    const row = {
      Month: m,
      // Keep Expense column as total of both cash and credit for all expense types
      // Expense: (filteredData?.cashTotal[i] || 0) + (filteredData?.creditTotal[i] || 0)
    };

    // For site expense - show BOTH cash and credit
    if (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE) {
      // Cash columns
      row.CashPurchase_Base = filteredData?.cashSubtotal[i] || 0;
      row.CashPurchase_GST = filteredData?.cashTax[i] || 0;
      row.CashPurchase_Total = filteredData?.cashTotal[i] || 0;
      
      // Credit columns (for site level credit purchases)
      row.CreditPurchase_Base = filteredData?.creditSubtotal[i] || 0;
      row.CreditPurchase_GST = filteredData?.creditTax[i] || 0;
      row.CreditPurchase_Total = filteredData?.creditTotal[i] || 0;
      
      // Combined total (for reference)
      row.Total = (filteredData?.cashTotal[i] || 0) + (filteredData?.creditTotal[i] || 0);
    } 
    // For company expense - show only credit
    else {
      row.Base = filteredData?.creditSubtotal[i] || 0;
      row.Tax = filteredData?.creditTax[i] || 0;
      row.Total = filteredData?.creditTotal[i] || 0;
    }

    return row;
  });
};
  const calculateTaxSummary = () => {
    if (!filteredData) {
      return { cashTax: 0, creditTax: 0, totalTax: 0 };
    }

    const cashTax = filteredData.cashTax.reduce((a, b) => a + b, 0);
    const creditTax = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 0 : filteredData.creditTax.reduce((a, b) => a + b, 0);

    return {
      cashTax,
      creditTax,
      totalTax: cashTax + creditTax,
    };
  };

  const taxSummary = calculateTaxSummary();

  const getFilterHeading = () => {
    let parts = [];

    if (filterType === FILTER_TYPES.DAILY && selectedDate) {
      const dateObj = new Date(selectedDate);
      parts.push(`Date: ${dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
    }

    if (filterType === FILTER_TYPES.WEEKLY && weekNumber && weekYear) {
      const weekRange = getWeekRange(Number(weekNumber), Number(weekYear));
      const start = weekRange.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const end = weekRange.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      parts.push(`Week ${weekNumber}, ${weekYear} (${start} - ${end})`);
    }

    if (filterType === FILTER_TYPES.MONTHLY && month && year) {
      parts.push(`Month: ${month} ${year}`);
    }
if (filterType === FILTER_TYPES.QUARTERLY && quarter && year) {
  const quarterLabels = {
    q1: "Q1 (Jan - Apr)",
    q2: "Q2 (May - Aug)",
    q3: "Q3 (Sep - Dec)"
  };
  parts.push(`Quarter: ${quarterLabels[quarter]} ${year}`);
}
    if (filterType === FILTER_TYPES.FINANCIAL_YEAR && financialYear) {
      parts.push(`Financial Year: ${financialYear}`);
    }

    if (taxabilityFilter !== "all") {
      const taxLabel = TAXABILITY_OPTIONS.find(t => t.value === taxabilityFilter)?.label;
      parts.push(`Taxability: ${taxLabel}`);
    }

    if (expenseTypeFilter) {
      const expenseLabel = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? "Site Expense" : "Company Expense";
      parts.push(`Expense Type: ${expenseLabel}`);
    }

    if (selectedBranch) {
      const branchName = branches.find(b => String(b.id) === String(selectedBranch))?.name;
      parts.push(`Site: ${branchName}`);
    }

    return parts.join(" | ");
  };
// Update the exportExcel function in ExpenseSummary component:
const exportExcel = () => {
  const rows = [];

  const filterHeading = getFilterHeading();
  if (filterHeading) {
    rows.push({ Month: "FILTER", Total_Expense: filterHeading });
    rows.push({});
  }

  // Use buildTableData function which already respects expenseTypeFilter
  rows.push(...buildTableData());

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  
  const sheetName = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
    ? "Site Expense Summary" 
    : "Company Expense Summary";
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
};
// Update the exportPDF function in ExpenseSummary component:
const exportPDF = () => {
  const doc = new jsPDF("l", "pt");
  const filterHeading = getFilterHeading();

  doc.text(
    expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
      ? "Site Expense Summary (Cash & Credit)" 
      : "Company Expense Summary (Credit Purchase)", 
    40, 30
  );

  if (filterHeading) {
    doc.setFontSize(10);
    doc.text(filterHeading, 40, 45);
  }

  const tableData = buildTableData();
  const headers = Object.keys(tableData[0] || {});
  
  autoTable(doc, {
    startY: filterHeading ? 65 : 50,
    head: [headers],
    body: tableData.map(r => Object.values(r)),
    styles: { fontSize: 8 },
  });

  const fileName = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
    ? "Site_Expense_Summary.pdf" 
    : "Company_Expense_Summary.pdf";
  
  doc.save(fileName);
};
  return (
    <div className="p-3 shadow-sm border-0 overflow-x-hidden">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Expense Summary</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Expense Summary</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="text-end">
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="info" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
            <Button variant="success" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="danger" onClick={exportPDF}>
              Export PDF
            </Button>
          </div>
        </Col>
      </Row>

{expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE && (
  <Row className="mb-4 g-3">
    {/* Total Company Credit */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <h6 className="text-muted text-uppercase small mb-1">Total Company Credit</h6>
          <h3 className="fw-bold text-purple">
            {formatINR(walletTotals.totalCredited)}
          </h3>
          <span className="badge bg-light text-dark">
            {walletTotals.siteCount} sites
          </span>
        </Card.Body>
      </Card>
    </Col>

    {/* Total Credit Purchase */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <h6 className="text-muted text-uppercase small mb-1">Total Credit Purchase</h6>
          <h3 className="fw-bold text-primary">
            {formatINR(totals.creditTotal)}
          </h3>
          <span className="badge bg-light text-dark">Base + GST</span>
        </Card.Body>
      </Card>
    </Col>

    {/* Total GST */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <h6 className="text-muted text-uppercase small mb-1">Total GST Amount</h6>
          <h3 className="fw-bold text-warning">
            {formatINR(totals.totalTax)}
          </h3>
        </Card.Body>
      </Card>
    </Col>

    {/* Active Sites */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <h6 className="text-muted text-uppercase small mb-1">Active Sites</h6>
          <h3 className="fw-bold text-indigo">
            {walletTotals.siteCount}
          </h3>
          <span className="badge bg-light text-dark">
            {branches.length} total
          </span>
        </Card.Body>
      </Card>
    </Col>
  </Row>
)}

{expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE && (
  <Row className="mb-4 g-3">
    {/* Card 1: Cash Purchase */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="bg-success bg-opacity-10 p-2 rounded-3">
              <CashStack size={20} className="text-success" />
            </div>
            <Badge bg="success" className="px-2 py-1">Cash</Badge>
          </div>
          <h6 className="text-muted text-uppercase small mb-1">Total Cash Purchase</h6>
          <h3 className="fw-bold text-success mb-2">
            {formatINR(totals.cashTotal)}
          </h3>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Base + GST</span>
            <span className="badge bg-light text-dark">
              {filteredData?.cashTotal.filter(v => v > 0).length || 0} months
            </span>
          </div>
        </Card.Body>
      </Card>
    </Col>

    {/* Card 2: Credit Purchase - NEW CARD for Site Expense */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <CreditCard size={20} className="text-primary" />
            </div>
            <Badge bg="primary" className="px-2 py-1">Credit</Badge>
          </div>
          <h6 className="text-muted text-uppercase small mb-1">Total Credit Purchase</h6>
          <h3 className="fw-bold text-primary mb-2">
            {formatINR(totals.creditTotal)}
          </h3>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Base + GST</span>
            <span className="badge bg-light text-dark">
              {filteredData?.creditTotal.filter(v => v > 0).length || 0} months
            </span>
          </div>
        </Card.Body>
      </Card>
    </Col>

    {/* Card 3: Total GST Amount */}
    <Col lg={3} md={6}>
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="bg-warning bg-opacity-10 p-2 rounded-3">
              <Calculator size={20} className="text-warning" />
            </div>
            <Badge bg="warning" className="px-2 py-1">GST</Badge>
          </div>
          <h6 className="text-muted text-uppercase small mb-1">Total GST Amount</h6>
          <h3 className="fw-bold text-warning mb-2">{formatINR(totals.totalTax)}</h3>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Cash + Credit</span>
            <span className="badge bg-light text-dark">
              {((totals.totalTax / totals.overallTotal) * 100 || 0).toFixed(1)}%
            </span>
          </div>
        </Card.Body>
      </Card>
    </Col>
    
<Col lg={3} md={6}>
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-3">
      
      {/* Top Section */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="bg-info bg-opacity-10 p-2 rounded-3">
          <Calculator size={20} className="text-info" />
        </div>
        <Badge bg="info" className="px-2 py-1">Total Expense</Badge>
      </div>

      {/* Title */}
      <h6 className="text-muted text-uppercase small mb-1">
        Overall Total (Cash + Credit)
      </h6>

      {/* Amount */}
      <h3 className="fw-bold text-info mb-2">
        {formatINR(totals.overallTotal)}
      </h3>

      {/* Bottom Row */}
      <div className="d-flex justify-content-between align-items-center">
        <span className="text-muted small">All Expenses</span>
        <span className="badge bg-light text-dark">
          100%
        </span>
      </div>

    </Card.Body>
  </Card>
</Col>

  </Row>
)}
      {/* Filters Card */}
      <Card className="mb-4 border shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <Filter className="me-2 text-primary" />
            <h5 className="mb-0">Filter Options</h5>
          </div>
          
          <Row className="g-3 align-items-end">
{!isBranchManager && (
  <Col xs="auto" style={{ minWidth: '180px' }}>
    <Form.Group>
      <Form.Label className="fw-medium">Expense Type</Form.Label>
      <Form.Select
        value={expenseTypeFilter}
        onChange={(e) => setExpenseTypeFilter(e.target.value)}
        className="border-secondary"
      >
        <option value={EXPENSE_TYPE.SITE_EXPENSE}>Site Expense</option>
        <option value={EXPENSE_TYPE.COMPANY_EXPENSE}>Company Expense</option>
      </Form.Select>
    </Form.Group>
  </Col>
)}


            <Col xs="auto" style={{ minWidth: '150px' }}>
              <Form.Group>
                <Form.Label className="fw-medium">Filter Type</Form.Label>
                <Form.Select 
                  value={filterType} 
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setMonth("");
                    setQuarter("");
                    setFinancialYear("");
                    setSelectedDate(getCurrentDate());
                    const now = new Date();
                    setWeekNumber(getWeekNumber(now));
                    setWeekYear(now.getFullYear().toString());
                  }}
                  className="border-secondary"
                >
                  {/* <option value={FILTER_TYPES.DAILY}>Daily</option> */}
                  {/* <option value={FILTER_TYPES.WEEKLY}>Weekly</option> */}
                  <option value={FILTER_TYPES.MONTHLY}>Monthly</option>
                  <option value={FILTER_TYPES.QUARTERLY}>Quarterly</option>
                  <option value={FILTER_TYPES.FINANCIAL_YEAR}>Financial Year</option>
                </Form.Select>
              </Form.Group>
            </Col>

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
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)}
                      className="border-secondary"
                    >
                      <option value="">Select Month</option>
                      {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
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

            {filterType === FILTER_TYPES.QUARTERLY && (
              <>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Quarter</Form.Label>
                    <Form.Select 
                      value={quarter} 
                      onChange={(e) => setQuarter(e.target.value)}
                      className="border-secondary"
                    >
                      <option value="">Select Quarter</option>
                      {QUARTER_OPTIONS.map(q => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: '150px' }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
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
                    value={financialYear} 
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="border-secondary"
                  >
                    <option value="">Select Financial Year</option>
                    {FINANCIAL_YEAR_OPTIONS.map(fy => (
                      <option key={fy.value} value={fy.value}>{fy.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            
            {/* Taxability Filter */}
            <Col xs="auto" style={{ minWidth: '150px' }}>
              <Form.Group>
                <Form.Label className="fw-medium">Taxability</Form.Label>
                <Form.Select
                  value={taxabilityFilter}
                  onChange={(e) => setTaxabilityFilter(e.target.value)}
                  className="border-secondary"
                >
                  {TAXABILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
{!isBranchManager && (
  <Col xs="auto" style={{ minWidth: '180px' }}>
    <Form.Group>
      <Form.Label className="fw-medium">Sites</Form.Label>
      <Form.Select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="border-secondary"
      >
        <option value="">All Sites</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  </Col>
)}


            {/* Action Buttons */}
            <Col xs="auto" className="ms-auto">
              <div className="d-flex gap-2">
                {/* <Button 
                  variant="primary" 
                  onClick={applyFilter}
                  className="d-flex align-items-center"
                >
                  <Filter className="me-1" /> Apply
                </Button> */}
                <Button
                  variant="danger"
                  onClick={clearFilter}
                  title="Reset Filters"
                >
                  <ArrowClockwise />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Chart */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
<AreaChart data={chartData}>
  <defs>
    <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#dc3545" stopOpacity={0.4} />
      <stop offset="95%" stopColor="#dc3545" stopOpacity={0.05} />
    </linearGradient>
  </defs>

  <CartesianGrid strokeDasharray="3 3" vertical={false} />
<XAxis 
  dataKey="name" 
  interval={0} // Always show all labels for the data we have
  angle={chartData.length === 1 ? 0 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? -45 : (chartData.length > 6 ? -45 : 0))}
  textAnchor={chartData.length === 1 ? "middle" : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? "end" : (chartData.length > 6 ? "end" : "middle"))}
  height={chartData.length === 1 ? 30 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? 60 : (chartData.length > 6 ? 60 : 30))}
  tick={{ fontSize: chartData.length === 1 ? 14 : (filterType === FILTER_TYPES.FINANCIAL_YEAR ? 11 : (chartData.length > 10 ? 10 : 12)) }}
  tickLine={chartData.length > 1} // Hide tick lines for single data point
  axisLine={chartData.length > 1} // Hide axis line for single data point
/>
  
  {/* DYNAMIC Y-AXIS */}
  <YAxis 
    tickFormatter={formatINR}
    domain={getYAxisDomain()}
    width={80}
    tick={{ fontSize: 12 }}
  />
  
  <Tooltip 
    formatter={(v) => formatINR(v)}
    labelFormatter={(label) => {
      const item = chartData.find(d => d.name === label);
      return item?.fullName || label;
    }}
  />

  <Area
    type="monotone"
    dataKey="value"
    stroke="#dc3545"
    strokeWidth={2}
    fill="url(#expenseColor)"
  />
</AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Site Wallet Table - Show only when Company Expense is selected */}
      {expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-light border-bottom">
            <h5 className="mb-0">
              <Wallet className="me-2 text-purple" />
              Site Wallet Summary - Company Credit to Sites
              {selectedBranch && (
                <Badge bg="info" className="ms-2">
                  Filtered: {branches.find(b => String(b.id) === String(selectedBranch))?.name}
                </Badge>
              )}
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Site Name</th>
                    <th className="text-end">Total Credited</th>
                    <th className="text-end">Total Used</th>
                    <th className="text-end">Current Balance</th>
                    <th className="text-end">Usage %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(filteredWalletSummary).map(([branchId, site]) => (
                    <tr key={branchId}>
                      <td className="fw-medium">{site.branchName}</td>
                      <td className="text-end text-success fw-bold">{formatINR(site.totalCredited)}</td>
                      <td className="text-end text-danger fw-bold">{formatINR(site.totalDebited)}</td>
                      <td className="text-end text-primary fw-bold">{formatINR(site.currentBalance)}</td>
                      <td className="text-end">
                        <span className={`badge ${site.totalCredited > 0 ? (site.totalDebited / site.totalCredited * 100 > 80 ? 'bg-danger' : 'bg-success') : 'bg-secondary'}`}>
                          {site.totalCredited > 0 ? ((site.totalDebited / site.totalCredited) * 100).toFixed(1) : '0'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(filteredWalletSummary).length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No wallet data found for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td className="fw-bold">TOTAL</td>
                    <td className="text-end text-success fw-bold">{formatINR(walletTotals.totalCredited)}</td>
                    <td className="text-end text-danger fw-bold">{formatINR(walletTotals.totalDebited)}</td>
                    <td className="text-end text-primary fw-bold">{formatINR(walletTotals.totalBalance)}</td>
                    <td className="text-end">
                      <span className="badge bg-info">
                        {walletTotals.totalCredited > 0 ? ((walletTotals.totalDebited / walletTotals.totalCredited) * 100).toFixed(1) : '0'}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Expense Summary Table */}
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
  {/* ===== Cash & Credit Purchase Sections - Show both when Site Expense is selected ===== */}
  {expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE && (
    <>
      {/* Cash Purchase Section */}
      <tr className="fw-semibold">
        <td>Cash Purchase :</td>
        {months.map((_, i) => (
          <td key={i}></td>
        ))}
      </tr>

      <tr>
        <td>Base Amount</td>
        {filteredData?.cashSubtotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr>
        <td>GST Amount</td>
        {filteredData?.cashTax.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr className="fw-bold">
        <td>Total Amount</td>
        {filteredData?.cashTotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      {/* Credit Purchase Section - for Site level */}
      <tr className="fw-semibold mt-2">
        <td>Credit Purchase (Site Level) :</td>
        {months.map((_, i) => (
          <td key={i}></td>
        ))}
      </tr>

      <tr>
        <td>Base Amount</td>
        {filteredData?.creditSubtotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr>
        <td>GST Amount</td>
        {filteredData?.creditTax.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr className="fw-bold">
        <td>Total Amount</td>
        {filteredData?.creditTotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>
    </>
  )}

  {/* ===== Credit Purchase Section - Show only when Company Expense is selected ===== */}
  {expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE && (
    <>
      <tr className="fw-semibold mt-2">
        <td>Credit Purchase :</td>
        {months.map((_, i) => (
          <td key={i}></td>
        ))}
      </tr>

      <tr>
        <td>Base Amount</td>
        {filteredData?.creditSubtotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr>
        <td>GST Amount</td>
        {filteredData?.creditTax.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>

      <tr className="fw-bold">
        <td>Total Amount</td>
        {filteredData?.creditTotal.map((v, i) => (
          <td key={i}>{formatINR(v)}</td>
        ))}
      </tr>
    </>
  )}
</tbody>
        </table>
      </div>
<ExpenseSummaryPreviewModal
  show={showPreview}
  onHide={() => setShowPreview(false)}
  months={months}
  filteredData={filteredData}
  filterHeading={getFilterHeading()}
  expenseTypeFilter={expenseTypeFilter}  // Add this
  walletSummary={expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE ? filteredWalletSummary : null}
  walletTotals={expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE ? walletTotals : null}
/>
    </div>
  );
};

export default ExpenseSummary;