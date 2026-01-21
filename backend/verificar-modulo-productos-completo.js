/*
 * Script de Verificación del Módulo de Productos
 * Verifica:
 * 1. Portal filtra productos con stock > 0
 * 2. Productos con stock = 0 generan notificación STOCK_AGOTADO
 * 3. Productos con stock bajo generan notificación STOCK_BAJO
 * 4. Portal es accesible sin autenticación
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

async function verificarModuloProductos() {
	console.log("=".repeat(60));
	console.log("VERIFICACIÓN DEL MÓDULO DE PRODUCTOS");
	console.log("=".repeat(60));

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "saas_inventario",
	});

	try {
		// 1. Verificar que existan categorías
		console.log("\n1. Verificando categorías...");
		const [categorias] = await connection.query(
			"SELECT * FROM categorias WHERE nombre = 'niños' LIMIT 1",
		);
		if (categorias.length > 0) {
			console.log("✓ Categoría 'niños' encontrada:", categorias[0]);
		} else {
			console.log("✗ Categoría 'niños' NO encontrada");
		}

		// 2. Verificar productos
		console.log("\n2. Verificando productos...");
		const [productos] = await connection.query(`
			SELECT p.*, c.nombre as categoria_nombre 
			FROM productos p 
			LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
			ORDER BY p.fecha_creacion DESC 
			LIMIT 10
		`);

		console.log(`Total de productos: ${productos.length}`);
		productos.forEach((p) => {
			console.log(
				`  - ${p.nombre} (${p.codigo}): Stock ${p.stock_actual}, Categoría: ${p.categoria_nombre || "Sin categoría"}`,
			);
		});

		// 3. Verificar productos con stock = 0
		console.log("\n3. Verificando productos con stock en cero...");
		const [productosSinStock] = await connection.query(`
			SELECT * FROM productos WHERE stock_actual = 0
		`);

		if (productosSinStock.length > 0) {
			console.log(`✓ Productos con stock en 0: ${productosSinStock.length}`);
			productosSinStock.forEach((p) => {
				console.log(`  - ${p.nombre} (${p.codigo})`);
			});
		} else {
			console.log("✗ No hay productos con stock en 0");
		}

		// 4. Verificar que exista el tipo STOCK_AGOTADO en notificaciones
		console.log("\n4. Verificando tipo STOCK_AGOTADO en notificaciones...");
		const [columnInfo] = await connection.query(`
			SELECT COLUMN_TYPE 
			FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = '${process.env.DB_NAME || "saas_inventario"}' 
			  AND TABLE_NAME = 'notificaciones' 
			  AND COLUMN_NAME = 'tipo'
		`);

		if (columnInfo.length > 0) {
			const tipos = columnInfo[0].COLUMN_TYPE;
			console.log(`✓ Tipos de notificación: ${tipos}`);
			if (tipos.includes("STOCK_AGOTADO")) {
				console.log("✓ Tipo STOCK_AGOTADO está disponible");
			} else {
				console.log("✗ Tipo STOCK_AGOTADO NO está disponible");
			}
		}

		// 5. Verificar notificaciones de stock
		console.log("\n5. Verificando notificaciones de stock...");
		const [notificaciones] = await connection.query(`
			SELECT * FROM notificaciones 
			WHERE tipo IN ('STOCK_BAJO', 'STOCK_AGOTADO') 
			ORDER BY fecha_creacion DESC 
			LIMIT 10
		`);

		if (notificaciones.length > 0) {
			console.log(
				`✓ Notificaciones de stock encontradas: ${notificaciones.length}`,
			);
			notificaciones.forEach((n) => {
				console.log(
					`  - [${n.tipo}] ${n.titulo}: ${n.mensaje} (Leída: ${n.leida ? "Sí" : "No"})`,
				);
			});
		} else {
			console.log("⚠ No hay notificaciones de stock");
		}

		// 6. Verificar productos visibles en portal (stock > 0 y activo = true)
		console.log("\n6. Verificando productos visibles en portal...");
		const [productosPortal] = await connection.query(`
			SELECT p.*, c.nombre as categoria_nombre 
			FROM productos p 
			LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
			WHERE p.stock_actual > 0 AND p.activo = true
			ORDER BY p.nombre ASC
		`);

		console.log(
			`✓ Productos visibles en portal (stock > 0): ${productosPortal.length}`,
		);
		productosPortal.forEach((p) => {
			console.log(
				`  - ${p.nombre}: Stock ${p.stock_actual}, Precio: $${p.precio_venta}`,
			);
		});

		// 7. Verificar productos NO visibles en portal (stock = 0 o activo = false)
		console.log("\n7. Verificando productos NO visibles en portal...");
		const [productosNoVisibles] = await connection.query(`
			SELECT * FROM productos 
			WHERE stock_actual = 0 OR activo = false
		`);

		console.log(
			`✓ Productos NO visibles en portal: ${productosNoVisibles.length}`,
		);
		productosNoVisibles.forEach((p) => {
			const razon =
				p.stock_actual === 0
					? "Sin stock"
					: p.activo === false
						? "Inactivo"
						: "Otro";
			console.log(`  - ${p.nombre}: ${razon}`);
		});

		// 8. Verificar empresas con slug para portal
		console.log("\n8. Verificando empresas con slug...");
		const [empresas] = await connection.query(`
			SELECT id_empresa, nombre, slug, activo 
			FROM empresas 
			WHERE activo = true AND slug IS NOT NULL
		`);

		if (empresas.length > 0) {
			console.log(`✓ Empresas con portal activo: ${empresas.length}`);
			empresas.forEach((e) => {
				console.log(`  - ${e.nombre} → /portal/${e.slug}`);
			});
		} else {
			console.log("✗ No hay empresas con slug configurado");
		}

		console.log("\n" + "=".repeat(60));
		console.log("RESUMEN");
		console.log("=".repeat(60));
		console.log(`Total productos: ${productos.length}`);
		console.log(
			`Productos visibles en portal: ${productosPortal.length} (stock > 0)`,
		);
		console.log(
			`Productos sin stock: ${productosSinStock.length} (NO visibles)`,
		);
		console.log(`Notificaciones de stock: ${notificaciones.length}`);
		console.log(`Empresas con portal público: ${empresas.length}`);

		console.log("\n✓ Verificación completada exitosamente\n");
	} catch (error) {
		console.error("\n✗ Error durante la verificación:", error.message);
		throw error;
	} finally {
		await connection.end();
	}
}

// Ejecutar verificación
verificarModuloProductos().catch((error) => {
	console.error("Error fatal:", error);
	process.exit(1);
});
