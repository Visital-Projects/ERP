import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Spinner, ProgressBar, Button, Modal, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";
import incomeService from "../../../services/incomeService";
import branchService from "../../../services/branchService";
import POInvoicesSection from "./POInvoicesSection";
import WOInvoicesSection from "./WOInvoicesSection";
import CreditPurchasesSection from "./CreditPurchasesSection";

const Income = () => {
  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [viewBranchWise, setViewBranchWise] = useState(false);
  
  // State for full screen preview modals
  const [showCreditPurchasesModal, setShowCreditPurchasesModal] = useState(false);
  const [showWOInvoicesModal, setShowWOInvoicesModal] = useState(false);
  const [showPOInvoicesModal, setShowPOInvoicesModal] = useState(false);
  
  // Pagination states for each modal
  const [creditPurchasesPage, setCreditPurchasesPage] = useState(1);
  const [woInvoicesPage, setWOInvoicesPage] = useState(1);
  const [poInvoicesPage, setPOInvoicesPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1) helper to format amounts in Indian format with 2 decimals
  const formatAmount = (value) =>
    (Number(value || 0)).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const res = await incomeService.getAllIncome();
        setIncomeData(res.data);
      } catch (err) {
        toast.error(err.message || "Failed to load income data");
      } finally {
        setLoading(false);
      }
    };
    fetchIncome();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const allBranches = await branchService.getAll();
        setBranches(allBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, []);

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  // Get latest 5 items for each table
  const getLatestCreditPurchases = () => incomeData?.credit_purchases?.slice(0, 5) || [];
  const getLatestWOInvoices = () => incomeData?.work_order_invoices?.slice(0, 5) || [];
  const getLatestPOInvoices = () => incomeData?.purchase_order_invoices?.slice(0, 5) || [];

  // Pagination functions for credit purchases
  const getPaginatedCreditPurchases = () => {
    const allData = incomeData?.credit_purchases || [];
    const startIndex = (creditPurchasesPage - 1) * pageSize;
    return allData.slice(startIndex, startIndex + pageSize);
  };

  const getCreditPurchasesTotalPages = () => {
    const total = incomeData?.credit_purchases?.length || 0;
    return Math.ceil(total / pageSize);
  };

  // Pagination functions for work order invoices
  const getPaginatedWOInvoices = () => {
    const allData = incomeData?.work_order_invoices || [];
    const startIndex = (woInvoicesPage - 1) * pageSize;
    return allData.slice(startIndex, startIndex + pageSize);
  };

  const getWOInvoicesTotalPages = () => {
    const total = incomeData?.work_order_invoices?.length || 0;
    return Math.ceil(total / pageSize);
  };

  // Pagination functions for purchase order invoices
  const getPaginatedPOInvoices = () => {
    const allData = incomeData?.purchase_order_invoices || [];
    const startIndex = (poInvoicesPage - 1) * pageSize;
    return allData.slice(startIndex, startIndex + pageSize);
  };

  const getPOInvoicesTotalPages = () => {
    const total = incomeData?.purchase_order_invoices?.length || 0;
    return Math.ceil(total / pageSize);
  };

  // Modal handlers
  const handleShowCreditPurchases = () => {
    setCreditPurchasesPage(1);
    setShowCreditPurchasesModal(true);
  };

  const handleShowWOInvoices = () => {
    setWOInvoicesPage(1);
    setShowWOInvoicesModal(true);
  };

  const handleShowPOInvoices = () => {
    setPOInvoicesPage(1);
    setShowPOInvoicesModal(true);
  };

  // totalIncome computed here so it can be used by getBranchStats safely
  const totalIncome =
    (incomeData?.total_work_order_income || 0) +
    (incomeData?.total_purchase_order_income || 0);

  // Calculate branch statistics for charts — accepts totalIncome for safe percentage calc
  const getBranchStats = (totalIncomeLocal) => {
    if (!incomeData?.branch_wise_income) return [];

    return Object.entries(incomeData.branch_wise_income)
      .map(([branchName, branch]) => {
        const workOrderIncome = Number(branch.work_order_income || 0);
        const purchaseOrderIncome = Number(branch.purchase_order_income || 0);
        const totalBranchIncome = Number(branch.total_branch_income || 0);

        const safeDivisor = Math.max(totalIncomeLocal || 0, 1); // avoid divide-by-zero
        return {
          name: branchName,
          workOrderIncome,
          purchaseOrderIncome,
          totalIncome: totalBranchIncome,
          percentage: (totalBranchIncome / safeDivisor) * 100,
        };
      })
      .sort((a, b) => b.totalIncome - a.totalIncome);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2 mb-0">Loading income data...</p>
      </div>
    );

  if (!incomeData) return null;

  const branchStats = getBranchStats(totalIncome);

  // Render pagination component
  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
        />
        {items}
        <Pagination.Next 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)} 
        />
      </Pagination>
    );
  };

  return (
    <div className="container-fluid py-3 my-4">
      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-primary rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-primary mb-0">Net Balance</h6>
              </div>
              <h4 className={incomeData.net_income >= 0 ? "text-success fw-bold mb-0" : "text-danger fw-bold mb-0"}>
                ₹{formatAmount(incomeData.net_income)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-success rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-success mb-0">Work Order</h6>
              </div>
              <h4 className="text-success fw-bold mb-0">
                ₹{formatAmount(incomeData.total_work_order_income)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-info rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-info mb-0">Purchase Order</h6>
              </div>
              <h4 className="text-info fw-bold mb-0">
                ₹{formatAmount(incomeData.total_purchase_order_income)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-dark bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-dark rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-dark mb-0">Total Income</h6>
              </div>
              <h4 className="text-dark fw-bold mb-0">₹{formatAmount(totalIncome)}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toggle Switch */}
      <div className="d-flex align-items-center justify-content-end mb-4">
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setViewBranchWise(!viewBranchWise)}
        >
          <span className="me-3 text-muted fw-semibold">View income by site</span>
          <div className="position-relative">
            <div
              className={`rounded-pill p-1 ${viewBranchWise ? "bg-success" : "bg-secondary"}`}
              style={{ width: "50px", height: "26px", transition: "all 0.3s ease" }}
            >
              <div
                className="bg-white rounded-circle shadow"
                style={{
                  width: "20px",
                  height: "20px",
                  transform: viewBranchWise ? "translateX(24px)" : "translateX(2px)",
                  transition: "all 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch-wise Income */}
      {viewBranchWise && (
        <>
          {/* Branch Income Overview Cards */}
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                      <div className="bg-warning rounded-2" style={{ width: "20px", height: "20px" }}></div>
                    </div>
                    <h6 className="fw-bold text-warning mb-0">Total Sites</h6>
                  </div>
                  <h2 className="text-warning fw-bold mb-0">{branchStats.length}</h2>
                  <p className="text-muted mb-0 small">Active branches generating income</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                      <div className="bg-success rounded-2" style={{ width: "20px", height: "20px" }}></div>
                    </div>
                    <h6 className="fw-bold text-success mb-0">Top Performing Site</h6>
                  </div>
                  <h5 className="text-success fw-bold mb-1">{branchStats[0]?.name || "N/A"}</h5>
                  <p className="text-muted mb-0 small">
                    ₹{formatAmount(branchStats[0]?.totalIncome || 0)} •{" "}
                    {Number(branchStats[0]?.percentage || 0).toFixed(1)}%
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
                      <div className="bg-info rounded-2" style={{ width: "20px", height: "20px" }}></div>
                    </div>
                    <h6 className="fw-bold text-info mb-0">Average per Site</h6>
                  </div>
                  <h4 className="text-info fw-bold mb-0">
                    ₹{formatAmount(totalIncome / Math.max(branchStats.length, 1))}
                  </h4>
                  <p className="text-muted mb-0 small">Mean income across all sites</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Branch Distribution Chart */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-0">
              <div className="d-flex align-items-center p-4 border-bottom">
                <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-primary rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-primary mb-0">Site Income Distribution</h6>
              </div>
              <div className="p-4">
                {branchStats.map((branch, index) => {
                  const safeTotal = Math.max(branch.totalIncome, 1);
                  return (
                    <div key={branch.name} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle me-3"
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: `hsl(${index * 40}, 70%, 50%)`,
                            }}
                          ></div>
                          <span className="fw-semibold">{branch.name}</span>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">₹{formatAmount(branch.totalIncome)}</div>
                          <small className="text-muted">{Number(branch.percentage).toFixed(1)}%</small>
                        </div>
                      </div>
                      <ProgressBar
                        now={branch.percentage}
                        variant={index === 0 ? "success" : index === 1 ? "info" : index === 2 ? "warning" : "secondary"}
                        style={{ height: "8px" }}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">WO: ₹{formatAmount(branch.workOrderIncome)}</small>
                        <small className="text-muted">PO: ₹{formatAmount(branch.purchaseOrderIncome)}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Detailed Branch Table */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-0">
              <div className="d-flex align-items-center p-4 border-bottom">
                <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                  <div className="bg-warning rounded-2" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <h6 className="fw-bold text-warning mb-0">Site-wise Income Details</h6>
              </div>
              <div className="p-4">
                <div className="table-responsive rounded-3">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4 py-3 fw-semibold text-muted border-0">Site</th>
                        <th className="py-3 fw-semibold text-muted border-0">Work Order Income</th>
                        <th className="py-3 fw-semibold text-muted border-0">Purchase Order Income</th>
                        <th className="py-3 fw-semibold text-muted border-0">Distribution</th>
                        <th className="pe-4 py-3 fw-semibold text-muted border-0 text-end">Total Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchStats.map((branch, index) => {
                        const safeBranchTotal = Math.max(branch.totalIncome, 1);
                        const woShare = Math.round((branch.workOrderIncome / safeBranchTotal) * 100 || 0);
                        const poShare = Math.round((branch.purchaseOrderIncome / safeBranchTotal) * 100 || 0);

                        return (
                          <tr key={branch.name} className="border-top">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle me-3"
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: `hsl(${index * 40}, 70%, 50%)`,
                                  }}
                                ></div>
                                <span className="fw-semibold text-dark">{branch.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-dark">₹{formatAmount(branch.workOrderIncome)}</td>
                            <td className="py-3 text-dark">₹{formatAmount(branch.purchaseOrderIncome)}</td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="bg-success rounded-start"
                                  style={{ width: `${woShare}%`, height: "8px" }}
                                  title="Work Order"
                                ></div>
                                <div
                                  className="bg-info rounded-end"
                                  style={{ width: `${poShare}%`, height: "8px" }}
                                  title="Purchase Order"
                                ></div>
                              </div>
                              <small className="text-muted">
                                {woShare}% WO • {poShare}% PO
                              </small>
                            </td>
                            <td className="pe-4 py-3 fw-bold text-success text-end">₹{formatAmount(branch.totalIncome)}</td>
                          </tr>
                        );
                      })}
                      {/* Total Row */}
                      {branchStats.length > 0 && (
                        <tr className="border-top bg-light">
                          <td className="ps-4 py-3 fw-bold text-dark border-0">Total</td>
                          <td className="py-3 fw-bold text-dark border-0">₹{formatAmount(incomeData.total_work_order_income)}</td>
                          <td className="py-3 fw-bold text-dark border-0">₹{formatAmount(incomeData.total_purchase_order_income)}</td>
                          <td className="py-3 border-0">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-success rounded-start"
                                style={{
                                  width: `${Math.round((incomeData.total_work_order_income / Math.max(totalIncome,1)) * 100)}%`,
                                  height: "8px",
                                }}
                              ></div>
                              <div
                                className="bg-info rounded-end"
                                style={{
                                  width: `${Math.round((incomeData.total_purchase_order_income / Math.max(totalIncome,1)) * 100)}%`,
                                  height: "8px",
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="pe-4 py-3 fw-bold text-dark text-end border-0">₹{formatAmount(totalIncome)}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {!viewBranchWise && (
        <>
          <CreditPurchasesSection
            incomeData={incomeData}
            formatAmount={formatAmount}
            getLatestCreditPurchases={getLatestCreditPurchases}
            getBranchName={getBranchName}
            showCreditPurchasesModal={showCreditPurchasesModal}
            setShowCreditPurchasesModal={setShowCreditPurchasesModal}
            getPaginatedCreditPurchases={getPaginatedCreditPurchases}
            getCreditPurchasesTotalPages={getCreditPurchasesTotalPages}
            creditPurchasesPage={creditPurchasesPage}
            setCreditPurchasesPage={setCreditPurchasesPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />

          <WOInvoicesSection
            incomeData={incomeData}
            formatAmount={formatAmount}
            getLatestWOInvoices={getLatestWOInvoices}
            handleShowWOInvoices={handleShowWOInvoices}
            showWOInvoicesModal={showWOInvoicesModal}
            setShowWOInvoicesModal={setShowWOInvoicesModal}
            getPaginatedWOInvoices={getPaginatedWOInvoices}
            getWOInvoicesTotalPages={getWOInvoicesTotalPages}
            woInvoicesPage={woInvoicesPage}
            setWOInvoicesPage={setWOInvoicesPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />

          <POInvoicesSection
            incomeData={incomeData}
            formatAmount={formatAmount}
            getLatestPOInvoices={getLatestPOInvoices}
            handleShowPOInvoices={handleShowPOInvoices}
            showPOInvoicesModal={showPOInvoicesModal}
            setShowPOInvoicesModal={setShowPOInvoicesModal}
            getPaginatedPOInvoices={getPaginatedPOInvoices}
            getPOInvoicesTotalPages={getPOInvoicesTotalPages}
            poInvoicesPage={poInvoicesPage}
            setPOInvoicesPage={setPOInvoicesPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </>
      )}
    </div>
  );
};

export default Income;