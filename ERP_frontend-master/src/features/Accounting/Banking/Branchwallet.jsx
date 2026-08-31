import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col,OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import branchwalletService from "../../../services/branchwalletService";
import branchService from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import { Plus } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import Select from "react-select";
import expenseService from "../../../services/expensessService";
import moment from "moment";
import {
  getDebitInfo,
  getEffectiveTransactionDateValue,
  checkPeriodMatch,
  isPurchaseDeletionRefundTransaction,
  isDeletedPurchaseTransaction,
} from "./walletAccountingHelpers";

const BranchWallet = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [wallets, setWallets] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [searchBranch, setSearchBranch] = useState("");
  const [totalCredit, setTotalCredit] = useState(0); 
  const [loading, setLoading] = useState(false);

  const getTodayDateString = () => moment().format("YYYY-MM-DD");

  const [formData, setFormData] = useState({
    branch_id: "",
    transaction_type: "credit",
    amount: "",
    description: "",
    transaction_date: getTodayDateString(),
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [branchExpenses, setBranchExpenses] = useState([]);
  const [branchCreditPurchases, setBranchCreditPurchases] = useState([]);
  const [allWalletTransactions, setAllWalletTransactions] = useState([]);
  const [periodType, setPeriodType] = useState("monthly"); // daily, weekly, monthly, fy, custom
  const [filterValue, setFilterValue] = useState("");
  const [monthValue, setMonthValue] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [yearValue, setYearValue] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getWalletDateValue = (tx) =>
    tx?.transaction_date || tx?.created_at || tx?.updated_at || tx?.payment_date || tx?.date || null;

  const getWalletTimeValue = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const getLatestTransactionsByBranch = (transactions) =>
    Object.values(
      (transactions || []).reduce((acc, tx) => {
        const branchKey = tx.branch_id;
        const currentTime = getWalletTimeValue(tx.created_at || getWalletDateValue(tx));
        const previousTime = getWalletTimeValue(
          acc[branchKey]?.created_at || getWalletDateValue(acc[branchKey])
        );

        if (
          !acc[branchKey] ||
          currentTime > previousTime ||
          (currentTime === previousTime && Number(tx.id || 0) > Number(acc[branchKey]?.id || 0))
        ) {
          acc[branchKey] = tx;
        }
        return acc;
      }, {})
    ).sort(
      (a, b) =>
        getWalletTimeValue(b.created_at || getWalletDateValue(b)) -
          getWalletTimeValue(a.created_at || getWalletDateValue(a)) ||
        Number(b.id || 0) - Number(a.id || 0)
    );


  // ✅ Fetch branch wallets
  const fetchWallets = async () => {
    try {
      const data = await branchwalletService.getAllWallets();
      const allWallets = data?.data || [];

      // Get latest transaction per branch
      const latestPerBranch = getLatestTransactionsByBranch(allWallets);

      // ✅ Sort by updated_at descending (newest first)
      setWallets(latestPerBranch);
      setFilteredWallets(latestPerBranch);
      setAllWalletTransactions(allWallets);

      // ✅ Calculate Total Credit (Sum of all branch balances)
      const total = latestPerBranch.reduce(
        (sum, w) => sum + Number(w.balance_after || 0),
        0
      );
      setTotalCredit(total);

    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  // ✅ Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data?.data || data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  const fetchBranchExpenses = async () => {
  try {
    const res = await expenseService.getAllExpenses(); // calls your API
    setBranchExpenses(res?.data || []); // save all expenses in state

    const resCP = await expenseService.getAllCreditPurchases();
    setBranchCreditPurchases(resCP?.data || []);
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
};
  useEffect(() => {
    fetchWallets();
    fetchBranches();
    fetchBranchExpenses();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (periodType === "daily" || periodType === "weekly") {
      setFilterValue(today);
    }
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseWalletDate = (tx) => {
    const dateValue = getWalletDateValue(tx);
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const filterWalletCredits = (transactions) => {
    if (!transactions || transactions.length === 0) return [];

    return transactions.filter((tx) => {
      if (tx.transaction_type !== "credit") return false;
      const txDate = parseWalletDate(tx);
      if (!txDate) return false;

      if (!periodType) return true;

      switch (periodType) {
        case "daily":
          return filterValue ? txDate.toISOString().split("T")[0] === filterValue : true;
        case "weekly": {
          const selected = filterValue ? new Date(filterValue) : new Date();
          const day = selected.getDay();
          const monday = new Date(selected);
          monday.setDate(selected.getDate() - ((day + 6) % 7));
          monday.setHours(0, 0, 0, 0);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);
          return txDate >= monday && txDate <= sunday;
        }
        case "monthly":
          if (!monthValue || !yearValue) return true;
          return (
            (txDate.getMonth() + 1).toString().padStart(2, "0") === monthValue &&
            txDate.getFullYear().toString() === yearValue
          );
        case "fy": {
          if (!filterValue) return true;
          const [startYear, endYear] = filterValue.split("-").map(Number);
          const fyStart = new Date(startYear, 3, 1);
          const fyEnd = new Date(endYear, 2, 31, 23, 59, 59, 999);
          return txDate >= fyStart && txDate <= fyEnd;
        }
        case "quarterly": {
          if (!filterValue || !yearValue) return true;
          const year = Number(yearValue);
          let start, end;
          if (filterValue === "Q1") { start = new Date(year, 3, 1); end = new Date(year, 5, 30, 23, 59, 59); }
          else if (filterValue === "Q2") { start = new Date(year, 6, 1); end = new Date(year, 8, 30, 23, 59, 59); }
          else if (filterValue === "Q3") { start = new Date(year, 9, 1); end = new Date(year, 11, 31, 23, 59, 59); }
          else if (filterValue === "Q4") { start = new Date(year + 1, 0, 1); end = new Date(year + 1, 2, 31, 23, 59, 59); }
          return txDate >= start && txDate <= end;
        }
        case "custom":
          if (!startDate || !endDate) return true;
          return txDate >= new Date(startDate) && txDate <= new Date(endDate);
        default:
          return true;
      }
    });
  };

  const getBranchTransactionsForPeriod = (branchId) => {
    return allWalletTransactions.filter((tx) => {
      if (Number(tx.branch_id) !== Number(branchId)) return false;
      if (isPurchaseDeletionRefundTransaction(tx)) return false;
      if (isDeletedPurchaseTransaction(tx, branchExpenses, branchCreditPurchases)) return false;
      const effectiveDate = getEffectiveTransactionDateValue(
        tx,
        branchExpenses,
        branchCreditPurchases,
        branchId
      );
      return checkPeriodMatch(effectiveDate, {
        periodType,
        filterValue: filterValue || monthValue,
        monthValue,
        yearValue,
        startDate,
        endDate,
      });
    });
  };

  const getBranchCreditAmount = (branchId) => {
    return getBranchTransactionsForPeriod(branchId)
      .filter((tx) => tx.transaction_type === "credit")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  };

  const calculateBranchExpenses = (branchId) => {
    const branchTxs = getBranchTransactionsForPeriod(branchId);
    let nonGstSum = 0;
    let gstSum = 0;

    branchTxs.forEach((tx) => {
      if (tx.transaction_type === "debit") {
        const debitInfo = getDebitInfo(
          tx,
          branchExpenses,
          branchCreditPurchases,
          branchId
        );
        if (debitInfo?.type === "GST") {
          gstSum += Number(tx.amount || 0);
        } else {
          // Default all other wallet debits to Non-GST
          nonGstSum += Number(tx.amount || 0);
        }
      }
    });

    return { nonGst: nonGstSum, gst: gstSum };
  };

const handleSave = async () => {
  if (!formData.branch_id || !formData.amount) {
    setErrorMessage("Please fill all required fields");
    return;
  }

  // Duplicate check
  const normalizeDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  const formDateNorm = normalizeDate(formData.transaction_date || getTodayDateString());

  const isDuplicate = allWalletTransactions.some((tx) => {
    const txDateNorm = normalizeDate(tx.transaction_date || tx.created_at);
    return (
      tx.transaction_type === "credit" &&
      txDateNorm === formDateNorm &&
      Math.abs(Number(tx.amount) - Number(formData.amount)) < 0.01 &&
      Number(tx.branch_id) === Number(formData.branch_id)
    );
  });

  if (isDuplicate) {
    const confirmProceed = window.confirm(
      "A wallet entry with the same date and amount already exists for this site. Do you still want to add it?"
    );
    if (!confirmProceed) return;
  }

  try {
    setErrorMessage("");
    setLoading(true); // ✅ start loader

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      description: formData.description?.trim() || "",
      transaction_date: formData.transaction_date || getTodayDateString(),
    };

    await branchwalletService.createWallet(payload);
    toast.success("Wallet created successfully.", { icon: false });
    fetchWallets();
    setShowModal(false);

    setFormData({
      branch_id: "",
      transaction_type: "credit",
      amount: "",
      description: "",
      transaction_date: getTodayDateString(),
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    toast.error("Failed to create wallet.");
  } finally {
    setLoading(false); // ✅ stop loader
  }
};

const handleDeleteWallet = async (walletId) => {
  const confirmed = window.confirm("Are you sure you want to delete this wallet entry?");
  if (!confirmed) return;

  try {
    setLoading(true);
    await branchwalletService.deleteWallet(walletId);
    toast.success("Wallet entry deleted successfully.", { icon: false });
    fetchWallets();
  } catch (error) {
    console.error("Error deleting wallet:", error);
    toast.error("Failed to delete wallet entry.");
  } finally {
    setLoading(false);
  }
};


  // ✅ Search logic (live filter)
  useEffect(() => {
    if (!searchBranch) {
      setFilteredWallets(wallets);
    } else {
      const filtered = wallets.filter((w) =>
  !searchBranch ? true : w.branch_id === Number(searchBranch)
);
      setFilteredWallets(filtered);
    }
    setCurrentPage(1);
  }, [searchBranch, wallets]);

  // ✅ Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentWallets = filteredWallets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredWallets.length / entriesPerPage);
  const visibleBranchIds = new Set(filteredWallets.map((wallet) => Number(wallet.branch_id)));
  const latestVisibleWallets = getLatestTransactionsByBranch(
    allWalletTransactions.filter((tx) => visibleBranchIds.has(Number(tx.branch_id)))
  );
  const displayCurrentBalance =
    latestVisibleWallets.length > 0
      ? latestVisibleWallets.reduce((sum, tx) => sum + Number(tx.balance_after || 0), 0)
      : totalCredit;

  const getBranchCurrentBalance = (branchId, fallbackBalance) => {
    const latest = getLatestTransactionsByBranch(
      allWalletTransactions.filter(
        (tx) => Number(tx.branch_id) === Number(branchId)
      )
    )[0];

    return latest ? Number(latest.balance_after || 0) : Number(fallbackBalance || 0);
  };

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="fw-semibold mb-1">Site Wallets</h4>
          <BreadCrumb pathname="/accounting/branch-wallets" lastLabel="Branch Wallets" />
        </div>
        <div>
          <OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-add-wallet">Add new site wallet</Tooltip>}
>
  <Button
    size="sm"
    className="fw-semibold text-white px-2"
    variant="success"
    onClick={() => {
      setFormData({
        branch_id: "",
        transaction_type: "credit",
        amount: "",
        description: "",
        transaction_date: getTodayDateString(),
      });
      setErrorMessage("");
      setShowModal(true);
    }}
  >
    + Add Wallet
    {/* <i class="bi bi-plus me-1"></i> */}
  </Button>
</OverlayTrigger>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-fund-requests">View all fund requests</Tooltip>}
>
  <Button
    variant="info"
    size="sm"
    className="fw-semibold text-white px-2"
    onClick={() => navigate("/fund-requests")}
  >
    View Fund Requests
    {/* <i class="bi bi-cash-stack"></i> */}
  </Button>
</OverlayTrigger>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-transfers">View all transfer history</Tooltip>}
>
  <Button
    variant="danger"
    size="sm"
    className="fw-semibold text-white px-2"
    onClick={() => navigate("/accounting/branch-wallets/transactions")}
  >
    View All Transfers
    {/* <i className="bi bi-receipt"></i> */}
  </Button>
</OverlayTrigger>
        </div>
      </div>

      {/* ✅ TOTAL CREDIT SECTION */}
      <div
        className="d-flex justify-content-between align-items-center p-4 rounded shadow-sm my-4"
        style={{ backgroundColor: "#dafddeff", border: "1px solid #ecffe6ff" }}
      >
        <div>
          <h3 className="fw-bold text-success mb-1">
            ₹{displayCurrentBalance.toLocaleString("en-IN")}
          </h3>
          <small className="text-muted">Current Balance (Visible Sites)</small>
        </div>
      </div>

      {/* Wallets Table with Pagination */}
      <div className="card p-4 shadow-sm mt-3">
        {/* Search + Entries */}
        <Row className="align-items-end justify-content-between g-3 mb-4 pb-2">
          <Col md={1} className="text-end">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Select
              name="searchBranch"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              value={
                searchBranch
                  ? { value: searchBranch, label: branches.find(b => b.id === Number(searchBranch))?.name }
                  : null
              }
              onChange={(selected) => setSearchBranch(selected?.value || "")}
              placeholder="Search site..."
              isClearable
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
                  boxShadow: state.isFocused ? `0 0 0 0.1px var(--bs-success)` : provided.boxShadow,
                  "&:hover": {
                    borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
                  },
                }),
              }}
            />
          </Col>
          <Col md={7}>
            <div className="d-flex justify-content-md-end align-items-end flex-wrap gap-3">
              <Form.Group className="mb-0" style={{ minWidth: "180px" }}>
                <Form.Label className="fw-semibold">Credit Period</Form.Label>
                <Form.Select
                  value={periodType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPeriodType(value);
                    setFilterValue(value === "daily" || value === "weekly" ? new Date().toISOString().split("T")[0] : "");
                    setMonthValue(value === "monthly" ? (new Date().getMonth() + 1).toString().padStart(2, "0") : "");
                    setYearValue(new Date().getFullYear().toString());
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  <option value="">All Credits</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="fy">Financial Year</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
              </Form.Group>

              {(periodType === "daily" || periodType === "weekly") && (
                <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                  <Form.Label className="fw-semibold">
                    {periodType === "weekly" ? "Select Week" : "Select Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </Form.Group>
              )}

              {periodType === "monthly" && (
                <>
                  <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                    <Form.Label className="fw-semibold">Select Month</Form.Label>
                    <Form.Select
                      value={monthValue}
                      onChange={(e) => setMonthValue(e.target.value)}
                    >
                      <option value="">Select month</option>
                      <option value="01">January</option>
                      <option value="02">February</option>
                      <option value="03">March</option>
                      <option value="04">April</option>
                      <option value="05">May</option>
                      <option value="06">June</option>
                      <option value="07">July</option>
                      <option value="08">August</option>
                      <option value="09">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-0" style={{ minWidth: "180px" }}>
                    <Form.Label className="fw-semibold">Select Year</Form.Label>
                    <Form.Select
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {periodType === "quarterly" && (
                <>
                  <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                    <Form.Label className="fw-semibold">Select Quarter</Form.Label>
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
                  </Form.Group>
                  <Form.Group className="mb-0" style={{ minWidth: "180px" }}>
                    <Form.Label className="fw-semibold">Select Year</Form.Label>
                    <Form.Select
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {periodType === "fy" && (
                <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                  <Form.Label className="fw-semibold">Financial Year</Form.Label>
                  <Form.Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">Select F.Y.</option>
                    <option value="2023-2024">Apr 2023 - Mar 2024</option>
                    <option value="2024-2025">Apr 2024 - Mar 2025</option>
                    <option value="2025-2026">Apr 2025 - Mar 2026</option>
                  </Form.Select>
                </Form.Group>
              )}

              {periodType === "custom" && (
                <>
                  <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                    <Form.Label className="fw-semibold">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-0" style={{ minWidth: "220px" }}>
                    <Form.Label className="fw-semibold">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </>
              )}

              {/* <div className="text-muted small align-self-end mb-2 ms-md-2">
                {periodType ? "Showing filtered credit totals" : "Showing all credit totals"}
              </div> */}
            </div>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table hover striped className="text-center">
            {/* <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Current Balance</th>
                <th>Total Expenses (₹)</th>
                <th>Actions</th>
              </tr>
            </thead> */}
            <thead className="table-light">
  <tr>
    <th>#</th>
    <th>Site Name</th>
    <th>Credited Amount (₹)</th>
    <th>Non GST Purchase (₹)</th>
    <th>GST Purchase (₹)</th>
    <th>Current Balance (₹)</th>
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {currentWallets.length > 0 ? (
    currentWallets.map((wallet, index) => {
      const expensesData = calculateBranchExpenses(wallet.branch_id);
      return (
      <tr key={wallet.id}>
        <td>{indexOfFirst + index + 1}</td>
        <td style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/accounting/branch-wallets/${wallet.branch_id}/transactions`)
          }
        >
          {wallet.Branch?.name || `Branch ${wallet.branch_id}`}
        </td>
        <td className="fw-bold text-success">
          ₹{getBranchCreditAmount(wallet.branch_id).toLocaleString("en-IN")}
        </td>
        <td className="fw-bold">
          ₹{expensesData.nonGst.toLocaleString("en-IN")}
        </td>
        <td className="fw-bold">
          ₹{expensesData.gst.toLocaleString("en-IN")}
        </td>
        <td className="fw-bold">₹{getBranchCurrentBalance(wallet.branch_id, wallet.balance_after).toLocaleString("en-IN")}</td>
        <td>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-view-${wallet.branch_id}`}>View site transactions</Tooltip>}
          >
            <Button
              size="sm"
              variant="warning"
              onClick={() =>
                navigate(`/accounting/branch-wallets/${wallet.branch_id}/transactions`)
              }
            >
              <i className="bi bi-eye"></i>
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    )})
  ) : (
    <tr>
      <td colSpan="7" className="text-center text-muted py-3">
        No site wallets found.
      </td>
    </tr>
  )}
</tbody>

          </Table>
        </div>
<div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
  <p className="mb-0 small text-muted">
    Showing {filteredWallets.length ? indexOfFirst + 1 : 0} to{" "}
    {Math.min(indexOfLast, filteredWallets.length)} of {filteredWallets.length} entries
  </p>

 <ul className="pagination pagination-sm mb-0" style={{ gap: "0", justifyContent: "end", alignItems:'center' }}>
    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
        &laquo;
      </button>
    </li>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
        <button className="page-link" onClick={() => setCurrentPage(page)}>
          {page}
        </button>
      </li>
    ))}
    <li
      className={`page-item ${
        currentPage === totalPages || totalPages === 0 ? "disabled" : ""
      }`}
    >
      <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
        &raquo;
      </button>
    </li>
  </ul>
</div>

      </div>

      {/* Modal for creating wallet */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add Wallet</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            {errorMessage && (
              <div
                className="p-2 mb-3 rounded"
                style={{
                  backgroundColor: "#ffe6eb",
                  color: "#b30000",
                  border: "1px solid #ffb3b3",
                  textAlign: "start",
                }}
              >
                {errorMessage}
              </div>
            )}
            <Form>
            <Form.Group controlId="branch_id" className="mb-3">
              <Form.Label>Site <span className="text-danger">*</span></Form.Label>
              <Select
                name="branch_id"
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={
                  formData.branch_id
                    ? { value: formData.branch_id, label: branches.find(b => b.id === Number(formData.branch_id))?.name }
                    : null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, branch_id: selected?.value || "" }))
                }
                placeholder="Select or type site name..."
                isClearable
                styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
                      boxShadow: state.isFocused ? `0 0 0 0.1px var(--bs-success)` : provided.boxShadow,
                      "&:hover": {
                        borderColor: state.isFocused ? "var(--bs-success)" : provided.borderColor,
                      },
                    }),
                  }}
              />
              <div className="mt-2">
                        <small>
                          Don’t see your site?{" "}
                          <span
                            className="text-success"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/hrmsystemsetup/branch")}
                          >
                            Create Site
                          </span>
                        </small>
                      </div>
            </Form.Group>

            <Form.Group controlId="amount" className="mb-3">
              <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="transaction_date" className="mb-3">
              <Form.Label>Transaction Date</Form.Label>
              <Form.Control
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
              />
              <div className="form-text">
                Display format: {formData.transaction_date ? moment(formData.transaction_date).format("DD-MM-YYYY") : "DD-MM-YYYY"}
              </div>
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-cancel">Cancel and close</Tooltip>}
>
  <Button variant="secondary" onClick={() => setShowModal(false)}>
    Cancel
  </Button>
</OverlayTrigger>

<OverlayTrigger
  placement="top"
  overlay={<Tooltip id="tooltip-save">Save wallet details</Tooltip>}
>
  <Button variant="success" onClick={handleSave} disabled={loading}>
    {loading ? (
      <>
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        Please wait...
      </>
    ) : (
      "Add to Wallet"
    )}
  </Button>
</OverlayTrigger>

        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BranchWallet;
