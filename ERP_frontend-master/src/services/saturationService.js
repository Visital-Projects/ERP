// // src/services/saturationService.js
// import apiClient from './apiClient';

// export const getSaturationsByEmployee = (employeeId) =>
//   apiClient.get(`/saturation-deductions/employee/${employeeId}`);

// export const createSaturation = (data) =>
//   apiClient.post('/saturation-deductions', data);

// export const updateSaturation = (id, data) =>
//   apiClient.put(`/saturation-deductions/${id}`, data);

// export const deleteSaturation = (id) =>
//   apiClient.delete(`/saturation-deductions/${id}`);




import apiClient from "./apiClient"; // <-- handles baseURL + token

// ✅ Fetch all saturation deductions
const getAllSaturations = async () => {
  const res = await apiClient.get("/saturation-deductions");
  return res.data.data; // returns array
};

// ✅ Fetch saturation deductions by employee ID
const getSaturationsByEmployee = async (employeeId) => {
  const res = await apiClient.get(`/saturation-deductions/employee/${employeeId}`);
  return res.data.data; // returns array
};

// ✅ Create new saturation deduction
const createSaturation = async (payload) => {
  const res = await apiClient.post("/saturation-deductions", payload);
  return res.data.data; // returns created object
};

// ✅ Update saturation deduction by ID
const updateSaturation = async (id, payload) => {
  const res = await apiClient.put(`/saturation-deductions/${id}`, payload);
  return res.data.data; // returns updated object
};

// ✅ Delete saturation deduction by ID
const deleteSaturation = async (id) => {
  const res = await apiClient.delete(`/saturation-deductions/${id}`);
  return res.data; // { success: true, message: 'Deleted successfully' }
};

const saturationService = {
  getAllSaturations,
  getSaturationsByEmployee,
  createSaturation,
  updateSaturation,
  deleteSaturation,
};

export default saturationService;
