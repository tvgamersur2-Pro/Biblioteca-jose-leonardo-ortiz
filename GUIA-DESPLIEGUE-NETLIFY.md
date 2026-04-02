# 🚀 Guía para Desplegar en Netlify con GitHub

## ⚠️ IMPORTANTE: Netlify vs Backend Node.js

**Netlify es principalmente para sitios estáticos y frontend.** Tu proyecto tiene un backend Node.js con Express que necesita estar corriendo constantemente.

### Opciones de Despliegue:

1. **Netlify Functions** (Serverless) - Limitado
2. **Render.com** (Recomendado para backend Node.js) - GRATIS
3. **Railway.app** (Alternativa) - GRATIS
4. **Vercel** (Alternativa) - GRATIS

## 📋 Opción 1: Netlify (Solo Frontend Estático)

Si solo quieres el frontend público en Netlify:

### Archivos que NO debes subir a Git:
```
node_modules/
.env
*.log
imagenes/portadas/*  (solo si son muchas imágenes)
```

### Archivos que SÍ debes subir:
```
✅ public/
✅ package.json
✅ .env.example
✅ .gitignore
✅ README.md
```

## 📋 Opción 2: Render.com (RECOMENDADO para tu proyecto)

Render es perfecto para aplicaciones Node.js con backend.

### Paso 1: Preparar el Proyecto

1. **Verifica que tu .gitignore esté correcto** (ya lo tienes)

2. **Asegúrate de tener .env.example** (ya lo tienes)

3. **Agrega un archivo README.md** (opcional pero recomendado)

### Paso 2: Subir a GitHub

```bash
# 1. Inicializar Git (si no lo has hecho)
cd "d:/P01-ING-SW/SISTEMA DE BRYAN/IE-Bliblioteca"
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer el primer commit
git commit -m "Initial commit - Sistema Biblioteca IE"

# 4. Crear repositorio en GitHub
# Ve a: https://github.com/new
# Nombre sugerido: biblioteca-ie-nodejs
# Descripción: Sistema de gestión de biblioteca escolar con Node.js y MongoDB
# Público o Privado: Tu eliges

# 5. Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/biblioteca-ie-nodejs.git

# 6. Subir el código
git branch -M main
git push -u origin main
```

### Paso 3: Configurar en Render.com

1. **Crear cuenta en Render**
   - Ve a: https://render.com
   - Regístrate con tu cuenta de GitHub

2. **Crear nuevo Web Service**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `biblioteca-ie-nodejs`

3. **Configuración del servicio**
   ```
   Name: biblioteca-ie
   Region: Oregon (US West) o el más cercano
   Branch: main
   Root Directory: (dejar vacío)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Variables de Entorno**
   
   En la sección "Environment Variables", agrega:
   
   ```
   MONGODB_URI=mongodb+srv://bibliotecajlo_db_user:wSMp8jnDuJePPl3c@cluster0.xxxxx.mongodb.net/
   DB_NAME=biblioteca
   JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_cambiar_en_produccion
   ADMIN_PASSWORD=admin123
   PORT=10000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://tu-app.onrender.com
   ```

5. **Deploy**
   - Click en "Create Web Service"
   - Espera 5-10 minutos mientras se despliega
   - Tu app estará en: `https://biblioteca-ie.onrender.com`

## 🔐 Datos que NECESITAS de GitHub

Para subir tu código a GitHub necesitas:

### 1. Cuenta de GitHub
- **URL**: https://github.com
- Si no tienes cuenta, créala gratis

### 2. Crear Repositorio Nuevo
- **Nombre sugerido**: `biblioteca-ie-nodejs`
- **Descripción**: Sistema de gestión de biblioteca escolar
- **Visibilidad**: 
  - ✅ Público (si quieres compartir)
  - ✅ Privado (si es solo para ti)

### 3. Token de Acceso Personal (si usas HTTPS)
- Ve a: GitHub → Settings → Developer settings → Personal access tokens
- Genera un token con permisos de `repo`
- Guárdalo en un lugar seguro

### 4. O usa SSH (alternativa)
- Genera una clave SSH
- Agrégala a tu cuenta de GitHub

## 📝 Comandos Git Básicos

```bash
# Ver estado de archivos
git status

# Agregar archivos específicos
git add archivo.js

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Descripción de cambios"

# Ver historial
git log --oneline

# Subir cambios
git push

# Bajar cambios
git pull

# Ver ramas
git branch

# Crear nueva rama
git checkout -b nombre-rama
```

## 🔒 Seguridad: Variables de Entorno

**NUNCA subas estos datos a GitHub:**
- ❌ Archivo `.env`
- ❌ Contraseñas de MongoDB
- ❌ JWT_SECRET
- ❌ Credenciales de Cloudinary

**Siempre usa:**
- ✅ Archivo `.env.example` (sin datos reales)
- ✅ Variables de entorno en Render/Netlify
- ✅ `.gitignore` para excluir `.env`

## 📊 Estructura Recomendada para Git

```
IE-Bliblioteca/
├── .env.example          ✅ Subir (sin datos reales)
├── .gitignore           ✅ Subir
├── package.json         ✅ Subir
├── server.js            ✅ Subir
├── config/              ✅ Subir
├── routes/              ✅ Subir
├── middleware/          ✅ Subir
├── public/              ✅ Subir
├── imagenes/            ⚠️  Solo estructura, no portadas
├── *.md                 ✅ Subir (documentación)
├── .env                 ❌ NO subir
└── node_modules/        ❌ NO subir
```

## 🎯 Checklist Antes de Subir

- [ ] Verificar que `.gitignore` esté correcto
- [ ] Crear `.env.example` sin datos sensibles
- [ ] Probar que `npm install` funcione
- [ ] Probar que `npm start` funcione
- [ ] Documentar en README.md cómo instalar
- [ ] Eliminar archivos temporales
- [ ] Verificar que no haya contraseñas en el código

## 🆘 Solución de Problemas

### Error: "remote: Repository not found"
- Verifica la URL del repositorio
- Verifica que tengas permisos

### Error: "failed to push some refs"
- Haz `git pull` primero
- Luego `git push`

### Error: "Authentication failed"
- Usa un token de acceso personal
- O configura SSH

## 📞 Datos que Necesito de Ti

Para ayudarte mejor, dime:

1. **¿Ya tienes cuenta en GitHub?**
   - Sí / No
   - Usuario de GitHub: _______

2. **¿Prefieres repositorio público o privado?**
   - Público / Privado

3. **¿Qué plataforma prefieres para el backend?**
   - Render.com (recomendado)
   - Railway.app
   - Vercel
   - Otro

4. **¿Ya tienes Git instalado?**
   - Sí / No
   - Versión: `git --version`

5. **¿Tienes MongoDB Atlas configurado?**
   - Sí / No
   - ¿Necesitas ayuda para configurarlo?
