// Verificar autenticación en páginas protegidas
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (!token || !usuario) {
        window.location.href = '/login.html';
        return null;
    }
    
    return {
        token,
        usuario: JSON.parse(usuario)
    };
}

// Cerrar sesión
async function cerrarSesion() {
    if (!await confirmar('¿Estás seguro de cerrar sesión?', 'Cerrar sesión')) return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

// Hacer petición autenticada
async function fetchAuth(url, options = {}) {
    const auth = verificarAutenticacion();
    if (!auth) return;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
        ...options.headers
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Si el token expiró, redirigir al login
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Error en petición:', error);
        throw error;
    }
}

// Mostrar nombre de usuario en topbar
function mostrarUsuario() {
    const auth = verificarAutenticacion();
    if (auth) {
        const nombreUsuarioEl = document.getElementById('nombreUsuario');
        if (nombreUsuarioEl) {
            nombreUsuarioEl.textContent = auth.usuario.usuario;
        }
    }
}

// Ejecutar al cargar página
if (window.location.pathname !== '/login.html' && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    verificarAutenticacion();
    mostrarUsuario();
}
