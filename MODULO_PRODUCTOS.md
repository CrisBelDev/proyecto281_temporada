# 📦 MÓDULO DE PRODUCTOS - GUÍA COMPLETA

## 🎯 Descripción General

El módulo de productos es una solución completa para la gestión de inventario con soporte para:

- ✅ Gestión de categorías
- ✅ Gestión de productos con categorización
- ✅ Sistema de notificaciones inteligente
- ✅ Portal público de productos

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### 1. 📑 GESTIÓN DE CATEGORÍAS

#### Backend

**Controlador:** `backend/src/controllers/categoria.controller.js`
**Rutas:** `backend/src/routes/categorias.routes.js`

#### Endpoints API:

```
GET    /api/categorias              - Obtener todas las categorías
GET    /api/categorias/con-productos - Obtener categorías con conteo de productos
GET    /api/categorias/:id          - Obtener categoría por ID
POST   /api/categorias              - Crear categoría (Solo ADMIN)
PUT    /api/categorias/:id          - Actualizar categoría (Solo ADMIN)
DELETE /api/categorias/:id          - Eliminar categoría (Solo ADMIN)
```

#### Características:

- ✅ Multitenant (cada empresa tiene sus propias categorías)
- ✅ Validación de nombres únicos por empresa
- ✅ Protección contra eliminación si tiene productos asociados
- ✅ Conteo automático de productos por categoría
- ✅ Control de acceso por roles

#### Frontend

**Página:** `frontend/src/pages/Categorias.jsx`
**Estilos:** `frontend/src/styles/Categorias.css`

#### Características UI:

- ✅ Vista en tarjetas (grid responsive)
- ✅ Modal para crear/editar categorías
- ✅ Contador de productos por categoría
- ✅ Confirmación antes de eliminar
- ✅ Estado vacío con llamada a acción

---

### 2. 📦 GESTIÓN DE PRODUCTOS

#### Backend

**Controlador:** `backend/src/controllers/producto.controller.js`
**Rutas:** `backend/src/routes/productos.routes.js`

#### Endpoints API:

```
GET    /api/productos              - Obtener todos los productos
GET    /api/productos/stock-bajo   - Productos con stock bajo
GET    /api/productos/:id          - Obtener producto por ID
POST   /api/productos              - Crear producto (Solo ADMIN)
PUT    /api/productos/:id          - Actualizar producto (Solo ADMIN)
PATCH  /api/productos/:id/toggle   - Activar/desactivar (Solo ADMIN)
```

#### Características:

- ✅ Relación con categorías
- ✅ Validación de código único por empresa
- ✅ Detección automática de stock bajo
- ✅ Soft delete (activar/desactivar)
- ✅ Soporte para imágenes
- ✅ Control de stock (actual y mínimo)

#### Frontend

**Página:** `frontend/src/pages/Productos.jsx`
**Estilos:** `frontend/src/styles/Productos.css`

#### Mejoras Implementadas:

- ✅ Selector de categorías en formulario
- ✅ Filtro por categoría en la tabla
- ✅ Indicador visual de stock bajo
- ✅ Muestra categoría de cada producto
- ✅ Diseño responsive

---

### 3. 🔔 SISTEMA DE NOTIFICACIONES

#### Backend

**Controlador:** `backend/src/controllers/notificacion.controller.js`
**Rutas:** `backend/src/routes/notificaciones.routes.js`
**Modelo:** `backend/src/models/Notificacion.js`

#### Endpoints API:

```
GET    /api/notificaciones                     - Obtener notificaciones
GET    /api/notificaciones?solo_no_leidas=true - Solo no leídas
POST   /api/notificaciones                     - Crear notificación (Solo ADMIN)
PATCH  /api/notificaciones/:id/leida           - Marcar como leída
PATCH  /api/notificaciones/todas/leidas        - Marcar todas como leídas
DELETE /api/notificaciones/:id                 - Eliminar notificación
DELETE /api/notificaciones?dias=30             - Limpiar antiguas
```

#### Tipos de Notificaciones:

- 🟡 **STOCK_BAJO**: Productos con stock bajo
- 🟢 **VENTA**: Registro de ventas
- 🔵 **COMPRA**: Registro de compras
- 🟣 **SISTEMA**: Notificaciones del sistema

#### Características:

- ✅ Estados: leída/no leída
- ✅ Filtros por usuario y empresa
- ✅ Asignación a usuarios específicos o general
- ✅ Limpieza automática de notificaciones antiguas
- ✅ Control de acceso (usuarios ven solo las suyas)

#### Frontend

**Página:** `frontend/src/pages/Notificaciones.jsx`
**Estilos:** `frontend/src/styles/Notificaciones.css`

#### Características UI:

