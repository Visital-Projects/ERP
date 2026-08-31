// src/services/indicatorService.js
import apiClient from './apiClient';

export const getIndicators = () => apiClient.get('/indicators');
export const createIndicator = (data) => apiClient.post('/indicators', data);
export const updateIndicator = (id, data) => apiClient.put(`/indicators/${id}`, data);
export const deleteIndicator = (id) => apiClient.delete(`/indicators/${id}`);

export const getCompetencies = () => apiClient.get('/competencies');
export const getBranches = () => apiClient.get('/branches');
export const getDepartments = () => apiClient.get('/departments');
export const getDesignations = () => apiClient.get('/designations');
export const getPerformanceTypes = () => apiClient.get('/performance-types');