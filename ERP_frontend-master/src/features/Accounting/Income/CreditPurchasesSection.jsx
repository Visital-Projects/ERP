import React, { useState } from "react";
import { Card, Table, Button, Pagination, Row, Col, Modal } from "react-bootstrap";

const CreditPurchasesSection = ({
  incomeData,
  formatAmount,
  getLatestCreditPurchases,
  getBranchName,
  showCreditPurchasesModal,
  setShowCreditPurchasesModal,
  getPaginatedCreditPurchases,
  getCreditPurchasesTotalPages,
  creditPurchasesPage,
  setCreditPurchasesPage,
  pageSize,
  setPageSize,
}) => {
  const [isFullScreenView, setIsFullScreenView] = useState(false);

  // Pagination renderer
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
      <Pagination className="justify-content-center mt-3">
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

  // Totals for full-screen summary
  const allPurchases = getPaginatedCreditPurchases();
  const totalAmount = allPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.total_amount || 0),
    0
  );

  return (
    <>
      {/* Credit Purchases Card */}
      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body className="p-0">
          <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
            <div className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
                <div
                  className="bg-danger rounded-2"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </div>
              <h6 className="fw-bold text-danger mb-0">
                Credit Purchases
              </h6>
            </div>
            {incomeData.credit_purchases?.length > 5 && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowCreditPurchasesModal(true)}
              >
                View More
              </Button>
            )}
          </div>

          <div className="p-4">
            <div className="table-responsive rounded-3">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 fw-semibold text-muted border-0">
                      Site
                    </th>
                    <th className="pe-4 py-3 fw-semibold text-muted border-0 text-end">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getLatestCreditPurchases().length > 0 ? (
                    getLatestCreditPurchases().map((credit, idx) => (
                      <tr key={idx} className="border-top">
                        <td className="ps-4 py-3 text-dark">
                          {getBranchName(credit.branch_id)}
                        </td>
                        <td className="pe-4 py-3 fw-semibold text-dark text-end">
                          ₹{formatAmount(credit.total_amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-4">
                        <div className="bg-light rounded-3 p-3 mb-2">
                          <div 
                            className="bg-secondary bg-opacity-25 rounded-2 mx-auto" 
                            style={{ width: "40px", height: "40px" }}
                          ></div>
                        </div>
                        <p className="text-muted fst-italic mb-0">No credit purchases found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center px-4 pb-3">
  <small className="text-muted">
    {(() => {
      const totalEntries = incomeData.credit_purchases?.length || 0;
      const startEntry = totalEntries === 0 ? 0 : 1;
      const endEntry = Math.min(getLatestCreditPurchases().length, totalEntries);
      return `Showing ${startEntry} to ${endEntry} of ${totalEntries} Credit Purchases`;
    })()}
  </small>
</div>
        </Card.Body>
      </Card>

{/* Modal for Credit Purchases */}
<Modal
  show={showCreditPurchasesModal}
  onHide={() => setShowCreditPurchasesModal(false)}
  backdrop="static"
  keyboard={false}
  size="xl"
  centered
  dialogClassName="d-flex align-items-center justify-content-center"
>
  <Modal.Header closeButton className="border-bottom d-flex align-items-center justify-content-between">
    <div className="d-flex align-items-center">
      <Modal.Title>Credit Purchases - All Data</Modal.Title>
    </div>
    <div className="ms-3">
      <select
        className="form-select form-select-sm"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={75}>75 per page</option>
        <option value={100}>100 per page</option>
      </select>
    </div>
  </Modal.Header>

  <Modal.Body>
    {/* Summary Cards */}
    <Row className="mb-4">
      <Col md={6} lg={4}>
        <Card className="shadow-sm border-0 text-center p-4">
          <h6 className="text-muted mb-2">Total Credit Purchases</h6>
          <h4 className="fw-bold text-danger mb-0">
            ₹{formatAmount(totalAmount)}
          </h4>
        </Card>
      </Col>
      <Col md={6} lg={4}>
        <Card className="shadow-sm border-0 text-center p-4">
          <h6 className="text-muted mb-2">Total Records</h6>
          <h4 className="fw-bold text-dark mb-0">
            {incomeData.credit_purchases?.length || 0}
          </h4>
        </Card>
      </Col>
      <Col md={6} lg={4}>
        <Card className="shadow-sm border-0 text-center p-4">
          <h6 className="text-muted mb-2">Average per Site</h6>
          <h4 className="fw-bold text-info mb-0">
            ₹{formatAmount(totalAmount / Math.max(allPurchases.length, 1))}
          </h4>
        </Card>
      </Col>
    </Row>

    {/* Table */}
    <div className="table-responsive">
      <Table hover>
        <thead className="bg-light">
          <tr>
            <th>Site</th>
            <th className="text-end">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedCreditPurchases().map((credit, idx) => (
            <tr key={idx}>
              <td>{getBranchName(credit.branch_id)}</td>
              <td className="text-end">₹{formatAmount(credit.total_amount)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {renderPagination(
      creditPurchasesPage,
      getCreditPurchasesTotalPages(),
      setCreditPurchasesPage
    )}
  </Modal.Body>
</Modal>

    </>
  );
};

export default CreditPurchasesSection;