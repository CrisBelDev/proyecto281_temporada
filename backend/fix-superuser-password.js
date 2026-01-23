const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function actualizarPasswordSuperuser() {
	let conexion;

	try {
		console.log("🔐 Actualizando contraseña del SUPERUSER...\n");

		// Conectar a la BD (ajusta estos valores si son diferentes)
		conexion = await mysql.createConnection({
			host: "localhost",
			port: 3306,
			user: "root",
			password: "", // Sin contraseña
			database: "\tsaas_inventario", // Con el tab que tiene la BD
		});

		console.log("✅ Conexión a la BD establecida\n");

		// Hashear la nueva contraseña
		const nuevaPassword = "12345678";
		console.log("⏳ Hasheando nueva contraseña...");
		const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

		// Actualizar la contraseña
		console.log("⏳ Actualizando en la base de datos...");
		const [result] = await conexion.query(
			"UPDATE usuarios SET password = ? WHERE email = ?",
			[hashedPassword, "superadmin@sistema.com"],
		);

		console.log(`   Filas afectadas: ${result.affectedRows}\n`);

		if (result.affectedRows > 0) {
			console.log("✅ Contraseña actualizada exitosamente\n");
			console.log("═══════════════════════════════════════════");
			console.log("📋 CREDENCIALES DEL SUPERUSER:");
			console.log("   Email:    superadmin@sistema.com");
			console.log("   Password: 12345678");
			console.log("═══════════════════════════════════════════\n");
			console.log(
				"⚠️  IMPORTANTE: Cambia esta contraseña después del primer login\n",
			);
		} else {
			console.log(
				"⚠️  No se encontró el usuario con email: superadmin@sistema.com",
			);

			// Verificar si existe algún usuario
			const [usuarios] = await conexion.query(
				"SELECT id_usuario, email, nombre FROM usuarios LIMIT 5",
			);

			console.log("\n📋 Usuarios encontrados en la BD:");
			console.table(usuarios);
		}

		await conexion.end();
		console.log("✅ Proceso completado\n");
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		console.error("Código:", error.code);

		if (error.code === "ECONNREFUSED") {
			console.error("\n💡 Solución: Verifica que MySQL esté corriendo");
		} else if (error.code === "ER_ACCESS_DENIED_ERROR") {
			console.error("\n💡 Solución: Verifica usuario y contraseña de MySQL");
		} else if (error.code === "ER_BAD_DB_ERROR") {
			console.error(
				"\n💡 Solución: La base de datos no existe o el nombre es incorrecto",
			);
			console.error(
				"   Intenta conectarte manualmente a MySQL y verifica el nombre exacto",
			);
		}

		process.exit(1);
	}
}

actualizarPasswordSuperuser();
