import React from "react";
import { Card, Form, Spinner } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === "income")?.value || 0;
    const expense = payload.find((p) => p.dataKey === "expense")?.value || 0;
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <p className="fw-bold mb-1">{label}</p>
        {expense > 0 && <p className="text-danger mb-1">Expense: ₹ {formatCurrency(expense)}</p>}
        {income > 0 && <p className="text-primary mb-0">Income: ₹ {formatCurrency(income)}</p>}
      </div>
    );
  }
  return null;
};

const MonthlyExpenseTrend = ({
  loading,
  monthlyData,
  isBranchManager,
  selectedYear,
  setSelectedYear,
  availableYears,
  formatCurrency,
}) => {
  return (
    <Card className="shadow-sm border-0 mb-4 mt-4">
      <Card.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <h5 className="fw-bold text-primary mb-0">
            {isBranchManager ? "Expense" : "Income & Expense"}
          </h5>
          <div className="d-flex align-items-end gap-3">
            <Form.Group>
              <Form.Label className="fw-semibold mb-1">Year</Form.Label>
              <Form.Select
                style={{ minWidth: "120px" }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <h6 className="text-muted mb-2">Current Year - {selectedYear}</h6>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" /> Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" vertical={false} horizontal />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => Number(value || 0).toLocaleString("en-IN")} />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              <Legend />
              {!isBranchManager && <Bar dataKey="income" fill="#00b4d8" barSize={30} />}
              <Bar dataKey="expense" fill="#ff5c8a" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default MonthlyExpenseTrend;
