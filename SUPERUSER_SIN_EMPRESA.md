# 🎯 SUPERUSER - Gestión Multi-Empresa

## Descripción General

El **SUPERUSER** es un rol especial que NO está asociado a ninguna empresa específica, permitiéndole gestionar **TODAS las empresas** del sistema de forma dinámica.

## ✨ Características Principales

- ✅ **Sin empresa asignada** - `id_empresa = NULL` en la base de datos
- ✅ **Gestión multi-empresa** - Puede trabajar con cualquier empresa del sistema
- ✅ **Selección dinámica** - Especifica la empresa con la que quiere trabajar en cada petición
- ✅ **Vista global** - Puede ver datos de todas las empresas o filtrar por una específica

## 🔧 Cómo Funciona

### 1. Estructura del Usuario SUPERUSER

```sql
-- En la base de datos
SELECT * FROM usuarios WHERE email = 'superadmin@sistema.com';

id_usuario | nombre | email                    | id_empresa | id_rol
-----------|--------|--------------------------|------------|-------
1          | Super  | superadmin@sistema.com   | NULL       | 1
```

**Importante:** `id_empresa` es `NULL` para SUPERUSER.

### 2. Especificar la Empresa en las Peticiones

El SUPERUSER puede especificar con qué empresa quiere trabajar de **3 formas**:

#### Opción 1: Query Parameter (Recomendado)

```javascript
// Ver productos de la empresa 1
GET /api/productos?empresa_id=1

// Ver clientes de la empresa 2
GET /api/clientes?empresa_id=2

// Ver categorías de la empresa 3
GET /api/categorias?empresa_id=3
```

#### Opción 2: Header HTTP

```javascript
GET /api/productos
Headers:
  Authorization: Bearer <token>
  X-Empresa-Id: 1
```

#### Opción 3: Body (para POST/PUT)

```javascript
POST /api/productos
Headers:
  Authorization: Bearer <token>
Content-Type: application/json

{
  "empresa_id": 1,
  "codigo": "PROD001",
  "nombre": "Producto de prueba",
  "precio_venta": 100
}
```

### 3. Sin Especificar Empresa

Si el SUPERUSER **NO especifica** la empresa:

```javascript
// Ver productos de TODAS las empresas
GET /api/productos

Response:
{
  "success": true,
  "data": [...], // Productos de todas las empresas
  "emplazamiento_empresa": "todas"
}
```

## 📋 Ejemplos Prácticos

### Gestión de Productos

```javascript
// 1. Ver productos de todas las empresas
GET /api/productos

// 2. Ver productos solo de la empresa 1
GET /api/productos?empresa_id=1

// 3. Crear producto en la empresa 2
POST /api/productos?empresa_id=2
{
  "codigo": "PROD001",
  "nombre": "Laptop HP",
  "precio_venta": 5000
}

// 4. Actualizar producto (el sistema detecta la empresa del producto)
PUT /api/productos/123?empresa_id=2
{
  "precio_venta": 5500
}
```

### Gestión de Clientes

```javascript
// Ver clientes de la empresa 3
GET /api/clientes?empresa_id=3

// Crear cliente en la empresa 1
POST /api/clientes?empresa_id=1
{
  "nombre": "Juan Pérez",
  "nit": "1234567",
  "email": "juan@ejemplo.com"
}
```

### Gestión de Categorías

```javascript
// Ver categorías de la empresa 2
GET /api/categorias?empresa_id=2

// Crear categoría en la empresa 1
POST /api/categorias?empresa_id=1
{
  "nombre": "Electrónica"
}
```

### Gestión de Usuarios

```javascript
// Ver todos los usuarios de todas las empresas
GET /api/usuarios

// Ver usuarios solo de la empresa 1
GET /api/usuarios?empresa_id=1

// Crear un ADMIN en la empresa 2
POST /api/usuarios
{
  "empresa_id": 2,
  "nombre": "María",
  "apellido": "González",
  "email": "maria@empresa2.com",
  "password": "Password123!",
  "id_rol": 2  // ADMIN
}

// Crear otro SUPERUSER (sin empresa)
POST /api/usuarios
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "email": "carlos.super@sistema.com",
  "password": "SuperPass123!",
  "id_rol": 1  // SUPERUSER
}
```

## 🚀 Migración de SUPERUSER Existente

Si ya tienes un SUPERUSER asociado a una empresa, ejecuta:

### Opción 1: Script SQL

```bash
# Desde PostgreSQL
psql -U postgres -d nombre_base_datos -f migrations/update_superuser_sin_empresa.sql
```

### Opción 2: Script Node.js (Recomendado)

```bash
cd backend
node actualizar-superuser-sin-empresa.js
```

Este script:

- ✅ Muestra el estado actual
- ✅ Actualiza `id_empresa = NULL` para SUPERUSER
- ✅ Verifica la actualización
- ✅ Muestra ejemplos de uso

## 🔐 Comparación de Roles

| Aspecto                         | SUPERUSER                      | ADMIN                          | VENDEDOR                       |
| ------------------------------- | ------------------------------ | ------------------------------ | ------------------------------ |
| **Empresa asignada**            | ❌ NO (NULL)                   | ✅ SÍ                          | ✅ SÍ                          |
| **Gestionar varias empresas**   | ✅ Todas                       | ❌ Solo la suya                | ❌ Solo la suya                |
| **Crear empresas**              | ✅ Sí                          | ❌ No                          | ❌ No                          |
| **Crear SUPERUSERS**            | ✅ Sí                          | ❌ No                          | ❌ No                          |
| **Ver datos de otras empresas** | ✅ Sí                          | ❌ No                          | ❌ No                          |
| **Especificar empresa_id**      | ✅ Requerido para crear/editar | ❌ Usa la suya automáticamente | ❌ Usa la suya automáticamente |

