# 🌐 Configuración Multi-Desarrollador

**Proyecto Universitario**: Los archivos `.env` están incluidos en el repositorio para facilitar la colaboración.

Esta guía te ayudará a configurar el proyecto para que **múltiples desarrolladores** puedan trabajar sin problemas, cada uno con su propia IP y entorno.

---

## 📋 Lo que Necesitas Saber

✅ Los archivos `.env` **YA EXISTEN** en el repositorio  
✅ Solo necesitas **cambiar la IP local** si es diferente  
✅ No necesitas copiar archivos `.env.example`

---

## 📋 Problema que Resuelve

Cuando compartes código con otro desarrollador, las URLs hardcodeadas como `http://localhost:3000` o `http://192.168.0.11:3000` causan problemas porque:

- ✅ **Tu PC**: `192.168.0.11`
- ❌ **PC del otro dev**: `192.168.0.25` (diferente IP)
- ❌ **Móvil del otro dev**: No puede conectar a tu IP

**Solución**: Variables de entorno que cada dev configura según su red.

---

## 🎯 Configuración para el PRIMER Desarrollador (Tú)

### 1️⃣ Backend

```bash
cd backend
```

**Copia el archivo de ejemplo:**

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Obtén tu IP local:**

```bash
# Windows
ipconfig

# Linux/Mac
ifconfig

# Busca la IPv4 de tu WiFi, por ejemplo: 192.168.0.11
```

**El archivo `backend/.env` ya existe en el repositorio.**  
Solo edítalo si necesitas cambiar la IP o configuración de BD:

```env
# Ejemplo: Si tu IP es diferente, cambia esta línea
LOCAL_IP=192.168.0.11   # Cámbiala a TU IP

# Si tu BD tiene password, agrégalo aquí
DB_PASSWORD=
```

### 2️⃣ Frontend

```bash
cd frontend
```

**El archivo `frontend/.env` ya existe en el repositorio.**  
La configuración por defecto debería funcionar. Solo edita si necesitas cambiar algo:

```env
# Si trabajas en el mismo PC que el backend (por defecto)
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000

# Si accedes desde otro dispositivo en tu red
# VITE_API_URL=http://192.168.0.11:3000/api
# VITE_BACKEND_URL=http://192.168.0.11:3000
```

### 3️⃣ Mobile (Flutter)

**Edita `mobile/lib/config/constants.dart`:**

Para **emulador Android**:

```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

Para **dispositivo físico** (celular en la misma red WiFi):

```dart
static const String baseUrl = 'http://192.168.0.11:3000/api';
```

---

## 👥 Configuración para el SEGUNDO Desarrollador

### 1️⃣ Clonar el Repositorio

```bash
git clone <url-del-repo>
cd proyecto281_temporada
```

### 2️⃣ Backend

**Obtener su IP local:**

```bash
ipconfig   # Windows
ifconfig   # Linux/Mac

# Por ejemplo, obtiene: 192.168.0.25
```

**El archivo .env ya existe en el repositorio.**  
Solo edítalo con SU IP local:

```bash
cd backend
# Editar .env (ya existe)
```

```env
# Cambiar esta línea con SU IP local (ej: 192.168.0.25)
LOCAL_IP=192.168.0.25

# Agregar su IP al CORS si es diferente
CORS_ORIGIN=http://localhost:5173,http://192.168.0.25:5173

# Si su BD tiene password, agregarlo
DB_PASSWORD=su_password_mysql
```

**Instalar dependencias:**

```bash
npm install
```

**Crear base de datos:**

```sql
CREATE DATABASE inventario_saas;
```

**Ejecutar migraciones:**

```bash
# Revisar carpeta migrations/ y ejecutar cada .sql
# O ejecutar script de migraciones si existe
```

**Iniciar backend:**

```bash
npm start
```

### 3️⃣ Frontend del Segundo Dev

```bash
cd frontend
```

**El archivo .env ya existe.**  
La configuración por defecto debería funcionar (conecta a localhost):

```env
# Por defecto conecta al backend en la misma PC
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

**Instalar y ejecutar:**

```bash
npm install
npm run dev
```

### 4️⃣ Mobile del Segundo Dev

**Editar `mobile/lib/config/constants.dart`:**

Si usa **emulador**:

```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

Si usa **celular físico** y el backend está en su PC:

```dart
// Usar SU IP (192.168.0.25 en este ejemplo)
static const String baseUrl = 'http://192.168.0.25:3000/api';
```

---

## 🔥 Configuración del Firewall (Windows)

Si otro dev no puede conectarse a tu backend, debes abrir el puerto en el firewall:

### Opción 1: GUI (Interfaz Gráfica)

1. **Abre "Windows Defender Firewall"**
2. **"Configuración avanzada"**
3. **"Reglas de entrada"** → **"Nueva regla"**
4. **Tipo**: Puerto
5. **Protocolo**: TCP
6. **Puerto específico**: `3000`
7. **Permitir la conexión**
8. **Perfil**: Privado, Dominio
9. **Nombre**: "Node.js Backend - Puerto 3000"

### Opción 2: CMD (Línea de comandos - Ejecutar como Administrador)

```cmd
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000
```

---

## 📱 Configuración para Acceso desde Móvil

### Escenario 1: Móvil se conecta al Backend en TU PC

Tu celular → Tu WiFi → Tu PC (192.168.0.11:3000)

**En el móvil, editar `constants.dart`:**

```dart
static const String baseUrl = 'http://192.168.0.11:3000/api';
```

### Escenario 2: Móvil del Otro Dev

Su celular → Su WiFi → Su PC (192.168.0.25:3000)

**En su móvil, editar `constants.dart`:**

```dart
static const String baseUrl = 'http://192.168.0.25:3000/api';
```

### ⚠️ IMPORTANTE para Móviles

1. **Misma red WiFi**: El celular DEBE estar en la misma red WiFi que la PC
2. **Firewall**: El firewall debe permitir el puerto 3000
3. **HTTPS no necesario**: En desarrollo local, HTTP es suficiente
4. **IP dinámica**: Si tu router asigna IPs dinámicas, la IP puede cambiar. Asigna IP estática en el router.

---

## 🔍 Cómo Verificar que Todo Funciona

### 1. Backend

```bash
cd backend
npm start
```

Deberías ver:

```
========================================
🚀 Servidor corriendo en puerto 3000
📍 Local: http://localhost:3000
📍 Red Local: http://192.168.0.25:3000
📍 API Local: http://localhost:3000/api
📍 API Red Local: http://192.168.0.25:3000/api

