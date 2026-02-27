// src/frontendConfig.js
const FRONTEND_URL = import.meta.env.DEV
  ? 'https://nativenest-frontend.onrender.com' // Use the IP shown in your terminal
  : 'http://192.168.1.15:5173';

export default FRONTEND_URL;