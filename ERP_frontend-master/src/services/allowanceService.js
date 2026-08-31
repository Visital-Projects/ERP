import apiClient from "./apiClient";

const getAllowancesByEmployee = async (employeeId) => {
  try {
    const res = await apiClient.get(`/allowances/employee/${employeeId}`);
    return res.data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return []; // no allowances found, return empty array
    }
    throw err;
  }
};

const createAllowance = async (payload) => {
  const res = await apiClient.post("/allowances", payload);
  return res.data.data;
};

const updateAllowance = async (id, payload) => {
  const res = await apiClient.put(`/allowances/${id}`, payload);
  return res.data.data;
};

const deleteAllowance = async (id) => {
  const res = await apiClient.delete(`/allowances/${id}`);
  return res.data;
};

export default {
  getAllowancesByEmployee,
  createAllowance,
  updateAllowance,
  deleteAllowance,
};
