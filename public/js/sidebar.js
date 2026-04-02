// Cargar sidebar dinámicamente
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const currentPath = window.location.pathname;
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esAdmin = usuario.perfil === 'Administrador' || usuario.rol === 'admin';
    
    // Crear overlay para móvil
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', cerrarSidebar);
    document.body.appendChild(overlay);

    // Crear botón hamburguesa
    const btnHamburguesa = document.createElement('button');
    btnHamburguesa.className = 'btn-hamburguesa';
    btnHamburguesa.innerHTML = '<i class="bi bi-list"></i>';
    btnHamburguesa.addEventListener('click', toggleSidebar);
    document.body.appendChild(btnHamburguesa);
    
    sidebar.innerHTML = `
        <div class="brand">
            <h5><i class="bi bi-book-half me-2"></i>Biblioteca</h5>
            <small>Panel de administración</small>
            <button class="btn-cerrar-sidebar" onclick="cerrarSidebar()">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <nav class="nav flex-column mt-3">
            <a class="nav-link ${currentPath === '/dashboard.html' ? 'active' : ''}" href="/dashboard.html">
                <i class="bi bi-grid-1x2"></i> Dashboard
            </a>
            <a class="nav-link ${currentPath === '/libros.html' ? 'active' : ''}" href="/libros.html">
                <i class="bi bi-book"></i> Libros
            </a>
            <a class="nav-link ${currentPath === '/autores.html' ? 'active' : ''}" href="/autores.html">
                <i class="bi bi-person-lines-fill"></i> Autores
            </a>
            <a class="nav-link ${currentPath === '/categorias.html' ? 'active' : ''}" href="/categorias.html">
                <i class="bi bi-tag"></i> Categorías
            </a>
            <a class="nav-link ${currentPath === '/estantes.html' ? 'active' : ''}" href="/estantes.html">
                <i class="bi bi-archive"></i> Estantes
            </a>
            <a class="nav-link ${currentPath === '/prestamos.html' ? 'active' : ''}" href="/prestamos.html">
                <i class="bi bi-journal-bookmark"></i> Préstamos
            </a>
            ${esAdmin ? `
            <a class="nav-link ${currentPath === '/usuarios.html' ? 'active' : ''}" href="/usuarios.html">
                <i class="bi bi-people"></i> Usuarios
            </a>
            <a class="nav-link ${currentPath === '/perfiles.html' ? 'active' : ''}" href="/perfiles.html">
                <i class="bi bi-shield-check"></i> Perfiles
            </a>
            <a class="nav-link ${currentPath === '/reportes.html' ? 'active' : ''}" href="/reportes.html">
                <i class="bi bi-file-earmark-bar-graph"></i> Reportes
            </a>
            ` : ''}
        </nav>
        <div class="logout-link">
            <a class="nav-link text-danger" href="#" onclick="cerrarSesion()">
                <i class="bi bi-box-arrow-left"></i> Cerrar sesión
            </a>
        </div>
    `;
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
    document.body.classList.toggle('sidebar-open');
}

function cerrarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('sidebar-open');
}
