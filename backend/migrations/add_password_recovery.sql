-- Script SQL para agregar campos de recuperación de contraseña
-- Ejecutar este script en tu base de datos MySQL

USE nombre_de_tu_base_de_datos; -- Reemplaza con el nombre de tu base de datos

-- Agregar columnas para recuperación de contraseña
ALTER TABLE usuarios 
ADD COLUMN token_recuperacion VARCHAR(255) NULL AFTER token_verificacion_expira,
ADD COLUMN token_recuperacion_expira DATETIME NULL AFTER token_recuperacion;

-- Opcional: Crear índice para mejorar búsquedas por token de recuperación
CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);

-- Mostrar la estructura actualizada de la tabla
DESCRIBE usuarios;
