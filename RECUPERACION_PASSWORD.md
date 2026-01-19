# Recuperación de Contraseña - Documentación

## Descripción

Sistema completo de recuperación de contraseña para usuarios que olvidaron sus credenciales, usando Mailtrap para el envío de correos electrónicos.

## Configuración

### Backend

#### Archivos modificados/creados

**Modelo de Usuario** (`src/models/Usuario.js`):

- Nuevos campos agregados:
  - `token_recuperacion` (STRING) - Token único de recuperación
  - `token_recuperacion_expira` (DATE) - Fecha de expiración del token (1 hora)

**Servicio de email** (`src/services/email.service.js`):

- `enviarEmailRecuperacion()` - Envía email con enlace de recuperación
- `enviarEmailConfirmacionCambioPassword()` - Envía confirmación después de cambiar contraseña

**Controlador de autenticación** (`src/controllers/auth.controller.js`):

- Nuevo `solicitarRecuperacion()` - Genera token y envía email de recuperación
- Nuevo `verificarTokenRecuperacion()` - Valida que el token sea válido y no haya expirado
- Nuevo `resetearPassword()` - Actualiza la contraseña y elimina el token

**Rutas de autenticación** (`src/routes/auth.routes.js`):

- `POST /api/auth/solicitar-recuperacion` - Solicita recuperación de contraseña
- `GET /api/auth/verificar-token-recuperacion/:token` - Verifica validez del token
- `POST /api/auth/resetear-password` - Resetea la contraseña

### Frontend

#### Páginas creadas

**OlvidePassword** (`src/pages/OlvidePassword.jsx`):

- Formulario para ingresar email
- Envía solicitud de recuperación
- Muestra confirmación al usuario

**ResetearPassword** (`src/pages/ResetearPassword.jsx`):

- Verifica validez del token automáticamente
- Formulario para ingresar nueva contraseña
- Confirmación de contraseñas
- Redirecciona al login después de actualizar

**Actualizaciones en Login** (`src/pages/Login.jsx`):

- Enlace "¿Olvidaste tu contraseña?" debajo del campo de password

**Rutas** (`src/App.jsx`):

- `/olvide-password` - Página para solicitar recuperación
- `/resetear-password/:token` - Página para resetear contraseña

## Flujo de Recuperación

### 1. Solicitar Recuperación

1. Usuario hace clic en "¿Olvidaste tu contraseña?" en el login
2. Ingresa su email
3. Sistema genera token de recuperación (válido por 1 hora)
4. Se envía email con enlace de recuperación
5. Usuario ve mensaje de confirmación (sin revelar si el email existe por seguridad)

### 2. Verificar Token

1. Usuario hace clic en el enlace del email
2. Frontend abre la página `/resetear-password/:token`
3. Se verifica automáticamente que el token sea válido
4. Si es válido:
   - Se muestra formulario para nueva contraseña
5. Si es inválido o expirado:
   - Se muestra mensaje de error
   - Se ofrece opción de solicitar nuevo enlace

### 3. Resetear Contraseña

1. Usuario ingresa nueva contraseña (mínimo 6 caracteres)
2. Usuario confirma la nueva contraseña
3. Se valida que las contraseñas coincidan
4. Si todo es válido:
   - Se actualiza la contraseña (con hash bcrypt)
   - Se elimina el token de recuperación
   - Se envía email de confirmación
   - Se redirige al login
5. Si hay error:
   - Se muestra mensaje de error apropiado

## Emails Enviados

### Email de Recuperación

- **Asunto**: "Recuperación de contraseña"
- **Contenido**:
  - Saludo personalizado
  - Botón para restablecer contraseña
  - Enlace alternativo
  - Advertencia de expiración (1 hora)
  - Advertencia de seguridad

### Email de Confirmación

- **Asunto**: "Contraseña actualizada exitosamente"
- **Contenido**:
  - Confirmación del cambio
  - Fecha y hora del cambio
  - Advertencia de seguridad

## Seguridad Implementada

### Tokens

- Generados con `crypto.randomBytes(32)` - 32 bytes aleatorios en hexadecimal
- Expiración de 1 hora (más corto que verificación de email por seguridad)
- Tokens de un solo uso (se eliminan después de usarlos)
- No reutilizables

### Prevención de Enumeración de Usuarios

- La respuesta siempre es exitosa aunque el email no exista
- Esto previene que atacantes descubran qué emails están registrados
- Mensaje genérico: "Si el email existe en nuestro sistema, recibirás un enlace..."

### Validaciones

- Contraseña mínima de 6 caracteres
- Confirmación de contraseña obligatoria
- Verificación de que las contraseñas coincidan
- Token debe ser válido y no expirado
- Usuario debe estar activo

### Notificaciones

