/*
 * Script para Crear Producto de Prueba y Verificar Notificaciones
 * Crea un producto con stock en 0 para probar el sistema de notificaciones
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

async function crearProductoPrueba() {
	console.log("=".repeat(60));
	console.log("CREANDO PRODUCTO DE PRUEBA CON STOCK EN CERO");
	console.log("=".repeat(60));

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "saas_inventario",
	});

	try {
		// Obtener una empresa activa
		console.log("\n1. Buscando empresa activa...");
		const [empresas] = await connection.query(
			"SELECT id_empresa, nombre FROM empresas WHERE activo = true LIMIT 1",
		);

		if (empresas.length === 0) {
			console.log("✗ No hay empresas activas");
			return;
		}

		const empresa = empresas[0];
		console.log(
			`✓ Empresa encontrada: ${empresa.nombre} (ID: ${empresa.id_empresa})`,
		);

		// Obtener una categoría
		console.log("\n2. Buscando categoría...");
		const [categorias] = await connection.query(
			"SELECT id_categoria, nombre FROM categorias WHERE id_empresa = ? LIMIT 1",
			[empresa.id_empresa],
		);

		let idCategoria = null;
		if (categorias.length > 0) {
			idCategoria = categorias[0].id_categoria;
			console.log(`✓ Categoría encontrada: ${categorias[0].nombre}`);
		} else {
			console.log("⚠ No hay categorías, se creará sin categoría");
		}

		// Crear producto con stock en 0
		console.log("\n3. Creando producto con stock en 0...");
		const productoData = {
			id_empresa: empresa.id_empresa,
			id_categoria: idCategoria,
			codigo: `TEST${Date.now()}`,
			nombre: "Producto Test Sin Stock",
			descripcion: "Producto de prueba para verificar notificaciones",
			precio_compra: 10.0,
			precio_venta: 15.0,
			stock_actual: 0, // ← Stock en CERO
			stock_minimo: 5,
			activo: true,
		};

		const [result] = await connection.query(
			`INSERT INTO productos 
			(id_empresa, id_categoria, codigo, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				productoData.id_empresa,
				productoData.id_categoria,
				productoData.codigo,
				productoData.nombre,
				productoData.descripcion,
				productoData.precio_compra,
				productoData.precio_venta,
				productoData.stock_actual,
				productoData.stock_minimo,
				productoData.activo,
			],
		);

		const idProducto = result.insertId;
		console.log(`✓ Producto creado con ID: ${idProducto}`);
		console.log(`  - Código: ${productoData.codigo}`);
		console.log(`  - Nombre: ${productoData.nombre}`);
		console.log(`  - Stock: ${productoData.stock_actual}`);

		// Crear notificación STOCK_AGOTADO manualmente
		console.log("\n4. Creando notificación de STOCK_AGOTADO...");
		await connection.query(
			`INSERT INTO notificaciones 
			(id_empresa, tipo, titulo, mensaje, leida) 
			VALUES (?, ?, ?, ?, ?)`,
			[
				empresa.id_empresa,
				"STOCK_AGOTADO",
				"Producto sin stock",
				`El producto "${productoData.nombre}" se creó sin stock disponible y no será visible en el portal`,
				false,
			],
		);
		console.log("✓ Notificación creada exitosamente");

		// Crear otro producto con stock bajo
		console.log("\n5. Creando producto con stock bajo...");
		const productoBajo = {
			id_empresa: empresa.id_empresa,
			id_categoria: idCategoria,
			codigo: `TESTBAJO${Date.now()}`,
			nombre: "Producto Test Stock Bajo",
			descripcion:
				"Producto de prueba para verificar notificaciones de stock bajo",
			precio_compra: 8.0,
			precio_venta: 12.0,
			stock_actual: 2, // ← Stock BAJO (menor que mínimo)
			stock_minimo: 5,
			activo: true,
		};

		const [result2] = await connection.query(
			`INSERT INTO productos 
			(id_empresa, id_categoria, codigo, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				productoBajo.id_empresa,
				productoBajo.id_categoria,
				productoBajo.codigo,
				productoBajo.nombre,
				productoBajo.descripcion,
				productoBajo.precio_compra,
				productoBajo.precio_venta,
				productoBajo.stock_actual,
				productoBajo.stock_minimo,
				productoBajo.activo,
			],
		);

		console.log(`✓ Producto creado con ID: ${result2.insertId}`);
		console.log(`  - Código: ${productoBajo.codigo}`);
		console.log(
			`  - Stock: ${productoBajo.stock_actual} (Mínimo: ${productoBajo.stock_minimo})`,
		);

		// Crear notificación STOCK_BAJO
		console.log("\n6. Creando notificación de STOCK_BAJO...");
		await connection.query(
			`INSERT INTO notificaciones 
			(id_empresa, tipo, titulo, mensaje, leida) 
			VALUES (?, ?, ?, ?, ?)`,
			[
				empresa.id_empresa,
				"STOCK_BAJO",
				"Stock bajo",
				`El producto "${productoBajo.nombre}" tiene stock bajo (${productoBajo.stock_actual} unidades, mínimo: ${productoBajo.stock_minimo})`,
				false,
			],
		);
		console.log("✓ Notificación creada exitosamente");

		// Verificar notificaciones creadas
		console.log("\n7. Verificando notificaciones en la base de datos...");
		const [notificaciones] = await connection.query(
			"SELECT * FROM notificaciones WHERE id_empresa = ? ORDER BY fecha_creacion DESC",
			[empresa.id_empresa],
		);

		console.log(`✓ Total de notificaciones: ${notificaciones.length}`);
		notificaciones.forEach((n, i) => {
			console.log(`\n  Notificación ${i + 1}:`);
			console.log(`  - Tipo: ${n.tipo}`);
			console.log(`  - Título: ${n.titulo}`);
			console.log(`  - Mensaje: ${n.mensaje}`);
			console.log(`  - Leída: ${n.leida ? "Sí" : "No"}`);
			console.log(`  - Fecha: ${n.fecha_creacion}`);
		});

		console.log("\n" + "=".repeat(60));
		console.log("✓ PROCESO COMPLETADO EXITOSAMENTE");
		console.log("=".repeat(60));
		console.log("\nAhora puedes:");
		console.log("1. Ir a la sección de Notificaciones en el frontend");
		console.log("2. Deberías ver 2 notificaciones nuevas");
		console.log(
			"3. Verificar que el producto sin stock NO aparece en el portal",
		);
		console.log(
			"4. Verificar que el producto con stock bajo SÍ aparece en el portal",
		);
		console.log("\n");
	} catch (error) {
		console.error("\n✗ Error:", error.message);
		throw error;
	} finally {
		await connection.end();
	}
}

// Ejecutar
crearProductoPrueba().catch((error) => {
	console.error("Error fatal:", error);
	process.exit(1);
});
