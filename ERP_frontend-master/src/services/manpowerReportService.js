// src/services/manpowerReportService.js
import apiClient from "./apiClient"; 

const BASE_URL = "/reports/manpower-salary";

const manpowerReportService = {
  // Fetch report by branchId
  getReportByBranch: async (branchId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${branchId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching manpower report:", error);
      throw error;
    }
  },
    getAllReports: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      return response.data?.data?.report || [];
    } catch (error) {
      console.error("Error fetching all manpower reports:", error);
      throw error;
    }
  },
};

export default manpowerReportService;
