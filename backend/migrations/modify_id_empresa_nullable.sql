-- ============================================
-- MIGRACIÓN: Modificar columna id_empresa para permitir NULL
-- ============================================
-- Este script modifica la tabla usuarios para permitir
-- que id_empresa sea NULL (necesario para SUPERUSER)
--
-- Fecha: 2026-01-22
-- Base de datos: MySQL/MariaDB
-- ============================================

-- 1. Verificar estado actual
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'usuarios'
  AND COLUMN_NAME = 'id_empresa';

-- 2. Eliminar la clave foránea existente
ALTER TABLE usuarios
DROP FOREIGN KEY usuarios_ibfk_1;

-- 3. Modificar la columna para permitir NULL
ALTER TABLE usuarios
MODIFY COLUMN id_empresa INT NULL;

-- 4. Volver a crear la clave foránea permitiendo NULL
ALTER TABLE usuarios
ADD CONSTRAINT usuarios_ibfk_1 
FOREIGN KEY (id_empresa) 
REFERENCES empresas(id_empresa) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 5. Verificar el cambio
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'usuarios'
  AND COLUMN_NAME = 'id_empresa';

-- 6. Ahora actualizar SUPERUSER para que no tenga empresa
UPDATE usuarios u
INNER JOIN roles r ON u.id_rol = r.id_rol
SET u.id_empresa = NULL
WHERE r.nombre = 'SUPERUSER';

-- 7. Verificar el resultado
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol,
    COALESCE(e.nombre, 'SIN EMPRESA - GESTIONA TODAS') as empresa,
    u.id_empresa
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE r.nombre = 'SUPERUSER';

-- RESULTADO ESPERADO:
-- La columna id_empresa ahora acepta NULL
-- El SUPERUSER tiene id_empresa = NULL
