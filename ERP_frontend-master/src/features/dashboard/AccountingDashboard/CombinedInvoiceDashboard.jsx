import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Badge, Spinner, Button } from "react-bootstrap";
import purchaseService from "../../../services/purchaseService";
import workOrderService from "../../../services/workOrderService";
import dayjs from "dayjs";

const CombinedInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly");
  const [stats, setStats] = useState({ total: 0, paid: 0, due: 0 });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (invoices.length) calculateStats();
  }, [invoices, activeTab]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const [poRes, woRes] = await Promise.all([
        purchaseService.getPurchaseOrderInvoices(),
        workOrderService.getAllInvoices(),
      ]);

      const poInvoices = poRes?.data?.map((inv) => ({
        id: inv.id,
        number: inv.po_number,
        name: inv.purchaseOrder?.vendor_name || "-",
        amount: parseFloat(inv.total_amount || 0),
        remaining: parseFloat(inv.remaining_amount || 0),
        status: inv.status,
        created_at: inv.created_at,
        type: "P", // purchase
      })) || [];

      const woInvoices = woRes?.data?.map((inv) => ({
        id: inv.id,
        number: inv.wo_number,
        name: inv.workOrder?.title || "-",
        amount: parseFloat(inv.total_amount || 0),
        remaining: parseFloat(inv.remaining_amount || 0),
        status: inv.status,
        created_at: inv.created_at,
        type: "W", // work order
      })) || [];

      setInvoices([...poInvoices, ...woInvoices]);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

// const calculateStats = () => {
//   const now = dayjs();
//   const filtered = invoices.filter((inv) =>
//     activeTab === "weekly"
//       ? dayjs(inv.created_at).isAfter(now.subtract(7, "day"))
//       : dayjs(inv.created_at).isAfter(now.subtract(1, "month"))
//   );

//   // Split by type
//   const poInvoices = filtered.filter((i) => i.type === "P");
//   const woInvoices = filtered.filter((i) => i.type === "W");

//   const calc = (arr) => {
//     const total = arr.reduce((sum, i) => sum + i.amount, 0);
//     const paid = arr
//       .filter((i) => i.status.toLowerCase() === "paid")
//       .reduce((sum, i) => sum + i.amount, 0);
//     const due = arr.reduce((sum, i) => sum + i.remaining, 0);
//     return { total, paid, due };
//   };

//   setStats({
//     po: calc(poInvoices),
//     wo: calc(woInvoices),
//     total: calc(filtered),
//   });
// };
const calculateStats = () => {
  const now = dayjs();
  // Always use 1 month for statistics
  const filtered = invoices.filter((inv) =>
    dayjs(inv.created_at).isAfter(now.subtract(1, "month"))
  );

  // Split by type
  const poInvoices = filtered.filter((i) => i.type === "P");
  const woInvoices = filtered.filter((i) => i.type === "W");

  const calc = (arr) => {
    const total = arr.reduce((sum, i) => sum + i.amount, 0);
    const paid = arr
      .filter((i) => i.status.toLowerCase() === "paid")
      .reduce((sum, i) => sum + i.amount, 0);
    const due = arr.reduce((sum, i) => sum + i.remaining, 0);
    return { total, paid, due };
  };

  setStats({
    po: calc(poInvoices),
    wo: calc(woInvoices),
    total: calc(filtered),
  });
};


  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "partially paid":
      case "partial":
        return "info";
      case "draft":
        return "secondary";
      case "sent":
        return "warning";
      case "pending":
        return "warning";
      default:
        return "light";
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          backgroundColor: "#a31717",
          color: "#ffffff",
          border: "1px solid #ffffff",
        };
      default:
        return {};
    }
  };

  return (
    <Row>
      {/* Left Side – Recent Invoices */}
      <Col md={8}>
        <Card className="shadow-sm">
          <Card.Header className="fw-bold">Recent WO & PO Invoices</Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Assigned</th>
                      <th>ISSUE DATE</th>
                      <th>DUE DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length > 0 ? (
                      invoices
                        .sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        )
                        .slice(0, 5)
                        .map((inv, index) => (
                          <tr key={index}>
                            <td>
                              #{inv.number} ({inv.type})
                            </td>
                            <td>{inv.name}</td>
                            <td>{dayjs(inv.created_at).format("MMM D, YYYY")}</td>
                            <td>-</td>
                            <td>₹{inv.amount.toLocaleString()}</td>
                            <td>
                              <Badge
                                bg={getStatusVariant(inv.status)}
                                className="px-4 py-2"
                                style={{
                                  minWidth: "110px",
                                  display: "inline-flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  textTransform: "lowercase",
                                  ...getStatusStyles(inv.status),
                                }}
                              >
                                {inv.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Right Side – Statistics */}
      <Col md={4}>
        <Card className="shadow-sm">
          {/* <Card.Header>
            <div className="d-flex">
              <Button
                variant={
                  activeTab === "weekly" ? "success" : "outline-success"
                }
                size="sm"
                className="me-2"
                onClick={() => setActiveTab("weekly")}
              >
                Invoices Weekly Statistics
              </Button>
              <Button
                variant={
                  activeTab === "monthly" ? "success" : "outline-success"
                }
                size="sm"
                onClick={() => setActiveTab("monthly")}
              >
                Invoices Monthly Statistics
              </Button>
            </div>
          </Card.Header> */}
          <Card.Header className="fw-bold">WO & PO Invoices Monthly Statistics</Card.Header>
<Card.Body>
  <h6 className="text-muted">Purchase Orders</h6>
  <div className="d-flex justify-content-between">
    <span>Total Generated</span>
    <strong>₹{(stats.po?.total || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between">
    <span>Paid</span>
    <strong>₹{(stats.po?.paid || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between mb-3">
    <span>Due</span>
    <strong>₹{(stats.po?.due || 0).toLocaleString()}</strong>
  </div>

  <h6 className="text-muted">Work Orders</h6>
  <div className="d-flex justify-content-between">
    <span>Total Generated</span>
    <strong>₹{(stats.wo?.total || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between">
    <span>Paid</span>
    <strong>₹{(stats.wo?.paid || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between">
    <span>Due</span>
    <strong>₹{(stats.wo?.due || 0).toLocaleString()}</strong>
  </div>

  <hr />
  <h6 className="text-muted">Combined Total</h6>
  <div className="d-flex justify-content-between">
    <span>Total Generated</span>
    <strong>₹{(stats.total?.total || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between">
    <span>Paid</span>
    <strong>₹{(stats.total?.paid || 0).toLocaleString()}</strong>
  </div>
  <div className="d-flex justify-content-between">
    <span>Due</span>
    <strong>₹{(stats.total?.due || 0).toLocaleString()}</strong>
  </div>
</Card.Body>

        </Card>
      </Col>
    </Row>
  );
};

export default CombinedInvoiceDashboard;
