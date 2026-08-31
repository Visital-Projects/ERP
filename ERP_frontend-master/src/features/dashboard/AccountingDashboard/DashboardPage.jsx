import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Form } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import expenseService from "../../../services/expensessService";
import dayjs from "dayjs";
import purchaseService from "../../../services/purchaseService";
import branchService from "../../../services/branchService";
import { getEmployees } from "../../../services/hrmService";
import salebillService from "../../../services/salebillService";
import MonthlyExpenseTrend from "./MonthlyExpenseTrend";
import DashboardSummary from "./DashboardTopRow";
import LatestExpense from "./LatestExpense";
import LatestIncome from "./LatestIncome";
import CombinedInvoiceDashboard from "./CombinedInvoiceDashboard";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [saleBills, setSaleBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [periodType, setPeriodType] = useState("daily");
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [periodYear, setPeriodYear] = useState(
    new Date().getFullYear().toString()
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedGraphYear, setSelectedGraphYear] = useState(
    new Date().getFullYear().toString()
  );

  const isBranchManager =
    user?.type === "Branch Manager" || user?.type === "Branch Manager ";

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getBranchId = (item) =>
    item?.branch_id ||
    item?.branch?.id ||
    item?.assigned_to ||
    item?.site?.id ||
    item?.Branch?.id;

  const getExpenseDate = (item) => item?.payment_date || item?.actual_bill_date || item?.created_at;
  const getSaleBillDate = (item) => item?.invoice_date || item?.created_at;
  const getPurchaseDate = (item) => item?.purchase_date || item?.created_at || item?.date;
  const getSaleBillAmount = (bill) =>
    Number(
      bill?.services?.reduce((sum, service) => {
        const total = Number(service?.total_amount != null ? service.total_amount : 0);
        const fallback = Number(service?.rate || 0) * Number(service?.quantity || 0);
        return sum + (total || fallback);
      }, 0) || 0
    );

  const parseDate = (value) => {
    if (!value) return null;
    const stringValue = String(value).trim();
    const parsed = dayjs(stringValue);
    if (parsed.isValid()) return parsed;

    const datePart = stringValue.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split("-").map(Number);
      const normalized = dayjs(new Date(year, month - 1, day));
      return normalized.isValid() ? normalized : null;
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
      const [day, month, year] = datePart.split("-").map(Number);
      const normalized = dayjs(new Date(year, month - 1, day));
      return normalized.isValid() ? normalized : null;
    }

    return null;
  };

  const isSameDate = (value, compareDate) => {
    const parsedValue = parseDate(value);
    return parsedValue && compareDate
      ? parsedValue.format("YYYY-MM-DD") === compareDate
      : false;
  };

  const isSameMonth = (value, compareMonth) => {
    const parsedValue = parseDate(value);
    return parsedValue && compareMonth
      ? parsedValue.format("YYYY-MM") === compareMonth
      : false;
  };

  const getWeekRange = (value) => {
    const parsedValue = parseDate(value);
    if (!parsedValue) return { start: null, end: null };
    const jsDate = parsedValue.toDate();
    const day = jsDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = dayjs(jsDate).add(diffToMonday, "day").startOf("day");
    const end = start.add(6, "day").endOf("day");
    return { start, end };
  };

  const matchesPeriod = (value) => {
    const parsedValue = parseDate(value);
    if (!parsedValue) return false;

    switch (periodType) {
      case "daily":
        return parsedValue.format("YYYY-MM-DD") === filterDate;
      case "weekly": {
        const { start, end } = getWeekRange(filterDate);
        return start && end
          ? parsedValue.isAfter(start.subtract(1, "millisecond")) &&
              parsedValue.isBefore(end.add(1, "millisecond"))
          : true;
      }
      case "monthly":
        return parsedValue.format("YYYY-MM") === selectedMonth;
      case "yearly":
        return parsedValue.format("YYYY") === periodYear;
      case "custom":
        if (!startDate || !endDate) return true;
        return (
          parsedValue.isAfter(dayjs(startDate).startOf("day").subtract(1, "millisecond")) &&
          parsedValue.isBefore(dayjs(endDate).endOf("day").add(1, "millisecond"))
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [expenseRes, branchRes, employeeRes, purchaseRes, saleBillRes] =
          await Promise.all([
            expenseService.getAllExpenses(),
            branchService.getAll(),
            getEmployees(),
            purchaseService.getAllPurchases(),
            salebillService.getAllSaleBills(),
          ]);

        setExpenses(expenseRes?.data || []);
        setBranches(branchRes || []);
        setEmployees(employeeRes || []);
        setPurchaseOrders(purchaseRes?.data || []);
        setSaleBills(saleBillRes?.data || saleBillRes || []);
      } catch (err) {
        console.error("Error fetching accounting dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (periodType === "daily" || periodType === "weekly") {
      if (!filterDate) setFilterDate(dayjs().format("YYYY-MM-DD"));
    }

    if (periodType === "monthly") {
      if (!selectedMonth) setSelectedMonth(dayjs().format("YYYY-MM"));
    }

    if (periodType === "yearly") {
      if (!periodYear) setPeriodYear(new Date().getFullYear().toString());
    }

    if (periodType !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  }, [periodType, filterDate, selectedMonth, periodYear]);

  const branchMap = useMemo(() => {
    const map = {};
    branches.forEach((branch) => {
      map[branch.id] = branch.name;
    });
    return map;
  }, [branches]);

  const baseDate =
    periodType === "custom"
      ? startDate || dayjs().format("YYYY-MM-DD")
      : filterDate || dayjs().format("YYYY-MM-DD");
  const baseMonth =
    periodType === "monthly"
      ? selectedMonth
      : dayjs(baseDate).format("YYYY-MM");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesBranch =
        !selectedBranch || String(getBranchId(expense) || "") === String(selectedBranch);
      const matchesDate = matchesPeriod(getExpenseDate(expense));
      return matchesBranch && matchesDate;
    });
  }, [expenses, selectedBranch, periodType, filterDate, selectedMonth, periodYear, startDate, endDate]);

  const filteredSaleBills = useMemo(() => {
    return saleBills.filter((bill) => {
      const matchesBranch =
        !selectedBranch || String(getBranchId(bill) || "") === String(selectedBranch);
      const matchesDate = matchesPeriod(getSaleBillDate(bill));
      return matchesBranch && matchesDate;
    });
  }, [saleBills, selectedBranch, periodType, filterDate, selectedMonth, periodYear, startDate, endDate]);

  const siteFilteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      return !selectedBranch || String(getBranchId(expense) || "") === String(selectedBranch);
    });
  }, [expenses, selectedBranch]);

  const siteFilteredSaleBills = useMemo(() => {
    return saleBills.filter((bill) => {
      return !selectedBranch || String(getBranchId(bill) || "") === String(selectedBranch);
    });
  }, [saleBills, selectedBranch]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      return !selectedBranch || String(getBranchId(employee) || "") === String(selectedBranch);
    });
  }, [employees, selectedBranch]);

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((purchase) => {
      const matchesBranch =
        !selectedBranch || String(getBranchId(purchase) || "") === String(selectedBranch);
      const matchesDate = matchesPeriod(getPurchaseDate(purchase));
      return matchesBranch && matchesDate;
    });
  }, [purchaseOrders, selectedBranch, periodType, filterDate, selectedMonth, periodYear, startDate, endDate]);

  const expenseSummary = useMemo(() => {
    const today = siteFilteredExpenses
      .filter((expense) => isSameDate(getExpenseDate(expense), baseDate))
      .reduce((sum, expense) => sum + Number(expense.total_amount || 0), 0);

    const month = siteFilteredExpenses
      .filter((expense) => isSameMonth(getExpenseDate(expense), baseMonth))
      .reduce((sum, expense) => sum + Number(expense.total_amount || 0), 0);

    const total = filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.total_amount || 0),
      0
    );

    return { today, month, total };
  }, [filteredExpenses, siteFilteredExpenses, baseDate, baseMonth]);

  const incomeSummary = useMemo(() => {
    const today = siteFilteredSaleBills
      .filter((bill) => isSameDate(getSaleBillDate(bill), baseDate))
      .reduce((sum, bill) => sum + getSaleBillAmount(bill), 0);

    const month = siteFilteredSaleBills
      .filter((bill) => isSameMonth(getSaleBillDate(bill), baseMonth))
      .reduce((sum, bill) => sum + getSaleBillAmount(bill), 0);

    const total = filteredSaleBills.reduce(
      (sum, bill) => sum + getSaleBillAmount(bill),
      0
    );

    return { today, month, total };
  }, [filteredSaleBills, siteFilteredSaleBills, baseDate, baseMonth]);

  const totalVendors = useMemo(() => {
    const vendorSet = new Set(
      filteredPurchaseOrders
        .map((purchase) => purchase.vendor_name)
        .filter(Boolean)
    );
    return vendorSet.size;
  }, [filteredPurchaseOrders]);

  const totalBranchesCount = selectedBranch ? 1 : branches.length;
  const totalEmployees = filteredEmployees.length;
  const totalInvoiceAmount = incomeSummary.total;

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([currentYear.toString()]);
    [...saleBills, ...expenses].forEach((item) => {
      const dateValue = item?.invoice_date || item?.payment_date || item?.actual_bill_date || item?.created_at;
      if (!dateValue) return;
      const parsedValue = parseDate(dateValue);
      if (parsedValue?.isValid()) {
        years.add(parsedValue.format("YYYY"));
        return;
      }
      const match = String(dateValue).match(/\b(20\d{2})\b/);
      if (match?.[1]) years.add(match[1]);
    });
    // Keep previous years available even if current dataset only returns one year.
    for (let year = currentYear - 5; year <= currentYear; year += 1) {
      years.add(year.toString());
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [saleBills, expenses]);

  useEffect(() => {
    if (!availableYears.includes(selectedGraphYear) && availableYears.length > 0) {
      setSelectedGraphYear(availableYears[0]);
    }
    if (!availableYears.includes(periodYear) && availableYears.length > 0) {
      setPeriodYear(availableYears[0]);
    }
  }, [availableYears, selectedGraphYear, periodYear]);

  const monthlyGraphData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthLabel = dayjs().month(index).format("MMM");
      const income = siteFilteredSaleBills
        .filter((bill) => {
          const dateValue = parseDate(getSaleBillDate(bill));
          return (
            dateValue &&
            dateValue.format("YYYY") === selectedGraphYear &&
            dateValue.month() === index
          );
        })
        .reduce((sum, bill) => sum + getSaleBillAmount(bill), 0);

      const expense = siteFilteredExpenses
        .filter((item) => {
          const dateValue = parseDate(getExpenseDate(item));
          return (
            dateValue &&
            dateValue.format("YYYY") === selectedGraphYear &&
            dateValue.month() === index
          );
        })
        .reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

      return {
        month: monthLabel,
        income,
        expense,
      };
    });
  }, [siteFilteredSaleBills, siteFilteredExpenses, selectedGraphYear]);

  const latestSaleBills = useMemo(() => {
    return [...filteredSaleBills]
      .sort((a, b) => new Date(getSaleBillDate(b)) - new Date(getSaleBillDate(a)))
      .slice(0, 5);
  }, [filteredSaleBills]);

  const latestExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(getExpenseDate(b)) - new Date(getExpenseDate(a)))
      .slice(0, 5);
  }, [filteredExpenses]);

  return (
    <div className="container-fluid py-4">
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <h2 className="fw-bold">Accounting Dashboard</h2>
          <small className="text-muted">Dashboard </small>
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-end" style={{ minWidth: "320px" }}>
          <Form.Group>
            <Form.Label className="fw-semibold mb-1" style={{ minWidth: "300px" }}>Select Site</Form.Label>
            <Form.Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Sites</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold mb-1" style={{ minWidth: "150px" }}>Select Period</Form.Label>
            <Form.Select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </Form.Select>
          </Form.Group>

          {(periodType === "daily" || periodType === "weekly") && (
            <Form.Group>
              <Form.Label className="fw-semibold mb-1">
                {periodType === "weekly" ? "Select Week" : "Select Date"}
              </Form.Label>
              <Form.Control
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </Form.Group>
          )}

          {periodType === "monthly" && (
            <Form.Group>
              <Form.Label className="fw-semibold mb-1">Select Month</Form.Label>
              <Form.Control
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </Form.Group>
          )}

          {periodType === "yearly" && (
            <Form.Group>
              <Form.Label className="fw-semibold mb-1" style={{ minWidth: "120px" }}>Select Year</Form.Label>
              <Form.Select
                value={periodYear}
                onChange={(e) => setPeriodYear(e.target.value)}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {periodType === "custom" && (
            <>
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </div>
      </div>

      <DashboardSummary
        isBranchManager={isBranchManager}
        expenseSummary={expenseSummary}
        incomeSummary={incomeSummary}
        totalVendors={totalVendors}
        totalEmployees={totalEmployees}
        totalInvoiceAmount={totalInvoiceAmount}
        totalBranchesCount={totalBranchesCount}
        formatCurrency={formatCurrency}
      />

      <MonthlyExpenseTrend
        loading={loading}
        monthlyData={monthlyGraphData}
        isBranchManager={isBranchManager}
        selectedYear={selectedGraphYear}
        setSelectedYear={setSelectedGraphYear}
        availableYears={availableYears}
        formatCurrency={formatCurrency}
      />

      <Row>
        <Col md={6}>
          <LatestExpense
            expenses={latestExpenses}
            loading={loading}
            branches={branchMap}
            formatCurrency={formatCurrency}
          />
        </Col>
        {!isBranchManager && (
          <Col md={6}>
            <LatestIncome
              incomes={latestSaleBills}
              loading={loading}
              branches={branchMap}
              formatCurrency={formatCurrency}
            />
          </Col>
        )}
      </Row>

      {!isBranchManager && <CombinedInvoiceDashboard />}
    </div>
  );
};

export default DashboardPage;
