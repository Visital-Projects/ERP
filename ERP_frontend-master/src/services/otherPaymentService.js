// // src/services/otherPaymentService.js
// import apiClient from './apiClient';

// export const getOtherPaymentsByEmployee = (employeeId) =>
//   apiClient.get(`/other-payments/employee/${employeeId}`);

// export const createOtherPayment = (data) =>
//   apiClient.post('/other-payments', data);

// export const updateOtherPayment = (id, data) =>
//   apiClient.put(`/other-payments/${id}`, data);

// export const deleteOtherPayment = (id) =>
//   apiClient.delete(`/other-payments/${id}`);


// src/services/otherPaymentService.js
import apiClient from "./apiClient";

// ✅ Get all other payments (company or self if employee)
export const getAllOtherPayments = async () => {
  const res = await apiClient.get("/other-payments");
  return res.data.data;
};

// ✅ Get other payments for a specific employee
export const getOtherPaymentsByEmployee = async (employeeId) => {
  const res = await apiClient.get(`/other-payments/employee/${employeeId}`);
  return res.data.data;
};

// ✅ Create a new other payment
export const createOtherPayment = async (data) => {
  const res = await apiClient.post("/other-payments", data);
  return res.data.data;
};

// ✅ Update an existing other payment
export const updateOtherPayment = async (id, data) => {
  const res = await apiClient.put(`/other-payments/${id}`, data);
  return res.data.data;
};

// ✅ Delete an other payment
export const deleteOtherPayment = async (id) => {
  const res = await apiClient.delete(`/other-payments/${id}`);
  return res.data; // usually returns { success: true, message }
};

export default {
  getAllOtherPayments,
  getOtherPaymentsByEmployee,
  createOtherPayment,
  updateOtherPayment,
  deleteOtherPayment,
};
