import React, { useEffect, useState } from "react";
import {Card,Row,Col,Form,Button,Breadcrumb,ProgressBar,Badge,Container,Alert,ButtonGroup,Tab,Tabs,Accordion,} from "react-bootstrap";
import {Download,ArrowClockwise,InfoCircle,Calculator,FileEarmarkText,ChevronDown,ChevronUp,PieChart,Calendar,Filter,ChevronRight,CashStack,CreditCard,GraphUp,GraphDown,Bank,} from "react-bootstrap-icons";

import expenseService from "../../../../services/expensessService";
import salebillService from "../../../../services/salebillService";
import purchaseService from "../../../../services/purchaseService";
import workOrderService from "../../../../services/workOrderService";
import branchService from "../../../../services/branchService";

import ExpenseTaxSummary from "./ExpenseTaxSummaryLogic";
import IncomeTaxSummary from "./IncomeTaxSummary";
import { Modal, Table } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TaxSummaryModal from "./TaxSummaryModal";

/* -------------------- Constants -------------------- */

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const quarters = [
  { label: "Q1 (Apr-Jun)", start: 3, end: 5 },
  { label: "Q2 (Jul-Sep)", start: 6, end: 8 },
  { label: "Q3 (Oct-Dec)", start: 9, end: 11 },
  { label: "Q4 (Jan-Mar)", start: 0, end: 2 }
];

const createEmptyTaxData = () => ({
  CGST: Array(12).fill(0),
  SGST: Array(12).fill(0),
  IGST: Array(12).fill(0),
});

/* -------------------- Helpers -------------------- */

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

const getFinancialYearRange = (fy) => {
  const [start, end] = fy.split("-").map(Number);
  return {
    start: new Date(start, 3, 1),
    end: new Date(end, 2, 31),
  };
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

const filterByDate = (records, filterType, options) =>
  records.filter((r) => {
    const rawDate = r.invoice_date || r.date || r.payment_date || r.created_at || r.createdAt;
    const date = new Date(rawDate);
    if (isNaN(date)) return false;

    const month = date.getMonth();
    const year = date.getFullYear();

    if (filterType === "daily") {
      const selected = new Date(options.date);
      return (
        date.getDate() === selected.getDate() &&
        date.getMonth() === selected.getMonth() &&
        date.getFullYear() === selected.getFullYear()
      );
    }

    if (filterType === "weekly") {
      if (!options.weekNumber || !options.weekYear) return false;
      const week = getWeekRange(Number(options.weekNumber), Number(options.weekYear));
      return date >= week.start && date <= week.end;
    }

    if (filterType === "monthly") {
      return month === Number(options.month) && year === Number(options.year);
    }

    if (filterType === "quarterly") {
      const startMonth = Number(options.startMonth);
      const endMonth = Number(options.endMonth);

      
      if (isNaN(startMonth) || isNaN(endMonth)) return false;
      
      return month >= startMonth && month <= endMonth && year === Number(options.year);
    }

    if (filterType === "financial") {
      const { start, end } = getFinancialYearRange(options.fy);
      return date >= start && date <= end;
    }

    return true;
  });

// MODIFIED: Function to filter data by GST type
const filterByGSTType = (data, gstType) => {
  if (gstType === "all") return data;
  
  // Keep only the selected GST type and set others to zero
  const filteredData = createEmptyTaxData();
  
  months.forEach((_, monthIndex) => {
    if (gstType === "CGST+SGST") {
      // Show combined CGST+SGST
      filteredData.CGST[monthIndex] = data.CGST[monthIndex];
      filteredData.SGST[monthIndex] = data.SGST[monthIndex];
    } else {
      filteredData[gstType][monthIndex] = data[gstType][monthIndex];
    }
  });
  
  return filteredData;
};

// MODIFIED: Build expense tax data considering GST type from tax_type field
const buildExpenseTaxData = (expenses = [], credits = []) => {
  const taxData = createEmptyTaxData();
  const allRecords = [...expenses, ...credits];
  
  allRecords.forEach((record) => {
    const date = new Date(record.payment_date || record.created_at || record.createdAt);
    if (isNaN(date)) return;

    const month = date.getMonth();
    
    // For expenses with items
    if (record.items && record.items.length > 0) {
      record.items.forEach((item) => {
        const taxAmount = Number(item.tax_total || 0);
        if (!taxAmount) return;
        const taxType = item.tax_type?.toLowerCase();
        
        if (taxType === "inclusive" || taxType === "exclusive") {
          // For now, split between CGST and SGST
          taxData.CGST[month] += taxAmount / 2;
          taxData.SGST[month] += taxAmount / 2;
        } else {
          taxData.CGST[month] += taxAmount / 2;
          taxData.SGST[month] += taxAmount / 2;
        }
      });
    } else {
      // For records without items array
      const tax = Number(record.tax_total || 0);
      if (!tax) return;
      
      // Split between CGST and SGST
      taxData.CGST[month] += tax / 2;
      taxData.SGST[month] += tax / 2;
    }
  });
  
  return taxData;
};

// MODIFIED: Build income tax data considering explicit CGST/SGST/IGST fields
// MODIFIED: Build income tax data considering explicit CGST/SGST/IGST fields
// ONLY includes records with status = "paid" (case insensitive)
const isBranchMatch = (item, branchId) => {
  if (!branchId || branchId === "") return true;
  const bId = String(branchId);
  return String(item.assigned_to) === bId || String(item.branch_id) === bId;
};

const extractDataFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (response && response.success && Array.isArray(response.data)) return response.data;
  if (response && response.data && Array.isArray(response.data)) return response.data;
  if (response && typeof response === "object") {
    for (const key in response) {
      if (Array.isArray(response[key])) return response[key];
    }
  }
  return [];
};

