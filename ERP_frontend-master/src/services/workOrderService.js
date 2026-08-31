import apiClient from "./apiClient";
const BASE_URL = "/work-orders";
const INVOICE_URL = "/work-order-invoices";

const workOrderService = {
  getAllWorkOrders: async () => {
    try {
      const { data } = await apiClient.get(BASE_URL);
      return data;
    } catch (error) {
      console.error("Failed to fetch work orders:", error);
      throw error.response?.data || error;
    }
  },
  
    getAllInvoices: async () => {
    try {
      const { data } = await apiClient.get(INVOICE_URL);
      return data;
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      throw error.response?.data || error;
    }
  },
  getWorkOrderById: async (id) => {
    try {
      const { data } = await apiClient.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch work order with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },
  createWorkOrder: async (payload) => {
    try {
      const { data } = await apiClient.post(BASE_URL, payload);
      return data;
    } catch (error) {
      console.error("Failed to create work order:", error);
      throw error.response?.data || error;
    }
  },

  updateWorkOrder: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`${BASE_URL}/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update work order with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteWorkOrder: async (id) => {
    try {
      const { data } = await apiClient.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete work order with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

    createInvoice: async (payload) => {
    try {
      const { data } = await apiClient.post(INVOICE_URL, payload);
      return data;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error.response?.data || error;
    }
  },


  getInvoiceByWoNumber: async (woNumber) => {
    try {
      const { data } = await apiClient.get(`${INVOICE_URL}/summary/${woNumber}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch invoice for WO ${woNumber}:`, error);
      throw error.response?.data || error;
    }
  },
  updateInvoiceStatus: async (invoiceId, status) => {
  try {
    const { data } = await apiClient.put(`${INVOICE_URL}/${invoiceId}`, { status });
    return data;
  } catch (error) {
    console.error(`Failed to update invoice status for ID ${invoiceId}:`, error);
    throw error.response?.data || error;
  }
},  
updateInvoice: async (invoiceId, payload) => {
    try {
      const { data } = await apiClient.put(`${INVOICE_URL}/${invoiceId}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update invoice ${invoiceId}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteInvoice: async (invoiceId) => {
    try {
      const { data } = await apiClient.delete(`${INVOICE_URL}/${invoiceId}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete invoice ${invoiceId}:`, error);
      throw error.response?.data || error;
    }
  },
  getDraftWorkOrders: async () => {
  try {
    const { data } = await apiClient.get(`${BASE_URL}/drafts`);
    return data;
  } catch (error) {
    console.error("Failed to fetch draft work orders:", error);
    throw error.response?.data || error;
  }
},
getWorkOrderSummaryByNumber: async (woNumber) => {
  try {
    const { data } = await apiClient.get(`/invoices/raise/workorder/${woNumber}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch work order summary for ${woNumber}:`, error);
    throw error.response?.data || error;
  }
},
    getAllInvoicesraised: async () => {
    try {
      const { data } = await apiClient.get("/invoices/raise");
      return data;
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      throw error.response?.data || error;
    }
  },
};

export default workOrderService;
