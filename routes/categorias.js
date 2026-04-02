const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

router.use(autenticarToken);

// GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { buscar } = req.query;
    
    let query = {};
    if (buscar) {
      query.nombre = { $regex: buscar, $options: 'i' };
    }
    
    const categorias = await db.collection('categorias')
      .find(query)
      .sort({ nombre: 1 })
      .toArray();
    
    res.json(categorias);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// POST /api/categorias
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    
    const nuevaCategoria = {
      nombre: nombre.trim(),
      fecha_registro: new Date().toISOString()
    };
    
    const result = await db.collection('categorias').insertOne(nuevaCategoria);
    
    res.status(201).json({ 
      ...nuevaCategoria, 
      _id: result.insertedId 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('categorias').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { nombre: nombre.trim() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    const librosCount = await db.collection('libros').countDocuments({
      id_categoria: new ObjectId(req.params.id)
    });
    
    if (librosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar, tiene libros asociados' 
      });
    }
    
    const result = await db.collection('categorias').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;
