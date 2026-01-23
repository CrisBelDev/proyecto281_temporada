require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function actualizarPasswordSuperuser() {
	let conexion;

	try {
		console.log("🔐 Actualizando contraseña del SUPERUSER...\n");

		// Conectar a la BD
		conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		});

		console.log("✅ Conexión a la BD establecida\n");

		// Hashear la nueva contraseña
		const nuevaPassword = "12345678";
		const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

		// Actualizar la contraseña
		const [result] = await conexion.query(
			"UPDATE usuarios SET password = ? WHERE email = ?",
			[hashedPassword, "superadmin@sistema.com"],
		);

		if (result.affectedRows > 0) {
			console.log("✅ Contraseña actualizada exitosamente\n");
			console.log("📋 Credenciales del SUPERUSER:");
			console.log("   Email:    superadmin@sistema.com");
			console.log("   Password: 12345678\n");
			console.log(
				"⚠️  IMPORTANTE: Cambiar esta contraseña después del primer login\n",
			);
		} else {
			console.log(
				"⚠️  No se encontró el usuario con email: superadmin@sistema.com",
			);
			console.log("   Verifica que el usuario existe en la tabla usuarios\n");
		}

		await conexion.end();
		console.log("✅ Proceso completado");
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		if (error.code === "ECONNREFUSED") {
			console.error(
				"   No se pudo conectar a la BD. Verifica que MySQL esté corriendo.",
			);
		} else if (error.code === "ER_ACCESS_DENIED_ERROR") {
			console.error(
				"   Acceso denegado. Verifica usuario y contraseña en .env",
			);
		}
		process.exit(1);
	}
}

actualizarPasswordSuperuser();
