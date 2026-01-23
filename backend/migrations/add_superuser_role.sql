-- Migration: Agregar rol SUPERUSER y crear primer super usuario
-- Fecha: 2026-01-19
-- Descripción: Agrega el rol SUPERUSER al sistema y crea el primer usuario con este rol

-- 1. Asegurarse de que el rol SUPERUSER existe
INSERT INTO roles (nombre, descripcion)
VALUES ('SUPERUSER', 'Super Usuario - Acceso total al sistema y gestión de empresas')
ON CONFLICT (nombre) DO NOTHING;

-- 2. El SUPERUSER NO está asociado a ninguna empresa específica
-- Puede gestionar todas las empresas del sistema

-- 3. Crear el primer usuario SUPERUSER
-- NOTA: Debes cambiar la contraseña después del primer login
-- Password por defecto: SuperAdmin@2026
-- Hash bcrypt de "SuperAdmin@2026" con salt 10: $2b$10$TQF8eoXH.uBMJ5YVL1nL4.Xb6D8WMxKLgY8oYjGBCFGKJ0nL4.Xb6
INSERT INTO usuarios (
    id_empresa,
    id_rol,
    nombre,
    apellido,
    email,
    password,
    activo,
    email_verificado,
    fecha_creacion,
    fecha_actualizacion
)
SELECT 
    NULL, -- SUPERUSER sin empresa específica
    r.id_rol,
    'Super',
    'Usuario',
    'superadmin@sistema.com',
    '$2b$10$TQF8eoXH.uBMJ5YVL1nL4.Xb6D8WMxKLgY8oYjGBCFGKJ0nL4.Xb6',
    true,
    true,
    NOW(),
    NOW()
FROM roles r
WHERE r.nombre = 'SUPERUSER'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'superadmin@sistema.com'
  );

-- 4. Verificar la creación
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol,
    COALESCE(e.nombre, 'SIN EMPRESA - GESTIONA TODAS') as empresa,
    u.activo
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE r.nombre = 'SUPERUSER';

-- INSTRUCCIONES:
-- 1. Ejecutar este script en la base de datos
-- 2. Login con email: superadmin@sistema.com
-- 3. Password: SuperAdmin@2026
-- 4. IMPORTANTE: Cambiar la contraseña inmediatamente después del primer login
