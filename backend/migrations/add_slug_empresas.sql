-- Migración: Agregar campo slug a empresas y actualizar slug automáticamente
-- Fecha: 2026-01-19

-- Agregar columna slug a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN slug VARCHAR(100) UNIQUE;

-- Función para generar slug desde el nombre
-- Genera un slug único basado en el nombre de la empresa
UPDATE empresas 
SET slug = CONCAT(
    LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nombre, ' ', '-'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o')),
    '-',
    id_empresa
)
WHERE slug IS NULL;

-- Crear índice para mejorar búsquedas por slug
CREATE INDEX idx_empresas_slug ON empresas(slug);
