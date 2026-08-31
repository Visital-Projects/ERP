import apiClient from "./apiClient";

const BASE_URL = "/salebill";

const salebillService = {
  getAllSaleBills: async () => {
    try {
      const { data } = await apiClient.get(BASE_URL);
      return data;
    } catch (error) {
      console.error("Failed to fetch sale bills:", error);
      throw error.response?.data || error;
    }
  },

  getSaleBillById: async (id) => {
    try {
      const { data } = await apiClient.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch sale bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  createSaleBill: async (payload) => {
    try {
      const { data } = await apiClient.post(BASE_URL, payload);
      return data;
    } catch (error) {
      console.error("Failed to create sale bill:", error);
      throw error.response?.data || error;
    }
  },

  updateSaleBill: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`${BASE_URL}/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update sale bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteSaleBill: async (id) => {
    try {
      const { data } = await apiClient.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete sale bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  // PAYMENT METHODS
  createPayment: async (payload) => {
    try {
      const { data } = await apiClient.post("sale-bill-payments", payload);
      return data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error.response?.data || error;
    }
  },

  getPaymentsByBill: async (saleBillId) => {
    try {
      const { data } = await apiClient.get(`sale-bill-payments/bill/${saleBillId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch payments for bill ${saleBillId}:`, error);
      throw error.response?.data || error;
    }
  },

  updatePayment: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`sale-bill-payments/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update payment ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deletePayment: async (id) => {
    try {
      const { data } = await apiClient.delete(`sale-bill-payments/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete payment ${id}:`, error);
      throw error.response?.data || error;
    }
  },
};

export default salebillService;
