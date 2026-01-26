const sequelize = require("./src/config/database");
require("dotenv").config();

const ejecutarMigracion = async () => {
	try {
		await sequelize.authenticate();
		console.log("✓ Conectado a la base de datos");

		// Agregar columnas a proveedores
		await sequelize.query(`
			ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS contacto_nombre VARCHAR(200);
		`);
		console.log("✓ Columna contacto_nombre agregada");

		await sequelize.query(`
			ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS contacto_telefono VARCHAR(20);
		`);
		console.log("✓ Columna contacto_telefono agregada");

		await sequelize.query(`
			ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS datos_pago TEXT;
		`);
		console.log("✓ Columna datos_pago agregada");

		await sequelize.query(`
			ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS observaciones TEXT;
		`);
		console.log("✓ Columna observaciones agregada");

		// Crear tabla proveedores_productos
		await sequelize.query(`
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
		`);
		console.log("✓ Tabla proveedores_productos creada");

		// Crear índices
		await sequelize.query(`
			CREATE INDEX IF NOT EXISTS idx_proveedores_productos_proveedor ON proveedores_productos(id_proveedor);
		`);
		console.log("✓ Índice idx_proveedores_productos_proveedor creado");

		await sequelize.query(`
			CREATE INDEX IF NOT EXISTS idx_proveedores_productos_producto ON proveedores_productos(id_producto);
		`);
		console.log("✓ Índice idx_proveedores_productos_producto creado");

		await sequelize.query(`
			CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);
		`);
		console.log("✓ Índice idx_proveedores_activo creado");

		await sequelize.query(`
			CREATE INDEX IF NOT EXISTS idx_proveedores_productos_activo ON proveedores_productos(activo);
		`);
		console.log("✓ Índice idx_proveedores_productos_activo creado");

		console.log("\n✅ Migración completada exitosamente");
	} catch (error) {
		console.error("❌ Error en la migración:", error);
	} finally {
		await sequelize.close();
		process.exit(0);
	}
};

ejecutarMigracion();
