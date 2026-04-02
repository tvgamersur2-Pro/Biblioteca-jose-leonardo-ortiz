# Importación de Datos desde Excel

## Tu archivo Excel tiene:
- **1,467 libros** para importar
- **382 autores** únicos
- **449 categorías** únicas  
- **371 estantes** únicos

## Estructura detectada:
- Columna 2: CÓDIGO
- Columna 3: MATERIA (categoría)
- Columna 5: TÍTULO
- Columna 6: AUTOR
- Columna 7: EDITORIAL
- Los datos empiezan en la fila 10

## Scripts disponibles:

### 1. import-limpio.js (RECOMENDADO)
Borra todos los datos existentes e importa todo desde cero.

```bash
node import-limpio.js
```

**Ventajas:**
- Más rápido
- Sin problemas de duplicados
- Base de datos limpia

**Desventaja:**
- Borra los datos actuales (usuarios, préstamos, etc. se mantienen)

### 2. import-excel-optimizado.js
Importa solo los datos nuevos, respetando los existentes.

```bash
node import-excel-optimizado.js
```

**Ventajas:**
- Mantiene datos existentes
- Solo agrega lo nuevo

**Desventaja:**
- Más lento (verifica cada registro)

## Pasos para importar:

1. **Detén el servidor si está corriendo:**
   ```bash
   # Presiona Ctrl+C en la terminal donde corre npm run dev
   ```

2. **Ejecuta el script de importación:**
   ```bash
   node import-limpio.js
   ```

3. **Verifica los datos:**
   - Abre tu aplicación
   - Ve a la sección de Libros
   - Deberías ver los 1,467 libros importados

## Notas importantes:

- Los códigos duplicados se manejan automáticamente agregando un número
- Los autores sin nombre se marcan como "Desconocido"
- Las categorías vacías se marcan como "Sin categoría"
- Los estantes se generan a partir del código del libro (primera parte antes del punto)

## Si algo sale mal:

Puedes reiniciar la base de datos con:
```bash
npm run init-db
```

Y luego volver a importar.
