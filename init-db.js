require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'biblioteca';

async function initDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ Conectado a la base de datos:', DB_NAME);
    
    // Crear colecciones
    console.log('\n📦 Creando colecciones...');
    const colecciones = [
      'usuarios',
      'libros',
      'autores',
      'categorias',
      'estantes',
      'prestamos',
      'perfiles',
      'opciones',
      'perfil_opciones'
    ];
    
    for (const col of colecciones) {
      try {
        await db.createCollection(col);
        console.log(`  ✓ Colección "${col}" creada`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`  ℹ Colección "${col}" ya existe`);
        } else {
          throw error;
        }
      }
    }
    
    // Crear índices
    console.log('\n🔑 Creando índices...');
    
    // Usuarios
    await db.collection('usuarios').createIndex({ usuario: 1 }, { unique: true });
    await db.collection('usuarios').createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('  ✓ Índices de usuarios creados');
    
    // Libros
    await db.collection('libros').createIndex({ codigo: 1 }, { unique: true });
    await db.collection('libros').createIndex({ titulo: 1 });
    console.log('  ✓ Índices de libros creados');
    
    // Autores
    await db.collection('autores').createIndex({ nombre: 1 });
    console.log('  ✓ Índices de autores creados');
    
    // Categorías
    await db.collection('categorias').createIndex({ nombre: 1 }, { unique: true });
    console.log('  ✓ Índices de categorías creados');
    
    // Estantes
    await db.collection('estantes').createIndex({ numero: 1 }, { unique: true });
    console.log('  ✓ Índices de estantes creados');
    
    // Préstamos
    await db.collection('prestamos').createIndex({ devuelto: 1 });
    await db.collection('prestamos').createIndex({ fecha_devolucion: 1 });
    await db.collection('prestamos').createIndex({ nombre_alumno: 1 });
    console.log('  ✓ Índices de préstamos creados');
    
    // Perfiles
    await db.collection('perfiles').createIndex({ nombre: 1 }, { unique: true });
    console.log('  ✓ Índices de perfiles creados');
    
    // Crear usuario admin
    console.log('\n👤 Creando usuario administrador...');
    const adminExists = await db.collection('usuarios').findOne({ usuario: 'admin' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const claveHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
      
      await db.collection('usuarios').insertOne({
        usuario: 'admin',
        email: 'admin@biblioteca.com',
        clave: claveHash,
        rol: 'admin',
        id_perfil: null,
        fecha_creacion: new Date().toISOString()
      });
      
      console.log('  ✓ Usuario admin creado');
      console.log('    Usuario: admin');
      console.log('    Contraseña:', process.env.ADMIN_PASSWORD || 'admin123');
    } else {
      console.log('  ℹ Usuario admin ya existe');
    }
    
    // Insertar datos iniciales de autores
    console.log('\n📚 Insertando datos iniciales...');
    const autoresCount = await db.collection('autores').countDocuments();
    if (autoresCount === 0) {
      await db.collection('autores').insertMany([
        { nombre: 'Gabriel García Márquez', fecha_registro: new Date().toISOString() },
        { nombre: 'Isabel Allende', fecha_registro: new Date().toISOString() },
        { nombre: 'Mario Vargas Llosa', fecha_registro: new Date().toISOString() },
        { nombre: 'Julio Cortázar', fecha_registro: new Date().toISOString() },
        { nombre: 'Jorge Luis Borges', fecha_registro: new Date().toISOString() }
      ]);
      console.log('  ✓ Autores iniciales insertados');
    }
    
    // Insertar categorías iniciales
    const categoriasCount = await db.collection('categorias').countDocuments();
    if (categoriasCount === 0) {
      await db.collection('categorias').insertMany([
        { nombre: 'Ficción', fecha_registro: new Date().toISOString() },
        { nombre: 'No Ficción', fecha_registro: new Date().toISOString() },
        { nombre: 'Ciencia', fecha_registro: new Date().toISOString() },
        { nombre: 'Historia', fecha_registro: new Date().toISOString() },
        { nombre: 'Literatura', fecha_registro: new Date().toISOString() },
        { nombre: 'Infantil', fecha_registro: new Date().toISOString() },
        { nombre: 'Juvenil', fecha_registro: new Date().toISOString() },
        { nombre: 'Referencia', fecha_registro: new Date().toISOString() }
      ]);
      console.log('  ✓ Categorías iniciales insertadas');
    }
    
    // Insertar estantes iniciales
    const estantesCount = await db.collection('estantes').countDocuments();
    if (estantesCount === 0) {
      await db.collection('estantes').insertMany([
        { numero: 'A1', fecha_registro: new Date().toISOString() },
        { numero: 'A2', fecha_registro: new Date().toISOString() },
        { numero: 'A3', fecha_registro: new Date().toISOString() },
        { numero: 'B1', fecha_registro: new Date().toISOString() },
        { numero: 'B2', fecha_registro: new Date().toISOString() },
        { numero: 'B3', fecha_registro: new Date().toISOString() },
        { numero: 'C1', fecha_registro: new Date().toISOString() },
        { numero: 'C2', fecha_registro: new Date().toISOString() },
        { numero: 'C3', fecha_registro: new Date().toISOString() }
      ]);
      console.log('  ✓ Estantes iniciales insertados');
    }
    
    // Insertar opciones del menú
    const opcionesCount = await db.collection('opciones').countDocuments();
    let opcionesIds = {};
    
    if (opcionesCount === 0) {
      const opcionesResult = await db.collection('opciones').insertMany([
        { nombre: 'Dashboard', icono: 'bi-speedometer2', url: 'dashboard.html', orden: 1 },
        { nombre: 'Libros', icono: 'bi-book', url: 'libros.html', orden: 2 },
        { nombre: 'Autores', icono: 'bi-person-lines-fill', url: 'autores.html', orden: 3 },
        { nombre: 'Categorías', icono: 'bi-tag', url: 'categorias.html', orden: 4 },
        { nombre: 'Estantes', icono: 'bi-archive', url: 'estantes.html', orden: 5 },
        { nombre: 'Préstamos', icono: 'bi-journal-bookmark', url: 'prestamos.html', orden: 6 },
        { nombre: 'Usuarios', icono: 'bi-people', url: 'usuarios.html', orden: 7 },
        { nombre: 'Perfiles', icono: 'bi-shield-check', url: 'perfiles.html', orden: 8 },
        { nombre: 'Reportes', icono: 'bi-file-earmark-bar-graph', url: 'reportes.html', orden: 9 }
      ]);
      
      // Guardar IDs de opciones
      const opciones = await db.collection('opciones').find().toArray();
      opciones.forEach(op => {
        opcionesIds[op.nombre] = op._id;
      });
      
      console.log('  ✓ Opciones del menú insertadas');
    } else {
      // Si ya existen, obtener sus IDs
      const opciones = await db.collection('opciones').find().toArray();
      opciones.forEach(op => {
        opcionesIds[op.nombre] = op._id;
      });
    }
    
    // Insertar perfiles
    const perfilesCount = await db.collection('perfiles').countDocuments();
    let perfilesIds = {};
    
    if (perfilesCount === 0) {
      const perfilesResult = await db.collection('perfiles').insertMany([
        { nombre: 'Administrador', fecha_creacion: new Date().toISOString() },
        { nombre: 'Usuario', fecha_creacion: new Date().toISOString() }
      ]);
      
      // Guardar IDs de perfiles
      const perfiles = await db.collection('perfiles').find().toArray();
      perfiles.forEach(p => {
        perfilesIds[p.nombre] = p._id;
      });
      
      console.log('  ✓ Perfiles insertados');
    } else {
      // Si ya existen, obtener sus IDs
      const perfiles = await db.collection('perfiles').find().toArray();
      perfiles.forEach(p => {
        perfilesIds[p.nombre] = p._id;
      });
    }
    
    // Insertar relaciones perfil_opciones
    const perfilOpcionesCount = await db.collection('perfil_opciones').countDocuments();
    
    if (perfilOpcionesCount === 0 && Object.keys(perfilesIds).length > 0 && Object.keys(opcionesIds).length > 0) {
      const relacionesAdmin = [
        'Dashboard', 'Libros', 'Autores', 'Categorías', 'Estantes', 
        'Préstamos', 'Usuarios', 'Perfiles', 'Reportes'
      ].map(nombre => ({
        id_perfil: perfilesIds['Administrador'],
        id_opcion: opcionesIds[nombre]
      }));
      
      const relacionesUsuario = [
        'Dashboard', 'Libros', 'Autores', 'Categorías', 'Estantes', 
        'Préstamos', 'Usuarios', 'Perfiles'
      ].map(nombre => ({
        id_perfil: perfilesIds['Usuario'],
        id_opcion: opcionesIds[nombre]
      }));
      
      await db.collection('perfil_opciones').insertMany([
        ...relacionesAdmin,
        ...relacionesUsuario
      ]);
      
      console.log('  ✓ Relaciones perfil-opciones insertadas');
      console.log('    - Administrador: 9 opciones (todas)');
      console.log('    - Usuario: 8 opciones (sin Reportes)');
    }
    
    // Actualizar usuario admin con perfil de Administrador
    if (perfilesIds['Administrador']) {
      await db.collection('usuarios').updateOne(
        { usuario: 'admin' },
        { $set: { id_perfil: perfilesIds['Administrador'] } }
      );
      console.log('  ✓ Usuario admin vinculado al perfil Administrador');
    }
    
    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('\n📝 Próximos pasos:');
    console.log('  1. Copia .env.example a .env y configura tus variables');
    console.log('  2. Ejecuta: npm install');
    console.log('  3. Ejecuta: npm run dev');
    console.log('  4. Abre: http://localhost:3000\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

initDB();
