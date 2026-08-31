// import apiClient from "./apiClient";

// const ENDPOINT = "/deduction-options";

// const deductionService = {
//   getAll: async () => {
//     try {
//       const res = await apiClient.get(ENDPOINT);
//       // unwrap data for easier usage in frontend
//       return Array.isArray(res.data?.data) ? res.data.data : [];
//     } catch (err) {
//       console.error("Error fetching deduction options:", err);
//       return [];
//     }
//   },

//   create: async (payload) => {
//     try {
//       const res = await apiClient.post(ENDPOINT, payload);
//       return res.data?.data || null;
//     } catch (err) {
//       console.error("Error creating deduction option:", err);
//       return null;
//     }
//   },

//   update: async (id, payload) => {
//     try {
//       const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
//       return res.data?.data || null;
//     } catch (err) {
//       console.error("Error updating deduction option:", err);
//       return null;
//     }
//   },

//   remove: async (id) => {
//     try {
//       const res = await apiClient.delete(`${ENDPOINT}/${id}`);
//       return res.data || { success: false };
//     } catch (err) {
//       console.error("Error deleting deduction option:", err);
//       return { success: false };
//     }
//   },
// };

// export default deductionService;



import apiClient from "./apiClient"; // <-- handles baseURL + token

// ✅ Get all deduction options
const getAllDeductions = async () => {
  const res = await apiClient.get("/deduction-options");
  return res.data.data;
};

// ✅ Get deduction option by ID
const getDeductionById = async (id) => {
  const res = await apiClient.get(`/deduction-options/${id}`);
  return res.data.data;
};

// ✅ Create deduction option
const createDeduction = async (payload) => {
  const res = await apiClient.post("/deduction-options", payload);
  return res.data.data;
};

// ✅ Update deduction option
const updateDeduction = async (id, payload) => {
  const res = await apiClient.put(`/deduction-options/${id}`, payload);
  return res.data.data;
};

// ✅ Delete deduction option
const deleteDeduction = async (id) => {
  const res = await apiClient.delete(`/deduction-options/${id}`);
  return res.data;
};

const deductionService = {
  getAllDeductions,
  getDeductionById,
  createDeduction,
  updateDeduction,
  deleteDeduction,
};

export default deductionService;