- Email de confirmación después de cambiar contraseña
- Incluye fecha y hora del cambio
- Advierte al usuario sobre cambios no autorizados

## Actualización de Base de Datos

Ejecutar el siguiente script SQL:

```sql
ALTER TABLE usuarios
ADD COLUMN token_recuperacion VARCHAR(255) NULL,
ADD COLUMN token_recuperacion_expira DATETIME NULL;

CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
```

O ejecutar el archivo de migración:

```bash
mysql -u usuario -p nombre_base_datos < backend/migrations/add_password_recovery.sql
```

## Testing en Desarrollo

### 1. Solicitar Recuperación

1. Ve a http://localhost:5173/login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un email registrado
4. Verifica el mensaje de confirmación

### 2. Revisar Email

1. Accede a Mailtrap: https://mailtrap.io/inboxes
2. Abre el email de recuperación
3. Verifica que el enlace sea correcto

### 3. Resetear Contraseña

1. Haz clic en el enlace del email
2. Verifica que el token sea válido
3. Ingresa nueva contraseña (mínimo 6 caracteres)
4. Confirma la contraseña
5. Verifica la confirmación exitosa

### 4. Verificar Cambio

1. Serás redirigido al login
2. Intenta iniciar sesión con la contraseña antigua (debe fallar)
3. Inicia sesión con la nueva contraseña (debe funcionar)
4. Verifica el email de confirmación en Mailtrap

### 5. Probar Token Expirado

1. Solicita recuperación
2. Espera 1 hora
3. Intenta usar el enlace
4. Debe mostrar error de token expirado

## Casos de Uso

### Usuario Olvidó su Contraseña

1. Usuario va al login
2. Hace clic en "¿Olvidaste tu contraseña?"
3. Ingresa su email
4. Revisa su bandeja de entrada
5. Hace clic en el enlace
6. Ingresa nueva contraseña
7. Inicia sesión con nueva contraseña

### Token Expirado

1. Usuario solicita recuperación
2. No revisa el email a tiempo (más de 1 hora)
3. Intenta usar el enlace expirado
4. Ve mensaje de error
5. Hace clic en "Solicitar nuevo enlace"
6. Repite el proceso

### Email No Registrado

1. Usuario ingresa email no registrado
2. Sistema responde exitosamente (por seguridad)
3. Usuario no recibe email
4. Usuario intenta con otro email o se registra

## Diferencias con Verificación de Email

| Característica         | Verificación Email | Recuperación Password |
| ---------------------- | ------------------ | --------------------- |
| Expiración             | 24 horas           | 1 hora                |
| Propósito              | Activar cuenta     | Cambiar contraseña    |
| Respuesta si no existe | Error              | Éxito (seguridad)     |
| Elimina token después  | Sí                 | Sí                    |
| Email de confirmación  | Bienvenida         | Cambio de contraseña  |
| Requiere login previo  | No                 | No                    |

## API Endpoints

### POST /api/auth/solicitar-recuperacion

**Request:**

```json
{
	"email": "usuario@ejemplo.com"
}
```

**Response (siempre 200):**

```json
{
	"success": true,
	"mensaje": "Si el email existe en nuestro sistema, recibirás un enlace de recuperación."
}
```

### GET /api/auth/verificar-token-recuperacion/:token

**Response (200 - válido):**

```json
{
	"success": true,
	"mensaje": "Token válido"
}
```

**Response (400 - expirado):**

```json
{
	"success": false,
	"mensaje": "El token de recuperación ha expirado. Solicita uno nuevo."
}
```

### POST /api/auth/resetear-password

**Request:**

```json
{
	"token": "abc123...",
	"nuevaPassword": "nuevaPassword123"
}
```

**Response (200):**

```json
{
	"success": true,
	"mensaje": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
}
```

## Mejoras Futuras

- [ ] Límite de intentos de recuperación por email/IP
- [ ] Captcha para prevenir spam
- [ ] Autenticación de dos factores (2FA)
- [ ] Historial de cambios de contraseña
- [ ] Requisitos de contraseña más estrictos (mayúsculas, números, símbolos)
- [ ] Verificar que la nueva contraseña no sea igual a la anterior
- [ ] Notificación por SMS además de email
- [ ] Panel de sesiones activas
- [ ] Cerrar todas las sesiones al cambiar contraseña

## Notas de Seguridad

⚠️ **Importante**:

- Los tokens son de un solo uso
- No revelar si un email existe o no (prevenir enumeración)
- Siempre usar HTTPS en producción
- Los tokens se almacenan en texto plano pero son criptográficamente seguros
- Las contraseñas siempre se hashean con bcrypt
- Los emails incluyen advertencias de seguridad
- Límite de 1 hora reduce ventana de ataque
