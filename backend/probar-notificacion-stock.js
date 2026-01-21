/*
 * Script para probar notificaciones al actualizar stock
 * Actualiza el stock de un producto a 0 para verificar la notificación
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

async function probarNotificacionStock() {
	console.log("=".repeat(60));
	console.log("PROBANDO NOTIFICACIONES AL ACTUALIZAR STOCK");
	console.log("=".repeat(60));

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "saas_inventario",
	});

	try {
		// Buscar un producto con stock mayor a 0
		console.log("\n1. Buscando producto con stock...");
		const [productos] = await connection.query(
			"SELECT * FROM productos WHERE stock_actual > 0 ORDER BY stock_actual ASC LIMIT 1",
		);

		if (productos.length === 0) {
			console.log("✗ No hay productos con stock disponible");
			return;
		}

		const producto = productos[0];
		console.log(`✓ Producto encontrado: ${producto.nombre}`);
		console.log(`  - ID: ${producto.id_producto}`);
		console.log(`  - Stock actual: ${producto.stock_actual}`);
		console.log(`  - Stock mínimo: ${producto.stock_minimo}`);
		console.log(`  - Empresa: ${producto.id_empresa}`);

		// Contar notificaciones antes
		const [notifAntes] = await connection.query(
			"SELECT COUNT(*) as total FROM notificaciones WHERE id_empresa = ?",
			[producto.id_empresa],
		);
		console.log(`\n2. Notificaciones antes: ${notifAntes[0].total}`);

		// Actualizar stock a 0
		console.log("\n3. Actualizando stock a 0...");
		await connection.query(
			"UPDATE productos SET stock_actual = 0 WHERE id_producto = ?",
			[producto.id_producto],
		);
		console.log("✓ Stock actualizado a 0");

		console.log(
			"\n⚠️ IMPORTANTE: La notificación se creará cuando actualices el producto",
		);
		console.log("   desde el frontend o usando la API de actualización.");
		console.log("\nPara probar manualmente:");
		console.log("1. Ve a Productos en el frontend");
		console.log(`2. Edita el producto: ${producto.nombre}`);
		console.log("3. Cambia el stock a 0");
		console.log("4. Guarda los cambios");
		console.log("5. Ve a Notificaciones para ver la alerta");

		// Restaurar stock original
		console.log(
			`\n4. Restaurando stock original (${producto.stock_actual})...`,
		);
		await connection.query(
			"UPDATE productos SET stock_actual = ? WHERE id_producto = ?",
			[producto.stock_actual, producto.id_producto],
		);
		console.log("✓ Stock restaurado");

		console.log("\n" + "=".repeat(60));
		console.log("✓ PRUEBA COMPLETADA");
		console.log("=".repeat(60));
		console.log(
			"\nRecuerda: Las notificaciones se generan automáticamente cuando:",
		);
		console.log("  1. Actualizas un producto y cambias su stock a 0 o bajo");
		console.log("  2. Realizas una venta que deja el stock en 0 o bajo");
		console.log("  3. Creas un producto nuevo con stock en 0 o bajo");
	} catch (error) {
		console.error("\n✗ Error:", error.message);
		throw error;
	} finally {
		await connection.end();
	}
}

// Ejecutar
probarNotificacionStock().catch((error) => {
	console.error("Error fatal:", error);
	process.exit(1);
});
