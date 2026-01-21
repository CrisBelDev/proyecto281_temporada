# 📋 GUÍA COMPLETA DEL MÓDULO DE PRODUCTOS Y PORTAL PÚBLICO

## ✅ Funcionalidades Implementadas

### 1. **Gestión de Productos**

- ✓ Crear, editar y listar productos
- ✓ Filtrar por categorías
- ✓ Control de stock mínimo
- ✓ Activar/desactivar productos

### 2. **Portal Público de Productos**

- ✓ Accesible sin autenticación
- ✓ URL: `/portal/{empresa_slug}`
- ✓ Solo muestra productos con `stock > 0` y `activo = true`
- ✓ Productos con stock en 0 NO aparecen en el portal

### 3. **Sistema de Notificaciones Automáticas**

#### Tipos de Notificaciones:

- **STOCK_AGOTADO**: Cuando se crea un producto con `stock = 0`
- **STOCK_BAJO**: Cuando se crea un producto con `stock <= stock_minimo`

#### Funcionamiento:

Al crear un producto, el sistema automáticamente:

1. Verifica el stock actual vs stock mínimo
2. Genera una notificación si corresponde
3. La notificación queda registrada para que el administrador la revise

---

## 🧪 PRUEBA DEL MÓDULO - PASO A PASO

### **Requisitos Previos**

```bash
# Backend corriendo en http://localhost:3000
cd backend
node server.js

# Frontend corriendo en http://localhost:5173
cd frontend
npm run dev
```

### **Paso 1: Registrar Categoría "niños"**

1. Iniciar sesión en el sistema (usuario con permisos)
2. Ir a **Categorías**
3. Crear nueva categoría:
   - Nombre: `niños`
   - Descripción: `Productos para niños`
4. Guardar

### **Paso 2: Registrar Producto "autosis" con Stock**

1. Ir a **Productos**
2. Crear nuevo producto:
   - Código: `p1`
   - Nombre: `autosis`
   - Categoría: `niños`
   - Precio Venta: `28.00`
   - Stock Actual: `500`
   - Stock Mínimo: `5`
3. Guardar
4. **Resultado esperado**: Producto creado sin notificaciones (stock > mínimo)

### **Paso 3: Verificar en Portal Público**

1. Abrir navegador sin autenticación (o ventana incógnito)
2. Ir a: `http://localhost:5173/portal/emapa-2` (ajustar según slug de tu empresa)
3. **Resultado esperado**:
   - Ver el producto "autosis"
   - Precio: $28.00
   - Stock disponible

### **Paso 4: Crear Producto con Stock en Cero**

1. Ir a **Productos** (como usuario autenticado)
2. Crear nuevo producto:
   - Código: `p3`
   - Nombre: `producto_sin_stock`
   - Categoría: `niños`
   - Precio Venta: `15.00`
   - Stock Actual: `0`
   - Stock Mínimo: `5`
3. Guardar
4. **Resultado esperado**:
   - Producto creado exitosamente
   - Se genera notificación de tipo `STOCK_AGOTADO`

### **Paso 5: Verificar Notificación de Stock Agotado**

1. Ir a **Notificaciones** en el menú principal
2. **Resultado esperado**:
   ```
   🔴 Producto sin stock
   El producto "producto_sin_stock" se creó sin stock disponible
   y no será visible en el portal
   ```

### **Paso 6: Verificar que NO Aparece en Portal**

1. Recargar el portal público: `http://localhost:5173/portal/emapa-2`
2. **Resultado esperado**:
   - Ver solo el producto "autosis" (con stock)
   - El producto "producto_sin_stock" NO debe aparecer

### **Paso 7: Crear Producto con Stock Bajo**

1. Crear otro producto:
   - Código: `p4`
   - Nombre: `producto_stock_bajo`
   - Categoría: `niños`
   - Precio Venta: `20.00`
   - Stock Actual: `3` (menor que stock mínimo)
   - Stock Mínimo: `5`
2. Guardar
3. **Resultado esperado**:
   - Notificación de tipo `STOCK_BAJO`
   - El producto SÍ aparece en el portal (porque stock > 0)

---

## 🔍 Verificación Técnica

### Script de Verificación

```bash
cd backend
node verificar-modulo-productos-completo.js
```

Este script verifica:

- ✓ Categorías registradas
- ✓ Productos activos
- ✓ Productos con stock en 0
- ✓ Tipo de notificaciones disponibles
- ✓ Notificaciones generadas
- ✓ Productos visibles en portal
- ✓ Empresas con portal público

