const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { autenticarToken, verificarAdmin } = require('../middleware/auth');

router.use(autenticarToken);

// GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    
    const pipeline = [
      {
        $lookup: {
          from: 'perfiles',
          localField: 'id_perfil',
          foreignField: '_id',
          as: 'perfil_info'
        }
      },
      {
        $project: {
          usuario: 1,
          email: 1,
          rol: 1,
          perfil: { $arrayElemAt: ['$perfil_info.nombre', 0] },
          id_perfil: 1,
          fecha_creacion: 1
        }
      },
      { $sort: { usuario: 1 } }
    ];
    
    const usuarios = await db.collection('usuarios').aggregate(pipeline).toArray();
    
    // No enviar contraseñas
    const usuariosSinClave = usuarios.map(u => {
      const { clave, ...resto } = u;
      return resto;
    });
    
    res.json(usuariosSinClave);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST /api/usuarios
router.post('/', verificarAdmin, async (req, res) => {
  try {
    const { usuario, email, clave, id_perfil } = req.body;
    
    if (!usuario || usuario.trim() === '') {
      return res.status(400).json({ error: 'El usuario es obligatorio' });
    }
    
    if (!clave || clave.trim() === '') {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }
    
    const db = await getDB();
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(12);
    const claveHash = await bcrypt.hash(clave, salt);
    
    const nuevoUsuario = {
      usuario: usuario.trim(),
      email: email ? email.trim() : null,
      clave: claveHash,
      rol: 'admin',
      id_perfil: id_perfil ? new ObjectId(id_perfil) : null,
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await db.collection('usuarios').insertOne(nuevoUsuario);
    
    // No devolver la contraseña
    const { clave: _, ...usuarioSinClave } = nuevoUsuario;
    
    res.status(201).json({ 
      ...usuarioSinClave, 
      _id: result.insertedId 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', verificarAdmin, async (req, res) => {
  try {
    const { usuario, email, clave, id_perfil } = req.body;
    
    if (!usuario || usuario.trim() === '') {
      return res.status(400).json({ error: 'El usuario es obligatorio' });
    }
    
    const db = await getDB();
    
    const updateData = {
      usuario: usuario.trim(),
      email: email ? email.trim() : null,
      id_perfil: id_perfil ? new ObjectId(id_perfil) : null
    };
    
    // Si se proporciona nueva contraseña, encriptarla
    if (clave && clave.trim() !== '') {
      const salt = await bcrypt.genSalt(12);
      updateData.clave = await bcrypt.hash(clave, salt);
    }
    
    const result = await db.collection('usuarios').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // No devolver la contraseña
    const { clave: _, ...usuarioSinClave } = result;
    
    res.json(usuarioSinClave);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', verificarAdmin, async (req, res) => {
  try {
    const db = await getDB();
    
    // No permitir eliminar el propio usuario
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminarte a ti mismo' 
      });
    }
    
    const result = await db.collection('usuarios').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
