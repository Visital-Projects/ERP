import apiClient from "./apiClient"; 

const incomeService = {
  getAllIncome: async () => {
    try {
      const { data } = await apiClient.get("/income");
      return data;
    } catch (err) {
      console.error("Get all income failed:", err);
      throw err.response?.data || { message: "Failed to fetch income data" };
    }
  },
};

export default incomeService;
