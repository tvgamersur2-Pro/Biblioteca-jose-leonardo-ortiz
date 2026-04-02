// API Base URL - Configuración para producción y desarrollo
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';  // Mismo dominio en Netlify

const API_URL = API_BASE_URL + '/api';
let librosData = [];
let categoriasData = [];
let estantesData = [];
let autoresData = [];
const modal = new bootstrap.Modal(document.getElementById('modalLibro'));
let modalNuevoAutor;
let vistaActual = localStorage.getItem('vistaLibros') || 'tabla'; // tabla o grid

// Cargar datos al inicio
document.addEventListener('DOMContentLoaded', async () => {
    modalNuevoAutor = new bootstrap.Modal(document.getElementById('modalNuevoAutor'));
    
    // Aplicar vista guardada
    aplicarVistaActiva();
    
    await Promise.all([
        cargarLibros(),
        cargarCategorias(),
        cargarEstantes(),
        cargarAutores()
    ]);
    
    // Buscar al presionar Enter
    document.getElementById('inputBuscar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarLibros();
    });
    
    // Preview de imagen
    document.getElementById('inputPortada').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById('previewPortada');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="max-height: 150px">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });
});

// Cambiar vista
function cambiarVista(vista) {
    vistaActual = vista;
    localStorage.setItem('vistaLibros', vista);
    aplicarVistaActiva();
    mostrarLibros();
}

// Aplicar estilos de vista activa
function aplicarVistaActiva() {
    const btnTabla = document.getElementById('btnVistaTabla');
    const btnGrid = document.getElementById('btnVistaGrid');
    
    if (vistaActual === 'tabla') {
        btnTabla.classList.remove('btn-outline-secondary');
        btnTabla.classList.add('btn-primary');
        btnGrid.classList.remove('btn-primary');
        btnGrid.classList.add('btn-outline-secondary');
    } else {
        btnGrid.classList.remove('btn-outline-secondary');
        btnGrid.classList.add('btn-primary');
        btnTabla.classList.remove('btn-primary');
        btnTabla.classList.add('btn-outline-secondary');
    }
}

// Cargar libros
async function cargarLibros(buscar = '') {
    try {
        const url = buscar ? `${API_URL}/libros?buscar=${encodeURIComponent(buscar)}` : `${API_URL}/libros`;
        const response = await fetchAuth(url);
        if (!response) return;
        
        librosData = await response.json();
        mostrarLibros();
    } catch (error) {
        console.error('Error al cargar libros:', error);
        document.getElementById('tablaLibros').innerHTML = '<p class="text-danger">Error al cargar libros</p>';
    }
}

// Mostrar libros en tabla
function mostrarLibros() {
    const container = document.getElementById('tablaLibros');
    
    if (librosData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">No se encontraron libros</p>';
        return;
    }
    
    if (vistaActual === 'tabla') {
        mostrarVistaTabla(container);
    } else {
        mostrarVistaGrid(container);
    }
}

