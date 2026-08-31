import React, { useEffect, useState } from "react";
import {Table,Badge,Card,Button,Spinner,Modal,Form,Row,Col,OverlayTrigger, Tooltip} from "react-bootstrap";
import branchWalletService from "../../../services/branchwalletService";
import { getBranches } from "../../../services/branchService";
import BreadCrumb from "../../../components/BreadCrumb";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { GiReceiveMoney } from "react-icons/gi";
import ApproveModal from "./ApproveModal";

const formatAmount = (value) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("en-IN");
};
const FundRequestList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const branchIdFromQuery = queryParams.get("branchId");

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Filters
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let res;
      if (user?.type === "Branch Manager" || user?.type === "Branch Manager ") {
        res = await branchWalletService.getMyFundRequests();
      } else {
        res = await branchWalletService.getAllFundRequests();
      }
      const data = res?.data || [];
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      toast.error("Failed to load fund requests");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await getBranches();
      const sortedBranches = res.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setBranches(sortedBranches);
    } catch (error) {
      console.error("Failed to load branches:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branchIdFromQuery && requests.length > 0) {
      const filtered = requests.filter(r => r.Branch?.id?.toString() === branchIdFromQuery);
      setFilteredRequests(filtered);
    }
  }, [branchIdFromQuery, requests]);

  useEffect(() => {
    let filtered = [...requests];
    if (branchFilter) {
      filtered = filtered.filter(
        (r) => r.Branch?.name === branchFilter
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(
        (r) => r.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    const now = new Date();
    if (periodFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= monthStart
      );
    } else if (periodFilter === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= yearStart
      );
    } else if (periodFilter === "custom" && customRange.from && customRange.to) {
      const from = new Date(customRange.from);
      const to = new Date(customRange.to);
      filtered = filtered.filter((r) => {
        const date = new Date(r.created_at);
        return date >= from && date <= to;
      });
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [branchFilter, statusFilter, periodFilter, customRange, requests]);

  // Modal Handlers
  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setTransactionId("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setTransactionId("");
  };

  const handleReceived = async (id) => {
  try {
    const res = await branchWalletService.processFundRequest(id, { status: "received" });
    toast.success(res?.message || "Marked as received successfully");
    fetchRequests(); // refresh table data
  } catch (error) {
    toast.error(error?.message || "Failed to mark as received");
    console.error("Received error:", error);
  }
};

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  return (
    <div className="container-fluid py-3 my-4">
      <div>
        <h4>
          {user?.type === "Branch Manager" || user?.type === "Branch Manager "
            ? "My Fund Requests"
            : "All Branch Fund Requests"}
        </h4>
        <BreadCrumb pathname="/fund-requests" lastLabel="Fund Requests" />
      </div>

      <Card className="shadow-sm p-4">
        <Row className="align-items-center justify-content-between g-3 mb-5">
          <Col md={1}>
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Col>

          {/* Filters Section */}
          <Col md={11}>
            <Row className="g-2 justify-content-end">
              <Col md={3}>
                <Form.Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="received">Received</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
              </Col>

              {periodFilter === "custom" && (
                <>
                  <Col md={2}>
                    <Form.Control
                      type="date"
                      value={customRange.from}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="date"
                      value={customRange.to}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </Col>
                </>
              )}
            </Row>
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center text-muted py-4">
            No fund requests found.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table hover striped className="text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Branch Name</th>
                    <th>Amount</th>
                    <th>Paid Amount</th>
                    <th>Remaining</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map((req, i) => (
                    <tr key={req.id}>
                      <td>{req.Branch ? req.Branch.name : "N/A"}</td>
<td>₹{formatAmount(req.amount)}</td>
<td>₹{formatAmount(req.paidAmount)}</td>
<td>₹{formatAmount(req.remainingAmount)}</td>
                      <td>{req.reason}</td>
                      <td>
                        <Badge
                          bg={
                            req.status === "paid"
                              ? "success"
                              : req.status === "pending"
                              ? "warning"
                              : req.status === "rejected"
                              ? "danger"
                              : req.status === "received"
                              ? "primary"
                              : "info"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td>{req.transaction_id || "—"}</td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        {(user?.type === "company" || user?.type === "Accountant") && req.status === "pending" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-gear-${req.id}`}>Process Request</Tooltip>}
                          >
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleOpenModal(req)}
                            >
                              <i className="bi bi-gear"></i>
                            </Button>
                          </OverlayTrigger>
                        )}
                        {req.status === "paid" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-received-${req.id}`}>Mark as Received</Tooltip>}
                          >
                            <Button
                              variant="success"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleReceived(req.id)}
                            >
                              <GiReceiveMoney />
                            </Button>
                          </OverlayTrigger>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
              <p className="mb-0 small text-muted">
                Showing {filteredRequests.length ? indexOfFirst + 1 : 0} to{" "}
                {Math.min(indexOfLast, filteredRequests.length)} of{" "}
                {filteredRequests.length} entries
              </p>

              <ul className="pagination pagination-sm mb-0" style={{ gap: "0", justifyContent: "end", alignItems:'center' }}>
                <li
                  className={`page-item ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${
                    currentPage === totalPages || totalPages === 0
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </Card>
      <ApproveModal
        show={showModal}
        onClose={handleCloseModal}
        request={selectedRequest}
        onSuccess={fetchRequests}
      />
    </div>
  );
};

export default FundRequestList;
