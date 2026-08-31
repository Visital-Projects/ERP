import apiClient from "./apiClient";

const purchaseService = {
  getAllPurchases: async () => {
    try {
      const { data } = await apiClient.get("/purchase-orders");
      return data;
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      throw error.response?.data || error;
    }
  },
getAllPurchaseOrderInvoices: async () => {
  try {
    const { data } = await apiClient.get("/purchase-order-invoices");
    return data;
  } catch (error) {
    console.error("Failed to fetch all PO invoices:", error);
    throw error.response?.data || error;
  }
},
  getPurchaseById: async (id) => {
    try {
      const { data } = await apiClient.get(`/purchase-orders/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch purchase order with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },
  getDraftPurchases: async () => {
  try {
    const { data } = await apiClient.get("/purchase-orders/draft");
    return data;
  } catch (error) {
    console.error("Failed to fetch draft purchase orders:", error);
    throw error.response?.data || error;
  }
},
/** ✅ CREATE PURCHASE ORDER with multiple file upload */
createPurchaseOrder: async (payload) => {
  try {
    const formData = new FormData();

    for (const key in payload) {
      if (key === "line_items") {
        formData.append("line_items", JSON.stringify(payload[key]));
      } else if (key === "documents" && Array.isArray(payload.documents)) {
        payload.documents.forEach((file) => formData.append("documents", file));
      } else {
        formData.append(key, payload[key]);
      }
    }

    const { data } = await apiClient.post("/purchase-orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error) {
    console.error("Failed to create purchase order:", error);
    throw error.response?.data || error;
  }
},

/** ✅ UPDATE PURCHASE ORDER with multiple file upload */
updatePurchaseOrder: async (id, payload) => {
  try {
    const formData = new FormData();

    for (const key in payload) {
      if (key === "line_items") {
        formData.append("line_items", JSON.stringify(payload[key]));
      } else if (key === "documents" && Array.isArray(payload.documents)) {
        payload.documents.forEach((file) => formData.append("documents", file));
      } else {
        formData.append(key, payload[key]);
      }
    }

    const { data } = await apiClient.put(`/purchase-orders/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error) {
    console.error(`Failed to update purchase order with id ${id}:`, error);
    throw error.response?.data || error;
  }
},

  deletePurchaseOrder: async (id) => {
    try {
      const { data } = await apiClient.delete(`/purchase-orders/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete purchase order with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },


  // INVOICE
  getPurchaseOrderInvoices: async (poNumber) => {
    try {
      const { data } = await apiClient.get(`/purchase-order-invoices?po_number=${poNumber}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch PO invoices:", error);
      throw error.response?.data || error;
    }
  },

  createPurchaseOrderInvoice: async (payload) => {
    try {
      const { data } = await apiClient.post("/purchase-order-invoices", payload);
      return data;
    } catch (error) {
      console.error("Failed to create PO invoice:", error);
      throw error.response?.data || error;
    }
  },

  updatePurchaseOrderInvoiceStatus: async (id, status) => {
    try {
      const { data } = await apiClient.patch(`/purchase-order-invoices/${id}`, { status });
      return data;
    } catch (error) {
      console.error(`Failed to update invoice #${id} status:`, error);
      throw error.response?.data || error;
    }
  },

  updatePurchaseOrderInvoice: async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`/purchase-order-invoices/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update invoice #${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deletePurchaseOrderInvoice: async (id) => {
    try {
      const { data } = await apiClient.delete(`/purchase-order-invoices/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete invoice #${id}:`, error);
      throw error.response?.data || error;
    }
  },


  // RAISE
    raiseInvoiceFromPO: async (payload) => {
    try {
      const { data } = await apiClient.post("/invoices/raise", payload);
      return data;
    } catch (error) {
      console.error("Failed to raise invoice:", error);
      throw error.response?.data || error;
    }
  },
    getAllInvoices: async () => {
    try {
      const { data } = await apiClient.get("/invoices/raise");
      return data;
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      throw error.response?.data || error;
    }
  },

  getInvoiceById: async (id) => {
    try {
      const { data } = await apiClient.get(`/invoices/raise/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch invoice ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  updateInvoice: async (id, payload) => {
    try {
      const { data } = await apiClient.put(`/invoices/raise/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Failed to update invoice ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteInvoice: async (id) => {
    try {
      const { data } = await apiClient.delete(`/invoices/raise/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete invoice ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  getPurchaseOrderFullDetails: async (poNumber) => {
  try {
    const { data } = await apiClient.get(`/invoices/raise/purchaseorder/${poNumber}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch full details of PO ${poNumber}:`, error);
    throw error.response?.data || error;
  }
},
};

export default purchaseService;
