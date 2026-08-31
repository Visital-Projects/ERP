import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrumb";
import ExpenseForm from "./ExpenseForm";
import AdvanceSalaryForm from "./AdvanceSalaryForm";
import expenseService from "../../../services/expensessService";
import { redirectToRepresentativeBranchWallet } from "../Banking/walletAccountingHelpers";
import "../ExpenseCreate.css"; 

const ExpenseCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();
  const expenseId = routeId || location.state?.expenseId;
  const isEditMode = Boolean(expenseId);

  const [selectedType, setSelectedType] = useState("expense");
  const [existingExpense, setExistingExpense] = useState(null);

  useEffect(() => {
    if (expenseId) {
      fetchExpense(expenseId);
    }
  }, [expenseId]);

  const fetchExpense = async (id) => {
    try {
      const pem = await expenseService.getExpenseById(id);
      if (pem?.success && (pem.data?.expense || pem.data)) {
        setExistingExpense(pem.data?.expense || pem.data);
      }
    } catch (err) {
      console.error("Failed to fetch expense:", err);
    }
  };

  const handleExpenseSuccess = async (createdBranchId) => {
    const targetBranchId = createdBranchId || location.state?.branchId || existingExpense?.branch_id;
    await redirectToRepresentativeBranchWallet(targetBranchId, navigate, {
      toastInstance: toast,
      fallbackRoute: "/accounting/expenses",
    });
  };

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>
            {isEditMode
              ? "Update Non-GST Purchase"
              : selectedType === "expense"
              ? "Create Non-GST Purchase"
              : "Create Advance Salary"}
          </h4>
          <BreadCrumb
            pathname="/accounting/expenses"
            lastLabel={
              isEditMode
                ? "Update Non-GST Purchase"
                : selectedType === "expense"
                ? "Create Expense"
                : "Advance Salary"
            }
            dynamicNames={{ expenses: "Expenses" }}
          />
        </div>
      </div>

      {/* Radio Toggle (Create mode only) */}
      {!isEditMode && (
        <Card className="p-3 mb-3">
          <div className="d-flex gap-4 align-items-center expense-create-radio-group">
            <label className="expense-create-radio">
              <input
                type="radio"
                name="entryType"
                value="expense"
                checked={selectedType === "expense"}
                onChange={() => setSelectedType("expense")}
              />
              <span className="expense-create-radio-circle"></span>
              <span>Non GST Purchase</span>
            </label>

            <label className="expense-create-radio">
              <input
                type="radio"
                name="entryType"
                value="advance_salary"
                checked={selectedType === "advance_salary"}
                 onChange={() => setSelectedType("advance_salary")}
              />
              <span className="expense-create-radio-circle"></span>
              <span>Advance Salary</span>
            </label>
          </div>
        </Card>
      )}


      {selectedType === "expense" && (
        <ExpenseForm
          initialBranchId={location.state?.branchId}
          initialAmount={location.state?.amount}
          initialDescription={location.state?.description}
          initialTransactionDate={location.state?.transactionDate}
          existingExpense={existingExpense}
          onCancel={() => navigate("/accounting/expenses")}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {!isEditMode && selectedType === "advance_salary" && (
        <AdvanceSalaryForm
          branchId={location.state?.branchId}
          onCancel={() => navigate("/accounting/expenses")}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </div>
  );
};

export default ExpenseCreate;