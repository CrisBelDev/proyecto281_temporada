# ROL SUPERUSER - Sistema de Gestión

## Descripción

El rol **SUPERUSER** es el nivel más alto de acceso en el sistema. Este rol tiene permisos completos para administrar todas las empresas, usuarios y recursos del sistema.

## Características y Permisos

### 🔐 Acceso Total

- El SUPERUSER tiene acceso a TODAS las funcionalidades del sistema
- Puede realizar cualquier operación que los otros roles pueden hacer
- Bypasea las restricciones de roles en el middleware de autenticación

### 🏢 Gestión de Empresas

El SUPERUSER puede:

- ✅ Ver todas las empresas registradas en el sistema
- ✅ Crear nuevas empresas
- ✅ Editar información de cualquier empresa
- ✅ Activar/desactivar empresas
- ✅ Ver estadísticas detalladas de cada empresa
- ✅ Eliminar empresas (desactivación suave)

**Endpoints disponibles:**

```
GET    /api/empresas              - Listar todas las empresas
GET    /api/empresas/:id          - Obtener empresa específica
GET    /api/empresas/:id/estadisticas - Estadísticas de la empresa
POST   /api/empresas              - Crear nueva empresa
PUT    /api/empresas/:id          - Actualizar empresa
PATCH  /api/empresas/:id/toggle   - Activar/desactivar empresa
DELETE /api/empresas/:id          - Eliminar empresa
```

### 👥 Gestión de Usuarios

El SUPERUSER puede:

- ✅ Ver usuarios de TODAS las empresas
- ✅ Filtrar usuarios por empresa específica usando query param `?empresa_id=X`
- ✅ Crear usuarios en cualquier empresa
- ✅ Crear otros usuarios SUPERUSER
- ✅ Editar usuarios de cualquier empresa
- ✅ Activar/desactivar usuarios de cualquier empresa
- ✅ Eliminar usuarios de cualquier empresa
- ✅ Asignar el rol SUPERUSER a otros usuarios

**Endpoints de usuarios:**

```
GET    /api/usuarios              - Ver usuarios (todos si SUPERUSER)
GET    /api/usuarios?empresa_id=X - Filtrar por empresa (solo SUPERUSER)
GET    /api/usuarios/:id          - Ver usuario específico (cualquier empresa)
POST   /api/usuarios              - Crear usuario (en cualquier empresa)
PUT    /api/usuarios/:id          - Actualizar usuario (de cualquier empresa)
PATCH  /api/usuarios/:id/toggle   - Activar/desactivar usuario
DELETE /api/usuarios/:id          - Eliminar usuario
```

### 📊 Otros Recursos

El SUPERUSER tiene acceso completo a:

- Productos de todas las empresas
- Ventas de todas las empresas
- Compras de todas las empresas
- Clientes de todas las empresas
- Reportes de todas las empresas

## Diferencias con el Rol ADMIN

| Característica                        | ADMIN           | SUPERUSER          |
| ------------------------------------- | --------------- | ------------------ |
| Gestión de usuarios de su empresa     | ✅              | ✅                 |
| Gestión de usuarios de otras empresas | ❌              | ✅                 |
| Ver/editar empresas                   | ❌              | ✅                 |
| Crear empresas                        | ❌              | ✅                 |
| Crear otros SUPERUSER                 | ❌              | ✅                 |
| Acceso multi-tenant                   | Solo su empresa | Todas las empresas |
| Desactivar empresas                   | ❌              | ✅                 |

## Configuración Inicial

### Crear el Primer SUPERUSER

1. **Ejecutar la migración:**

   ```bash
   # En PostgreSQL
   psql -U tu_usuario -d tu_base_de_datos -f migrations/add_superuser_role.sql
   ```

2. **Credenciales por defecto:**
   - Email: `superadmin@sistema.com`
   - Password: `SuperAdmin@2026`

3. **⚠️ IMPORTANTE: Cambiar contraseña**
   - Después del primer login, cambiar inmediatamente la contraseña
   - Usar un password fuerte y seguro

### Crear Usuarios SUPERUSER Adicionales

Desde la API (requiere autenticación como SUPERUSER):

```javascript
POST /api/usuarios
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.superuser@sistema.com",
  "password": "PasswordSeguro123!",
  "telefono": "+591 12345678",
  "id_rol": <ID del rol SUPERUSER>,
  "empresa_id": <ID de la empresa>
}
```

## Ejemplos de Uso

### 1. Listar Todas las Empresas

