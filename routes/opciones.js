const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');
const { autenticarToken, verificarAdmin } = require('../middleware/auth');

router.use(autenticarToken);
router.use(verificarAdmin);

// GET /api/opciones
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const opciones = await db.collection('opciones')
      .find({})
      .sort({ orden: 1 })
      .toArray();
    
    res.json(opciones);
  } catch (error) {
    console.error('Error al listar opciones:', error);
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
});

module.exports = router;
