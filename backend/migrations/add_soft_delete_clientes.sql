-- ============================================
-- MIGRACIÓN: Agregar campo fecha_eliminacion para Soft Delete
-- ============================================
-- Esta migración habilita el soft delete en la tabla clientes
-- permitiendo recuperar registros eliminados.

ALTER TABLE clientes 
ADD COLUMN fecha_eliminacion DATETIME DEFAULT NULL
COMMENT 'Fecha de eliminación lógica (soft delete) - NULL si no está eliminado';

-- Agregar índice para mejorar consultas de eliminados
CREATE INDEX idx_clientes_eliminacion ON clientes(fecha_eliminacion);

-- ============================================
-- VERIFICACIÓN DEL MULTI-TENANCY
-- ============================================
-- El campo id_empresa actúa como id_tenant (FK hacia empresas.id_empresa)
-- Todas las consultas deben filtrar por id_empresa para aislar datos entre tenants

-- Verificar estructura de multi-tenancy
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'clientes' 
    AND COLUMN_NAME = 'id_empresa';

-- ============================================
-- EJEMPLO DE USO: Los 5 puntos solicitados
-- ============================================

-- PUNTO 1: Registrar cliente con datos abc y 111 (mostrar id_tenant)
-- En el backend: POST /api/clientes
-- Body: { "nombre": "abc", "nit": "111" }
-- El id_tenant se obtiene automáticamente del JWT del usuario

-- Simulación SQL (normalmente se hace desde el backend):
-- INSERT INTO clientes (id_empresa, nombre, nit, activo, fecha_creacion, fecha_actualizacion)
-- VALUES (1, 'abc', '111', 1, NOW(), NOW());

-- PUNTO 2: Modificar datos del cliente abc por taller
-- En el backend: PUT /api/clientes/:id
-- Body: { "nombre": "taller" }

-- Simulación SQL:
-- UPDATE clientes 
-- SET nombre = 'taller', fecha_actualizacion = NOW()
-- WHERE nombre = 'abc' AND id_empresa = 1 AND fecha_eliminacion IS NULL;

-- PUNTO 3: Buscar todos los clientes de la microempresa sistoys
-- En el backend: GET /api/clientes
-- El filtro por id_empresa se aplica automáticamente según el tenant del usuario

-- Simulación SQL (buscar por nombre de empresa):
-- SELECT c.*, e.nombre as nombre_empresa
-- FROM clientes c
-- INNER JOIN empresas e ON c.id_empresa = e.id_empresa
-- WHERE e.nombre LIKE '%sistoys%' 
--   AND c.fecha_eliminacion IS NULL;

-- PUNTO 4: Eliminar cliente (soft delete)
-- En el backend: DELETE /api/clientes/:id

-- Simulación SQL:
-- UPDATE clientes 
-- SET fecha_eliminacion = NOW()
-- WHERE nombre = 'abc' AND id_empresa = 1;

-- PUNTO 5: Mostrar clientes eliminados
-- En el backend: GET /api/clientes/eliminados

-- Simulación SQL:
-- SELECT 
--     c.*,
--     e.nombre as nombre_empresa,
--     c.fecha_eliminacion
-- FROM clientes c
-- INNER JOIN empresas e ON c.id_empresa = e.id_empresa
-- WHERE c.id_empresa = 1 
--   AND c.fecha_eliminacion IS NOT NULL
-- ORDER BY c.fecha_eliminacion DESC;

-- BONUS: Restaurar cliente eliminado
-- En el backend: PATCH /api/clientes/:id/restaurar

-- Simulación SQL:
-- UPDATE clientes 
-- SET fecha_eliminacion = NULL
-- WHERE id_cliente = :id AND id_empresa = 1;

-- ============================================
-- VERIFICACIONES DE INTEGRIDAD MULTI-TENANT
-- ============================================

-- Verificar que no hay clientes huérfanos (sin empresa)
SELECT COUNT(*) as clientes_sin_empresa
FROM clientes c
LEFT JOIN empresas e ON c.id_empresa = e.id_empresa
WHERE e.id_empresa IS NULL;

-- Verificar aislamiento de datos entre tenants
SELECT 
    e.id_empresa as id_tenant,
    e.nombre as nombre_empresa,
    COUNT(c.id_cliente) as total_clientes,
    SUM(CASE WHEN c.fecha_eliminacion IS NULL THEN 1 ELSE 0 END) as clientes_activos,
    SUM(CASE WHEN c.fecha_eliminacion IS NOT NULL THEN 1 ELSE 0 END) as clientes_eliminados
FROM empresas e
LEFT JOIN clientes c ON e.id_empresa = c.id_empresa
GROUP BY e.id_empresa, e.nombre
ORDER BY e.id_empresa;
