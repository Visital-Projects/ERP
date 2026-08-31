import React from "react";
import {
  Table,
  Badge,
  Button,
} from "react-bootstrap";
import {
  ChevronUp,
  ChevronDown,
  SortUp,
  SortDown,
  Calendar,
} from "react-bootstrap-icons";

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

const IncomeTaxSummary = ({
  year,
  show,
  toggle,
  filteredData,
  gstTypeFilter,
}) => {
  const incomeData = filteredData || createEmptyTaxData();
  const incomeTotals = calculateTotals(incomeData, gstTypeFilter);
  const incomeMonthlyTotals = calculateMonthlyTotals(
    incomeData,
    gstTypeFilter
  );
  const totalIncome = Object.values(incomeTotals).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="mb-4 shadow-sm border rounded overflow-hidden bg-white">
      {/* Header */}
      <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-1 d-flex align-items-center">
            GST Collected Summary
            <span className="ms-2">
              {show ? <SortUp size={16} /> : <SortDown size={16} />}
            </span>
          </h5>

          <div className="d-flex align-items-center">
            <small className="text-muted me-3">
              <Calendar size={12} className="me-1" />
              Jan-{year} to Dec-{year}
            </small>

            <Badge bg="success">
              {gstTypeFilter !== "all"
                ? `${gstTypeFilter} Only`
                : `${Object.keys(incomeData).length} Tax Types`}
            </Badge>
          </div>
        </div>

        <Button
          variant="link"
          onClick={() => toggle("income")}
          className="p-1 text-decoration-none"
        >
          {show ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>

      {/* Body */}
      {show && (
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
                        incomeData.CGST[i] + incomeData.SGST[i]
                      )}
                    </td>
                  ))}
                  <td className="text-end pe-4 fw-bold text-success">
                    {formatCurrency(incomeTotals["CGST+SGST"])}
                  </td>
                </tr>
              ) : (
                Object.entries(incomeData).map(([tax, values]) => (
                  <tr key={tax}>
                    <td className="ps-4 fw-semibold">{tax}</td>
                    {values.map((v, i) => (
                      <td key={i} className="text-center">
                        {formatCurrency(v)}
                      </td>
                    ))}
                    <td className="text-end pe-4 fw-bold text-success">
                      {formatCurrency(incomeTotals[tax])}
                    </td>
                  </tr>
                ))
              )}

              <tr className="bg-light fw-bold">
                <td className="ps-4">Monthly Total</td>
                {incomeMonthlyTotals.map((v, i) => (
                  <td key={i} className="text-center">
                    {formatCurrency(v)}
                  </td>
                ))}
                <td className="text-end pe-4 text-primary">
                  {formatCurrency(totalIncome)}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IncomeTaxSummary;
