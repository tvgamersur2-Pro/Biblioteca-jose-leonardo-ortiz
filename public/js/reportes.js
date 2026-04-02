const API_URL = '/api';
let chartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstadisticas();
    await cargarLibrosMasPrestados();
    await cargarPrestamosVencidos();
});

async function cargarEstadisticas() {
    try {
        const response = await fetchAuth(`${API_URL}/reportes/estadisticas`);
        if (!response) return;
        
        const data = await response.json();
        
        document.getElementById('totalLibros').textContent = data.totalLibros || 0;
        document.getElementById('totalPrestamos').textContent = data.totalPrestamos || 0;
        document.getElementById('prestamosActivos').textContent = data.prestamosActivos || 0;
        document.getElementById('prestamosVencidos').textContent = data.prestamosVencidos || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarLibrosMasPrestados() {
    try {
        const response = await fetchAuth(`${API_URL}/reportes/mas-prestados`);
        if (!response) return;
        
        const libros = await response.json();
        const container = document.getElementById('librosMasPrestados');
        
        if (libros.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">Sin datos aún.</p>';
            return;
        }
        
        container.innerHTML = libros.map((l, i) => `
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-light text-dark" style="min-width:24px">${i + 1}</span>
                <div class="flex-grow-1" style="font-size:.88rem">
                    <div class="fw-semibold text-truncate" style="max-width:200px">${escapeHtml(l.titulo)}</div>
                </div>
                <span class="badge bg-primary">${l.total}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar libros más prestados:', error);
    }
}

async function cargarPrestamosVencidos() {
    try {
        const response = await fetchAuth(`${API_URL}/reportes/vencidos`);
        if (!response) return;
        
        const vencidos = await response.json();
        
        if (vencidos.length === 0) return;
        
        document.getElementById('seccionVencidos').style.display = 'block';
        document.getElementById('cantidadVencidos').textContent = vencidos.length;
        
        const tbody = document.getElementById('tablaVencidos');
        tbody.innerHTML = vencidos.map(v => `
            <tr>
                <td>${escapeHtml(v.nombre_alumno)}</td>
                <td>${escapeHtml(v.grado || '—')}</td>
                <td>${escapeHtml(v.titulo)}</td>
                <td>${formatearFecha(v.fecha_devolucion)}</td>
                <td><span class="badge bg-danger">${v.dias_retraso} días</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar préstamos vencidos:', error);
    }
}

// Exportar a Excel con autenticación
async function exportarExcel(tipo) {
    try {
        const auth = verificarAutenticacion();
        if (!auth) return;
        
        // Crear URL con parámetros
        const url = `${API_URL}/reportes/exportar?tipo=${tipo}`;
        
        // Hacer petición con token
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al exportar');
        }
        
        // Obtener el blob
        const blob = await response.blob();
        
        // Crear enlace de descarga
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        const fecha = new Date().toISOString().split('T')[0];
        a.download = `reporte_${tipo}_${fecha}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        mostrarMensaje('Reporte exportado correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar:', error);
        mostrarMensaje('Error al exportar reporte', 'error');
    }
}

function formatearFecha(fecha) {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarMensaje(mensaje, tipo) {
    // Crear toast o alert simple
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-danger';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.textContent = mensaje;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
