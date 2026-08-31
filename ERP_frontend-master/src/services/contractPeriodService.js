import apiClient from "./apiClient";

// ✅ Get all contract periods
const getAllContractPeriods = async () => {
  const res = await apiClient.get("/contract-periods");
  return res.data.data;
};

// ✅ Get contract period by ID
const getContractPeriodById = async (id) => {
  const res = await apiClient.get(`/contract-periods/${id}`);
  return res.data.data;
};

// ✅ Get contract periods by job mode ID
const getContractPeriodsByJobModeId = async (jobModeId) => {
  const res = await apiClient.get(`/contract-periods/jobmode/${jobModeId}`);
  return res.data.data;
};

// ✅ Create contract period
const createContractPeriod = async (data) => {
  const res = await apiClient.post("/contract-periods", data);
  return res.data.data;
};

// ✅ Update contract period
const updateContractPeriod = async (id, data) => {
  const res = await apiClient.put(`/contract-periods/${id}`, data);
  return res.data.data;
};

// ✅ Delete contract period
const deleteContractPeriod = async (id) => {
  const res = await apiClient.delete(`/contract-periods/${id}`);
  return res.data;
};

const contractPeriodService = {
  getAllContractPeriods,
  getContractPeriodById,
  getContractPeriodsByJobModeId,
  createContractPeriod,
  updateContractPeriod,
  deleteContractPeriod,
};

export default contractPeriodService;