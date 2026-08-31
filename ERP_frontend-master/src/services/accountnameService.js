import apiClient from "../services/apiClient"; // Your axios instance

// Fetch all accounts
export const fetchAllAccounts = async () => {
  try {
    const { data } = await apiClient.get("/bank-accounts");
    return data.data; // array of accounts
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

// Get account by ID
export const getAccountById = async (id) => {
  try {
    const { data } = await apiClient.get(`/accounts/${id}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
};

// Create account
export const createAccount = async (payload) => {
  try {
    const { data } = await apiClient.post("/bank-accounts", payload);
    return data.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

// Update account
export const updateAccount = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`/bank-accounts/${id}`, payload);
    return data.data;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async (id) => {
  try {
    const { data } = await apiClient.delete(`/bank-accounts/${id}`);
    return data.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
