# Guía Rápida: Implementación del Rol SUPERUSER

## 🎯 Resumen de Cambios

Se ha implementado exitosamente el rol **SUPERUSER** con las siguientes capacidades:

✅ **NO está asociado a ninguna empresa específica** (id_empresa = NULL)
✅ **Gestión completa de TODAS las empresas del sistema**
✅ **Gestión de usuarios de todas las empresas**
✅ **Selección dinámica de empresa** mediante query params, headers o body
✅ **Puede crear otros SUPERUSERS**

## ⚠️ IMPORTANTE - CAMBIO FUNDAMENTAL

El SUPERUSER ahora funciona de manera diferente:

- **NO tiene empresa asignada** en la base de datos (`id_empresa = NULL`)
- **Debe especificar la empresa** con la que quiere trabajar en cada operación
- **Puede ver datos de todas las empresas** cuando no especifica empresa_id

Para más detalles, consulta: [SUPERUSER_SIN_EMPRESA.md](SUPERUSER_SIN_EMPRESA.md)

## 📝 Pasos para Activar el Sistema

### 1. Ejecutar la Migración de Base de Datos

```bash
# Navegar al directorio de backend
cd proyecto281_temporada/backend

# Ejecutar la migración SQL
# Opción A: Desde PostgreSQL CLI
psql -U postgres -d nombre_base_datos -f migrations/add_superuser_role.sql

# Opción B: Desde tu cliente de BD favorito (pgAdmin, DBeaver, etc.)
# Copiar y ejecutar el contenido de migrations/add_superuser_role.sql
```

### 2. Reiniciar el Servidor Backend

```bash
# Detener el servidor si está corriendo (Ctrl+C)

# Iniciar el servidor
node server.js
# o si usas nodemon:
npm run dev
```

El servidor automáticamente:

- ✅ Creará el rol SUPERUSER si no existe
- ✅ Creará los roles ADMIN y VENDEDOR

### 3. Primer Login como SUPERUSER

**Credenciales por defecto:**

```
Email: superadmin@sistema.com
Password: SuperAdmin@2026
```

**Endpoint de login:**

```javascript
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@sistema.com",
  "password": "SuperAdmin@2026"
}

Response:
{
  "success": true,
  "mensaje": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Super",
      "apellido": "Usuario",
      "email": "superadmin@sistema.com",
      "rol": {
        "nombre": "SUPERUSER"
      }
    }
  }
}
```

### 4. Cambiar Contraseña (RECOMENDADO)

```javascript
PUT http://localhost:3000/api/usuarios/cambiar-password
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "password_actual": "12345678",
  "password_nuevo": "TuNuevaPasswordSegura123!"
}
```

## 🚀 Ejemplos de Uso

### Gestión de Empresas

#### Listar Todas las Empresas

```javascript
GET http://localhost:3000/api/empresas
Authorization: Bearer <token_superuser>
```

#### Crear Nueva Empresa

```javascript
POST http://localhost:3000/api/empresas
Authorization: Bearer <token_superuser>
Content-Type: application/json

{
  "nombre": "Mi Nueva Empresa SRL",
  "nit": "987654321",
  "email": "contacto@minuevaempresa.com",
  "telefono": "+591 12345678",
  "direccion": "Av. Principal #123"
}
```

#### Ver Estadísticas de una Empresa

```javascript
GET http://localhost:3000/api/empresas/1/estadisticas
Authorization: Bearer <token_superuser>
```

#### Activar/Desactivar Empresa

```javascript
PATCH http://localhost:3000/api/empresas/1/toggle
Authorization: Bearer <token_superuser>
```

### Gestión de Usuarios

#### Ver Todos los Usuarios (de todas las empresas)

```javascript
GET http://localhost:3000/api/usuarios
Authorization: Bearer <token_superuser>
```

#### Ver Usuarios de una Empresa Específica

```javascript
GET http://localhost:3000/api/usuarios?empresa_id=2
Authorization: Bearer <token_superuser>
```

#### Crear Usuario en Cualquier Empresa

