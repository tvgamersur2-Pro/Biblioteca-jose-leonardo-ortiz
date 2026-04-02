# Instrucciones para Exportar Reportes a Excel

## ✅ Problema Solucionado

Se ha corregido la funcionalidad de exportación a Excel en el módulo de reportes. Ahora puedes exportar diferentes tipos de reportes con autenticación correcta.

## 📊 Tipos de Reportes Disponibles

### 1. Exportar Préstamos
- **Botón**: "Exportar Préstamos" (verde)
- **Contenido**: Todos los préstamos (activos y devueltos)
- **Columnas**:
  - Libro
  - Código
  - Alumno
  - Grado
  - Fecha Préstamo
  - Fecha Devolución
  - Estado (Devuelto/Pendiente)

### 2. Exportar Libros
- **Botón**: "Exportar Libros" (verde outline)
- **Contenido**: Catálogo completo de libros
- **Columnas**:
  - Título
  - Código
  - Autor
  - Categoría
  - Estante

### 3. Exportar Préstamos Vencidos
- **Botón**: "Exportar Vencidos" (rojo, aparece solo si hay vencidos)
- **Contenido**: Solo préstamos con retraso
- **Columnas**:
  - Libro
  - Código
  - Alumno
  - Grado
  - Fecha Préstamo
  - Fecha Devolución
  - Días de Retraso

## 🚀 Cómo Usar

1. **Accede al módulo de Reportes**
   - Inicia sesión en el sistema
   - Ve a la sección "Reportes" en el menú lateral

2. **Selecciona el tipo de reporte**
   - Haz clic en el botón correspondiente al reporte que deseas
   - Los botones están en la parte superior derecha

3. **Descarga automática**
   - El archivo Excel se descargará automáticamente
   - Nombre del archivo: `reporte_[tipo]_[fecha].xlsx`
   - Ejemplo: `reporte_prestamos_2025-11-17.xlsx`

## 🔧 Cambios Realizados

### Archivos Creados
- ✅ `public/js/reportes.js` - Funciones de exportación con autenticación

### Archivos Modificados
- ✅ `public/reportes.html` - Botones actualizados y script externo
- ✅ `routes/reportes.js` - Agregado endpoint para exportar vencidos

### Mejoras Implementadas
1. **Autenticación correcta**: Ahora se envía el token JWT en cada petición
2. **Descarga directa**: El archivo se descarga sin abrir nueva pestaña
3. **Múltiples formatos**: Tres tipos de reportes diferentes
4. **Mensajes de confirmación**: Notificaciones de éxito o error
5. **Formato Excel profesional**: Headers con colores y estilos

## 📝 Formato de los Archivos Excel

- **Headers con estilo**: Fondo de color, texto blanco, negrita
- **Colores por tipo**:
  - Préstamos: Azul (#4472C4)
  - Libros: Verde (#2E7D32)
  - Vencidos: Rojo (#D32F2F)
- **Columnas auto-ajustadas**: Anchos optimizados para cada tipo de dato
- **Ordenamiento lógico**: Datos ordenados por relevancia

## 🐛 Solución de Problemas

### Error: "No se puede descargar el archivo"
- Verifica que estés autenticado (token válido)
- Recarga la página e intenta nuevamente

### Error: "Error al exportar reporte"
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador para más detalles

### El archivo está vacío
- Verifica que haya datos en la base de datos
- Para "Vencidos", solo se exporta si hay préstamos con retraso

## 💡 Notas Importantes

- Los reportes se generan en tiempo real con los datos actuales
- El formato es `.xlsx` (Excel moderno), compatible con Excel 2007+
- Los archivos incluyen la fecha de generación en el nombre
- La exportación requiere autenticación (debes estar logueado)

## 🎯 Próximos Pasos Sugeridos

Si necesitas más funcionalidades, puedes agregar:
- Filtros por fecha (rango de fechas)
- Exportar por categoría o autor específico
- Gráficos dentro del Excel
- Reportes programados (envío por email)
