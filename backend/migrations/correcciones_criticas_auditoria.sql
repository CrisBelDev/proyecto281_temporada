-- ============================================
-- CORRECCIONES CRÍTICAS - AUDITORÍA TÉCNICA
-- Fecha: 28/01/2026
-- ============================================

-- 1. CREAR ROL VENDEDOR (si no existe)
INSERT IGNORE INTO roles (nombre, descripcion) 
VALUES ('VENDEDOR', 'Vendedor con permisos limitados a ventas');

-- 2. AGREGAR CAMPOS A EMPRESAS (Plan, Monto, Horarios)
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS plan_suscripcion ENUM('BASICO', 'PREMIUM') DEFAULT 'BASICO' COMMENT 'Plan de suscripción de la empresa',
ADD COLUMN IF NOT EXISTS monto_pago DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto mensual en Bolivianos',
ADD COLUMN IF NOT EXISTS horario_apertura TIME COMMENT 'Hora de apertura',
ADD COLUMN IF NOT EXISTS horario_cierre TIME COMMENT 'Hora de cierre',
ADD COLUMN IF NOT EXISTS dias_atencion VARCHAR(100) DEFAULT 'Lunes a Viernes' COMMENT 'Días de atención';

-- 3. AGREGAR ESTADO DE ENTREGA A VENTAS
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS estado_entrega ENUM('PENDIENTE', 'ENTREGADO') DEFAULT 'PENDIENTE' COMMENT 'Estado de entrega de productos' AFTER estado;

-- 4. MODIFICAR ESTADO DE COMPRAS (agregar PENDIENTE y RECIBIDA)
ALTER TABLE compras 
MODIFY COLUMN estado ENUM('PENDIENTE', 'RECIBIDA', 'ANULADA') DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE: productos no recibidos, RECIBIDA: stock actualizado';

-- 5. AGREGAR SOFT DELETE A CLIENTES (si no existe)
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS fecha_eliminacion DATETIME NULL COMMENT 'Fecha de eliminación lógica (soft delete)' AFTER fecha_actualizacion;

-- 6. ACTUALIZAR COMPRAS EXISTENTES A ESTADO RECIBIDA (para mantener consistencia)
-- Solo si ya tienen stock actualizado
UPDATE compras SET estado = 'RECIBIDA' WHERE estado = 'COMPLETADA';

-- 7. VERIFICAR TIPO DE NOTIFICACIÓN STOCK_AGOTADO
-- Esta es solo verificación, el enum ya debería existir
SELECT 'Verificar que Notificacion.tipo incluya STOCK_AGOTADO en el modelo' AS NOTA;

-- ============================================
-- SCRIPT COMPLETADO
-- ============================================
SELECT '✅ Migraciones críticas ejecutadas correctamente' AS RESULTADO;
