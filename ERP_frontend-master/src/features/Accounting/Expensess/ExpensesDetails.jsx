// src/pages/Accounting/ExpenseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Table, Badge, Button, Row, Col, Card, Form, Modal,OverlayTrigger, Tooltip } from "react-bootstrap";
import expensesService from "../../../services/expensessService";
import branchService from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";
import { Plus, Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import categoryService from "../../../services/expenseCategory";
import EditExpenseModal from "./EditExpenseModal";
import PdfViewerModal from "./PdfViewerModal";
import PreviewExpenseModal from "./PreviewModal";
import { VscPreview } from "react-icons/vsc";
import ViewExpenseModal from "./ViewExpensedetails";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dropdown } from "react-bootstrap";
import branchWalletService from "../../../services/branchwalletService";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  if (typeof dateStr === "string") {
    const raw = dateStr.split("T")[0];
    const parts = raw.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }
    }
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
};

const ExpenseDetails = ({ fetchAllForManager }) => {

  const BASE_URL = import.meta.env.VITE_BASE_URL;
const AVATARS_BASE_URL = import.meta.env.VITE_AVATARS_BASE_URL;
const user = JSON.parse(localStorage.getItem("user"));
  const { branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [branchName, setBranchName] = useState(location.state?.branchName || "All Branches");
  const [showPdfModal, setShowPdfModal] = useState(false);
const [taxableFilter, setTaxableFilter] = useState("all");
const [selectedIds, setSelectedIds] = useState([]);

const [walletBalance, setWalletBalance] = useState(0);
const [walletLoading, setWalletLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Period filters
  const [periodType, setPeriodType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterBasis, setDateFilterBasis] = useState("billDate");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
const [editingExpense, setEditingExpense] = useState(null);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [previewData, setPreviewData] = useState([]);

  const getDateOnly = (dateValue) => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getWeekRangeFromValue = (weekValue) => {
    if (!weekValue) return { start: null, end: null };

    const [yearPart, weekPart] = weekValue.split("-W");
    const year = Number(yearPart);
    const week = Number(weekPart);

    if (!year || !week) return { start: null, end: null };

    const januaryFourth = new Date(year, 0, 4);
    const januaryFourthDay = januaryFourth.getDay() || 7;
    const start = new Date(januaryFourth);
    start.setDate(januaryFourth.getDate() - januaryFourthDay + 1 + (week - 1) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const months = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];
  const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
  const years = ["2023", "2024", "2025", "2026"];
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data); // data is array of { id, name, ... }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  fetchCategories();
}, []);
  // Fetch branch name
  const fetchBranchName = async () => {
    try {
      const branch = await branchService.getOne(branchId);
      setBranchName(branch?.name || `Branch ${branchId}`);
    } catch (err) {
      console.error(err);
      setBranchName(`Branch ${branchId}`);
    }
  };

  // Fetch wallet balance
const fetchWalletBalance = async () => {
  if (!branchId) return;
  
  setWalletLoading(true);
  try {
    const data = await branchWalletService.getBranchTransactions(branchId);
    const transactions = data?.data || [];
    
    if (transactions.length > 0) {
      // Get the latest balance (first transaction in the array)
      const latestBalance = transactions[0]?.balance_after || 0;
      setWalletBalance(latestBalance);
    } else {
      setWalletBalance(0);
    }
  } catch (err) {
    console.error("Failed to fetch wallet balance", err);
    setWalletBalance(0);
  } finally {
    setWalletLoading(false);
  }
};
  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let allExpenses = [];
      const res = await expensesService.getAllExpenses();
      allExpenses = res?.data || res?.expenses || [];

      if (branchId) {
        allExpenses = allExpenses.filter((e) => e.branch_id === Number(branchId));
        setBranchName(allExpenses[0]?.branch?.name || `Branch ${branchId}`);
      } else {
        const uniqueBranches = [
          ...new Map(allExpenses.map((e) => [e.branch?.id, e.branch?.name])).values(),
        ];
        setBranchName(uniqueBranches.length === 1 ? uniqueBranches[0] : "All Branches");
      }

      setExpenses(allExpenses);
    } catch (err) {
      console.error(err);
      setExpenses([]);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchExpenses();
  if (branchId) {
    fetchWalletBalance();
  }
}, [branchId]);

