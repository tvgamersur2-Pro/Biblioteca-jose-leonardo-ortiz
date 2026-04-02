const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

// GET /api/publico/estadisticas
router.get('/estadisticas', async (req, res) => {
  try {
    const db = await getDB();
    
    const totalLibros = await db.collection('libros').countDocuments();
    const totalAutores = await db.collection('autores').countDocuments();
    const totalCategorias = await db.collection('categorias').countDocuments();
    
    res.json({
      totalLibros,
      totalAutores,
      totalCategorias
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/publico/libros - Catálogo público con búsqueda
router.get('/libros', async (req, res) => {
  try {
    const db = await getDB();
    const { buscar = '', pagina = 1, limite = 12 } = req.query;
    
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    
    let matchStage = {};
    
    if (buscar) {
      matchStage.$or = [
        { titulo: { $regex: buscar, $options: 'i' } },
        { codigo: { $regex: buscar, $options: 'i' } }
      ];
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'autores',
          localField: 'id_autor',
          foreignField: '_id',
          as: 'autor_info'
        }
      },
      {
        $lookup: {
          from: 'categorias',
          localField: 'id_categoria',
          foreignField: '_id',
          as: 'categoria_info'
        }
      },
      {
        $project: {
          titulo: 1,
          codigo: 1,
          autor: { $arrayElemAt: ['$autor_info.nombre', 0] },
          categoria: { $arrayElemAt: ['$categoria_info.nombre', 0] },
          portada: 1,
          editorial: 1
        }
      },
      { $sort: { titulo: 1 } }
    ];
    
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await db.collection('libros').aggregate(countPipeline).toArray();
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limite) });
    
    const libros = await db.collection('libros').aggregate(pipeline).toArray();
    
    res.json({
      libros,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(total / parseInt(limite))
    });
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({ error: 'Error al obtener catálogo' });
  }
});

module.exports = router;
