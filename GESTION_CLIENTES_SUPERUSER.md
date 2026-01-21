# Gestión de Clientes Multi-Tenant con SUPERUSER

## 🎯 Descripción

El módulo de clientes ahora incluye soporte completo para SUPERUSER, permitiendo:

✅ **Empresas normales:** Solo ven sus propios clientes (privacidad mantenida)
✅ **SUPERUSER:** Puede ver y gestionar clientes de TODAS las empresas
✅ **Filtrado opcional:** SUPERUSER puede filtrar por empresa específica
✅ **Información de empresa:** Todos los clientes incluyen datos de su empresa

## 🔐 Comportamiento por Rol

### Usuarios Normales (ADMIN, VENDEDOR)

- Solo ven clientes de su propia empresa
- No pueden crear/editar/eliminar clientes de otras empresas
- Filtro automático por `id_empresa` del usuario

### SUPERUSER

- Ve clientes de TODAS las empresas por defecto
- Puede filtrar por empresa específica usando `empresa_id`
- Puede crear/editar/eliminar clientes de cualquier empresa
- Cada respuesta incluye información de la empresa del cliente

## 📡 Endpoints Disponibles

### 1. Listar Todos los Clientes

#### Usuario Normal

```javascript
GET http://localhost:3000/api/clientes
Authorization: Bearer <token_normal>

// Respuesta: Solo clientes de su empresa
{
  "success": true,
  "data": [
    {
      "id_cliente": 1,
      "nombre": "Juan Pérez",
      "nit": "123456",
      "telefono": "+591 12345678",
      "email": "juan@email.com",
      "direccion": "Av. Principal #123",
      "activo": true,
      "id_empresa": 2,
      "id_tenant": 2,
      "empresa": {
        "id_empresa": 2,
        "nombre": "Mi Empresa SRL",
        "nit": "987654321"
      }
    }
  ],
  "total": 1,
  "tenant_info": {
    "id_tenant": 2,
    "mensaje": "Clientes filtrados por empresa/tenant",
    "is_superuser": false
  }
}
```

#### SUPERUSER - Todos los Clientes

```javascript
GET http://localhost:3000/api/clientes
Authorization: Bearer <token_superuser>

// Respuesta: Clientes de TODAS las empresas
{
  "success": true,
  "data": [
    {
      "id_cliente": 1,
      "nombre": "Juan Pérez",
      "id_empresa": 2,
      "empresa": {
        "id_empresa": 2,
        "nombre": "Empresa A"
      }
    },
    {
      "id_cliente": 2,
      "nombre": "María López",
      "id_empresa": 3,
      "empresa": {
        "id_empresa": 3,
        "nombre": "Empresa B"
      }
    }
  ],
  "total": 2,
  "tenant_info": {
    "id_tenant": "TODOS",
    "mensaje": "SUPERUSER - Acceso a todos los clientes",
    "is_superuser": true
  }
}
```

#### SUPERUSER - Filtrar por Empresa

```javascript
GET http://localhost:3000/api/clientes?empresa_id=2
Authorization: Bearer <token_superuser>

// Respuesta: Solo clientes de la empresa con ID 2
{
  "success": true,
  "data": [
    {
      "id_cliente": 1,
      "nombre": "Juan Pérez",
      "id_empresa": 2,
      "empresa": {
        "id_empresa": 2,
        "nombre": "Empresa A"
      }
    }
  ],
  "total": 1,
  "tenant_info": {
    "id_tenant": 2,
    "mensaje": "SUPERUSER - Acceso a todos los clientes",
    "is_superuser": true
  }
}
```

### 2. Búsqueda de Clientes

#### Todos los Roles

```javascript
GET http://localhost:3000/api/clientes?busqueda=Juan
Authorization: Bearer <token>

// Usuario normal: Busca solo en sus clientes
// SUPERUSER: Busca en TODOS los clientes
// La búsqueda aplica a: nombre, NIT, email, teléfono
```

### 3. Obtener Cliente por ID

```javascript
GET http://localhost:3000/api/clientes/1
Authorization: Bearer <token>

// Usuario normal: Solo si el cliente pertenece a su empresa
// SUPERUSER: Cualquier cliente de cualquier empresa

// Respuesta incluye datos de la empresa
{
  "success": true,
  "data": {
    "id_cliente": 1,
    "nombre": "Juan Pérez",
    "nit": "123456",
    "id_empresa": 2,
    "empresa": {
      "id_empresa": 2,
      "nombre": "Empresa A",
      "nit": "987654321"
    }
  }
}
```

### 4. Crear Cliente

```javascript
POST http://localhost:3000/api/clientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Carlos Mendoza",
  "nit": "789012",
  "telefono": "+591 77777777",
  "email": "carlos@email.com",
  "direccion": "Calle Falsa #456"
}

// El cliente se crea en la empresa del usuario autenticado
// Validación: NIT único por empresa (pueden existir NITs duplicados en diferentes empresas)
```

### 5. Actualizar Cliente

