import apiClient from "./apiClient";

const ENDPOINT = "/training-types";

// ✅ Get all training types
export const getTrainingTypes = async () => {
  try {
    const response = await apiClient.get(ENDPOINT);
    if (response.data.success) {
      return response.data.data; // return only the array of types
    } else {
      throw new Error(response.data.message || "Failed to fetch training types");
    }
  } catch (error) {
    console.error("getTrainingTypes error:", error);
    throw error;
  }
};

// ✅ Create a new training type
export const createTrainingType = async (data) => {
  try {
    const response = await apiClient.post(ENDPOINT, data);
    if (response.data.success) {
      return response.data.data; // return the created type
    } else {
      throw new Error(response.data.message || "Failed to create training type");
    }
  } catch (error) {
    console.error("createTrainingType error:", error);
    throw error;
  }
};

// ✅ Update an existing training type
export const updateTrainingType = async (id, data) => {
  try {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, data);
    if (response.data.success) {
      return response.data.data; // return the updated type
    } else {
      throw new Error(response.data.message || "Failed to update training type");
    }
  } catch (error) {
    console.error("updateTrainingType error:", error);
    throw error;
  }
};

// ✅ Delete a training type
export const deleteTrainingType = async (id) => {
  try {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`);
    if (response.data.success) {
      return response.data.message; // return the success message
    } else {
      throw new Error(response.data.message || "Failed to delete training type");
    }
  } catch (error) {
    console.error("deleteTrainingType error:", error);
    throw error;
  }
};
