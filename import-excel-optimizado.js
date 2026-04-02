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
        
        console.log('📖 Leyendo archivo Excel...');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('INVENTARIO BIBLIOTECA 17-11-2025.xlsx');
        
        const worksheet = workbook.worksheets[0];
        console.log(`📄 Procesando hoja: ${worksheet.name}`);
        console.log(`📊 Total de filas: ${worksheet.rowCount}`);
        
        // Colecciones para almacenar datos únicos
        const autoresMap = new Map();
        const categoriasMap = new Map();
        const estantesMap = new Map();
        const libros = [];
        
        console.log('\n🔍 Procesando datos del Excel...');
        
        // Los datos empiezan en la fila 10
        const FILA_INICIO = 10;
        
        for (let rowNumber = FILA_INICIO; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            const numero = row.getCell(1).value?.toString().trim();
            const codigo = row.getCell(2).value?.toString().trim();
            const materia = row.getCell(3).value?.toString().trim();
            const tipoEjemplar = row.getCell(4).value?.toString().trim();
            const titulo = row.getCell(5).value?.toString().trim();
            const autor = row.getCell(6).value?.toString().trim();
            const editorial = row.getCell(7).value?.toString().trim();
            const edicion = row.getCell(8).value?.toString().trim();
            const paginas = row.getCell(9).value?.toString().trim();
            const fechaAdq = row.getCell(10).value?.toString().trim();
            const estadoConserv = row.getCell(11).value?.toString().trim();
            const cantidad = row.getCell(12).value?.toString().trim();
            
            if (!titulo || titulo === 'undefined' || titulo.length < 3) continue;
            
            if (autor && autor !== 'undefined' && autor.length > 1) {
                if (!autoresMap.has(autor)) {
                    autoresMap.set(autor, { nombre: autor, fecha_registro: new Date() });
                }
            }
            
            if (materia && materia !== 'undefined' && materia.length > 1) {
                if (!categoriasMap.has(materia)) {
                    categoriasMap.set(materia, { nombre: materia, fecha_registro: new Date() });
                }
            }
            
            const estante = codigo ? codigo.split('.')[0] : 'SIN-ESTANTE';
            if (estante && !estantesMap.has(estante)) {
                estantesMap.set(estante, { numero: estante, fecha_registro: new Date() });
            }
            
            let codigoUnico = codigo || `LIB-${numero || rowNumber}`;
            let contador = 1;
            const codigoBase = codigoUnico;
            while (libros.some(l => l.codigo === codigoUnico)) {
                codigoUnico = `${codigoBase}-${contador}`;
                contador++;
            }
            
            libros.push({
                titulo,
                codigo: codigoUnico,
                autor: autor || 'Desconocido',
                categoria: materia || 'Sin categoría',
                estante: estante,
                editorial: editorial || null,
                tipo_ejemplar: tipoEjemplar || null,
                edicion: edicion || null,
                paginas: paginas || null,
                fecha_adquisicion: fechaAdq || null,
                estado_conservacion: estadoConserv || null,
                cantidad: cantidad || '1'
            });
        }
        
        console.log(`✅ ${libros.length} libros procesados del Excel`);
        
        // Insertar autores con insertMany y ordered:false
        console.log('\n📝 Insertando autores...');
        const autoresArray = Array.from(autoresMap.values());
        if (autoresArray.length > 0) {
            try {
                const result = await db.collection('autores').insertMany(autoresArray, { ordered: false });
                console.log(`   ✓ ${result.insertedCount} autores nuevos insertados`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`   ✓ ${error.result.insertedCount} autores nuevos (algunos ya existían)`);
                } else {
                    throw error;
                }
            }
        }
        
        const autoresInsertados = await db.collection('autores').find({}).toArray();
        const autoresIdMap = new Map();
        autoresInsertados.forEach(a => autoresIdMap.set(a.nombre, a._id));
        
        // Insertar categorías
        console.log('📝 Insertando categorías...');
        const categoriasArray = Array.from(categoriasMap.values());
        if (categoriasArray.length > 0) {
            try {
                const result = await db.collection('categorias').insertMany(categoriasArray, { ordered: false });
                console.log(`   ✓ ${result.insertedCount} categorías nuevas insertadas`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`   ✓ ${error.result.insertedCount} categorías nuevas (algunas ya existían)`);
                } else {
                    throw error;
                }
            }
        }
        
        const categoriasInsertadas = await db.collection('categorias').find({}).toArray();
        const categoriasIdMap = new Map();
        categoriasInsertadas.forEach(c => categoriasIdMap.set(c.nombre, c._id));
        
        // Insertar estantes
        console.log('📝 Insertando estantes...');
        const estantesArray = Array.from(estantesMap.values());
        if (estantesArray.length > 0) {
            try {
                const result = await db.collection('estantes').insertMany(estantesArray, { ordered: false });
                console.log(`   ✓ ${result.insertedCount} estantes nuevos insertados`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`   ✓ ${error.result.insertedCount} estantes nuevos (algunos ya existían)`);
                } else {
                    throw error;
                }
            }
        }
        
        const estantesInsertados = await db.collection('estantes').find({}).toArray();
        const estantesIdMap = new Map();
        estantesInsertados.forEach(e => estantesIdMap.set(e.numero, e._id));
        
        // Insertar libros en lotes
        console.log('📝 Insertando libros...');
        const librosConReferencias = libros.map(libro => ({
            titulo: libro.titulo,
            codigo: libro.codigo,
            id_autor: autoresIdMap.get(libro.autor) || null,
            id_categoria: categoriasIdMap.get(libro.categoria) || null,
            id_estante: estantesIdMap.get(libro.estante) || null,
            editorial: libro.editorial,
            tipo_ejemplar: libro.tipo_ejemplar,
            edicion: libro.edicion,
            paginas: libro.paginas,
            fecha_adquisicion: libro.fecha_adquisicion,
            estado_conservacion: libro.estado_conservacion,
            cantidad: libro.cantidad,
            fecha_registro: new Date()
        }));
        
        const batchSize = 500;
        let totalInsertados = 0;
        
        for (let i = 0; i < librosConReferencias.length; i += batchSize) {
            const batch = librosConReferencias.slice(i, i + batchSize);
            try {
                const result = await db.collection('libros').insertMany(batch, { ordered: false });
                totalInsertados += result.insertedCount;
                console.log(`   ✓ ${totalInsertados} libros insertados...`);
            } catch (error) {
                if (error.code === 11000) {
                    totalInsertados += error.result.insertedCount;
                    console.log(`   ✓ ${totalInsertados} libros insertados (algunos duplicados omitidos)...`);
                } else {
                    throw error;
                }
            }
        }
        
        console.log(`\n🎉 ¡Importación completada!`);
        console.log(`   Total de libros en la base de datos: ${await db.collection('libros').countDocuments()}`);
        
    } catch (error) {
        console.error('❌ Error durante la importación:', error.message);
    } finally {
        await client.close();
        console.log('🔌 Conexión cerrada');
    }
}

importarExcel().catch(console.error);
