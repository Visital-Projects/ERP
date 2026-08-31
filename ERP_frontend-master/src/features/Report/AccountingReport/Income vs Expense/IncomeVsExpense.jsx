import React, { useEffect, useState } from "react";
import {Card,Row,Col,Badge,Form,Button,InputGroup,Breadcrumb,Table,} from "react-bootstrap";
import {FileText,HourglassSplit,Funnel,Calendar,CalendarMonth,CalendarWeek,CalendarDate,CalendarDay,ArrowClockwise,Download,Filter,CashStack,CreditCard,Calculator,ArrowUpRight,ArrowDownRight,ArrowUpRightCircle,ArrowDownRightCircle,Wallet,} from "react-bootstrap-icons";
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";
import expenseService from "../../../../services/expensessService";
import workOrderService from "../../../../services/workOrderService";
import purchaseService from "../../../../services/purchaseService";
import branchService from "../../../../services/branchService";
import departmentService from "../../../../services/departmentService";
import categoryService from "../../../../services/expenseCategory";
import branchWalletService from "../../../../services/branchwalletService";
import salebillService from "../../../../services/salebillService";
// import * as XLSX from "xlsx";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import IncomeVsExpensePreviewModal from "./IncomeVsExpensePreviewModal";

const formatINR = (value) =>`₹ ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2,})}`;
const formatINRForPDF = (value = 0) =>`Rs. ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2,})}`;
const months = ["January","February","March","April","May","June","July","August","September","October","November","December",];
const shortMonth = (m) => m.substring(0, 3).toUpperCase();

const getCurrentMonth = () => new Date().getMonth();
const getCurrentYear = () => new Date().getFullYear();
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; 
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const getWeekRange = (weekNumber, year) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (weekNumber - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay(),);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: weekStart, end: weekEnd };
};

const FILTER_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  FINANCIAL_YEAR: "financial_year",
};

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

const getMonthRangeForQuarter = (quarter) => {
  switch (quarter) {
    case "Q1":
      return { start: 1, end: 4 };
    case "Q2":
      return { start: 5, end: 8 }; 
    case "Q3":
      return { start: 9, end: 12 }; 
    default:
      return { start: 1, end: 4 };
  }
};

const getFinancialYearMonths = (financialYear) => {
  const [startYear, endYear] = financialYear.split("-").map(Number);
  return {startMonth: 4,endMonth: 3,startYear: startYear,endYear: endYear,};
};

const getFinancialYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 1; i <= currentYear + 1; i++) {years.push(`${i}-${i + 1}`);}
  return years;
};

const resolveExpenseBranchId = (expense = {}, item = {}) =>
  expense.branch_id ||
  expense.branch?.id ||
  expense.Branch?.id ||
  expense.purchase_order?.branch_id ||
  expense.purchase_order?.branch?.id ||
  expense.site?.id ||
  expense.Site?.id ||
  expense.assigned_to ||
  expense.branchId ||
  item.branch_id ||
  item.branch?.id ||
  item.Branch?.id ||
  item.site?.id ||
  item.Site?.id ||
  item.branchId ||
  "";

const isTaxableExpenseItem = (item = {}) => {
  const taxableValue = item.is_taxable;
  return (
    taxableValue === true ||
    taxableValue === 1 ||
    taxableValue === "1" ||
    String(taxableValue).toLowerCase() === "true"
  );
};

const groupExpensesByHead = (rows = [], amountKey = "value") => {
  const grouped = {};
  rows.forEach((row) => {
    const head = row.paymentHead || row.name || "Other";
    if (!grouped[head]) grouped[head] = 0;
    grouped[head] += Number(row[amountKey] || 0);
  });
  return Object.entries(grouped).map(([head, amount]) => ({ head, amount }));
};

const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1; 
  if (month >= 1 && month <= 4) return "Q1";
  if (month >= 5 && month <= 8) return "Q2";
  return "Q3"; 
};

const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; 
  if (month >= 4) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
};

