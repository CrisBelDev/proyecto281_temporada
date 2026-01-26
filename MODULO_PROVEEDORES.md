# Módulo de Proveedores - Documentación Completa

## 📦 Resumen

Se ha implementado un módulo completo de gestión de proveedores con las siguientes funcionalidades:

### ✅ Funcionalidades Implementadas

#### 1. **Registro de Proveedores**

- Nombre del proveedor (requerido)
- NIT/Identificación fiscal
- Email y teléfono
- Dirección física
- Persona de contacto (nombre y teléfono)
- Datos de pago (banco, tipo de cuenta, número de cuenta)
- Observaciones adicionales
- Estado activo/inactivo

#### 2. **Gestión de Productos por Proveedor**

- Asignar productos que suministra cada proveedor
- Precio de compra habitual por producto
- Activar/desactivar productos del proveedor
- Visualización de productos asignados
- Evitar duplicados en asignaciones

#### 3. **Historial de Compras**

- Ver todas las compras realizadas a un proveedor
- Estadísticas:
  - Total de compras
  - Compras completadas
  - Monto total gastado
- Filtros por estado (Completada, Pendiente, Anulada)
- Detalles de cada compra (fecha, monto, descuentos, observaciones)

#### 4. **Datos de Pago**

- Información bancaria del proveedor
- Banco
- Tipo de cuenta (Ahorros/Corriente)
- Número de cuenta
- Almacenado en formato JSON para flexibilidad

## 🗄️ Estructura de Base de Datos

### Tabla: `proveedores`

```sql
- id_proveedor (SERIAL PRIMARY KEY)
- id_empresa (INTEGER, FK a empresas)
- nombre (VARCHAR 200, NOT NULL)
- nit (VARCHAR 50)
- email (VARCHAR 100)
- telefono (VARCHAR 20)
- direccion (VARCHAR 300)
- contacto_nombre (VARCHAR 200)
- contacto_telefono (VARCHAR 20)
- datos_pago (TEXT - JSON)
- observaciones (TEXT)
- activo (BOOLEAN, DEFAULT true)
- fecha_creacion (TIMESTAMP)
- fecha_actualizacion (TIMESTAMP)
```

### Tabla: `proveedores_productos`

```sql
- id_proveedor_producto (SERIAL PRIMARY KEY)
- id_proveedor (INTEGER, FK a proveedores)
- id_producto (INTEGER, FK a productos)
- precio_compra_habitual (DECIMAL 10,2)
- activo (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(id_proveedor, id_producto)
```

### Índices Creados

- `idx_proveedores_productos_proveedor` - Optimiza búsquedas por proveedor
- `idx_proveedores_productos_producto` - Optimiza búsquedas por producto
- `idx_proveedores_activo` - Optimiza filtros por estado de proveedor
- `idx_proveedores_productos_activo` - Optimiza filtros por estado de producto

## 🔧 Backend

### Archivos Creados/Modificados

#### Modelos

- `backend/src/models/Proveedor.js` - Modelo de proveedores
- `backend/src/models/ProveedorProducto.js` - Modelo de relación proveedor-producto

#### Controladores

- `backend/src/controllers/proveedor.controller.js`
  - `obtenerProveedores()` - GET con filtro por empresa
  - `obtenerProveedorPorId()` - GET proveedor específico
  - `crearProveedor()` - POST crear proveedor
  - `actualizarProveedor()` - PUT actualizar proveedor
  - `toggleProveedor()` - PATCH activar/desactivar
  - `agregarProducto()` - POST asignar producto
  - `toggleProducto()` - PATCH activar/desactivar producto
  - `obtenerHistorialCompras()` - GET compras del proveedor

#### Rutas

- `backend/src/routes/proveedores.routes.js`
  ```
  GET    /api/proveedores
  GET    /api/proveedores/:id
  GET    /api/proveedores/:id/compras
  POST   /api/proveedores
  PUT    /api/proveedores/:id
  PATCH  /api/proveedores/:id/toggle
  POST   /api/proveedores/:id/productos
  PATCH  /api/proveedores/:id/productos/:id_producto/toggle
  ```

#### Migraciones

- `backend/migrations/add_proveedores_productos.sql`
- `backend/ejecutar-migracion-proveedores.js` - Script de migración ejecutable

#### Configuración

- `backend/src/app.js` - Registro de rutas y modelos
- `backend/server.js` - Registro de modelo ProveedorProducto en asociaciones

## 🎨 Frontend

### Archivos Creados/Modificados

#### Páginas

- `frontend/src/pages/Proveedores.jsx`
  - Vista principal con grid de tarjetas
  - Filtro por empresa (SUPERUSER)
  - Búsqueda por nombre, NIT, email
  - Acciones: editar, activar/desactivar, productos, historial

- `frontend/src/pages/Proveedores.css`
  - Diseño moderno con gradientes morado/violeta
  - Grid responsivo
  - Tarjetas con hover effects
  - Estados visuales (activo/inactivo)

#### Componentes

##### ModalProveedor.jsx

- Formulario de creación/edición
- 4 secciones:
  1. Información General
  2. Persona de Contacto
  3. Datos de Pago
  4. Observaciones
