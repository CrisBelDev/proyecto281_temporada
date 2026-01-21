# 🚀 INICIO RÁPIDO - MÓDULO DE PRODUCTOS

## ✅ Verificación Rápida

Ejecuta el script de verificación desde el directorio `backend`:

```bash
cd backend
node verificar-modulo-productos.js
```

## 📦 Instalación y Configuración

### 1. Base de Datos

Ejecuta la migración para agregar el campo `slug` a la tabla empresas:

```bash
# Desde el directorio backend
mysql -u root -p proyecto281 < migrations/add_slug_empresas.sql
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

El servidor estará corriendo en: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará corriendo en: `http://localhost:5173`

## 🎯 Funcionalidades Principales

### 1. Categorías

- **URL**: `/categorias`
- **Acceso**: Todos los usuarios autenticados
- **Funciones**:
  - ✅ Ver categorías con contador de productos
  - ✅ Crear/editar categorías (Solo ADMIN)
  - ✅ Eliminar categorías sin productos (Solo ADMIN)

### 2. Productos

- **URL**: `/productos`
- **Acceso**: Todos los usuarios autenticados
- **Funciones**:
  - ✅ Ver productos con categoría asignada
  - ✅ Filtrar por categoría
  - ✅ Crear/editar productos (Solo ADMIN)
  - ✅ Activar/desactivar productos (Solo ADMIN)
  - ✅ Alerta visual de stock bajo

### 3. Notificaciones

- **URL**: `/notificaciones`
- **Acceso**: Todos los usuarios autenticados
- **Funciones**:
  - ✅ Ver notificaciones con badge contador
  - ✅ Filtrar: todas / no leídas
  - ✅ Marcar como leídas
  - ✅ Eliminar notificaciones
  - ✅ Limpiar notificaciones antiguas
  - ✅ Actualización automática cada 30s

### 4. Portal Público

- **URL**: `/portal/:empresaSlug`
- **Acceso**: Público (sin autenticación)
- **Funciones**:
  - ✅ Ver catálogo de productos
  - ✅ Filtrar por categoría
  - ✅ Buscar productos
  - ✅ Ver detalles de productos
  - ✅ Diseño atractivo para clientes

## 🔧 Configuración del Portal Público

### Paso 1: Obtener el slug de tu empresa

```sql
-- Conectarse a MySQL
mysql -u root -p proyecto281

-- Ver empresas y sus slugs
SELECT id_empresa, nombre, slug FROM empresas;

-- Si el slug es NULL, actualizarlo manualmente
UPDATE empresas
SET slug = 'mi-empresa'
WHERE id_empresa = 1;
```

### Paso 2: Acceder al portal

```
http://localhost:5173/portal/mi-empresa
```

## 📡 Endpoints API

### Categorías

```
GET    /api/categorias                  - Lista de categorías
GET    /api/categorias/con-productos    - Con contador de productos
POST   /api/categorias                  - Crear categoría
PUT    /api/categorias/:id              - Actualizar categoría
DELETE /api/categorias/:id              - Eliminar categoría
```

### Notificaciones

```
GET    /api/notificaciones                      - Lista de notificaciones
GET    /api/notificaciones?solo_no_leidas=true  - Solo no leídas
PATCH  /api/notificaciones/:id/leida            - Marcar como leída
PATCH  /api/notificaciones/todas/leidas         - Marcar todas
DELETE /api/notificaciones/:id                  - Eliminar
DELETE /api/notificaciones?dias=30              - Limpiar antiguas
```

### Portal (Público - Sin autenticación)

```
GET /api/portal/:slug/productos          - Productos públicos
GET /api/portal/:slug/productos/:id      - Detalle de producto
GET /api/portal/:slug/categorias         - Categorías públicas
```

## 🧪 Pruebas Rápidas

### Crear una categoría

1. Iniciar sesión como ADMIN
2. Ir a "Categorías"
3. Click en "+ Nueva Categoría"
4. Nombre: "Electrónicos", Descripción: "Productos electrónicos"
5. Guardar

### Crear un producto

1. Ir a "Productos"
2. Click en "+ Nuevo Producto"
3. Llenar datos:
   - Código: "ELEC001"
   - Nombre: "Laptop HP"
   - Categoría: "Electrónicos"
   - Precio venta: 5000
   - Stock: 10
4. Guardar

### Ver notificaciones

1. Ir a "Notificaciones"
2. Debería aparecer el badge con contador
3. Las notificaciones se actualizan automáticamente

### Probar el portal

1. Configurar slug de empresa (ver arriba)
2. Abrir en nueva pestaña: `http://localhost:5173/portal/[tu-slug]`
3. Buscar productos
4. Filtrar por categoría
5. Click en producto para ver detalle

## 🎨 Personalización

### Cambiar colores del portal

Editar: `frontend/src/styles/PortalProductos.css`

```css
.portal-header {
	background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### Cambiar logo o nombre

El nombre de la empresa se muestra automáticamente desde la base de datos.

### Agregar más campos a productos

1. Actualizar modelo: `backend/src/models/Producto.js`
2. Crear migración SQL
3. Actualizar controlador
4. Actualizar formulario en frontend

## ⚠️ Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

### Error: "Empresa no encontrada" en portal

```sql
-- Verificar que existe el slug
SELECT * FROM empresas WHERE slug = 'tu-slug';

-- Actualizar slug
UPDATE empresas SET slug = 'nuevo-slug' WHERE id_empresa = 1;
```

### Notificaciones no aparecen

```javascript
// Verificar en consola del navegador
// Revisar que el token es válido
localStorage.getItem("token");
```

### Categorías no se cargan en productos

- Verificar que existen categorías creadas
- Revisar console del navegador (F12)
- Verificar que el backend responde en `/api/categorias`

## 📚 Documentación Completa

Ver archivo: [MODULO_PRODUCTOS.md](./MODULO_PRODUCTOS.md)

## 🆘 Soporte

Si encuentras problemas:

1. Ejecutar `node verificar-modulo-productos.js`
2. Revisar logs del backend
3. Revisar console del navegador (F12)
4. Verificar que la base de datos está actualizada

## 🎉 ¡Listo!

El módulo de productos está completamente implementado y listo para usar.

**Características principales:**

- ✅ Gestión completa de categorías
- ✅ Productos con categorización
- ✅ Sistema de notificaciones inteligente
- ✅ Portal público atractivo
- ✅ Todo multitenant
- ✅ Control de acceso por roles
- ✅ Diseño responsive

¡Disfruta tu nuevo módulo! 🚀
