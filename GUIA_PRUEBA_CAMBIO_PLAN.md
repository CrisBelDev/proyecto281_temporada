# Guía de Prueba - Cambio de Plan de Suscripción

## ⚠️ IMPORTANTE: El SUPERUSER no puede cambiar planes

El usuario SUPERUSER (`superadmin@sistema.com`) **NO tiene empresa asociada**, por lo que no puede cambiar de plan.

## ✅ Para probar el cambio de plan necesitas:

### Opción 1: Crear un usuario regular con empresa

1. **Login como SUPERUSER**
   - Email: `superadmin@sistema.com`
   - Password: `12345678`

2. **Ir a Empresas** y crear una empresa

3. **Ir a Usuarios** y crear un usuario ADMIN o VENDEDOR asociado a esa empresa

4. **Cerrar sesión** y hacer login con el nuevo usuario

5. **Ir a "Mi Empresa"** y allí podrás cambiar el plan

### Opción 2: Usar el flujo de registro normal

1. **Ir a http://localhost:5173/registro**

2. **Completar el formulario** para crear una nueva empresa y usuario

3. **Verificar email** (revisar consola del backend para el link)

4. **Hacer login** con el usuario recién creado

5. **Ir a "Mi Empresa"** desde el menú lateral

6. **Cambiar de plan** en la sección "Gestión de Suscripción"

## 🔧 Cambios Realizados

He actualizado el archivo `MiEmpresa.jsx` para que use correctamente la instancia `api` configurada. Esto soluciona el problema de las URLs incorrectas.

**Cambios aplicados:**

- ✅ Import de `api` en lugar de `axios` directamente
- ✅ Todas las llamadas ahora usan `api.get()`, `api.post()`, `api.put()`
- ✅ Se eliminaron headers manuales (el interceptor lo maneja automáticamente)

## 🎯 Para Probar Ahora Mismo

1. **Recarga** la página del frontend (F5 o Ctrl+R)
2. Si estás con SUPERUSER, **crea un usuario regular** primero
3. **Login** con un usuario que tenga empresa
4. **Ve a "Mi Empresa"** en el menú
5. Deberías ver dos tarjetas de planes (BÁSICO y PREMIUM)
6. **Click en "Cambiar a este plan"** en el plan que NO es el actual
7. Se abre un modal con métodos de pago
8. **Selecciona un método** y haz click en "Confirmar Pago"

## 📝 Registro de Base de Datos

El cambio de plan crea automáticamente:

- ✅ Actualiza `plan_suscripcion` en la tabla `empresas`
- ✅ Actualiza `monto_pago` en la tabla `empresas`
- ✅ Crea un registro en `historial_pagos` con:
  - Plan anterior y nuevo
  - Monto pagado
  - Método de pago
  - Fecha de vencimiento (30 días desde hoy)
  - Usuario que realizó el cambio

## 🐛 Si Aún No Funciona

Abre la consola del navegador (F12) y busca errores. Debería mostrar algo como:

```
POST http://localhost:3000/api/empresas/mi-empresa/cambiar-plan
```

Si ves un error 400 o 404, comparte el mensaje exacto para ayudarte mejor.
