import moment from "moment";
import branchWalletService from "../../../services/branchwalletService";
import expenseService from "../../../services/expensessService";
import categoryService from "../../../services/expenseCategory";

/**
 * Shared Accounting Wallet Helpers
 * Single source of truth for wallet transaction classification, effective date,
 * chronological running balance calculations, and period-specific historical balances.
 */

export const getTransactionBranchId = (tx, fallbackBranchId = "") =>
  String(tx?.branch_id || fallbackBranchId || "");

export const getTransactionDateValue = (tx) =>
  tx?.transaction_date ||
  tx?.bill_date ||
  tx?.actual_bill_date ||
  tx?.payment_date ||
  tx?.created_at ||
  tx?.updated_at ||
  null;

export const getPurchaseDateValues = (purchase) =>
  [
    purchase?.bill_date,
    purchase?.actual_bill_date,
    purchase?.payment_date,
    purchase?.purchase_date,
    purchase?.date,
    purchase?.created_at,
    purchase?.createdAt,
  ].filter(Boolean);

export const getPurchaseAmount = (purchase) =>
  Number(purchase?.total_amount || purchase?.total || purchase?.value || 0);

export const getCreditPurchaseIdFromTransaction = (tx) => {
  const explicitId =
    tx?.credit_purchase_id ||
    tx?.creditPurchaseId ||
    tx?.purchase_id ||
    tx?.reference_id;
  if (explicitId) return String(explicitId);

  const sources = [tx?.name, tx?.description].filter(Boolean);
  for (const source of sources) {
    const match = String(source).match(
      /(?:adjustment\s+for\s+)?credit\s+purchase(?:\s+payment)?\s*#?\s*(\d+)/i
    );
    if (match) {
      return String(match[1]);
    }
  }

  return "";
};

export const getExpenseIdFromTransaction = (tx) => {
  const explicitId =
    tx?.expense_id ||
    tx?.expenseId;
  if (explicitId) return String(explicitId);

  const sources = [tx?.name, tx?.description].filter(Boolean);
  for (const source of sources) {
    const match = String(source).match(
      /(?:expense\s+(?:update|deduction)|expense\s+deleted|expense)\s*#?\s*(\d+)/i
    );
    if (match) {
      return String(match[1]);
    }
  }

  return "";
};

export const firstTextValue = (...values) => {
  const value = values.find((item) => String(item || "").trim());
  return value ? String(value).trim() : "";
};

export const getReferenceName = (reference) =>
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

let cachedCategories = [];
let isFetchingCategories = false;

export const loadPaymentHeadCategories = async () => {
  if (cachedCategories.length > 0 || isFetchingCategories) return cachedCategories;
  const token = localStorage.getItem("token");
  if (!token) return cachedCategories;
  try {
    isFetchingCategories = true;
    const cats = await categoryService.getAllCategories();
    cachedCategories = Array.isArray(cats) ? cats : [];
  } catch (err) {
    console.error("Failed to load categories for payment heads:", err);
  } finally {
    isFetchingCategories = false;
  }
  return cachedCategories;
};

export const getTransactionPaymentHead = (
  tx,
  debitInfo = null,
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = "",
  categories = []
) => {
  if (!tx || tx.transaction_type === "credit") return "-";
  const effectiveDebitInfo =
    debitInfo || getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
  const reference = effectiveDebitInfo?.data;
  if (!reference) return "-";

  const allCats = categories?.length ? categories : cachedCategories;

  // 1. If reference already has category name directly
  const directName = firstTextValue(
    reference?.category?.name,
    reference?.category_name,
    reference?.payment_head,
    reference?.paymentHead,
    reference?.head_name
  );
  if (directName) return directName;

  // 2. If reference has category_id (integer ID or name string), resolve via categories
  if (reference?.category_id) {
    const matchedCategory = allCats.find(
      (c) => String(c.id) === String(reference.category_id)
    );
    if (matchedCategory?.name) return matchedCategory.name;

    // If category_id was saved as the string name itself (e.g. newly typed category)
    if (isNaN(Number(reference.category_id)) && String(reference.category_id).trim()) {
      return String(reference.category_id).trim();
    }
  }

  return "-";
};

export const isGeneratedPaymentDescription = (description) => {
  const desc = String(description || "").trim();
  return (
    /(?:payment\s+of\s+)?credit\s+purchase\s*#?\s*\d+/i.test(desc) ||
    /payment\s+reference\s*#?\s*\d+/i.test(desc) ||
    /adjustment\s+due\s+to\s+edit\s+after\s+payment/i.test(desc) ||
    /expense\s+amount\s+adjusted/i.test(desc) ||
    /expense\s+deduction/i.test(desc)
  );
};

