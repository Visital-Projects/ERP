// import apiClient from "./apiClient";

// const leaveTypeService = {
//   // ✅ Get all leave types
//   getAll: async (params = {}) => {
//     try {
//       const response = await apiClient.get("/leave-types", { params });
//       // backend returns { success: true, data: [...] }
//       return Array.isArray(response.data?.data) ? response.data.data : [];
//     } catch (error) {
//       console.error("Error fetching leave types:", error);
//       return [];
//     }
//   },

//   // ✅ Get one leave type by ID
//   getOne: async (id) => {
//     try {
//       const response = await apiClient.get(`/leave-types/${id}`);
//       return response.data?.data || null;
//     } catch (error) {
//       console.error(`Error fetching leave type ${id}:`, error);
//       return null;
//     }
//   },

//   // ✅ Create a leave type { title, days }
//   create: async (payload) => {
//     try {
//       const response = await apiClient.post("/leave-types", payload);
//       return response.data?.data || null;
//     } catch (error) {
//       console.error("Error creating leave type:", error);
//       throw error;
//     }
//   },

//   // ✅ Update leave type { title, days }
//   update: async (id, payload) => {
//     try {
//       const response = await apiClient.put(`/leave-types/${id}`, payload);
//       return response.data?.data || null;
//     } catch (error) {
//       console.error(`Error updating leave type ${id}:`, error);
//       throw error;
//     }
//   },

//   // ✅ Delete leave type
//   remove: async (id) => {
//     try {
//       const response = await apiClient.delete(`/leave-types/${id}`);
//       return response.data || { success: false };
//     } catch (error) {
//       console.error(`Error deleting leave type ${id}:`, error);
//       throw error;
//     }
//   },
// };

// export default leaveTypeService;


import apiClient from "./apiClient";

const leaveTypeService = {
  // ? Get all leave types 
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-types", { params });
      // backend returns { success: true, data: [...] }
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching leave types:", error);
      return [];
    }
  },

  // ? Get one leave type by ID
  getOne: async (id) => {
    try {
      const response = await apiClient.get(`/leave-types/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching leave type ${id}:`, error);
      return null;
    }
  },

  // ? Create a leave type { title, days }
  create: async (payload) => {
    try {
      const response = await apiClient.post("/leave-types", payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Error creating leave type:", error);
      throw error;
    }
  },

  // ? Update leave type { title, days }
  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/leave-types/${id}`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error updating leave type ${id}:`, error);
      throw error;
    }
  },

  // ? Delete leave type
  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/leave-types/${id}`);
      return response.data || { success: false };
    } catch (error) {
      console.error(`Error deleting leave type ${id}:`, error);
      throw error;
    }
  },
};

export default leaveTypeService;





