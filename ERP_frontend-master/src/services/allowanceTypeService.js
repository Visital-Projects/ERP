import apiClient from "./apiClient"; // your axios instance

// ✅ Get all allowance options (company scoped)
const getAllAllowanceOptions = async () => {
  const res = await apiClient.get("/allowance-options");
  return res.data.data; // returns array of allowance options
};

// ✅ Get a single allowance option by ID
const getAllowanceOptionById = async (id) => {
  const res = await apiClient.get(`/allowance-options/${id}`);
  return res.data.data; // returns single allowance option object
};

// ✅ Create a new allowance option
const createAllowanceOption = async (data) => {
  const res = await apiClient.post("/allowance-options", data);
  return res.data.data; // returns created allowance option object
};

// ✅ Update an existing allowance option
const updateAllowanceOption = async (id, data) => {
  const res = await apiClient.put(`/allowance-options/${id}`, data);
  return res.data.data; // returns updated allowance option object
};

// ✅ Delete an allowance option
const deleteAllowanceOption = async (id) => {
  const res = await apiClient.delete(`/allowance-options/${id}`);
  return res.data; // returns { success: true, message: "Allowance option deleted" }
};

// Export all functions
const allowanceTypeService = {
  getAllAllowanceOptions,
  getAllowanceOptionById,
  createAllowanceOption,
  updateAllowanceOption,
  deleteAllowanceOption,
};

export default allowanceTypeService;
