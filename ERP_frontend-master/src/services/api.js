// import axios from 'axios'

// const api = axios.create({
// baseURL: 'https://erpv1.vnvision.in/api',
// headers: { 'Content-Type': 'application/json' }
// });

// api.interceptors.request.use((config) => {
// const token = localStorage.getItem('token')
// if (token) {
// config.headers.Authorization = `Bearer ${token}`;
// }
// return config
// })

// export default api


// src/services/api.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import axios from 'axios';

// export const api = createApi({
//   reducerPath: 'api',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://erpv1.vnvision.in/api',
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem('token');
//       if (token) headers.set('authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ['Profile', 'Messages'],
//   endpoints: (builder) => ({
//     getProfile: builder.query({
//       query: () => '/profile',
//       providesTags: ['Profile'],
//     }),
//     getUnseenMessagesCount: builder.query({
//       query: () => '/messages/unseen-count',
//       providesTags: ['Messages'],
//     }),
//   }),
// });

// export const {
//   useGetProfileQuery,
//   useGetUnseenMessagesCountQuery,
// } = api;




import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_URL}/api`,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Messages'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    getUnseenMessagesCount: builder.query({
      query: () => '/messages/unseen-count',
      providesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUnseenMessagesCountQuery,
} = api;