- ✅ Badge con contador de no leídas
- ✅ Actualización automática cada 30 segundos
- ✅ Filtro: todas/no leídas
- ✅ Iconos por tipo de notificación
- ✅ Timestamps relativos ("Hace 5 min")
- ✅ Código de colores por tipo
- ✅ Marcar individualmente o todas
- ✅ Limpieza de antiguas

---

### 4. 🌐 PORTAL PÚBLICO DE PRODUCTOS

#### Backend

**Controlador:** `backend/src/controllers/portal.controller.js`
**Rutas:** `backend/src/routes/portal.routes.js`

#### Endpoints API (Sin autenticación):

```
GET /api/portal/:empresa_slug/productos        - Productos públicos
GET /api/portal/:empresa_slug/productos/:id    - Detalle de producto
GET /api/portal/:empresa_slug/categorias       - Categorías públicas
```

#### Parámetros de búsqueda:

- `categoria`: Filtrar por ID de categoría
- `busqueda`: Buscar por nombre o código
- `limite`: Limitar resultados (default: 50)

#### Características:

- ✅ Acceso público (sin autenticación)
- ✅ Solo muestra productos activos con stock
- ✅ Búsqueda por empresa usando slug
- ✅ Filtrado por categoría
- ✅ Búsqueda de texto
- ✅ Información limitada (no muestra precio de compra)

#### Frontend

**Página:** `frontend/src/pages/PortalProductos.jsx`
**Estilos:** `frontend/src/styles/PortalProductos.css`

#### Características UI:

- ✅ Header con gradiente y nombre de empresa
- ✅ Buscador de productos
- ✅ Filtros de categoría con contador
- ✅ Grid responsive de productos
- ✅ Tarjetas de producto con imagen
- ✅ Modal de detalle de producto
- ✅ Información de stock
- ✅ Footer personalizado
- ✅ Placeholder para productos sin imagen
- ✅ Diseño moderno y atractivo

#### URL de Acceso:

```
http://localhost:5173/portal/[slug-empresa]
```

---

## 🗄️ BASE DE DATOS

### Tablas Involucradas:

#### `categorias`

```sql
- id_categoria (PK)
- id_empresa (FK)
- nombre
- descripcion
- fecha_creacion
- fecha_actualizacion
```

#### `productos`

```sql
- id_producto (PK)
- id_empresa (FK)
- id_categoria (FK)
- codigo (UNIQUE por empresa)
- nombre
- descripcion
- precio_compra
- precio_venta
- stock_actual
- stock_minimo
- imagen
- activo
- fecha_creacion
- fecha_actualizacion
```

#### `notificaciones`

```sql
- id_notificacion (PK)
- id_empresa (FK)
- id_usuario (FK, nullable)
- tipo (ENUM)
- titulo
- mensaje
- leida (BOOLEAN)
- fecha_creacion
```

#### `empresas` (Actualizada)

```sql
- slug (VARCHAR(100) UNIQUE) <- NUEVO CAMPO
```

### Migración Requerida:

```bash
# Ejecutar migración para agregar slug a empresas
mysql -u root -p proyecto281 < backend/migrations/add_slug_empresas.sql
```

---

## 🔧 CONFIGURACIÓN

### Backend

1. Las nuevas rutas ya están registradas en `backend/src/app.js`:

```javascript
app.use("/api/categorias", categoriasRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/portal", portalRoutes);
```

2. Las relaciones están configuradas en `setupAssociations()`:

```javascript
Producto.belongsTo(Categoria, { foreignKey: "id_categoria", as: "categoria" });
Categoria.hasMany(Producto, { foreignKey: "id_categoria", as: "productos" });
Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });
```

### Frontend

1. Nuevas rutas en `App.jsx`:

```javascript
// Rutas privadas
<Route path="categorias" element={<Categorias />} />
<Route path="notificaciones" element={<Notificaciones />} />

// Ruta pública
<Route path="/portal/:empresaSlug" element={<PortalProductos />} />
```

2. Nuevos servicios en `services/index.js`:

```javascript
export const categoriasService = { ... }
export const notificacionesService = { ... }
```

3. Menú actualizado en `Layout.jsx`:

```javascript
<NavLink to="/categorias">📑 Categorías</NavLink>
<NavLink to="/notificaciones">🔔 Notificaciones</NavLink>
```

---

## 🚀 USO

### Gestión de Categorías

1. Ir a "Categorías" en el menú lateral
2. Click en "+ Nueva Categoría"
3. Llenar nombre y descripción (opcional)
4. Las categorías se pueden editar o eliminar
5. No se puede eliminar si tiene productos asociados

### Gestión de Productos

1. Ir a "Productos" en el menú lateral
2. Click en "+ Nuevo Producto"
3. Llenar formulario (código, nombre, categoría, precios, stock)
4. Usar filtro de categorías para buscar productos
5. Los productos con stock bajo se destacan en rojo

### Notificaciones

