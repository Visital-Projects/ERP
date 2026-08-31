

// src/services/invoiceItemService.js
import apiClient from "./apiClient"; // axios instance with baseURL + auth headers

// ✅ Create multiple items for an invoice
export const createInvoiceItems = async (payload) => {
  const { data } = await apiClient.post("/invoice-items", payload);
  return data;
};

// ✅ Get items for a specific invoice
export const fetchItemsByInvoice = async (invoiceId) => {
  const { data } = await apiClient.get(`/invoice-items/${invoiceId}`);
  return data.data;
};

// ✅ Get all invoice items (no filter)
export const fetchAllInvoiceItems = async () => {
  const { data } = await apiClient.get("/invoice-items");
  return data.data;
};

// ✅ Get a single item by ID
export const fetchInvoiceItemById = async (id) => {
  const { data } = await apiClient.get(`/invoice-items/${id}`);
  return data.data?.[0] || null;
};

// ✅ Update an item
export const updateInvoiceItem = async (id, payload) => {
  const { data } = await apiClient.put(`/invoice-items/${id}`, payload);
  return data.data;
};

// ✅ Delete an item
export const deleteInvoiceItem = async (id) => {
  const { data } = await apiClient.delete(`/invoice-items/${id}`);
  return data;
};