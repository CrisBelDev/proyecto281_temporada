# Verificación de Email - Documentación

## Descripción

Este sistema implementa verificación de email para usuarios nuevos usando Mailtrap para el envío de correos electrónicos.

## Configuración

### Backend

#### 1. Dependencias instaladas

- `nodemailer` - Para el envío de emails

#### 2. Archivos creados/modificados

**Configuración de email** (`src/config/email.js`):

- Configuración de Mailtrap con las credenciales proporcionadas

**Servicio de email** (`src/services/email.service.js`):

- `enviarEmailVerificacion()` - Envía email con enlace de verificación
- `enviarEmailBienvenida()` - Envía email de confirmación después de verificar

**Modelo de Usuario** (`src/models/Usuario.js`):

- Nuevos campos agregados:
  - `email_verificado` (BOOLEAN) - Estado de verificación
  - `token_verificacion` (STRING) - Token único de verificación
  - `token_verificacion_expira` (DATE) - Fecha de expiración del token (24 horas)

**Controlador de autenticación** (`src/controllers/auth.controller.js`):

- Modificado `registrarEmpresa()` para generar token y enviar email
- Modificado `login()` para verificar que el email esté verificado
- Nuevo `verificarEmail()` - Valida el token y marca el email como verificado
- Nuevo `reenviarVerificacion()` - Regenera y reenvía el email de verificación

**Rutas de autenticación** (`src/routes/auth.routes.js`):

- `GET /api/auth/verificar-email/:token` - Verifica el email
- `POST /api/auth/reenviar-verificacion` - Reenvía email de verificación

### Frontend

#### Páginas creadas

**VerificarEmail** (`src/pages/VerificarEmail.jsx`):

- Muestra spinner mientras verifica
- Muestra éxito o error según el resultado
- Redirecciona automáticamente al login después de verificar

**ReenviarVerificacion** (`src/pages/ReenviarVerificacion.jsx`):

- Formulario para solicitar nuevo email de verificación
- Confirmación visual cuando se envía el email

**Actualizaciones en Login** (`src/pages/Login.jsx`):

- Muestra enlace para reenviar verificación si el error indica email no verificado

**Actualizaciones en Registro** (`src/pages/Registro.jsx`):

- Muestra mensaje de éxito después de registrarse
- Indica al usuario que debe verificar su email
- Proporciona enlace para reenviar verificación

**Estilos** (`src/styles/Auth.css`):

- Estilos para estados de verificación (spinner, éxito, error)
- Iconos y alertas
- Diseño responsive

**Rutas** (`src/App.jsx`):

- `/verificar-email/:token` - Página de verificación
- `/reenviar-verificacion` - Página para reenviar verificación

## Flujo de Verificación

### 1. Registro

1. Usuario completa el formulario de registro
2. Sistema crea la empresa y el usuario administrador
3. Se genera un token de verificación único (válido por 24 horas)
4. Se envía un email con el enlace de verificación
5. Usuario ve mensaje de éxito indicando que debe verificar su email

### 2. Verificación

1. Usuario hace clic en el enlace del email
2. El frontend abre la página `/verificar-email/:token`
3. Se valida el token (existencia y expiración)
4. Si es válido:
   - Se marca `email_verificado = true`
   - Se elimina el token de verificación
   - Se envía email de bienvenida
   - Se redirige al login
5. Si es inválido o expirado:
   - Se muestra mensaje de error
   - Se ofrece opción de reenviar verificación

### 3. Login

1. Usuario intenta iniciar sesión
2. Sistema verifica credenciales
3. Si el email no está verificado:
   - Se muestra error con enlace para reenviar verificación
   - No se permite el login
4. Si el email está verificado:
   - Login exitoso

### 4. Reenviar Verificación

1. Usuario ingresa su email
2. Sistema genera nuevo token (24 horas de validez)
3. Se envía nuevo email de verificación
4. Usuario puede intentar verificar nuevamente

## Emails Enviados

### Email de Verificación

- **Asunto**: "Verifica tu cuenta"
- **Contenido**:
  - Saludo personalizado
  - Botón de verificación
  - Enlace alternativo
  - Nota sobre expiración (24 horas)

### Email de Bienvenida

- **Asunto**: "¡Cuenta verificada exitosamente!"
- **Contenido**:
  - Confirmación de verificación
  - Mensaje de bienvenida

## Configuración de Mailtrap

Las credenciales de Mailtrap están configuradas en `backend/src/config/email.js`:

```javascript
host: "sandbox.smtp.mailtrap.io";
port: 2525;
user: "228cd41586ed8c";
pass: "74f42b745cb1ff";
```

**Nota**: Para producción, reemplazar con credenciales de un servicio de email real (SendGrid, AWS SES, etc.)

## Actualización de Base de Datos

Para que el sistema funcione correctamente, es necesario agregar las nuevas columnas a la tabla `usuarios`:

```sql
ALTER TABLE usuarios
ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN token_verificacion VARCHAR(255) NULL,
ADD COLUMN token_verificacion_expira DATETIME NULL;
```

O bien, si usas Sequelize migrations, el modelo se sincronizará automáticamente en desarrollo.

## Variables de Entorno

Se recomienda agregar la URL del frontend a las variables de entorno:

```
FRONTEND_URL=http://localhost:5173
```

Esto permite configurar correctamente los enlaces en los emails.

## Seguridad

- Los tokens son aleatorios de 32 bytes en hexadecimal
- Los tokens expiran en 24 horas
- Los tokens se eliminan después de la verificación
- No se permite login sin verificación de email
- Los emails incluyen advertencias sobre emails no solicitados

## Testing en Desarrollo

1. Registra una nueva empresa
2. Accede a tu inbox de Mailtrap: https://mailtrap.io/inboxes
3. Abre el email de verificación
4. Haz clic en el enlace de verificación
5. Verifica que puedas iniciar sesión

## Próximas Mejoras Sugeridas

- [ ] Recuperación de contraseña
- [ ] Notificaciones por email para eventos importantes
- [ ] Configuración de email personalizable por empresa
- [ ] Límite de intentos de reenvío de verificación
- [ ] Templates de email personalizables
