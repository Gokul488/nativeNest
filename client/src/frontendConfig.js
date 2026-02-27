// src/frontendConfig.js
const FRONTEND_URL = import.meta.env.DEV
  ? 'http://localhost:5173'                   // Local development
  : 'https://nativenest-frontend.onrender.com'; // YOUR HOSTED LINK

export default FRONTEND_URL;