## ⚠️ Consideraciones Importantes

### Para Operaciones de Creación

Al **crear** recursos (productos, clientes, etc.), el SUPERUSER **DEBE** especificar la empresa:

```javascript
// ❌ ERROR - Falta empresa_id
POST /api/productos
{
  "codigo": "PROD001",
  "nombre": "Laptop"
}

Response: 400 Bad Request
{
  "success": false,
  "mensaje": "Debe especificar la empresa (empresa_id)"
}

// ✅ CORRECTO
POST /api/productos?empresa_id=1
{
  "codigo": "PROD001",
  "nombre": "Laptop"
}
```

### Para Operaciones de Lectura

Al **leer** datos, el SUPERUSER puede:

- **Con empresa_id**: Ver solo de esa empresa
- **Sin empresa_id**: Ver de todas las empresas

```javascript
// Ver de todas
GET /api/productos

// Ver solo de la empresa 2
GET /api/productos?empresa_id=2
```

## 🛠️ Implementación Técnica

### Middleware `empresa.middleware.js`

Detecta automáticamente:

- Si es SUPERUSER
- Qué empresa especificó (si alguna)
- Construye el filtro `WHERE` apropiado

```javascript
// En los controladores, usar:
const {
	construirWhereMultitenant,
} = require("../middlewares/empresa.middleware");

// Ejemplo:
const whereClause = construirWhereMultitenant({}, req);
// Para SUPERUSER sin empresa_id: {} (sin filtro)
// Para SUPERUSER con empresa_id=1: { id_empresa: 1 }
// Para ADMIN/VENDEDOR: { id_empresa: <su_empresa> }
```

### En las Rutas

```javascript
const {
	obtenerEmpresaActiva,
	requerirEmpresa,
} = require("../middlewares/empresa.middleware");

// Aplicar a todas las rutas
router.use(verificarToken);
router.use(obtenerEmpresaActiva); // Detecta empresa_id

// Para operaciones que REQUIEREN empresa
router.post("/", requerirEmpresa, controller.crear);
```

## 📊 Flujo de Trabajo Típico

### 1. Login como SUPERUSER

```javascript
POST /api/auth/login
{
  "email": "superadmin@sistema.com",
  "password": "SuperAdmin@2026"
}

Response:
{
  "token": "eyJhbG...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Super",
    "email": "superadmin@sistema.com",
    "id_empresa": null,  // ⬅️ NULL para SUPERUSER
    "rol": {
      "nombre": "SUPERUSER"
    }
  }
}
```

### 2. Listar Todas las Empresas

```javascript
GET /api/empresas
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    { "id_empresa": 1, "nombre": "Empresa A" },
    { "id_empresa": 2, "nombre": "Empresa B" },
    { "id_empresa": 3, "nombre": "Empresa C" }
  ]
}
```

### 3. Trabajar con Empresa Específica

```javascript
// Ver productos de Empresa A
GET /api/productos?empresa_id=1

// Crear cliente en Empresa B
POST /api/clientes?empresa_id=2
{
  "nombre": "Cliente Nuevo",
  "nit": "123456"
}

// Ver ventas de Empresa C
GET /api/ventas?empresa_id=3
```

## 🔄 Migración Completa

### Paso a Paso

1. **Actualizar Modelo**
   - ✅ `Usuario.js` - `id_empresa` permite `NULL`

2. **Actualizar Migración**
   - ✅ `add_superuser_role.sql` - Crea SUPERUSER con `id_empresa = NULL`

3. **Actualizar Server**
   - ✅ `server.js` - Crea SUPERUSER sin empresa

4. **Crear Middleware**
   - ✅ `empresa.middleware.js` - Maneja empresa dinámica

5. **Actualizar Controladores**
   - ✅ Usar `req.empresaActiva` en lugar de `req.usuario.id_empresa`
   - ✅ Usar `construirWhereMultitenant()` para filtros

6. **Actualizar Rutas**
   - ✅ Agregar `obtenerEmpresaActiva` middleware
   - ✅ Usar `requerirEmpresa` donde sea necesario

7. **Migrar Datos Existentes**
   - ✅ Ejecutar `actualizar-superuser-sin-empresa.js`

## 📞 Preguntas Frecuentes

**Q: ¿El SUPERUSER puede hacer login?**
A: Sí, el login funciona normalmente. El token tendrá `id_empresa: null`.

**Q: ¿Qué pasa si no especifico empresa_id al crear algo?**
A: Recibirás un error 400 indicando que debes especificar la empresa.

**Q: ¿Puedo ver datos de todas las empresas a la vez?**
A: Sí, simplemente no especifiques `empresa_id` en las peticiones GET.

**Q: ¿Puedo crear usuarios en otras empresas?**
A: Sí, especifica el `empresa_id` en el body al crear el usuario.

**Q: ¿Necesito especificar empresa_id en el header Y en el body?**
A: No, solo en uno. El sistema prioriza: body > header > query.

---

**Sistema actualizado y listo para gestión multi-empresa dinámica! 🎉**
