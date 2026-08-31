import apiClient from "./apiClient";

const skillService = {


  getAll: async () => {
    try {
      const res = await apiClient.get("/skills");

      console.log("RAW SKILLS API RESPONSE:", res.data);

      // 🔥 THIS WAS YOUR BUG
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error("Error fetching skills:", err);
      return [];
    }
  },



  getOne: async (id) => {
    try {
      const res = await apiClient.get(`/skills/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error fetching skill:", err);
      return null;
    }
  },

  create: async (payload) => {
    try {
      const res = await apiClient.post("/skills", payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error creating skill:", err);
      throw err;
    }
  },

  update: async (id, payload) => {
    try {
      const res = await apiClient.patch(`/skills/${id}`, payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error updating skill:", err);
      throw err;
    }
  },

  remove: async (id) => {
    try {
      const res = await apiClient.delete(`/skills/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting skill:", err);
      throw err;
    }
  },
};

export default skillService;
