// Sistema de modales de confirmación y alertas

// Crear modal de confirmación si no existe
function crearModalConfirmacion() {
    if (document.getElementById('modalConfirmacion')) return;
    
    const modalHTML = `
        <div class="modal fade" id="modalConfirmacion" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-0 pb-2">
                        <h5 class="modal-title fw-bold" id="modalConfirmacionTitulo">Confirmar acción</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p id="modalConfirmacionMensaje" class="mb-0"></p>
                    </div>
                    <div class="modal-footer border-0 pt-2">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btnConfirmar">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Crear modal de alerta si no existe
function crearModalAlerta() {
    if (document.getElementById('modalAlerta')) return;
    
    const modalHTML = `
        <div class="modal fade" id="modalAlerta" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-0 pb-2">
                        <h5 class="modal-title fw-bold" id="modalAlertaTitulo">Información</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p id="modalAlertaMensaje" class="mb-0"></p>
                    </div>
                    <div class="modal-footer border-0 pt-2">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para mostrar confirmación
function confirmar(mensaje, titulo = 'Confirmar acción') {
    return new Promise((resolve) => {
        crearModalConfirmacion();
        
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
        const btnConfirmar = document.getElementById('btnConfirmar');
        
        document.getElementById('modalConfirmacionTitulo').textContent = titulo;
        document.getElementById('modalConfirmacionMensaje').textContent = mensaje;
        
        // Remover listeners anteriores
        const nuevoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);
        
        // Agregar nuevo listener
        nuevoBtn.addEventListener('click', () => {
            modal.hide();
            resolve(true);
        });
        
        // Si se cierra sin confirmar
        document.getElementById('modalConfirmacion').addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });
        
        modal.show();
    });
}

// Función para mostrar alerta
function alerta(mensaje, titulo = 'Información') {
    return new Promise((resolve) => {
        crearModalAlerta();
        
        const modal = new bootstrap.Modal(document.getElementById('modalAlerta'));
        
        document.getElementById('modalAlertaTitulo').textContent = titulo;
        document.getElementById('modalAlertaMensaje').textContent = mensaje;
        
        document.getElementById('modalAlerta').addEventListener('hidden.bs.modal', () => {
            resolve();
        }, { once: true });
        
        modal.show();
    });
}