// Vista Tabla
function mostrarVistaTabla(container) {
    const html = `
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th width="80">Portada</th>
                    <th>Título</th>
                    <th>Código</th>
                    <th>Autor</th>
                    <th>Categoría</th>
                    <th>Estante</th>
                    <th width="100">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${librosData.map(libro => `
                    <tr>
                        <td>
                            ${libro.portada 
                                ? `<img src="${libro.portada}" class="img-thumbnail" style="width: 60px; height: 80px; object-fit: cover;" alt="Portada">` 
                                : `<div class="bg-light d-flex align-items-center justify-content-center" style="width: 60px; height: 80px; border-radius: 4px;">
                                    <i class="bi bi-book text-muted" style="font-size: 1.5rem;"></i>
                                   </div>`
                            }
                        </td>
                        <td>${escapeHtml(libro.titulo)}</td>
                        <td><span class="badge bg-light text-dark">${escapeHtml(libro.codigo)}</span></td>
                        <td>${escapeHtml(libro.autor || 'Sin autor')}</td>
                        <td>${escapeHtml(libro.categoria || 'Sin categoría')}</td>
                        <td>${escapeHtml(libro.estante || 'Sin estante')}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editarLibro('${libro._id}')" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarLibro('${libro._id}')" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Vista Grid (Tarjetas)
function mostrarVistaGrid(container) {
    const html = `
        <div class="row g-3">
            ${librosData.map(libro => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm">
                        <div class="position-relative" style="height: 250px; overflow: hidden; background: #f8f9fa;">
                            ${libro.portada 
                                ? `<img src="${libro.portada}" class="card-img-top" style="width: 100%; height: 100%; object-fit: cover;" alt="Portada">` 
                                : `<div class="d-flex align-items-center justify-content-center h-100">
                                    <i class="bi bi-book text-muted" style="font-size: 4rem;"></i>
                                   </div>`
                            }
                        </div>
                        <div class="card-body">
                            <h6 class="card-title text-truncate" title="${escapeHtml(libro.titulo)}">${escapeHtml(libro.titulo)}</h6>
                            <p class="card-text small mb-1">
                                <i class="bi bi-person text-muted"></i> ${escapeHtml(libro.autor || 'Sin autor')}
                            </p>
                            <p class="card-text small mb-1">
                                <i class="bi bi-tag text-muted"></i> ${escapeHtml(libro.categoria || 'Sin categoría')}
                            </p>
                            <p class="card-text small mb-2">
                                <span class="badge bg-light text-dark">${escapeHtml(libro.codigo)}</span>
                                <span class="badge bg-secondary ms-1">${escapeHtml(libro.estante || 'Sin estante')}</span>
                            </p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-warning flex-fill" onclick="editarLibro('${libro._id}')" title="Editar">
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="eliminarLibro('${libro._id}')" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

// Buscar libros
function buscarLibros() {
    const buscar = document.getElementById('inputBuscar').value.trim();
    cargarLibros(buscar);
}

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await fetchAuth(`${API_URL}/categorias`);
        if (!response) return;
        
        categoriasData = await response.json();
        const select = document.getElementById('inputCategoria');
        select.innerHTML = '<option value="">Selecciona una categoría</option>' +
            categoriasData.map(cat => `<option value="${cat._id}">${escapeHtml(cat.nombre)}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar estantes
async function cargarEstantes() {
    try {
        const response = await fetchAuth(`${API_URL}/estantes`);
        if (!response) return;
        
        estantesData = await response.json();
        const select = document.getElementById('inputEstante');
        select.innerHTML = '<option value="">Selecciona un estante</option>' +
            estantesData.map(est => `<option value="${est._id}">${escapeHtml(est.numero)}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar estantes:', error);
    }
}

// Cargar autores
async function cargarAutores() {
    try {
        const response = await fetchAuth(`${API_URL}/autores`);
        if (!response) return;
        
        autoresData = await response.json();
        actualizarSelectAutores();
    } catch (error) {
        console.error('Error al cargar autores:', error);
    }
}

// Actualizar select de autores
function actualizarSelectAutores(autorSeleccionado = '') {
    const select = document.getElementById('inputAutor');
    select.innerHTML = '<option value="">Selecciona un autor</option>' +
        autoresData.map(aut => `<option value="${aut._id}">${escapeHtml(aut.nombre)}</option>`).join('');
    
    if (autorSeleccionado) {
        select.value = autorSeleccionado;
    }
}

// Abrir modal para nuevo autor
function abrirModalNuevoAutor() {
    document.getElementById('formNuevoAutor').reset();
    document.getElementById('modalAutorError').classList.add('d-none');
    modalNuevoAutor.show();
    setTimeout(() => document.getElementById('inputNuevoAutor').focus(), 300);
}

// Guardar nuevo autor
document.getElementById('formNuevoAutor').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('inputNuevoAutor').value.trim();
    
    if (!nombre) {
        mostrarErrorAutor('El nombre es obligatorio');
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardarAutor');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        const response = await fetchAuth(`${API_URL}/autores`, {
            method: 'POST',
            body: JSON.stringify({ nombre })
        });
        
        if (!response) return;
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error al guardar autor');
        }
        
        // Recargar autores y seleccionar el nuevo
        await cargarAutores();
        actualizarSelectAutores(result._id);
        
        modalNuevoAutor.hide();
        
    } catch (error) {
        mostrarErrorAutor(error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
});

// Mostrar error en modal de autor
function mostrarErrorAutor(mensaje) {
    const alertError = document.getElementById('modalAutorError');
    alertError.textContent = mensaje;
    alertError.classList.remove('d-none');
}

// Abrir modal para nuevo libro
function abrirModal() {
    document.getElementById('modalTitulo').textContent = 'Nuevo Libro';
    document.getElementById('formLibro').reset();
    document.getElementById('inputId').value = '';
    document.getElementById('modalError').classList.add('d-none');
    document.getElementById('previewPortada').innerHTML = '';
    document.getElementById('btnGuardar').textContent = 'Guardar';
    modal.show();
    setTimeout(() => document.getElementById('inputTitulo').focus(), 300);
}

// Editar libro
async function editarLibro(id) {
    const libro = librosData.find(l => l._id === id);
    if (!libro) return;
    
    document.getElementById('modalTitulo').textContent = 'Editar Libro';
    document.getElementById('inputId').value = id;
    document.getElementById('inputTitulo').value = libro.titulo;
    document.getElementById('inputCodigo').value = libro.codigo;
    document.getElementById('inputAutor').value = libro.id_autor || '';
    document.getElementById('inputCategoria').value = libro.id_categoria || '';
    document.getElementById('inputEstante').value = libro.id_estante || '';
    document.getElementById('modalError').classList.add('d-none');
    document.getElementById('btnGuardar').textContent = 'Actualizar';
    
    // Mostrar portada actual si existe
    const preview = document.getElementById('previewPortada');
    if (libro.portada) {
        preview.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <img src="${libro.portada}" class="img-thumbnail" style="max-height: 100px">
                <small class="text-muted">Portada actual (puedes subir una nueva para reemplazarla)</small>
            </div>
        `;
    } else {
        preview.innerHTML = '';
    }
    
    modal.show();
}

// Guardar libro (crear o actualizar)
document.getElementById('formLibro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('inputId').value;
    const titulo = document.getElementById('inputTitulo').value.trim();
    const codigo = document.getElementById('inputCodigo').value.trim();
    const id_autor = document.getElementById('inputAutor').value;
    const id_categoria = document.getElementById('inputCategoria').value;
    const id_estante = document.getElementById('inputEstante').value;
    const portada = document.getElementById('inputPortada').files[0];
    
    if (!titulo || !codigo || !id_autor || !id_categoria || !id_estante) {
        mostrarError('Todos los campos son obligatorios');
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        // Usar FormData para enviar archivos
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('codigo', codigo);
        formData.append('id_autor', id_autor);
        formData.append('id_categoria', id_categoria);
        formData.append('id_estante', id_estante);
        if (portada) {
            formData.append('portada', portada);
        }
        
        const url = id ? `${API_URL}/libros/${id}` : `${API_URL}/libros`;
        const method = id ? 'PUT' : 'POST';
        
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login.html';
            return;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error al guardar libro');
        }
        
        modal.hide();
        await cargarLibros();
        
    } catch (error) {
        mostrarError(error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = id ? 'Actualizar' : 'Guardar';
    }
});

// Eliminar libro
async function eliminarLibro(id) {
    if (!await confirmar('¿Estás seguro de eliminar este libro?', 'Confirmar eliminación')) return;
    
    try {
        const response = await fetchAuth(`${API_URL}/libros/${id}`, {
            method: 'DELETE'
        });
        
        if (!response) return;
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error al eliminar libro');
        }
        
        await cargarLibros();
        
    } catch (error) {
        await alerta(error.message, 'Error');
    }
}

// Mostrar error en modal
function mostrarError(mensaje) {
    const alertError = document.getElementById('modalError');
    alertError.textContent = mensaje;
    alertError.classList.remove('d-none');
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============================================
// FUNCIONES DE CÁMARA
// ============================================

let stream = null;
let fotoCapturada = null;

// Abrir cámara
async function abrirCamara() {
    const camaraContainer = document.getElementById('camaraContainer');
    const video = document.getElementById('video');
    const previewPortada = document.getElementById('previewPortada');
    
    try {
        // Solicitar acceso a la cámara
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Usar cámara trasera en móviles
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        camaraContainer.classList.remove('d-none');
        previewPortada.innerHTML = '';
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        
        let mensaje = 'No se pudo acceder a la cámara. ';
        if (error.name === 'NotAllowedError') {
            mensaje += 'Por favor, permite el acceso a la cámara en tu navegador.';
        } else if (error.name === 'NotFoundError') {
            mensaje += 'No se encontró ninguna cámara en tu dispositivo.';
        } else {
            mensaje += 'Verifica que tu dispositivo tenga cámara y que el navegador tenga permisos.';
        }
        
        await alerta(mensaje, 'Error de cámara');
    }
}

// Capturar foto
function capturarFoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const previewPortada = document.getElementById('previewPortada');
    
    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el frame actual del video en el canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir canvas a blob
    canvas.toBlob((blob) => {
        // Crear un archivo desde el blob
        fotoCapturada = new File([blob], 'foto-libro.jpg', { type: 'image/jpeg' });
        
        // Mostrar preview
        const url = URL.createObjectURL(blob);
        previewPortada.innerHTML = `
            <div class="position-relative d-inline-block">
                <img src="${url}" class="img-thumbnail" style="max-height: 200px">
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="eliminarFoto()">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <p class="text-success mt-2 mb-0">
                <i class="bi bi-check-circle me-1"></i>Foto capturada correctamente
            </p>
        `;
        
        // Asignar el archivo al input (para que se envíe con el formulario)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fotoCapturada);
        document.getElementById('inputPortada').files = dataTransfer.files;
        
        // Cerrar cámara
        cerrarCamara();
        
    }, 'image/jpeg', 0.9); // Calidad 90%
}

// Cerrar cámara
function cerrarCamara() {
    const camaraContainer = document.getElementById('camaraContainer');
    const video = document.getElementById('video');
    
    if (stream) {
        // Detener todos los tracks del stream
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    video.srcObject = null;
    camaraContainer.classList.add('d-none');
}

// Eliminar foto capturada
function eliminarFoto() {
    fotoCapturada = null;
    document.getElementById('previewPortada').innerHTML = '';
    document.getElementById('inputPortada').value = '';
}

// Cerrar cámara al cerrar el modal
document.getElementById('modalLibro').addEventListener('hidden.bs.modal', () => {
    cerrarCamara();
    eliminarFoto();
});
