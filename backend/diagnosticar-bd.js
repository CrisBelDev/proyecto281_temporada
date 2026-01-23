require("dotenv").config();
const mysql = require("mysql2/promise");

async function diagnosticarBD() {
	try {
		console.log("🔍 Diagnosticando base de datos...\n");

		// Intentar conectar a la BD especificada
		console.log(`Intentando conectar a: ${process.env.DB_NAME}`);
		console.log(`Host: ${process.env.DB_HOST}`);
		console.log(`Usuario: ${process.env.DB_USER}`);
		console.log(`Password: ${process.env.DB_PASSWORD ? "***" : "(vacío)"}\n`);

		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		});

		console.log("✅ Conexión exitosa a la base de datos\n");

		// Verificar tablas
		const [tablas] = await conexion.query("SHOW TABLES");

		console.log(`📋 Tablas en ${process.env.DB_NAME}:`);
		if (tablas.length === 0) {
			console.log("   ⚠️  No hay tablas en esta base de datos");
		} else {
			tablas.forEach((tabla, index) => {
				const tableName = Object.values(tabla)[0];
				console.log(`   ${index + 1}. ${tableName}`);
			});
		}

		// Verificar datos de empresas
		const [empresas] = await conexion.query(
			"SELECT COUNT(*) as total FROM empresas",
		);
		console.log(`\n📊 Empresas: ${empresas[0].total}`);

		const [productos] = await conexion.query(
			"SELECT COUNT(*) as total FROM productos",
		);
		console.log(`📦 Productos: ${productos[0].total}`);

		await conexion.end();
		console.log("\n✅ Todo parece estar bien con la BD");
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		console.error("Código de error:", error.code);

		if (error.code === "ER_BAD_DB_ERROR") {
			console.error("\n⚠️  La base de datos no existe o no es accesible");
			console.error("Revisa tu archivo .env");
		} else if (error.code === "ER_ACCESS_DENIED_ERROR") {
			console.error("\n⚠️  Usuario o contraseña incorrectos");
		}

		process.exit(1);
	}
}

diagnosticarBD();
