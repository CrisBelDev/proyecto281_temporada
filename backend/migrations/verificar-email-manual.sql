-- SOLUCIÓN RÁPIDA: Verificar email manualmente
-- Usar este script cuando necesites acceder urgentemente al sistema

-- ======================================================
-- INSTRUCCIONES:
-- 1. Reemplaza 'tu-email@ejemplo.com' con tu email real
-- 2. Ejecuta: mysql -u root -p proyecto281 < verificar-email-manual.sql
-- ======================================================

-- Verificar el email del usuario
UPDATE usuarios 
SET email_verificado = 1 
WHERE email = 'tu-email@ejemplo.com';

-- Verificar que se aplicó el cambio
SELECT 
    'Usuario verificado exitosamente' as 'Resultado',
    nombre,
    email,
    email_verificado as 'Email Verificado',
    activo as 'Activo'
FROM usuarios 
WHERE email = 'tu-email@ejemplo.com';

-- Si no aparece ningún resultado, el email no existe en la base de datos
