import React, { useState } from "react";
import { Card, Table, Button, Pagination, Row, Col } from "react-bootstrap";

const POInvoicesSection = ({
  incomeData,
  formatAmount,
  getLatestPOInvoices,
  handleShowPOInvoices,
  showPOInvoicesModal,
  setShowPOInvoicesModal,
  getPaginatedPOInvoices,
  getPOInvoicesTotalPages,
  poInvoicesPage,
  setPOInvoicesPage,
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
  const allInvoices = getPaginatedPOInvoices();
  const totalPaid = allInvoices.reduce(
    (sum, inv) => sum + Number(inv.payment_amount || 0),
    0
  );
  const totalRemaining = allInvoices.reduce(
    (sum, inv) => sum + Number(inv.remaining_amount || 0),
    0
  );
  const totalGST = allInvoices.reduce(
    (sum, inv) => sum + Number(inv.gst_amount || 0),
    0
  );

  return (
    <>
      {/* Purchase Order Invoices Card */}
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-0">
          <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
                <div
                  className="bg-info rounded-2"
                  style={{ width: "20px", height: "20px" }}
                ></div>
              </div>
              <h6 className="fw-bold text-info mb-0">
                Purchase Order Invoices
              </h6>
            </div>
            {incomeData.purchase_order_invoices?.length > 5 && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setIsFullScreenView(true)}
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
                      PO Number
                    </th>
                    <th className="py-3 fw-semibold text-muted border-0">
                      Vendor
                    </th>
                    <th className="py-3 fw-semibold text-muted border-0">
                      Payment
                    </th>
                    <th className="py-3 fw-semibold text-muted border-0">
                      GST
                    </th>
                    <th className="py-3 fw-semibold text-muted border-0">
                      Total
                    </th>
                    <th className="py-3 fw-semibold text-muted border-0">
                      Remaining
                    </th>
                    <th className="pe-4 py-3 fw-semibold text-muted border-0">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getLatestPOInvoices().map((inv) => (
                    <tr key={inv.id} className="border-top">
                      <td className="ps-4 py-3 fw-semibold text-dark">
                        {inv.po_number}
                      </td>
                      <td className="py-3 text-dark">
                        {inv.purchaseOrder?.vendor_name || "-"}
                      </td>
                      <td className="py-3 text-dark">
                        ₹{formatAmount(inv.payment_amount)}
                      </td>
                      <td className="py-3 text-dark">
                        ₹{formatAmount(inv.gst_amount)}
                      </td>
                      <td className="py-3 text-dark">
                        ₹{formatAmount(inv.total_amount)}
                      </td>
                      <td className="py-3 text-dark">
                        ₹{formatAmount(inv.remaining_amount)}
                      </td>
                      <td className="pe-4 py-3">
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 text-capitalize">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center px-4 pb-3">
            <small className="text-muted">
                {(() => {
                const totalEntries = incomeData.purchase_order_invoices?.length || 0;
                const startEntry = totalEntries === 0 ? 0 : 1;
                const endEntry = Math.min(getLatestPOInvoices().length, totalEntries);
                return `Showing ${startEntry} to ${endEntry} of ${totalEntries} Purchase Order Invoices`;
                })()}
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* ✅ Full-Screen View Section */}
      {isFullScreenView && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white overflow-auto"
          style={{ zIndex: 1055 }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 px-5 border-bottom bg-light sticky-top">
            <h5 className="mb-0">Purchase Order Invoices</h5>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFullScreenView(false)}
            >
              Close
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="container-fluid py-3 px-5 my-4">
            <Row className="mt-4 g-3">
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center p-5">
                  <h6 className="text-muted mb-2">Total Paid Amount</h6>
                  <h5 className="fw-bold text-success mb-0">
                    ₹{formatAmount(totalPaid)}
                  </h5>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center p-5">
                  <h6 className="text-muted mb-2">Total Remaining Amount</h6>
                  <h5 className="fw-bold text-warning mb-0">
                    ₹{formatAmount(totalRemaining)}
                  </h5>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center p-5">
                  <h6 className="text-muted mb-2">Total GST Amount</h6>
                  <h5 className="fw-bold text-info mb-0">
                    ₹{formatAmount(totalGST)}
                  </h5>
                </Card>
              </Col>
            </Row>

            {/* Fullscreen Table */}
            <div className="table-responsive">
              <Table hover bordered>
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>Payment</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.po_number}</td>
                      <td>{inv.purchaseOrder?.vendor_name || "-"}</td>
                      <td>₹{formatAmount(inv.payment_amount)}</td>
                      <td>₹{formatAmount(inv.gst_amount)}</td>
                      <td>₹{formatAmount(inv.total_amount)}</td>
                      <td>₹{formatAmount(inv.remaining_amount)}</td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 text-capitalize">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {renderPagination(
                poInvoicesPage,
                getPOInvoicesTotalPages(),
                setPOInvoicesPage
              )}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <select
                className="form-select w-auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 25, 50, 75, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} entries
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POInvoicesSection;
