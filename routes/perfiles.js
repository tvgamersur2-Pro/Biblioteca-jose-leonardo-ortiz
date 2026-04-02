const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken, verificarAdmin } = require('../middleware/auth');

router.use(autenticarToken);
router.use(verificarAdmin);

// GET /api/perfiles
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const perfiles = await db.collection('perfiles')
      .find({})
      .sort({ nombre: 1 })
      .toArray();
    
    res.json(perfiles);
  } catch (error) {
    console.error('Error al listar perfiles:', error);
    res.status(500).json({ error: 'Error al obtener perfiles' });
  }
});

// GET /api/perfiles/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    const perfil = await db.collection('perfiles').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    // Obtener opciones asociadas
    const opciones = await db.collection('perfil_opciones')
      .find({ id_perfil: perfil._id })
      .toArray();
    
    perfil.opciones = opciones.map(o => o.id_opcion);
    
    res.json(perfil);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// POST /api/perfiles
router.post('/', async (req, res) => {
  try {
    const { nombre, opciones } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    
    const nuevoPerfil = {
      nombre: nombre.trim(),
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await db.collection('perfiles').insertOne(nuevoPerfil);
    const perfilId = result.insertedId;
    
    // Insertar opciones asociadas
    if (opciones && Array.isArray(opciones) && opciones.length > 0) {
      const perfilOpciones = opciones.map(idOpcion => ({
        id_perfil: perfilId,
        id_opcion: new ObjectId(idOpcion)
      }));
      
      await db.collection('perfil_opciones').insertMany(perfilOpciones);
    }
    
    res.status(201).json({ 
      ...nuevoPerfil, 
      _id: perfilId,
      opciones: opciones || []
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El perfil ya existe' });
    }
    console.error('Error al crear perfil:', error);
    res.status(500).json({ error: 'Error al crear perfil' });
  }
});

// PUT /api/perfiles/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, opciones } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    const perfilId = new ObjectId(req.params.id);
    
    const result = await db.collection('perfiles').findOneAndUpdate(
      { _id: perfilId },
      { $set: { nombre: nombre.trim() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    // Actualizar opciones asociadas
    await db.collection('perfil_opciones').deleteMany({ id_perfil: perfilId });
    
    if (opciones && Array.isArray(opciones) && opciones.length > 0) {
      const perfilOpciones = opciones.map(idOpcion => ({
        id_perfil: perfilId,
        id_opcion: new ObjectId(idOpcion)
      }));
      
      await db.collection('perfil_opciones').insertMany(perfilOpciones);
    }
    
    res.json({ ...result, opciones: opciones || [] });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// DELETE /api/perfiles/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const perfilId = new ObjectId(req.params.id);
    
    // Verificar si hay usuarios con este perfil
    const usuariosCount = await db.collection('usuarios').countDocuments({
      id_perfil: perfilId
    });
    
    if (usuariosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar, tiene usuarios asociados' 
      });
    }
    
    // Eliminar opciones asociadas
    await db.collection('perfil_opciones').deleteMany({ id_perfil: perfilId });
    
    // Eliminar perfil
    const result = await db.collection('perfiles').deleteOne({ _id: perfilId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    res.json({ success: true, message: 'Perfil eliminado' });
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    res.status(500).json({ error: 'Error al eliminar perfil' });
  }
});

module.exports = router;
