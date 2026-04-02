require('dotenv').config();
const ExcelJS = require('exceljs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'biblioteca';

async function importarExcel() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('📚 Conectando a MongoDB...');
        await client.connect();
        const db = client.db(DB_NAME);
        
        // Limpiar colecciones existentes
        console.log('\n🗑️  Limpiando datos anteriores...');
        await db.collection('libros').deleteMany({});
        await db.collection('autores').deleteMany({});
        await db.collection('categorias').deleteMany({});
        await db.collection('estantes').deleteMany({});
        console.log('   ✓ Datos anteriores eliminados');
        
        console.log('\n📖 Leyendo archivo Excel...');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('INVENTARIO BIBLIOTECA 17-11-2025.xlsx');
        
        const worksheet = workbook.worksheets[0];
        console.log(`📄 Hoja: ${worksheet.name} (${worksheet.rowCount} filas)`);
        
        const autoresMap = new Map();
        const categoriasMap = new Map();
        const estantesMap = new Map();
        const libros = [];
        
        console.log('🔍 Extrayendo datos...');
        
        for (let rowNumber = 10; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            const codigo = row.getCell(2).value?.toString().trim();
            const materia = row.getCell(3).value?.toString().trim();
            const titulo = row.getCell(5).value?.toString().trim();
            const autor = row.getCell(6).value?.toString().trim();
            const editorial = row.getCell(7).value?.toString().trim();
            
            if (!titulo || titulo.length < 3) continue;
            
            const autorFinal = autor && autor.length > 1 ? autor : 'Desconocido';
            const categoriaFinal = materia && materia.length > 1 ? materia : 'Sin categoría';
            const estante = codigo ? codigo.split('.')[0] : 'SIN-ESTANTE';
            
            autoresMap.set(autorFinal, { nombre: autorFinal, fecha_registro: new Date() });
            categoriasMap.set(categoriaFinal, { nombre: categoriaFinal, fecha_registro: new Date() });
            estantesMap.set(estante, { numero: estante, fecha_registro: new Date() });
            
            let codigoUnico = codigo || `LIB-${rowNumber}`;
            let contador = 1;
            while (libros.some(l => l.codigo === codigoUnico)) {
                codigoUnico = `${codigo || 'LIB'}-${contador}`;
                contador++;
            }
            
            libros.push({
                titulo,
                codigo: codigoUnico,
                autor: autorFinal,
                categoria: categoriaFinal,
                estante,
                editorial: editorial || null
            });
        }
        
        console.log(`✅ ${libros.length} libros extraídos\n`);
        
        // Insertar todo
        console.log('📝 Insertando en base de datos...');
        
        const autoresResult = await db.collection('autores').insertMany(Array.from(autoresMap.values()));
        console.log(`   ✓ ${autoresResult.insertedCount} autores`);
        
        const categoriasResult = await db.collection('categorias').insertMany(Array.from(categoriasMap.values()));
        console.log(`   ✓ ${categoriasResult.insertedCount} categorías`);
        
        const estantesResult = await db.collection('estantes').insertMany(Array.from(estantesMap.values()));
        console.log(`   ✓ ${estantesResult.insertedCount} estantes`);
        
        // Obtener IDs
        const autoresInsertados = await db.collection('autores').find({}).toArray();
        const autoresIdMap = new Map(autoresInsertados.map(a => [a.nombre, a._id]));
        
        const categoriasInsertadas = await db.collection('categorias').find({}).toArray();
        const categoriasIdMap = new Map(categoriasInsertadas.map(c => [c.nombre, c._id]));
        
        const estantesInsertados = await db.collection('estantes').find({}).toArray();
        const estantesIdMap = new Map(estantesInsertados.map(e => [e.numero, e._id]));
        
        // Preparar libros con referencias
        const librosConReferencias = libros.map(libro => ({
            titulo: libro.titulo,
            codigo: libro.codigo,
            id_autor: autoresIdMap.get(libro.autor),
            id_categoria: categoriasIdMap.get(libro.categoria),
            id_estante: estantesIdMap.get(libro.estante),
            editorial: libro.editorial,
            fecha_registro: new Date()
        }));
        
        // Insertar libros en lotes
        const batchSize = 500;
        let totalInsertados = 0;
        
        for (let i = 0; i < librosConReferencias.length; i += batchSize) {
            const batch = librosConReferencias.slice(i, i + batchSize);
            const result = await db.collection('libros').insertMany(batch);
            totalInsertados += result.insertedCount;
            console.log(`   ✓ ${totalInsertados}/${librosConReferencias.length} libros`);
        }
        
        console.log('\n🎉 ¡Importación completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

importarExcel();
