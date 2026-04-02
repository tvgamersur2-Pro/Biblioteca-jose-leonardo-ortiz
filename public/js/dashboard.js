// API Base URL - Configuración para producción y desarrollo
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';  // Mismo dominio en Netlify

const API_URL = API_BASE_URL + '/api';

// Cargar datos del dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstadisticas();
    await cargarUltimosLibros();
});

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const response = await fetchAuth(`${API_URL}/reportes/estadisticas`);
        if (!response) return;
        
        const data = await response.json();
        
        document.getElementById('totalLibros').textContent = data.totalLibros || 0;
        document.getElementById('totalAutores').textContent = data.totalAutores || 0;
        document.getElementById('totalCategorias').textContent = data.totalCategorias || 0;
        document.getElementById('totalEstantes').textContent = data.totalEstantes || 0;
        document.getElementById('prestamosActivos').textContent = data.prestamosActivos || 0;
        document.getElementById('prestamosVencidos').textContent = data.prestamosVencidos || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Cargar últimos libros
async function cargarUltimosLibros() {
    try {
        const response = await fetchAuth(`${API_URL}/libros`);
        if (!response) return;
        
        const libros = await response.json();
        const ultimosLibros = libros.slice(0, 5);
        
        const container = document.getElementById('ultimosLibros');
        
        if (ultimosLibros.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">No hay libros registrados aún.</p>';
            return;
        }
        
        const html = `
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Código</th>
                        <th>Autor</th>
                    </tr>
                </thead>
                <tbody>
                    ${ultimosLibros.map(libro => `
                        <tr>
                            <td>${escapeHtml(libro.titulo)}</td>
                            <td><span class="badge bg-light text-dark">${escapeHtml(libro.codigo)}</span></td>
                            <td>${escapeHtml(libro.autor || 'Sin autor')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar últimos libros:', error);
        document.getElementById('ultimosLibros').innerHTML = '<p class="text-danger">Error al cargar libros</p>';
    }
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
