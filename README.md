# 📦 Sistema de Inventario SaaS - Multi-tenant

Sistema completo de gestión de inventario multi-empresa con backend Node.js, frontend React y app móvil Flutter.

---

## 🚀 Inicio Rápido para Nuevos Desarrolladores

**¿Eres un nuevo desarrollador en este proyecto?**

👉 Lee la guía rápida: **[INICIO_RAPIDO_OTRO_DEV.md](INICIO_RAPIDO_OTRO_DEV.md)**

### ⚠️ IMPORTANTE: Configuración de Red

Los archivos `.env` **ya están incluidos** en el repositorio. Solo necesitas:

1. Cambiar `LOCAL_IP` en `backend/.env` si tu IP es diferente
2. Ejecutar `npm install` en backend y frontend
3. Crear la base de datos MySQL

📖 Guía detallada: **[CONFIGURACION_MULTI_DEV.md](CONFIGURACION_MULTI_DEV.md)**

### 🛠️ Requisitos Previos

- **Node.js** v16 o superior
- **MySQL** o **MariaDB**
- **Flutter** (para el móvil)
- **Git**

---

## 📥 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto281_temporada
```

### 2️⃣ Backend (Node.js + Express)

```bash
cd backend
npm install

# El archivo .env ya existe en el repositorio
# Solo necesitas cambiar LOCAL_IP a tu IP si es diferente
# Ejecuta: ipconfig (Windows) o ifconfig (Linux/Mac)
# Edita backend/.env y cambia la línea LOCAL_IP=192.168.0.11
```

**Crear base de datos:**

```sql
CREATE DATABASE inventario_saas;
```

**Ejecutar migraciones** (en orden):

```bash
# Ver carpeta backend/migrations/
# Ejecutar cada archivo .sql en MySQL
```

**Iniciar servidor:**

```bash
npm start
```

### 3️⃣ Frontend (React + Vite)

```bash
cd frontend
npm install

# El archivo .env ya existe en el repositorio
# La configuración por defecto debería funcionar
# Solo edita si necesitas cambiar la URL del backend
```

**Iniciar desarrollo:**

```bash
npm run dev
```

### 4️⃣ Mobile (Flutter)

```bash
cd mobile
flutter pub get