useEffect(() => {
  setCurrentPage(1);
}, [taxableFilter, periodType, filterValue, startDate, endDate, dateFilterBasis]);

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  if (id && expenses.length > 0) {
    const expense = expenses.find((e) => String(e.id) === String(id));
    if (expense) {
      setSelectedExpense(expense);
      setShowViewModal(true);
    }
  }
}, [location.search, expenses]);

  // Delete expense
  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Expense",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff0000",
      onConfirm: async () => {
        try {
          await expensesService.deleteExpense(id);
          fetchExpenses();
          toast.success("Expense deleted successfully", { icon: false });
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete expense");
        }
      },
    });
  };
const getCategoryName = (categoryId) => {
  const category = categories.find((c) => c.id === categoryId);
  return category ? category.name : "-";
};
  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;

const filteredExpenses = expenses.filter((exp) => {
  const filterDateValue = dateFilterBasis === "billDate" 
    ? (exp.actual_bill_date || exp.payment_date) 
    : (exp.payment_date || exp.actual_bill_date);
  const expDate = getDateOnly(filterDateValue);
  if (!expDate) return false;

  // Status filter
  if (statusFilter && exp.payments_status !== statusFilter) return false;

  // Taxable filter
  if (taxableFilter === "taxable" && (!exp.tax_total || parseFloat(exp.tax_total) <= 0)) return false;
  if (taxableFilter === "non-taxable" && exp.tax_total && parseFloat(exp.tax_total) > 0) return false;

  // Period filters
  switch (periodType) {
    case "daily":
      return filterValue ? filterDateValue?.slice(0, 10) === filterValue : true;
    case "weekly": {
      const { start, end } = getWeekRangeFromValue(filterValue);
      if (!start || !end) return true;
      return expDate >= start && expDate <= end;
    }
    case "monthly":
      return filterValue
        ? (expDate.getMonth() + 1).toString().padStart(2, "0") === filterValue
        : true;
    case "fy":
      if (!filterValue) return true;
      const [startYear, endYear] = filterValue.split("-").map(Number);
      const fyStart = new Date(startYear, 3, 1);
      const fyEnd = new Date(endYear, 2, 31);
      return expDate >= fyStart && expDate <= fyEnd;
    case "custom":
      if (!startDate || !endDate) return true;
      return expDate >= getDateOnly(startDate) && expDate <= getDateOnly(endDate);
    default:
      return true;
  }
});

