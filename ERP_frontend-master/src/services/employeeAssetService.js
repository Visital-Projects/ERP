// services/EmployeeAssetService.js
import apiClient from './apiClient';

const employeeAssetService = {
  getAll: () => apiClient.get('/assets'),
  create: (data) => apiClient.post('/assets', data),
  update: (id, data) => apiClient.put(`/assets/${id}`, data),
  delete: (id) => apiClient.delete(`/assets/${id}`),
};

export default employeeAssetService;