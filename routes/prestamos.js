const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

router.use(autenticarToken);

// GET /api/prestamos
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { filtro } = req.query;
    
    let matchStage = {};
    
    if (filtro === 'devueltos') {
      matchStage.devuelto = true;
    } else if (filtro === 'activos') {
      matchStage.devuelto = false;
    }
    // Si filtro === 'todos', no agregamos filtro
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'libros',
          localField: 'id_libro',
          foreignField: '_id',
          as: 'libro_info'
        }
      },
      {
        $project: {
          nombre_alumno: 1,
          grado: 1,
          fecha_prestamo: 1,
          fecha_devolucion: 1,
          devuelto: 1,
          titulo: { $arrayElemAt: ['$libro_info.titulo', 0] },
          codigo: { $arrayElemAt: ['$libro_info.codigo', 0] },
          id_libro: 1,
          fecha_registro: 1
        }
      },
      { $sort: { fecha_devolucion: 1 } }
    ];
    
    const prestamos = await db.collection('prestamos').aggregate(pipeline).toArray();
    
    res.json(prestamos);
  } catch (error) {
    console.error('Error al listar préstamos:', error);
    res.status(500).json({ error: 'Error al obtener préstamos' });
  }
});

// POST /api/prestamos
router.post('/', async (req, res) => {
  try {
    const { id_libro, nombre_alumno, grado, fecha_devolucion } = req.body;
    
    if (!id_libro || !nombre_alumno || !fecha_devolucion) {
      return res.status(400).json({ 
        error: 'Libro, alumno y fecha de devolución son obligatorios' 
      });
    }
    
    const db = await getDB();
    
    const nuevoPrestamo = {
      id_libro: new ObjectId(id_libro),
      nombre_alumno: nombre_alumno.trim(),
      grado: grado ? grado.trim() : '',
      fecha_prestamo: new Date().toISOString().split('T')[0],
      fecha_devolucion: fecha_devolucion,
      devuelto: false,
      fecha_registro: new Date().toISOString()
    };
    
    const result = await db.collection('prestamos').insertOne(nuevoPrestamo);
    
    res.status(201).json({ 
      ...nuevoPrestamo, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    res.status(500).json({ error: 'Error al crear préstamo' });
  }
});

// PUT /api/prestamos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id_libro, nombre_alumno, grado, fecha_devolucion } = req.body;
    
    if (!id_libro || !nombre_alumno || !fecha_devolucion) {
      return res.status(400).json({ 
        error: 'Libro, alumno y fecha de devolución son obligatorios' 
      });
    }
    
    const db = await getDB();
    
    const updateData = {
      id_libro: new ObjectId(id_libro),
      nombre_alumno: nombre_alumno.trim(),
      grado: grado ? grado.trim() : '',
      fecha_devolucion: fecha_devolucion
    };
    
    const result = await db.collection('prestamos').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar préstamo:', error);
    res.status(500).json({ error: 'Error al actualizar préstamo' });
  }
});

// PATCH /api/prestamos/:id/devolver
router.patch('/:id/devolver', async (req, res) => {
  try {
    const db = await getDB();
    
    const result = await db.collection('prestamos').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { devuelto: true } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al marcar como devuelto:', error);
    res.status(500).json({ error: 'Error al marcar como devuelto' });
  }
});

// DELETE /api/prestamos/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    const result = await db.collection('prestamos').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, message: 'Préstamo eliminado' });
  } catch (error) {
    console.error('Error al eliminar préstamo:', error);
    res.status(500).json({ error: 'Error al eliminar préstamo' });
  }
});

module.exports = router;
