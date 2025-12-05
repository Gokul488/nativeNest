// src/config.js
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://nativenest-backend.onrender.com';

export default API_BASE_URL;