import apiClient from "./apiClient";

export const getMeetings = async () => {
  try {
    const res = await apiClient.get("/meetings");
    // Assuming API returns meetings array in res.data.data
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return [];
  }
};

export const createMeeting = async (data) => {
  try {
    const res = await apiClient.post("/meetings", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create meeting:", error);
  }
};

export const updateMeeting = (id, data) => apiClient.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => apiClient.delete(`/meetings/${id}`);
