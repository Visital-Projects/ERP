import apiClient from "./apiClient"; // your axios instance

// Fetch all product stocks
export const fetchProductStock = async () => {
  const res = await apiClient.get("/productstock");
  return res.data.data;
};

// Update stock for a product
export const updateProductStock = async (productId, quantity) => {
  const res = await apiClient.put(`/productstock/${productId}`, { quantity });
  return res.data;
};
