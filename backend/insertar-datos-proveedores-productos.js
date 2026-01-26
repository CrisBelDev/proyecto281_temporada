const sequelize = require("./src/config/database");
require("dotenv").config();

const insertarDatosPrueba = async () => {
	try {
		await sequelize.authenticate();
		console.log("✓ Conectado a la base de datos");

		// Primero, obtenemos algunos proveedores y productos existentes
		const [proveedores] = await sequelize.query(`
			SELECT id_proveedor, id_empresa, nombre FROM proveedores ORDER BY id_proveedor LIMIT 5;
		`);

		const [productos] = await sequelize.query(`
			SELECT id_producto, id_empresa, codigo, nombre FROM productos ORDER BY id_producto LIMIT 10;
		`);

		console.log("\n📦 Proveedores encontrados:", proveedores.length);
		console.log("📦 Productos encontrados:", productos.length);

		if (proveedores.length === 0) {
			console.log(
				"\n⚠️ No hay proveedores registrados. Por favor crea proveedores primero.",
			);
			return;
		}

		if (productos.length === 0) {
			console.log(
				"\n⚠️ No hay productos registrados. Por favor crea productos primero.",
			);
			return;
		}

		console.log("\n📋 Proveedores disponibles:");
		proveedores.forEach((p) => {
			console.log(
				`  - ID: ${p.id_proveedor}, Empresa: ${p.id_empresa}, Nombre: ${p.nombre}`,
			);
		});

		console.log("\n📋 Productos disponibles:");
		productos.forEach((p) => {
			console.log(
				`  - ID: ${p.id_producto}, Empresa: ${p.id_empresa}, Código: ${p.codigo}, Nombre: ${p.nombre}`,
			);
		});

		// Insertar relaciones de prueba
		let insertados = 0;

		for (const proveedor of proveedores) {
			// Filtrar productos de la misma empresa
			const productosEmpresa = productos.filter(
				(p) => p.id_empresa === proveedor.id_empresa,
			);

			if (productosEmpresa.length === 0) {
				console.log(
					`\n⚠️ No hay productos para la empresa ${proveedor.id_empresa} del proveedor ${proveedor.nombre}`,
				);
				continue;
			}

			// Asignar 2-3 productos aleatorios a cada proveedor
			const cantidadProductos = Math.min(3, productosEmpresa.length);

			for (let i = 0; i < cantidadProductos; i++) {
				const producto = productosEmpresa[i];
				const precioCompra = (Math.random() * 50 + 10).toFixed(2); // Precio entre 10 y 60

				try {
					// Para MariaDB/MySQL usamos INSERT ... ON DUPLICATE KEY UPDATE
					await sequelize.query(
						`
						INSERT INTO proveedores_productos (id_proveedor, id_producto, precio_compra_habitual, activo)
						VALUES (?, ?, ?, ?)
						ON DUPLICATE KEY UPDATE 
							precio_compra_habitual = VALUES(precio_compra_habitual),
							activo = VALUES(activo);
					`,
						{
							replacements: [
								proveedor.id_proveedor,
								producto.id_producto,
								precioCompra,
								true,
							],
						},
					);

					console.log(
						`✓ Asignado: ${proveedor.nombre} → ${producto.nombre} (Precio: $${precioCompra})`,
					);
					insertados++;
				} catch (error) {
					console.error(
						`✗ Error al asignar producto ${producto.nombre} al proveedor ${proveedor.nombre}:`,
						error.message,
					);
				}
			}
		}

		console.log(
			`\n✅ Se insertaron/actualizaron ${insertados} relaciones proveedor-producto`,
		);

		// Mostrar resumen
		const [resultado] = await sequelize.query(`
			SELECT 
				pp.id_proveedor_producto,
				p.nombre as proveedor_nombre,
				prod.codigo,
				prod.nombre as producto_nombre,
				pp.precio_compra_habitual,
				pp.activo
			FROM proveedores_productos pp
			JOIN proveedores p ON pp.id_proveedor = p.id_proveedor
			JOIN productos prod ON pp.id_producto = prod.id_producto
			ORDER BY p.nombre, prod.nombre;
		`);

		console.log("\n📊 Relaciones registradas en la base de datos:");
		console.log(
			"┌────────────────────────────────────────────────────────────────────┐",
		);
		resultado.forEach((r) => {
			console.log(
				`│ ${r.proveedor_nombre.padEnd(20)} → ${r.codigo.padEnd(10)} ${r.producto_nombre.padEnd(20)} $${parseFloat(r.precio_compra_habitual).toFixed(2).padStart(8)} │`,
			);
		});
		console.log(
			"└────────────────────────────────────────────────────────────────────┘",
		);
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await sequelize.close();
		process.exit(0);
	}
};

insertarDatosPrueba();