const sortedExpenses = [...filteredExpenses].sort((a, b) => {
  const dateAVal = dateFilterBasis === "billDate" 
    ? (a.actual_bill_date || a.payment_date) 
    : (a.payment_date || a.actual_bill_date);
  const dateBVal = dateFilterBasis === "billDate" 
    ? (b.actual_bill_date || b.payment_date) 
    : (b.payment_date || b.actual_bill_date);
  
  const dateA = new Date(dateAVal || 0);
  const dateB = new Date(dateBVal || 0);
  return dateB - dateA;
});
const handleDownloadPDF = () => {
  if (sortedExpenses.length === 0) {
    toast.warning("No expenses found for selected filters.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const title = `Branch Expense Report – ${branchName}`;
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  const tableColumn = ["Date", "Description", "Subtotal", "Tax Total", "Total Amount"];
  const tableRows = sortedExpenses.map((exp) => [
    formatDate(dateFilterBasis === "billDate" ? exp.actual_bill_date : exp.payment_date),
    exp.description,
    exp.subtotal,
    exp.tax_total,
    exp.total_amount,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  const branchLabel = branchName.replace(/\s+/g, "_");
  doc.save(`${branchLabel}_Expense_Report.pdf`);
};


  const currentExpenses = sortedExpenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedExpenses.length / entriesPerPage) || 1;

  // Build FY options
  const fyOptions = years.slice(0, -1).map((y, i) => {
    const nextYear = years[i + 1];
    return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
  });

const handleDownloadExcel = () => {
  // Apply taxable filter
  const excelData = sortedExpenses.filter((exp) => {
    if (taxableFilter === "taxable" && (!exp.tax_total || parseFloat(exp.tax_total) <= 0)) return false;
    if (taxableFilter === "non-taxable" && exp.tax_total && parseFloat(exp.tax_total) > 0) return false;
    return true;
  });

  if (excelData.length === 0) {
    toast.warning("No expenses found for selected filters.");
    return;
  }

  // Group expenses by month name
  const grouped = {};
  excelData.forEach((exp) => {
    const filterDateVal = dateFilterBasis === "billDate" ? (exp.actual_bill_date || exp.payment_date) : (exp.payment_date || exp.actual_bill_date);
    if (!filterDateVal) return;
    const d = new Date(filterDateVal);
    const m = months[d.getMonth()].name;
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(exp);
  });

  // Dynamic heading based on filter
  let heading = `Branch Expense Report – ${branchName}`;
  if (periodType === "monthly" && filterValue) {
    const monthName = months.find((m) => m.value === filterValue)?.name || "Selected Month";
    heading = `Monthly Branch Expense Report – ${branchName} – ${monthName}`;
  } else if (periodType === "weekly" && filterValue) {
    const { start, end } = getWeekRangeFromValue(filterValue);
    if (start && end) {
      heading = `Weekly Branch Expense Report - ${branchName} - ${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`;
    }
  } else if (periodType === "fy" && filterValue) {
    heading = `Yearly Branch Expense Report – ${branchName} – ${filterValue}`;
  } else if (periodType === "daily" && filterValue) {
    const dateObj = new Date(filterValue);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = dateObj.toISOString().split("T")[0];
    heading = `Daily Branch Expense Report – ${branchName} – ${formattedDate} (${dayName})`;
  } else if (periodType === "custom" && startDate && endDate) {
    heading = `Custom Date Branch Expense Report – ${branchName} – ${startDate} to ${endDate}`;
  }

  const sheetData = [];
  const merges = [];

  // Excel top heading
  sheetData.push([heading]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
  sheetData.push([]);
  let rowIndex = 2;

  // Case: Monthly filter
  if (periodType === "monthly") {
    const selectedMonth = months.find((m) => m.value === filterValue)?.name || "Selected Month";
    const monthExpenses = grouped[selectedMonth] || [];

    sheetData.push([selectedMonth]);
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 2 } });
    rowIndex++;

    sheetData.push(["Date", "Description", "Total Amount"]);
    rowIndex++;

    monthExpenses.forEach((exp) => {
      sheetData.push([
        formatDate(dateFilterBasis === "billDate" ? exp.actual_bill_date : exp.payment_date),
        exp.description,
        exp.total_amount,
      ]);
      rowIndex++;
    });
  }

  // Case: Financial year filter
  else if (periodType === "fy") {
    Object.keys(grouped).forEach((month) => {
      const monthData = grouped[month];
      if (!monthData || monthData.length === 0) return;

      sheetData.push([month]);
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 2 } });
      rowIndex++;

      sheetData.push(["Date", "Description", "Total Amount"]);
      rowIndex++;

      monthData.forEach((exp) => {
        sheetData.push([
          formatDate(dateFilterBasis === "billDate" ? exp.actual_bill_date : exp.payment_date),
          exp.description,
          exp.total_amount,
        ]);
        rowIndex++;
      });

      sheetData.push([]);
      rowIndex++;
    });
  }

  // Default: All / Custom / Daily
  else {
    Object.keys(grouped).forEach((month) => {
      sheetData.push([month]);
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 2 } });
      rowIndex++;

      sheetData.push(["Date", "Description", "Total Amount"]);
      rowIndex++;

      grouped[month].forEach((exp) => {
        sheetData.push([
          formatDate(dateFilterBasis === "billDate" ? exp.actual_bill_date : exp.payment_date),
          exp.description,
          exp.total_amount,
        ]);
        rowIndex++;
      });

      sheetData.push([]);
      rowIndex++;
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 15 },
    { wch: 45 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
  XLSX.writeFile(wb, `Branch_${branchId || "All"}_Expense_Report.xlsx`);
};
const handlePreview = () => {
  const excelData = sortedExpenses.filter((exp) => {
    if (taxableFilter === "taxable" && (!exp.tax_total || parseFloat(exp.tax_total) <= 0)) return false;
    if (taxableFilter === "non-taxable" && exp.tax_total && parseFloat(exp.tax_total) > 0) return false;
    return true;
  });

  if (excelData.length === 0) {
    toast.warning("No expenses found for selected filters.");
    return;
  }

  const grouped = {};
  excelData.forEach((exp) => {
    const filterDateVal = dateFilterBasis === "billDate" ? (exp.actual_bill_date || exp.payment_date) : (exp.payment_date || exp.actual_bill_date);
    if (!filterDateVal) return;
    const d = new Date(filterDateVal);
    const m = months[d.getMonth()].name;
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(exp);
  });

  const previewRows = [];
  Object.keys(grouped).forEach((month) => {
    previewRows.push({ type: "month", label: month });
    grouped[month].forEach((exp) => {
      previewRows.push({
        type: "expense",
        date: formatDate(dateFilterBasis === "billDate" ? exp.actual_bill_date : exp.payment_date),
        description: exp.description,
        subtotal: exp.subtotal,
        tax_total: exp.tax_total,
        total_amount: exp.total_amount,
      });
    });
  });

  setPreviewData(previewRows);
  setShowPreviewModal(true);
};

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>Expenses – {branchName}</h4>
          <BreadCrumb
            pathname={location?.pathname || ""}
            lastLabel={`Expense Details - ${branchName}`}
            dynamicNames={{ expenses: "Expenses" }}
          />
        </div>