1. Ir a "Notificaciones" en el menú lateral
2. Ver badge con contador de no leídas
3. Filtrar por "Todas" o "No leídas"
4. Click en ✓ para marcar como leída
5. Click en 🗑️ para eliminar
6. "Marcar todas como leídas" para limpiar
7. "Limpiar antiguas" elimina las leídas de más de 30 días

### Portal Público

1. Obtener el slug de la empresa (ej: "mi-empresa-1")
2. Acceder a: `http://localhost:5173/portal/mi-empresa-1`
3. Buscar productos por nombre o código
4. Filtrar por categoría
5. Click en producto para ver detalle
6. No requiere autenticación

---

## 🔒 SEGURIDAD

### Autenticación y Autorización:

- ✅ Todas las rutas privadas requieren token JWT
- ✅ Creación/edición/eliminación solo para ADMIN
- ✅ Multitenant: cada empresa ve solo sus datos
- ✅ Notificaciones: usuarios ven solo las suyas (excepto admin)
- ✅ Portal público: sin autenticación pero datos limitados

### Validaciones:

- ✅ Nombres de categoría únicos por empresa
- ✅ Códigos de producto únicos por empresa
- ✅ No se pueden eliminar categorías con productos
- ✅ Verificación de empresa activa en portal público

---

## 📊 CASOS DE USO

### Escenario 1: Stock Bajo

1. Sistema detecta producto con stock <= stock_minimo
2. Crea notificación automática tipo STOCK_BAJO
3. Usuario ve notificación con badge rojo
4. Puede marcar como leída o realizar compra

### Escenario 2: Catálogo Público

1. Empresa configura slug en su perfil
2. Comparte URL del portal
3. Clientes navegan productos sin registrarse
4. Filtran por categoría y buscan productos
5. Ven detalles, precios y disponibilidad

### Escenario 3: Organización de Inventario

1. Admin crea categorías (Electrónica, Ropa, etc.)
2. Asigna productos a categorías
3. Filtra productos por categoría
4. Ve conteo de productos por categoría
5. Organiza mejor el inventario

---

## 🎨 DISEÑO

### Paleta de Colores:

- **Categorías**: Azul (#3498db)
- **Notificaciones**:
  - Stock Bajo: Amarillo (#ffc107)
  - Venta: Verde (#28a745)
  - Compra: Azul (#17a2b8)
  - Sistema: Morado (#6f42c1)
- **Portal**: Gradiente violeta (#667eea - #764ba2)

### Responsive:

- ✅ Desktop: Grid de 3-4 columnas
- ✅ Tablet: Grid de 2 columnas
- ✅ Mobile: 1 columna
- ✅ Menú colapsable en móvil

---

## 📝 NOTAS TÉCNICAS

### Relaciones Sequelize:

```javascript
// Producto -> Categoría (Many-to-One)
Producto.belongsTo(Categoria, { foreignKey: "id_categoria", as: "categoria" });

// Categoría -> Productos (One-to-Many)
Categoria.hasMany(Producto, { foreignKey: "id_categoria", as: "productos" });

// Notificación -> Usuario (Many-to-One)
Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });
```

### Consultas Optimizadas:

- Eager loading con `include` para evitar N+1
- Índices en columnas de búsqueda
- Agregaciones con `COUNT` para contadores
- Filtros a nivel de base de datos

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Controlador de categorías
- [x] Rutas de categorías
- [x] Controlador de notificaciones
- [x] Rutas de notificaciones
- [x] Controlador del portal
- [x] Rutas del portal
- [x] Página de Categorías (frontend)
- [x] Página de Notificaciones (frontend)
- [x] Página de Portal Productos (frontend)
- [x] Actualización de Productos con categorías
- [x] Servicios API (frontend)
- [x] Actualización de rutas en App.jsx
- [x] Actualización de menú en Layout.jsx
- [x] Migración SQL para slug
- [x] Modelo Empresa con slug
- [x] Estilos CSS para todas las páginas

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecutar migración** para agregar slug a empresas existentes
2. **Configurar slugs** para cada empresa
3. **Probar portal público** con diferentes empresas
4. **Crear productos de prueba** con categorías
5. **Verificar notificaciones** de stock bajo
6. **Personalizar diseño** del portal según marca

---

## 🐛 TROUBLESHOOTING

### Error: "Empresa no encontrada" en portal

- Verificar que el slug existe en la BD
- Verificar que la empresa está activa
- Ejecutar migración add_slug_empresas.sql

### Categorías no aparecen en productos

- Verificar que existen categorías para la empresa
- Revisar console del navegador
- Verificar token de autenticación

### Notificaciones no se actualizan

- El componente actualiza cada 30 segundos
- Refrescar página manualmente
- Verificar que el backend está corriendo

---

**Desarrollado para:** SaaS Inventario Multitenant  
**Fecha:** Enero 2026  
**Versión:** 1.0.0
