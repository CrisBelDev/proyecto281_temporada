const mysql = require("mysql2/promise");
require("dotenv").config();

async function verificarBD() {
	try {
		// Conectar SIN especificar base de datos
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST || "localhost",
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER || "root",
			password: process.env.DB_PASSWORD || "",
		});

		console.log("✓ Conexión a MySQL exitosa\n");

		// Listar todas las bases de datos
		const [databases] = await connection.query("SHOW DATABASES");
		console.log("📋 Bases de datos disponibles:");
		databases.forEach((db) => {
			const dbName = db.Database || db.database || Object.values(db)[0];
			console.log(`   - ${dbName}`);
		});

		console.log('\n🔍 Buscando bases de datos con "inventario" o "saas":');
		const dbsConInventario = databases.filter((db) => {
			const dbName = (
				db.Database ||
				db.database ||
				Object.values(db)[0]
			).toLowerCase();
			return dbName.includes("inventario") || dbName.includes("saas");
		});

		if (dbsConInventario.length > 0) {
			console.log("   ✓ Encontradas:");
			dbsConInventario.forEach((db) => {
				const dbName = db.Database || db.database || Object.values(db)[0];
				console.log(`     - ${dbName}`);
			});
		} else {
			console.log("   ❌ No se encontró ninguna base de datos");
			console.log("\n💡 Sugerencia: Crea la base de datos con:");
			console.log("   CREATE DATABASE inventario_saas;");
		}

		console.log(`\n📝 Tu archivo .env está configurado con:`);
		console.log(`   DB_NAME=${process.env.DB_NAME}`);

		await connection.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		if (error.code === "ECONNREFUSED") {
			console.log("\n💡 MySQL no está corriendo. Inicialo con:");
			console.log("   - XAMPP: Inicia Apache y MySQL");
			console.log("   - WAMP: Inicia los servicios");
			console.log("   - Servicio Windows: net start MySQL");
		}
	}
}

verificarBD();
