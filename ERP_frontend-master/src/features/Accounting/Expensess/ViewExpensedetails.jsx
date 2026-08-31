// src/components/ViewExpenseModal.jsx
import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

const ViewExpenseModal = ({ show, onHide, expense, branchName, BASE_URL, getCategoryName }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Expense Details – {branchName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {expense ? (
          <div>
            <p><strong>Entry Date:</strong> {expense.payment_date ? new Date(expense.payment_date).toLocaleDateString("en-GB") : "-"}</p>
            <p><strong>Bill Date:</strong> {expense.actual_bill_date ? new Date(expense.actual_bill_date).toLocaleDateString("en-GB") : "-"}</p>
            {(() => {
              let correctedSubtotal = 0;
              let correctedTaxTotal = 0;
              let correctedTotal = 0;

              if (expense.items && expense.items.length > 0) {
                expense.items.forEach((item) => {
                  const sub = parseFloat(item.subtotal || 0);
                  const rate = parseFloat(item.tax_rate || 0);
                  if (item.is_taxable) {
                    if (item.tax_type === "exclusive") {
                      const tax = (sub * rate) / 100;
                      correctedSubtotal += sub;
                      correctedTaxTotal += tax;
                      correctedTotal += sub + tax;
                    } else {
                      const tax = sub * (rate / (100 + rate));
                      correctedSubtotal += sub - tax;
                      correctedTaxTotal += tax;
                      correctedTotal += sub;
                    }
                  } else {
                    correctedSubtotal += sub;
                    correctedTotal += sub;
                  }
                });
              } else {
                correctedSubtotal = parseFloat(expense.subtotal || 0);
                correctedTaxTotal = parseFloat(expense.tax_total || 0);
                correctedTotal = parseFloat(expense.total_amount || 0);
              }

              return (
                <>
                  <p><strong>Subtotal:</strong> ₹{correctedSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p><strong>Tax Total:</strong> ₹{correctedTaxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p><strong>Total Amount:</strong> ₹{correctedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </>
              );
            })()}
            <p><strong>Payment Status:</strong> {expense.payments_status}</p>
            <p><strong>Vendor Name:</strong> {expense.vendor_name || expense.description || "-"}</p>
            <p><strong>Type of Supply / Service:</strong> {expense.type_of_supply_or_service || "-"}</p>
            <p><strong>Payment Head:</strong> {getCategoryName(expense.category_id)}</p>
            <p><strong>Remark:</strong> {expense.remark || "-"}</p>
            <p><strong>Created By:</strong> {expense.creator?.name || "-"}</p>

            {expense.items && expense.items.length > 0 && (
              <>
                <hr />
                <h5>Expense Items</h5>
                <Table striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Subtotal</th>
                      <th>Tax Total</th>
                      <th>Total Amount</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expense.items.map((item, idx) => {
                      let itemSub = parseFloat(item.subtotal || 0);
                      let itemTax = 0;
                      let itemTotal = 0;
                      const rate = parseFloat(item.tax_rate || 0);

                      if (item.is_taxable) {
                        if (item.tax_type === "exclusive") {
                          itemTax = (itemSub * rate) / 100;
                          itemTotal = itemSub + itemTax;
                        } else {
                          itemTax = itemSub * (rate / (100 + rate));
                          itemSub = itemSub - itemTax;
                          itemTotal = itemSub + itemTax;
                        }
                      } else {
                        itemTotal = itemSub;
                      }

                      return (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td>{item.item_name}</td>
                          <td>₹{itemSub.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>₹{itemTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            {item.document ? (
                              <a
                                href={`${BASE_URL}/${item.document}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewExpenseModal;
