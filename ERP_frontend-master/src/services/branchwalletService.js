// src/services/branchwalletService.js
import apiClient from "./apiClient"; 
// ===============================
// Branch Wallet Service
// ===============================
const branchWalletService = {
  // Get all branch wallets
  getAllWallets: async () => {
    try {
      const { data } = await apiClient.get("/branch-wallets");
      return data;
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      throw error.response?.data || error;
    }
  },

  // Get wallet by ID
  getWalletById: async (id) => {
    try {
      const { data } = await apiClient.get(`/branch-wallet/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch wallet with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  // Create new wallet
  createWallet: async (walletData) => {
    try {
      const { data } = await apiClient.post("/branch-wallets", walletData);
      return data;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw error.response?.data || error;
    }
  },

  // Update wallet
  updateWallet: async (id, walletData) => {
    try {
      const { data } = await apiClient.patch(`/branch-wallets/${id}`, walletData);
      return data;
    } catch (error) {
      console.error(`Failed to update wallet with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  // Delete wallet
  deleteWallet: async (id) => {
    try {
      const { data } = await apiClient.delete(`/branch-wallets/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to delete wallet with id ${id}:`, error);
      throw error.response?.data || error;
    }
  },

  // Get wallet transactions (all)
  getWalletTransactions: async () => {
    try {
      const { data } = await apiClient.get("/branch-wallets");
      return data;
    } catch (error) {
      console.error("Failed to fetch wallet transactions:", error);
      throw error.response?.data || error;
    }
  },

  getBranchTransactions: async (branchId) => {
  try {
    const { data } = await apiClient.get(`/branch-wallets/transactions/${branchId}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch transactions for branch ${branchId}:`, error);
    throw error.response?.data || error;
  }
},
  requestExtraExpense: async (payload) => {
    try {
      const { data } = await apiClient.post("/fund-request", payload);
      return data;
    } catch (error) {
      console.error("Failed to request extra expense:", error);
      throw error.response?.data || error;
    }
  },
  getMyFundRequests: async () => {
  try {
    const { data } = await apiClient.get("/fund-request/my");
    return data;
  } catch (error) {
    console.error("Failed to fetch my fund requests:", error);
    throw error.response?.data || error;
  }
},

getAllFundRequests: async () => {
  try {
    const { data } = await apiClient.get("/fund-request");
    return data;
  } catch (error) {
    console.error("Failed to fetch all fund requests:", error);
    throw error.response?.data || error;
  }
},
processFundRequest: async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`/fund-request/${id}/process`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to process fund request ${id}:`, error);
    throw error.response?.data || error;
  }
},

};


export default branchWalletService;
