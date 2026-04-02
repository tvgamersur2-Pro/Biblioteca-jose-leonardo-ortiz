const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

router.use(autenticarToken);

// GET /api/estantes
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { buscar } = req.query;
    
    let query = {};
    if (buscar) {
      query.numero = { $regex: buscar, $options: 'i' };
    }
    
    const estantes = await db.collection('estantes')
      .find(query)
      .sort({ numero: 1 })
      .toArray();
    
    res.json(estantes);
  } catch (error) {
    console.error('Error al listar estantes:', error);
    res.status(500).json({ error: 'Error al obtener estantes' });
  }
});

// POST /api/estantes
router.post('/', async (req, res) => {
  try {
    const { numero } = req.body;
    
    if (!numero || numero.trim() === '') {
      return res.status(400).json({ error: 'El número es obligatorio' });
    }
    
    const db = await getDB();
    
    const nuevoEstante = {
      numero: numero.trim(),
      fecha_registro: new Date().toISOString()
    };
    
    const result = await db.collection('estantes').insertOne(nuevoEstante);
    
    res.status(201).json({ 
      ...nuevoEstante, 
      _id: result.insertedId 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El estante ya existe' });
    }
    console.error('Error al crear estante:', error);
    res.status(500).json({ error: 'Error al crear estante' });
  }
});

// PUT /api/estantes/:id
router.put('/:id', async (req, res) => {
  try {
    const { numero } = req.body;
    
    if (!numero || numero.trim() === '') {
      return res.status(400).json({ error: 'El número es obligatorio' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('estantes').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { numero: numero.trim() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Estante no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar estante:', error);
    res.status(500).json({ error: 'Error al actualizar estante' });
  }
});

// DELETE /api/estantes/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    const librosCount = await db.collection('libros').countDocuments({
      id_estante: new ObjectId(req.params.id)
    });
    
    if (librosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar, tiene libros asociados' 
      });
    }
    
    const result = await db.collection('estantes').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Estante no encontrado' });
    }
    
    res.json({ success: true, message: 'Estante eliminado' });
  } catch (error) {
    console.error('Error al eliminar estante:', error);
    res.status(500).json({ error: 'Error al eliminar estante' });
  }
});

module.exports = router;
