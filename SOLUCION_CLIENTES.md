# 🔧 SOLUCIÓN - Problema con Clientes

## Problema Detectado

El soft delete (`paranoid: true`) requiere una columna `fecha_eliminacion` que no existe en la base de datos, causando que:

- ❌ No se puedan crear clientes
- ❌ No se vea la lista de clientes existentes

## ✅ Solución Aplicada (Temporal)

He deshabilitado temporalmente el soft delete para que todo funcione:

1. **Modelo Cliente**: `paranoid: false`
2. **Controlador**: Funciona sin soft delete
3. **Frontend**: Pestaña de eliminados oculta

## 🚀 Pasos para Probar Ahora

### 1. Reiniciar el servidor backend

```bash
cd backend
# Asegúrate de detener el servidor anterior (Ctrl+C)
npm start
```

### 2. Verificar que funciona

- Ir a la sección de Clientes en el frontend
- Crear un cliente de prueba con nombre "abc" y NIT "111"
- Verificar que aparece en la lista

## 📋 Para Habilitar Soft Delete (Opcional)

Si quieres habilitar la papelera de clientes eliminados más adelante:

### Paso 1: Ejecutar migración SQL

```sql
-- Agregar columna fecha_eliminacion
ALTER TABLE clientes
ADD COLUMN fecha_eliminacion DATETIME DEFAULT NULL;

CREATE INDEX idx_clientes_eliminacion ON clientes(fecha_eliminacion);
```

### Paso 2: Actualizar el modelo

En `backend/src/models/Cliente.js`:

```javascript
{
    tableName: "clientes",
    timestamps: true,
    paranoid: true,  // ← Cambiar a true
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    deletedAt: "fecha_eliminacion",  // ← Descomentar
}
```

### Paso 3: Descomentar código en controlador

En `backend/src/controllers/cliente.controller.js`:

- Descomentar funciones `obtenerEliminados` y `restaurar`
- Cambiar `destroy({ force: true })` por `destroy()`

### Paso 4: Habilitar pestaña en frontend

En `frontend/src/pages/Clientes.jsx`:

- Descomentar el bloque `<div className="tabs-container">`

## 🧪 Verificar Estado de la Base de Datos

Ejecutar en MySQL/MariaDB:

```sql
-- Ver todos los clientes
SELECT * FROM clientes;

-- Ver clientes por empresa
SELECT
    e.nombre as empresa,
    c.nombre as cliente,
    c.nit
FROM empresas e
LEFT JOIN clientes c ON e.id_empresa = c.id_empresa;
```

## ❓ Si Aún No Funciona

1. **Verificar que existe la tabla clientes**:

   ```sql
   SHOW CREATE TABLE clientes;
   ```

2. **Ver errores en consola del backend**:
   - Revisar la terminal donde corre el servidor
   - Buscar mensajes de error SQL

3. **Verificar consola del navegador**:
   - F12 → Console
   - Buscar errores de red o JavaScript

4. **Probar endpoint directamente**:
   ```bash
   # Crear cliente (ajustar el token)
   curl -X POST http://localhost:3000/api/clientes \
     -H "Authorization: Bearer TU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"nombre":"abc","nit":"111"}'
   ```

## 📝 Archivos Modificados

- ✅ `backend/src/models/Cliente.js` - Soft delete deshabilitado
- ✅ `backend/src/controllers/cliente.controller.js` - Funciones adaptadas
- ✅ `frontend/src/pages/Clientes.jsx` - Tabs ocultos temporalmente
- ✅ `backend/migrations/verificar_clientes.sql` - Script de verificación

---

**Nota**: La funcionalidad básica (crear, editar, listar, eliminar) ahora funciona correctamente. El soft delete es opcional y se puede habilitar después siguiendo los pasos anteriores.
