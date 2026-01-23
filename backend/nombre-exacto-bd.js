require("dotenv").config();
const mysql = require("mysql2/promise");

async function mostrarNombreExacto() {
	try {
		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		const [databases] = await conexion.query("SHOW DATABASES");

		console.log("📋 Bases de datos (con longitud exacta):\n");

		for (const dbRow of databases) {
			const dbName = Object.values(dbRow)[0];
			if (
				dbName.toLowerCase().includes("saas") ||
				dbName.toLowerCase().includes("inventario")
			) {
				console.log(`Nombre: "${dbName}"`);
				console.log(`Longitud: ${dbName.length} caracteres`);
				console.log(
					`Bytes: [${Array.from(dbName)
						.map((c) => c.charCodeAt(0))
						.join(", ")}]`,
				);

				// Intentar conectar
				try {
					const test = await mysql.createConnection({
						host: process.env.DB_HOST,
						port: process.env.DB_PORT || 3306,
						user: process.env.DB_USER,
						password: process.env.DB_PASSWORD,
						database: dbName,
					});

					const [empresas] = await test.query(
						"SELECT nombre FROM empresas LIMIT 1",
					);
					console.log(
						`✅ Conexión exitosa - Primera empresa: ${empresas[0]?.nombre}`,
					);
					await test.end();

					console.log(`\n✅ ESTE ES EL NOMBRE CORRECTO PARA .env:`);
					console.log(`DB_NAME=${dbName}`);
				} catch (err) {
					console.log(`❌ Error al conectar: ${err.message}`);
				}

				console.log("---");
			}
		}

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

mostrarNombreExacto();
