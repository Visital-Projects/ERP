


// // src/services/commissionService.js
// import apiClient from "./apiClient";

// // Fetch ALL commissions (admin/global)
// export const getAllCommissions = async () => {
//   const res = await apiClient.get("/commissions");
//   return res.data.data;
// };

// // Fetch commissions for a particular employee
// export const getCommissionsByEmployee = async (employeeId) => {
//   if (!employeeId) throw new Error("Employee ID is required");
//   const res = await apiClient.get(`/commissions/employee/${employeeId}`);
//   return res.data.data || [];
// };

// // Create a new commission
// export const createCommission = async (data) => {
//   const res = await apiClient.post("/commissions", data);
//   return res.data;
// };

// // Delete a commission
// export const deleteCommission = async (id) => {
//   const res = await apiClient.delete(`/commissions/${id}`);
//   return res.data;
// };


import apiClient from "./apiClient";

// Fetch ALL commissions (admin/global)
export const getAllCommissions = async () => {
  const res = await apiClient.get("/commissions");
  return res.data.data;
};

// Fetch commissions for a particular employee
export const getCommissionsByEmployee = async (employeeId) => {
  if (!employeeId) throw new Error("Employee ID is required");
  const res = await apiClient.get(`/commissions/employee/${employeeId}`);
  return res.data.data || [];
};

// Create a new commission
export const createCommission = async (data) => {
  const res = await apiClient.post("/commissions", data);
  return res.data;
};

// ✅ NEW: Update an existing commission
export const updateCommission = async (id, data) => {
  const res = await apiClient.put(`/commissions/${id}`, data);
  return res.data;
};

// Delete a commission
export const deleteCommission = async (id) => {
  const res = await apiClient.delete(`/commissions/${id}`);
  return res.data;
};
