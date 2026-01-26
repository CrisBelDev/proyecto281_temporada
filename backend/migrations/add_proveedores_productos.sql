-- Migración: Agregar campos adicionales a proveedores y crear tabla proveedores_productos

-- Agregar columnas a la tabla proveedores
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS contacto_nombre VARCHAR(200);
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS contacto_telefono VARCHAR(20);
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS datos_pago TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Crear tabla proveedores_productos si no existe
CREATE TABLE IF NOT EXISTS proveedores_productos (
    id_proveedor_producto SERIAL PRIMARY KEY,
    id_proveedor INTEGER NOT NULL REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    precio_compra_habitual DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_proveedor, id_producto)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_proveedores_productos_proveedor ON proveedores_productos(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_proveedores_productos_producto ON proveedores_productos(id_producto);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);
CREATE INDEX IF NOT EXISTS idx_proveedores_productos_activo ON proveedores_productos(activo);

COMMENT ON TABLE proveedores_productos IS 'Relación entre proveedores y productos que suministran';
COMMENT ON COLUMN proveedores.datos_pago IS 'JSON con información de pago (banco, cuenta, tipo de cuenta, etc.)';
COMMENT ON COLUMN proveedores_productos.precio_compra_habitual IS 'Precio habitual de compra al proveedor';
