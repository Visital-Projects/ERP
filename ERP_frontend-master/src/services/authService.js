// import axios from 'axios'
// import api from './api'
// // import api from '@/services/api'


// const API_BASE_URL = 'https://erpv1.vnvision.in/api'

// export const loginUser = async (credentials) => {
// const response = await axios.post(${API_BASE_URL}/auth/login, credentials, {
// headers: { 'Content-Type': 'application/json' }
// })
// return response.data
// }


// import api from './api'

// export const login = async (credentials) => {
// const response = await api.post('/auth/login', credentials)
// return response.data
// }

// import apiClient from './apiClient';

// export const login = async (credentials) => {
//   const { data } = await apiClient.post('/auth/login', credentials);
//   return data;
// };
// ************


import apiClient from './apiClient';

export const login = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);

  // ✅ Store token after successful login
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};
