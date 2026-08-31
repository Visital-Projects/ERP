import { useEffect, useState } from "react";
import expenseService from "../services/expensessService";

const initArray = () => Array(12).fill(0);

const useExpenseData = () => {
  const [expenseData, setExpenseData] = useState({
    cashTotal: initArray(),
    creditTotal: initArray(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      const [expenseRes, creditRes] = await Promise.all([
        expenseService.getAllExpenses(),
        expenseService.getAllCreditPurchases(),
      ]);

      const cashTotal = initArray();
      const creditTotal = initArray();

      expenseRes?.data?.forEach((e) => {
        if (!e.payment_date) return;
        const d = new Date(e.payment_date);
        cashTotal[d.getMonth()] += Number(e.total_amount || 0);
      });

      creditRes?.data?.forEach((c) => {
        const d = new Date(c.payment_date || c.createdAt);
        creditTotal[d.getMonth()] += Number(c.total_amount || 0);
      });

      setExpenseData({ cashTotal, creditTotal });
    } catch (err) {
      console.error("Failed to load expense data", err);
    } finally {
      setLoading(false);
    }
  };

  return { expenseData, loading };
};

export default useExpenseData;