# IMPORTANTE: Editar lib/config/constants.dart
# Cambiar baseUrl a tu IP local
```

**Ejecutar app:**

```bash
flutter run
```

---

## 🌐 URLs de Acceso

Después de iniciar los servicios:

- **Backend API**: http://localhost:3000/api
- **Frontend Web**: http://localhost:5173
- **Red Local Backend**: http://TU_IP:3000/api
- **Red Local Frontend**: http://TU_IP:5173

---

## 📁 Estructura del Proyecto

```
proyecto281_temporada/
│
├── backend/               # API Node.js + Express + Sequelize
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Autenticación, validaciones
│   │   └── config/        # Configuración de BD
│   ├── migrations/        # Migraciones SQL
│   ├── uploads/           # Archivos subidos
│   ├── .env.example       # Plantilla de variables de entorno
│   └── server.js          # Punto de entrada
│
├── frontend/              # App React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Context API (Auth)
│   │   ├── services/      # API client (axios)
│   │   └── styles/        # CSS
│   ├── .env.example       # Plantilla de variables de entorno
│   └── vite.config.js     # Configuración Vite
│
├── mobile/                # App Flutter
│   ├── lib/
│   │   ├── screens/       # Pantallas
│   │   ├── widgets/       # Widgets reutilizables
│   │   ├── services/      # Servicios API
│   │   └── config/        # Configuración (constants.dart)
│   └── pubspec.yaml       # Dependencias Flutter
│
└── CONFIGURACION_MULTI_DEV.md  # Guía para trabajar en equipo
```

---

## 🔑 Credenciales de Prueba

El sistema crea automáticamente un **SUPERUSER** al iniciar:

- **Email**: `superadmin@sistema.com`
- **Password**: `12345678`

También se creó un usuario de prueba:

- **Email**: `admin1769657379956@miempresademo.com`
- **Password**: `12345678`

⚠️ **Importante**: Cambiar estas contraseñas en producción.

---

## 📋 Funcionalidades

### ✅ Módulos Implementados

1. **Autenticación y Usuarios**
   - Login/Registro
   - Roles (SUPERUSER, ADMIN, VENDEDOR)
   - Gestión multi-tenant (por empresa)
   - Verificación de email
   - Recuperación de contraseña

2. **Empresas**
   - Gestión de empresas
   - Subida de logos
   - Portal público por slug
   - Sistema de suscripciones (3 planes)

3. **Productos**
   - CRUD completo
   - Categorías
   - Imágenes de productos
   - Stock y alertas
   - Gestión de proveedores

4. **Ventas**
   - Registro de ventas
   - Detalles de venta
   - Reportes

5. **Clientes**
   - Gestión de clientes
   - Soft delete

6. **Compras**
   - Registro de compras
   - Proveedores

7. **Notificaciones**
   - Alertas de stock bajo
   - Notificaciones en tiempo real

8. **Suscripciones**
   - 3 planes: BÁSICO, PREMIUM, EMPRESARIAL
   - Historial de pagos
   - Cambio de planes

---

## 🎯 Planes de Suscripción

| Plan            | Precio      | Características                                            |
| --------------- | ----------- | ---------------------------------------------------------- |
| **BÁSICO**      | Bs. 50/mes  | 100 productos, 1 usuario, reportes básicos                 |
| **PREMIUM**     | Bs. 150/mes | Ilimitado, usuarios ilimitados, reportes avanzados, API    |
| **EMPRESARIAL** | Bs. 300/mes | Todo Premium + múltiples sucursales, ERP, soporte dedicado |

---

## 🔧 Configuración de Firewall (Windows)

Para que otros dispositivos accedan al backend:

```cmd
# Ejecutar como Administrador
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000
```

O usar la GUI:

1. Windows Defender Firewall → Configuración avanzada
2. Reglas de entrada → Nueva regla
3. Puerto TCP 3000 → Permitir conexión

---

## 🐛 Solución de Problemas Comunes

### Backend no inicia

```bash
# Verifica que MySQL esté corriendo
# Verifica .env tiene configuración correcta
# Verifica que la base de datos existe
```

### Frontend no se conecta al backend

```bash
# Verifica que backend esté corriendo
# Verifica VITE_API_URL en .env
# Reinicia el servidor de Vite después de cambiar .env
```

### Mobile no se conecta

```bash
# Para emulador Android usa: http://10.0.2.2:3000/api
# Para dispositivo físico usa tu IP: http://192.168.0.X:3000/api
# Verifica que el firewall permita el puerto 3000
# Verifica que estén en la misma red WiFi
```

---

## 📚 Documentación Adicional

- [CONFIGURACION_MULTI_DEV.md](CONFIGURACION_MULTI_DEV.md) - Configuración para múltiples desarrolladores
- [GUIA_SUPERUSER.md](GUIA_SUPERUSER.md) - Guía del usuario SUPERUSER
- [MODULO_PRODUCTOS.md](MODULO_PRODUCTOS.md) - Módulo de productos
- [MODULO_VENTAS.md](MODULO_VENTAS.md) - Módulo de ventas
- [SISTEMA_SUSCRIPCIONES_3_PLANES.md](SISTEMA_SUSCRIPCIONES_3_PLANES.md) - Sistema de suscripciones
- [HISTORIAL_SUSCRIPCIONES.md](HISTORIAL_SUSCRIPCIONES.md) - Historial de pagos

---

## 🤝 Trabajo en Equipo

### Para Compartir con Otro Dev

1. **Subir código a Git**:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **El otro dev clona**:

   ```bash
   git clone <url-del-repo>
   ```

3. **Configurar su entorno**:
   - Copiar `.env.example` a `.env` en backend y frontend
   - Configurar con SU IP local
   - Crear SU propia base de datos
   - Ejecutar migraciones

4. **Leer**: [CONFIGURACION_MULTI_DEV.md](CONFIGURACION_MULTI_DEV.md)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servidor backend
2. Revisa la consola del navegador (F12 → Console)
3. Verifica las configuraciones de `.env`
4. Lee [CONFIGURACION_MULTI_DEV.md](CONFIGURACION_MULTI_DEV.md)

---

## 🎉 ¡Listo para Desarrollar!

Ahora puedes:

1. ✅ Desarrollar localmente
2. ✅ Compartir código con otros devs
3. ✅ Probar en dispositivos móviles
4. ✅ Trabajar en equipo sin conflictos de IP

**Nota**: Para este proyecto universitario, los archivos `.env` **SÍ se suben a Git** para facilitar la colaboración. Solo necesitas ajustar la IP local en `LOCAL_IP` si es diferente a la configurada.

---

## 🔒 Seguridad

- ⚠️ Este es un proyecto universitario, los `.env` se incluyen en Git para facilitar
- ⚠️ Cambiar `JWT_SECRET` en producción
- ⚠️ Cambiar contraseñas del SUPERUSER en producción
- ⚠️ Usar HTTPS en producción
- ⚠️ Configurar CORS apropiadamente en producción

---

## 📄 Licencia

Proyecto privado de desarrollo.
