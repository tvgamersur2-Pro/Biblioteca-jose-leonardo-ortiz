require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));
app.use('/imagenes', express.static('imagenes'));

// Importar rutas
const authRoutes = require('./routes/auth');
const librosRoutes = require('./routes/libros');
const autoresRoutes = require('./routes/autores');
const categoriasRoutes = require('./routes/categorias');
const estantesRoutes = require('./routes/estantes');
const prestamosRoutes = require('./routes/prestamos');
const usuariosRoutes = require('./routes/usuarios');
const perfilesRoutes = require('./routes/perfiles');
const reportesRoutes = require('./routes/reportes');
const opcionesRoutes = require('./routes/opciones');
const publicoRoutes = require('./routes/publico');

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/autores', autoresRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/estantes', estantesRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/opciones', opcionesRoutes);
app.use('/api/publico', publicoRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Sistema de Biblioteca IE - Node.js + MongoDB`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});