```javascript
PUT http://localhost:3000/api/clientes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Pérez Actualizado",
  "telefono": "+591 99999999"
}

// Usuario normal: Solo puede actualizar clientes de su empresa
// SUPERUSER: Puede actualizar clientes de cualquier empresa
```

### 6. Activar/Desactivar Cliente

```javascript
PATCH http://localhost:3000/api/clientes/1/toggle
Authorization: Bearer <token>

// Cambia el estado activo del cliente
// Usuario normal: Solo clientes de su empresa
// SUPERUSER: Cualquier cliente
```

### 7. Eliminar Cliente

```javascript
DELETE http://localhost:3000/api/clientes/1
Authorization: Bearer <token>

// Actualmente: Hard delete (eliminación física)
// Usuario normal: Solo clientes de su empresa
// SUPERUSER: Cualquier cliente
```

## 🔒 Validaciones y Reglas

### 1. Validación de NIT

- El NIT debe ser único **por empresa**
- Diferentes empresas pueden tener clientes con el mismo NIT
- Ejemplo válido:
  - Empresa A: Cliente con NIT "123456"
  - Empresa B: Cliente con NIT "123456" ✅

### 2. Privacidad Multi-Tenant

- **Usuarios normales:** Completamente aislados por empresa
- **SUPERUSER:** Acceso global con visibilidad de todas las empresas

### 3. Información de Empresa

- Todas las respuestas incluyen datos de la empresa del cliente
- Útil para SUPERUSER para identificar a qué empresa pertenece cada cliente

## 📊 Casos de Uso

### Caso 1: Vendedor Consultando Clientes

```javascript
// Un vendedor de "Empresa A" hace login y consulta clientes
GET / api / clientes;
// Resultado: Solo ve clientes de "Empresa A"
```

### Caso 2: SUPERUSER Auditando Todas las Empresas

```javascript
// SUPERUSER quiere ver todos los clientes del sistema
GET / api / clientes;
// Resultado: Clientes de TODAS las empresas
```

### Caso 3: SUPERUSER Revisando Empresa Específica

```javascript
// SUPERUSER quiere auditar solo clientes de "Empresa B" (id=3)
GET /api/clientes?empresa_id=3
// Resultado: Solo clientes de la empresa con ID 3
```

### Caso 4: Búsqueda Global

```javascript
// SUPERUSER busca un cliente por nombre en todo el sistema
GET /api/clientes?busqueda=María
// Resultado: Todos los clientes llamados "María" de TODAS las empresas
```

## 🛠️ Implementación Técnica

### Detección de SUPERUSER

```javascript
const rolUsuario = req.usuario.rol?.nombre;
const isSuperUser = rolUsuario === "SUPERUSER";
```

### Construcción de Filtros

```javascript
// Usuario normal
let whereClause = { id_empresa: req.usuario.id_empresa };

// SUPERUSER
let whereClause = {};
if (empresa_id) {
	whereClause.id_empresa = empresa_id; // Filtro opcional
}
```

### Inclusión de Datos de Empresa

```javascript
include: [
	{
		model: Empresa,
		as: "empresa",
		attributes: ["id_empresa", "nombre", "nit"],
	},
];
```

## ✅ Archivos Modificados

1. **backend/src/controllers/cliente.controller.js**
   - Todas las funciones actualizadas con lógica de SUPERUSER
   - Filtrado condicional según rol
   - Inclusión de datos de empresa

2. **backend/src/models/Cliente.js**
   - Agregada asociación con Empresa

3. **backend/server.js**
   - Inicialización de asociaciones de modelos

## 🧪 Pruebas Recomendadas

### 1. Probar con Usuario Normal

```bash
# Login como usuario normal
POST /api/auth/login
Body: {"email": "usuario@empresa.com", "password": "..."}

# Listar clientes (debe ver solo los de su empresa)
GET /api/clientes
```

### 2. Probar con SUPERUSER

```bash
# Login como SUPERUSER
POST /api/auth/login
Body: {"email": "superadmin@sistema.com", "password": "SuperAdmin@2026"}

# Ver todos los clientes
GET /api/clientes

# Filtrar por empresa
GET /api/clientes?empresa_id=2

# Buscar globalmente
GET /api/clientes?busqueda=Juan
```

### 3. Verificar Privacidad

```bash
# Como usuario normal, intentar acceder a cliente de otra empresa
GET /api/clientes/999
# Debe retornar 404 si el cliente no es de su empresa
```

## 🎯 Próximos Pasos

1. ✅ Gestión de clientes implementada
2. ⏳ Aplicar mismo patrón a otros módulos:
   - Productos
   - Ventas
   - Compras
   - Reportes

## 📞 Soporte

Para consultas o problemas, revisar:

- [GUIA_SUPERUSER.md](GUIA_SUPERUSER.md) - Documentación general del SUPERUSER
- [GESTION_CLIENTES_MULTITENANT.md](GESTION_CLIENTES_MULTITENANT.md) - Documentación multi-tenant

---

**Sistema multi-tenant con SUPERUSER listo! 🎉**
