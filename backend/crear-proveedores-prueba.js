const sequelize = require("./src/config/database");
require("dotenv").config();

const crearProveedoresPrueba = async () => {
	try {
		await sequelize.authenticate();
		console.log("✓ Conectado a la base de datos");

		// Obtener empresas existentes
		const [empresas] = await sequelize.query(`
			SELECT id_empresa, nombre FROM empresas ORDER BY id_empresa;
		`);

		if (empresas.length === 0) {
			console.log("⚠️ No hay empresas registradas");
			return;
		}

		console.log(`\n📋 Empresas disponibles: ${empresas.length}`);
		empresas.forEach((e) =>
			console.log(`  - ID: ${e.id_empresa}, Nombre: ${e.nombre}`),
		);

		// Proveedores de prueba
		const proveedoresPrueba = [
			{
				nombre: "Distribuidora La Económica",
				nit: "1234567890-1",
				email: "ventas@laeconomica.com",
				telefono: "555-1234",
				direccion: "Av. Principal #123, Zona Industrial",
				contacto_nombre: "María González",
				contacto_telefono: "555-1235",
				datos_pago: JSON.stringify({
					banco: "Banco Nacional",
					tipo_cuenta: "CORRIENTE",
					cuenta: "1234567890",
				}),
				observaciones: "Proveedor confiable, entregas puntuales",
			},
			{
				nombre: "Alimentos del Valle S.A.",
				nit: "9876543210-2",
				email: "contacto@alimentosvalle.com",
				telefono: "555-5678",
				direccion: "Carrera 50 #25-30, Centro",
				contacto_nombre: "Carlos Ramírez",
				contacto_telefono: "555-5679",
				datos_pago: JSON.stringify({
					banco: "Banco Popular",
					tipo_cuenta: "AHORROS",
					cuenta: "9876543210",
				}),
				observaciones: "Especialistas en productos refrigerados",
			},
			{
				nombre: "Bebidas y Refrescos Ltda.",
				nit: "5555444433-3",
				email: "pedidos@bebidasrefrescos.com",
				telefono: "555-9999",
				direccion: "Calle 80 #45-67, Norte",
				contacto_nombre: "Ana Martínez",
				contacto_telefono: "555-9998",
				datos_pago: JSON.stringify({
					banco: "Banco de Bogotá",
					tipo_cuenta: "CORRIENTE",
					cuenta: "5555444433",
				}),
				observaciones: "Distribuidor autorizado Coca-Cola",
			},
			{
				nombre: "Textiles y Confecciones",
				nit: "7777888899-4",
				email: "info@textiles.com",
				telefono: "555-3333",
				direccion: "Zona Franca Lote 15",
				contacto_nombre: "Luis Pérez",
				contacto_telefono: "555-3334",
				datos_pago: JSON.stringify({
					banco: "Bancolombia",
					tipo_cuenta: "AHORROS",
					cuenta: "7777888899",
				}),
				observaciones: "Importadores directos, buenos precios",
			},
		];

		let insertados = 0;

		for (const empresa of empresas) {
			// Insertar 1-2 proveedores por empresa
			const cantidadProveedores = Math.min(
				2,
				proveedoresPrueba.length - insertados,
			);

			for (
				let i = 0;
				i < cantidadProveedores && insertados < proveedoresPrueba.length;
				i++
			) {
				const prov = proveedoresPrueba[insertados];

				try {
					await sequelize.query(
						`
						INSERT INTO proveedores 
						(id_empresa, nombre, nit, email, telefono, direccion, contacto_nombre, contacto_telefono, datos_pago, observaciones, activo)
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					`,
						{
							replacements: [
								empresa.id_empresa,
								prov.nombre,
								prov.nit,
								prov.email,
								prov.telefono,
								prov.direccion,
								prov.contacto_nombre,
								prov.contacto_telefono,
								prov.datos_pago,
								prov.observaciones,
								true,
							],
						},
					);

					console.log(
						`✓ Creado: ${prov.nombre} para empresa ${empresa.nombre}`,
					);
					insertados++;
				} catch (error) {
					console.error(`✗ Error al crear ${prov.nombre}:`, error.message);
				}
			}
		}

		console.log(`\n✅ Se crearon ${insertados} proveedores de prueba`);

		// Mostrar resumen
		const [resultado] = await sequelize.query(`
			SELECT 
				p.id_proveedor,
				p.nombre,
				p.nit,
				e.nombre as empresa_nombre,
				p.contacto_nombre,
				p.telefono
			FROM proveedores p
			JOIN empresas e ON p.id_empresa = e.id_empresa
			ORDER BY e.nombre, p.nombre;
		`);

		console.log("\n📊 Proveedores registrados:");
		console.log(
			"┌──────────────────────────────────────────────────────────────────────┐",
		);
		resultado.forEach((r) => {
			console.log(
				`│ ${r.nombre.padEnd(30)} | ${r.empresa_nombre.padEnd(20)} | ${r.telefono || "N/A"} │`,
			);
		});
		console.log(
			"└──────────────────────────────────────────────────────────────────────┘",
		);
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await sequelize.close();
		process.exit(0);
	}
};

crearProveedoresPrueba();
