const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

router.use(autenticarToken);

// GET /api/libros/buscar - Búsqueda con paginación y filtros
router.get('/buscar', async (req, res) => {
  try {
    const db = await getDB();
    const { 
      buscar = '', 
      categoria = '', 
      estante = '', 
      disponible = '', 
      pagina = 1, 
      limite = 8 
    } = req.query;
    
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    
    // Construir filtros
    let matchStage = {};
    
    // Búsqueda por texto
    if (buscar) {
      matchStage.$or = [
        { titulo: { $regex: buscar, $options: 'i' } },
        { codigo: { $regex: buscar, $options: 'i' } }
      ];
    }
    
    // Filtro por categoría
    if (categoria) {
      matchStage.id_categoria = new ObjectId(categoria);
    }
    
    // Filtro por estante
    if (estante) {
      matchStage.id_estante = new ObjectId(estante);
    }
    
    let pipeline = [
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
        $lookup: {
          from: 'estantes',
          localField: 'id_estante',
          foreignField: '_id',
          as: 'estante_info'
        }
      },
      {
        $lookup: {
          from: 'prestamos',
          let: { libro_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$id_libro', '$$libro_id'] },
                    { $eq: ['$devuelto', false] }
                  ]
                }
              }
            }
          ],
          as: 'prestamos_activos'
        }
      },
      {
        $project: {
          titulo: 1,
          codigo: 1,
          autor: { $arrayElemAt: ['$autor_info.nombre', 0] },
          categoria: { $arrayElemAt: ['$categoria_info.nombre', 0] },
          estante: { $arrayElemAt: ['$estante_info.numero', 0] },
          id_autor: 1,
          id_categoria: 1,
          id_estante: 1,
          portada: 1,
          disponible: { $eq: [{ $size: '$prestamos_activos' }, 0] },
          fecha_registro: 1
        }
      }
    ];
    
    // Filtro por disponibilidad
    if (disponible === 'true') {
      pipeline.push({ $match: { disponible: true } });
    }
    
    // Contar total antes de paginar
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await db.collection('libros').aggregate(countPipeline).toArray();
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    // Aplicar paginación
    pipeline.push({ $sort: { titulo: 1 } });
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
    console.error('Error al buscar libros:', error);
    res.status(500).json({ error: 'Error al buscar libros' });
  }
});

// GET /api/libros
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { buscar } = req.query;
    
    let pipeline = [
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
        $lookup: {
          from: 'estantes',
          localField: 'id_estante',
          foreignField: '_id',
          as: 'estante_info'
        }
      },
      {
        $project: {
          titulo: 1,
          codigo: 1,
          autor: { $arrayElemAt: ['$autor_info.nombre', 0] },
          categoria: { $arrayElemAt: ['$categoria_info.nombre', 0] },
          estante: { $arrayElemAt: ['$estante_info.numero', 0] },
          id_autor: 1,
          id_categoria: 1,
          id_estante: 1,
          portada: 1,
          fecha_registro: 1
        }
      }
    ];
    
    if (buscar) {
      pipeline.unshift({
        $match: {
          $or: [
            { titulo: { $regex: buscar, $options: 'i' } },
            { codigo: { $regex: buscar, $options: 'i' } }
          ]
        }
      });
    }
    
    pipeline.push({ $sort: { titulo: 1 } });
    
    const libros = await db.collection('libros').aggregate(pipeline).toArray();
    
    res.json(libros);
  } catch (error) {
    console.error('Error al listar libros:', error);
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

// GET /api/libros/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const libro = await db.collection('libros').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json(libro);
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ error: 'Error al obtener libro' });
  }
});

// POST /api/libros
router.post('/', upload.single('portada'), async (req, res) => {
  try {
    const { titulo, codigo, id_autor, autor_nombre, id_categoria, id_estante } = req.body;
    
    if (!titulo || !codigo || (!id_autor && !autor_nombre)) {
      return res.status(400).json({ 
        error: 'Título, código y autor son obligatorios' 
      });
    }
    
    const db = await getDB();
    
    let autorId;
    
    // Si se proporciona id_autor, usarlo directamente
    if (id_autor) {
      autorId = new ObjectId(id_autor);
    } else {
      // Si se proporciona autor_nombre, buscar o crear
      let autor = await db.collection('autores').findOne({ 
        nombre: autor_nombre.trim() 
      });
      
      if (!autor) {
        const resultAutor = await db.collection('autores').insertOne({
          nombre: autor_nombre.trim(),
          fecha_registro: new Date().toISOString()
        });
        autorId = resultAutor.insertedId;
      } else {
        autorId = autor._id;
      }
    }
    
    // Subir imagen a Cloudinary si existe
    let portadaUrl = null;
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'biblioteca/portadas' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        portadaUrl = result.secure_url;
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }
    
    const nuevoLibro = {
      titulo: titulo.trim(),
      codigo: codigo.trim(),
      id_autor: autorId,
      id_categoria: new ObjectId(id_categoria),
      id_estante: new ObjectId(id_estante),
      portada: portadaUrl,
      fecha_registro: new Date().toISOString()
    };
    
    const result = await db.collection('libros').insertOne(nuevoLibro);
    
    res.status(201).json({ 
      ...nuevoLibro, 
      _id: result.insertedId 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El código del libro ya existe' });
    }
    console.error('Error al crear libro:', error);
    res.status(500).json({ error: 'Error al crear libro' });
  }
});

// PUT /api/libros/:id
router.put('/:id', upload.single('portada'), async (req, res) => {
  try {
    const { titulo, codigo, id_autor, autor_nombre, id_categoria, id_estante } = req.body;
    
    if (!titulo || !codigo || (!id_autor && !autor_nombre)) {
      return res.status(400).json({ 
        error: 'Título, código y autor son obligatorios' 
      });
    }
    
    const db = await getDB();
    
    let autorId;
    
    // Si se proporciona id_autor, usarlo directamente
    if (id_autor) {
      autorId = new ObjectId(id_autor);
    } else {
      // Si se proporciona autor_nombre, buscar o crear
      let autor = await db.collection('autores').findOne({ 
        nombre: autor_nombre.trim() 
      });
      
      if (!autor) {
        const resultAutor = await db.collection('autores').insertOne({
          nombre: autor_nombre.trim(),
          fecha_registro: new Date().toISOString()
        });
        autorId = resultAutor.insertedId;
      } else {
        autorId = autor._id;
      }
    }
    
    const updateData = {
      titulo: titulo.trim(),
      codigo: codigo.trim(),
      id_autor: autorId,
      id_categoria: new ObjectId(id_categoria),
      id_estante: new ObjectId(id_estante)
    };
    
    // Subir nueva imagen a Cloudinary si existe
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'biblioteca/portadas' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        updateData.portada = result.secure_url;
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }
    
    const result = await db.collection('libros').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({ error: 'Error al actualizar libro' });
  }
});

// DELETE /api/libros/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    
    // Verificar si tiene préstamos asociados
    const prestamosCount = await db.collection('prestamos').countDocuments({
      id_libro: new ObjectId(req.params.id)
    });
    
    if (prestamosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar, tiene préstamos asociados' 
      });
    }
    
    const result = await db.collection('libros').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json({ success: true, message: 'Libro eliminado' });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ error: 'Error al eliminar libro' });
  }
});

module.exports = router;
