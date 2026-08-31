import apiClient from "./apiClient";

const ENDPOINT = "/award-types";

// ✅ Get all award types
export const getAwardTypes = async () => {
  try {
    const response = await apiClient.get(ENDPOINT);
    if (response.data.success) {
      return response.data.data; // return array of award types
    } else {
      throw new Error(response.data.message || "Failed to fetch award types");
    }
  } catch (error) {
    console.error("getAwardTypes error:", error);
    throw error;
  }
};

// ✅ Get award type by ID
export const getAwardTypeById = async (id) => {
  try {
    const response = await apiClient.get(`${ENDPOINT}/${id}`);
    if (response.data.success) {
      return response.data.data; // return single award type
    } else {
      throw new Error(response.data.message || "Award type not found");
    }
  } catch (error) {
    console.error("getAwardTypeById error:", error);
    throw error;
  }
};

// ✅ Create a new award type
export const createAwardType = async (data) => {
  try {
    const response = await apiClient.post(ENDPOINT, data);
    if (response.data.success) {
      return response.data.data; // return created award type
    } else {
      throw new Error(response.data.message || "Failed to create award type");
    }
  } catch (error) {
    console.error("createAwardType error:", error);
    throw error;
  }
};

// ✅ Update an award type
export const updateAwardType = async (id, data) => {
  try {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, data);
    if (response.data.success) {
      return response.data.data; // return updated award type
    } else {
      throw new Error(response.data.message || "Failed to update award type");
    }
  } catch (error) {
    console.error("updateAwardType error:", error);
    throw error;
  }
};

// ✅ Delete an award type
export const deleteAwardType = async (id) => {
  try {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`);
    if (response.data.success) {
      return response.data.message; // return success message
    } else {
      throw new Error(response.data.message || "Failed to delete award type");
    }
  } catch (error) {
    console.error("deleteAwardType error:", error);
    throw error;
  }
};


const getAwardTypeName = (awardType) => {
  // If award_type is an object, extract the id from it
  const awardTypeId = awardType?.id || awardType;
  console.log("Award type data:", awardType, "Extracted ID:", awardTypeId);
  
  const type = awardTypes.find((t) => Number(t.id) === Number(awardTypeId));
  return type?.name || `ID: ${awardTypeId}`;
};