// API Base URL - Configuración para producción y desarrollo
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';  // Mismo dominio en Netlify

const API_URL = API_BASE_URL + '/api';

let paginaActual = 1;
const librosPorPagina = 12;

// Cargar estadísticas y catálogo al inicio
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    cargarEstadisticas();
    cargarCatalogo();
    
    // Búsqueda en tiempo real
    const inputCatalogo = document.getElementById('inputBuscarCatalogo');
    if (inputCatalogo) {
        inputCatalogo.addEventListener('keyup', debounce(() => {
            paginaActual = 1;
            cargarCatalogo();
        }, 500));
        
        inputCatalogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                paginaActual = 1;
                cargarCatalogo();
            }
        });
    }
});

// Debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cargar estadísticas públicas
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/publico/estadisticas`);
        const data = await response.json();
        
        document.getElementById('totalLibros').textContent = data.totalLibros || '0';
        document.getElementById('totalAutores').textContent = data.totalAutores || '0';
        document.getElementById('totalCategorias').textContent = data.totalCategorias || '0';
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Cargar catálogo de libros
async function cargarCatalogo() {
    const inputBuscar = document.getElementById('inputBuscarCatalogo');
    const buscar = inputBuscar ? inputBuscar.value.trim() : '';
    const catalogoDiv = document.getElementById('catalogoLibros');
    
    catalogoDiv.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando libros...</p>
        </div>
    `;
    
    try {
        const url = `${API_URL}/publico/libros?buscar=${encodeURIComponent(buscar)}&pagina=${paginaActual}&limite=${librosPorPagina}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.libros.length === 0) {
            catalogoDiv.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-3 text-muted">No se encontraron libros</p>
                </div>
            `;
            document.getElementById('paginacion').innerHTML = '';
            return;
        }
        
        catalogoDiv.innerHTML = data.libros.map(libro => `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="libro-tarjeta">
                    <div class="portada">
                        ${libro.portada 
                            ? `<img src="${libro.portada}" alt="${libro.titulo}">`
                            : `<i class="bi bi-book icono-libro"></i>`
                        }
                    </div>
                    <div class="contenido">
                        <div class="titulo-libro">${libro.titulo}</div>
                        <div class="autor-libro">
                            <i class="bi bi-person-fill me-1"></i>${libro.autor || 'Desconocido'}
                        </div>
                        <div class="codigo-libro">
                            <i class="bi bi-upc me-1"></i>${libro.codigo}
                        </div>
                        ${libro.categoria 
                            ? `<span class="categoria-badge">${libro.categoria}</span>`
                            : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
        // Renderizar paginación
        renderizarPaginacion(data.totalPaginas);
        
    } catch (error) {
        console.error('Error al cargar catálogo:', error);
        catalogoDiv.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                <p class="mt-3 text-danger">Error al cargar los libros</p>
            </div>
        `;
    }
}

// Renderizar paginación
function renderizarPaginacion(totalPaginas) {
    const paginacionDiv = document.getElementById('paginacion');
    
    if (totalPaginas <= 1) {
        paginacionDiv.innerHTML = '';
        return;
    }
    
    let html = '<div class="paginacion">';
    
    // Botón anterior
    html += `
        <button onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>
            <i class="bi bi-chevron-left"></i>
        </button>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (
            i === 1 || 
            i === totalPaginas || 
            (i >= paginaActual - 1 && i <= paginaActual + 1)
        ) {
            html += `
                <button 
                    onclick="cambiarPagina(${i})" 
                    class="${i === paginaActual ? 'pagina-actual' : ''}"
                >
                    ${i}
                </button>
            `;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            html += '<span>...</span>';
        }
    }
    
    // Botón siguiente
    html += `
        <button onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>
            <i class="bi bi-chevron-right"></i>
        </button>
    `;
    
    html += '</div>';
    paginacionDiv.innerHTML = html;
}

// Cambiar página
function cambiarPagina(pagina) {
    paginaActual = pagina;
    cargarCatalogo();
    
    // Scroll suave al catálogo
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
}

// Búsqueda del catálogo
function buscarCatalogo() {
    paginaActual = 1;
    cargarCatalogo();
}

// Búsqueda del hero (mantener funcionalidad original)
const inputBuscar = document.getElementById('inputBuscar');
if (inputBuscar) {
    inputBuscar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') buscar();
    });
}

async function buscar() {
    const q = inputBuscar.value.trim();
    const div = document.getElementById('resultados');
    
    if (q.length < 2) {
        div.innerHTML = '';
        return;
    }

    div.innerHTML = '<p class="text-white opacity-75 mt-3">Buscando...</p>';

    try {
        const response = await fetch(`${API_URL}/publico/libros?buscar=${encodeURIComponent(q)}&limite=5`);
        const data = await response.json();
        
        if (data.libros.length === 0) {
            div.innerHTML = '<p class="text-white opacity-75 mt-3">No se encontraron resultados</p>';
            return;
        }
        
        div.innerHTML = data.libros.map(libro => `
            <div class="libro-card">
                <div>
                    <div class="titulo">${libro.titulo}</div>
                    <div class="meta">
                        ${libro.autor || 'Desconocido'} • ${libro.codigo}
                    </div>
                </div>
                ${libro.categoria ? `<span class="badge-cat">${libro.categoria}</span>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        div.innerHTML = '<p class="text-white opacity-75 mt-3">Error al buscar</p>';
    }
}
