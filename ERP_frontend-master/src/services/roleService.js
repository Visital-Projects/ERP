import apiClient from './apiClient';

export const fetchRoles = async () => {
  const res = await apiClient.get('/roleusers');
  return res.data;
};

export const createRole = async (data) => {
  const res = await apiClient.post('/roleusers', data);
  return res.data;
};

export const updateRole = async (id, data) => {
  const res = await apiClient.put(`/roleusers/${id}`, data);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await apiClient.delete(`/roleusers/${id}`);
  return res.data;
};


export const fetchPermissions = async () => {
  const res = await apiClient.get("/permissions");
  return res.data;
};