# 🔐 SOLUCIÓN: No puedo iniciar sesión

## ❓ Problema

No puedo iniciar sesión aunque mi contraseña es correcta.

## 🔍 Diagnóstico Rápido

El sistema tiene **3 validaciones de seguridad** que pueden bloquear el acceso:

### 1️⃣ Email NO Verificado (Más común)

- **Mensaje**: "Por favor verifica tu email antes de iniciar sesión"
- **Causa**: No has verificado tu email después del registro
- **Solución**: Ver sección "Verificar Email Manualmente" abajo

### 2️⃣ Usuario Inactivo

- **Mensaje**: "Credenciales inválidas"
- **Causa**: Tu cuenta fue desactivada
- **Solución**: Ver sección "Activar Usuario"

### 3️⃣ Empresa Inactiva

- **Mensaje**: "Empresa inactiva. Contacte al soporte"
- **Causa**: La empresa a la que perteneces fue desactivada
- **Solución**: Ver sección "Activar Empresa"

---

## 🛠️ SOLUCIONES

### Opción 1: Diagnóstico Automático (Recomendado)

Desde el directorio `backend`, ejecuta:

```bash
# Ver estado de todos los usuarios
mysql -u root -p proyecto281 < migrations/diagnostico-login.sql
```

Esto mostrará:

- ✅ Usuarios activos/inactivos
- ✅ Emails verificados/no verificados
- ✅ Empresas activas/inactivas
- ✅ Problemas detectados

---

### Opción 2: Verificar Email Manualmente (Solución Rápida)

Si el problema es que tu email **no está verificado**:

#### Método A: SQL directo

```bash
# Conectarse a MySQL
mysql -u root -p proyecto281

# Verificar tu email (reemplaza con tu email real)
UPDATE usuarios
SET email_verificado = 1
WHERE email = 'tu-email@ejemplo.com';

# Verificar que funcionó
SELECT nombre, email, email_verificado
FROM usuarios
WHERE email = 'tu-email@ejemplo.com';

# Salir
exit
```

#### Método B: Script automático

```bash
# Editar el archivo migrations/verificar-email-manual.sql
# Cambiar 'tu-email@ejemplo.com' por tu email real
# Luego ejecutar:
mysql -u root -p proyecto281 < migrations/verificar-email-manual.sql
```

---

### Opción 3: Activar Usuario

Si tu cuenta fue desactivada:

```sql
-- Conectarse a MySQL
mysql -u root -p proyecto281

-- Activar usuario
UPDATE usuarios
SET activo = 1
WHERE email = 'tu-email@ejemplo.com';

-- Verificar
SELECT nombre, email, activo
FROM usuarios
WHERE email = 'tu-email@ejemplo.com';
```

---

### Opción 4: Activar Empresa

Si la empresa está inactiva:

```sql
-- Conectarse a MySQL
mysql -u root -p proyecto281

-- Ver empresas
SELECT id_empresa, nombre, activo FROM empresas;

-- Activar empresa (reemplaza 1 con el ID correcto)
UPDATE empresas
SET activo = 1
WHERE id_empresa = 1;
```

---

### Opción 5: Verificar Hash de Contraseña

Si sospechas que la contraseña no coincide:

```bash
cd backend
node diagnostico-login.js
```

Selecciona opción **2** y sigue las instrucciones para verificar si tu contraseña coincide con el hash almacenado.

---

## 🔄 Usar la Función "Olvidé mi Contraseña"

Si prefieres restablecer tu contraseña de forma oficial:

1. Ve a la página de login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Revisa tu bandeja de entrada
5. Click en el enlace del email
6. Crea una nueva contraseña

**Nota**: Esta opción también verifica automáticamente tu email.

---

## 🚨 Casos Especiales

### Superusuario

Si eres el superusuario del sistema:

```bash
cd backend
node verificar-superuser.js
```

Esto mostrará el estado del superusuario y te permitirá:

- Ver si existe
- Verificar su email automáticamente
- Activarlo si está inactivo

---

## ✅ Verificar que Todo Funciona

Después de aplicar la solución:

1. Cierra el navegador completamente
2. Abre una nueva ventana
3. Ve a `http://localhost:5173/login`
4. Ingresa tu email y contraseña
5. Deberías poder ingresar sin problemas

---

## 📋 Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] ¿El email está verificado? (`email_verificado = 1`)
- [ ] ¿El usuario está activo? (`activo = 1` en tabla usuarios)
- [ ] ¿La empresa está activa? (`activo = 1` en tabla empresas)
- [ ] ¿La contraseña es correcta? (usa `diagnostico-login.js` opción 2)
- [ ] ¿El backend está corriendo? (`npm start` en directorio backend)
- [ ] ¿El frontend está corriendo? (`npm run dev` en directorio frontend)

---

## 🔧 Comandos de Referencia Rápida

```bash
# Ver todos los usuarios y su estado
mysql -u root -p proyecto281 -e "SELECT u.email, u.email_verificado, u.activo, e.nombre as empresa, e.activo as empresa_activa FROM usuarios u JOIN empresas e ON u.id_empresa = e.id_empresa;"

# Verificar email de un usuario específico
mysql -u root -p proyecto281 -e "UPDATE usuarios SET email_verificado = 1 WHERE email = 'TU-EMAIL';"

# Activar usuario
mysql -u root -p proyecto281 -e "UPDATE usuarios SET activo = 1 WHERE email = 'TU-EMAIL';"

# Activar empresa
mysql -u root -p proyecto281 -e "UPDATE empresas SET activo = 1 WHERE id_empresa = 1;"

# Ver todos los problemas de login
mysql -u root -p proyecto281 < backend/migrations/diagnostico-login.sql
```

---

## 💡 Prevenir Problemas Futuros

### Durante el Registro:

1. Usa un email real al que tengas acceso
2. Revisa la bandeja de entrada (y spam) después del registro
3. Click en el enlace de verificación del email
4. Espera el mensaje de confirmación antes de intentar login

### Si no recibiste el email de verificación:

1. Ve a `/reenviar-verificacion` en el frontend
2. Ingresa tu email
3. Revisa tu bandeja (y carpeta de spam)
4. Click en el enlace

---

## 🆘 ¿Aún no funciona?

Si después de seguir todos los pasos aún no puedes acceder:

1. **Verifica los logs del backend**:

   ```bash
   cd backend
   npm start
   # Observa los mensajes cuando intentas hacer login
   ```

2. **Verifica la consola del navegador** (F12):
   - ¿Hay errores en la red?
   - ¿Qué mensaje exacto aparece?

3. **Crea un nuevo usuario de prueba**:
   - Regístrate con otro email
   - Verifica manualmente ese email
   - Intenta login con ese usuario

4. **Reinicia los servicios**:

   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (nueva terminal)
   cd frontend
   npm run dev
   ```

---

## 📞 Información de Debug

Cuando pidas ayuda, proporciona:

- ✅ Email del usuario afectado
- ✅ Mensaje de error exacto
- ✅ Resultado del script `diagnostico-login.sql`
- ✅ Logs del backend cuando intentas login
- ✅ Screenshot del error (si aplica)

---

**Última actualización**: Enero 2026  
**Versión del sistema**: 1.0.0
