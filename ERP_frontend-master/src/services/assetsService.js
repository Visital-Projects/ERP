// src/services/assetsService.js
import apiClient from "./apiClient"; // Your Axios instance with baseURL & token interceptor

// ✅ Fetch all assets
export const fetchAllAssets = async () => {
  const { data } = await apiClient.get("/assets");
  return data.data; // backend sends { success, data }
};

// ✅ Fetch single asset by ID
export const fetchAssetById = async (id) => {
  const { data } = await apiClient.get(`/assets/${id}`);
  return data.data;
};

// ✅ Create new asset
export const createAsset = async (assetData) => {
  const { data } = await apiClient.post("/assets", assetData);
  return data.data;
};

// ✅ Update existing asset
export const updateAsset = async (id, assetData) => {
  const { data } = await apiClient.put(`/assets/${id}`, assetData);
  return data.data;
};

// ✅ Delete asset
export const deleteAsset = async (id) => {
  const { data } = await apiClient.delete(`/assets/${id}`);
  return data;
};