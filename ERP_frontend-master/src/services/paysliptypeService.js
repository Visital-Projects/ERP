// services/paysliptypeService.js
import apiClient from "./apiClient";

const payslipTypeService = {
  getAll: async () => {
    try {
      const res = await apiClient.get("/payslip-types");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error("Error fetching payslip types:", err);
      return [];
    }
  },
  getOne: async (id) => {
    try {
      const res = await apiClient.get(`/payslip-types/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`Error fetching payslip type ${id}:`, err);
      return null;
    }
  },
  create: async (payload) => {
    try {
      const res = await apiClient.post("/payslip-types", payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error creating payslip type:", err);
      throw err;
    }
  },
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/payslip-types/${id}`, payload);
      return res.data?.data || null;
    } catch (err) {
      console.error(`Error updating payslip type ${id}:`, err);
      throw err;
    }
  },
  remove: async (id) => {
    try {
      const res = await apiClient.delete(`/payslip-types/${id}`);
      return res.data || { success: false };
    } catch (err) {
      console.error(`Error deleting payslip type ${id}:`, err);
      throw err;
    }
  },
};

export default payslipTypeService;
