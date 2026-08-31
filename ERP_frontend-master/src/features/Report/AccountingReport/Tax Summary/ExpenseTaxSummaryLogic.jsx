import React from "react";
import { Table, Badge, Button } from "react-bootstrap";
import {
  ChevronDown,
  ChevronUp,
  PieChart,
  Calendar,
  SortDown,
  SortUp,
} from "react-bootstrap-icons";

/* ---------- helpers ---------- */

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const createEmptyTaxData = () => ({
  CGST: Array(12).fill(0),
  SGST: Array(12).fill(0),
  IGST: Array(12).fill(0),
});

const calculateTotals = (data, gstTypeFilter) => {
  if (gstTypeFilter === "CGST+SGST") {
    return {
      "CGST+SGST":
        data.CGST.reduce((a, b) => a + b, 0) +
        data.SGST.reduce((a, b) => a + b, 0),
    };
  }

  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      v.reduce((a, b) => a + b, 0),
    ])
  );
};

const calculateMonthlyTotals = (data, gstTypeFilter) => {
  if (gstTypeFilter === "CGST+SGST") {
    return months.map((_, i) => data.CGST[i] + data.SGST[i]);
  }

  return months.map((_, i) =>
    Object.values(data).reduce((s, v) => s + v[i], 0)
  );
};

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

/* ---------- component ---------- */

const ExpenseTaxSummary = ({
  year,
  show,
  toggle,
  filteredData,
  gstTypeFilter,
}) => {
  const expenseData = filteredData || createEmptyTaxData();

  const totals = calculateTotals(expenseData, gstTypeFilter);
  const monthlyTotals = calculateMonthlyTotals(
    expenseData,
    gstTypeFilter
  );
  const totalExpense = Object.values(totals).reduce(
    (a, b) => a + b,
    0
  );

  if (!show) return null;

  return (
    <div className="shadow-sm border rounded overflow-hidden bg-white mb-4">
      {/* Header */}
      <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-1 d-flex align-items-center">
            GST Paid Summary
            <span className="ms-2">
              {show ? <SortUp size={16} /> : <SortDown size={16} />}
            </span>
          </h5>

          <small className="text-muted d-flex align-items-center">
            <Calendar size={12} className="me-1" />
            Jan-{year} to Dec-{year}

            {gstTypeFilter && gstTypeFilter !== "all" && (
              <Badge bg="warning" className="ms-2">
                {gstTypeFilter === "CGST+SGST"
                  ? "CGST+SGST Combined"
                  : gstTypeFilter}
              </Badge>
            )}
          </small>
        </div>

        <Button
          variant="link"
          onClick={() => toggle("expense")}
          className="p-1 text-decoration-none"
        >
          {show ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>

      {/* Body */}
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Tax Type</th>
              {months.map((m) => (
                <th key={m} className="text-center">
                  {m.slice(0, 3)}
                </th>
              ))}
              <th className="text-end pe-4">Annual Total</th>
            </tr>
          </thead>

          <tbody>
            {gstTypeFilter === "CGST+SGST" ? (
              <tr>
                <td className="ps-4 fw-semibold">CGST + SGST</td>
                {months.map((_, i) => (
                  <td key={i} className="text-center">
                    {formatCurrency(
                      expenseData.CGST[i] + expenseData.SGST[i]
                    )}
                  </td>
                ))}
                <td className="text-end pe-4 fw-bold text-warning">
                  {formatCurrency(totals["CGST+SGST"])}
                </td>
              </tr>
            ) : (
              Object.entries(expenseData).map(([tax, values]) => (
                <tr key={tax}>
                  <td className="ps-4 fw-semibold">{tax}</td>
                  {values.map((v, i) => (
                    <td key={i} className="text-center">
                      {formatCurrency(v)}
                    </td>
                  ))}
                  <td className="text-end pe-4 fw-bold text-warning">
                    {formatCurrency(totals[tax])}
                  </td>
                </tr>
              ))
            )}

            <tr className="fw-bold bg-light">
              <td className="ps-4">
                Monthly Total
              </td>
              {monthlyTotals.map((t, i) => (
                <td key={i} className="text-center">
                  {formatCurrency(t)}
                </td>
              ))}
              <td className="text-end pe-4">
                {formatCurrency(totalExpense)}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ExpenseTaxSummary;