- Validación de campos requeridos
- Soporte SUPERUSER para seleccionar empresa

##### ModalProductosProveedor.jsx

- Agregar productos al proveedor
- Listar productos asignados
- Activar/desactivar productos
- Precio de compra habitual
- Búsqueda de productos
- Validación de duplicados

##### ModalHistorialCompras.jsx

- Estadísticas en tarjetas
- Filtros por estado
- Lista de compras con detalles
- Formato de fechas localizado
- Badges de estado con colores

#### Servicios

- `frontend/src/services/index.js`
  - Exportación de `proveedoresService`
  - Métodos para todas las operaciones CRUD
  - Manejo de respuestas y errores

#### Rutas y Navegación

- `frontend/src/App.jsx` - Ruta `/admin/proveedores`
- `frontend/src/components/Layout.jsx` - Enlace en menú lateral

## 🎨 Diseño Visual

### Paleta de Colores

- Gradiente principal: `#667eea` → `#764ba2` (morado/violeta)
- Acciones positivas: Verde (`#4caf50`)
- Acciones negativas: Rojo (`#f44336`)
- Historial: Naranja (`#ff9800`)
- Productos: Azul (`#2196f3`)

### Características de UI

- Cards con elevación y hover effects
- Badges de estado con colores semánticos
- Inputs con focus states
- Botones con gradientes y sombras
- Diseño responsivo para móviles
- Iconos emoji para mejor UX

## 🔒 Seguridad y Permisos

### Roles y Acceso

- **SUPERUSER**:
  - Puede ver proveedores de todas las empresas
  - Requiere seleccionar empresa para ver datos
  - Puede crear/editar proveedores
- **ADMIN**:
  - Acceso completo a proveedores de su empresa
  - Crear, editar, activar/desactivar
  - Gestionar productos y ver historial

- **USUARIO**:
  - Solo lectura (puede implementarse)

### Middleware Aplicado

- `verificarToken` - Todas las rutas
- `verificarRol("ADMIN", "SUPERUSER")` - Operaciones de escritura

## 📊 Integración con Otros Módulos

### Relación con Compras

- El historial muestra compras existentes del modelo `Compra`
- Filtra por `id_proveedor`
- Calcula estadísticas automáticamente

### Relación con Productos

- ProveedorProducto vincula proveedores y productos
- Permite ver qué proveedor suministra cada producto
- Precio de compra habitual para referencias

### Multitenant

- Todos los proveedores están aislados por empresa (`id_empresa`)
- SUPERUSER puede gestionar proveedores de múltiples empresas
- Filtros automáticos según rol del usuario

## 🚀 Cómo Usar

### 1. Crear un Proveedor

1. Ir a "Proveedores" en el menú
2. Click en "+ Nuevo Proveedor"
3. Completar formulario (mínimo nombre)
4. Guardar

### 2. Asignar Productos

1. En la tarjeta del proveedor, click "📦 Productos"
2. Seleccionar producto del dropdown
3. Opcional: ingresar precio de compra habitual
4. Click "Agregar Producto"

### 3. Ver Historial

1. En la tarjeta del proveedor, click "📊 Historial"
2. Ver estadísticas generales
3. Filtrar por estado si es necesario
4. Revisar detalles de cada compra

### 4. Activar/Desactivar

- Click en 🔴 (desactivar) o 🟢 (activar)
- Confirmación antes de cambiar estado
- Los proveedores inactivos quedan visualmente diferenciados

## 📝 Notas Técnicas

### Formato de datos_pago

```json
{
	"banco": "Banco X",
	"tipo_cuenta": "AHORROS",
	"cuenta": "1234567890"
}
```

### Optimizaciones

- Índices en columnas frecuentemente consultadas
- Relaciones con CASCADE DELETE para integridad
- UNIQUE constraint en proveedores_productos
- Carga lazy de productos con `include` de Sequelize

### Consideraciones Futuras

- Agregar reportes de compras por proveedor
- Gráficos de gastos por proveedor
- Alertas de precios (si cambian mucho)
- Calificación de proveedores
- Documentos adjuntos (contratos, facturas)

## ✅ Estado de Implementación

- ✅ Base de datos migrada
- ✅ Modelos creados y asociados
- ✅ Controladores completos
- ✅ Rutas registradas
- ✅ Frontend implementado
- ✅ Servicios API creados
- ✅ Navegación configurada
- ✅ Estilos aplicados
- ✅ Validaciones básicas
- ✅ Integración con multitenant
- ✅ Soporte SUPERUSER

## 🐛 Testing Sugerido

1. Crear proveedor desde ADMIN
2. Crear proveedor desde SUPERUSER (con empresa seleccionada)
3. Asignar múltiples productos a un proveedor
4. Intentar asignar producto duplicado (debe fallar)
5. Desactivar/activar proveedor
6. Desactivar/activar productos del proveedor
7. Ver historial con compras existentes
8. Filtrar proveedores por búsqueda
9. Editar datos de proveedor
10. Verificar aislamiento multitenant

---

**Implementado el**: 25 de enero de 2026  
**Versión**: 1.0.0  
**Módulos relacionados**: Compras, Productos, Empresas
