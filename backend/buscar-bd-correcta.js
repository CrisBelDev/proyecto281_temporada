require("dotenv").config();
const mysql = require("mysql2/promise");

async function buscarBDCorrecta() {
	try {
		console.log("🔍 Buscando la base de datos correcta...\n");

		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		// Listar todas las BD
		const [databases] = await conexion.query("SHOW DATABASES");

		console.log("🔎 Buscando BD con tablas de inventario...\n");

		for (const dbRow of databases) {
			const dbName = Object.values(dbRow)[0];

			try {
				await conexion.query(`USE \`${dbName}\``);
				const [tables] = await conexion.query("SHOW TABLES");

				// Buscar tablas características del sistema
				const tableNames = tables.map((t) => Object.values(t)[0]);
				const hasEmpresas = tableNames.includes("empresas");
				const hasProductos = tableNames.includes("productos");
				const hasVentas = tableNames.includes("ventas");

				if (hasEmpresas && hasProductos) {
					console.log(`✨ ¡ENCONTRADA! Base de datos: ${dbName}`);

					const [empresas] = await conexion.query(
						"SELECT id_empresa, nombre, slug FROM empresas LIMIT 5",
					);
					console.log("\n   Empresas:");
					console.table(empresas);

					const [productos] = await conexion.query(
						"SELECT COUNT(*) as total FROM productos",
					);
					console.log(`\n   Total productos: ${productos[0].total}`);

					console.log(`\n✅ La base de datos correcta es: ${dbName}`);
					console.log(`\n📝 Actualiza tu .env con:`);
					console.log(`   DB_NAME=${dbName}`);

					break;
				}
			} catch (err) {
				// Ignorar errores de acceso
			}
		}

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

buscarBDCorrecta();
