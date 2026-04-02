# 📚 Sistema de Biblioteca IE

Sistema de gestión de biblioteca escolar desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

- ✅ Gestión completa de libros, autores, categorías y estantes
- ✅ Sistema de préstamos con control de fechas
- ✅ Catálogo público con búsqueda en tiempo real
- ✅ Captura de portadas con cámara web/móvil
- ✅ Reportes exportables a Excel
- ✅ Importación masiva desde Excel
- ✅ Autenticación JWT
- ✅ Panel de administración responsive

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: MongoDB Atlas
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilos**: Bootstrap 5
- **Exportación**: ExcelJS
- **Almacenamiento**: Cloudinary (imágenes)

## 📋 Requisitos Previos

- Node.js 16+ 
- MongoDB Atlas (cuenta gratuita)
- Git

## 🔧 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tvgamersur2-Pro/Biblioteca-IE.git
cd Biblioteca-IE
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos
# MONGODB_URI=tu_conexion_mongodb
# JWT_SECRET=tu_secreto_jwt
```

4. **Inicializar base de datos**
```bash
npm run init-db
```

5. **Iniciar servidor**
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

6. **Abrir en navegador**
```
http://localhost:3000
```

## 🌐 Despliegue en Render.com

1. Crear cuenta en [Render.com](https://render.com)
2. Conectar repositorio de GitHub
3. Configurar Web Service:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Agregar variables de entorno
5. Deploy automático

Ver guía completa en: [GUIA-DESPLIEGUE-NETLIFY.md](GUIA-DESPLIEGUE-NETLIFY.md)

## 📁 Estructura del Proyecto

```
IE-Bliblioteca/
├── config/           # Configuración de BD
├── middleware/       # Autenticación JWT
├── routes/          # Rutas de la API
├── public/          # Frontend estático
│   ├── css/
│   ├── js/
│   └── *.html
├── imagenes/        # Portadas de libros
├── server.js        # Servidor Express
└── package.json
```

## 🔐 Credenciales por Defecto

**Usuario administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **Cambiar en producción**

## 📊 Módulos del Sistema

### Administración
- Gestión de libros
- Gestión de autores
- Gestión de categorías
- Gestión de estantes
- Gestión de usuarios
- Gestión de préstamos

### Catálogo Público
- Búsqueda de libros
- Vista de tarjetas
- Paginación
- Sin autenticación requerida

### Reportes
- Estadísticas generales
- Libros más prestados
- Préstamos vencidos
- Exportación a Excel

## 📝 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Inicializar base de datos
npm run init-db

# Probar conexión a MongoDB
npm run test-connection
```

## 🔄 Importación de Datos

El sistema incluye scripts para importar datos desde Excel:

```bash
# Importación limpia (borra datos existentes)
node import-limpio.js

# Importación optimizada (mantiene datos)
node import-excel-optimizado.js
```

Ver guía completa en: [INSTRUCCIONES-IMPORTACION.md](INSTRUCCIONES-IMPORTACION.md)

## 📸 Captura de Portadas

- Soporte para cámara web y móvil
- Usa cámara trasera automáticamente en móviles
- Preview antes de guardar
- Compresión automática

Ver guía en: [FUNCIONALIDAD-CAMARA.md](FUNCIONALIDAD-CAMARA.md)

## 📤 Exportación de Reportes

- Exportar préstamos a Excel
- Exportar catálogo de libros
- Exportar préstamos vencidos
- Formato profesional con estilos

Ver guía en: [INSTRUCCIONES-EXPORTACION-REPORTES.md](INSTRUCCIONES-EXPORTACION-REPORTES.md)

## 🔒 Seguridad

- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- CORS configurado
- Variables de entorno para datos sensibles
- Validación de tokens en cada petición

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verificar MONGODB_URI en .env
- Verificar whitelist de IPs en MongoDB Atlas

### Error de autenticación
- Verificar JWT_SECRET en .env
- Limpiar localStorage del navegador

### Imágenes no se cargan
- Verificar configuración de Cloudinary
- Verificar permisos de carpeta imagenes/

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles

## 👤 Autor

**tvgamersur2**
- GitHub: [@tvgamersur2-Pro](https://github.com/tvgamersur2-Pro)
- Email: tvgamersur2@gmail.com

## 🙏 Agradecimientos

- Bootstrap por los estilos
- MongoDB Atlas por la base de datos gratuita
- Cloudinary por el almacenamiento de imágenes
- ExcelJS por la exportación de reportes

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub
