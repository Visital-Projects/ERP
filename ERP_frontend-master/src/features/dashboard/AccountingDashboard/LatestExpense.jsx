import React from "react";
import dayjs from "dayjs";

const LatestExpense = ({ expenses, loading, branches, formatCurrency }) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title">Latest Expense</h5>
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="table text-center">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>DATE</th>
                <th>BRANCH</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No expense data
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{dayjs(exp.payment_date || exp.actual_bill_date || exp.created_at).format("DD MMM YYYY")}</td>
                    <td>{branches[exp.branch_id] || exp.branch?.name || "N/A"}</td>
                    <td>₹ {formatCurrency(exp.total_amount || exp.subtotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LatestExpense;
