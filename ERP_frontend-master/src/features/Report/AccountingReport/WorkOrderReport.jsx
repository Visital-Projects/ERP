// src/features/Reports/WorkOrderReport.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FileEarmarkTextFill } from "react-bootstrap-icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import workOrderService from "../../../services/workOrderService";

const filterByPeriod = (date, periodType, selectedMonth, selectedQuarter, selectedYear) => {
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
      quarters[selectedQuarter].includes(d.getMonth()) &&
      d.getFullYear() === selectedYear
    );
  }

  // Financial Year (India Apr → Mar)
  const fyStart = new Date(selectedYear, 3, 1);
  const fyEnd = new Date(selectedYear + 1, 2, 31);
  return d >= fyStart && d <= fyEnd;
};

const WorkOrderReport = ({ periodType, selectedMonth, selectedQuarter, selectedYear }) => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await workOrderService.getAllWorkOrders();
        if (res?.data && Array.isArray(res.data)) {
          const filtered = res.data.filter(wo =>
  !wo.deleted_at &&
  wo.issue_date &&
  filterByPeriod(
    wo.issue_date,
    periodType,
    selectedMonth,
    selectedQuarter,
    selectedYear
  )
);

const { monthly, totalSum } = calculateMonthlyData(filtered);
          setMonthlyData(monthly);
          setTotalAmount(totalSum);
        }
      } catch (err) {
        console.error("Failed to fetch work orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodType, selectedMonth, selectedQuarter, selectedYear]);

const calculateMonthlyData = (workOrders) => {
  const monthTotals = Array(12).fill(0);
  const monthCounts = Array(12).fill(0); // count of work orders
  let totalSum = 0;

  workOrders.forEach((wo) => {
    if (!wo.deleted_at && wo.issue_date) {
      const month = new Date(wo.issue_date).getMonth();
      const amount = parseFloat(wo.work_order_amount || 0);
      monthTotals[month] += amount;
      monthCounts[month] += 1;
      totalSum += amount;
    }
  });

  const monthly = months.map((m, i) => ({
    month: m.substring(0, 3),
    amount: monthTotals[i],
    count: monthCounts[i],
  }));

  return { monthly, totalSum };
};


  const currentMonthIndex = new Date().getMonth();
  const monthlyWorkAmount = monthlyData[currentMonthIndex]?.amount || 0;

  return (
    <div className="container-fluid mt-4 mb-5">
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="py-5 px-3 shadow-sm d-flex flex-row align-items-center">
            <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
              <FileEarmarkTextFill size={28} className="text-success" />
            </div>
            <div>
              <h6 className="text-muted mb-0">Report:</h6>
              <h5 className="fw-bold mb-0">Work Order Summary</h5>
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="py-5 px-3 shadow-sm text-center">
            <h6 className="text-muted mb-1">Current Month</h6>
            <h4 className="fw-bold text-success">
              ₹{monthlyWorkAmount.toFixed(2)}
            </h4>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold mb-3">Monthly Work Order Trend</h5>
          {loading ? (
            <p className="text-center text-muted">Loading chart...</p>
          ) : monthlyData.every((d) => d.amount === 0) ? (
            <p className="text-center text-muted">No data available</p>
          ) : (
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={monthlyData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div className="custom-tooltip p-2" style={{ backgroundColor: "#fff", border: "1px solid #ccc" }}>
              <p><strong>Month:</strong> {label}</p>
              <p><strong>Amount:</strong> ₹{data.amount.toFixed(2)}</p>
              <p><strong>Work Orders:</strong> {data.count}</p>
            </div>
          );
        }
        return null;
      }}
    />
    <Legend verticalAlign="top" align="right" />
    <Bar dataKey="amount" fill="#28a745" name="Work Order Amount" />
  </BarChart>
</ResponsiveContainer>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkOrderReport;
