const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const db = await getDB();
    
    // Buscar usuario con su perfil
    const pipeline = [
      {
        $match: {
          $or: [
            { usuario: usuario },
            { email: usuario }
          ]
        }
      },
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
          clave: 1,
          rol: 1,
          id_perfil: 1,
          perfil: { $arrayElemAt: ['$perfil_info.nombre', 0] }
        }
      }
    ];
    
    const users = await db.collection('usuarios').aggregate(pipeline).toArray();
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña
    const claveValida = await bcrypt.compare(clave, user.clave);

    if (!claveValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        usuario: user.usuario, 
        rol: user.rol,
        perfil: user.perfil
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: user._id,
        usuario: user.usuario,
        email: user.email,
        rol: user.rol,
        perfil: user.perfil
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/verificar - Verificar token
router.get('/verificar', autenticarToken, async (req, res) => {
  try {
    res.json({ 
      valido: true,
      usuario: req.usuario
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar token' });
  }
});

module.exports = router;
