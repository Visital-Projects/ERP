import apiClient from "./apiClient"; // Axios instance with baseURL & token interceptor

const expenseService = {
  getExpenseById: async (expenseId) => {
    try {
      const { data } = await apiClient.get(`/expense/detail/${expenseId}`);
      return data;
    } catch (err) {
      console.error("Get expense by ID failed:", err);
      throw err.response?.data || { message: "Failed to fetch expense" };
    }
  },
  createExpense: async (formData) => {
    try {
      const { data } = await apiClient.post("/expense", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      console.error("Create expense failed:", err);
      throw err.response?.data || { message: "Failed to create expense" };
    }
  },
  updateExpense: async (expenseId, formData) => {
    try {
      const { data } = await apiClient.put(`/expense/${expenseId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      console.error("Update expense failed:", err);
      throw err.response?.data || { message: "Failed to update expense" };
    }
  },
  getAllExpenses: async () => {
    try {
      const { data } = await apiClient.get("/expense");
      return data;
    } catch (err) {
      console.error("Get all expenses failed:", err);
      throw err.response?.data || { message: "Failed to fetch expenses" };
    }
  },
  getExpensesByBranch: async (branchId) => {
    try {
      const { data } = await apiClient.get(`/expense/${branchId}`);
      return data;
    } catch (err) {
      console.error("Get branch expenses failed:", err);
      throw err.response?.data || { message: "Failed to fetch branch expenses" };
    }
  },
  deleteExpense: async (expenseId) => {
    try {
      const { data } = await apiClient.delete(`/expense/${expenseId}`);
      return data;
    } catch (err) {
      console.error("Delete expense failed:", err);
      throw err.response?.data || { message: "Failed to delete expense" };
    }
  },
  employeeAdvancePayment: async (payload) => {
    try {
      const { data } = await apiClient.post("/expense/advance", payload);
      return data;
    } catch (err) {
      console.error("Advance payment failed:", err);
      throw err.response?.data || { message: "Failed to record advance payment" };
    }
  },

     createCreditPurchase: async (formData) => {
    try {
      const { data } = await apiClient.post("/credit-purchase", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      console.error("Create credit purchase failed:", err);
      throw err.response?.data || { message: "Failed to create credit purchase" };
    }
  },

  payCreditPurchase: async (creditPurchaseId, formData) => {
    try {
      const { data } = await apiClient.patch(`/credit-purchase/${creditPurchaseId}/pay`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      console.error("Pay/Edit credit purchase failed:", err);
      throw err.response?.data || { message: "Failed to pay/edit credit purchase" };
    }
  },

  
updateCreditPurchase: async (creditPurchaseId, formData) => {
  try {
    const { data } = await apiClient.put(`/credit-purchase/${creditPurchaseId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    console.error("Update credit purchase failed:", err);
    throw err.response?.data || { message: "Failed to update credit purchase" };
  }
},

  getAllCreditPurchases: async () => {
    try {
      const { data } = await apiClient.get("/credit-purchase");
      return data;
    } catch (err) {
      console.error("Get credit purchases failed:", err);
      throw err.response?.data || { message: "Failed to fetch credit purchases" };
    }
  },

  getCreditPurchaseById: async (creditPurchaseId) => {
    try {
      const { data } = await apiClient.get(`/credit-purchase/${creditPurchaseId}`);
      return data;
    } catch (err) {
      console.error("Get credit purchase by ID failed:", err);
      throw err.response?.data || { message: "Failed to fetch credit purchase" };
    }
  },

  deleteCreditPurchase: async (creditPurchaseId) => {
    try {
      const { data } = await apiClient.delete(`/credit-purchase/${creditPurchaseId}`);
      return data;
    } catch (err) {
      console.error("Delete credit purchase failed:", err);
      throw err.response?.data || { message: "Failed to delete credit purchase" };
    }
  },
};

export default expenseService;
