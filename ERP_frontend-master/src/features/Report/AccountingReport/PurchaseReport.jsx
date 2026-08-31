// src/features/Reports/PurchaseReport.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FileEarmarkTextFill } from "react-bootstrap-icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import purchaseService from "../../../services/purchaseService";

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

const PurchaseReport = ({ periodType, selectedMonth, selectedQuarter, selectedYear }) => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalPurchase, setTotalPurchase] = useState(0);

  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await purchaseService.getAllPurchases();
        if (res?.data && Array.isArray(res.data)) {
const filtered = res.data.filter(po =>
  po.status?.toLowerCase() === "received" &&
  !po.deleted_at &&
  po.delivery_date &&
  filterByPeriod(
    po.delivery_date,
    periodType,
    selectedMonth,
    selectedQuarter,
    selectedYear
  )
);


const { monthly, totalPurchaseSum } = calculateMonthlyData(filtered);

          setMonthlyData(monthly);
          setTotalPurchase(totalPurchaseSum);
        }
      } catch (err) {
        console.error("Failed to fetch purchase orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  },  [periodType, selectedMonth, selectedQuarter, selectedYear]);

const calculateMonthlyData = (purchases) => {
  const monthTotals = Array(12).fill(0);
  const monthCounts = Array(12).fill(0);
  let totalPurchaseSum = 0;

  purchases.forEach((po) => {
    if (!po.deleted_at && po.po_date) {
      const month = new Date(po.po_date).getMonth();
      const amount = parseFloat(po.total_amount || 0);
      monthTotals[month] += amount;
      monthCounts[month] += 1;
      totalPurchaseSum += amount;
    }
  });

  const monthly = months.map((m, i) => ({
    month: m.substring(0, 3),
    amount: monthTotals[i],
    count: monthCounts[i], // number of purchase orders
  }));

  return { monthly, totalPurchaseSum };
};


  const currentMonthIndex = new Date().getMonth();
  const monthlyPurchase = monthlyData[currentMonthIndex]?.amount || 0;

  return (
    <div className="container-fluid mt-4 mb-5">
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="px-3 py-5 shadow-sm d-flex flex-row align-items-center">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
              <FileEarmarkTextFill size={28} className="text-primary" />
            </div>
            <div>
              <h6 className="text-muted mb-0">Report:</h6>
              <h5 className="fw-bold mb-0">Purchase Order Summary</h5>
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="px-3 py-5 shadow-sm text-center">
            <h6 className="text-muted mb-1">Current Month</h6>
            <h4 className="fw-bold text-primary">
              ₹{monthlyPurchase.toFixed(2)}
            </h4>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold mb-3">Monthly Purchase Trend</h5>
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
    <Bar dataKey="amount" fill="#0077b6" name="Purchase Amount" />
  </BarChart>
</ResponsiveContainer>

          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PurchaseReport;
