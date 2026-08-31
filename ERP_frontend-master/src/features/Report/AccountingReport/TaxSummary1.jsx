import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Dropdown } from "react-bootstrap";
import {
  FileEarmarkTextFill,
  HourglassSplit,
  CalendarMonth,
  CalendarWeek,
  Calendar2Check,
} from "react-bootstrap-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import reportService from "../../../services/reportService";
import PurchaseReport from "./PurchaseReport";
import WorkOrderReport from "./WorkOrderReport";
import * as XLSX from "xlsx";
import purchaseService from "../../../services/purchaseService";
import workOrderService from "../../../services/workOrderService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import expenseService from "../../../services/expensessService";

const TaxSummary1 = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [totalExpenseTax, setTotalExpenseTax] = useState(0);
  const [totalIncomeTax, setTotalIncomeTax] = useState(0);
  const [totalTaxToPay, setTotalTaxToPay] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [periodType, setPeriodType] = useState("Monthly"); // Monthly, Quarterly, Financial Year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState("Q4");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [purchaseOrders, setPurchaseOrders] = useState([]);
const [workOrders, setWorkOrders] = useState([]);

  const [allRows, setAllRows] = useState([]);
  const [expenses, setExpenses] = useState([]);
const [expenseLoading, setExpenseLoading] = useState(true);
const [woInvoices, setWoInvoices] = useState([]);
const [poInvoices, setPoInvoices] = useState([]);
const [creditPurchases, setCreditPurchases] = useState([]);
const [creditLoading, setCreditLoading] = useState(true);
useEffect(() => {
  const fetchCreditPurchases = async () => {
    try {
      const res = await expenseService.getAllCreditPurchases();
      setCreditPurchases(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch credit purchases", err);
    } finally {
      setCreditLoading(false);
    }
  };

  fetchCreditPurchases();
}, []);
useEffect(() => {
  const fetchPOInvoices = async () => {
    try {
      // if you have a getAll endpoint use that
      const res = await purchaseService.getAllPurchaseOrderInvoices();
      setPoInvoices(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch PO invoices", err);
    }
  };

  fetchPOInvoices();
}, []);


  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseSummary = await reportService.getExpenseSummary();
        const incomeSummary = await reportService.getIncomeSummary();

        if (expenseSummary && incomeSummary) {
          // Calculate total expense tax & income tax
          const expenseTax = calculateExpenseData(expenseSummary);
          const incomeTax = calculateIncomeData(incomeSummary);

          setMonthlyData(expenseTax.monthly);
          setIncomeData(incomeTax.monthly);
          setTotalExpenseTax(expenseTax.totalTaxSum);
          setTotalIncomeTax(incomeTax.totalGSTSum);
          setTotalExpense(expenseTax.totalExpenseSum);
          setTotalIncome(incomeTax.totalIncomeSum);

          // final tax = income GST - expense GST
          setTotalTaxToPay(incomeTax.totalGSTSum - expenseTax.totalTaxSum);
        }
      } catch (err) {
        console.error("Error fetching tax summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
  const fetchAllExpenses = async () => {
    try {
      const res = await expenseService.getAllExpenses();
      setExpenses(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setExpenseLoading(false);
    }
  };

  fetchAllExpenses();
}, []);
useEffect(() => {
  const fetchPOWO = async () => {
    try {
      const poRes = await purchaseService.getAllPurchases();
      const woRes = await workOrderService.getAllWorkOrders();

      console.log("PO array:", poRes?.data);
      console.log("WO array:", woRes?.data);

      setPurchaseOrders(Array.isArray(poRes?.data) ? poRes.data : []);
      setWorkOrders(Array.isArray(woRes?.data) ? woRes.data : []);
    } catch (err) {
      console.error("Failed to fetch PO / WO", err);
    }
  };

  fetchPOWO();
}, []);


useEffect(() => {
  console.log("PO:", purchaseOrders);
  console.log("WO:", workOrders);
}, [purchaseOrders, workOrders]);

useEffect(() => {
  const fetchWOInvoices = async () => {
    try {
      const res = await workOrderService.getAllInvoices();
      setWoInvoices(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch WO invoices", err);
    }
  };

  fetchWOInvoices();
}, []);

const buildExpenseRows = (expenseApiData) => {
  if (!expenseApiData?.data) return [];

  return expenseApiData.data.map((exp) => ({
    type: "Expense",
    ref: `EXP-${exp.id}`,
    date: exp.payment_date,
    branch: exp.branch?.name || "-",
    amount: Number(exp.total_amount || 0),
  }));
};
  const calculateExpenseData = (data) => {
    const monthExpenseTotals = Array(12).fill(0);
    const monthTaxTotals = Array(12).fill(0);
    let totalExpenseSum = 0;
    let totalTaxSum = 0;

    if (data?.branch_details) {
      data.branch_details.forEach((branch) => {
        branch.months.forEach((monthData) => {
          const monthIndex = new Date(`${monthData.month} 1, ${data.year}`).getMonth();
          let total_amount = 0;
          let tax = 0;
          monthData.records?.forEach((rec) => {
            total_amount += parseFloat(rec.total_amount || 0);
            tax += parseFloat(rec.tax_total || 0);
          });
          monthExpenseTotals[monthIndex] += total_amount;
          monthTaxTotals[monthIndex] += tax;
          totalExpenseSum += total_amount;
          totalTaxSum += tax;
        });
      });
    }

    const monthly = months.map((m, i) => ({
      month: m.substring(0, 3),
      expense: monthExpenseTotals[i],
      tax: monthTaxTotals[i],
    }));

    return { monthly, totalExpenseSum, totalTaxSum };
  };

  const calculateIncomeData = (data) => {
    const monthIncomeTotals = Array(12).fill(0);
    const monthGSTTotals = Array(12).fill(0);
    let totalIncomeSum = 0;
    let totalGSTSum = 0;

    const processInvoices = (invoices = []) => {
      invoices.forEach((inv) => {
        const month = new Date().getMonth(); 
        const amount = parseFloat(inv.total_amount || 0);
        const gstAmount =
          parseFloat(inv.gst_amount) ||
          parseFloat(inv.cgst || 0) +
            parseFloat(inv.sgst || 0) +
            parseFloat(inv.igst || 0) ||
          0;

        monthIncomeTotals[month] += amount;
        monthGSTTotals[month] += gstAmount;
        totalIncomeSum += amount;
        totalGSTSum += gstAmount;
      });
    };

    processInvoices(data.work_order_invoices);
    processInvoices(data.purchase_order_invoices);

    const monthly = months.map((m, i) => ({
      month: m.substring(0, 3),
      income: monthIncomeTotals[i],
      gst: monthGSTTotals[i],
    }));

    return { monthly, totalIncomeSum, totalGSTSum };
  };

  // ALWAYS show current month data for these three cards
  const currentMonthIndex = new Date().getMonth();
  const currentMonthExpense = monthlyData[currentMonthIndex]?.expense || 0;
  const currentMonthExpenseTax = monthlyData[currentMonthIndex]?.tax || 0;
  const currentMonthIncomeGST = incomeData[currentMonthIndex]?.gst || 0;
  const currentMonthNetTax = currentMonthIncomeGST - currentMonthExpenseTax;
  const currentMonthIncome = incomeData[currentMonthIndex]?.income || 0;

  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  const getFilteredData = () => {
    if (periodType === "Monthly") {
      return {
        expenseData: monthlyData[selectedMonth],
        incomeData: incomeData[selectedMonth],
      };
    } else if (periodType === "Quarterly") {
      const quarterMonths = {
        Q1: [0, 1, 2],
        Q2: [3, 4, 5],
        Q3: [6, 7, 8],
        Q4: [9, 10, 11],
      }[selectedQuarter];

      const expense = quarterMonths.reduce((sum, m) => sum + (monthlyData[m]?.expense || 0), 0);
      const tax = quarterMonths.reduce((sum, m) => sum + (monthlyData[m]?.tax || 0), 0);
      const income = quarterMonths.reduce((sum, m) => sum + (incomeData[m]?.income || 0), 0);
      const gst = quarterMonths.reduce((sum, m) => sum + (incomeData[m]?.gst || 0), 0);

      return { expenseData: { expense, tax }, incomeData: { income, gst } };
    } else {
      // Financial year
      const expense = monthlyData.reduce((sum, m) => sum + (m.expense || 0), 0);
      const tax = monthlyData.reduce((sum, m) => sum + (m.tax || 0), 0);
      const income = incomeData.reduce((sum, m) => sum + (m.income || 0), 0);
      const gst = incomeData.reduce((sum, m) => sum + (m.gst || 0), 0);

      return { expenseData: { expense, tax }, incomeData: { income, gst } };
    }
  };

  const filterByPeriod = (date) => {
    const d = new Date(date);

    if (periodType === "Monthly") {
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }

    if (periodType === "Quarterly") {
      const quarters = {
        Q1: [0, 1, 2],
        Q2: [3, 4, 5],
        Q3: [6, 7, 8],
        Q4: [9, 10, 11],
      };
      return (
        quarters[selectedQuarter].includes(d.getMonth()) && d.getFullYear() === selectedYear
      );
    }
    const fyStart = new Date(selectedYear, 3, 1);
    const fyEnd = new Date(selectedYear + 1, 2, 31);
    return d >= fyStart && d <= fyEnd;
  };
const handleDownload = (format) => {
  const hasIncome =
    woInvoiceSummary.length > 0 || poInvoiceSummary.length > 0;
  const hasExpense = filteredExpenseCreditRows.length > 0;

  if (!hasIncome && !hasExpense) {
    ConfirmDeleteModal({
      title: "No Data Available",
      message: "No Income or Expense data found for selected period.",
      singleButton: true,
    });
    return;
  }

  const periodLabel =
    periodType === "Monthly"
      ? `${months[selectedMonth]} ${selectedYear}`
      : periodType === "Quarterly"
      ? `${selectedQuarter} ${selectedYear}`
      : `FY ${selectedYear}-${selectedYear + 1}`;

  /* =========================
     📗 EXCEL
  ==========================*/
  if (format === "excel") {
    const sheetData = [];

    /* ---------- INCOME ---------- */
    sheetData.push(["INCOME DATA"]);
    sheetData.push([
      "#",
      "Type",
      "Reference",
      "Branch",
      "Date",
      "Amount",
      "GST",
      "Total Amount",
      "Remaining",
    ]);

    sheetData.push(["WORK ORDER"]);
    woInvoiceSummary.forEach((r, i) => {
      sheetData.push([
        i + 1,
        "Work Order",
        r.woNumber,
        r.assignedTo,
        new Date(r.issueDate).toLocaleDateString(),
        r.amount.toFixed(2),
        r.gst.toFixed(2),
        r.total.toFixed(2),
        r.remaining.toFixed(2),
      ]);
    });

    sheetData.push(["PURCHASE ORDER"]);
    poInvoiceSummary.forEach((r, i) => {
      sheetData.push([
        woInvoiceSummary.length + i + 1,
        "Purchase Order",
        r.poNumber,
        r.assignTo,
        new Date(r.poDate).toLocaleDateString(),
        r.amount.toFixed(2),
        r.tax.toFixed(2),
        r.total.toFixed(2),
        r.remaining.toFixed(2),
      ]);
    });

    sheetData.push([]);

    /* ---------- EXPENSE ---------- */
    sheetData.push(["EXPENSE DATA"]);
    sheetData.push([
      "#",
      "Type",
      "Reference",
      "Branch",
      "Date",
      "Amount",
    ]);

    sheetData.push(["CASH PURCHASE"]);
    filteredExpenseCreditRows
      .filter((r) => r.type === "Cash Purchase")
      .forEach((r, i) => {
        sheetData.push([
          i + 1,
          r.type,
          r.ref,
          r.branch,
          new Date(r.date).toLocaleDateString(),
          r.amount.toFixed(2),
        ]);
      });

    sheetData.push(["CREDIT PURCHASE"]);
    filteredExpenseCreditRows
      .filter((r) => r.type === "Credit Purchase")
      .forEach((r, i) => {
        sheetData.push([
          i + 1,
          r.type,
          r.ref,
          r.branch,
          new Date(r.date).toLocaleDateString(),
          r.amount.toFixed(2),
        ]);
      });

    sheetData.push([]);

    /* ---------- FINAL SUMMARY ---------- */
    sheetData.push(["FINAL FINANCIAL SUMMARY"]);
    sheetData.push(["Total Income", totalIncomeAmount.toFixed(2)]);
    sheetData.push(["Total Expense", totalExpenseAmount.toFixed(2)]);
    sheetData.push([
      "Profit / Loss",
      `${profitOrLossLabel} ${Math.abs(profitOrLossAmount).toFixed(2)}`,
    ]);
    sheetData.push([
      "Total Income Tax (GST)",
      totalIncomeTaxCalculated.toFixed(2),
    ]);
    sheetData.push([
      "Total Expense Tax",
      totalExpenseTaxCalculated.toFixed(2),
    ]);
    sheetData.push(["Tax Difference", taxDifference.toFixed(2)]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tax Summary");

    XLSX.writeFile(wb, `Tax_Summary_${periodLabel}.xlsx`);
  }

  /* =========================
     📄 PDF
  ==========================*/
  if (format === "pdf") {
    const doc = new jsPDF();
    let y = 14;

    doc.setFontSize(14);
    doc.text(`Tax Summary Report (${periodLabel})`, 14, y);
    y += 8;

    /* ---------- INCOME ---------- */
    doc.setFontSize(12);
    doc.text("Income Data", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [[
        "#",
        "Type",
        "Reference",
        "Branch",
        "Date",
        "Amount",
        "GST",
        "Total",
        "Remaining",
      ]],
      body: [
        ...woInvoiceSummary.map((r, i) => [
          i + 1,
          "Work Order",
          r.woNumber,
          r.assignedTo,
          new Date(r.issueDate).toLocaleDateString(),
          r.amount.toFixed(2),
          r.gst.toFixed(2),
          r.total.toFixed(2),
          r.remaining.toFixed(2),
        ]),
        ...poInvoiceSummary.map((r, i) => [
          woInvoiceSummary.length + i + 1,
          "Purchase Order",
          r.poNumber,
          r.assignTo,
          new Date(r.poDate).toLocaleDateString(),
          r.amount.toFixed(2),
          r.tax.toFixed(2),
          r.total.toFixed(2),
          r.remaining.toFixed(2),
        ]),
      ],
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 8;

    /* ---------- EXPENSE ---------- */
    doc.text("Expense Data", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["#", "Type", "Reference", "Branch", "Date", "Amount"]],
      body: filteredExpenseCreditRows.map((r, i) => [
        i + 1,
        r.type,
        r.ref,
        r.branch,
        new Date(r.date).toLocaleDateString(),
        r.amount.toFixed(2),
      ]),
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 8;

    /* ---------- FINAL SUMMARY ---------- */
    autoTable(doc, {
      startY: y,
      head: [["Final Financial Summary", ""]],
      body: [
        ["Total Income", totalIncomeAmount.toFixed(2)],
        ["Total Expense", totalExpenseAmount.toFixed(2)],
        [
          "Profit / Loss",
          `${profitOrLossLabel} ${Math.abs(profitOrLossAmount).toFixed(2)}`,
        ],
        ["Total Income Tax (GST)", totalIncomeTaxCalculated.toFixed(2)],
        ["Total Expense Tax", totalExpenseTaxCalculated.toFixed(2)],
        ["Tax Difference", taxDifference.toFixed(2)],
      ],
    });

    doc.save(`Tax_Summary_${periodLabel}.pdf`);
  }
};

const combinedRows = [
  // 🧾 CASH PURCHASE (EXPENSE)
  ...expenses.map((exp) => ({
    type: "Cash Purchase",
    ref: `EXP-${exp.id}`,
    date: exp.payment_date,
    branch: exp.branch?.name || "-",
    amount: exp.total_amount,
  })),

  // 📦 PURCHASE ORDER
  ...purchaseOrders
    .filter((po) => po.status === "Received")
    .map((po) => ({
      type: "Purchase Order",
      ref: po.po_number,
      date: po.delivery_date || po.po_date,
      branch: po.branch?.name || "-",
      amount: po.total_amount,
    })),

  // 🏗️ WORK ORDER
  ...workOrders
    .filter((wo) => wo.status === "Paid")
    .map((wo) => ({
      type: "Work Order",
      ref: wo.wo_number,
      date: wo.issue_date,
      branch: wo.assignedBranch?.name || "-",
      amount: wo.amount,
    })),
];
const expenseCreditRows = [
  // 💸 CASH PURCHASE
  ...expenses.map((exp) => ({
    type: "Cash Purchase",
    ref: `EXP-${exp.id}`,
    date: exp.payment_date,
    branch: exp.branch?.name || "-",
    amount: Number(exp.total_amount || 0),
    status: exp.payments_status || "paid",
  })),

  // 🧾 CREDIT PURCHASE
  ...creditPurchases.map((cp) => ({
    type: "Credit Purchase",
    ref: cp.purchase_number || `CP-${cp.id}`,
    date: cp.createdAt,
    branch: cp.branch?.name || "-",
    amount: Number(cp.total_amount || 0),
    status: cp.payment_status || "unpaid",
  })),
];

const filteredExpenseCreditRows = expenseCreditRows.filter(
  (row) => row.date && filterByPeriod(row.date)
);
const filteredTableRows = combinedRows.filter((row) =>
  row.date ? filterByPeriod(row.date) : false
);
const woInvoiceSummary = React.useMemo(() => {
  if (!workOrders.length || !woInvoices.length) return [];

  // 1️⃣ Group invoices by WO number
  const invoiceMap = {};

  woInvoices.forEach((inv) => {
    const woNo = inv.wo_number;
    if (!invoiceMap[woNo]) {
      invoiceMap[woNo] = {
        baseAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
        remaining: 0,
      };
    }

    invoiceMap[woNo].baseAmount += Number(inv.base_amount || 0);
    invoiceMap[woNo].gstAmount += Number(inv.gst_amount || 0);
    invoiceMap[woNo].totalAmount += Number(inv.total_amount || 0);
    invoiceMap[woNo].remaining = Number(inv.remaining_amount || 0); // latest value
  });

  // 2️⃣ Map with Work Orders
  return workOrders
    .filter((wo) => invoiceMap[wo.wo_number]) // ONLY invoiced WOs
    .map((wo) => ({
      woNumber: wo.wo_number,
      issueDate: wo.issue_date,
      amount: invoiceMap[wo.wo_number].baseAmount,
      assignedTo: wo.assignedBranch?.name || "-",
      gst: invoiceMap[wo.wo_number].gstAmount,
      total: invoiceMap[wo.wo_number].totalAmount,
      remaining: invoiceMap[wo.wo_number].remaining,
    }))
    .filter((row) => filterByPeriod(row.issueDate)); // period filter
}, [workOrders, woInvoices, periodType, selectedMonth, selectedQuarter, selectedYear]);
const poInvoiceSummary = React.useMemo(() => {
  if (!purchaseOrders.length || !poInvoices.length) return [];

  // 1️⃣ Group invoices by PO number
  const invoiceMap = {};

  poInvoices.forEach((inv) => {
    const poNo = inv.po_number;

    if (!invoiceMap[poNo]) {
      invoiceMap[poNo] = {
        baseAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
        remaining: 0,
      };
    }

    invoiceMap[poNo].baseAmount += Number(inv.base_amount || 0);
    invoiceMap[poNo].gstAmount += Number(inv.gst_amount || 0);
    invoiceMap[poNo].totalAmount += Number(inv.total_amount || 0);

    // keep latest remaining
    invoiceMap[poNo].remaining = Number(inv.remaining_amount || 0);
  });

  // 2️⃣ Map with Purchase Orders
  return purchaseOrders
    .filter((po) => invoiceMap[po.po_number]) // ONLY invoiced POs
    .map((po) => ({
      poNumber: po.po_number,
      vendorName: po.vendor_name,
      assignTo: po.branch?.name || "-",
      poDate: po.po_date,
      deliveryDate: po.delivery_date,
      amount: invoiceMap[po.po_number].baseAmount,
      tax: invoiceMap[po.po_number].gstAmount,
      total: invoiceMap[po.po_number].totalAmount,
      remaining: invoiceMap[po.po_number].remaining,
    }))
    .filter((row) => filterByPeriod(row.poDate));
}, [
  purchaseOrders,
  poInvoices,
  periodType,
  selectedMonth,
  selectedQuarter,
  selectedYear,
]);
const totalIncomeAmount =
  woInvoiceSummary.reduce((sum, r) => sum + Number(r.total || 0), 0) +
  poInvoiceSummary.reduce((sum, r) => sum + Number(r.total || 0), 0);

const totalIncomeTaxCalculated =
  woInvoiceSummary.reduce((sum, r) => sum + Number(r.gst || 0), 0) +
  poInvoiceSummary.reduce((sum, r) => sum + Number(r.tax || 0), 0);

const totalExpenseAmount =
  filteredExpenseCreditRows.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

const totalExpenseTaxCalculated =
  expenses.reduce((sum, e) => sum + Number(e.tax_total || 0), 0) +
  creditPurchases.reduce((sum, c) => sum + Number(c.tax_total || 0), 0);
const profitOrLossAmount = totalIncomeAmount - totalExpenseAmount;
const profitOrLossLabel = profitOrLossAmount >= 0 ? "PROFIT" : "LOSS";
const taxDifference =
  totalIncomeTaxCalculated - totalExpenseTaxCalculated;
  
  return (
    <div className="container-fluid mt-4 mb-5">
      {/* Header Section */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <FileEarmarkTextFill size={28} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-0">Report :</h6>
                <h5 className="fw-bold mb-0">Monthly Expense & Tax Summary</h5>
              </div>
            </div>

            <Dropdown>
              <Dropdown.Toggle variant="success">
                <i className="bi bi-download me-1"></i> Download
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDownload("excel")}>Excel</Dropdown.Item>
                <Dropdown.Item onClick={() => handleDownload("pdf")}>PDF</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow-sm d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <HourglassSplit size={28} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-0">Selected Period :</h6>
                <h5 className="fw-bold mb-0">
                  {periodType === "Monthly" && `${months[selectedMonth]} ${selectedYear}`}
                  {periodType === "Quarterly" && `${selectedQuarter} ${selectedYear}`}
                  {periodType === "Financial Year" && `FY ${selectedYear}-${selectedYear + 1}`}
                </h5>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-success"
                  className="d-flex align-items-center gap-2"
                >
                  <CalendarMonth className="me-1" />
                  {periodType}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {["Monthly", "Quarterly", "Financial Year"].map((pt) => (
                    <Dropdown.Item
                      key={pt}
                      onClick={() => setPeriodType(pt)}
                      className="d-flex align-items-center gap-2"
                    >
                      {pt === "Monthly" && <CalendarMonth />}
                      {pt === "Quarterly" && <CalendarWeek />}
                      {pt === "Financial Year" && <Calendar2Check />}
                      {pt}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card>
        </Col>
      </Row>

      {/* New Period Selection Card */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center">
          <h6 className="text-primary mb-3 fw-bold">
            <i className="bi bi-calendar-range me-2"></i>
            Select Report Period
          </h6>
          
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setPeriodType("Monthly");
                setSelectedMonth(new Date().getMonth());
                setSelectedQuarter("Q4");
                setSelectedYear(new Date().getFullYear());
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reset to Current
            </Button>
          </div>
          <Row className="g-3">
            {/* Monthly Selection */}
            {periodType === "Monthly" && (
              <>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label fw-medium mb-2">Select Month</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <CalendarMonth />
                      </span>
                      <select
                        className="form-select border-start-0"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label fw-medium mb-2">Select Year</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Calendar2Check />
                      </span>
                      <select
                        className="form-select border-start-0"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Col>
              </>
            )}

            {/* Quarterly Selection */}
            {periodType === "Quarterly" && (
              <>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label fw-medium mb-2">Select Quarter</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <CalendarWeek />
                      </span>
                      <select
                        className="form-select border-start-0"
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                      >
                        {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                          <option key={q} value={q}>
                            {q} (
                            {q === "Q1"
                              ? "Jan - Mar"
                              : q === "Q2"
                              ? "Apr - Jun"
                              : q === "Q3"
                              ? "Jul - Sep"
                              : "Oct - Dec"}
                            )
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label fw-medium mb-2">Select Year</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Calendar2Check />
                      </span>
                      <select
                        className="form-select border-start-0"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Col>
              </>
            )}

            {/* Financial Year Selection */}
            {periodType === "Financial Year" && (
              <Col md={12}>
                <div className="form-group">
                  <label className="form-label fw-medium mb-2">Select Financial Year</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Calendar2Check />
                    </span>
                    <select
                      className="form-select border-start-0"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}-{y + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Financial Year runs from April {selectedYear} to March {selectedYear + 1}
                  </small>
                </div>
              </Col>
            )}
          </Row>

          {/* Quick Action Buttons */}
          <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top">
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Data will update automatically when you change selections
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Total Summary Cards - ALWAYS SHOW CURRENT MONTH DATA */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">
              Current Month Expense {/* Always show "Current Month" */}
            </h6>
            <h4 className="fw-bold text-primary">
              ₹{currentMonthExpense.toFixed(2)} {/* Always show current month expense */}
            </h4>
            <small className="text-muted">
              {months[currentMonthIndex]} {new Date().getFullYear()}
            </small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">
              Current Month Tax {/* Always show "Current Month" */}
            </h6>
            <h4 className="fw-bold text-warning">
              ₹{currentMonthNetTax.toFixed(2)} {/* Always show current month net tax */}
            </h4>
            <small className="text-muted">
              {months[currentMonthIndex]} {new Date().getFullYear()}
            </small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">
              Current Month Income {/* Always show "Current Month" */}
            </h6>
            <h4 className="fw-bold text-success">
              ₹{currentMonthIncome.toFixed(2)} {/* Always show current month income */}
            </h4>
            <small className="text-muted">
              {months[currentMonthIndex]} {new Date().getFullYear()}
            </small>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Monthly Expense vs Tax Trend</h5>
              {loading ? (
                <p className="text-center text-muted">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#0077b6"
                      strokeWidth={2}
                      dot={false}
                      name="Expense"
                    />
                    <Line
                      type="monotone"
                      dataKey="tax"
                      stroke="#ff9f1c"
                      strokeWidth={2}
                      dot={false}
                      name="Tax"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Monthly Income vs GST Trend</h5>
              {loading ? (
                <p className="text-center text-muted">Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={incomeData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#28a745"
                      strokeWidth={2}
                      dot={false}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="gst"
                      stroke="#ff9f1c"
                      strokeWidth={2}
                      dot={false}
                      name="GST"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Purchase & Work Order Reports */}
      <div className="mt-5">
        <h4 className="fw-bold mb-4 text-center text-primary">
          Purchase & Work Order Reports
        </h4>
        <Row className="g-4">
          <Col md={6}>
            <h5 className="fw-bold mb-3 text-primary">Purchase Order Report</h5>
            <PurchaseReport
              periodType={periodType}
              selectedMonth={selectedMonth}
              selectedQuarter={selectedQuarter}
              selectedYear={selectedYear}
            />
          </Col>
          <Col md={6}>
            <h5 className="fw-bold mb-3 text-success">Work Order Report</h5>
            <WorkOrderReport
              periodType={periodType}
              selectedMonth={selectedMonth}
              selectedQuarter={selectedQuarter}
              selectedYear={selectedYear}
            />
          </Col>
        </Row>
      </div>
<Card className="shadow-sm mt-5">
  <Card.Body>
    {/* INCOME DATA */}
    <h5 className="fw-bold mb-3 text-success text-center">Income Data</h5>
    {woInvoiceSummary.length === 0 && poInvoiceSummary.length === 0 ? (
      <p className="text-muted text-center">
        No invoiced Work Orders or Purchase Orders for selected period
      </p>
    ) : (
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Assign To</th>
              <th>Date</th>
              <th className="text-end">Amount (₹)</th>
              <th className="text-end">GST (₹)</th>
              <th className="text-end">Total Amount (₹)</th>
              <th className="text-end">Remaining (₹)</th>
            </tr>
          </thead>
<tbody>
  <tr className="table-secondary fw-bold">
    <td colSpan="9">WORK ORDER</td>
  </tr>

  {woInvoiceSummary.map((row, index) => (
    <tr key={`wo-${row.woNumber}`}>
      <td>{index + 1}</td>
      <td>Work Order</td>
      <td>{row.woNumber}</td>
      <td>{row.assignedTo}</td>
      <td>{new Date(row.issueDate).toLocaleDateString()}</td>
      <td className="text-end">₹{row.amount.toFixed(2)}</td>
      <td className="text-end">₹{row.gst.toFixed(2)}</td>
      <td className="text-end fw-bold">₹{row.total.toFixed(2)}</td>
      <td className="text-end text-danger">₹{row.remaining.toFixed(2)}</td>
    </tr>
  ))}

  <tr className="table-secondary fw-bold">
    <td colSpan="9">PURCHASE ORDER</td>
  </tr>

  {poInvoiceSummary.map((row, index) => (
    <tr key={`po-${row.poNumber}`}>
      <td>{woInvoiceSummary.length + index + 1}</td>
      <td>Purchase Order</td>
      <td>{row.poNumber}</td>
      <td>{row.assignTo}</td>
      <td>{new Date(row.poDate).toLocaleDateString()}</td>
      <td className="text-end">₹{row.amount.toFixed(2)}</td>
      <td className="text-end">₹{row.tax.toFixed(2)}</td>
      <td className="text-end fw-bold">₹{row.total.toFixed(2)}</td>
      <td className="text-end text-danger">₹{row.remaining.toFixed(2)}</td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    )}

    {/* EXPENSE DATA */}
    <h5 className="fw-bold mt-5 mb-3 text-primary text-center">Expense Data</h5>
    {filteredExpenseCreditRows.length === 0 ? (
      <p className="text-muted text-center">No Expenses or Credit Purchases for selected period</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Assign To</th>
              <th>Date</th>
              <th className="text-end">Amount (₹)</th>
              {/* <th className="text-end">GST (₹)</th>
              <th className="text-end">Total Amount (₹)</th>
              <th className="text-end">Remaining (₹)</th> */}
            </tr>
          </thead>
<tbody>
  {/* CASH PURCHASE */}
  <tr className="table-secondary fw-bold">
    <td colSpan="6">CASH PURCHASE</td>
  </tr>
  {filteredExpenseCreditRows
    .filter((r) => r.type === "Cash Purchase")
    .map((row, index) => (
      <tr key={`cash-${row.ref}`}>
        <td>{index + 1}</td>
        <td>Cash Purchase</td>
        <td>{row.ref}</td>
        <td>{row.branch}</td>
        <td>{new Date(row.date).toLocaleDateString()}</td>
        <td className="text-end">₹{row.amount.toFixed(2)}</td>
      </tr>
    ))}

  {/* CREDIT PURCHASE */}
  <tr className="table-secondary fw-bold">
    <td colSpan="6">CREDIT PURCHASE</td>
  </tr>
  {filteredExpenseCreditRows
    .filter((r) => r.type === "Credit Purchase")
    .map((row, index) => (
      <tr key={`credit-${row.ref}`}>
        <td>{index + 1}</td>
        <td>Credit Purchase</td>
        <td>{row.ref}</td>
        <td>{row.branch}</td>
        <td>{new Date(row.date).toLocaleDateString()}</td>
        <td className="text-end">₹{row.amount.toFixed(2)}</td>
      </tr>
    ))}
</tbody>

        </table>
      </div>
    )}
  </Card.Body>
</Card>

<div className="table-responsive mt-5">
  <table className="table table-bordered align-middle">
    <thead>
      <tr>
        <th colSpan="2">Final Financial Summary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Income</td>
        <td className="text-end">
          ₹{totalIncomeAmount.toFixed(2)}
        </td>
      </tr>

      <tr>
        <td>Total Expense</td>
        <td className="text-end">
          ₹{totalExpenseAmount.toFixed(2)}
        </td>
      </tr>

      <tr>
        <td>Profit / Loss</td>
        <td className="text-end">
          {profitOrLossLabel} ₹{Math.abs(profitOrLossAmount).toFixed(2)}
        </td>
      </tr>

      <tr>
        <td>Total Income Tax (GST)</td>
        <td className="text-end">
          ₹{totalIncomeTaxCalculated.toFixed(2)}
        </td>
      </tr>

      <tr>
        <td>Total Expense Tax</td>
        <td className="text-end">
          ₹{totalExpenseTaxCalculated.toFixed(2)}
        </td>
      </tr>

      <tr>
        <td>Tax Difference</td>
        <td className="text-end">
          ₹{taxDifference.toFixed(2)}
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>
  );
};

export default TaxSummary1;