/**
 * Identifies automatically generated refund/reversal transactions created by the backend
 * upon deleting a GST or Non-GST purchase.
 *
 * Backend creation signatures:
 * 1. GST Purchase deletion (`creditPurchase.controller.js`):
 *    - name: "Refund for Deleted Credit Purchase #..."
 *    - description: "Refund after deleting credit purchase #..."
 * 2. Non-GST Purchase deletion (`expenseNew.controller.js`):
 *    - name: "Expense Deleted #..."
 *    - description: "Expense deleted – amount refunded"
 */
export const isPurchaseDeletionRefundTransaction = (tx) => {
  if (!tx || tx.transaction_type !== "credit") return false;

  const desc = String(tx.description || "").trim();
  const name = String(tx.name || "").trim();

  // Pattern 1: GST Purchase deletion refund
  const isCreditPurchaseRefund =
    /refund\s+(?:after\s+deleting|for\s+deleted)\s+credit\s+purchase\s*#?\s*\d+/i.test(desc) ||
    /refund\s+(?:after\s+deleting|for\s+deleted)\s+credit\s+purchase\s*#?\s*\d+/i.test(name);

  // Pattern 2: Non-GST Expense deletion refund
  const isExpenseDeletionRefund =
    /expense\s+deleted\s*[-–—:]\s*amount\s+refunded/i.test(desc) ||
    /expense\s+deleted\s*#?\s*\d+/i.test(name) ||
    /refund\s+after\s+deleting\s+expense\s*#?\s*\d+/i.test(desc);

  return isCreditPurchaseRefund || isExpenseDeletionRefund;
};

export const purchaseMatchesDebit = (purchase, tx, branchId = "") => {
  const purchaseBranchId = String(purchase?.branch?.id || purchase?.branch_id || "");
  if (purchaseBranchId !== getTransactionBranchId(tx, branchId)) return false;

  // 1. Explicit GST purchase match
  const creditPurchaseId = getCreditPurchaseIdFromTransaction(tx);
  if (creditPurchaseId) {
    return String(purchase?.id || "") === creditPurchaseId;
  }

  // 2. Explicit Non-GST expense match
  const expenseId = getExpenseIdFromTransaction(tx);
  if (expenseId) {
    return String(purchase?.id || "") === expenseId;
  }

  // 3. Fallback matching by exact amount + transaction date
  if (getPurchaseAmount(purchase) !== Number(tx.amount)) return false;

  const transactionDate = moment(getTransactionDateValue(tx));
  return (
    transactionDate.isValid() &&
    getPurchaseDateValues(purchase).some((date) =>
      moment(date).isSame(transactionDate, "day")
    )
  );
};

/**
 * Checks if a transaction was linked to a specific purchase (GST or Non-GST)
 * that has been deleted from the database.
 */
export const isDeletedPurchaseTransaction = (
  tx,
  branchExpenses = [],
  branchCreditPurchases = []
) => {
  if (!tx || tx.transaction_type !== "debit") return false;

  // 1. Check if it references a GST Credit Purchase ID (#ID)
  const creditPurchaseId = getCreditPurchaseIdFromTransaction(tx);
  if (creditPurchaseId) {
    const existsInCreditPurchases = branchCreditPurchases.some(
      (cp) => String(cp?.id || "") === String(creditPurchaseId)
    );
    if (!existsInCreditPurchases) {
      return true; // The GST Credit Purchase was deleted
    }
  }

  // 2. Check if it references an Expense ID (#ID)
  const expenseId = getExpenseIdFromTransaction(tx);
  if (expenseId) {
    const existsInExpenses = branchExpenses.some(
      (exp) => String(exp?.id || "") === String(expenseId)
    );
    if (!existsInExpenses) {
      return true; // The Expense was deleted
    }
  }

  return false;
};

/**
 * Classifies a wallet debit transaction as either 'GST' or 'Non GST',
 * and returns matched purchase / expense reference data.
 */
