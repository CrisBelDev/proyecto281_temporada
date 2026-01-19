-- ============================================
-- VERIFICACIÓN Y REPARACIÓN DE TABLA CLIENTES
-- ============================================
-- Ejecutar este script si tienes problemas con la tabla clientes

-- 1. Verificar si la tabla existe
SELECT COUNT(*) as tabla_existe 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'clientes';

-- 2. Ver todos los clientes (para verificar si hay datos)
SELECT * FROM clientes;

-- 3. Si necesitas recrear la tabla (¡CUIDADO! Esto borra los datos)
-- DESCOMENTAR SOLO SI ES NECESARIO:
/*
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(300),
    activo BOOLEAN DEFAULT true,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_clientes_empresa ON clientes(id_empresa);
CREATE INDEX idx_clientes_nit ON clientes(id_empresa, nit);
*/

-- 4. Insertar cliente de prueba (cambiar id_empresa según tu caso)
-- DESCOMENTAR y ajustar id_empresa:
/*
INSERT INTO clientes (id_empresa, nombre, nit, telefono, email, direccion, activo)
VALUES (1, 'abc', '111', NULL, NULL, NULL, true);
*/

-- 5. Verificar los clientes por empresa
SELECT 
    e.nombre as empresa,
    COUNT(c.id_cliente) as total_clientes
FROM empresas e
LEFT JOIN clientes c ON e.id_empresa = c.id_empresa
GROUP BY e.id_empresa, e.nombre;
