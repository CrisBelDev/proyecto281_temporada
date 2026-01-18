# Backend SaaS - Sistema de Inventarios y Ventas Multitenant

Sistema backend completo desarrollado en Node.js con Express para gestión de inventarios y ventas para microempresas, implementando arquitectura multitenant basada en `id_empresa`.

## 🚀 Características

- ✅ Arquitectura multitenant (una base de datos, múltiples empresas)
- ✅ Autenticación con JWT
- ✅ Hash de contraseñas con bcrypt
- ✅ ORM Sequelize para MySQL/PostgreSQL
- ✅ Control de roles (ADMIN, VENDEDOR)
- ✅ Gestión de productos con stock mínimo
- ✅ Ventas con descuento automático de stock
- ✅ Compras con incremento automático de stock
- ✅ Sistema de notificaciones
- ✅ Reportes y dashboard
- ✅ API REST completa

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior) o PostgreSQL
- npm o yarn

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Editar el archivo `.env` con tus credenciales:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saas_inventario
DB_USER=root
DB_PASSWORD=tu_password

# Configuración JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

# Puerto del servidor
PORT=3000
```

### 4. Crear base de datos

Ejecutar en MySQL:

```sql
CREATE DATABASE saas_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El servidor se ejecutará en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Sequelize
│   │   └── jwt.js                # Configuración JWT
│   │
│   ├── models/                   # Modelos de Sequelize
│   │   ├── Empresa.js
│   │   ├── Rol.js
│   │   ├── Usuario.js
│   │   ├── Categoria.js
│   │   ├── Producto.js
│   │   ├── Cliente.js
│   │   ├── Proveedor.js
│   │   ├── Venta.js
│   │   ├── DetalleVenta.js
│   │   ├── Compra.js
│   │   ├── DetalleCompra.js
│   │   └── Notificacion.js
│   │
│   ├── controllers/              # Controladores
│   │   ├── auth.controller.js
│   │   ├── usuario.controller.js
│   │   ├── producto.controller.js
│   │   ├── venta.controller.js
│   │   ├── compra.controller.js
│   │   └── reporte.controller.js
│   │
│   ├── routes/                   # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── productos.routes.js
│   │   ├── ventas.routes.js
│   │   ├── compras.routes.js
│   │   └── reportes.routes.js
│   │
│   ├── middlewares/              # Middlewares
│   │   ├── auth.middleware.js
│   │   └── roles.middleware.js
│   │
│   └── app.js                    # Configuración de Express
│
├── server.js                     # Punto de entrada
├── .env                          # Variables de entorno
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint                      | Descripción               | Autenticación |
| ------ | ----------------------------- | ------------------------- | ------------- |
| POST   | `/api/auth/registrar-empresa` | Registrar empresa y admin | No            |
| POST   | `/api/auth/login`             | Iniciar sesión            | No            |
| GET    | `/api/auth/verificar`         | Verificar token           | Sí            |

### Usuarios

| Método | Endpoint                         | Descripción            | Rol   |
| ------ | -------------------------------- | ---------------------- | ----- |
| GET    | `/api/usuarios`                  | Obtener usuarios       | Todos |
| GET    | `/api/usuarios/:id`              | Obtener usuario por ID | Todos |
| POST   | `/api/usuarios`                  | Crear usuario          | ADMIN |
| PUT    | `/api/usuarios/:id`              | Actualizar usuario     | ADMIN |
| PATCH  | `/api/usuarios/:id/toggle`       | Activar/desactivar     | ADMIN |
| PUT    | `/api/usuarios/cambiar-password` | Cambiar contraseña     | Todos |

### Productos

| Método | Endpoint                    | Descripción             | Rol   |
| ------ | --------------------------- | ----------------------- | ----- |
| GET    | `/api/productos`            | Obtener productos       | Todos |
| GET    | `/api/productos/stock-bajo` | Productos stock bajo    | Todos |
| GET    | `/api/productos/:id`        | Obtener producto por ID | Todos |
| POST   | `/api/productos`            | Crear producto          | ADMIN |
| PUT    | `/api/productos/:id`        | Actualizar producto     | ADMIN |
| PATCH  | `/api/productos/:id/toggle` | Activar/desactivar      | ADMIN |

### Ventas

| Método | Endpoint                 | Descripción          | Rol             |
| ------ | ------------------------ | -------------------- | --------------- |
| GET    | `/api/ventas`            | Obtener ventas       | Todos           |
| GET    | `/api/ventas/:id`        | Obtener venta por ID | Todos           |
| POST   | `/api/ventas`            | Crear venta          | ADMIN, VENDEDOR |
| PATCH  | `/api/ventas/:id/anular` | Anular venta         | ADMIN           |

### Compras