export const getDebitInfo = (tx, branchExpenses = [], branchCreditPurchases = [], branchId = "") => {
  if (!tx || tx.transaction_type !== "debit") return null;

  const creditPurchaseId = getCreditPurchaseIdFromTransaction(tx);
  if (creditPurchaseId) {
    const cp = branchCreditPurchases.find((purchase) =>
      purchaseMatchesDebit(purchase, tx, branchId)
    );
    if (cp) return { type: "GST", data: cp };
    // If creditPurchaseId was present but not found in branchCreditPurchases, it is a deleted GST Purchase
    return { type: "GST_DELETED", data: null };
  }

  const expenseId = getExpenseIdFromTransaction(tx);
  if (expenseId) {
    const expense = branchExpenses.find((exp) =>
      purchaseMatchesDebit(exp, tx, branchId)
    );
    if (expense) return { type: "Non GST", data: expense };
    return { type: "NON_GST_DELETED", data: null };
  }

  const expense = branchExpenses.find((exp) =>
    purchaseMatchesDebit(exp, tx, branchId)
  );
  if (expense) return { type: "Non GST", data: expense };

  const cp = branchCreditPurchases.find((purchase) =>
    purchaseMatchesDebit(purchase, tx, branchId)
  );
  if (cp) return { type: "GST", data: cp };

  return { type: "Non GST", data: null };
};