<OverlayTrigger overlay={<Tooltip>Add New Expense</Tooltip>}>
  <Button
    size="sm"
    className="rounded-1"
    variant="success"
    onClick={() =>
      navigate("/accounting/expensess/create", { state: { branchId } })
    }
  >
    <Plus />
  </Button>
</OverlayTrigger>

      </div>
      <Row className="my-4 g-3 justify-content-center">
        {(user?.type === "Accountant" || user?.type === "company") && (
  <Col md={4}>
    <div
      className="p-5 rounded shadow-sm text-center"
      style={{ backgroundColor: "#dafdde", border: "1px solid #ecffe6" }}
    >
      <h2 className="fw-bold text-success mb-1">
        {walletLoading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          `₹${Number(walletBalance).toLocaleString("en-In")}`
        )}
      </h2>
      <small className="text-muted">Current Wallet Balance</small>
    </div>
  </Col>
)}

        <Col md={4}>
          <div
            className="p-5 rounded shadow-sm text-center"
            style={{ backgroundColor: "#fddede", border: "1px solid #ffe6e6" }}
          >
            <h2 className="fw-bold text-danger mb-1">
              ₹
              {sortedExpenses
                ?.filter(
                  (exp) => {
                    const filterDateVal = dateFilterBasis === "billDate" ? (exp.actual_bill_date || exp.payment_date) : (exp.payment_date || exp.actual_bill_date);
                    const d = new Date(filterDateVal);
                    return (
                      d.getMonth() === new Date().getMonth() &&
                      d.getFullYear() === new Date().getFullYear()
                    );
                  }
                )
                .reduce((sum, exp) => {
                  let correctedTotal = 0;
                  if (exp.items && exp.items.length > 0) {
                    exp.items.forEach(item => {
                      const sub = parseFloat(item.subtotal || 0);
                      const rate = parseFloat(item.tax_rate || 0);
                      if (item.is_taxable) {
                        if (item.tax_type === "exclusive") {
                          correctedTotal += sub + (sub * rate) / 100;
                        } else {
                          correctedTotal += sub;
                        }
                      } else {
                        correctedTotal += sub;
                      }
                    });
                  } else {
                    correctedTotal = Number(exp.total_amount || exp.total || exp.value || 0);
                  }
                  return sum + correctedTotal;
                }, 0)
                .toLocaleString("en-In")}
            </h2>
            <small className="text-muted">Expenses This Month</small>
          </div>
        </Col>
</Row>

      <Card className="p-4 shadow-sm">
        