💡 Para acceder desde otro dispositivo:
   1. Usa la URL: http://192.168.0.25:3000/api
   2. Asegúrate que el firewall permita el puerto 3000
   3. El dispositivo debe estar en la misma red WiFi
========================================
```

### 2. Frontend

```bash
cd frontend
npm run dev
```

Deberías ver:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.25:5173/
```

### 3. Probar API desde Navegador

Abre en el navegador:

```
http://localhost:3000/api
```

Deberías ver:

```json
{
	"mensaje": "API del Sistema de Inventario SaaS",
	"version": "1.0.0"
}
```

### 4. Probar desde Otro Dispositivo

Desde **otro celular o PC en la misma red**, abre:

```
http://192.168.0.25:3000/api
```

Si ves el JSON, ¡funciona! 🎉

---

## 🐛 Solución de Problemas

### ❌ Error: "Network request failed" en Mobile

**Causa**: El móvil no puede conectarse al backend

**Solución**:

1. Verifica que estén en la **misma red WiFi**
2. Verifica la IP en `constants.dart`
3. Abre el firewall (puerto 3000)
4. Prueba con navegador del móvil: `http://TU_IP:3000/api`

### ❌ Error: "CORS policy" en Frontend

**Causa**: El backend rechaza requests del frontend

**Solución**:
Agrega el origen en `backend/.env`:

```env
CORS_ORIGIN=http://localhost:5173,http://192.168.0.25:5173
```

### ❌ Backend no muestra la IP correcta

**Solución**:
Edita `backend/.env`:

```env
LOCAL_IP=TU_IP_CORRECTA
```

### ❌ Frontend no se conecta al backend

**Verifica** `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

**Reinicia el servidor de Vite** después de cambiar `.env`:

```bash
# Ctrl+C para detener
npm run dev
```

---

## 📦 Archivos de Configuración - Resumen

| Archivo                            | Propósito                   | Ejemplo                                    | Subido a Git |
| ---------------------------------- | --------------------------- | ------------------------------------------ | ------------ |
| `backend/.env`                     | Config del servidor Node.js | `PORT=3000, LOCAL_IP=192.168.0.11`         | ✅ Sí        |
| `frontend/.env`                    | Config del cliente React    | `VITE_API_URL=http://localhost:3000/api`   | ✅ Sí        |
| `mobile/lib/config/constants.dart` | Config de la app Flutter    | `baseUrl = 'http://192.168.0.11:3000/api'` | ✅ Sí        |

**Nota**: Este es un proyecto universitario, los archivos de configuración se suben a Git para facilitar la colaboración.

---

## ✅ Checklist para Nuevo Desarrollador

- [ ] Clonar el repositorio
- [ ] **Backend**:
  - [ ] `npm install`
  - [ ] Editar `.env` (ya existe)
  - [ ] Configurar base de datos MySQL
  - [ ] Ejecutar migraciones
  - [ ] Cambiar `LOCAL_IP` a su IP (si es diferente)
  - [ ] `npm start`
- [ ] **Frontend**:
  - [ ] `npm install`
  - [ ] Editar `.env` (ya existe) si es necesario
  - [ ] `npm run dev`
- [ ] **Mobile** (si aplica):
  - [ ] `flutter pub get`
  - [ ] Editar `constants.dart` con su IP
  - [ ] `flutter run`
- [ ] **Firewall**:
  - [ ] Abrir puerto 3000 en Windows Defender
- [ ] **Probar**:
  - [ ] Acceder a `http://localhost:3000/api`
  - [ ] Acceder a `http://localhost:5173`
  - [ ] Login en frontend
  - [ ] Login en mobile

---

## 🌍 Trabajo Remoto (Internet, no red local)

Si los desarrolladores están en **ubicaciones diferentes** (no en la misma WiFi):

### Opciones:

1. **Ngrok** (Túnel temporal):

   ```bash
   # Instalar ngrok
   npm install -g ngrok

   # Exponer backend
   ngrok http 3000

   # Obtienes una URL pública: https://abc123.ngrok.io
   # Usar esta URL en VITE_API_URL y constants.dart
   ```

2. **Deploy en la nube**:
   - Backend: Render, Railway, Heroku
   - Frontend: Vercel, Netlify
   - Base de datos: PlanetScale, Railway

3. **VPN**: Crear una red privada virtual para simular red local

---

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs del backend (consola donde hiciste `npm start`)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica las IPs con `ipconfig` / `ifconfig`
4. Asegúrate que el firewall permite conexiones
5. Verifica que todos están en la misma red WiFi

---

## 🎉 ¡Listo!

Con esta configuración, cada desarrollador puede trabajar independientemente con su propia IP, y compartir el código sin conflictos.

**Importante**: Los archivos `.env` **NO se suben a Git** (ya están en `.gitignore`). Cada dev debe crear su propio `.env` desde `.env.example`.
