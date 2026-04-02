const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(autenticarToken);

// GET /api/autores - Listar todos los autores
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { buscar } = req.query;
    
    let query = {};
    if (buscar) {
      query.nombre = { $regex: buscar, $options: 'i' };
    }
    
    const autores = await db.collection('autores')
      .find(query)
      .sort({ nombre: 1 })
      .toArray();
    
    res.json(autores);
  } catch (error) {
    console.error('Error al listar autores:', error);
    res.status(500).json({ error: 'Error al obtener autores' });
  }
});

// GET /api/autores/:id - Obtener un autor por ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const autor = await db.collection('autores').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!autor) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json(autor);
  } catch (error) {
    console.error('Error al obtener autor:', error);
    res.status(500).json({ error: 'Error al obtener autor' });
  }
});

// POST /api/autores - Crear nuevo autor
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    
    const nuevoAutor = {
      nombre: nombre.trim(),
      fecha_registro: new Date().toISOString()
    };
    
    const result = await db.collection('autores').insertOne(nuevoAutor);
    
    res.status(201).json({ 
      ...nuevoAutor, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error al crear autor:', error);
    res.status(500).json({ error: 'Error al crear autor' });
  }
});

// PUT /api/autores/:id - Actualizar autor
router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('autores').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { nombre: nombre.trim() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar autor:', error);
    res.status(500).json({ error: 'Error al actualizar autor' });
  }
});

// DELETE /api/autores/:id - Eliminar autor
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    // Verificar si tiene libros asociados
    const librosCount = await db.collection('libros').countDocuments({
      id_autor: new ObjectId(req.params.id)
    });
    
    if (librosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar, tiene libros asociados' 
      });
    }
    
    const result = await db.collection('autores').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json({ success: true, message: 'Autor eliminado' });
  } catch (error) {
    console.error('Error al eliminar autor:', error);
    res.status(500).json({ error: 'Error al eliminar autor' });
  }
});

module.exports = router;
