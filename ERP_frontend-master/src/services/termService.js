
//termService.js
import apiClient from './apiClient';

export const fetchTerms = async () => {
  const res = await apiClient.get('/terms');
  return res.data; // returns { success, data: {...} }
};

export const createTerms = async (data, token) => {
  const res = await apiClient.post('/terms', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// export const updateTerms = async (data, token) => {
//   const res = await apiClient.put('/terms', data, {
//     headers: { Authorization: `Bearer ${token}` }
//   });
//   return res.data;
// };

export const updateTerms = async (id, data, token) => { // Add id parameter
  const res = await apiClient.put(`/terms/${id}`, data, { // Include id in URL
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteTerms = async (token) => {
  const res = await apiClient.delete('/terms', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

  
