import apiClient from "./apiClient";

const departmentService = {
  // ✅ Get all departments (company-isolated, with optional filters)
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/departments", { params });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  },

  // ✅ Get a single department by ID
  getOne: async (id) => {
    try {
      const response = await apiClient.get(`/departments/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error);
      return null;
    }
  },

  // ✅ Create a department { branch_id, name }
  create: async (payload) => {
    try {
      const response = await apiClient.post("/departments", payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  },

  // ✅ Update a department { branch_id, name }
  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/departments/${id}`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error updating department ${id}:`, error);
      throw error;
    }
  },

  // ✅ Delete a department
  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting department ${id}:`, error);
      throw error;
    }
  },

  // ✅ Get all departments under a branch
  getByBranch: async (branchId) => {
    try {
      const response = await apiClient.get(`/departments/branch/${branchId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching departments for branch ${branchId}:`, error);
      return [];
    }
  },

  // ✅ Get designations under a department
 
};

export default departmentService;