```javascript
POST http://localhost:3000/api/usuarios
Authorization: Bearer <token_superuser>
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@empresa.com",
  "password": "Password123!",
  "telefono": "+591 12345678",
  "id_rol": 2,  // ID del rol (1=SUPERUSER, 2=ADMIN, 3=VENDEDOR)
  "empresa_id": 2  // ID de la empresa destino
}
```

#### Crear Otro SUPERUSER

```javascript
POST http://localhost:3000/api/usuarios
Authorization: Bearer <token_superuser>
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "email": "maria.super@sistema.com",
  "password": "SuperPassword123!",
  "id_rol": 1,  // Rol SUPERUSER
  "empresa_id": 1
}
```

## 📊 Archivos Modificados/Creados

### Archivos Modificados:

1. ✅ `backend/server.js` - Agregado rol SUPERUSER a inicialización
2. ✅ `backend/src/middlewares/roles.middleware.js` - Bypass para SUPERUSER
3. ✅ `backend/src/controllers/usuario.controller.js` - Lógica multi-empresa para SUPERUSER
4. ✅ `backend/src/routes/usuarios.routes.js` - Permisos SUPERUSER en rutas
5. ✅ `backend/src/app.js` - Registro de rutas de empresas

### Archivos Nuevos:

1. ✅ `backend/src/controllers/empresa.controller.js` - Controlador de empresas
2. ✅ `backend/src/routes/empresas.routes.js` - Rutas de empresas
3. ✅ `backend/migrations/add_superuser_role.sql` - Migración para crear SUPERUSER
4. ✅ `backend/SUPERUSER_DOCUMENTATION.md` - Documentación completa

## 🔍 Verificación del Sistema

### 1. Verificar Roles en la BD

```sql
SELECT * FROM roles;
-- Debe mostrar: SUPERUSER, ADMIN, VENDEDOR
```

### 2. Verificar Usuario SUPERUSER

```sql
SELECT u.*, r.nombre as rol, e.nombre as empresa
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE r.nombre = 'SUPERUSER';
```

### 3. Probar Endpoints

```bash
# Desde terminal o Postman/Insomnia

# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@sistema.com","password":"SuperAdmin@2026"}'

# 2. Listar empresas (usar el token del login)
curl -X GET http://localhost:3000/api/empresas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🎨 Próximos Pasos (Frontend)

Para implementar la interfaz de gestión de empresas en el frontend:

1. **Crear componente de gestión de empresas** (`Empresas.jsx`)
2. **Agregar servicio de API** para empresas
3. **Actualizar navegación** para mostrar opción de empresas solo a SUPERUSER
4. **Crear formularios** para crear/editar empresas
5. **Mostrar estadísticas** de empresas

Ejemplo de verificación en frontend:

```javascript
// AuthContext.jsx o componente protegido
const isSuperUser = user?.rol?.nombre === "SUPERUSER";

{
	isSuperUser && <Link to="/empresas">Gestión de Empresas</Link>;
}
```

## 🔐 Roles Disponibles

| ID  | Nombre    | Descripción   | Capacidades                                  |
| --- | --------- | ------------- | -------------------------------------------- |
| 1   | SUPERUSER | Super Usuario | Acceso total, gestión de empresas y usuarios |
| 2   | ADMIN     | Administrador | Gestión de su empresa                        |
| 3   | VENDEDOR  | Vendedor      | Operaciones de venta                         |

## ❓ Troubleshooting

### Error: "Empresa no válida" al crear usuario

- Verificar que `empresa_id` existe en la tabla `empresas`
- Usar `GET /api/empresas` para obtener IDs válidos

### No veo la opción de empresas

- Confirmar que el usuario tiene rol SUPERUSER
- Verificar el token JWT

### Error 403: "No tiene permisos"

- Verificar que estás usando el token correcto
- Confirmar que el rol sea SUPERUSER en la BD

## 📞 Soporte

Para más información, consultar:

- `SUPERUSER_DOCUMENTATION.md` - Documentación completa
- Archivos de rutas en `src/routes/`
- Controladores en `src/controllers/`

---

**Sistema listo para usar! 🎉**
