import apiClient from "./apiClient";

const reportService = {
    getExpenseSummary: async () => {
    try {
      const { data } = await apiClient.get("/expenses/summary");

      if (data?.success && data?.data) {
        return data.data; // Return the summarized expense data
      } else {
        console.error("Failed to fetch expense summary:", data?.message);
        throw new Error(data?.message || "Failed to fetch expense summary");
      }
    } catch (err) {
      console.error("Error fetching expense summary:", err);
      throw err;
    }
  },
    getIncomeSummary: async () => {
    try {
      const { data } = await apiClient.get("/expenses/IncomeSummary");

      if (data?.success && data?.data) {
        return data.data; 
      } else {
        console.error("Failed to fetch income summary:", data?.message);
        throw new Error(data?.message || "Failed to fetch income summary");
      }
    } catch (err) {
      console.error("Error fetching income summary:", err);
      throw err;
    }
  },
};

export default reportService;
