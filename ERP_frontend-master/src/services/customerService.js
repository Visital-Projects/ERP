// services/customerService.js
import apiClient from "../services/apiClient";

// Fetch all customers
export const fetchAllCustomers = async () => {
  const { data } = await apiClient.get("/customers");
  return data.data;
};

// Fetch a single customer by ID
export const fetchCustomerById = async (id) => {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data.data;
};

// Create a new customer
export const createCustomer = async (payload) => {
  const { data } = await apiClient.post("/customers", payload);
  return data.data;
};

// Update an existing customer
export const updateCustomer = async (id, payload) => {
  const { data } = await apiClient.put(`/customers/${id}`, payload);
  return data.data;
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const { data } = await apiClient.delete(`/customers/${id}`);
  return data;
};
