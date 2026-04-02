// Configuración de la API
// Cambia esta URL después de desplegar tu backend en Render
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tu-backend.onrender.com'; // IMPORTANTE: Actualiza esta URL con tu backend de Render

const API_URL = API_BASE_URL + '/api';
