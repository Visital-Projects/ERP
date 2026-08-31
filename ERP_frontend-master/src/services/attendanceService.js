// src/services/attendanceService.js
import apiClient from './apiClient';

const BASE_URL = '/attendance';

const attendanceService = {
  create: (data) => apiClient.post(BASE_URL, data),
  getAll: (params = {}) => apiClient.get(BASE_URL, { params }),
  getById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  update: (id, data) => apiClient.put(`${BASE_URL}/${id}`, data),
  patch: (id, data) => apiClient.patch(`${BASE_URL}/${id}`, data), 
  delete: (id) => apiClient.delete(`${BASE_URL}/${id}`),
  filter: (params) => apiClient.get(BASE_URL, { params }),

  verifyAttendance: (employeeId, data) =>
    apiClient.post(`${BASE_URL}/verify/${employeeId}`, data),

  updateEarlyLeaving: (employeeCode, data) =>
    apiClient.patch(`${BASE_URL}/early-leaving/${employeeCode}`, data),

  updateOvertime: (employeeCode, data) =>
    apiClient.patch(`${BASE_URL}/overtime/${employeeCode}`, data),

  getEmployeeAttendanceSummary: (employeeCode, params = {}) =>
    apiClient.get(`/attendance/attendance-summary/${employeeCode}`, { params }),

  getByDate: (date) =>
    apiClient.get(`${BASE_URL}/date`, { params: { date } }),

  getMonthEndSummary: (month) =>
    apiClient.get(`${BASE_URL}/month-end`, { params: { month } }),

  bulkUpdate: (data) => apiClient.put(`${BASE_URL}/bulk`, data),

  getTodayAttendance: (employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get(BASE_URL, {
      params: { employee_id: employeeId, date: today }
    });
  },

  markAttendanceStatus: (employeeId, data) =>
    apiClient.patch(`${BASE_URL}/status/${employeeId}`, data),

  getAttendanceByEmployeeAndDateRange: (employeeId, startDate, endDate) =>
    apiClient.get(BASE_URL, {
      params: {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate
      }
    })
};

export default attendanceService;