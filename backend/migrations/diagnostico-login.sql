-- Script de diagnóstico y solución de problemas de login
-- Ejecutar: mysql -u root -p proyecto281 < diagnostico-login.sql

-- ======================================================
-- DIAGNÓSTICO DE USUARIOS
-- ======================================================

SELECT 
    '=== DIAGNÓSTICO DE USUARIOS ===' as '';

-- Ver todos los usuarios y su estado
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.activo as 'Usuario Activo',
    u.email_verificado as 'Email Verificado',
    e.nombre as 'Empresa',
    e.activo as 'Empresa Activa',
    r.nombre as 'Rol'
FROM usuarios u
JOIN empresas e ON u.id_empresa = e.id_empresa
JOIN roles r ON u.id_rol = r.id_rol
ORDER BY u.id_usuario;

SELECT '' as '';
SELECT '=== PROBLEMAS DETECTADOS ===' as '';

-- Usuarios con email no verificado
SELECT 
    CONCAT('❌ Usuario: ', email, ' - Email NO verificado') as 'Problema'
FROM usuarios 
WHERE email_verificado = 0 AND activo = 1;

-- Usuarios inactivos
SELECT 
    CONCAT('⚠️  Usuario: ', email, ' - Usuario INACTIVO') as 'Problema'
FROM usuarios 
WHERE activo = 0;

-- Usuarios con empresa inactiva
SELECT 
    CONCAT('⚠️  Usuario: ', u.email, ' - Empresa INACTIVA (', e.nombre, ')') as 'Problema'
FROM usuarios u
JOIN empresas e ON u.id_empresa = e.id_empresa
WHERE e.activo = 0;

SELECT '' as '';
SELECT '=== SOLUCIONES DISPONIBLES ===' as '';
SELECT 'Para verificar manualmente un email, ejecuta:' as '';
SELECT 'UPDATE usuarios SET email_verificado = 1 WHERE email = ''tu-email@ejemplo.com'';' as 'Comando SQL';