const IncomeVsExpense = () => {

  const getBranchName = (branchId) => {
    if (!branchId) return "Unknown Site";
    const branch = branches.find((b) => String(b.id) === String(branchId));
    return branch ? branch.name : "Unknown Site";
  };

  const [walletCredits, setWalletCredits] = useState(Array(12).fill(0)); 
  const [creditPurchases, setCreditPurchases] = useState(Array(12).fill(0)); 
  const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
  const [monthlyPaidInvoice, setMonthlyPaidInvoice] = useState(Array(12).fill(0),);
  const [monthlyGST, setMonthlyGST] = useState(Array(12).fill(0));
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0));
  const [incomeRevenue, setIncomeRevenue] = useState(Array(12).fill(0));
  const [incomeInvoice, setIncomeInvoice] = useState(Array(12).fill(0));
  const [monthlyReceived, setMonthlyReceived] = useState(Array(12).fill(0));
  const [chartData, setChartData] = useState([]);
  const [filterType, setFilterType] = useState(FILTER_TYPES.MONTHLY);
  const [month, setMonth] = useState(months[getCurrentMonth()]);
  const [year, setYear] = useState(getCurrentYear().toString());
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const [weekYear, setWeekYear] = useState(getCurrentYear().toString());
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchFilterEnabled, setBranchFilterEnabled] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [poInvoices, setPoInvoices] = useState([]);
  const [woInvoices, setWoInvoices] = useState([]);
  const [rawWalletData, setRawWalletData] = useState([]);
  const [rawCreditPurchases, setRawCreditPurchases] = useState([]);
  const [filteredWalletSummary, setFilteredWalletSummary] = useState({});
  const [siteWalletSummary, setSiteWalletSummary] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashPurchases, setCashPurchases] = useState([]);
  const [saleBills, setSaleBills] = useState([]);
  const [expenseData, setExpenseData] = useState({ gstExpenses: [], nonGstExpenses: [] });
  const [incomeData, setIncomeData] = useState([]);
  const [listPaymentSummaries, setListPaymentSummaries] = useState({});

  const sumArray = (arr = []) => arr.reduce((a, b) => a + (b || 0), 0);
  useEffect(() => {
    const today = new Date();
    if (filterType === FILTER_TYPES.MONTHLY) {
      setMonth(months[today.getMonth()]);
      setYear(today.getFullYear().toString());
    }
    if (filterType === FILTER_TYPES.QUARTERLY) {
      setQuarter(getCurrentQuarter());
      setYear(today.getFullYear().toString());
    }
    if (filterType === FILTER_TYPES.FINANCIAL_YEAR) {
      setFinancialYear(getCurrentFinancialYear());
    }
    if (filterType === FILTER_TYPES.WEEKLY) {
      setWeekNumber(getWeekNumber(today));
      setWeekYear(today.getFullYear().toString());
    }
    if (filterType === FILTER_TYPES.DAILY) {
      setSelectedDate(getCurrentDate());
    }
  }, [filterType]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [branchResponse, departmentResponse, categoryResponse] = await Promise.all([
          branchService.getAll(),
          departmentService.getAll(),
          categoryService.getAllCategories(),
        ]);

        if (branchResponse && Array.isArray(branchResponse)) {
          setBranches(branchResponse);
        } else if (branchResponse && branchResponse.data && Array.isArray(branchResponse.data)) {
          setBranches(branchResponse.data);
        }

        if (departmentResponse && Array.isArray(departmentResponse)) {
          setDepartments(departmentResponse);
        } else if (departmentResponse && departmentResponse.data && Array.isArray(departmentResponse.data)) {
          setDepartments(departmentResponse.data);
        }

        if (Array.isArray(categoryResponse)) {
          setCategories(categoryResponse);
        } else if (categoryResponse && Array.isArray(categoryResponse.data)) {
          setCategories(categoryResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const getExpensePaymentHead = (expense = {}, item = {}) => {
    const matchedCategory = categories.find(
      (category) => String(category.id) === String(expense.category_id || item.category_id),
    );

    return (
      matchedCategory?.name ||
      expense.category_name ||
      expense.payment_head ||
      expense.paymentHead ||
      item.payment_head ||
      item.category_name ||
      expense.description ||
      item.item_name ||
      "Other"
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!loading) {
      applyFilter();
    }
  }, [loading, filterType, month, year, quarter, financialYear, selectedDate, weekNumber, weekYear, selectedBranch, categories, listPaymentSummaries]);

  useEffect(() => {
    if (!loading) {
      setChartData([]);
      applyFilter();
    }
  }, [filterType, month, year, quarter, financialYear, selectedDate, weekNumber, weekYear, categories, listPaymentSummaries]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletRes,creditRes,cashRes,purchaseOrdersResponse,workOrdersResponse,poInvoicesResponse,woInvoicesResponse,saleBillsResponse,] =
       await Promise.all([
        branchWalletService.getAllWallets(),
        expenseService.getAllCreditPurchases(),
        expenseService.getAllExpenses(), 
        purchaseService.getAllPurchases(),
        workOrderService.getAllWorkOrders(),
        purchaseService.getAllPurchaseOrderInvoices(),
        workOrderService.getAllInvoices(),
        salebillService.getAllSaleBills(),
      ]);
      setCashPurchases(cashRes?.data || []);

      const walletTransactions = walletRes?.data || [];
      const creditWalletTransactions = walletTransactions.filter(
        (txn) => txn.transaction_type === "credit",
      );
      setRawWalletData(creditWalletTransactions);
      setRawCreditPurchases(creditRes?.data || []);

      const walletSummary = processWalletData(creditWalletTransactions);
      setSiteWalletSummary(walletSummary);
      setFilteredWalletSummary(walletSummary);

      const poData = extractDataFromResponse(purchaseOrdersResponse);
      const woData = extractDataFromResponse(workOrdersResponse);
      const poInvoiceData = extractDataFromResponse(poInvoicesResponse);
      const woInvoiceData = extractDataFromResponse(woInvoicesResponse);

      setPurchaseOrders(poData);
      setWorkOrders(woData);
      setPoInvoices(poInvoiceData);
      setWoInvoices(woInvoiceData);
      const saleBillsData = extractDataFromResponse(saleBillsResponse);
      setSaleBills(saleBillsData);

      // Fetch summaries for each bill to show Received amounts correctly
      saleBillsData.forEach(async (bill) => {
        try {
          const res = await salebillService.getPaymentsByBill(bill.id);
          if (res?.summary) {
            setListPaymentSummaries((prev) => ({
              ...prev,
              [bill.id]: res.summary,
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch summary for bill ${bill.id}`);
        }
      });

      processIncomeData(poData, woData, poInvoiceData, woInvoiceData, saleBillsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const prepareExpenseTables = () => {
    const gstExpenses = [];
    const nonGstExpenses = [];
    let sl = 1;
    const dateFilter = getDateFilterFunction();
const processExpenses = (list) => {
  list.forEach((exp) => {

    // ✅ Only include PAID expenses in preview
    const status = exp.payments_status || exp.payment_status || "";
    if (status.toLowerCase() !== "paid") return;

    const date = exp.payment_date || exp.actual_bill_date;
    if (!date) return;

    const expDate = new Date(date);
    if (dateFilter && !dateFilter(expDate)) return;

    exp.items?.forEach((item) => {
      const branchId = resolveExpenseBranchId(exp, item);
      if (selectedBranch && String(branchId) !== String(selectedBranch)) return;

      const formattedDate = expDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const value = Number(item.subtotal || 0);
      const gst = Number(item.tax_total || 0);
      const total = value + gst;
      const paymentHead = getExpensePaymentHead(exp, item);
      const vendorName = exp.vendor_name || item.vendor_name || item.vendor || exp.vendor || "";
      const branchName = exp.branch?.name || exp.site?.name || exp.Branch?.name || exp.Site?.name || item.branch?.name || item.site?.name || "";
      
      const row = {
        sl: sl++,
        date: formattedDate,
        name: item.item_name || exp.description || vendorName,
        paymentHead,
        vendor: vendorName,
        branchId,
        branchName,
        value,
        gst,
        total,
        month: expDate.toLocaleString("default", { month: "short" }),
      };

      if (isTaxableExpenseItem(item)) {
        gstExpenses.push(row);
      } else {
        nonGstExpenses.push(row);
      }
    });
  });
};
    processExpenses(cashPurchases);
    processExpenses(rawCreditPurchases);
    return { gstExpenses, nonGstExpenses };
  };
  const prepareIncomeTables = () => {
    const incomeRows = []; 
    let sl = 1;
    const dateFilter = getDateFilterFunction();
    const processWO = (list) => {
      list.forEach((inv) => {
        // if (!inv.status || inv.status.toLowerCase() !== "paid") return;
        // if (status !== "paid") return;
        const date = inv.created_at;
        if (!date) return;
        const invDate = new Date(date);
        if (dateFilter && !dateFilter(invDate)) return;
        if (!isBranchMatch(inv, selectedBranch)) return;
        const formattedDate = invDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const value = Number(inv.base_amount || 0);
        const gst = Number(inv.gst_amount || 0);
        const total = Number(inv.total_amount || 0);
        const branchId = inv.branch_id || inv.workOrder?.branch_id || inv.branch?.id || inv.Branch?.id || inv.site?.id || inv.Site?.id || inv.assigned_to || "";
        const branchName = inv.branch?.name || inv.site?.name || inv.Branch?.name || inv.Site?.name || inv.workOrder?.branch?.name || "";

        incomeRows.push({
          sl: sl++,
          date: formattedDate,
          description: inv.workOrder?.title || inv.wo_number,
          branchId,
          branchName,
          value,
          gst,
          total,
          job: "WO",
          month: invDate.toLocaleString("default", { month: "short" }),
        });
      });
    };

    const processPO = (list) => {
      list.forEach((inv) => {
        // if (!inv.status || inv.status.toLowerCase() !== "paid") return;
        // if (status !== "paid") return;
        const date = inv.created_at;
        if (!date) return;
        const invDate = new Date(date);
        if (dateFilter && !dateFilter(invDate)) return;
        if (!isBranchMatch(inv, selectedBranch)) return;
        const formattedDate = invDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const value = Number(inv.base_amount || 0);
        const gst = Number(inv.gst_amount || 0);
        const total = Number(inv.total_amount || 0);
        const branchId = inv.branch_id || inv.purchaseOrder?.branch_id || inv.branch?.id || inv.Branch?.id || inv.site?.id || inv.Site?.id || inv.assigned_to || "";
        const branchName = inv.branch?.name || inv.site?.name || inv.Branch?.name || inv.Site?.name || inv.purchaseOrder?.branch?.name || "";

        incomeRows.push({
          sl: sl++,
          date: formattedDate,
          description: inv.purchaseOrder?.vendor_name || inv.po_number,
          branchId,
          branchName,
          value,
          gst,
          total,
          job: "PO",
          month: invDate.toLocaleString("default", { month: "short" }),
        });
      });
    };

    const processSaleBills = (list) => {
      list.forEach((inv) => {
        // if (status !== "paid") return;
        const date = inv.invoice_date || inv.created_at || inv.updated_at;
        if (!date) return;
        const invDate = new Date(date);
        if (dateFilter && !dateFilter(invDate)) return;
        if (!isBranchMatch(inv, selectedBranch)) return;
        const formattedDate = invDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const value = Array.isArray(inv.services)
          ? inv.services.reduce((sum, item) => sum + Number(item.amount || 0), 0)
          : Number(inv.base_amount || 0);
        const gst = Array.isArray(inv.services)
          ? inv.services.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0)
          : Number(inv.gst_amount || 0);
        const total = value + gst;

        const serviceDescription = Array.isArray(inv.services)
          ? inv.services
              .map((item) => item.service_name || item.description || item.item_name)
              .filter(Boolean)
              .join(", ")
          : "";

        const branchId = inv.branch_id || inv.branch?.id || inv.Branch?.id || inv.site?.id || inv.Site?.id || inv.purchase_order?.branch_id || inv.assigned_to || "";
        const branchName = inv.branch?.name || inv.site?.name || inv.Branch?.name || inv.Site?.name || "";

        incomeRows.push({
          sl: sl++,
          date: formattedDate,
          description: serviceDescription || inv.customer_name || inv.sale_bill_number,
          branchId,
          branchName,
          value,
          gst,
          total,
          received: Number(listPaymentSummaries[inv.id]?.total_received || inv.received_amount || inv.total_received || 0),
          tds: Number(listPaymentSummaries[inv.id]?.total_tds || 0),
          deductions: Number(listPaymentSummaries[inv.id]?.total_deductions || 0),
          advance: Number(inv.advance_amount || 0),
          job: "Sale",
          month: invDate.toLocaleString("default", { month: "short" }),
        });
      });
    };

    processWO(woInvoices);
    processPO(poInvoices);
    processSaleBills(saleBills);
    return incomeRows;
  };
  const processWalletData = (
    transactions,
    branchFilter = null,
    dateFilter = null,
  ) => {
    const summary = {};
    (transactions || []).forEach((txn) => {
      const branchId = txn.branch_id;
      if (branchFilter && String(branchId) !== String(branchFilter)) {
        return;
      }
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
          transactions: [],
        };
      }
      summary[branchId].transactions.push(txn);
      if (txn.transaction_type === "credit") {
        summary[branchId].totalCredited += Number(txn.amount || 0);
      }
    });
    return summary;
  };

  const getDateFilterFunction = () => {
    switch (filterType) {
      case FILTER_TYPES.DAILY:
        if (!selectedDate) return null;
        const selected = new Date(selectedDate);
        return (date) => {
          return (
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear()
          );
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
          Q1: [0, 1, 2, 3], // Jan, Feb, Mar, Apr
          Q2: [4, 5, 6, 7], // May, Jun, Jul, Aug
          Q3: [8, 9, 10, 11], // Sep, Oct, Nov, Dec
        };
        const quarterMonths = quarterMap[quarter] || [];
        return (date) =>
          quarterMonths.includes(date.getMonth()) &&
          date.getFullYear().toString() === year;

      case FILTER_TYPES.FINANCIAL_YEAR:
        if (!financialYear) return null;
        const [startYear] = financialYear.split("-");
        const nextYear = parseInt(startYear) + 1;
        const startDate = new Date(startYear, 3, 1);
        const endDate = new Date(nextYear, 2, 31); 
        return (date) => date >= startDate && date <= endDate;
      default:
        return null;
    }
  };

  const isDateInRange = (date, filterType, filterData) => {
    const filterDate = new Date(date);
    const filterMonth = filterDate.getMonth() + 1;
    const filterYear = filterDate.getFullYear();
    const filterDay = filterDate.getDate();

    switch (filterType) {
      case FILTER_TYPES.DAILY:
        if (!filterData.date) return true;
        const selectedDateObj = new Date(filterData.date);
        return (
          filterDay === selectedDateObj.getDate() &&
          filterMonth === selectedDateObj.getMonth() + 1 &&
          filterYear === selectedDateObj.getFullYear()
        );
      case FILTER_TYPES.WEEKLY:
        if (!filterData.weekNumber || !filterData.weekYear) return true;
        const weekRange = getWeekRange(
          Number(filterData.weekNumber),
          Number(filterData.weekYear),
        );
        return filterDate >= weekRange.start && filterDate <= weekRange.end;
      case FILTER_TYPES.MONTHLY:
        const monthIndex = months.indexOf(month) + 1;
        return filterMonth === monthIndex && filterYear === parseInt(year);
      case FILTER_TYPES.QUARTERLY:
        const quarterRange = getMonthRangeForQuarter(quarter);
        return (
          filterMonth >= quarterRange.start &&
          filterMonth <= quarterRange.end &&
          filterYear === parseInt(year)
        );
      case FILTER_TYPES.FINANCIAL_YEAR:
        const fyRange = getFinancialYearMonths(financialYear);
        if (
          filterMonth >= fyRange.startMonth &&
          filterMonth <= 12 &&
          filterYear === fyRange.startYear
        ) {return true;
        }
        if (
          filterMonth >= 1 &&
          filterMonth <= fyRange.endMonth &&
          filterYear === fyRange.endYear
        ) {return true;
        }return false;
      default:
        return true;
    }
  };

  const isBranchMatch = (item, branchId) => {
    if (!branchId || branchId === "") return true;
    try {
      const branchIdNum = Number(branchId);
      if (item.purchaseOrder && item.purchaseOrder.branch_id) {
        const poBranchId = Number(item.purchaseOrder.branch_id);
        if (poBranchId === branchIdNum) {return true;}
      }
      if (item.workOrder && item.workOrder.id) {
        const correspondingWorkOrder = workOrders.find((wo) => wo.id === item.workOrder.id || wo.wo_number === item.wo_number,);

        if (correspondingWorkOrder && correspondingWorkOrder.assigned_to) {
          const woBranchId = Number(correspondingWorkOrder.assigned_to);
          if (woBranchId === branchIdNum) {return true;}
        }
      }
      if (item.assigned_to) {
        const assignedBranchId = Number(item.assigned_to);
        if (assignedBranchId === branchIdNum) {return true;}
      }
      if (item.branch_id) {
        const itemBranchId = Number(item.branch_id);
        if (itemBranchId === branchIdNum) {return true;}
      }
      return !branchFilterEnabled;
    } catch (err) {
      console.error("Error in branch matching:", err);
      return true;
    }
  };

  const getCurrentFilterData = () => {
    const monthIndex = months.indexOf(month) + 1;

    switch (filterType) {
      case "daily":
        return {type: "daily",date: selectedDate,};
      case "weekly":
        return {type: "weekly",weekNumber: weekNumber,weekYear: weekYear,};
      case "monthly":
        return {type: "monthly",month: monthIndex,year: year,};
      case "quarterly":
        return {type: "quarterly",quarter: quarter,year: year,};
      case "financial_year":
        return {type: "financial_year",financialYear: financialYear,};
      default:
        const currentDate = new Date();
        return {type: "monthly",month: currentDate.getMonth() + 1,year: currentDate.getFullYear().toString(),};    }
  };


  const processIncomeData = (poData, woData, poInvoiceData, woInvoiceData, saleBillsData) => {
    const revenueByMonth = Array(12).fill(0);
    const paidInvoiceByMonth = Array(12).fill(0);
    const gstByMonth = Array(12).fill(0);
    const receivedByMonth = Array(12).fill(0);
    const filterData = getCurrentFilterData();

    if (Array.isArray(poData)) {
      poData.forEach((po) => {
        try {
          const dateStr = po.created_at || po.po_date;
          if (dateStr) {
            const date = new Date(dateStr);
            const dateInRange = isDateInRange(date, filterType, filterData);
            let branchMatch = true;
            if (branchFilterEnabled && selectedBranch) {
              if (po.branch_id) {
                const branchId = Number(po.branch_id);
                branchMatch = branchId === Number(selectedBranch);
              } else { branchMatch = false;}
            }

            if (dateInRange && branchMatch) {
              const baseAmount = parseFloat(po.total_amount) || 0;
              if (!isNaN(baseAmount)) {
                const month = date.getMonth();
                revenueByMonth[month] += baseAmount;
              }
            }
          }
        } catch (dateErr) {
          console.warn("Error processing PO date:", dateErr, po);
        }
      });
    }

    if (Array.isArray(woData)) {
      woData.forEach((wo) => {
        try {
          const dateStr = wo.created_at || wo.issue_date;
          if (dateStr) {
            const date = new Date(dateStr);
            const dateInRange = isDateInRange(date, filterType, filterData);
            let branchMatch = true;
            if (branchFilterEnabled && selectedBranch) {
              if (wo.assigned_to) {
                const branchId = Number(wo.assigned_to);
                branchMatch = branchId === Number(selectedBranch);
              } else { branchMatch = false;}
            }

            if (dateInRange && branchMatch) {
              const baseAmount = parseFloat(wo.work_order_amount) || 0;
              if (!isNaN(baseAmount)) {
                const month = date.getMonth();
                revenueByMonth[month] += baseAmount;
              }
            }
          }
        } catch (dateErr) {
          console.warn("Error processing WO date:", dateErr, wo);
        }
      });
    }

    if (Array.isArray(poInvoiceData)) {
      poInvoiceData.forEach((poInvoice) => {
        try {
          const dateStr = poInvoice.created_at || poInvoice.updated_at;
          if (dateStr) {
            const date = new Date(dateStr);
            const dateInRange = isDateInRange(date, filterType, filterData);
            const branchMatch = isBranchMatch(poInvoice, selectedBranch);
            const isPaid = poInvoice.status && poInvoice.status.toLowerCase() === "paid";
            if (dateInRange && branchMatch && isPaid) {
              const month = date.getMonth();
              const paymentAmount = parseFloat(poInvoice.total_amount) || 0;
              const gstAmount = parseFloat(poInvoice.gst_amount) || 0;
              if (paymentAmount > 0) { paidInvoiceByMonth[month] += paymentAmount; gstByMonth[month] += gstAmount;}
            }
          }
        } catch (dateErr) {
          console.warn("Error processing PO invoice:", dateErr, poInvoice);
        }
      });
    }

    if (Array.isArray(woInvoiceData)) {
      woInvoiceData.forEach((woInvoice) => {
        try {
          const dateStr = woInvoice.created_at || woInvoice.updated_at;
          if (dateStr) {
            const date = new Date(dateStr);
            const dateInRange = isDateInRange(date, filterType, filterData);
            const branchMatch = isBranchMatch(woInvoice, selectedBranch);
            const isPaid = woInvoice.status && woInvoice.status.toLowerCase() === "paid";
            if (dateInRange && branchMatch && isPaid) {
              const month = date.getMonth();
              const paymentAmount = parseFloat(woInvoice.total_amount) || 0;
              const gstAmount = parseFloat(woInvoice.gst_amount) || 0;
              if (paymentAmount > 0) { paidInvoiceByMonth[month] += paymentAmount; gstByMonth[month] += gstAmount; }
            }
          }
        } catch (dateErr) {
          console.warn("Error processing WO invoice:", dateErr, woInvoice);
        }
      });
    }

    if (Array.isArray(saleBillsData)) {
      saleBillsData.forEach((saleBill) => {
        try {
          const dateStr = saleBill.invoice_date || saleBill.created_at || saleBill.updated_at;
          if (dateStr) {
            const date = new Date(dateStr);
            const dateInRange = isDateInRange(date, filterType, filterData);
            const branchMatch = isBranchMatch(saleBill, selectedBranch);
            
            if (dateInRange && branchMatch) {
              const month = date.getMonth();
              
              const baseAmount = Array.isArray(saleBill.services)
                ? saleBill.services.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                : parseFloat(saleBill.base_amount) || 0;
                
              const gstAmount = Array.isArray(saleBill.services)
                ? saleBill.services.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0)
                : parseFloat(saleBill.gst_amount) || 0;

              // Received Amount
              const summary = listPaymentSummaries[saleBill.id];
              const receivedAmount = summary 
                ? Number(summary.total_received || 0)
                : parseFloat(saleBill.received_amount || saleBill.total_received || 0);

              // We add the total bill amount to the "Income" (as requested: "sale bill all ka")
              paidInvoiceByMonth[month] += baseAmount; 
              gstByMonth[month] += gstAmount;
              receivedByMonth[month] += receivedAmount;
            }
          }
        } catch (dateErr) {
          console.warn("Error processing sale bill:", dateErr, saleBill);
        }
      });
    }


    const incomeByMonth = paidInvoiceByMonth.map((amount, index) => amount + gstByMonth[index]);
    setMonthlyRevenue(revenueByMonth);
    setMonthlyPaidInvoice(paidInvoiceByMonth);
    setMonthlyGST(gstByMonth);
    setMonthlyIncome(incomeByMonth);
    setMonthlyReceived(receivedByMonth);
    setIncomeRevenue(revenueByMonth);
    setIncomeInvoice(paidInvoiceByMonth);
    prepareChartData(incomeByMonth, revenueByMonth);
  };

  const prepareChartData = (incomeByMonth, revenueByMonth) => {
    let chartData = [];
    switch (filterType) {
      case FILTER_TYPES.DAILY:
        const dailyDate = new Date(selectedDate);
        const dailyMonth = dailyDate.getMonth();
        const income = incomeByMonth[dailyMonth] || 0;
        const dailyExpense = (walletCredits[dailyMonth] || 0) + (creditPurchases[dailyMonth] || 0);

        chartData = [
          {
            name: dailyDate.toLocaleDateString("en-IN", { day: "numeric", month: "short",}),
            profit: income - dailyExpense,
            monthIndex: dailyMonth,
            hasTransactions: income > 0 || dailyExpense > 0,
          },
        ];
        break;

      case FILTER_TYPES.WEEKLY:
        const weekDate = getWeekRange( Number(weekNumber), Number(weekYear),).start;
        const weekMonth = weekDate.getMonth();
        const weekIncome = incomeByMonth[weekMonth] || 0;
        const weekExpense = (walletCredits[weekMonth] || 0) + (creditPurchases[weekMonth] || 0);

        chartData = [
          {
            name: `Week ${weekNumber}`,
            profit: weekIncome - weekExpense,
            monthIndex: weekMonth,
            hasTransactions: weekIncome > 0 || weekExpense > 0,
          },
        ];
        break;

      case FILTER_TYPES.MONTHLY:
        const selectedMonthIndex = months.indexOf(month);
        if (selectedMonthIndex !== -1) {
          const monthlyIncome = incomeByMonth[selectedMonthIndex] || 0;
          const monthlyExpense =(walletCredits[selectedMonthIndex] || 0) +(creditPurchases[selectedMonthIndex] || 0);

          chartData = [
            {
              name: `${month.substring(0, 3)} ${year}`,
              profit: monthlyIncome - monthlyExpense,
              monthIndex: selectedMonthIndex,
              hasTransactions: monthlyIncome > 0 || monthlyExpense > 0,
            },
          ];
        }
        break;

      case FILTER_TYPES.QUARTERLY:
        const quarterRange = getMonthRangeForQuarter(quarter);
        const quarterMonths = months.slice(quarterRange.start - 1,quarterRange.end,);

        chartData = quarterMonths.map((monthName, index) => {
          const monthIndex = quarterRange.start - 1 + index;
          const qIncome = incomeByMonth[monthIndex] || 0;
          const qExpense =
            (walletCredits[monthIndex] || 0) +
            (creditPurchases[monthIndex] || 0);

          return {
            name: monthName.substring(0, 3),
            profit: qIncome - qExpense,
            monthIndex: monthIndex,
            hasTransactions: qIncome > 0 || qExpense > 0,
          };
        });
        break;

      case FILTER_TYPES.FINANCIAL_YEAR:
        const [startYear] = financialYear.split("-");
        const fyStartYear = parseInt(startYear);
        chartData = months.map((monthName, index) => {
          const fyIncome = incomeByMonth[index] || 0;
          const fyExpense = (walletCredits[index] || 0) + (creditPurchases[index] || 0);
          return {
            name: `${shortMonth(monthName)} ${fyStartYear}`,
            profit: fyIncome - fyExpense,
            monthIndex: index,
            hasTransactions: fyIncome > 0 || fyExpense > 0,
          };
        });
        break;

      default:
        chartData = [];
    }
    setChartData(chartData);
  };

  const applyFilter = () => {
    if (
      (!rawWalletData || rawWalletData.length === 0) &&
      (!rawCreditPurchases || rawCreditPurchases.length === 0)
    )
      return;
    const dateFilter = getDateFilterFunction();
    let filteredWallet = Array(12).fill(0);
    let filteredCredit = Array(12).fill(0);
    (rawWalletData || []).forEach((w) => {
      if (!w.created_at) return;
      if (selectedBranch && String(w.branch_id) !== String(selectedBranch))
        return;
      if (w.transaction_type !== "credit") return;
      const walletDate = new Date(w.created_at);
      if (dateFilter && !dateFilter(walletDate)) return;
      const walletMonth = walletDate.getMonth();
      filteredWallet[walletMonth] += Number(w.amount || 0);
    });

    (rawCreditPurchases || []).forEach((c) => {
      if (!c.createdAt) return;
      if (selectedBranch && String(c.branch_id) !== String(selectedBranch))
        return;
      const isPaid = c.payment_status && c.payment_status.toLowerCase() === "paid";
      if (!isPaid) return;
      const purchaseDate = new Date(c.createdAt);
      if (dateFilter && !dateFilter(purchaseDate)) return;
      const purchaseMonth = purchaseDate.getMonth();
      filteredCredit[purchaseMonth] += Number(c.total_amount || 0);
    });
    setWalletCredits(filteredWallet);
    setCreditPurchases(filteredCredit);

    const filteredWalletSummary = processWalletData(
      rawWalletData,
      selectedBranch || null,
      dateFilter || null,
    );
    setFilteredWalletSummary(filteredWalletSummary);
    processIncomeData(purchaseOrders, workOrders, poInvoices, woInvoices, saleBills);
    setExpenseData(prepareExpenseTables());
    setIncomeData(prepareIncomeTables());
  };

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    setBranchFilterEnabled(Boolean(value));
  };
  const handleReset = () => {
    const today = new Date();
    setFilterType(FILTER_TYPES.MONTHLY);
    setMonth(months[getCurrentMonth()]);
    setYear(getCurrentYear().toString());
    setQuarter(getCurrentQuarter());
    setFinancialYear(getCurrentFinancialYear());
    setSelectedDate(getCurrentDate());
    setWeekNumber(getWeekNumber(today));
    setWeekYear(getCurrentYear().toString());
    setSelectedBranch("");
    setBranchFilterEnabled(false);
  };

  const calculateIncomeTotals = () => {
    const revenueTotal = monthlyRevenue.reduce((a, b) => a + b, 0);
    const paidInvoiceTotal = monthlyPaidInvoice.reduce((a, b) => a + b, 0);
    const gstTotal = monthlyGST.reduce((a, b) => a + b, 0);
    const incomeTotal = paidInvoiceTotal + gstTotal;
    const receivedTotal = sumArray(monthlyReceived);
    return { revenueTotal, paidInvoiceTotal, gstTotal, incomeTotal, receivedTotal };
  };

  const incomeTotals = calculateIncomeTotals();
  const totalIncome = incomeTotals.incomeTotal; 
  const totalExpense = sumArray(walletCredits) + sumArray(creditPurchases); 
  const profit = totalIncome - totalExpense;

  let profitPercent = 0;

  if (profit > 0 && totalIncome > 0) {
    profitPercent = (profit / totalIncome) * 100;
  } else if (profit < 0 && totalExpense > 0) { profitPercent = (Math.abs(profit) / totalExpense) * 100;}
  profitPercent = Math.min(100, Math.max(0, profitPercent));
  profitPercent = profitPercent.toFixed(1);
  const isProfit = profit >= 0;

  const getDurationText = () => {
    let parts = [];

    switch (filterType) {
      case FILTER_TYPES.DAILY:
        parts.push(new Date(selectedDate).toLocaleDateString("en-IN", {weekday: "long",year: "numeric",month: "long",day: "numeric",}),);
        break;
      case FILTER_TYPES.WEEKLY:
        const week = getWeekRange(Number(weekNumber), Number(weekYear));
        const start = week.start.toLocaleDateString("en-IN", {day: "numeric",month: "short",});
        const end = week.end.toLocaleDateString("en-IN", {day: "numeric",month: "short",year: "numeric",});
        parts.push(`Week ${weekNumber}, ${weekYear} (${start} - ${end})`);
        break;
      case FILTER_TYPES.MONTHLY:
        parts.push(`Month: ${month} ${year}`);
        break;
      case FILTER_TYPES.QUARTERLY:
        parts.push(`Quarter: ${quarter} ${year}`);
        break;
      case FILTER_TYPES.FINANCIAL_YEAR:
        parts.push(`Financial Year: ${financialYear}`);
        break;
      default:
        parts.push(`Month: ${month} ${year}`);
    }

    if (selectedBranch) {
      const branchName = branches.find((b) => String(b.id) === String(selectedBranch),)?.name;
      parts.push(`Site: ${branchName}`);
    }
    return parts.join(" | ");
  };

  const getProfitForMonth = (monthIndex) => {
    const income = monthlyIncome[monthIndex] || 0;
    const expense = (walletCredits[monthIndex] || 0) + (creditPurchases[monthIndex] || 0);
    return income - expense;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const value = payload[0].value;
      const isProfitValue = value > 0;
      const isLossValue = value < 0;

      if (dataPoint && dataPoint.hasTransactions === false) {
        return (
          <div className="bg-white p-3 shadow-sm border rounded">
            <p className="mb-1 fw-semibold">{label}</p>
            <p className="mb-0 text-muted"><strong>No transactions</strong></p>
          </div>
        );
      }

      return (
        <div className="bg-white p-3 shadow-sm border rounded">
          <p className="mb-1 fw-semibold">{label}</p>
          <p className={`mb-0 ${isProfitValue ? "text-success" : isLossValue ? "text-danger" : "text-muted"}`}>
            <strong>
              {isProfitValue? "Profit: ": isLossValue  ? "Loss: "  : "Break-even: "}
              {formatINR(Math.abs(value))}
            </strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTableExportData = () => {
    const header = ["TYPE", ...months.map((m) => shortMonth(m))];
    const rows = [
      ["Income :", ...Array(12).fill("")],
      ["Revenue (WO + PO)", ...monthlyRevenue.map((v) => v.toFixed(2))],
      ["Paid Invoice", ...monthlyPaidInvoice.map((v) => v.toFixed(2))],
      ["GST", ...monthlyGST.map((v) => v.toFixed(2))],
      ["Income (= Paid Invoice)", ...monthlyIncome.map((v) => v.toFixed(2))],
      ["Expense :", ...Array(12).fill("")],
      ["Wallet Credits", ...walletCredits.map((v) => v.toFixed(2))],
      ["Credit Purchases", ...creditPurchases.map((v) => v.toFixed(2))],
      ["Profit = Income - Expense", ...Array(12).fill("")],
      ["Profit", ...months.map((_, i) => getProfitForMonth(i).toFixed(2))],
    ];
    return { header, rows };
  };

const handleExportExcel = () => {
  const formatMoney = (num) => {
    if (num == null || num === "") return "";
    return { v: Number(num), t: "n", z: "₹ #,##0.00" };
  };

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([]);

  const reportTitle = `Income vs Expense Report - Month: ${month} ${year} ${selectedBranch ? `(${getBranchName(selectedBranch)})` : "(Site name)"}`;

  // ==================== TITLE ====================
  // Shifting origin to B2 for a blank row/column space
  XLSX.utils.sheet_add_aoa(sheet, [[reportTitle]], { origin: "B2" });
  sheet["!merges"] = [
    { s: { r: 1, c: 1 }, e: { r: 1, c: 19 } }, // Ends at Column T (Index 19)
    { s: { r: 4, c: 1 }, e: { r: 4, c: 9 } },
    { s: { r: 4, c: 11 }, e: { r: 4, c: 19 } }, 
  ];

  // ==================== COLLECTED TAX & PAID TAX TABLES ====================
  XLSX.utils.sheet_add_aoa(sheet, [
    ["Individual site break-up", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Collected TAX", "", "", "", "", "", "", "", "", "", "Paid TAX", "", "", "", "", "", "", ""]
  ], { origin: "B4" });

  // Headers (Adding more blanks to separate tables)
  XLSX.utils.sheet_add_aoa(sheet, [[
    "Sl No", "Date", "Description", "Value", "TAX", "Total Value", "Job", "Against Month", "Site Name", "",
    "Sl No", "Date", "Payment Head", "Value", "TAX", "Total Value", "Job", "Against Month", "Site Name"
  ]], { origin: "B6" });

  const { gstExpenses = [], nonGstExpenses = [] } = expenseData || {};
  const nonGstExpensesData = Array.isArray(nonGstExpenses) ? nonGstExpenses : [];
  const groupedNonGstExpenses = groupExpensesByHead(nonGstExpensesData, "value");
  const incomeRows = incomeData || [];

  // Income Side (Collected TAX)
  incomeRows.forEach((row, idx) => {
    XLSX.utils.sheet_add_aoa(sheet, [[
      idx + 1,
      row.date,
      row.description,
      formatMoney(row.value),
      formatMoney(row.gst),
      formatMoney(row.total),
      row.job,
      row.month,
      row.branchName || getBranchName(row.branchId)
    ]], { origin: `B${7 + idx}` });
  });

  const incomeTotalRow = 7 + incomeRows.length;
  XLSX.utils.sheet_add_aoa(sheet, [[
    "Total", "", "", formatMoney(sum(incomeRows, "value")), formatMoney(sum(incomeRows, "gst")), formatMoney(sum(incomeRows, "total")), "", "", ""
  ]], { origin: `B${incomeTotalRow}` });
  sheet["!merges"].push({ s: { r: incomeTotalRow - 1, c: 1 }, e: { r: incomeTotalRow - 1, c: 3 } });

  // Expense Side (Paid TAX)
  gstExpenses.forEach((row, idx) => {
    XLSX.utils.sheet_add_aoa(sheet, [[
      idx + 1,
      row.date,
      row.paymentHead,
      formatMoney(row.value),
      formatMoney(row.gst),
      formatMoney(row.total),
      row.job || "O & M",
      row.month,
      row.branchName || getBranchName(row.branchId)
    ]], { origin: `L${7 + idx}` });
  });

  const expenseTotalRow = 7 + gstExpenses.length;
  XLSX.utils.sheet_add_aoa(sheet, [[
    "Total", "", "", formatMoney(sum(gstExpenses, "value")), formatMoney(sum(gstExpenses, "gst")), formatMoney(sum(gstExpenses, "total")), "", "", ""
  ]], { origin: `L${expenseTotalRow}` });
  sheet["!merges"].push({ s: { r: expenseTotalRow - 1, c: 11 }, e: { r: expenseTotalRow - 1, c: 13 } });

  // Tax Summary
  const taxSummaryRow = Math.max(incomeTotalRow, expenseTotalRow) + 2;
  XLSX.utils.sheet_add_aoa(sheet, [
    ["Collected TAX", formatMoney(sum(incomeRows, "gst"))],
    ["Paid TAX", formatMoney(sum(gstExpenses, "gst"))],
    ["Difference", formatMoney(sum(incomeRows, "gst") - sum(gstExpenses, "gst"))]
  ], { origin: `B${taxSummaryRow}` });

  // ==================== SIDE-BY-SIDE SUMMARY TABLES ====================
  const nonGstStart = taxSummaryRow + 4;
  XLSX.utils.sheet_add_aoa(sheet, [["Non-GST payments done on different head"]], { origin: `B${nonGstStart}` });

  const nonGstRows = (groupedNonGstExpenses && groupedNonGstExpenses.length > 0)
    ? groupedNonGstExpenses.map((item) => [
        item.head,
        formatMoney(item.amount),
      ])
    : [
        ["Salary", 50000],
        ["local purchase", 50000],
        ["vehicle", 50000],
        ["Room rents", 50000],
        ["diesel", 50000],
        ["spares", 50000],
        ["Medical", 50000],
        ["Transport", 50000],
        ["ESI", 50000],
        ["EPF", 50000],
        ["Supervisor charges", 50000],
        ["Consultancy charges", 50000],
        ["other if any", 50000],
      ];

  XLSX.utils.sheet_add_aoa(sheet, [["Head", "Amount"]], { origin: `B${nonGstStart + 1}` });
  XLSX.utils.sheet_add_aoa(sheet, nonGstRows, { origin: `B${nonGstStart + 2}` });

  const nonGstTotalRow = nonGstStart + 2 + nonGstRows.length;
  XLSX.utils.sheet_add_aoa(sheet, [["Total", formatMoney(sum(nonGstExpensesData, "value"))]], { origin: `B${nonGstTotalRow}` });

  // ==================== TOTAL PAYMENT DONE & SUMMARY (Moved Side-to-Side) ====================
  const summaryStart = nonGstStart; // Aligning with Non-GST row
  XLSX.utils.sheet_add_aoa(sheet, [["Total Payment Done", "Both TAX & Without TAX"]], { origin: `G${summaryStart}` });

  const groupedGstByCategory = {};
  const groupedNonGstByCategory = {};

  gstExpenses.forEach((exp) => {
    const key = exp.paymentHead || "Other";
    if (!groupedGstByCategory[key]) groupedGstByCategory[key] = 0;
    groupedGstByCategory[key] += Number(exp.total || exp.value || 0);
  });
  
  nonGstExpensesData.forEach((exp) => {
    const key = exp.paymentHead || exp.name || "Other";
    if (!groupedNonGstByCategory[key]) groupedNonGstByCategory[key] = 0;
    groupedNonGstByCategory[key] += Number(exp.value || exp.total || 0);
  });

  const categoryRows = [["Description", "Amount"]];
  let totalPaymentDone = 0;
  
  let gstCategoryCount = 0;
  Object.entries(groupedGstByCategory).forEach(([head, total]) => {
    totalPaymentDone += Number(total || 0);
    categoryRows.push([head, formatMoney(total)]);
    gstCategoryCount++;
  });
  
  let nonGstCategoryCount = 0;
  Object.entries(groupedNonGstByCategory).forEach(([head, total]) => {
    totalPaymentDone += Number(total || 0);
    categoryRows.push([head, formatMoney(total)]);
    nonGstCategoryCount++;
  });
  categoryRows.push(["Total", formatMoney(totalPaymentDone)]);

  XLSX.utils.sheet_add_aoa(sheet, categoryRows, { origin: `G${summaryStart + 1}` });

  // Details for Month
  const invoiceRaisedTotal = sum(incomeRows, "value");
  const purchasedTotal = sum(gstExpenses, "value");
  const nonGstExpensesTotal = sum(nonGstExpensesData, "value");
  const nonGstAmount = sum(incomeRows, "gst") - sum(gstExpenses, "gst");
  const profitLoss = invoiceRaisedTotal - purchasedTotal - nonGstExpensesTotal;

  XLSX.utils.sheet_add_aoa(sheet, [
    [`Details for Month: ${month} ${year}`, ""],
    ["Invoice Raised", formatMoney(invoiceRaisedTotal)],
    ["Less Purchased", formatMoney(-purchasedTotal)],
    ["Less Non-GST Expenses", formatMoney(-nonGstExpensesTotal)],
    ["Profit / Loss", formatMoney(profitLoss)],
    ["Non GST Amount", formatMoney(nonGstAmount)]
  ], { origin: `L${summaryStart}` });
  if (!sheet["!merges"]) sheet["!merges"] = [];
  sheet["!merges"].push({ s: { r: summaryStart - 1, c: 11 }, e: { r: summaryStart - 1, c: 12 } });

  // ==================== ALL SITES CUMULATIVE & WALLET DETAILS ====================
  // Automatically calculate the start of the next section based on the longest table above
  const maxSummaryRow = Math.max(
    nonGstTotalRow,
    summaryStart + categoryRows.length,
    summaryStart + 5
  );
  const walletStart = maxSummaryRow + 3;
  const r0 = walletStart - 1;
  const r1 = walletStart;
  const r2 = walletStart + 1;
  const r3 = walletStart + 2;

  XLSX.utils.sheet_add_aoa(sheet, [[
    "Wallet Details", "", "", "", "",
    "All sites income / exp cumulative", "", "", "", "", "", "", "", "", "", "", ""
  ]], { origin: `B${walletStart}` });

  XLSX.utils.sheet_add_aoa(sheet, [[
    "Sl No", "Site Name", "Advance Payment Wallet", "Purchase & Expenses (Common)", "Closing Balance Wallet",
    "Sl. No.",
    "Sale Invoice Details", "", "", "", "", "", "",
    "Purchase / Expenses", "", "", "",
    "L (C - E - F - K) \n Profit & Loss "
  ]], { origin: `B${walletStart + 1}` });

  XLSX.utils.sheet_add_aoa(sheet, [[
    "", "", "", "", "",
    "",
    "A", "B", "C (A + B)", "D", "E (C-D)", "F", "G",
    "H", "I", "J", "K (H+I+J)",
    ""
  ]], { origin: `B${walletStart + 2}` });

  XLSX.utils.sheet_add_aoa(sheet, [[
    "", "", "", "", "",
    "",
    "Taxable Value", "GST", "Total Invoice Value", "Payment Received", "Difference Amount", "Deduction", "TDS",
    "GST Purchase\n(Including GST)", "Non-GST Purchase &\nOther Expenses", "Payable GST Difference", "Total",
    ""
  ]], { origin: `B${walletStart + 3}` });

  sheet["!merges"].push(
    { s: { r: r0, c: 1 }, e: { r: r0, c: 5 } },
    { s: { r: r0, c: 6 }, e: { r: r0, c: 18 } },
    { s: { r: r1, c: 1 }, e: { r: r3, c: 1 } },
    { s: { r: r1, c: 2 }, e: { r: r3, c: 2 } },
    { s: { r: r1, c: 3 }, e: { r: r3, c: 3 } },
    { s: { r: r1, c: 4 }, e: { r: r3, c: 4 } },
    { s: { r: r1, c: 5 }, e: { r: r3, c: 5 } },
    { s: { r: r1, c: 6 }, e: { r: r3, c: 6 } },
    { s: { r: r1, c: 7 }, e: { r: r1, c: 13 } },
    { s: { r: r1, c: 14 }, e: { r: r1, c: 17 } },
    { s: { r: r1, c: 18 }, e: { r: r3, c: 18 } }
  );

  const siteSummary = {};
  const addSite = (branchId) => {
    const id = String(branchId || "");
    if (!siteSummary[id]) {
      siteSummary[id] = {
        branchId: id, taxableValue: 0, gst: 0, totalInvoice: 0, paymentReceived: 0,
        advance: 0, deductions: 0, tds: 0, difference: 0, gstPurchase: 0, nonGstPurchase: 0,
        totalPurchase: 0, profitLoss: 0, gstPaid: 0,
      };
    }
    return siteSummary[id];
  };

  const allBranchIds = new Set();
  if (!selectedBranch) branches.forEach((branch) => allBranchIds.add(String(branch.id)));
  Object.keys(filteredWalletSummary || {}).forEach((branchId) => { if (branchId) allBranchIds.add(String(branchId)); });
  incomeRows.forEach((row) => { if (row.branchId) allBranchIds.add(String(row.branchId)); });
  gstExpenses.forEach((row) => { if (row.branchId) allBranchIds.add(String(row.branchId)); });
  nonGstExpensesData.forEach((row) => { if (row.branchId) allBranchIds.add(String(row.branchId)); });
  allBranchIds.forEach((branchId) => addSite(branchId));

  Object.entries(filteredWalletSummary || {}).forEach(([branchId, summary]) => {
    const site = addSite(branchId);
    // site.paymentReceived += Number(summary?.totalCredited || 0); // Removed as per request
  });

  incomeRows.filter((row) => row.job === "Sale").forEach((row) => {
    const site = addSite(row.branchId);
    site.taxableValue += Number(row.value || 0);
    site.gst += Number(row.gst || 0);
    site.paymentReceived += Number(row.received || 0);
    site.tds += Number(row.tds || 0);
    site.deductions += Number(row.deductions || 0);
    site.advance += Number(row.advance || 0);
  });

  gstExpenses.forEach((row) => {
    const site = addSite(row.branchId);
    site.gstPurchase += Number(row.value || 0);
    site.gstPaid += Number(row.gst || 0);
  });

  nonGstExpensesData.forEach((row) => {
    const site = addSite(row.branchId);
    site.nonGstPurchase += Number(row.value || 0);
  });

  const walletBranchIds = Array.from(allBranchIds).sort((a, b) => getBranchName(a).localeCompare(getBranchName(b)));
  
  let totalAdvance = 0, totalPurchaseExpenses = 0, totalClosing = 0;
  let totalTaxable = 0, totalGst = 0, totalInvoiceValue = 0, totalPaymentReceived = 0, totalTds = 0, totalDifference = 0;
  let totalGstPurchase = 0, totalNonGstPurchase = 0, totalPurchase = 0, totalProfit = 0, totalPayableGstDiff = 0, totalNewProfitLoss = 0;

  const combinedRows = walletBranchIds.map((branchId, idx) => {
    const summary = filteredWalletSummary[branchId] || {};
    const branch = summary.branchName || getBranchName(branchId);
    const advancePayment = Number(summary.totalCredited || 0);
    const purchaseExpenses = Number((siteSummary[branchId]?.gstPurchase || 0) + (siteSummary[branchId]?.nonGstPurchase || 0));
    const closingBalance = advancePayment - purchaseExpenses;

    const site = siteSummary[branchId] || addSite(branchId);
    site.totalInvoice = site.taxableValue + site.gst;
    site.difference = site.totalInvoice - (site.paymentReceived + site.tds + site.deductions + site.advance);
    site.gstPurchaseTotal = site.gstPurchase + site.gstPaid;
    site.payableGstDiff = site.gst - site.gstPaid;
    site.totalPurchaseWithGSTDiff = site.gstPurchaseTotal + site.nonGstPurchase + site.payableGstDiff;
    site.finalProfitLoss = site.totalInvoice - site.difference - site.deductions - site.totalPurchaseWithGSTDiff;

    totalAdvance += advancePayment;
    totalPurchaseExpenses += purchaseExpenses;
    totalTaxable += site.taxableValue;
    totalGst += site.gst;
    totalInvoiceValue += site.totalInvoice;
    totalPaymentReceived += site.paymentReceived;
    totalTds += site.tds;
    totalDifference += site.difference;
    totalGstPurchase += site.gstPurchaseTotal;
    totalNonGstPurchase += site.nonGstPurchase;
    totalPayableGstDiff += site.payableGstDiff;
    totalPurchase += site.totalPurchaseWithGSTDiff;
    totalProfit += site.finalProfitLoss;

    return [
      idx + 1, branch, formatMoney(advancePayment), formatMoney(purchaseExpenses), formatMoney(closingBalance),
      idx + 1, formatMoney(site.taxableValue), formatMoney(site.gst), formatMoney(site.totalInvoice),
      formatMoney(site.paymentReceived), formatMoney(site.difference), formatMoney(site.deductions), formatMoney(site.tds),
      formatMoney(site.gstPurchaseTotal), formatMoney(site.nonGstPurchase), formatMoney(site.payableGstDiff), formatMoney(site.totalPurchaseWithGSTDiff), formatMoney(site.finalProfitLoss)
    ];
  });

  XLSX.utils.sheet_add_aoa(sheet, combinedRows, { origin: `B${walletStart + 4}` });

  totalClosing = totalAdvance - totalPurchaseExpenses;
  
  const combinedTotalRowIndex = walletStart + 4 + combinedRows.length;
  XLSX.utils.sheet_add_aoa(sheet, [[
    "Total", "", formatMoney(totalAdvance), formatMoney(totalPurchaseExpenses), formatMoney(totalClosing),
    "Total", formatMoney(totalTaxable), formatMoney(totalGst), formatMoney(totalInvoiceValue),
    formatMoney(totalPaymentReceived), formatMoney(totalDifference), "", formatMoney(totalTds),
    formatMoney(totalGstPurchase), formatMoney(totalNonGstPurchase), formatMoney(totalPayableGstDiff), formatMoney(totalPurchase), formatMoney(totalProfit)
  ]], { origin: `B${combinedTotalRowIndex}` });

  sheet["!merges"].push(
    { s: { r: combinedTotalRowIndex - 1, c: 1 }, e: { r: combinedTotalRowIndex - 1, c: 2 } }
  );

  // ==================== APPLY BORDERS & STYLING ====================
  
  // Styling
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  sheet["!cols"] = Array(range.e.c + 1).fill({ wch: 15 });
  
  // Total Payment Done Section
  const categoryHeaderRow = summaryStart + 1;
  const categoryDataRows = categoryRows.length;

  const applyCellStyle = (cellRef, style) => {
    if (!sheet[cellRef]) sheet[cellRef] = { t: "s", v: "" };
    sheet[cellRef].s = {
      ...(sheet[cellRef].s || {}),
      ...style
    };
  };

  const applyRangeStyle = (startRow, endRow, startCol, endCol, bgColor, bold = false) => {
    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        applyCellStyle(cellRef, {
          fill: { patternType: "solid", fgColor: { rgb: bgColor } },
          font: { bold },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
        });
      }
    }
  };

  const applyBorderedTableStyle = (
    startRow,
    endRow,
    startCol,
    endCol,
    bgColor,
    bold = false,
    leftAlignedCols = [],
  ) => {
    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        const cell = sheet[cellRef];
        // Auto-detect numeric cells to right align
        const isNumeric = cell && cell.t === 'n';

        applyCellStyle(cellRef, {
          fill: { patternType: "solid", fgColor: { rgb: bgColor } },
          font: { bold },
          alignment: {
            horizontal: isNumeric ? "right" : (leftAlignedCols.includes(c) ? "left" : "center"),
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        });
      }
    }
  };

  const collectedTaxLastRow = Math.max(5, incomeTotalRow - 1);
  const paidTaxLastRow = Math.max(5, expenseTotalRow - 1);
  applyBorderedTableStyle(3, collectedTaxLastRow, 1, 9, "D0C8A6", true, [1, 3, 7, 8, 9]);
  applyBorderedTableStyle(3, paidTaxLastRow, 11, 19, "FFD966", true, [11, 13, 17, 18, 19]);
  applyBorderedTableStyle(nonGstStart - 1, nonGstTotalRow - 1, 1, 2, "8EA9DB", true, [1]);
  applyCellStyle(XLSX.utils.encode_cell({r: incomeTotalRow-1, c: 5}), {
    fill: { patternType: "solid", fgColor: { rgb: "92D050" } },
    font: { bold: true },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  });
  applyCellStyle(XLSX.utils.encode_cell({r: expenseTotalRow-1, c: 16}), {
    fill: { patternType: "solid", fgColor: { rgb: "00B0F0" } },
    font: { bold: true },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  });

  [0, 1, 2].forEach((offset) => {
    const labelCell = XLSX.utils.encode_cell({ r: taxSummaryRow - 1 + offset, c: 1 });
    const valueCell = XLSX.utils.encode_cell({ r: taxSummaryRow - 1 + offset, c: 2 });
    const valueColors = ["92D050", "00B0F0", "DA9694"];

    applyCellStyle(labelCell, {
      fill: { patternType: "solid", fgColor: { rgb: "FFFF00" } },
      font: { bold: true },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    });

    applyCellStyle(valueCell, {
      fill: { patternType: "solid", fgColor: { rgb: valueColors[offset] } },
      font: { bold: true },
      alignment: { horizontal: "right", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    });
  });

  applyRangeStyle(1, 1, 1, 19, "FFFF99", false);                         // Title row
  applyRangeStyle(5, 5, 1, 9, "D0C8A6", true);                            // Collected TAX header
  applyRangeStyle(5, 5, 11, 19, "FFD966", true);                           // Paid TAX header
  applyBorderedTableStyle(summaryStart - 1, summaryStart + gstCategoryCount, 6, 7, "FFD966", true, [6]);
  applyBorderedTableStyle(summaryStart + gstCategoryCount + 1, summaryStart + gstCategoryCount + nonGstCategoryCount + 1, 6, 7, "8EA9DB", true, [6]);  
  applyBorderedTableStyle(summaryStart - 1, summaryStart + 4, 11, 12, "E7E6E6", false);
  applyCellStyle(XLSX.utils.encode_cell({r: summaryStart - 1, c: 11}), { font: { bold: true } });
  applyCellStyle(XLSX.utils.encode_cell({r: summaryStart + 4, c: 12}), { fill: { patternType: "solid", fgColor: { rgb: "DA9694" } } });

  applyBorderedTableStyle(walletStart - 1, combinedTotalRowIndex - 1, 1, 18, "FFFFFF", false);
  applyBorderedTableStyle(walletStart - 1, walletStart + 2, 1, 5, "FFFFFF", true);
  applyBorderedTableStyle(walletStart - 1, walletStart + 2, 6, 18, "FFFFFF", true);
  applyBorderedTableStyle(walletStart, walletStart + 2, 7, 13, "D0C8A6", true);
  applyBorderedTableStyle(walletStart, walletStart + 2, 14, 17, "FF0000", true);
  applyBorderedTableStyle(walletStart, walletStart + 2, 18, 18, "92D050", true); // Profit & Loss Green
  XLSX.utils.book_append_sheet(workbook, sheet, "IncomeVsExpense");

  XLSX.writeFile(workbook, `Income_vs_Expense_${month}_${year}.xlsx`);
};

// Helper function
const sum = (arr, key) => arr.reduce((a, b) => a + Number(b[key] || 0), 0);

const handleExportPDF = () => {

const doc = new jsPDF("landscape");

const formatMoney = (num) => {
  if (num === null || num === undefined || num === "") return "";
  return Number(num).toLocaleString("en-IN");
};

const { gstExpenses = [], nonGstExpenses = [] } = expenseData || {};
const groupedNonGstExpenses = groupExpensesByHead(nonGstExpenses, "value");

const sum = (arr, key) =>
  arr.reduce((s, r) => s + Number(r[key] || 0), 0);

const incomeValueTotal = sum(incomeData, "value");
const incomeGstTotal = sum(incomeData, "gst");
const incomeGrandTotal = sum(incomeData, "total");

const expenseValueTotal = sum(gstExpenses, "value");
const expenseGstTotal = sum(gstExpenses, "gst");
const expenseGrandTotal = sum(gstExpenses, "total");

const nonGstTotal = sum(nonGstExpenses, "value");

const totalExpenseRows = [...gstExpenses, ...nonGstExpenses];

const totalGrandAll = totalExpenseRows.reduce(
  (s, r) => s + Number(r.total || r.value || 0),
  0
);

const totalInvoiceRaised = incomeValueTotal;
const totalPurchased = expenseValueTotal;
const profitOrLoss = totalInvoiceRaised - totalPurchased - nonGstTotal;
const gstPayable = incomeGstTotal - expenseGstTotal;

doc.setFontSize(14);
doc.text(`Income vs Expense Report - ${getDurationText()}`, 14, 15);

const incomeLeft = 14;
const expenseLeft = 115;
const summaryLeft = 215;

autoTable(doc,{
startY:25,
margin:{left:incomeLeft},
tableWidth:95,
styles:{fontSize:7},
headStyles:{fillColor:[198,224,180]},
head:[["Sl","Date","Description","Value","TAX","Total","Job","Month"]],
body:[
...incomeData.map(r=>[
r.sl,
r.date,
r.description,
formatMoney(r.value),
formatMoney(r.gst),
formatMoney(r.total),
r.job,
r.month
]),
["","","TOTAL",
formatMoney(incomeValueTotal),
formatMoney(incomeGstTotal),
formatMoney(incomeGrandTotal),
"",""]
],
theme:"grid"
});

const incomeEndY = doc.lastAutoTable.finalY;

autoTable(doc,{
startY:25,
margin:{left:expenseLeft},
tableWidth:90,
styles:{fontSize:7},
headStyles:{fillColor:[255,217,102]},
head:[["Sl","Date","Name","Value","TAX","Total","Month"]],
body:[
...gstExpenses.map(r=>[
r.sl,
r.date,
r.name,
formatMoney(r.value),
formatMoney(r.gst),
formatMoney(r.total),
r.month
]),
["","TOTAL","",
formatMoney(expenseValueTotal),
formatMoney(expenseGstTotal),
formatMoney(expenseGrandTotal),
""]
],
theme:"grid"
});

const expenseEndY = doc.lastAutoTable.finalY;


/* ---------- SUMMARY ---------- */

autoTable(doc,{
startY:25,
margin:{left:summaryLeft},
tableWidth:70,
styles:{fontSize:8},
headStyles:{fillColor:[231,230,230]},
head:[[`Details for ${getDurationText()}`,""]],
body:[
["Invoice Raised",formatMoney(totalInvoiceRaised)],
["Less Purchased",formatMoney(totalPurchased)],
["Less Non-GST Expenses",formatMoney(nonGstTotal)],
["Profit / Loss",formatMoney(profitOrLoss)],
["Non GST Amount",formatMoney(gstPayable)]
],
theme:"grid"
});

const summaryEndY = doc.lastAutoTable.finalY;

const nextY = Math.max(incomeEndY, expenseEndY, summaryEndY) + 10;

autoTable(doc,{
startY:nextY,
margin:{left:incomeLeft},
tableWidth:80,
head:[["Type","Amount"]],
body:[
["Collected TAX",formatMoney(incomeGstTotal)],
["Paid TAX",formatMoney(expenseGstTotal)],
["Difference",formatMoney(gstPayable)]
],
theme:"grid"
});

autoTable(doc,{
startY:nextY+35,
margin:{left:incomeLeft},
tableWidth:80,
head:[["Non-GST payments done","Amount"]],
body:[
...groupedNonGstExpenses.map(r=>[
r.head,
formatMoney(r.amount)
]),
["Total",formatMoney(nonGstTotal)]
],
theme:"grid",
headStyles:{fillColor:[189,215,238]}
});

autoTable(doc,{
startY:nextY,
margin:{left:expenseLeft},
tableWidth:90,
head:[["Description","Amount"]],
body:[
...totalExpenseRows.map(r=>[
r.name,
formatMoney(r.total || r.value)
]),
["Total",formatMoney(totalGrandAll)]
],
theme:"grid",
headStyles:{fillColor:[255,217,102]}
});

doc.save(`Income_vs_Expense_${getDurationText().replace(/\s/g,"_")}.pdf`);

};

  if (error) {
    return (
      <div className="income-page">
        <div className="income-header">
          <h2>Income vs Expense</h2>
          <p className="breadcrumb">Dashboard &gt; Income vs Expense</p>
        </div>
        <div className="error-message">{error}</div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={fetchAllData} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  const getYAxisDomain = () => {
    if (!chartData || chartData.length === 0) return [0, 100];

    const values = chartData.map((d) => d.profit || 0);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);

    if (maxValue === 0 && minValue === 0) return [0, 100];

    const padding = 0.2;
    const range = maxValue - minValue;
    let yMin = minValue;
    let yMax = maxValue;

    if (minValue < 0) {yMin = minValue - Math.abs(range * padding);
    } else {yMin = 0;}

    if (maxValue > 0) {yMax = maxValue + range * padding;}
    return [Math.floor(yMin), Math.ceil(yMax)];
  };
  return (
    <Card className="p-3 shadow-sm border-0 overflow-x-hidden">
      <Row className="mb-3">
        <Col>
          <h4 className="mb-1">Income VS Expense</h4>
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>IncomeVSExpense Summary</Breadcrumb.Item>
          </Breadcrumb>
        </Col>

        <Col md={6} className="text-end">
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="info" onClick={() => setShowPreview(true)}>Preview</Button>
            <Button variant="success" onClick={handleExportExcel} disabled={loading || !incomeData || incomeData.length === 0}>Export Excel</Button>
            <Button variant="danger" onClick={handleExportPDF}>Export PDF</Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-4 g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
        <Col>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between mb-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3"><CashStack className="text-success" size={20} /></div>
                <Badge bg="success">Income</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Total Income</h6>
              <h3 className="fw-bold text-success">{formatINR(totalIncome)}</h3>
              <div className="small text-muted">All Sale Invoices</div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between mb-3">
                <div className="bg-info bg-opacity-10 p-2 rounded-3"><Wallet className="text-info" size={20} /></div>
                <Badge bg="info">Received</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Total Received</h6>
              <h3 className="fw-bold text-info">{formatINR(incomeTotals.receivedTotal)}</h3>
              <div className="small text-muted">Actual Payments</div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between mb-3">
                <div className="bg-danger bg-opacity-10 p-2 rounded-3"><CreditCard className="text-danger" size={20} /></div>
                <Badge bg="danger">Expense</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Total Expense</h6>
              <h3 className="fw-bold text-danger">{formatINR(totalExpense)}</h3>
              <div className="small text-muted">Wallet + Purchases</div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className={`border-0 shadow-sm h-100 ${isProfit ? "border-top border-success" : "border-top border-danger"}`}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between mb-3">
                <div className={`${isProfit ? "bg-success" : "bg-danger"} bg-opacity-10 p-2 rounded-3`}>
                  {isProfit ? ( <ArrowUpRightCircle className="text-success" size={20} />
                  ) : ( <ArrowDownRightCircle className="text-danger" size={20} />)}
                </div>
                <Badge bg={isProfit ? "success" : "danger"}>{isProfit ? "Profit" : "Loss"}</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1">Net {isProfit ? "Profit" : "Loss"}</h6>
              <h3 className={`fw-bold ${isProfit ? "text-success" : "text-danger"}`}>
                {isProfit ? "+" : "-"}
                {formatINR(Math.abs(profit))}
              </h3>
              <div className="small text-muted mt-1">
                <span className={isProfit ? "text-success" : "text-danger"}>
                   {isProfit ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {profitPercent}% margin
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between mb-3">
                <div className={`${isProfit ? "bg-info" : "bg-warning"} bg-opacity-10 p-2 rounded-3`}>
                  <Calculator className={isProfit ? "text-info" : "text-warning"} size={20}/>
                </div>
                <Badge bg={isProfit ? "info" : "warning"}>{isProfit ? "Margin" : "Deficit"}</Badge>
              </div>
              <h6 className="text-muted text-uppercase small mb-1"> {isProfit ? "Profit %" : "Loss %"}</h6>
              <h3 className={`fw-bold ${isProfit ? "text-info" : "text-warning"}`}> {isProfit ? "+" : "-"} {Math.abs(profitPercent)}%</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 border shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <Filter className="me-2 text-primary" />
            <h5 className="mb-0">Filter Options</h5>
          </div>

          <Row className="g-3 align-items-end">
            <Col xs="auto" style={{ minWidth: "150px" }}>
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
                  <option value={FILTER_TYPES.MONTHLY}>Monthly</option>
                  <option value={FILTER_TYPES.QUARTERLY}>Quarterly</option>
                  <option value={FILTER_TYPES.FINANCIAL_YEAR}> Financial Year</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {filterType === FILTER_TYPES.DAILY && (
              <Col xs="auto" style={{ minWidth: "150px" }}>
                <Form.Group>
                  <Form.Label className="fw-medium">Date</Form.Label>
                  <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-secondary"/>
                </Form.Group>
              </Col>
            )}

            {filterType === FILTER_TYPES.WEEKLY && (
              <>
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Week</Form.Label>
                    <Form.Control type="number" min="1" max="53" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} className="border-secondary" placeholder="Week #"/>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select value={weekYear} onChange={(e) => setWeekYear(e.target.value)} className="border-secondary">
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
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Month</Form.Label>
                    <Form.Select value={month} onChange={(e) => setMonth(e.target.value)} className="border-secondary">
                      <option value="">Select Month</option> {months.map((m) => (<option key={m} value={m}>{m}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select value={year} onChange={(e) => setYear(e.target.value)} className="border-secondary">
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
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Quarter</Form.Label>
                    <Form.Select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="border-secondary">
                      <option value="">Select Quarter</option>
                      <option value="Q1">Q1 (Jan - Apr)</option>
                      <option value="Q2">Q2 (May - Aug)</option>
                      <option value="Q3">Q3 (Sep - Dec)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs="auto" style={{ minWidth: "150px" }}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Year</Form.Label>
                    <Form.Select value={year} onChange={(e) => setYear(e.target.value)} className="border-secondary">
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
              <Col xs="auto" style={{ minWidth: "180px" }}>
                <Form.Group>
                  <Form.Label className="fw-medium">Financial Year</Form.Label>
                  <Form.Select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} className="border-secondary">
                    <option value="">Select Financial Year</option>{getFinancialYearOptions().map((fy) => (<option key={fy} value={fy}>{fy}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col xs="auto" style={{ minWidth: "180px" }}>
              <Form.Group>
                <Form.Label className="fw-medium">Sites</Form.Label>
                <Form.Select value={selectedBranch} onChange={handleBranchChange} className="border-secondary">
                  <option value="">All Sites</option>{branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs="auto" className="ms-auto">
              <div className="d-flex gap-2">
                <Button variant="danger" onClick={handleReset} title="Reset Filters"><ArrowClockwise /> Reset</Button>
              </div>
            </Col>
          </Row>
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center">
              <Badge bg="light" text="dark" className="me-2">Active Filter:</Badge>
              <span className="fw-semibold">{getDurationText()}</span>
            </div>
          </div>
        </Card.Body>
      </Card>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="profitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5a623" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f5a623" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" interval={0} 
              angle={chartData.length === 1 ? 0: filterType === FILTER_TYPES.FINANCIAL_YEAR  ? -45: chartData.length > 6    ? -45: 0}
              textAnchor={chartData.length === 1? "middle": filterType === FILTER_TYPES.FINANCIAL_YEAR    ? "end": chartData.length > 6 ? "end": "middle"}
              height={chartData.length === 1  ? 30: filterType === FILTER_TYPES.FINANCIAL_YEAR    ? 60: chartData.length > 6      ? 60: 30}
              tick={{fontSize:  chartData.length === 1    ? 14: filterType === FILTER_TYPES.FINANCIAL_YEAR ? 11: chartData.length > 10 ? 10: 12,}}
              tickLine={chartData.length > 1}
              axisLine={chartData.length > 1}
            />
            <YAxis tickFormatter={(value) => formatINR(value)} domain={getYAxisDomain()} width={80} tick={{ fontSize: 12 }}/>
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="profit" stroke="#f5a623" fill="url(#profitColor)" strokeWidth={2}/>          </AreaChart>
        </ResponsiveContainer>
      </div>
      {(filterType === FILTER_TYPES.MONTHLY ||
        filterType === FILTER_TYPES.QUARTERLY ||
        filterType === FILTER_TYPES.FINANCIAL_YEAR) && (
        <div className="table-responsive mt-4">
          <table className="table table-borderless align-middle">
            <thead className="border-bottom"><tr><th>TYPE</th>{months.map((m, i) => (<th key={m}>{shortMonth(m)}</th>))}</tr></thead>
            <tbody>
              <tr className="fw-semibold"><td>Income :</td>{months.map((_, i) => (<td key={i}></td>))}</tr>
              <tr><td>Revenue (Sale invoice)</td>{monthlyRevenue.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr><td>Paid Invoice</td>{monthlyPaidInvoice.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr><td>GST</td>{monthlyGST.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr><td>Income</td>{monthlyIncome.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr className="fw-semibold"><td>Expense :</td>{months.map((_, i) => (<td key={i}></td>))}</tr>
              <tr><td>Wallet Credits</td>{walletCredits.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr><td>Credit Purchases</td>{creditPurchases.map((v, i) => (<td key={i}>{formatINR(v)}</td>))}</tr>
              <tr className="fw-semibold"><td>Profit = Income − Expense</td>{months.map((_, i) => (<td key={i}></td>))}</tr>
              <tr className="fw-bold"><td>Profit</td>{months.map((_, i) => (<td key={i}>{formatINR(getProfitForMonth(i))}</td>))}</tr>
            </tbody>
          </table>
        </div>
      )}

      {filterType === FILTER_TYPES.DAILY && (
        <div className="alert alert-info mt-4">
          <CalendarDay size={16} className="me-2" />
          <strong>Daily View:</strong> Showing data for{" "}
          {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric",})}
        </div>
      )}

      {filterType === FILTER_TYPES.WEEKLY && (
        <div className="alert alert-info mt-4">
          <CalendarWeek size={16} className="me-2" />
          <strong>Weekly View:</strong> Showing data for Week {weekNumber} of{" "}{weekYear}
        </div>
      )}

      <IncomeVsExpensePreviewModal show={showPreview} onHide={() => setShowPreview(false)} durationText={getDurationText()} exportData={getTableExportData()}
                                   expenseTables={expenseData} incomeRows={incomeData} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF}
      />
    </Card>
  );
};

export default IncomeVsExpense;
