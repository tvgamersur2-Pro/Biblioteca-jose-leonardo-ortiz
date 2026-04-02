// Configuración de la API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';  // Mismo dominio en Netlify

const API_URL = API_BASE_URL + '/api';
