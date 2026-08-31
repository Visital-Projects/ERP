import React from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Wallet } from "react-bootstrap-icons";

const EXPENSE_TYPE = {
  SITE_EXPENSE: "site_expense",
  COMPANY_EXPENSE: "company_expense"
};

const shortMonth = (m) => m.substring(0, 3).toUpperCase();

const formatINR = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ExpenseSummaryPreviewModal = ({
  show,
  onHide,
  months,
  filteredData,
  filterHeading,
  expenseTypeFilter,
  walletSummary,
  walletTotals
}) => {
  if (!filteredData) return null;

// Build export rows - Updated to show both cash and credit for site expense
const buildExportRows = () => {
  return months.map((m, i) => {
    const row = {
      Month: shortMonth(m),
      // Total_Expense: (filteredData.cashTotal[i] || 0) + (filteredData.creditTotal[i] || 0)
    };

    // For site expense - show BOTH cash and credit
    if (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE) {
      // Cash columns
      row.CashPurchase_Base = filteredData.cashSubtotal[i] || 0;
      row.CashPurchase_GST = filteredData.cashTax[i] || 0;
      row.CashPurchase_Total = filteredData.cashTotal[i] || 0;
      
      // Credit columns (for site level credit purchases)
      row.CreditPurchase_Base = filteredData.creditSubtotal[i] || 0;
      row.CreditPurchase_GST = filteredData.creditTax[i] || 0;
      row.CreditPurchase_Total = filteredData.creditTotal[i] || 0;
      
      // Combined total
      row.Combined_Total = (filteredData.cashTotal[i] || 0) + (filteredData.creditTotal[i] || 0);
    } else {
      // Company expense - show only credit
      row.Credit_Base = filteredData.creditSubtotal[i] || 0;
      row.Credit_Tax = filteredData.creditTax[i] || 0;
      row.Total = filteredData.creditTotal[i] || 0;
    }

    return row;
  });
};

  const handleExportExcel = () => {
    const rows = buildExportRows();
    
    // Add filter info as first row
    const filterRow = { Month: "FILTER APPLIED", Total_Expense: filterHeading };
    const allRows = [filterRow, {}, ...rows];
    
    const ws = XLSX.utils.json_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    
    const sheetName = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
      ? "Site Expense Summary" 
      : "Company Expense Summary";
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    const rows = buildExportRows();

    doc.setFontSize(14);
    doc.text(
      expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
        ? "Site Expense Summary (Cash Purchase)" 
        : "Company Expense Summary (Credit Purchase)", 
      40, 30
    );

    if (filterHeading) {
      doc.setFontSize(10);
      doc.text(filterHeading, 40, 50);
    }

    autoTable(doc, {
      startY: filterHeading ? 70 : 50,
      head: [Object.keys(rows[0])],
      body: rows.map(r => Object.values(r)),
      styles: { fontSize: 8 },
    });

    const fileName = expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
      ? "Site_Expense_Summary.pdf" 
      : "Company_Expense_Summary.pdf";
    
    doc.save(fileName);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" className="d-flex justify-content-center" dialogClassName="invoice-preview-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <div>
            <h5>
              {expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
                ? "Site Expense Summary (Cash Purchase)" 
                : "Company Expense Summary (Credit Purchase)"}
            </h5>
            {filterHeading && (
              <p className="text-muted mb-0 small">
                <strong>Filter:</strong> {filterHeading}
              </p>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Expense Summary Table - MATCHES MAIN TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>TYPE</th>
                {months.map((m) => (
                  <th key={m}>{shortMonth(m)}</th>
                ))}
              </tr>
            </thead>

            <tbody>
{/* Cash & Credit Purchase Sections - For Site Expense show both */}
{expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE && (
  <>
    {/* Cash Purchase Section */}
    <tr className="fw-semibold">
      <td>Cash Purchase :</td>
      {months.map((_, i) => <td key={i}></td>)}
    </tr>

    <tr>
      <td>Cash Base Amount</td>
      {filteredData.cashSubtotal.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>

    <tr>
      <td>Cash GST Amount</td>
      {filteredData.cashTax.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>

    <tr className="fw-bold">
      <td>Cash Total Amount</td>
      {filteredData.cashTotal.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>

    {/* Credit Purchase Section - for Site level */}
    <tr className="fw-semibold mt-2">
      <td>Credit Purchase (Site Level) :</td>
      {months.map((_, i) => <td key={i}></td>)}
    </tr>

    <tr>
      <td>Credit Base Amount</td>
      {filteredData.creditSubtotal.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>

    <tr>
      <td>Credit GST Amount</td>
      {filteredData.creditTax.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>

    <tr className="fw-bold">
      <td>Credit Total Amount</td>
      {filteredData.creditTotal.map((v, i) => (
        <td key={i}>{formatINR(v)}</td>
      ))}
    </tr>
  </>
)}

              {/* Credit Purchase Section - Only for Company Expense */}
              {expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE && (
                <>
                  <tr className="fw-semibold">
                    <td>Credit Purchase :</td>
                    {months.map((_, i) => <td key={i}></td>)}
                  </tr>

                  <tr>
                    <td>Base Amount</td>
                    {filteredData.creditSubtotal.map((v, i) => (
                      <td key={i}>{formatINR(v)}</td>
                    ))}
                  </tr>

                  <tr>
                    <td>GST Amount</td>
                    {filteredData.creditTax.map((v, i) => (
                      <td key={i}>{formatINR(v)}</td>
                    ))}
                  </tr>

                  <tr className="fw-bold">
                    <td>Total Amount</td>
                    {filteredData.creditTotal.map((v, i) => (
                      <td key={i}>{formatINR(v)}</td>
                    ))}
                  </tr>
                </>
              )}

{/* Overall Expense - Always shown */}
<tr className="fw-semibold table-secondary">
  <td>Total Expense :</td>
  {months.map((_, i) => <td key={i}></td>)}
</tr>

<tr className="fw-bold text-danger">
  <td>Expense</td>
  {months.map((_, i) => (
    <td key={i}>
      {formatINR(
        // For site expense: cash + credit
        // For company expense: credit only
        (expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE 
          ? (filteredData.cashTotal[i] || 0) + (filteredData.creditTotal[i] || 0)
          : (expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE 
              ? (filteredData.creditTotal[i] || 0)
              : 0)
        )
      )}
    </td>
  ))}
</tr>
            </tbody>
          </table>
        </div>

        {/* Wallet Summary - Only for Company Expense */}
        {expenseTypeFilter === EXPENSE_TYPE.COMPANY_EXPENSE && walletSummary && (
          <div className="mt-4">
            <h6 className="mb-3">
              <Wallet className="me-2 text-purple" />
              Site Wallet Summary
            </h6>
            <div className="table-responsive">
              <Table bordered size="sm">
                <thead className="bg-light">
                  <tr>
                    <th>Site Name</th>
                    <th className="text-end">Total Credited</th>
                    <th className="text-end">Total Used</th>
                    <th className="text-end">Current Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(walletSummary).map(([branchId, site]) => (
                    <tr key={branchId}>
                      <td>{site.branchName}</td>
                      <td className="text-end">{formatINR(site.totalCredited)}</td>
                      <td className="text-end">{formatINR(site.totalDebited)}</td>
                      <td className="text-end">{formatINR(site.currentBalance)}</td>
                    </tr>
                  ))}
                </tbody>
                {walletTotals && (
                  <tfoot className="bg-light">
                    <tr>
                      <th>TOTAL</th>
                      <th className="text-end">{formatINR(walletTotals.totalCredited)}</th>
                      <th className="text-end">{formatINR(walletTotals.totalDebited)}</th>
                      <th className="text-end">{formatINR(walletTotals.totalBalance)}</th>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            <span className="text-muted small">
              Showing: {expenseTypeFilter === EXPENSE_TYPE.SITE_EXPENSE ? 'Site Expense (Cash)' : 'Company Expense (Credit)'}
            </span>
          </div>
          <div className="d-flex gap-2">
            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="danger" onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ExpenseSummaryPreviewModal;