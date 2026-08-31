import apiClient from "./apiClient";

const BASE_URL = "/proformabill";

const proformaBillService = {
  getAllProformaBills: async () => {
    try {
      const { data } = await apiClient.get(BASE_URL);
      return data;
    } catch (error) {
      console.error("Failed to fetch proforma bills:", error);
      throw error.response?.data || error;
    }
  },

  getProformaBillById: async (id) => {
    try {
      const { data } = await apiClient.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch proforma bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  createProformaBill: async (payload) => {
    try {
      const { data } = await apiClient.post(BASE_URL, payload);
      return data;
    } catch (error) {
      console.error("Failed to create proforma bill:", error);
      throw error.response?.data || error;
    }
  },

  updateProformaBill: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`${BASE_URL}/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update proforma bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteProformaBill: async (id) => {
    try {
      const { data } = await apiClient.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete proforma bill id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  // PAYMENT METHODS
  createPayment: async (payload) => {
    try {
      const { data } = await apiClient.post("/profo-bill-payments", payload);
      return data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error.response?.data || error;
    }
  },

  getPaymentsByBill: async (proformaBillId) => {
    try {
      const { data } = await apiClient.get(`/profo-bill-payments/bill/${proformaBillId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch payments for bill ${proformaBillId}:`, error);
      throw error.response?.data || error;
    }
  },

  getPaymentById: async (id) => {
    try {
      const { data } = await apiClient.get(`/profo-bill-payments/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch payment id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  updatePayment: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`/profo-bill-payments/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update payment ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deletePayment: async (id) => {
    try {
      const { data } = await apiClient.delete(`/profo-bill-payments/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete payment ${id}:`, error);
      throw error.response?.data || error;
    }
  },
};

export default proformaBillService;
