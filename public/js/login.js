// API Base URL - Configuración para producción y desarrollo
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';  // Mismo dominio en Netlify

const API_URL = API_BASE_URL + '/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const clave = document.getElementById('clave').value;
    const btnLogin = document.getElementById('btnLogin');
    const alertError = document.getElementById('alertError');
    
    if (!usuario || !clave) {
        mostrarError('Por favor ingresa usuario y contraseña');
        return;
    }
    
    // Deshabilitar botón
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...';
    alertError.classList.add('d-none');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, clave })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // Redirigir al dashboard
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        mostrarError(error.message);
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Entrar';
    }
});

function mostrarError(mensaje) {
    const alertError = document.getElementById('alertError');
    alertError.textContent = mensaje;
    alertError.classList.remove('d-none');
}
