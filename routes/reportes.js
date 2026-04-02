const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { getDB } = require('../config/database');
const { autenticarToken } = require('../middleware/auth');

router.use(autenticarToken);

// GET /api/reportes/estadisticas
router.get('/estadisticas', async (req, res) => {
  try {
    const db = await getDB();
    
    // Estadísticas generales
    const totalLibros = await db.collection('libros').countDocuments();
    const totalAutores = await db.collection('autores').countDocuments();
    const totalCategorias = await db.collection('categorias').countDocuments();
    const totalEstantes = await db.collection('estantes').countDocuments();
    const totalPrestamos = await db.collection('prestamos').countDocuments();
    const prestamosActivos = await db.collection('prestamos').countDocuments({ devuelto: false });
    
    const hoy = new Date().toISOString().split('T')[0];
    const vencidos = await db.collection('prestamos').countDocuments({
      devuelto: false,
      fecha_devolucion: { $lt: hoy }
    });
    
    res.json({
      totalLibros,
      totalAutores,
      totalCategorias,
      totalEstantes,
      totalPrestamos,
      prestamosActivos,
      prestamosVencidos: vencidos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/reportes/mas-prestados
router.get('/mas-prestados', async (req, res) => {
  try {
    const db = await getDB();
    
    const masPrestados = await db.collection('prestamos').aggregate([
      {
        $group: {
          _id: '$id_libro',
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'libros',
          localField: '_id',
          foreignField: '_id',
          as: 'libro_info'
        }
      },
      {
        $project: {
          titulo: { $arrayElemAt: ['$libro_info.titulo', 0] },
          codigo: { $arrayElemAt: ['$libro_info.codigo', 0] },
          total: 1
        }
      },
      { $sort: { total: -1 } },
      { $limit: 8 }
    ]).toArray();
    
    res.json(masPrestados);
  } catch (error) {
    console.error('Error al obtener libros más prestados:', error);
    res.status(500).json({ error: 'Error al obtener libros más prestados' });
  }
});

// GET /api/reportes/vencidos
router.get('/vencidos', async (req, res) => {
  try {
    const db = await getDB();
    const hoy = new Date().toISOString().split('T')[0];
    
    const listaVencidos = await db.collection('prestamos').aggregate([
      {
        $match: {
          devuelto: false,
          fecha_devolucion: { $lt: hoy }
        }
      },
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
          fecha_devolucion: 1,
          titulo: { $arrayElemAt: ['$libro_info.titulo', 0] },
          dias_retraso: {
            $dateDiff: {
              startDate: { $dateFromString: { dateString: '$fecha_devolucion' } },
              endDate: new Date(),
              unit: 'day'
            }
          }
        }
      },
      { $sort: { fecha_devolucion: 1 } }
    ]).toArray();
    
    res.json(listaVencidos);
  } catch (error) {
    console.error('Error al obtener préstamos vencidos:', error);
    res.status(500).json({ error: 'Error al obtener préstamos vencidos' });
  }
});

// GET /api/reportes/exportar
router.get('/exportar', async (req, res) => {
  try {
    const { tipo } = req.query;
    const db = await getDB();
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Biblioteca IE';
    workbook.created = new Date();
    
    if (tipo === 'prestamos' || !tipo) {
      // Exportar préstamos
      const prestamos = await db.collection('prestamos').aggregate([
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
            titulo: { $arrayElemAt: ['$libro_info.titulo', 0] },
            codigo: { $arrayElemAt: ['$libro_info.codigo', 0] },
            nombre_alumno: 1,
            grado: 1,
            fecha_prestamo: 1,
            fecha_devolucion: 1,
            estado: {
              $cond: {
                if: '$devuelto',
                then: 'Devuelto',
                else: 'Pendiente'
              }
            }
          }
        },
        { $sort: { fecha_prestamo: -1 } }
      ]).toArray();
      
      const worksheet = workbook.addWorksheet('Préstamos');
      
      worksheet.columns = [
        { header: 'Libro', key: 'titulo', width: 40 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Alumno', key: 'nombre_alumno', width: 30 },
        { header: 'Grado', key: 'grado', width: 12 },
        { header: 'Fecha Préstamo', key: 'fecha_prestamo', width: 15 },
        { header: 'Fecha Devolución', key: 'fecha_devolucion', width: 18 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      
      prestamos.forEach(p => {
        worksheet.addRow({
          titulo: p.titulo,
          codigo: p.codigo,
          nombre_alumno: p.nombre_alumno,
          grado: p.grado || '',
          fecha_prestamo: p.fecha_prestamo,
          fecha_devolucion: p.fecha_devolucion,
          estado: p.estado
        });
      });
      
      // Estilo del header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    }
    
    if (tipo === 'vencidos') {
      // Exportar préstamos vencidos
      const hoy = new Date().toISOString().split('T')[0];
      const vencidos = await db.collection('prestamos').aggregate([
        {
          $match: {
            devuelto: false,
            fecha_devolucion: { $lt: hoy }
          }
        },
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
            titulo: { $arrayElemAt: ['$libro_info.titulo', 0] },
            codigo: { $arrayElemAt: ['$libro_info.codigo', 0] },
            nombre_alumno: 1,
            grado: 1,
            fecha_prestamo: 1,
            fecha_devolucion: 1,
            dias_retraso: {
              $dateDiff: {
                startDate: { $dateFromString: { dateString: '$fecha_devolucion' } },
                endDate: new Date(),
                unit: 'day'
              }
            }
          }
        },
        { $sort: { fecha_devolucion: 1 } }
      ]).toArray();
      
      const worksheet = workbook.addWorksheet('Préstamos Vencidos');
      
      worksheet.columns = [
        { header: 'Libro', key: 'titulo', width: 40 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Alumno', key: 'nombre_alumno', width: 30 },
        { header: 'Grado', key: 'grado', width: 12 },
        { header: 'Fecha Préstamo', key: 'fecha_prestamo', width: 15 },
        { header: 'Fecha Devolución', key: 'fecha_devolucion', width: 18 },
        { header: 'Días de Retraso', key: 'dias_retraso', width: 15 }
      ];
      
      vencidos.forEach(v => {
        worksheet.addRow({
          titulo: v.titulo,
          codigo: v.codigo,
          nombre_alumno: v.nombre_alumno,
          grado: v.grado || '',
          fecha_prestamo: v.fecha_prestamo,
          fecha_devolucion: v.fecha_devolucion,
          dias_retraso: v.dias_retraso
        });
      });
      
      // Estilo del header (rojo para vencidos)
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD32F2F' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    }
    
    if (tipo === 'libros') {
      // Exportar libros
      const libros = await db.collection('libros').aggregate([
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
            estante: { $arrayElemAt: ['$estante_info.numero', 0] }
          }
        },
        { $sort: { titulo: 1 } }
      ]).toArray();
      
      const worksheet = workbook.addWorksheet('Libros');
      
      worksheet.columns = [
        { header: 'Título', key: 'titulo', width: 40 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Autor', key: 'autor', width: 30 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Estante', key: 'estante', width: 12 }
      ];
      
      libros.forEach(l => {
        worksheet.addRow({
          titulo: l.titulo,
          codigo: l.codigo,
          autor: l.autor,
          categoria: l.categoria,
          estante: l.estante
        });
      });
      
      // Estilo del header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    }
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `reporte_${tipo || 'prestamos'}_${fecha}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ error: 'Error al exportar a Excel' });
  }
});

module.exports = router;
