import apiClient from './apiClient'; // Your configured axios instance

const goalTrackingService = {
  // Create a new goal tracking
  createGoalTracking: (data) => {
    return apiClient.post('/goal-trackings', data);
  },

  // Get all goal trackings
  getGoalTrackings: () => {
    return apiClient.get('/goal-trackings');
  },

  // Get a specific goal tracking by ID
  getGoalTrackingById: (id) => {
    return apiClient.get(`/goal-trackings/${id}`);
  },

  // Update a goal tracking
  updateGoalTracking: (id, data) => {
    return apiClient.put(`/goal-trackings/${id}`, data);
  },

  // Delete a goal tracking
  deleteGoalTracking: (id) => {
    return apiClient.delete(`/goal-trackings/${id}`);
  },
 
};

export default goalTrackingService;