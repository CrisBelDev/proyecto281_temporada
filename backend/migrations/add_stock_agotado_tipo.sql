-- Migración: Agregar tipo STOCK_AGOTADO al enum de notificaciones
-- Fecha: 2026-01-20
-- Descripción: Actualiza el tipo ENUM de notificaciones para incluir STOCK_AGOTADO

USE saas_inventario;

-- Modificar la columna tipo para agregar STOCK_AGOTADO
ALTER TABLE notificaciones 
MODIFY COLUMN tipo ENUM('STOCK_BAJO', 'STOCK_AGOTADO', 'VENTA', 'COMPRA', 'SISTEMA') NOT NULL;

-- Verificar que el cambio se realizó correctamente
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'saas_inventario' 
  AND TABLE_NAME = 'notificaciones' 
  AND COLUMN_NAME = 'tipo';

SELECT 'Migración completada: tipo STOCK_AGOTADO agregado correctamente' AS resultado;
