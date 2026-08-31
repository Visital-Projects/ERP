import apiClient from './apiClient';

// Fetch About Us page
export const fetchAboutUs = async () => {
  const res = await apiClient.get('/aboutus');
  return res.data;
};

// Create About Us page (super admin only, only once)
export const createAboutUs = async (data) => {
  const res = await apiClient.post('/aboutus', data);
  return res.data;
};

// // Update About Us page (super admin only)
// export const updateAboutUs = async (data) => {
//   const res = await apiClient.put('/aboutus', data);
//   return res.data;
// };

// Update About Us page (super admin only)
export const updateAboutUs = async (id, data) => {
  const res = await apiClient.put(`/aboutus/${id}`, data);
  return res.data;
};



// Delete About Us page (NOT ALLOWED, kept for consistency)
export const deleteAboutUs = async () => {
  throw new Error("Delete operation is not allowed for About Us");
};