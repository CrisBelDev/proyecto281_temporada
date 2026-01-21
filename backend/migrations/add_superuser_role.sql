-- Migration: Agregar rol SUPERUSER y crear primer super usuario
-- Fecha: 2026-01-19
-- Descripción: Agrega el rol SUPERUSER al sistema y crea el primer usuario con este rol

-- 1. Asegurarse de que el rol SUPERUSER existe
INSERT INTO roles (nombre, descripcion)
VALUES ('SUPERUSER', 'Super Usuario - Acceso total al sistema y gestión de empresas')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Crear una empresa para el superusuario (si no existe)
INSERT INTO empresas (nombre, nit, email, activo, fecha_creacion, fecha_actualizacion)
VALUES ('Sistema Central', 'SUPERUSER-001', 'superadmin@sistema.com', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

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
    e.id_empresa,
    r.id_rol,
    'Super',
    'Usuario',
    'superadmin@sistema.com',
    '$2b$10$TQF8eoXH.uBMJ5YVL1nL4.Xb6D8WMxKLgY8oYjGBCFGKJ0nL4.Xb6',
    true,
    true,
    NOW(),
    NOW()
FROM empresas e
CROSS JOIN roles r
WHERE e.email = 'superadmin@sistema.com'
  AND r.nombre = 'SUPERUSER'
ON CONFLICT (email, id_empresa) DO UPDATE
SET id_rol = EXCLUDED.id_rol;

-- 4. Verificar la creación
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

-- INSTRUCCIONES:
-- 1. Ejecutar este script en la base de datos
-- 2. Login con email: superadmin@sistema.com
-- 3. Password: SuperAdmin@2026
-- 4. IMPORTANTE: Cambiar la contraseña inmediatamente después del primer login
