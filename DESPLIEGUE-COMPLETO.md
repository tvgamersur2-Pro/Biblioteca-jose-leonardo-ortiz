# Guía de Despliegue Completo

## Arquitectura del Proyecto
- **Frontend**: Netlify (archivos estáticos en carpeta `public`)
- **Backend**: Render (servidor Node.js con Express)
- **Base de Datos**: MongoDB Atlas (base de datos en la nube)

## Paso 1: Desplegar Backend en Render

1. Ve a https://render.com y crea una cuenta (puedes usar GitHub)

2. Click en "New +" → "Web Service"

3. Conecta tu repositorio de GitHub: `Biblioteca-jose-leonardo-ortiz`

4. Configura el servicio:
   - **Name**: `biblioteca-backend` (o el nombre que prefieras)
   - **Region**: Oregon (US West) o el más cercano
   - **Branch**: `main`
   - **Root Directory**: (déjalo vacío)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

5. Agrega las Variables de Entorno (Environment Variables):
   Click en "Advanced" y agrega estas variables desde tu archivo `.env`:
   ```
   MONGODB_URI=tu_connection_string_de_mongodb_atlas
   DB_NAME=biblioteca
   JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro
   ADMIN_PASSWORD=tu_password_admin
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   PORT=3000
   ```

6. Click en "Create Web Service"

7. Espera a que se despliegue (5-10 minutos)

8. Copia la URL que te da Render (ejemplo: `https://biblioteca-backend.onrender.com`)

## Paso 2: Actualizar Frontend con la URL del Backend

1. En tu proyecto local, abre estos archivos y reemplaza `https://tu-backend.onrender.com` con la URL real de Render:
   - `public/js/public.js`
   - `public/js/login.js`
   - `public/js/dashboard.js`
   - `public/js/libros.js`
   - `public/js/reportes.js`
   - `public/js/config.js`

2. Guarda los cambios y súbelos a GitHub:
   ```bash
   git add .
   git commit -m "Actualizar URL del backend"
   git push origin main
   ```

## Paso 3: Netlify se Actualizará Automáticamente

Netlify detectará los cambios en GitHub y redesplegar automáticamente tu frontend.

## Paso 4: Verificar que Todo Funciona

1. Abre tu sitio en Netlify: https://biblioteca-jose-leonardo-ortiz.netlify.app
2. Verifica que:
   - Las estadísticas se cargan correctamente
   - El catálogo de libros aparece
   - Puedes buscar libros
   - El login funciona

## Problemas Comunes

### Error CORS
Si ves errores de CORS, verifica que en `server.js` la URL de Netlify esté en la lista de orígenes permitidos:
```javascript
const allowedOrigins = [
  'https://biblioteca-jose-leonardo-ortiz.netlify.app'
];
```

### Backend se duerme (Free tier de Render)
El plan gratuito de Render pone el servicio en "sleep" después de 15 minutos de inactividad.
La primera petición puede tardar 30-60 segundos en despertar.

### Base de datos no conecta
Verifica que tu MongoDB Atlas:
- Tenga configurado el acceso desde cualquier IP (0.0.0.0/0) en Network Access
- El connection string sea correcto
- El usuario tenga permisos de lectura/escritura

## URLs Finales

- **Frontend**: https://biblioteca-jose-leonardo-ortiz.netlify.app
- **Backend**: https://tu-backend.onrender.com (actualiza con tu URL real)
- **Repositorio**: https://github.com/tvgamersur2-Pro/Biblioteca-jose-leonardo-ortiz.git