const buildIncomeTaxData = (saleBills = [], selectedBranch = "") => {
  const taxData = createEmptyTaxData();
  
  saleBills.forEach((bill) => {
    // Branch matching
    if (!isBranchMatch(bill, selectedBranch)) return;

    // Status check - allow case-insensitive "paid" or if status is missing but user wanted all
    const isPaid = bill.status && bill.status.toLowerCase() === "paid";
    if (!isPaid) return;

    const rawDate = bill.invoice_date || bill.date || bill.created_at || bill.createdAt;
    const date = new Date(rawDate);
    if (isNaN(date)) return;

    const month = date.getMonth();
    
    // Sum taxes from services array
    const services = bill.services || [];
    if (Array.isArray(services)) {
      services.forEach(service => {
        const taxVal = Number(service.tax_amount || service.gst_amount || 0);
        if (taxVal === 0) return;

        // If we have explicit breakdowns, use them
        const cgstAmt = Number(service.cgst_amount || 0);
        const sgstAmt = Number(service.sgst_amount || 0);
        const igstAmt = Number(service.igst_amount || 0);

        if (cgstAmt > 0 || sgstAmt > 0 || igstAmt > 0) {
          taxData.CGST[month] += cgstAmt;
          taxData.SGST[month] += sgstAmt;
          taxData.IGST[month] += igstAmt;
        } else {
          // Fallback: If no breakdown but tax exists, check if it's IGST
          const igstRate = Number(service.igst || 0);
          if (igstRate > 0) {
            taxData.IGST[month] += taxVal;
          } else {
            // Default breakdown 50/50
            taxData.CGST[month] += taxVal / 2;
            taxData.SGST[month] += taxVal / 2;
          }
        }
      });
    }
  });
  return taxData;
};

const calculateTotals = (data, gstTypeFilter) => {
  if (gstTypeFilter === "CGST+SGST") {
    // Return combined total for CGST+SGST
    const cgstTotal = data.CGST.reduce((a, b) => a + b, 0);
    const sgstTotal = data.SGST.reduce((a, b) => a + b, 0);
    return {
      "CGST+SGST": cgstTotal + sgstTotal
    };
  }
  
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0)])
  );
};

const calculateMonthlyTotals = (data, gstTypeFilter) => {
  if (gstTypeFilter === "CGST+SGST") {
    // Return combined CGST+SGST for each month
    return months.map((_, i) => 
      data.CGST[i] + data.SGST[i]
    );
  }
  
  return months.map((_, i) =>
    Object.values(data).reduce((sum, arr) => sum + arr[i], 0)
  );
};
const todayISO = new Date().toISOString().split("T")[0];
/* -------------------- Component -------------------- */
const currentMonthIndex = new Date().getMonth(); // 0–11
const currentYearValue = String(new Date().getFullYear());
const currentWeekNumber = getWeekNumber(new Date());

const TaxSummary = () => {
  const [year, setYear] = useState(currentYearValue);
  const [filterType, setFilterType] = useState("monthly");
  const [gstTypeFilter, setGstTypeFilter] = useState("all");

  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedFY, setSelectedFY] = useState("2025-2026");
  const [quarterStart, setQuarterStart] = useState("");
  const [quarterEnd, setQuarterEnd] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [weekNumber, setWeekNumber] = useState(currentWeekNumber);
  const [weekYear, setWeekYear] = useState(currentYearValue);

  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawCredits, setRawCredits] = useState([]);
  const [rawSaleBills, setRawSaleBills] = useState([]);
  const [rawPO, setRawPO] = useState([]);
  const [rawWO, setRawWO] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [expenseData, setExpenseData] = useState(createEmptyTaxData());
  const [incomeData, setIncomeData] = useState(createEmptyTaxData());
  
  // NEW: Filtered data based on GST type
  const [filteredExpenseData, setFilteredExpenseData] = useState(createEmptyTaxData());
  const [filteredIncomeData, setFilteredIncomeData] = useState(createEmptyTaxData());

  const [showPreview, setShowPreview] = useState(false);
  const [showDetails, setShowDetails] = useState({ income: true, expense: true });

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    Promise.all([
      expenseService.getAllExpenses(),
      expenseService.getAllCreditPurchases(),
    ]).then(([e, c]) => {
      setRawExpenses(e?.data || []);
      setRawCredits(c?.data || []);
    });
  }, []);

  useEffect(() => {
    Promise.all([
      salebillService.getAllSaleBills(),
      purchaseService.getAllPurchaseOrderInvoices(),
      workOrderService.getAllInvoices(),
      branchService.getAll(),
    ]).then(([s, p, w, b]) => {
      setRawSaleBills(extractDataFromResponse(s));
      setRawPO(extractDataFromResponse(p));
      setRawWO(extractDataFromResponse(w));
      setBranches(extractDataFromResponse(b));
    });
  }, []);

  /* -------------------- Filters -------------------- */

  useEffect(() => {
    const filteredExpenses = filterByDate(rawExpenses, filterType, {
      month: selectedMonth,
      year,
      date: selectedDate,
      fy: selectedFY,
      startMonth: quarterStart,
      endMonth: quarterEnd,
      weekNumber,
      weekYear,
    }).filter(exp => isBranchMatch(exp, selectedBranch));

    const filteredCredits = filterByDate(rawCredits, filterType, {
      month: selectedMonth,
      year,
      date: selectedDate,
      fy: selectedFY,
      startMonth: quarterStart,
      endMonth: quarterEnd,
      weekNumber,
      weekYear,
    }).filter(cr => isBranchMatch(cr, selectedBranch));

    const newExpenseData = buildExpenseTaxData(filteredExpenses, filteredCredits);
    
    setExpenseData(newExpenseData);
    setFilteredExpenseData(filterByGSTType(newExpenseData, gstTypeFilter));
  }, [filterType, selectedMonth, selectedDate, selectedFY, quarterStart, quarterEnd, year, rawExpenses, rawCredits, gstTypeFilter, weekNumber, weekYear, selectedBranch]);

  useEffect(() => {
    const incomeSourceData = filterByDate(rawSaleBills, filterType, {
      month: selectedMonth,
      year,
      date: selectedDate,
      fy: selectedFY,
      startMonth: quarterStart,
      endMonth: quarterEnd,
      weekNumber,
      weekYear,
    });

    const newIncomeData = buildIncomeTaxData(incomeSourceData, selectedBranch);
    
    setIncomeData(newIncomeData);
    setFilteredIncomeData(filterByGSTType(newIncomeData, gstTypeFilter));
  }, [filterType, selectedMonth, selectedDate, selectedFY, quarterStart, quarterEnd, year, rawSaleBills, gstTypeFilter, weekNumber, weekYear, selectedBranch]);
  
  useEffect(() => {
    if (filterType === "daily" && !selectedDate) {
      setSelectedDate(todayISO);
    }
  }, [filterType]);
  /* -------------------- Totals -------------------- */
  const incomeTotals = calculateTotals(filteredIncomeData, gstTypeFilter);
  const expenseTotals = calculateTotals(filteredExpenseData, gstTypeFilter);

  const totalIncome = Object.values(incomeTotals).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseTotals).reduce((a, b) => a + b, 0);
  const netTax = totalIncome - totalExpense;

  const incomeMonthlyTotals = calculateMonthlyTotals(filteredIncomeData, gstTypeFilter);

  const toggleSection = (key) =>
    setShowDetails((p) => ({ ...p, [key]: !p[key] }));

  const resetFilters = () => {
    setFilterType("monthly");
    setSelectedMonth(currentMonthIndex);
    setSelectedDate(todayISO);
    setSelectedFY("2025-2026");
    setQuarterStart("");
    setQuarterEnd("");
    setSelectedQuarter("");
    setYear(currentYearValue);
    setGstTypeFilter("all");
    setWeekNumber(currentWeekNumber);
    setWeekYear(currentYearValue);
    setSelectedBranch("");
  };

  /* -------------------- Export Functions -------------------- */
  const getFilterHeadingText = ({
    filterType,
    selectedMonth,
    year,
    selectedDate,
    selectedFY,
    quarterStart,
    quarterEnd,
    weekNumber,
    weekYear,
    gstTypeFilter,
  }) => {
    let heading = "";
    
    if (filterType === "daily") {
      heading = `Filter: Daily | Date: ${selectedDate}`;
    } else if (filterType === "weekly") {
      heading = `Filter: Weekly | Week: ${weekNumber} of ${weekYear}`;
    } else if (filterType === "monthly") {
      heading = `Filter: Monthly | Month: ${months[selectedMonth]} ${year}`;
    } else if (filterType === "quarterly") {
      const quarter = quarters.find(q => q.start === Number(quarterStart));
      heading = `Filter: Quarterly | ${quarter?.label || 'Quarter'} | Year: ${year}`;
    } else if (filterType === "financial") {
      heading = `Filter: Financial Year | FY: ${selectedFY}`;
    } else {
      heading = "Filter: All";
    }
    
    if (selectedBranch) {
      const bName = branches.find(b => String(b.id) === String(selectedBranch))?.name || "Selected Site";
      heading += ` | Site: ${bName}`;
    }
    
    if (gstTypeFilter !== "all") {
      heading += ` | GST Type: ${gstTypeFilter}`;
    }
    
    return heading;
  };

  const filterHeading = getFilterHeadingText({
    filterType,
    selectedMonth,
    year,
    selectedDate,
    selectedFY,
    quarterStart,
    quarterEnd,
    weekNumber,
    weekYear,
    gstTypeFilter,
    selectedBranch,
    branches
  });

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const filterRow = [[filterHeading]];
    const emptyRow = [[]];

    const header = [
      ["Month", "GST Collected Summary", "", "", "", "GST Paid Summary", "", "", ""],
      ["", "CGST_Income", "SGST_Income", "IGST_Income", "Total_Income", "CGST_Expense", "SGST_Expense", "IGST_Expense", "Total_Expense"]
    ];

    const data = months.map((m, idx) => [
      m,
      filteredIncomeData.CGST[idx].toFixed(2),
      filteredIncomeData.SGST[idx].toFixed(2),
      filteredIncomeData.IGST[idx].toFixed(2),
      (filteredIncomeData.CGST[idx] + filteredIncomeData.SGST[idx] + filteredIncomeData.IGST[idx]).toFixed(2),
      filteredExpenseData.CGST[idx].toFixed(2),
      filteredExpenseData.SGST[idx].toFixed(2),
      filteredExpenseData.IGST[idx].toFixed(2),
      (filteredExpenseData.CGST[idx] + filteredExpenseData.SGST[idx] + filteredExpenseData.IGST[idx]).toFixed(2),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ...filterRow,
      ...emptyRow,
      ...header,
      ...data,
    ]);
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
  wch: Math.max(
    key.length,
    ...data.map(row =>
      row[key] ? row[key].toString().length : 0
    )
  ) + 2
}));
ws["!cols"] = [
  { wch: 12 }, // Month
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
];
ws["!merges"] = [
  { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // GST Collected Summary
  { s: { r: 2, c: 5 }, e: { r: 2, c: 8 } }, // GST Paid Summary
];
    XLSX.utils.book_append_sheet(wb, ws, "Tax Summary");
    XLSX.writeFile(wb, `Tax_Summary_${year}_${gstTypeFilter}.xlsx`);
  };

  const formatNumber = (value) =>
    Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFontSize(14);
    doc.text("Tax Summary", 14, 20);
    doc.setFontSize(10);
    doc.text(filterHeading, 14, 36);

    // Calculate totals for Net GST row
    const totalIncome = months.reduce(
      (sum, _, idx) => sum + incomeData.CGST[idx] + incomeData.SGST[idx] + incomeData.IGST[idx],
      0
    );
    const totalExpense = months.reduce(
      (sum, _, idx) => sum + expenseData.CGST[idx] + expenseData.SGST[idx] + expenseData.IGST[idx],
      0
    );
    const netGST = totalIncome - totalExpense;

    autoTable(doc, {
      startY: 50,
      head: [
        [
          { content: "Month", rowSpan: 2, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
          { content: "Gst Collected", colSpan: 4, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
          { content: "GST Paid", colSpan: 4, styles: { fillColor: [0, 123, 255], textColor: 255, halign: "center" } },
        ],
        [
          { content: "CGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "SGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "IGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "Total", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "CGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "SGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "IGST", styles: { fillColor: [0, 123, 255], textColor: 255 } },
          { content: "Total", styles: { fillColor: [0, 123, 255], textColor: 255 } },
        ],
      ],
      body: months.map((m, idx) => [
        m,
        formatNumber(incomeData.CGST[idx]),
        formatNumber(incomeData.SGST[idx]),
        formatNumber(incomeData.IGST[idx]),
        formatNumber(incomeData.CGST[idx] + incomeData.SGST[idx] + incomeData.IGST[idx]),
        formatNumber(expenseData.CGST[idx]),
        formatNumber(expenseData.SGST[idx]),
        formatNumber(expenseData.IGST[idx]),
        formatNumber(expenseData.CGST[idx] + expenseData.SGST[idx] + expenseData.IGST[idx]),
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        halign: "center",
      },
      tableWidth: "auto",
      margin: { left: 20, right: 20 },
    });

    // Add Net GST row below table
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFillColor(173, 216, 230); // light blue for net row
    doc.setTextColor(0);
    doc.rect(20, finalY - 4, doc.internal.pageSize.width - 40, 20, "F");
    doc.text(
      `Net GST (Gst Collected - GST Paid): Rs.${formatNumber(netGST)}`,
      25,
      finalY + 10
    );

    doc.save(`Tax_Summary_${year}_${gstTypeFilter}.pdf`);
  };

  return (
    <div className="p-3 shadow-sm border-0 overflow-x-hidden">
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="mb-1">Tax Summary</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Tax Summary</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col className="text-end">
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="info" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="danger" onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </Col>
      </Row>
      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3">
                  <GraphUp size={20} className="text-success" />
                </div>
                <Badge bg="success" className="px-2 py-1">Income</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Total Collected GST</h6>
              <h3 className="fw-bold text-success mb-2">{formatCurrency(totalIncome)}</h3>
                            <small className="text-muted d-block mb-2">
  Collected GST = GST of Sale Bills
</small>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  {gstTypeFilter === "all" ? "CGST + SGST + IGST" : 
                   gstTypeFilter === "CGST+SGST" ? "CGST & SGST Combined" : gstTypeFilter}
                </span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                  <GraphDown size={20} className="text-warning" />
                </div>
                <Badge bg="warning" className="px-2 py-1">Expense</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Total Paid GST</h6>
              <h3 className="fw-bold text-warning mb-2">{formatCurrency(totalExpense)}</h3>
              <small className="text-muted d-block mb-2">
  Paid GST = GST of Cash Purchase + Credit Purchase
</small>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  {gstTypeFilter === "all" ? "CGST + SGST + IGST" : 
                   gstTypeFilter === "CGST+SGST" ? "CGST & SGST Combined" : gstTypeFilter}
                </span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-info bg-opacity-10 p-2 rounded-3">
                  <Bank size={20} className="text-info" />
                </div>
                <Badge bg={netTax >= 0 ? "info" : "danger"} className="px-2 py-1">
                  {netTax >= 0 ? "Credit" : "Debit"}
                </Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Net GST</h6>
              <h3 className={`fw-bold mb-2 ${netTax >= 0 ? "text-info" : "text-danger"}`}>
                {formatCurrency(netTax)}
              </h3>
              <small className="text-muted d-block mb-2">
  Net GST = Collected GST − Paid GST
</small>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Collected - Paid
                  {gstTypeFilter !== "all" && (
                    <>
                      <br />
                      <small>({gstTypeFilter === "CGST+SGST" ? "CGST+SGST Combined" : gstTypeFilter})</small>
                    </>
                  )}
                </span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                  <Calendar size={20} className="text-primary" />
                </div>
                <Badge bg="primary" className="px-2 py-1">Active</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Active Months</h6>
              <div className="d-flex align-items-baseline">
                <h3 className="fw-bold text-dark mb-2 me-2">
                  {incomeMonthlyTotals.filter(v => v > 0).length}/12
                </h3>
                <span className="text-muted small">months</span>
              </div>
              <div className="mt-2">
                <ProgressBar now={(incomeMonthlyTotals.filter(v => v > 0).length / 12) * 100} 
                  variant="primary" className="rounded-pill" style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-light p-2 rounded-3 me-2">
              <Filter size={18} className="text-primary" />
            </div>
            <h6 className="fw-semibold mb-0 text-dark">Filter Options</h6>
          </div>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border-1 shadow-sm"
              >
                {/* <option value="daily">Daily Analysis</option>
                <option value="weekly">Weekly Analysis</option> */}
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="financial">Financial Year</option>
              </Form.Select>
            </Col>

            {filterType === "daily" && (
              <Col md={3}>
                <Form.Control 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-1 shadow-sm"
                />
              </Col>
            )}

            {filterType === "weekly" && (
              <>
                <Col md={2}>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    max="53"
                    placeholder="Week Number"
                    value={weekNumber} 
                    onChange={(e) => setWeekNumber(e.target.value)}
                    className="border-1 shadow-sm"
                  />
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={weekYear} 
                    onChange={(e) => setWeekYear(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </Form.Select>
                </Col>
              </>
            )}

            {filterType === "monthly" && (
              <>
                <Col md={3}>
                  <Form.Select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="">Select Month</option>
                    {months.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="">All Sites</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </>
            )}

            {filterType === "quarterly" && (
              <>
                <Col md={2}>
                  <Form.Select 
                    value={selectedQuarter} 
                    onChange={(e) => {
                      const quarterValue = e.target.value;
                      setSelectedQuarter(quarterValue);
                      if (quarterValue) {
                        const quarter = quarters.find(q => q.start.toString() === quarterValue);
                        if (quarter) {
                          setQuarterStart(quarter.start);
                          setQuarterEnd(quarter.end);
                        }
                      }
                    }}
                    className="border-1 shadow-sm"
                  >
                    <option value="">Select Quarter</option>
                    {quarters.map((q, i) => (
                      <option key={i} value={q.start}>{q.label}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="">All Sites</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </>
            )}

            {filterType === "financial" && (
              <>
                <Col md={2}>
                  <Form.Select 
                    value={selectedFY} 
                    onChange={(e) => setSelectedFY(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border-1 shadow-sm"
                  >
                    <option value="">All Sites</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </>
            )}

            <Col md={3}>
              <Form.Select 
                value={gstTypeFilter} 
                onChange={(e) => setGstTypeFilter(e.target.value)}
                className="border-1 shadow-sm"
              >
                <option value="all">All GST Types</option>
                <option value="CGST+SGST">CGST + SGST Combined</option>
                <option value="CGST">CGST Only</option>
                <option value="SGST">SGST Only</option>
                <option value="IGST">IGST Only</option>
              </Form.Select>
            </Col>

            <Col md="auto" className="ms-auto">
              <Button
                variant="danger"
                onClick={resetFilters}
              >
                <ArrowClockwise />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modified IncomeTaxSummary to use filtered data */}
      <IncomeTaxSummary
        year={year}
        filterType={filterType}
        selectedMonth={selectedMonth}
        selectedFY={selectedFY}
        quarterStart={quarterStart}
        quarterEnd={quarterEnd}
        weekNumber={weekNumber}
        weekYear={weekYear}
        filterByDate={filterByDate}
        getFinancialYearRange={getFinancialYearRange}
        show={showDetails.income}
        toggle={toggleSection}
        filteredData={filteredIncomeData}
        gstTypeFilter={gstTypeFilter}
      />

      {/* Modified ExpenseTaxSummary to use filtered data */}
      <ExpenseTaxSummary
        year={year}
        filterType={filterType}
        selectedMonth={selectedMonth}
        selectedFY={selectedFY}
        quarterStart={quarterStart}
        quarterEnd={quarterEnd}
        weekNumber={weekNumber}
        weekYear={weekYear}
        filterByDate={filterByDate}
        getFinancialYearRange={getFinancialYearRange}
        show={showDetails.expense}
        toggle={toggleSection}
        filteredData={filteredExpenseData}
        gstTypeFilter={gstTypeFilter}
      />

      <Alert variant="info">
        <InfoCircle className="me-2" />
        All values are in INR. Calculations follow Indian GST rules.
        {gstTypeFilter !== "all" && ` Showing only ${gstTypeFilter} data.`}
      </Alert>
      
      <TaxSummaryModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        months={months}
        incomeData={filteredIncomeData}
        expenseData={filteredExpenseData}
        year={year}
        filterHeading={filterHeading}
        gstTypeFilter={gstTypeFilter}
      />
    </div>
  );
};

export default TaxSummary;