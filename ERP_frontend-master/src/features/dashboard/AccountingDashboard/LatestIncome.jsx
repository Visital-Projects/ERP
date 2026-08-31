import React from "react";
import dayjs from "dayjs";

const LatestIncome = ({ incomes, loading, branches, formatCurrency }) => {
  const getSaleBillAmount = (bill) =>
    Number(
      bill?.services?.reduce((sum, service) => {
        const total = Number(service?.total_amount != null ? service.total_amount : 0);
        const fallback = Number(service?.rate || 0) * Number(service?.quantity || 0);
        return sum + (total || fallback);
      }, 0) || 0
    );

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title">Latest Income</h5>
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
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No income data
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
                  <tr key={inc.id}>
                    <td>{dayjs(inc.invoice_date || inc.created_at).format("DD MMM YYYY")}</td>
                    <td>{branches[inc.assigned_to] || inc.site?.name || "N/A"}</td>
                    <td>₹ {formatCurrency(getSaleBillAmount(inc))}</td>
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

export default LatestIncome;
