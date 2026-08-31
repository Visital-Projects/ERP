import { Modal, Table, Button } from "react-bootstrap";

const PreviewCreditPurchaseModal = ({
  show,
  onHide,
  previewData = [],
  handleDownloadExcel,
  handleDownloadPDF,
}) => {
  const wrapStyle = {
    maxWidth: "180px",
    whiteSpace: "normal",
    wordBreak: "break-word",
    fontSize: "0.78rem",
  };

  const headerCellStyle = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    fontSize: "0.78rem",
    lineHeight: "1.1",
  };

  const formatINR = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="modal-dialog-centered modal-lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="p-0">
        <Modal.Title>Preview Credit Purchase Report</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3" style={{ paddingBottom: 0 }}>
        {previewData.length === 0 ? (
          <div className="text-center py-4">No preview data available.</div>
        ) : (
          previewData.map((purchase, index) => {
            const items = Array.isArray(purchase.items) ? purchase.items : [];
            
            // Recalculate totals based on items to ensure accuracy
            let totalSubtotalBase = 0;
            let totalTaxAmount = 0;
            let totalPurchaseAmount = 0;

            const recalculatedItems = items.map((item) => {
              const sub = parseFloat(item.subtotal || 0);
              const rate = parseFloat(item.tax_rate || 0);
              const isTaxable = item.is_taxable !== false; // handle null/undefined as taxable if rate exists

              let itemBase = sub;
              let itemTax = 0;
              let itemTotal = sub;

              if (isTaxable && rate > 0) {
                // Backend stores base amount; calculate tax and total on top.
                itemTax = sub * (rate / 100);
                itemBase = sub;
                itemTotal = sub + itemTax;
              }

              totalSubtotalBase += itemBase;
              totalTaxAmount += itemTax;
              totalPurchaseAmount += itemTotal;

              return {
                ...item,
                itemBase,
                itemTax,
                itemTotal
              };
            });

            return (
              <div key={index} className="mb-4">
                <div className="d-flex flex-column gap-2 mb-3">
                  <div>
                    <strong>Payment Head:</strong> {purchase.paymentHead || purchase.category_name || purchase.payment_head || "-"}
                  </div>
                  <div>
                    <strong>Vendor:</strong> {purchase.vendor_name || "-"}
                  </div>
                  <div>
                    <strong>Site:</strong> {purchase.site || purchase.branch_name || purchase.site_name || "-"}
                  </div>
                  <div>
                    <strong>Status:</strong> {purchase.payment_status || purchase.status || "-"}
                  </div>
                </div>

                <div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
                  <Table hover striped className="text-center preview-credit-table" style={{ width: "100%", tableLayout: "fixed", fontSize: "0.78rem" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ ...headerCellStyle, width: "4%" }}>#</th>
                        <th style={{ ...wrapStyle, width: "26%" }}>Item Name</th>
                        <th style={{ width: "13%" }}>Subtotal</th>
                        <th style={{ width: "12%" }}>Tax Type</th>
                        <th style={{ width: "10%" }}>Tax Rate</th>
                        <th style={{ width: "12%" }}>Tax Amt</th>
                        <th style={{ width: "14%" }}>Total</th>
                        <th style={{ width: "9%" }}>Doc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recalculatedItems.length > 0 ? (
                        recalculatedItems.map((item, itemIndex) => {
                          return (
                            <tr key={itemIndex}>
                              <td>{itemIndex + 1}</td>
                              <td style={{ ...wrapStyle, fontSize: "0.78rem" }}>{item.item_name || "-"}</td>
                              <td style={{ fontSize: "0.78rem" }}>₹{formatINR(item.itemBase)}</td>
                              <td style={{ fontSize: "0.78rem" }}>{item.tax_type || "-"}</td>
                              <td style={{ fontSize: "0.78rem" }}>{item.tax_rate ? `${item.tax_rate}%` : "-"}</td>
                              <td style={{ fontSize: "0.78rem" }}>₹{formatINR(item.itemTax)}</td>
                              <td style={{ fontSize: "0.78rem" }}>₹{formatINR(item.itemTotal)}</td>
                              <td style={{ fontSize: "0.78rem" }}>{item.document ? "Yes" : "No"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8}>No item details available.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column gap-2 pt-3 text-start" style={{ fontSize: "0.92rem" }}>
                  <div>
                    <strong>Subtotal (Before Tax):</strong> ₹{formatINR(totalSubtotalBase)}
                  </div>
                  <div>
                    <strong>Tax Amount:</strong> ₹{formatINR(totalTaxAmount)}
                  </div>
                  <div>
                    <strong>Total (Subtotal + Tax):</strong> ₹{formatINR(totalPurchaseAmount)}
                  </div>
                </div>

                {index < previewData.length - 1 && <hr className="my-4" />}
              </div>
            );
          })
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="success" onClick={handleDownloadExcel}>Excel</Button>
        <Button variant="primary" onClick={handleDownloadPDF}>PDF</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewCreditPurchaseModal;
