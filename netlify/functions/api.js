require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// CORS - permitir todo (mismo dominio en Netlify)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas (relative paths from netlify/functions/)
const authRoutes = require('../../routes/auth');
const librosRoutes = require('../../routes/libros');
const autoresRoutes = require('../../routes/autores');
const categoriasRoutes = require('../../routes/categorias');
const estantesRoutes = require('../../routes/estantes');
const prestamosRoutes = require('../../routes/prestamos');
const usuariosRoutes = require('../../routes/usuarios');
const perfilesRoutes = require('../../routes/perfiles');
const reportesRoutes = require('../../routes/reportes');
const opcionesRoutes = require('../../routes/opciones');
const publicoRoutes = require('../../routes/publico');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando en Netlify Functions' });
});

module.exports.handler = serverless(app, {
  binary: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',
    'image/*'
  ]
});
