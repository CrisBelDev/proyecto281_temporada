# 🚀 Inicio Rápido para Otro Desarrollador

## ✅ Configuración Simple - 5 Minutos

Este es un **proyecto universitario**, todo está pre-configurado. Solo sigue estos pasos:

---

## 📥 1. Clonar el Proyecto

```bash
git clone <url-del-repositorio>
cd proyecto281_temporada
```

---

## ⚙️ 2. Configurar Backend

### Instalar Dependencias

```bash
cd backend
npm install
```

### Configurar Base de Datos

```sql
CREATE DATABASE inventario_saas;
```

### Editar IP Local (Solo si es diferente a 192.168.0.11)

```bash
# 1. Obtener TU IP
ipconfig   # Windows
ifconfig   # Linux/Mac

# 2. Editar backend/.env
# Cambiar la línea LOCAL_IP=192.168.0.11 por TU IP
```

### Ejecutar Migraciones

```bash
# Revisar carpeta migrations/ y ejecutar cada .sql en MySQL
```

### Iniciar Backend

```bash
npm start
```

✅ Deberías ver:

```
🚀 Servidor corriendo en puerto 3000
📍 API Local: http://localhost:3000/api
```

---

## 🌐 3. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Deberías ver:

```
➜  Local:   http://localhost:5173/
```

---

## 📱 4. Configurar Mobile (Opcional)

### Para Emulador Android:

Editar `mobile/lib/config/constants.dart`:

```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

### Para Celular Físico:

```dart
// Usar TU IP (la misma que pusiste en backend/.env)
static const String baseUrl = 'http://192.168.0.11:3000/api';
```

```bash
cd mobile
flutter pub get
flutter run
```

---

## 🔑 Credenciales de Prueba

### SUPERUSER

- **Email**: `superadmin@sistema.com`
- **Password**: `12345678`

### Usuario Normal

- **Email**: `admin1769657379956@miempresademo.com`
- **Password**: `12345678`

---

## 🔥 Firewall (Si no puedes conectar desde móvil)

### Windows:

```cmd
# Ejecutar como Administrador
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000
```

---

## ❓ Problemas Comunes

### Backend no inicia

- ✅ Verifica que MySQL esté corriendo
- ✅ Verifica que la base de datos `inventario_saas` exista
- ✅ Revisa `backend/.env` tiene configuración correcta

### Frontend no se conecta

- ✅ Verifica que backend esté corriendo (`http://localhost:3000/api`)
- ✅ Reinicia Vite después de cambiar `.env`

### Mobile no se conecta

- ✅ Para emulador usa: `http://10.0.2.2:3000/api`
- ✅ Para celular físico:
  - Usa TU IP en `constants.dart`
  - Celular y PC en la misma WiFi
  - Firewall permite puerto 3000

---

## 📚 Documentación Completa

- [README.md](README.md) - Información general del proyecto
- [CONFIGURACION_MULTI_DEV.md](CONFIGURACION_MULTI_DEV.md) - Guía detallada de configuración

---

## ✨ ¡Listo!

Ahora puedes:

- ✅ Acceder al frontend: http://localhost:5173
- ✅ Probar API: http://localhost:3000/api
- ✅ Desarrollar y compartir código sin conflictos

**Los archivos `.env` ya están configurados, solo ajusta la IP si es diferente.**
