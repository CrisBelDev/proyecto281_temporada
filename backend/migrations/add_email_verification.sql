-- Script SQL para agregar campos de verificación de email
-- Ejecutar este script en tu base de datos MySQL

USE nombre_de_tu_base_de_datos; -- Reemplaza con el nombre de tu base de datos

-- Agregar columnas para verificación de email
ALTER TABLE usuarios 
ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE AFTER activo,
ADD COLUMN token_verificacion VARCHAR(255) NULL AFTER email_verificado,
ADD COLUMN token_verificacion_expira DATETIME NULL AFTER token_verificacion;

-- Opcional: Crear índice para mejorar búsquedas por token
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);

-- Mostrar la estructura actualizada de la tabla
DESCRIBE usuarios;

-- Opcional: Si quieres que los usuarios existentes estén verificados automáticamente
-- Descomenta la siguiente línea:
-- UPDATE usuarios SET email_verificado = TRUE WHERE email_verificado IS NULL OR email_verificado = FALSE;
