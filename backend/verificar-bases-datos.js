require("dotenv").config();
const mysql = require("mysql2/promise");

async function verificarBD() {
	try {
		console.log("🔍 Verificando bases de datos disponibles...\n");

		// Conectar sin especificar base de datos
		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		console.log("✅ Conexión MySQL exitosa\n");

		// Listar todas las bases de datos
		const [databases] = await conexion.query("SHOW DATABASES");

		console.log("📋 Bases de datos disponibles:");
		databases.forEach((db, index) => {
			const dbName = db.Database || db.database || Object.values(db)[0];
			console.log(`   ${index + 1}. ${dbName}`);
			if (
				dbName.toLowerCase().includes("inventario") ||
				dbName.toLowerCase().includes("saas") ||
				dbName.toLowerCase().includes("281")
			) {
				console.log("      ⭐ <- Posible BD correcta");
			}
		});

		console.log("\n🔧 Configuración actual en .env:");
		console.log(`   DB_NAME=${process.env.DB_NAME}`);

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

verificarBD();
