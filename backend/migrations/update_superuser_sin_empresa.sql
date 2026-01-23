-- ============================================
-- MIGRACIÓN: Actualizar SUPERUSER existente
-- ============================================
-- Este script actualiza los usuarios SUPERUSER existentes
-- para que NO estén asociados a ninguna empresa específica
-- permitiéndoles gestionar TODAS las empresas del sistema
--
-- Fecha: 2026-01-22
-- ============================================

-- 1. Mostrar SUPERUSERS actuales (antes de la migración)
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol,
    e.nombre as empresa_actual,
    u.id_empresa
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE r.nombre = 'SUPERUSER';

-- 2. Actualizar SUPERUSERS para que no tengan empresa asignada
-- Sintaxis compatible con MySQL/MariaDB
UPDATE usuarios u
INNER JOIN roles r ON u.id_rol = r.id_rol
SET u.id_empresa = NULL
WHERE r.nombre = 'SUPERUSER';

-- 3. Verificar la actualización
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

-- 4. Opcional: Eliminar la empresa "Sistema Central" si ya no se usa
-- NOTA: Solo ejecutar si estás seguro de que no hay otros datos asociados
-- DELETE FROM empresas WHERE email = 'superadmin@sistema.com' AND nit = 'SUPERUSER-001';

-- RESULTADO ESPERADO:
-- Los usuarios SUPERUSER ahora tienen id_empresa = NULL
-- y pueden gestionar todas las empresas del sistema
