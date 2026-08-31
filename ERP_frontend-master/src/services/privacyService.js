
//privacyService.js
import apiClient from './apiClient';


export const fetchPrivacy = async () => {
  const res = await apiClient.get('/privacypolicy');
  return res.data;
};


export const createPrivacy = async (data) => {
  const res = await apiClient.post('/privacypolicy', data);
  return res.data;
};


// export const updatePrivacy = async (data) => {
//   const res = await apiClient.put('/privacypolicy', data);
//   return res.data;
// };

export const updatePrivacy = async (id, data) => {
  const res = await apiClient.put(`/privacypolicy/${id}`, data);
  return res.data;
};