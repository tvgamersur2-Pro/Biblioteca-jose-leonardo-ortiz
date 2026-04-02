# ⚡ INICIO RÁPIDO - Subir a GitHub

## 🎯 Tu Información

- **Usuario GitHub**: tvgamersur2-Pro
- **Correo**: tvgamersur2@gmail.com
- **Repositorio**: https://github.com/tvgamersur2-Pro/Biblioteca-IE

## 📝 Comandos a Ejecutar (COPIA Y PEGA)

Abre tu terminal (Git Bash o PowerShell) y ejecuta:

```bash
# 1. Configurar Git
git config --global user.name "tvgamersur2-Pro"
git config --global user.email "tvgamersur2@gmail.com"

# 2. Ir a tu proyecto
cd "d:/P01-ING-SW/SISTEMA DE BRYAN/IE-Bliblioteca"

# 3. Inicializar Git
git init

# 4. Agregar archivos
git add .

# 5. Hacer commit
git commit -m "Initial commit - Sistema Biblioteca IE"

# 6. Conectar con GitHub
git remote add origin https://github.com/tvgamersur2-Pro/Biblioteca-IE.git

# 7. Cambiar a rama main
git branch -M main

# 8. Subir código
git push -u origin main
```

## 🔑 IMPORTANTE: Token de GitHub

Cuando te pida contraseña, necesitas un TOKEN:

1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Nombre: `Biblioteca-IE-Token`
4. Marca: ☑️ repo
5. Click "Generate token"
6. **COPIA EL TOKEN**
7. Pégalo cuando Git pida "Password"

## ✅ Verificar

Después de hacer push, ve a:
https://github.com/tvgamersur2-Pro/Biblioteca-IE

Deberías ver todos tus archivos.

## 🚀 Siguiente: Desplegar en Render

1. Ve a: https://render.com
2. Regístrate con GitHub
3. New + → Web Service
4. Selecciona: Biblioteca-IE
5. Build: `npm install`
6. Start: `npm start`
7. Agrega variables de entorno
8. Deploy

## 📞 ¿Problemas?

Dime qué error te sale y te ayudo.
