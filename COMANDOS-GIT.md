# 🚀 Comandos para Subir a GitHub

## Paso 1: Configurar Git con tu cuenta

Abre tu terminal (Git Bash o PowerShell) y ejecuta estos comandos:

```bash
# Configurar tu nombre de usuario
git config --global user.name "tvgamersur2-Pro"

# Configurar tu correo
git config --global user.email "tvgamersur2@gmail.com"

# Verificar configuración
git config --global --list
```

## Paso 2: Inicializar Git en tu proyecto

```bash
# Navegar a tu proyecto
cd "d:/P01-ING-SW/SISTEMA DE BRYAN/IE-Bliblioteca"

# Inicializar Git (si no está inicializado)
git init

# Verificar estado
git status
```

## Paso 3: Preparar archivos para subir

```bash
# Agregar todos los archivos (respeta .gitignore)
git add .

# Ver qué archivos se van a subir
git status

# Hacer el primer commit
git commit -m "Initial commit - Sistema Biblioteca IE con Node.js y MongoDB"
```

## Paso 4: Conectar con GitHub

```bash
# Conectar con tu repositorio
git remote add origin https://github.com/tvgamersur2-Pro/Biblioteca-IE.git

# Verificar que se agregó correctamente
git remote -v

# Cambiar a rama main (si estás en master)
git branch -M main
```

## Paso 5: Subir el código a GitHub

```bash
# Primera subida (puede pedir usuario y contraseña)
git push -u origin main
```

### 🔐 Autenticación en GitHub

Cuando te pida credenciales, tienes 2 opciones:

#### Opción A: Token de Acceso Personal (Recomendado)

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Nombre: `Biblioteca-IE-Token`
4. Selecciona: `repo` (todos los permisos de repositorio)
5. Click en "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Cuando Git pida contraseña, pega el token

#### Opción B: GitHub CLI

```bash
# Instalar GitHub CLI
winget install --id GitHub.cli

# Autenticarse
gh auth login
```

## 📦 Comandos para Actualizaciones Futuras

Cuando hagas cambios en tu código:

```bash
# Ver qué archivos cambiaron
git status

# Agregar archivos modificados
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción de los cambios"

# Subir cambios
git push
```

## 🔍 Verificar que se subió correctamente

1. Ve a: https://github.com/tvgamersur2-Pro/Biblioteca-IE
2. Deberías ver todos tus archivos
3. Verifica que NO esté el archivo `.env` (debe estar oculto por .gitignore)

## ⚠️ Archivos que NO se subirán (por .gitignore)

- `node_modules/` (se instalan con npm install)
- `.env` (datos sensibles)
- `*.log` (archivos de log)
- `.vscode/` (configuración de editor)

## 🎯 Siguiente Paso: Desplegar en Render.com

Una vez que tu código esté en GitHub, sigue estos pasos:

### 1. Crear cuenta en Render
- Ve a: https://render.com
- Click en "Get Started for Free"
- Regístrate con tu cuenta de GitHub

### 2. Crear Web Service
- Click en "New +" → "Web Service"
- Conecta tu repositorio `Biblioteca-IE`
- Configuración:
  ```
  Name: biblioteca-ie
  Region: Oregon (US West)
  Branch: main
  Runtime: Node
  Build Command: npm install
  Start Command: npm start
  Instance Type: Free
  ```

### 3. Variables de Entorno en Render

Agrega estas variables (click en "Advanced" → "Add Environment Variable"):

```
MONGODB_URI=mongodb+srv://bibliotecajlo_db_user:wSMp8jnDuJePPl3c@cluster0.xxxxx.mongodb.net/
DB_NAME=biblioteca
JWT_SECRET=cambiar_por_secreto_seguro_en_produccion
ADMIN_PASSWORD=admin123
PORT=10000
NODE_ENV=production
ALLOWED_ORIGINS=https://biblioteca-ie.onrender.com
```

### 4. Deploy
- Click en "Create Web Service"
- Espera 5-10 minutos
- Tu app estará en: `https://biblioteca-ie.onrender.com`

## 🔄 Actualizaciones Automáticas

Render se actualiza automáticamente cuando haces push a GitHub:

```bash
# Hacer cambios en tu código
# ...

# Subir cambios
git add .
git commit -m "Descripción de cambios"
git push

# Render detecta el push y redespliega automáticamente
```

## 📱 Configurar MongoDB Atlas para Producción

1. **Whitelist de IPs en MongoDB Atlas**
   - Ve a: https://cloud.mongodb.com
   - Network Access → Add IP Address
   - Agrega: `0.0.0.0/0` (permitir todas las IPs)
   - O agrega las IPs de Render (más seguro)

2. **Verificar conexión**
   - Render te mostrará logs en tiempo real
   - Busca el mensaje: "🚀 Servidor corriendo"

## 🆘 Solución de Problemas

### Error: "Repository not found"
```bash
# Verificar URL del repositorio
git remote -v

# Si está mal, cambiarla
git remote set-url origin https://github.com/tvgamersur2-Pro/Biblioteca-IE.git
```

### Error: "Authentication failed"
- Usa un token de acceso personal en lugar de contraseña
- O usa GitHub CLI: `gh auth login`

### Error: "failed to push"
```bash
# Si el repositorio ya tiene contenido
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error en Render: "Build failed"
- Verifica que `package.json` tenga el script `"start": "node server.js"`
- Revisa los logs en Render para ver el error específico

## 📊 Resumen de URLs

Después de configurar todo:

- **Repositorio GitHub**: https://github.com/tvgamersur2-Pro/Biblioteca-IE
- **App en Render**: https://biblioteca-ie.onrender.com (o el nombre que elijas)
- **MongoDB Atlas**: https://cloud.mongodb.com

## 💡 Consejos Finales

1. **Haz commits frecuentes** con mensajes descriptivos
2. **Nunca subas el archivo .env** a GitHub
3. **Usa .env.example** para documentar qué variables se necesitan
4. **Prueba localmente** antes de hacer push
5. **Revisa los logs** en Render si algo falla

## 🎓 Comandos Git Útiles

```bash
# Ver diferencias antes de commit
git diff

# Ver historial de commits
git log --oneline --graph

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Ver archivos ignorados
git status --ignored

# Limpiar archivos no rastreados
git clean -fd
```
