// src/services/loanOptionService.js
import apiClient from "./apiClient"; // your axios instance

// ✅ Get all loan options
const getAllLoanOptions = async () => {
  const res = await apiClient.get("/loan-options");
  return res.data.data; // returns array of loan options
};

// ✅ Get single loan option by ID
const getLoanOptionById = async (id) => {
  const res = await apiClient.get(`/loan-options/${id}`);
  return res.data.data; // returns single loan option object
};

// ✅ Create loan option
const createLoanOption = async (data) => {
  const res = await apiClient.post("/loan-options", data);
  return res.data.data; // returns created option object
};

// ✅ Update loan option
const updateLoanOption = async (id, data) => {
  const res = await apiClient.put(`/loan-options/${id}`, data);
  return res.data.data; // returns updated option object
};

// ✅ Delete loan option
const deleteLoanOption = async (id) => {
  const res = await apiClient.delete(`/loan-options/${id}`);
  return res.data; // returns { success: true, message: "Deleted successfully" }
};

const loanOptionService = {
  getAllLoanOptions,
  getLoanOptionById,
  createLoanOption,
  updateLoanOption,
  deleteLoanOption,
};

export default loanOptionService;
