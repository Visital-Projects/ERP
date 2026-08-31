import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Table, Badge, Button, Modal, Form, Row, Col, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import branchWalletService from "../../../services/branchwalletService";
import branchService from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";
import { Plus, Download } from "react-bootstrap-icons";
import XLSX from "xlsx-js-style";
import RequestFundModal from "./RequestFundModal";
import { VscPreview } from "react-icons/vsc";
import PreviewModal from "./PreviewModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dropdown } from "react-bootstrap";
import expenseService from "../../../services/expensessService";
import categoryService from "../../../services/expenseCategory";
import moment from "moment";
import Select from "react-select";
import {
  getDebitInfo as getSharedDebitInfo,
  getTransactionDisplayDescription as getSharedTransactionDisplayDescription,
  getTransactionPaymentHead as getSharedTransactionPaymentHead,
  getEffectiveTransactionDateValue as getSharedEffectiveTransactionDateValue,
  calculateHistoricalRunningBalances,
  getHistoricalBalanceForPeriod,
  checkPeriodMatch,
  deleteWalletTransactionAndOrigin,
  isPurchaseDeletionRefundTransaction,
  isDeletedPurchaseTransaction,
} from "./walletAccountingHelpers";

const BranchWalletDetails = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [transactions, setTransactions] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [formData, setFormData] = useState({ transaction_type: "credit", amount: "", description: "", transaction_date: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [branches, setBranches] = useState([]);

  const [periodType, setPeriodType] = useState("monthly");
  const [filterValue, setFilterValue] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchExpenses, setBranchExpenses] = useState([]);
  const [branchCreditPurchases, setBranchCreditPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [yearValue, setYearValue] = useState(new Date().getFullYear().toString());

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
  const years = ["2023", "2024", "2025", "2026"];

  const toDateInputValue = (value) => {
    if (!value) return "";
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  };

  const formatDisplayDate = (value) => {
    if (!value) return "-";
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("DD-MM-YYYY") : "-";
  };

  useEffect(() => {
    if (user?.type === "Branch Manager" || user?.type === "Branch Manager ") {
      fetchAllTransactions();
      setBranchName("All Branches");
    } else {
      fetchTransactions();
      fetchBranchName();
    }
  }, [branchId, user?.type]);

  useEffect(() => {
    // Default filter to current month
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
    setPeriodType("monthly");
    setFilterValue(currentMonth);
    setYearValue(new Date().getFullYear().toString());
  }, []);

  const fetchBranchExpenses = async () => {
    setIsReferenceLoading(true);
    try {
      const [res, resCP, resCats] = await Promise.all([
        expenseService.getAllExpenses(),
        expenseService.getAllCreditPurchases(),
        categoryService.getAllCategories(),
      ]);
      setBranchExpenses(res?.data || []);
      setBranchCreditPurchases(resCP?.data || []);
      setCategories(Array.isArray(resCats) ? resCats : resCats?.data || []);
    } catch (err) {
      console.error("Error fetching expenses / reference data:", err);
    } finally {
      setIsReferenceLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchExpenses();
    if (user?.type === "company" || user?.type === "Accountant") {
      fetchBranches();
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data || []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };
  const fetchTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const data = await branchWalletService.getBranchTransactions(branchId);
      setTransactions(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branch transactions:", error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const data = await branchWalletService.getWalletTransactions();
      setTransactions(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch all transactions:", error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const fetchBranchName = async () => {
    try {
      const branch = await branchService.getOne(branchId);
      setBranchName(branch?.name || `Branch ${branchId}`);
    } catch (error) {
      console.error("Failed to fetch branch name:", error);
      setBranchName(`Branch ${branchId}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShowModal = (tx = null) => {
    if (tx) {
      if (tx.transaction_type === "debit") {
        const debitInfo = getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
        if (debitInfo?.data?.id) {
          if (debitInfo.type === "GST") {
            navigate(`/accounting/expenses/credit-purchase/edit/${debitInfo.data.id}`, {
              state: {
                purchaseId: debitInfo.data.id,
                fromWallet: true,
                branchId: tx.branch_id || branchId,
              },
            });
            return;
          }
          if (debitInfo.type === "Non GST") {
            navigate(`/accounting/expensess/edit/${debitInfo.data.id}`, {
              state: {
                expenseId: debitInfo.data.id,
                fromWallet: true,
                branchId: tx.branch_id || branchId,
              },
            });
            return;
          }
        }
      }

      const debitInfo = getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
      const reference = debitInfo?.data || null;
      const transactionDate =
        getEffectiveTransactionDateValue(tx, branchExpenses, branchCreditPurchases, branchId) ||
        reference?.actual_bill_date ||
        reference?.payment_date ||
        reference?.purchase_date ||
        reference?.date ||
        reference?.created_at;

      setSelectedTx(tx);
      setFormData({
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        description: tx.description || "",
        transaction_date: toDateInputValue(transactionDate),
        branch_id: tx.branch_id || ""
      });
    } else {
      setSelectedTx(null);
      setFormData({
        transaction_type: "credit",
        amount: "",
        description: "",
        transaction_date: moment().format("YYYY-MM-DD"),
        branch_id: branchId || ""
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!formData.amount) newErrors.amount = "This field is required";
    if (!formData.branch_id) newErrors.branch_id = "This field is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    try {
      const payload = {
        ...formData,
        description: formData.description?.trim() || "",
        transaction_date: formData.transaction_date || moment().format("YYYY-MM-DD"),
      };
      if (selectedTx) {
        await branchWalletService.updateWallet(selectedTx.id, payload);
        toast.success("Transaction updated successfully");
      } else {
        await branchWalletService.createWallet(payload);
        toast.success("Transaction added successfully");
      }
      setShowModal(false);
      if (user?.type === "Branch Manager" || user?.type === "Branch Manager ") fetchAllTransactions();
      else fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Transaction",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff9900",
      onConfirm: async () => {
        try {
          await deleteWalletTransactionAndOrigin(
            id,
            transactions,
            branchExpenses,
            branchCreditPurchases,
            branchId
          );
          toast.success("Transaction deleted successfully", { icon: false });
          if (user?.type === "Branch Manager" || user?.type === "Branch Manager ") {
            fetchAllTransactions();
          } else {
            fetchTransactions();
          }
          fetchBranchExpenses();
        } catch (error) {
          console.error("Error deleting transaction and origin:", error);
          toast.error(error.message || "Failed to delete transaction");
        }
      },
    });
  };
  const getTransactionBranchId = (tx) => String(tx?.branch_id || branchId || "");

  const getTransactionDateValue = (tx) =>
    tx?.transaction_date ||
    tx?.bill_date ||
    tx?.actual_bill_date ||
    tx?.payment_date ||
    tx?.created_at ||
    tx?.updated_at ||
    null;

  const getPurchaseDateValues = (purchase) => [
    purchase?.bill_date,
    purchase?.actual_bill_date,
    purchase?.payment_date,
    purchase?.purchase_date,
    purchase?.date,
    purchase?.created_at,
    purchase?.createdAt,
  ].filter(Boolean);

  const getPurchaseAmount = (purchase) =>
    Number(purchase?.total_amount || purchase?.total || purchase?.value || 0);

  const getCreditPurchaseIdFromTransaction = (tx) => {
    const explicitId = tx?.credit_purchase_id || tx?.creditPurchaseId || tx?.purchase_id || tx?.reference_id;
    if (explicitId) return String(explicitId);

    const match = String(tx?.description || "").match(/credit\s+purchase\s*#?\s*(\d+)/i);
    return match?.[1] || "";
  };

  const firstTextValue = (...values) => {
    const value = values.find((item) => String(item || "").trim());
    return value ? String(value).trim() : "";
  };

  const getReferenceName = (reference) =>
    firstTextValue(
      reference?.reference_name,
      reference?.name,
      reference?.vendor_name,
      reference?.party_name,
      reference?.supplier_name,
      reference?.purchase_name,
      reference?.vendor?.name,
      reference?.party?.name,
      reference?.supplier?.name,
      reference?.description
    );

  const isGeneratedPaymentDescription = (description) =>
    /(?:payment\s+of\s+)?credit\s+purchase\s*#?\s*\d+/i.test(String(description || "")) ||
    /payment\s+reference\s*#?\s*\d+/i.test(String(description || ""));

  const getTransactionDisplayDescription = (tx, debitInfo = getDebitInfo(tx)) => {
    const reference = debitInfo?.data;
    const transactionName = firstTextValue(
      tx?.reference_name,
      tx?.vendor_name,
      tx?.party_name,
      tx?.supplier_name,
      tx?.purchase_name
    );
    const referenceName = getReferenceName(reference);

    if (referenceName && (reference || isGeneratedPaymentDescription(tx?.description))) {
      return referenceName;
    }

    return firstTextValue(transactionName, tx?.description, "-");
  };

  const getTransactionPaymentHead = (tx, debitInfo = getDebitInfo(tx)) => {
    return getSharedTransactionPaymentHead(
      tx,
      debitInfo,
      branchExpenses,
      branchCreditPurchases,
      branchId,
      categories
    );
  };

  const purchaseMatchesDebit = (purchase, tx) => {
    const purchaseBranchId = String(purchase?.branch?.id || purchase?.branch_id || "");
    if (purchaseBranchId !== getTransactionBranchId(tx)) return false;

    const creditPurchaseId = getCreditPurchaseIdFromTransaction(tx);
    if (creditPurchaseId) {
      return String(purchase?.id || "") === creditPurchaseId;
    }

    if (getPurchaseAmount(purchase) !== Number(tx.amount)) return false;

    const transactionDate = moment(getTransactionDateValue(tx));
    return (
      transactionDate.isValid() &&
      getPurchaseDateValues(purchase).some((date) =>
        moment(date).isSame(transactionDate, "day")
      )
    );
  };

  const getDebitInfo = (tx) => {
    if (tx.transaction_type !== "debit") return null;

    const creditPurchaseId = getCreditPurchaseIdFromTransaction(tx);
    if (creditPurchaseId) {
      const cp = branchCreditPurchases.find((purchase) =>
        purchaseMatchesDebit(purchase, tx)
      );
      return { type: "GST", data: cp || null };
    }

    const expense = branchExpenses.find((exp) => purchaseMatchesDebit(exp, tx));
    if (expense) return { type: "Non GST", data: expense };

    const cp = branchCreditPurchases.find((purchase) =>
      purchaseMatchesDebit(purchase, tx)
    );
    if (cp) return { type: "GST", data: cp };

    return { type: "Non GST", data: null };
  };

  const getTransactionSourceLabel = (tx) => {
    if (!tx) return "Wallet Transaction";
    const debitInfo = getDebitInfo(tx);

    if (tx.transaction_type === "credit") {
      return hasCorrespondingPurchase(tx)
        ? "Wallet Credit / Purchase Reference"
        : "Normal Wallet Credit";
    }

    if (debitInfo?.type === "GST") return "GST Purchase";
    if (debitInfo?.type === "Non GST") return "Non-GST Purchase";
    return "Wallet Debit";
  };

  const hasCorrespondingPurchase = (creditTx) => {
    if (creditTx.transaction_type !== "credit") return false;

    const txBranchId = getTransactionBranchId(creditTx);
    const txAmount = Number(creditTx.amount);
    const txDate = moment(getTransactionDateValue(creditTx));

    // Look for a debit in the transactions list that matches this credit
    // and is confirmed to be linked to a purchase record.
    return transactions.some(tx => {
      if (tx.transaction_type !== "debit") return false;
      if (getTransactionBranchId(tx) !== txBranchId) return false;
      if (Number(tx.amount) !== txAmount) return false;

      const debitDate = moment(getTransactionDateValue(tx));
      // Check if debit is on same day or later
      if (!debitDate.isSameOrAfter(txDate, "day")) return false;

      // Verify this debit is linked to a purchase entry
      const info = getDebitInfo(tx);
      return info && info.data !== null;
    });
  };

  const getEffectiveTransactionDateValue = (tx) => {
    if (!tx) return null;

    let dateValue =
      tx.transaction_date ||
      tx.bill_date ||
      tx.actual_bill_date ||
      tx.payment_date;

    // Debit wallet entries can be linked with expense / purchase rows.
    // Use the real bill/payment date everywhere so the table follows
    // actual transaction date order, not the API insertion order.
    if (!dateValue && tx.transaction_type === "debit") {
      const debitInfo = getDebitInfo(tx);
      if (debitInfo?.data) {
        dateValue =
          debitInfo.data.bill_date ||
          debitInfo.data.actual_bill_date ||
          debitInfo.data.payment_date ||
          debitInfo.data.purchase_date ||
          debitInfo.data.date;
      }
    }

    return dateValue || tx.created_at || tx.updated_at || null;
  };

  const getTimeValue = (value) => {
    const parsed = moment(value);
    return parsed.isValid() ? parsed.valueOf() : 0;
  };

  const getLedgerDateValue = (tx) =>
    tx?.created_at || tx?.payment_date || tx?.transaction_date || tx?.updated_at || null;

  const getLedgerDayValue = (tx) => {
    const parsed = moment(getLedgerDateValue(tx));
    return parsed.isValid() ? parsed.startOf("day").valueOf() : 0;
  };

  const getBusinessDayValue = (tx) => {
    const parsed = moment(getEffectiveTransactionDateValue(tx));
    return parsed.isValid() ? parsed.startOf("day").valueOf() : 0;
  };

  const normalizeTransactionDescription = (description) =>
    String(description || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  const isLinkedCreditDebitPair = (a, b, getDayValue = getLedgerDayValue) => {
    const creditTx = a.transaction_type === "credit" ? a : b;
    const debitTx = a.transaction_type === "debit" ? a : b;

    if (
      creditTx.transaction_type !== "credit" ||
      debitTx.transaction_type !== "debit"
    ) {
      return false;
    }

    const creditDescription = normalizeTransactionDescription(
      getTransactionDisplayDescription(creditTx)
    );
    const debitDescription = normalizeTransactionDescription(
      getTransactionDisplayDescription(debitTx)
    );

    return (
      getTransactionBranchId(creditTx) === getTransactionBranchId(debitTx) &&
      Number(creditTx.amount) === Number(debitTx.amount) &&
      getDayValue(creditTx) === getDayValue(debitTx) &&
      creditDescription !== "" &&
      creditDescription === debitDescription
    );
  };

  const sortTransactionsByRecentTransactionDate = (list) => {
    return [...list].sort((a, b) => {
      const transactionDateDiff =
        getBusinessDayValue(b) - getBusinessDayValue(a);

      if (transactionDateDiff !== 0) return transactionDateDiff;

      if (isLinkedCreditDebitPair(a, b, getBusinessDayValue)) {
        return a.transaction_type === "debit" ? -1 : 1;
      }

      const createdDateDiff =
        getTimeValue(getLedgerDateValue(b)) -
        getTimeValue(getLedgerDateValue(a));

      if (createdDateDiff !== 0) return createdDateDiff;

      return Number(b.id || 0) - Number(a.id || 0);
    });
  };

  const getLatestTransaction = (list) => {
    return [...list].sort((a, b) => {
      const createdDateDiff =
        getTimeValue(getLedgerDateValue(b)) -
        getTimeValue(getLedgerDateValue(a));

      return createdDateDiff || Number(b.id || 0) - Number(a.id || 0);
    })[0] || null;
  };

  const getLatestBalance = (list) => {
    const latestTransaction = getLatestTransaction(list);
    return Number(latestTransaction?.balance_after || 0);
  };

  const transactionsWithRunningBalance = () => {
    return calculateHistoricalRunningBalances(
      transactions,
      branchExpenses,
      branchCreditPurchases,
      branchId
    );
  };

  const filteredTransactions = () => {
    const listWithBalance = transactionsWithRunningBalance();

    return sortTransactionsByRecentTransactionDate(
      listWithBalance
        .filter((tx) => !isPurchaseDeletionRefundTransaction(tx))
        .filter((tx) => !isDeletedPurchaseTransaction(tx, branchExpenses, branchCreditPurchases))
        .filter((tx) => (statusFilter ? tx.transaction_type === statusFilter : true))
        .filter((tx) => {
          const dateValue = getEffectiveTransactionDateValue(tx);
          return checkPeriodMatch(dateValue, {
            periodType,
            filterValue,
            yearValue,
            startDate,
            endDate,
          });
        })
    );
  };


  const filteredData = filteredTransactions();
  const historicalBalanceData = getHistoricalBalanceForPeriod(
    transactions,
    branchExpenses,
    branchCreditPurchases,
    branchId,
    { periodType, filterValue, monthValue: filterValue, yearValue, startDate, endDate }
  );
  const periodHistoricalBalance = historicalBalanceData.balance;
  const applicableTransaction = historicalBalanceData.transaction;
  const currentWalletBalance = getLatestBalance(transactions);
  const isTableLoading = isTransactionsLoading || isReferenceLoading;

  useEffect(() => {
    setCurrentPage(1);
  }, [periodType, filterValue, yearValue, statusFilter, startDate, endDate, entriesPerPage]);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const pageCount = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const fyOptions = years.slice(0, -1).map((y, i) => {
    const nextYear = years[i + 1];
    return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
  });

  const handleDownloadExcel = () => {
    if (transactions.length === 0) {
      toast.warning("No transactions found.");
      return;
    }

    const filteredTxs = filteredTransactions();
    if (filteredTxs.length === 0) {
      toast.warning("No transactions match the selected filters.");
      return;
    }

    const sheetData = [];
    sheetData.push([`${branchName} Branch Wallet Report`]); // Row 0
    sheetData.push([]); // Row 1 (Reserved for Month if needed, or just a gap)

    const groupedByMonth = {};
    filteredTxs.forEach((tx) => {
      const date = new Date(getEffectiveTransactionDateValue(tx));
      const txMonth = (date.getMonth() + 1).toString().padStart(2, "0");
      const monthName = months.find((m) => m.value === txMonth)?.name || txMonth;
      if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
      groupedByMonth[monthName].push(tx);
    });

    const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    let rowIndex = 2;

    Object.keys(groupedByMonth).forEach((monthName) => {
      sheetData.push([monthName]); // Individual month header
      merges.push({ s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 4 } });

      sheetData.push(["Date", "Description", "Credit", "Debit", "Current Balance"]);

      groupedByMonth[monthName].forEach((tx) => {
        const date = moment(getEffectiveTransactionDateValue(tx)).format("DD/MM/YYYY");
        const rowBalance =
          tx.historicalRunningBalance !== undefined
            ? Number(tx.historicalRunningBalance)
            : Number(tx.balance_after || 0);

        sheetData.push([
          date,
          getTransactionDisplayDescription(tx),
          tx.transaction_type === "credit" ? Number(tx.amount || 0) : null,
          tx.transaction_type === "debit" ? Number(tx.amount || 0) : null,
          rowBalance,
        ]);
      });
      sheetData.push([]); // Gap after month
    });

    // Totals
    const totalCredit = filteredTxs
      .filter((tx) => tx.transaction_type === "credit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const totalDebit = filteredTxs
      .filter((tx) => tx.transaction_type === "debit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const currentBalance = getLatestBalance(transactions);

    sheetData.push(["", "Total Credited Amount:", Number(totalCredit)]); // Label in B, Value in C
    sheetData.push(["", "Total Debited Amount:", "", Number(totalDebit)]); // Label in B, Value in D
    sheetData.push(["", "Current Balance:", "", "", Number(currentBalance)]); // Label in B, Value in E

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Styles
    const titleStyle = {
      fill: { fgColor: { rgb: "92D050" } },
      font: { bold: true, size: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const monthStyle = {
      fill: { fgColor: { rgb: "C6E0B4" } },
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const headerStyle = {
      font: { bold: true },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const dataStyle = {
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const amountStyle = {
      numFmt: "#,##,##0",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const redTotalStyle = {
      fill: { fgColor: { rgb: "C00000" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      numFmt: "#,##,##0",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const brownTotalStyle = {
      fill: { fgColor: { rgb: "953735" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      numFmt: "#,##,##0",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const greenTotalStyle = {
      fill: { fgColor: { rgb: "70AD47" } },
      font: { color: { rgb: "000000" }, bold: true },
      numFmt: "#,##,##0",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_ref]) ws[cell_ref] = { t: "s", v: "" };

        if (R === 0) {
          ws[cell_ref].s = titleStyle;
        } else {
          const val = ws[cell_ref].v;
          // Detect month header (merged row)
          const isMonthHeader = merges.some(m => m.s.r === R && m.s.r === m.e.r && m.e.c - m.s.c > 0 && R > 0);

          if (isMonthHeader) {
            ws[cell_ref].s = monthStyle;
          } else if (val === "Date" || val === "Description" || val === "Credit" || val === "Debit" || val === "Current Balance") {
            ws[cell_ref].s = headerStyle;
          } else if (R < sheetData.length - 3) {
            // Data rows
            if (C >= 2) {
              ws[cell_ref].s = amountStyle;
              ws[cell_ref].t = "n";
            } else {
              ws[cell_ref].s = dataStyle;
            }
          }
        }
      }
    }

    // Apply Footer styles specifically
    const lastThreeRows = [sheetData.length - 3, sheetData.length - 2, sheetData.length - 1];

    // Total Credited Row
    const credRow = sheetData.length - 3;
    ws[XLSX.utils.encode_cell({ r: credRow, c: 1 })].s = dataStyle;
    ws[XLSX.utils.encode_cell({ r: credRow, c: 2 })].s = redTotalStyle;
    ws[XLSX.utils.encode_cell({ r: credRow, c: 2 })].t = "n";

    // Total Debited Row
    const debRow = sheetData.length - 2;
    ws[XLSX.utils.encode_cell({ r: debRow, c: 1 })].s = dataStyle;
    ws[XLSX.utils.encode_cell({ r: debRow, c: 3 })].s = brownTotalStyle;
    ws[XLSX.utils.encode_cell({ r: debRow, c: 3 })].t = "n";

    // Current Balance Row
    const balRow = sheetData.length - 1;
    ws[XLSX.utils.encode_cell({ r: balRow, c: 1 })].s = dataStyle;
    ws[XLSX.utils.encode_cell({ r: balRow, c: 4 })].s = greenTotalStyle;
    ws[XLSX.utils.encode_cell({ r: balRow, c: 4 })].t = "n";

    ws["!merges"] = merges;
    ws["!cols"] = [{ wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Wallet Report");
    const branchLabel = branchName.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `${branchLabel}_Wallet_Report.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (transactions.length === 0) {
      toast.warning("No transactions found.");
      return;
    }

    const filteredTxs = filteredTransactions();
    if (filteredTxs.length === 0) {
      toast.warning("No transactions match the selected filters.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const title = `${branchName} Branch Wallet Report`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    const tableColumn = ["Date", "Description", "Credit", "Debit", "Current Balance"];
    const tableRows = filteredTxs.map((tx) => {
      const rowBalance =
        tx.historicalRunningBalance !== undefined
          ? tx.historicalRunningBalance
          : tx.balance_after;

      return [
        moment(getEffectiveTransactionDateValue(tx)).format("DD/MM/YYYY"),
        getTransactionDisplayDescription(tx),
        tx.transaction_type === "credit" ? tx.amount : "",
        tx.transaction_type === "debit" ? tx.amount : "",
        rowBalance,
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    const branchLabel = branchName.replace(/\s+/g, "_");

    // ✅ Ensure a small delay before saving
    setTimeout(() => {
      doc.save(`${branchLabel}_Wallet_Report.pdf`);
    }, 100);
  };


  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    ConfirmDeleteModal({
      title: "Delete Selected Transactions",
      message: `You are about to delete ${selectedIds.length} transaction(s). This action cannot be undone.`,
      iconColor: "#ff0000",
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              deleteWalletTransactionAndOrigin(
                id,
                transactions,
                branchExpenses,
                branchCreditPurchases,
                branchId
              )
            )
          );
          toast.success(`${selectedIds.length} transaction(s) deleted successfully`);
          setSelectedIds([]);
          if (user?.type === "Branch Manager" || user?.type === "Branch Manager ") {
            fetchAllTransactions();
          } else {
            fetchTransactions();
          }
          fetchBranchExpenses();
        } catch (error) {
          console.error("Error during bulk delete:", error);
          toast.error("Failed to delete selected transactions");
        }
      },
    });
  };

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>Transaction History – {branchName}</h4>
          <BreadCrumb
            pathname={location?.pathname || ""}
            lastLabel="Branch Transactions"
            dynamicNames={{ [branchId]: branchName }}
          />
        </div>
        <div className="p-4 rounded d-flex justify-content-center flex-wrap gap-2">
          {user?.type === "Branch Manager" || user?.type === "Branch Manager " ? (
            <OverlayTrigger overlay={<Tooltip>Request Additional Funds</Tooltip>}>
              <Button
                variant="warning"
                className="fw-semibold text-white px-2"
                onClick={() => setShowExtraModal(true)}
              >
                Request Fund
              </Button>
            </OverlayTrigger>
          ) : (
            (user?.type === "Accountant" || user?.type === "company") && (
              <OverlayTrigger overlay={<Tooltip>Add Money to Branch Wallet</Tooltip>}>
                <Button
                  variant="success"
                  className="fw-semibold text-white px-2"
                  onClick={() => handleShowModal()}
                >
                  + Add Money to Wallet
                </Button>
              </OverlayTrigger>
            )
          )}

          <OverlayTrigger overlay={<Tooltip>View All Fund Requests</Tooltip>}>
            <Button
              variant="info"
              className="fw-semibold text-white px-2"
              onClick={() => navigate(`/fund-requests?branchId=${branchId}`)}
            >
              View Fund Request
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      <Row className="my-4 g-3 justify-content-center">
        {/* Total Credited Amount */}
        <Col md={3}>
          <div className="p-3 py-4 rounded shadow-sm text-center" style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}>
            <h3 className="fw-bold text-success mb-1">
              ₹{filteredTransactions()
                .filter((tx) => tx.transaction_type === "credit")
                .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <small className="text-muted">Credited Amount</small>
          </div>
        </Col>

        {/* Non GST Purchase */}
        <Col md={3}>
          <div className="p-3 py-4 rounded shadow-sm text-center" style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeeba" }}>
            <h3 className="fw-bold text-warning mb-1">
              ₹{filteredTransactions()
                .filter((tx) => tx.transaction_type === "debit" && getDebitInfo(tx)?.type === "Non GST")
                .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <small className="text-muted">Non GST Purchase</small>
          </div>
        </Col>

        {/* GST Purchase */}
        <Col md={3}>
          <div className="p-3 py-4 rounded shadow-sm text-center" style={{ backgroundColor: "#f8d7da", border: "1px solid #f5c6cb" }}>
            <h3 className="fw-bold text-danger mb-1">
              ₹{filteredTransactions()
                .filter((tx) => tx.transaction_type === "debit" && getDebitInfo(tx)?.type === "GST")
                .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <small className="text-muted">GST Purchase</small>
          </div>
        </Col>

        {/* Current Branch Wallet Balance */}
        <Col md={3}>
          <div className="p-3 py-4 rounded shadow-sm text-center" style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}>
            <h3 className="fw-bold text-success mb-1">
              ₹{periodHistoricalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <small className="text-muted d-block">Current Wallet Balance</small>
          </div>
        </Col>
      </Row>


      {/* Table */}
      <div className="table-responsive table-striped card p-4 shadow-sm">
        <Row className="align-items-center justify-content-between mb-3">
          {/* Entries per page (left) */}
          <Col md={1}>
            <InputGroup>
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
            </InputGroup>
          </Col>

          {/* Filter section and buttons (right aligned) */}
          <Col className="d-flex justify-content-end flex-wrap g-2">
            {/* Status Filter */}
            <Form.Group className="me-2 mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </Form.Select>
            </Form.Group>

            {/* Period Filter */}
            <Form.Group className="me-2 mb-2">
              <Form.Label>Select Period</Form.Label>
              <Form.Select
                value={periodType}
                onChange={(e) => {
                  const value = e.target.value;
                  setPeriodType(value);
                  const today = new Date().toISOString().split("T")[0];
                  if (value === "weekly" || value === "daily") {
                    setFilterValue(today);
                  } else if (value === "monthly") {
                    setFilterValue((new Date().getMonth() + 1).toString().padStart(2, "0"));
                  } else {
                    setFilterValue("");
                  }
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <option value="">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="fy">Financial Year</option>
                <option value="custom">Custom</option>
              </Form.Select>
            </Form.Group>

            {/* Period Value Selector */}
            {periodType && periodType !== "custom" && (
              <Form.Group className="me-2 mb-2">
                <Form.Label>
                  {periodType === "daily" && "Select Date"}
                  {periodType === "weekly" && "Select Week"}
                  {periodType === "monthly" && "Select Month"}
                  {periodType === "fy" && "Select Financial Year"}
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
                    type="date"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
                {periodType === "monthly" && (
                  <div className="d-flex gap-2">
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
                    <Form.Select
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                      style={{ width: "120px" }}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                )}
                {periodType === "quarterly" && (
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                    >
                      <option value="">Select Quarter</option>
                      <option value="Q1">Q1 (Apr - Jun)</option>
                      <option value="Q2">Q2 (Jul - Sep)</option>
                      <option value="Q3">Q3 (Oct - Dec)</option>
                      <option value="Q4">Q4 (Jan - Mar)</option>
                    </Form.Select>
                    <Form.Select
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                      style={{ width: "120px" }}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                )}
                {periodType === "fy" && (
                  <Form.Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {fyOptions.map((fy) => (
                      <option key={fy.value} value={fy.value}>
                        {fy.label}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            )}

            {/* Custom Dates */}
            {periodType === "custom" && (
              <>
                <Form.Group className="me-2 mb-2">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="me-2 mb-2">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            {/* Buttons */}
            <div className="d-flex align-items-end flex-wrap mb-2">
              <OverlayTrigger overlay={<Tooltip>View Expense Details</Tooltip>}>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() =>
                    navigate(`/accounting/expenses/${branchId}/details`)
                  }
                >
                  <i className="bi bi-eye text-white"></i>
                </Button>
              </OverlayTrigger>

              <OverlayTrigger overlay={<Tooltip>Preview Excel Report</Tooltip>}>
                <Button variant="info" size="sm" className="me-2" onClick={() => setShowPreview(true)}>
                  <VscPreview />
                </Button>
              </OverlayTrigger>
              <Dropdown>
                <Dropdown.Toggle variant="success" size="sm" id="download-dropdown">
                  <Download />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleDownloadExcel}>Download Excel</Dropdown.Item>
                  <Dropdown.Item onClick={handleDownloadPDF}>Download PDF</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {/* {(user?.type === "company" || user?.type === "Accountant") && (
  <OverlayTrigger overlay={<Tooltip>Delete Selected Transactions</Tooltip>}>
    <Button
      size="sm"
      variant="danger"
      className="ms-2"
      disabled={selectedIds.length === 0}
      onClick={() => handleBulkDelete()}
    >
      <i className="bi bi-trash"></i>
    </Button>
  </OverlayTrigger>
)} */}
            </div>
          </Col>
        </Row>
        <Table hover className="text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Transaction Date</th>
              <th>VENDOR NAME</th>
              <th>Payment Head</th>
              <th>Credited (₹)</th>
              <th>Non GST Purchase (₹)</th>
              <th>GST Purchase (₹)</th>
              <th className="text-primary">Current Balance (₹)</th>
              <th>ENTRY DATE</th>
              {(user?.type === "company" || user?.type === "Accountant") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isTableLoading ? (
              <tr>
                <td colSpan={(user?.type === "company" || user?.type === "Accountant") ? 10 : 9} className="text-center">
                  Loading transactions...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((tx, index) => {
                const debitInfo = getDebitInfo(tx);
                const isCredit = tx.transaction_type === "credit";
                const debitType = debitInfo?.type;

                return (
                  <tr key={tx.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {(() => {
                        const transactionDate = getEffectiveTransactionDateValue(tx);
                        return formatDisplayDate(transactionDate);
                      })()}
                    </td>
                    <td
                      className="text-start"
                      title={getReferenceName(debitInfo?.data) || tx.description || ""}
                    >
                      {getTransactionDisplayDescription(tx, debitInfo)}
                    </td>
                    <td
                      className="text-start"
                      title={getTransactionPaymentHead(tx, debitInfo)}
                    >
                      {getTransactionPaymentHead(tx, debitInfo)}
                    </td>

                    {/* Credited Column */}
                    <td className="fw-bold text-success">
                      {isCredit ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}
                    </td>

                    {/* Non GST Purchase Column */}
                    <td className="fw-bold text-warning">
                      {!isCredit && debitType === "Non GST" ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}
                    </td>

                    {/* GST Purchase Column */}
                    <td className="fw-bold text-danger">
                      {!isCredit && debitType === "GST" ? `₹${Number(tx.amount).toLocaleString("en-IN")}` : "-"}
                    </td>

                    {/* Current Balance Column */}
                    <td className="fw-bold text-primary">
                      ₹{(
                        tx.historicalRunningBalance !== undefined
                          ? Number(tx.historicalRunningBalance)
                          : Number(tx.balance_after || 0)
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {formatDisplayDate(tx.created_at)}
                    </td>
                    {(user?.type === "company" || user?.type === "Accountant") && (
                      <td>
                        {isCredit && !hasCorrespondingPurchase(tx) && (
                          <>
                            <OverlayTrigger overlay={<Tooltip>Create GST Purchase</Tooltip>}>
                              <Button
                                size="sm"
                                variant="primary"
                                className="me-2"
                                onClick={() => navigate("/accounting/expenses/credit-purchase/create", {
                                  state: {
                                    fromWallet: true,
                                    branchId: tx.branch_id || branchId,
                                    amount: tx.amount,
                                    description: tx.description,
                                    transactionDate: tx.transaction_date || tx.created_at
                                  }
                                })}
                              >
                                <i className="bi bi-receipt text-white"></i>
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Create Non-GST Purchase</Tooltip>}>
                              <Button
                                size="sm"
                                variant="warning"
                                className="me-2"
                                onClick={() => navigate("/accounting/expensess/create", {
                                  state: {
                                    branchId: tx.branch_id || branchId,
                                    amount: tx.amount,
                                    description: tx.description,
                                    transactionDate: tx.transaction_date || tx.created_at
                                  }
                                })}
                              >
                                <i className="bi bi-journal-plus text-white"></i>
                              </Button>
                            </OverlayTrigger>
                          </>
                        )}

                        <OverlayTrigger overlay={<Tooltip>Edit Transaction</Tooltip>}>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleShowModal(tx)}
                          >
                            <i className="bi bi-pencil text-white"></i>
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Delete Transaction</Tooltip>}>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(tx.id)}
                          >
                            <i className="bi bi-trash text-white"></i>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="fw-bold text-primary">
                  ₹{periodHistoricalBalance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>-</td>
                {(user?.type === "company" || user?.type === "Accountant") && (
                  <td>
                    {applicableTransaction ? (
                      <>
                        <OverlayTrigger overlay={<Tooltip>Edit Transaction</Tooltip>}>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleShowModal(applicableTransaction)}
                          >
                            <i className="bi bi-pencil text-white"></i>
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Delete Transaction</Tooltip>}>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(applicableTransaction.id)}
                          >
                            <i className="bi bi-trash text-white"></i>
                          </Button>
                        </OverlayTrigger>
                      </>
                    ) : (
                      <>
                        <OverlayTrigger overlay={<Tooltip>Add Money to Wallet</Tooltip>}>
                          <Button
                            size="sm"
                            variant="success"
                            className="me-2"
                            onClick={() => handleShowModal()}
                          >
                            <i className="bi bi-plus text-white"></i>
                          </Button>
                        </OverlayTrigger>
                      </>
                    )}
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            {filteredData.length === 0
              ? "Showing 1 of 1 entries (Current Balance)"
              : `Showing ${startIndex + 1} to ${Math.min(startIndex + entriesPerPage, filteredData.length)} of ${filteredData.length} entries`}
          </div>
          <div>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>&laquo;</button>
              </li>
              {Array.from({ length: Math.max(pageCount, 1) }, (_, i) => i + 1).map((page) => {
                if (pageCount <= 5 || page === 1 || page === pageCount || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                    </li>
                  );
                } else if ((page === 2 && currentPage > 3) || (page === pageCount - 1 && currentPage < pageCount - 2)) {
                  return (
                    <li key={page} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                } else return null;
              })}
              <li className={`page-item ${currentPage === Math.max(pageCount, 1) ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>&raquo;</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="md" backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedTx ? "Edit Transaction" : "Add Transaction"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {selectedTx && (() => {
              const debitInfo = getDebitInfo(selectedTx);
              const reference = debitInfo?.data;
              return (
                <>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Transaction Source</Form.Label>
                      <Form.Control
                        value={getTransactionSourceLabel(selectedTx)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  {reference && (
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Reference Details</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={[
                            getReferenceName(reference) && `Name: ${getReferenceName(reference)}`,
                            reference.actual_bill_date && `Bill Date: ${formatDisplayDate(reference.actual_bill_date)}`,
                            reference.payment_date && `Payment Date: ${formatDisplayDate(reference.payment_date)}`,
                            reference.remark && `Remark: ${reference.remark}`,
                          ].filter(Boolean).join("\n")}
                          readOnly
                        />
                        <Form.Text className="text-muted">
                          Reference text is shown for context only. Use the purchase edit screen to change purchase fields.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  )}
                </>
              );
            })()}
            {/* Transaction type hidden for Add */}
            <Col md={12} style={{ display: "none" }}>
              <Form.Group>
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {(user?.type === "company" || user?.type === "Accountant") && (
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Branch <span className="text-danger">*</span></Form.Label>
                  <Select
                    classNamePrefix="react-select"
                    options={branches.map((b) => ({ value: b.id, label: b.name }))}
                    value={branches
                      .map((b) => ({ value: b.id, label: b.name }))
                      .find((opt) => String(opt.value) === String(formData.branch_id))}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        branch_id: selected ? selected.value : "",
                      }))
                    }
                    placeholder="Search and select branch..."
                    isSearchable
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: errors.branch_id ? "1px solid red" : base.border,
                      }),
                    }}
                  />
                  {errors.branch_id && (
                    <Form.Text className="text-danger">{errors.branch_id}</Form.Text>
                  )}
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} />
                {errors.amount && (
                  <Form.Text className="text-danger">{errors.amount}</Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Transaction Date</Form.Label>
                <Form.Control type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} />
                <Form.Text className="text-muted">
                  Display format: {formData.transaction_date ? moment(formData.transaction_date).format("DD-MM-YYYY") : "dd-mm-yyyy"}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      <RequestFundModal
        show={showExtraModal}
        onClose={() => setShowExtraModal(false)}
        branchId={branchId}
        onSuccess={fetchTransactions}
      />
      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        transactions={filteredTransactions().map((tx) => ({
          ...tx,
          description: getTransactionDisplayDescription(tx),
          display_transaction_date: getEffectiveTransactionDateValue(tx),
        }))}
        months={months}
        handleDownloadExcel={handleDownloadExcel}
        handleDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default BranchWalletDetails;