<Row className="align-items-center justify-content-between mb-3">
  <Col md={1}>
    <Form.Select
      value={entriesPerPage}
      onChange={(e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </Form.Select>
  </Col>
</Row>

        <Row className="align-items-end justify-content-end flex-wrap g-2 mb-5">
          <Col md={2}>
            <Form.Group>
              <Form.Label>Filter By Date</Form.Label>
              <Form.Select
                value={dateFilterBasis}
                onChange={(e) => setDateFilterBasis(e.target.value)}
              >
                <option value="billDate">Bill Date</option>
                <option value="entryDate">Entry Date</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
  <Form.Group>
    <Form.Label>Taxable / Non-Taxable</Form.Label>
    <Form.Select
      value={taxableFilter}
      onChange={(e) => setTaxableFilter(e.target.value)}
    >
      <option value="all">All</option>
      <option value="taxable">Taxable</option>
      <option value="non-taxable">Non-Taxable</option>
    </Form.Select>
  </Form.Group>
</Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Select Period</Form.Label>
              <Form.Select
                value={periodType}
                onChange={(e) => {
                  setPeriodType(e.target.value);
                  setFilterValue("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <option value="">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="fy">Financial Year</option>
                <option value="custom">Custom</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {periodType && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  {periodType === "daily" && "Select Date"}
                  {periodType === "weekly" && "Select Week"}
                  {periodType === "monthly" && "Select Month"}
                  {periodType === "fy" && "Select Financial Year"}
                  {periodType === "custom" && "Select Start & End Date"}
                </Form.Label>

                {periodType === "daily" && (
                  <Form.Control
                    type="date"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
                {periodType === "weekly" && (
                  <Form.Control
                    type="week"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
                {periodType === "monthly" && (
                  <Form.Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {periodType === "fy" && (
                  <Form.Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select Financial Year</option>
                    {fyOptions.map((fy) => (
                      <option key={fy.value} value={fy.value}>
                        {fy.label}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {periodType === "custom" && (
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          )}
          <Col md={2}>
<div className="d-flex justify-content-evenly align-items-center">
    <OverlayTrigger overlay={<Tooltip>Preview Excel Report</Tooltip>}>
    <Button variant="info" size="sm" onClick={handlePreview}>
      <VscPreview />
    </Button>
  </OverlayTrigger>
<Dropdown>
  <Dropdown.Toggle variant="success" size="sm">
    <Download />
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item onClick={handleDownloadExcel}>
      Download Excel
    </Dropdown.Item>
    <Dropdown.Item onClick={handleDownloadPDF}>
      Download PDF
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
{/* <OverlayTrigger overlay={<Tooltip>Delete Selected</Tooltip>}>
<Button
  variant="danger"
  size="sm"
  disabled={selectedIds.length === 0}
  onClick={() => {
    ConfirmDeleteModal({
      title: "Delete Selected Expenses",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff0000",
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            await expensesService.deleteExpense(id);
          }
          setSelectedIds([]);
          fetchExpenses();
          toast.success("Selected expenses deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete selected expenses");
        }
      },
    });
  }}
>
 <i className="bi bi-trash text-white"></i>
</Button>
</OverlayTrigger> */}
</div>
</Col>

        </Row>
        <div className="table-responsive">
          <Table hover striped className="text-center">
                        <thead className="table-light">
              <tr>
                <th>#</th>
                <th>TRANSACTION DATE</th>
                {/* Subtotal and Tax Total hidden */}
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Category</th>
                <th>Remark</th>
                <th>BILL DATE</th>
                <th>Action</th>
                {/* <th>
  <Form.Check
    type="checkbox"
    checked={selectedIds.length === currentExpenses.length && currentExpenses.length > 0}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedIds(currentExpenses.map((exp) => exp.id));
      } else setSelectedIds([]);
    }}
  />
</th> */}

              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentExpenses.length > 0 ? (
                currentExpenses.map((exp, idx) => (
                  <tr key={exp.id}>
                    <td>{idx + 1}</td>
                    <td>{formatDate(exp.payment_date)}</td>
                    {(() => {
                      let correctedSubtotal = 0;
                      let correctedTaxTotal = 0;
                      let correctedTotal = 0;

                      if (exp.items && exp.items.length > 0) {
                        exp.items.forEach((item) => {
                          const sub = parseFloat(item.subtotal || 0);
                          const rate = parseFloat(item.tax_rate || 0);
                          if (item.is_taxable) {
                            if (item.tax_type === "exclusive") {
                              const tax = (sub * rate) / 100;
                              correctedSubtotal += sub;
                              correctedTaxTotal += tax;
                              correctedTotal += sub + tax;
                            } else {
                              const tax = sub * (rate / (100 + rate));
                              correctedSubtotal += sub - tax;
                              correctedTaxTotal += tax;
                              correctedTotal += sub;
                            }
                          } else {
                            correctedSubtotal += sub;
                            correctedTotal += sub;
                          }
                        });
                      } else {
                        correctedSubtotal = parseFloat(exp.subtotal || 0);
                        correctedTaxTotal = parseFloat(exp.tax_total || 0);
                        correctedTotal = parseFloat(exp.total_amount || 0);
                      }

                      return (
                        <>
                          {/* Subtotal and Tax Total hidden */}
                          <td>₹{formatCurrency(correctedTotal)}</td>
                        </>
                      );
                    })()}
                    <td>
                      <Badge
                        bg={exp.payments_status?.toLowerCase() === "paid" ? "success" : "warning"}
                      >
                        {exp.payments_status}
                      </Badge>
                    </td>
                    <td>{getCategoryName(exp.category_id)}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {exp.remark ? (
                        <span title={exp.remark}>
                          {exp.remark.length > 40
                            ? exp.remark.substring(0, 40) + "..."
                            : exp.remark}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{formatDate(exp.actual_bill_date)}</td>
                    <td>
                      <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
    <Button
      variant="warning"
      size="sm"
      className="me-2"
      onClick={() => {
        setSelectedExpense(exp);
        setShowViewModal(true);
      }}
    >
      <i className="bi bi-eye text-white"></i>
    </Button>
  </OverlayTrigger>

  {exp.document && (
    <OverlayTrigger overlay={<Tooltip>View Documents</Tooltip>}>
      <Button
        variant="secondary"
        size="sm"
        className="me-2"
        onClick={() => {
          const docs = Array.isArray(exp.document)
            ? exp.document
            : [exp.document]; // handle single or multiple
          setSelectedExpense({ ...exp, documents: docs });
          setShowPdfModal(true);
        }}
      >
        <i className="bi bi-file-earmark-richtext"></i>
      </Button>
    </OverlayTrigger>
  )}

  <OverlayTrigger overlay={<Tooltip>Edit Expense</Tooltip>}>
    <Button
      variant="info"
      size="sm"
      className="me-2"
      onClick={() => {
        setEditingExpense(exp);
        setShowEditModal(true);
      }}
    >
      <i className="bi bi-pencil text-white"></i>
    </Button>
  </OverlayTrigger>


  <OverlayTrigger overlay={<Tooltip>Delete Expense</Tooltip>}>
    <Button
      variant="danger"
      size="sm"
      onClick={() => handleDelete(exp.id)}
    >
      <i className="bi bi-trash text-white"></i>
    </Button>
  </OverlayTrigger>
</td>

{/* <td>
  <Form.Check
    type="checkbox"
    checked={selectedIds.includes(exp.id)}
    onChange={() => {
      setSelectedIds((prev) =>
        prev.includes(exp.id)
          ? prev.filter((id) => id !== exp.id)
          : [...prev, exp.id]
      );
    }}
  />
</td> */}

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No expenses found for this branch.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
{/* Pagination */}
<div className="d-flex justify-content-between align-items-center mt-3">
  <div className="small text-muted">
    Showing {filteredExpenses.length === 0 ? 0 : indexOfFirst + 1} to{" "}
    {Math.min(indexOfLast, filteredExpenses.length)} of {filteredExpenses.length} entries
  </div>
  <div>
    <ul className="pagination pagination-sm mb-0">
      {/* Previous button */}
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          &laquo;
        </button>
      </li>

      {/* Page numbers with ellipsis */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        if (
          totalPages <= 5 ||
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          );
        } else if (
          (page === 2 && currentPage > 3) ||
          (page === totalPages - 1 && currentPage < totalPages - 2)
        ) {
          return (
            <li key={page} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          );
        } else return null;
      })}

      {/* Next button */}
      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          &raquo;
        </button>
      </li>
    </ul>
  </div>
</div>
        </div>
      </Card>
<ViewExpenseModal
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  expense={selectedExpense}
  branchName={branchName}
  BASE_URL={BASE_URL}
  getCategoryName={getCategoryName}
/>

<EditExpenseModal
  show={showEditModal}
  onHide={() => setShowEditModal(false)}
  expense={editingExpense}
  onUpdated={() => {
    setShowEditModal(false);
    fetchExpenses();
  }}
/>
<PdfViewerModal
  show={showPdfModal}
  onHide={() => setShowPdfModal(false)}
  documents={selectedExpense?.documents || []}
/>
<PreviewExpenseModal
  show={showPreviewModal}
  onHide={() => setShowPreviewModal(false)}
  previewData={previewData}
  branchName={branchName}
  handleDownloadExcel={handleDownloadExcel}
  handleDownloadPDF = {handleDownloadPDF}
/>

  </div>
  );
};

export default ExpenseDetails;