### Consultas SQL Manuales

```sql
-- Ver todos los productos
SELECT p.*, c.nombre as categoria
FROM productos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria;

-- Ver productos visibles en portal
SELECT * FROM productos
WHERE stock_actual > 0 AND activo = true;

-- Ver productos sin stock
SELECT * FROM productos WHERE stock_actual = 0;

-- Ver notificaciones de stock
SELECT * FROM notificaciones
WHERE tipo IN ('STOCK_BAJO', 'STOCK_AGOTADO')
ORDER BY fecha_creacion DESC;
```

---

## 📊 Rutas del Portal API

### Portal Público (sin autenticación)

```javascript
// Obtener productos públicos
GET /api/portal/:empresaSlug/productos
Query params:
  - categoria (opcional)
  - busqueda (opcional)
  - limite (opcional, default: 50)

// Obtener producto específico
GET /api/portal/:empresaSlug/productos/:id

// Obtener categorías públicas
GET /api/portal/:empresaSlug/categorias
```

### Ejemplo de Uso:

```bash
# Ver productos de emapa
curl http://localhost:3000/api/portal/emapa-2/productos

# Filtrar por categoría
curl http://localhost:3000/api/portal/emapa-2/productos?categoria=1

# Buscar producto
curl http://localhost:3000/api/portal/emapa-2/productos?busqueda=autosis
```

---

## 🎯 Reglas de Negocio

1. **Visibilidad en Portal**:
   - Producto con `stock_actual > 0` → ✅ Visible
   - Producto con `stock_actual = 0` → ❌ No visible
   - Producto con `activo = false` → ❌ No visible

2. **Notificaciones Automáticas**:
   - Al crear producto con `stock = 0` → Notificación `STOCK_AGOTADO`
   - Al crear producto con `stock <= stock_minimo` → Notificación `STOCK_BAJO`

3. **Acceso al Portal**:
   - No requiere autenticación
   - URL pública: `/portal/{empresa_slug}`
   - Cada empresa tiene su propio portal

---

## 🛠️ Archivos Modificados

1. **Backend**:
   - [producto.controller.js](backend/src/controllers/producto.controller.js) - Lógica de notificaciones
   - [portal.controller.js](backend/src/controllers/portal.controller.js) - Filtro de stock > 0
   - [Notificacion.js](backend/src/models/Notificacion.js) - Tipo STOCK_AGOTADO
   - [add_stock_agotado_tipo.sql](backend/migrations/add_stock_agotado_tipo.sql) - Migración DB

2. **Frontend**:
   - [PortalProductos.jsx](frontend/src/pages/PortalProductos.jsx) - Vista pública
   - [App.jsx](frontend/src/App.jsx) - Ruta pública `/portal/:empresaSlug`

3. **Scripts de Verificación**:
   - [verificar-modulo-productos-completo.js](backend/verificar-modulo-productos-completo.js)

---

## ✅ Checklist de Verificación

- [ ] Categoría "niños" creada
- [ ] Producto "autosis" con stock creado
- [ ] Producto "autosis" visible en portal
- [ ] Producto con stock = 0 creado
- [ ] Notificación STOCK_AGOTADO generada
- [ ] Producto con stock = 0 NO visible en portal
- [ ] Portal accesible sin login
- [ ] Script de verificación ejecutado exitosamente

---

## 📝 Notas Importantes

1. **Portal Público**: El portal está diseñado para ser accesible a cualquier usuario, incluso sin autenticación. Es ideal para mostrar catálogos de productos públicos.

2. **Actualización Automática**: Cuando se crea un producto nuevo, automáticamente aparece en el portal si cumple las condiciones (stock > 0 y activo).

3. **Multi-tenant**: Cada empresa tiene su propio portal independiente usando su slug único.

4. **Notificaciones**: Las notificaciones se crean automáticamente al registrar productos. Los usuarios con permisos pueden verlas en la sección de notificaciones del sistema.

---

## 🚀 Siguientes Pasos Recomendados

1. **Actualización de Stock**: Implementar notificaciones cuando el stock llegue a 0 por ventas
2. **Imágenes de Productos**: Agregar funcionalidad para subir imágenes
3. **Carrito de Compras**: Permitir agregar productos al carrito desde el portal
4. **WhatsApp**: Integrar botón de contacto por WhatsApp desde el portal

---

**Fecha de implementación**: 20 de enero de 2026  
**Estado**: ✅ Completado y verificado
