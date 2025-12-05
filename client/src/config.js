// src/config.js
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000'                                          // Local dev
  : import.meta.env.VITE_BACKEND_URL || 'https://nativenest-backend.onrender.com'; // Production + fallback

export default API_BASE_URL;