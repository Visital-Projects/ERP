// // src/config.js
// export const config = {
//   baseUrl: import.meta.env.VITE_BASE_URL,
//   avatarsBaseUrl: import.meta.env.VITE_AVATARS_BASE_URL,
// };

// // Usage in components:
// import { config } from '../config';
// const avatarUrl = `${config.avatarsBaseUrl}/avatar.png`;


// src/config.js
export const config = {
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://erpcopy.vnvision.in',
  avatarsBaseUrl: import.meta.env.VITE_AVATARS_BASE_URL || 'https://erpcopy.vnvision.in/uploads/avatars'
};

// Add fallback URLs for safety
export const FALLBACK_URLS = {
  baseUrl: 'https://erpcopy.vnvision.in',
  avatarsBaseUrl: 'https://erpcopy.vnvision.in/uploads/avatars'
};