| Método | Endpoint                  | Descripción           | Rol   |
| ------ | ------------------------- | --------------------- | ----- |
| GET    | `/api/compras`            | Obtener compras       | Todos |
| GET    | `/api/compras/:id`        | Obtener compra por ID | Todos |
| POST   | `/api/compras`            | Crear compra          | ADMIN |
| PATCH  | `/api/compras/:id/anular` | Anular compra         | ADMIN |

### Reportes

| Método | Endpoint                               | Descripción           |
| ------ | -------------------------------------- | --------------------- |
| GET    | `/api/reportes/dashboard`              | Dashboard general     |
| GET    | `/api/reportes/ventas`                 | Reporte de ventas     |
| GET    | `/api/reportes/productos-mas-vendidos` | Top productos         |
| GET    | `/api/reportes/inventario`             | Reporte de inventario |

## 📝 Ejemplos de Uso

### 1. Registrar empresa

```bash
POST http://localhost:3000/api/auth/registrar-empresa
Content-Type: application/json

{
  "nombre_empresa": "Mi Tienda",
  "nit": "123456789",
  "email_empresa": "contacto@mitienda.com",
  "nombre_admin": "Juan",
  "apellido_admin": "Pérez",
  "email_admin": "admin@mitienda.com",
  "password_admin": "Password123"
}
```

### 2. Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mitienda.com",
  "password": "Password123"
}
```

Respuesta:

```json
{
	"success": true,
	"mensaje": "Login exitoso",
	"data": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"usuario": {
			"id_usuario": 1,
			"nombre": "Juan",
			"email": "admin@mitienda.com",
			"rol": "ADMIN",
			"empresa": {
				"id_empresa": 1,
				"nombre": "Mi Tienda"
			}
		}
	}
}
```

### 3. Crear producto (con token)

```bash
POST http://localhost:3000/api/productos
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "codigo": "PROD001",
  "nombre": "Laptop HP",
  "precio_compra": 5000,
  "precio_venta": 6500,
  "stock_actual": 10,
  "stock_minimo": 3,
  "id_categoria": 1
}
```

### 4. Crear venta

```bash
POST http://localhost:3000/api/ventas
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "id_cliente": 1,
  "metodo_pago": "EFECTIVO",
  "descuento": 50,
  "productos": [
    {
      "id_producto": 1,
      "cantidad": 2
    }
  ]
}
```

## 🔒 Seguridad

- Todas las contraseñas se hashean con bcrypt (10 rounds)
- Autenticación basada en JWT
- Middleware de verificación de token en rutas protegidas
- Control de acceso por roles (RBAC)
- Filtrado multitenant automático por `id_empresa`

## 🏗️ Arquitectura Multitenant

El sistema implementa multitenant a nivel de aplicación:

- Cada empresa tiene un `id_empresa` único
- **TODAS** las consultas filtran automáticamente por `id_empresa`
- El `id_empresa` se extrae del JWT del usuario autenticado
- Los usuarios solo pueden ver/modificar datos de su empresa

## 📊 Base de Datos

El sistema crea automáticamente las siguientes tablas:

- empresas
- roles
- usuarios
- categorias
- productos
- clientes
- proveedores
- ventas
- detalle_ventas
- compras
- detalle_compras
- notificaciones

## 🔄 Flujos Principales

### Flujo de Venta

1. Validar stock disponible
2. Crear venta con detalles
3. Descontar stock automáticamente
4. Crear notificación
5. Retornar venta completa

### Flujo de Compra

1. Validar productos
2. Crear compra con detalles
3. Incrementar stock automáticamente
4. Actualizar precio de compra
5. Crear notificación
6. Retornar compra completa

## 🧪 Pruebas

Se recomienda usar herramientas como:

- Postman
- Insomnia
- Thunder Client (VSCode)

## 📦 Dependencias Principales

```json
{
	"express": "^4.18.2",
	"sequelize": "^6.35.1",
	"mysql2": "^3.6.5",
	"jsonwebtoken": "^9.0.2",
	"bcrypt": "^5.1.1",
	"dotenv": "^16.3.1",
	"cors": "^2.8.5"
}
```

## 🚀 Despliegue

### Variables de entorno en producción

Asegúrate de configurar:

- `JWT_SECRET`: Clave segura única
- `DB_*`: Credenciales de base de datos de producción
- `PORT`: Puerto configurado en el hosting

### Recomendaciones

- Usar `{ alter: false }` en producción (desactivar sync)
- Implementar migraciones con Sequelize CLI
- Configurar CORS para dominios específicos
- Usar HTTPS
- Implementar rate limiting
- Logs con Winston o Morgan

## 📄 Licencia

MIT

## 👨‍💻 Soporte

Para dudas o problemas, revisar la documentación de:

- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [JWT](https://jwt.io/)

---

**Desarrollado con Node.js + Express + Sequelize + MySQL**