export const getTransactionDisplayDescription = (
  tx,
  debitInfo = null,
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  const effectiveDebitInfo =
    debitInfo || getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
  const reference = effectiveDebitInfo?.data;
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

export const getEffectiveTransactionDateValue = (
  tx,
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  if (!tx) return null;

  let dateValue =
    tx.transaction_date ||
    tx.bill_date ||
    tx.actual_bill_date ||
    tx.payment_date;

  if (!dateValue && tx.transaction_type === "debit") {
    const debitInfo = getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
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

export const checkPeriodMatch = (dateValue, { periodType, filterValue, monthValue, yearValue, startDate, endDate }) => {
  if (!dateValue) return false;
  const txDate = new Date(dateValue);
  if (Number.isNaN(txDate.getTime())) return false;

  const txIsoDate = txDate.toISOString().split("T")[0];

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return txDate >= start && txDate <= end;
  }

  if (!periodType) return true;

  switch (periodType) {
    case "daily":
      return filterValue ? txIsoDate === filterValue : true;
    case "weekly": {
      if (!filterValue) return true;
      const selected = new Date(filterValue);
      const day = selected.getDay();
      const monday = new Date(selected);
      monday.setDate(selected.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return txDate >= monday && txDate <= sunday;
    }
    case "monthly": {
      const targetMonth = monthValue || filterValue;
      if (!targetMonth) return true;
      const txMonth = (txDate.getMonth() + 1).toString().padStart(2, "0");
      if (yearValue) {
        return txMonth === targetMonth && txDate.getFullYear().toString() === yearValue;
      }
      return txMonth === targetMonth;
    }
    case "quarterly": {
      if (!filterValue || !yearValue) return true;
      const yearNum = Number(yearValue);
      let start, end;
      if (filterValue === "Q1") {
        start = new Date(yearNum, 3, 1);
        end = new Date(yearNum, 5, 30, 23, 59, 59);
      } else if (filterValue === "Q2") {
        start = new Date(yearNum, 6, 1);
        end = new Date(yearNum, 8, 30, 23, 59, 59);
      } else if (filterValue === "Q3") {
        start = new Date(yearNum, 9, 1);
        end = new Date(yearNum, 11, 31, 23, 59, 59);
      } else if (filterValue === "Q4") {
        start = new Date(yearNum + 1, 0, 1);
        end = new Date(yearNum + 1, 2, 31, 23, 59, 59);
      }
      return txDate >= start && txDate <= end;
    }
    case "fy": {
      if (!filterValue) return true;
      const [startYear, endYear] = filterValue.split("-").map(Number);
      const fyStart = new Date(startYear, 3, 1);
      const fyEnd = new Date(endYear, 2, 31, 23, 59, 59, 999);
      return txDate >= fyStart && txDate <= fyEnd;
    }
    case "custom":
      if (!startDate || !endDate) return true;
      return txDate >= new Date(startDate) && txDate <= new Date(endDate);
    default:
      return true;
  }
};

export const getTimeValue = (value) => {
  const parsed = moment(value);
  return parsed.isValid() ? parsed.valueOf() : 0;
};

export const getLedgerDateValue = (tx) =>
  tx?.created_at || tx?.payment_date || tx?.transaction_date || tx?.updated_at || null;

export const getBusinessDayValue = (tx, branchExpenses = [], branchCreditPurchases = [], branchId = "") => {
  const parsed = moment(getEffectiveTransactionDateValue(tx, branchExpenses, branchCreditPurchases, branchId));
  return parsed.isValid() ? parsed.startOf("day").valueOf() : 0;
};

export const normalizeTransactionDescription = (description) =>
  String(description || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export const isLinkedCreditDebitPair = (
  a,
  b,
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  const creditTx = a.transaction_type === "credit" ? a : b;
  const debitTx = a.transaction_type === "debit" ? a : b;

  if (
    creditTx.transaction_type !== "credit" ||
    debitTx.transaction_type !== "debit"
  ) {
    return false;
  }

  const creditDescription = normalizeTransactionDescription(
    getTransactionDisplayDescription(creditTx, null, branchExpenses, branchCreditPurchases, branchId)
  );
  const debitDescription = normalizeTransactionDescription(
    getTransactionDisplayDescription(debitTx, null, branchExpenses, branchCreditPurchases, branchId)
  );

  return (
    getTransactionBranchId(creditTx, branchId) === getTransactionBranchId(debitTx, branchId) &&
    Number(creditTx.amount) === Number(debitTx.amount) &&
    getBusinessDayValue(creditTx, branchExpenses, branchCreditPurchases, branchId) ===
      getBusinessDayValue(debitTx, branchExpenses, branchCreditPurchases, branchId) &&
    creditDescription !== "" &&
    creditDescription === debitDescription
  );
};

/**
 * Chronological comparison function (ASCENDING - Oldest to Newest)
 * 1. Business Date ASC
 * 2. On same business date, Credit before Debit (unless paired)
 * 3. Ledger/Created Timestamp ASC
 * 4. Transaction ID ASC
 */
export const compareTransactionsChronologicalAsc = (
  a,
  b,
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  const businessDayDiff =
    getBusinessDayValue(a, branchExpenses, branchCreditPurchases, branchId) -
    getBusinessDayValue(b, branchExpenses, branchCreditPurchases, branchId);

  if (businessDayDiff !== 0) return businessDayDiff;

  if (isLinkedCreditDebitPair(a, b, branchExpenses, branchCreditPurchases, branchId)) {
    // In ASC order, credit comes before debit so credit funds the debit
    return a.transaction_type === "credit" ? -1 : 1;
  }

  const createdTimeDiff =
    getTimeValue(getLedgerDateValue(a)) -
    getTimeValue(getLedgerDateValue(b));

  if (createdTimeDiff !== 0) return createdTimeDiff;

  return Number(a.id || 0) - Number(b.id || 0);
};

/**
 * Calculates historical running balances for all transactions based on chronological
 * business date order, and attaches `historicalRunningBalance` to each transaction.
 *
 * @param {Array} allTransactions - Complete list of active transactions for the branch
 * @param {Array} branchExpenses - Expense references
 * @param {Array} branchCreditPurchases - Credit purchase references
 * @param {String|Number} branchId - Branch ID
 * @returns {Array} List of transactions chronologically ordered with historicalRunningBalance
 */
export const calculateHistoricalRunningBalances = (
  allTransactions = [],
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  if (!allTransactions || allTransactions.length === 0) return [];

  // Sort ALL transactions in chronological ASC order
  const chronologicalList = [...allTransactions].sort((a, b) =>
    compareTransactionsChronologicalAsc(a, b, branchExpenses, branchCreditPurchases, branchId)
  );

  let runningBalance = 0;

  return chronologicalList.map((tx) => {
    const amount = Number(tx.amount || 0);
    if (tx.transaction_type === "credit") {
      runningBalance += amount;
    } else if (tx.transaction_type === "debit") {
      runningBalance -= amount;
    }

    return {
      ...tx,
      historicalRunningBalance: runningBalance,
    };
  });
};

/**
 * Calculates the end-of-period boundary timestamp for a given filter.
 *
 * @param {Object} filterOptions - { periodType, filterValue, monthValue, yearValue, startDate, endDate }
 * @returns {number|null} Milliseconds timestamp of the end of the period (end-of-day), or null if unbounded
 */
export const getPeriodEndTimestamp = ({
  periodType,
  filterValue,
  monthValue,
  yearValue,
  startDate,
  endDate,
}) => {
  if (startDate && endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }

  if (!periodType) return null;

  switch (periodType) {
    case "daily": {
      if (!filterValue) return null;
      const d = new Date(filterValue);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    case "weekly": {
      if (!filterValue) return null;
      const selected = new Date(filterValue);
      const day = selected.getDay();
      const monday = new Date(selected);
      monday.setDate(selected.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return sunday.getTime();
    }
    case "monthly": {
      const targetMonth = monthValue || filterValue;
      const targetYear = yearValue || new Date().getFullYear().toString();
      if (!targetMonth) return null;
      const monthNum = Number(targetMonth); // 1-12
      const yearNum = Number(targetYear);
      // Last day of month: new Date(year, month, 0) gives last day of previous month param, so monthNum is 1-indexed
      const lastDay = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      return lastDay.getTime();
    }
    case "quarterly": {
      if (!filterValue || !yearValue) return null;
      const yearNum = Number(yearValue);
      let end;
      if (filterValue === "Q1") {
        end = new Date(yearNum, 5, 30, 23, 59, 59, 999);
      } else if (filterValue === "Q2") {
        end = new Date(yearNum, 8, 30, 23, 59, 59, 999);
      } else if (filterValue === "Q3") {
        end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
      } else if (filterValue === "Q4") {
        end = new Date(yearNum + 1, 2, 31, 23, 59, 59, 999);
      }
      return end ? end.getTime() : null;
    }
    case "fy": {
      if (!filterValue) return null;
      const [, endYear] = filterValue.split("-").map(Number);
      const fyEnd = new Date(endYear, 2, 31, 23, 59, 59, 999);
      return fyEnd.getTime();
    }
    case "custom": {
      if (!endDate) return null;
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    default:
      return null;
  }
};

/**
 * Returns the historical wallet balance and the latest applicable transaction record
 * up to the end of the selected period.
 *
 * @param {Array} allTransactions - All transactions for the branch
 * @param {Array} branchExpenses - Expense references
 * @param {Array} branchCreditPurchases - Credit purchase references
 * @param {String|Number} branchId - Branch ID
 * @param {Object} filterOptions - Period filter options
 * @returns {{ balance: number, transaction: Object|null }}
 */
export const getHistoricalBalanceForPeriod = (
  allTransactions = [],
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = "",
  filterOptions = {}
) => {
  if (!allTransactions || allTransactions.length === 0) {
    return { balance: 0, transaction: null };
  }

  // 1. Calculate historical running balances for the entire branch history
  const listWithBalances = calculateHistoricalRunningBalances(
    allTransactions,
    branchExpenses,
    branchCreditPurchases,
    branchId
  );

  // 2. Get period end timestamp
  const periodEndTimestamp = getPeriodEndTimestamp(filterOptions);

  // 3. If no period end boundary is specified (e.g. "All"), use the latest transaction in the list
  if (periodEndTimestamp === null) {
    const latestTx = listWithBalances[listWithBalances.length - 1];
    return {
      balance: latestTx ? Number(latestTx.historicalRunningBalance) : 0,
      transaction: latestTx || null,
    };
  }

  // 4. Filter all transactions whose effective business date is <= periodEndTimestamp
  const applicableTransactions = listWithBalances.filter((tx) => {
    const effectiveDate = getEffectiveTransactionDateValue(
      tx,
      branchExpenses,
      branchCreditPurchases,
      branchId
    );
    if (!effectiveDate) return false;
    const txTime = new Date(effectiveDate).getTime();
    return !Number.isNaN(txTime) && txTime <= periodEndTimestamp;
  });

  if (applicableTransactions.length === 0) {
    return { balance: 0, transaction: null };
  }

  // Since listWithBalances is in chronological ASC order, the last item in applicableTransactions
  // is the latest transaction on or before periodEndTimestamp
  const latestApplicableTx = applicableTransactions[applicableTransactions.length - 1];

  return {
    balance: Number(latestApplicableTx.historicalRunningBalance),
    transaction: latestApplicableTx,
  };
};

/**
 * Common helper to redirect to the representative wallet transactions page for a specific Site/Branch.
 * @param {string|number} targetBranchId - The branch/site ID
 * @param {Function} navigate - react-router navigate function
 * @param {Object} [options] - Optional toast / fallback config
 */
export const redirectToRepresentativeBranchWallet = async (
  targetBranchId,
  navigate,
  options = {}
) => {
  const { toastInstance = null, fallbackRoute = "/accounting/expenses" } = options;

  if (!targetBranchId || !navigate) {
    if (fallbackRoute && navigate) navigate(fallbackRoute);
    return;
  }

  try {
    const walletRes = await branchWalletService.getAllWallets();
    const allWallets = walletRes?.data || [];
    const representativeWallet = allWallets.find(
      (w) => String(w.branch_id) === String(targetBranchId)
    );

    if (representativeWallet) {
      // The transactions route is `/accounting/branch-wallets/:branchId/transactions`
      // where :branchId is the branch/site ID (w.branch_id), used by `branchWalletService.getBranchTransactions(branchId)`
      // and `branchService.getOne(branchId)`.
      navigate(`/accounting/branch-wallets/${representativeWallet.branch_id}/transactions`);
    } else {
      if (toastInstance?.warning) {
        toastInstance.warning("The selected site has no associated wallet yet.");
      }
      if (fallbackRoute) {
        navigate(fallbackRoute);
      }
    }
  } catch (error) {
    console.error("Failed to verify branch wallet for redirect:", error);
    if (fallbackRoute) {
      navigate(fallbackRoute);
    }
  }
};

/**
 * Delete a wallet transaction and its originating GST / Non-GST purchase/expense record
 * if one is linked to this transaction.
 *
 * @param {Object|string|number} txOrId - The wallet transaction object or transaction ID
 * @param {Array} [allTransactions=[]] - All current branch wallet transactions (if tx is just an ID)
 * @param {Array} [branchExpenses=[]] - Branch expenses list
 * @param {Array} [branchCreditPurchases=[]] - Branch credit purchases list
 * @param {string|number} [branchId=""] - Current branch ID
 */
export const deleteWalletTransactionAndOrigin = async (
  txOrId,
  allTransactions = [],
  branchExpenses = [],
  branchCreditPurchases = [],
  branchId = ""
) => {
  let tx = typeof txOrId === "object" && txOrId !== null ? txOrId : null;
  const txId = tx ? tx.id : txOrId;

  if (!tx && allTransactions.length > 0) {
    tx = allTransactions.find((item) => String(item.id) === String(txId)) || null;
  }

  // 1. Identify origin purchase/expense if this is a debit transaction
  let originType = null;
  let originId = null;

  if (tx && tx.transaction_type === "debit") {
    const desc = String(tx.description || "").toLowerCase();
    const isRefundOrReversal = desc.includes("refund") || desc.includes("reversal");

    if (!isRefundOrReversal) {
      const debitInfo = getDebitInfo(tx, branchExpenses, branchCreditPurchases, branchId);
      if (debitInfo?.data?.id) {
        originType = debitInfo.type; // 'GST' or 'Non GST'
        originId = debitInfo.data.id;
      }
    }
  }

  // 2. If this transaction is linked to a GST or Non-GST purchase:
  // Step A: Delete the origin purchase from the backend (so it disappears from Expenses)
  if (originId) {
    try {
      if (originType === "GST") {
        await expenseService.deleteCreditPurchase(originId);
      } else if (originType === "Non GST") {
        await expenseService.deleteExpense(originId);
      }
    } catch (originError) {
      console.warn(`[Delete Origin] Failed or already deleted origin ${originType} #${originId}:`, originError);
    }
  }

  // Step B: Delete the original wallet transaction from the ledger
  const deleteTxRes = await branchWalletService.deleteWallet(txId);

  // Step C: If the backend's purchase deletion created a visible refund/reversal entry,
  // clean up that refund transaction so no extra "Refund after..." or "Expense deleted..." row is left in the ledger.
  try {
    const targetBranchId = tx?.branch_id || branchId;
    if (originId && targetBranchId) {
      const latestTxRes = await branchWalletService.getBranchTransactions(targetBranchId);
      const latestList = latestTxRes?.data || [];

      // Find any newly created refund transaction referencing this specific purchase or expense
      const matchingRefundTx = latestList.find((item) => {
        const itemDesc = String(item.description || "").toLowerCase();
        if (!itemDesc.includes("refund") && !itemDesc.includes("reversal") && !itemDesc.includes("expense deleted")) {
          return false;
        }
        if (originType === "GST" && (itemDesc.includes(String(originId)) || String(item.credit_purchase_id || item.purchase_id || "") === String(originId))) {
          return true;
        }
        if (originType === "Non GST" && (itemDesc.includes(String(originId)) || itemDesc.includes("expense deleted"))) {
          return true;
        }
        return false;
      });

      if (matchingRefundTx?.id) {
        await branchWalletService.deleteWallet(matchingRefundTx.id);
      }
    }
  } catch (cleanError) {
    console.warn("[Clean Refund Row] Warning while cleaning refund row:", cleanError);
  }

  return deleteTxRes;
};