```javascript
GET /api/empresas
Headers: {
  "Authorization": "Bearer <token_superuser>"
}

Response:
{
  "success": true,
  "data": [
    {
      "id_empresa": 1,
      "nombre": "Empresa A",
      "estadisticas": {
        "totalUsuarios": 5,
        "totalProductos": 100,
        "totalClientes": 50,
        "totalVentas": 200
      }
    },
    ...
  ]
}
```

### 2. Ver Usuarios de una Empresa Específica

```javascript
GET /api/usuarios?empresa_id=2
Headers: {
  "Authorization": "Bearer <token_superuser>"
}
```

### 3. Crear Usuario en Cualquier Empresa

```javascript
POST /api/usuarios
Headers: {
  "Authorization": "Bearer <token_superuser>"
}
Body: {
  "nombre": "María",
  "apellido": "González",
  "email": "maria@empresa2.com",
  "password": "Password123!",
  "id_rol": 2,
  "empresa_id": 2  // Especificar la empresa destino
}
```

### 4. Crear Nueva Empresa

```javascript
POST /api/empresas
Headers: {
  "Authorization": "Bearer <token_superuser>"
}
Body: {
  "nombre": "Nueva Empresa SRL",
  "nit": "123456789",
  "email": "contacto@nuevaempresa.com",
  "telefono": "+591 12345678",
  "direccion": "Av. Principal #123"
}
```

### 5. Ver Estadísticas de una Empresa

```javascript
GET /api/empresas/5/estadisticas
Headers: {
  "Authorization": "Bearer <token_superuser>"
}

Response:
{
  "success": true,
  "data": {
    "empresa": {
      "id_empresa": 5,
      "nombre": "Empresa XYZ",
      "activo": true
    },
    "estadisticas": {
      "usuarios": {
        "total": 10,
        "activos": 8,
        "inactivos": 2
      },
      "totalProductos": 150,
      "totalClientes": 75,
      "totalVentas": 300
    }
  }
}
```

## Seguridad

### ✅ Buenas Prácticas

1. **Limitar el número de SUPERUSERS**
   - Solo crear lo estrictamente necesario
   - Idealmente 1-2 usuarios con este rol

2. **Contraseñas Fuertes**
   - Usar contraseñas complejas y únicas
   - Cambiar regularmente

3. **Auditoría**
   - Monitorear las acciones de SUPERUSER
   - Registrar cambios críticos en empresas

4. **Acceso Físico**
   - Proteger las credenciales de SUPERUSER
   - No compartir las credenciales

### ⚠️ Consideraciones

- Un SUPERUSER puede modificar o eliminar cualquier dato
- Un SUPERUSER puede crear otros SUPERUSERS
- Un SUPERUSER puede desactivar empresas completas
- No existe restricción multi-tenant para SUPERUSER

## Implementación Técnica

### Middleware de Roles

El middleware verifica automáticamente si el usuario es SUPERUSER:

```javascript
// middlewares/roles.middleware.js
if (nombre_rol === "SUPERUSER") {
	return next(); // Bypass de restricciones
}
```

### Controladores

Los controladores verifican el rol para aplicar lógica condicional:

```javascript
const { nombre_rol } = req.usuario;

if (nombre_rol === "SUPERUSER") {
	// Lógica para SUPERUSER (sin restricciones multi-tenant)
} else {
	// Lógica normal (con restricciones de empresa)
}
```

## Troubleshooting

### Error: "No tiene permisos para realizar esta acción"

- Verificar que el token JWT sea válido
- Confirmar que el rol sea SUPERUSER en la base de datos

### No puedo crear otros SUPERUSERS

- Solo un SUPERUSER puede crear otros SUPERUSERS
- Verificar el `id_rol` en la petición

### No veo empresas/usuarios de otras empresas

- Confirmar que estás autenticado como SUPERUSER
- Revisar el token JWT y el rol incluido

## Scripts Útiles

### Verificar SUPERUSERS en la BD

```sql
SELECT
  u.id_usuario,
  u.nombre,
  u.apellido,
  u.email,
  r.nombre as rol,
  e.nombre as empresa,
  u.activo
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE r.nombre = 'SUPERUSER';
```

### Cambiar rol de usuario a SUPERUSER

```sql
UPDATE usuarios
SET id_rol = (SELECT id_rol FROM roles WHERE nombre = 'SUPERUSER')
WHERE email = 'usuario@email.com';
```

---

**Última actualización:** 19 de enero de 2026
**Versión del sistema:** 1.0.0
