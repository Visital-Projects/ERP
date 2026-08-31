import apiClient from "./apiClient";

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const { data } = await apiClient.get("/expense-category");
      return data?.data || [];
    } catch (err) {
      console.error("Get categories failed:", err);
      throw err.response?.data || { message: "Failed to fetch categories" };
    }
  },

  // Create new category
  createCategory: async (name) => {
    try {
      const { data } = await apiClient.post("/expense-category", { name });
      return data?.data;
    } catch (err) {
      console.error("Create category failed:", err);
      throw err.response?.data || { message: "Failed to create category" };
    }
  },
    updateCategory: async (id, name) => {
    try {
      const { data } = await apiClient.put(`/expense-category/${id}`, { name });
      return data?.data;
    } catch (err) {
      console.error("Update category failed:", err);
      throw err.response?.data || { message: "Failed to update category" };
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const { data } = await apiClient.delete(`/expense-category/${id}`);
      return data?.data;
    } catch (err) {
      console.error("Delete category failed:", err);
      throw err.response?.data || { message: "Failed to delete category" };
    }
  },
};

export default categoryService;
