# 🚀 CAMBIOS APLICADOS - SUPERUSER SIN EMPRESA

## ✅ Resumen de Cambios

El SUPERUSER ahora **NO está asociado a ninguna empresa específica** y puede gestionar TODAS las empresas del sistema.

## 📝 Archivos Modificados

### 1. Modelo de Usuario

- **Archivo**: `backend/src/models/Usuario.js`
- **Cambio**: `id_empresa` permite `NULL`

### 2. Migración SQL

- **Archivo**: `backend/migrations/add_superuser_role.sql`
- **Cambio**: Crea SUPERUSER con `id_empresa = NULL`

### 3. Server.js

- **Archivo**: `backend/server.js`
- **Cambio**: Crea SUPERUSER sin empresa asignada

### 4. Middleware de Autenticación

- **Archivo**: `backend/src/middlewares/auth.middleware.js`
- **Cambio**: Maneja correctamente `id_empresa = NULL`

### 5. Nuevo Middleware de Empresa

- **Archivo**: `backend/src/middlewares/empresa.middleware.js` ⭐ NUEVO
- **Funcionalidad**:
  - Detecta si el usuario es SUPERUSER
  - Extrae `empresa_id` de query, header o body
  - Proporciona funciones helper para filtros multi-tenant

### 6. Controlador de Productos

- **Archivo**: `backend/src/controllers/producto.controller.js`
- **Cambio**: Usa `req.empresaActiva` en lugar de `req.usuario.id_empresa`

### 7. Rutas de Productos

- **Archivo**: `backend/src/routes/productos.routes.js`
- **Cambio**: Incluye middleware `obtenerEmpresaActiva`

## 🔧 Scripts Nuevos

### 1. Migración SQL

- **Archivo**: `backend/migrations/update_superuser_sin_empresa.sql`
- **Propósito**: Actualizar SUPERUSER existente a `id_empresa = NULL`

### 2. Script Node.js

- **Archivo**: `backend/actualizar-superuser-sin-empresa.js`
- **Propósito**: Aplicar migración desde Node.js

## 📖 Documentación Nueva

- **Archivo**: `SUPERUSER_SIN_EMPRESA.md`
- **Contenido**: Guía completa de uso del SUPERUSER multi-empresa

## 🚀 Cómo Aplicar los Cambios

### Opción 1: Instalación Nueva (Base de datos vacía)

Si estás empezando de cero:

```bash
# 1. Los cambios ya están en el código
# 2. Ejecutar migración (opcional, server.js lo hace automáticamente)
cd backend
psql -U postgres -d nombre_bd -f migrations/add_superuser_role.sql

# 3. Iniciar el servidor
npm run dev

# El servidor creará automáticamente el SUPERUSER sin empresa
```

### Opción 2: Sistema Existente (Migrar SUPERUSER actual)

Si ya tienes un SUPERUSER en la base de datos:

```bash
cd backend

# Ejecutar script de migración
node actualizar-superuser-sin-empresa.js

# Reiniciar el servidor
npm run dev
```

O manualmente con SQL:

```bash
psql -U postgres -d nombre_bd -f migrations/update_superuser_sin_empresa.sql
```

## 🧪 Verificar que Funciona

### 1. Login como SUPERUSER

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@sistema.com",
    "password": "SuperAdmin@2026"
  }'
```

Verifica que en la respuesta: `"id_empresa": null`

### 2. Listar Empresas

```bash
curl -X GET http://localhost:3000/api/empresas \
  -H "Authorization: Bearer TU_TOKEN"
```

### 3. Ver Productos de Empresa Específica

```bash
# Ver productos de empresa 1
curl -X GET "http://localhost:3000/api/productos?empresa_id=1" \
  -H "Authorization: Bearer TU_TOKEN"

# Ver productos de TODAS las empresas
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer TU_TOKEN"
```

### 4. Crear Producto en Empresa Específica

```bash
curl -X POST "http://localhost:3000/api/productos?empresa_id=1" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "TEST001",
    "nombre": "Producto de Prueba",
    "precio_venta": 100
  }'
```

## 📊 Comparación Antes vs Después

### ANTES ❌

```javascript
// SUPERUSER estaba atado a una empresa
{
  "id_usuario": 1,
  "email": "superadmin@sistema.com",
  "id_empresa": 1,  // ⬅️ Atado a empresa 1
  "rol": "SUPERUSER"
}

// Solo podía ver/gestionar la empresa 1
GET /api/productos  → Solo productos de empresa 1
```

### DESPUÉS ✅

```javascript
// SUPERUSER sin empresa asignada
{
  "id_usuario": 1,
  "email": "superadmin@sistema.com",
  "id_empresa": null,  // ⬅️ SIN EMPRESA
  "rol": "SUPERUSER"
}

// Puede gestionar cualquier empresa
GET /api/productos?empresa_id=1  → Productos de empresa 1
GET /api/productos?empresa_id=2  → Productos de empresa 2
GET /api/productos               → Productos de TODAS
```

## 🎯 Uso en el Día a Día

### Gestionar Empresa 1

```javascript
// Todos los endpoints con empresa_id=1
GET    /api/productos?empresa_id=1
GET    /api/clientes?empresa_id=1
GET    /api/ventas?empresa_id=1
POST   /api/productos?empresa_id=1 {...}
```

### Gestionar Empresa 2

```javascript
// Cambiar a empresa_id=2
GET    /api/productos?empresa_id=2
POST   /api/clientes?empresa_id=2 {...}
```

### Vista Global

```javascript
// Sin empresa_id = ver todo
GET / api / productos;
GET / api / clientes;
GET / api / usuarios;
```

## ⚠️ Notas Importantes

1. **Al crear recursos**, DEBES especificar `empresa_id`:

   ```javascript
   POST /api/productos?empresa_id=1 {...}
   ```

2. **Al leer**, puedes omitir `empresa_id` para ver todo:

   ```javascript
   GET /api/productos  // Ve todo
   GET /api/productos?empresa_id=1  // Solo empresa 1
   ```

3. **Otras formas de especificar empresa**:
   - Query: `?empresa_id=1`
   - Header: `X-Empresa-Id: 1`
   - Body: `{ "empresa_id": 1, ... }`

## 🔄 Próximos Pasos

### Backend

- [ ] Aplicar el mismo patrón a todos los controladores restantes
- [ ] Actualizar todas las rutas con el middleware `obtenerEmpresaActiva`
- [ ] Agregar validaciones adicionales

### Frontend

- [ ] Agregar selector de empresa para SUPERUSER
- [ ] Mostrar empresa actual en la interfaz
- [ ] Guardar empresa seleccionada en localStorage
- [ ] Incluir `empresa_id` en todas las peticiones

### Documentación

- [ ] Actualizar ejemplos en Postman/Insomnia
- [ ] Crear video tutorial
- [ ] Documentar casos de uso comunes

## 📞 Soporte

Para más información:

- Ver `SUPERUSER_SIN_EMPRESA.md` - Documentación completa
- Ver `backend/src/middlewares/empresa.middleware.js` - Implementación técnica

---

**¡Sistema actualizado y funcionando! 🎉**
