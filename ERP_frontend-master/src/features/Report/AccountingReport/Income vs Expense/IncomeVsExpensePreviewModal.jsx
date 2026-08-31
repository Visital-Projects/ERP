import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";

const IncomeVsExpensePreviewModal = ({show,onHide,durationText,exportData,expenseTables,incomeRows,onExportExcel,onExportPDF,}) => {
  const { header = [], rows = [] } = exportData || {};
  const { gstExpenses = [], nonGstExpenses = [] } = expenseTables || {};
  const sum = (arr, key) =>
  arr?.reduce((s, r) => s + Number(r[key] || 0), 0);

  const incomeValueTotal = sum(incomeRows, "value");
  const incomeGstTotal = sum(incomeRows, "gst");
  const incomeGrandTotal = sum(incomeRows, "total");
  const expenseValueTotal = sum(gstExpenses, "value");
  const expenseGstTotal = sum(gstExpenses, "gst");
  const expenseGrandTotal = sum(gstExpenses, "total");
  const nonGstTotal = sum(nonGstExpenses, "value");
  const totalExpenseRows = [...gstExpenses, ...nonGstExpenses];
  const totalValueAll = sum(totalExpenseRows, "value");
  const totalGstAll = sum(totalExpenseRows, "gst");
  const totalGrandAll = totalExpenseRows.reduce((sum, r) => sum + Number(r.total || r.value || 0),0);

  const walletCreditsTotal =
    rows
      ?.filter((r) => r[0] === "Wallet Credits")
      ?.reduce(
        (sum, r) => sum + r.slice(1).reduce((a, b) => a + Number(b || 0), 0),
        0
      ) || 0;

  const totalInvoiceRaised = incomeValueTotal;
  const totalPurchased = expenseValueTotal;
  const profitOrLoss = totalInvoiceRaised - totalPurchased - nonGstTotal;

  const outputGST = incomeGstTotal;
  const inputGST = expenseGstTotal;
  const gstPayable = outputGST - inputGST;

  const formatINR = (num) => {
    return Number(num || 0).toLocaleString("en-IN", {minimumFractionDigits: 2,maximumFractionDigits: 2,});
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" className="d-flex justify-content-center" backdrop="static" dialogClassName="invoice-preview-modal">
      <Modal.Header closeButton>
        <Modal.Title>Income vs Expense Preview
          <Badge bg="secondary" className="ms-2">{durationText}</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="table-responsive">
          <h5 className="mb-3">Income</h5>
          <Table bordered size="sm">
            <thead className="table-success">
              <tr>
                <th>Sl No</th>
                <th>Date</th>
                <th>Description</th>
                <th>Value</th>
                <th>TAX</th>
                <th>Total Value</th>
                <th>Job</th>
                <th>Against Month</th>
              </tr>
            </thead>

            <tbody>
              {incomeRows?.map((row, i) => (
                <tr key={i}>
                  <td>{row.sl}</td>
                  <td>{row.date}</td>
                  <td>{row.description}</td>
                  <td>{formatINR(row.value)}</td>
                  <td>{formatINR(row.gst)}</td>
                  <td>{formatINR(row.total)}</td>
                  <td>{row.job}</td>
                  <td>{row.month}</td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="fw-bold table-light">
                <td colSpan="3">Total</td>
                <td>{formatINR(incomeValueTotal)}</td>
                <td>{formatINR(incomeGstTotal)}</td>
                <td>{formatINR(incomeGrandTotal)}</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </Table>
        </div>

        <h5 className="mb-3">Expenses With TAX</h5>
        <Table bordered size="sm">
          <thead className="table-warning">
            <tr>
              <th>Sl No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Value</th>
              <th>TAX</th>
              <th>Total</th>
              <th>Month</th>
            </tr>
          </thead>

          <tbody>
            {gstExpenses.map((e, i) => (
              <tr key={i}>
                <td>{e.sl}</td>
                <td>{e.date}</td>
                <td>{e.name}</td>
                <td>{formatINR(e.value)}</td>
                <td>{formatINR(e.gst)}</td>
                <td>{formatINR(e.total)}</td>
                <td>{e.month}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="fw-bold table-light">
              <td colSpan="3">Total</td>
              <td>{formatINR(expenseValueTotal)}</td>
              <td>{formatINR(expenseGstTotal)}</td>
              <td>{formatINR(expenseGrandTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>

        <h5 className="mt-4 mb-3">Expenses Without TAX</h5>
        <Table bordered size="sm">
          <thead className="table-primary">
            <tr>
              <th>Sl No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Site</th>
              <th>Wallet</th>
              <th>Amount</th>
              <th>Month</th>
            </tr>
          </thead>

          <tbody>
            {nonGstExpenses.map((e, i) => (
              <tr key={i}>
                <td>{e.sl}</td>
                <td>{e.date}</td>
                <td>{e.name}</td>
                <td>{e.site || "-"}</td>
                <td>{formatINR(e.wallet)}</td>
                <td>{formatINR(e.value)}</td>
                <td>{e.month}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="fw-bold table-light">
              <td colSpan="5">Total</td>
              <td>{formatINR(nonGstTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>

        <h5 className="mt-4 mb-3">Total Expenses (TAX + Without TAX)</h5>
        <Table bordered size="sm">
          <thead className="table-danger">
            <tr>
              <th>Sl No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Value</th>
              <th>TAX</th>
              <th>Total</th>
              <th>Month</th>
            </tr>
          </thead>

          <tbody>
            {totalExpenseRows.map((e, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{e.date}</td>
                <td>{e.name}</td>
                <td>{formatINR(e.value)}</td>
                <td>{formatINR(e.gst)}</td>
                <td>{formatINR(e.total || e.value)}</td>
                <td>{e.month}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="fw-bold table-light">
              <td colSpan="3">Total</td>
              <td>{formatINR(totalValueAll)}</td>
              <td>{formatINR(totalGstAll)}</td>
              <td>{formatINR(totalGrandAll)}</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>

        <h5 className="mt-4 mb-3">TAX Payable</h5>
        <Table bordered size="sm">
          <thead className="table-secondary">
            <tr>
              <th>Type</th>
              <th>TAX Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>TAX Collected</td>
              <td>{formatINR(outputGST)}</td>
            </tr>

            <tr>
              <td>TAX Paid</td>
              <td>{formatINR(inputGST)}</td>
            </tr>

            <tr className="fw-bold">
              <td>Difference (TAX Payable)</td>
              <td className="text-danger">{formatINR(gstPayable)}</td>
            </tr>
          </tbody>
        </Table>

        <h5 className="mt-4 mb-3">Business Summary</h5>
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>Total Invoice Raised</td>
              <td>{formatINR(totalInvoiceRaised)}</td>
            </tr>
            <tr>
              <td>Less Purchased</td>
              <td>{formatINR(totalPurchased)}</td>
            </tr>
            <tr>
              <td>Less Non-GST Expenses</td>
              <td>{formatINR(nonGstTotal)}</td>
            </tr>
            <tr>
              <td>Profit / Loss</td>
              <td className={   profitOrLoss >= 0     ? "text-success fw-bold"     : "text-danger fw-bold" }>
                {profitOrLoss >= 0 ? "+" : "-"}
                {formatINR(Math.abs(profitOrLoss))}
              </td>
            </tr>
            <tr>
              <td>Non-GST Amount</td>
              <td>{formatINR(gstPayable)}</td>
            </tr>
            <tr>
              <td>Wallet Credits</td>
              <td>{formatINR(walletCreditsTotal)}</td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={onExportExcel}>Export Excel</Button>
        <Button variant="danger" onClick={onExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncomeVsExpensePreviewModal;
