const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function probarContrasenas() {
	let conexion;

	try {
		console.log("🔐 Probando contraseñas contra el hash en la BD...\n");

		conexion = await mysql.createConnection({
			host: "localhost",
			port: 3306,
			user: "root",
			password: "",
			database: "\tsaas_inventario",
		});

		// Obtener el hash actual
		const [users] = await conexion.query(
			"SELECT password FROM usuarios WHERE email = ?",
			["superadmin@sistema.com"],
		);

		if (users.length === 0) {
			console.log("❌ No se encontró el usuario");
			return;
		}

		const hashEnBD = users[0].password;
		console.log("Hash en BD:", hashEnBD.substring(0, 30) + "...\n");

		// Probar contraseñas
		const contrasenas = ["12345678", "SuperAdmin@2026"];

		for (const pass of contrasenas) {
			const coincide = await bcrypt.compare(pass, hashEnBD);
			const icono = coincide ? "✅" : "❌";
			console.log(
				`${icono} Contraseña "${pass}": ${coincide ? "FUNCIONA" : "NO funciona"}`,
			);
		}

		console.log("\n");

		// Generar un nuevo hash de 12345678 para comparar
		console.log('🔧 Generando nuevo hash de "12345678"...');
		const nuevoHash = await bcrypt.hash("12345678", 10);
		console.log("Nuevo hash generado:", nuevoHash.substring(0, 30) + "...\n");

		// Actualizar con el nuevo hash
		console.log("⏳ Actualizando contraseña en la BD...");
		await conexion.query("UPDATE usuarios SET password = ? WHERE email = ?", [
			nuevoHash,
			"superadmin@sistema.com",
		]);

		console.log("✅ Contraseña actualizada\n");

		// Verificar de nuevo
		const [usersNew] = await conexion.query(
			"SELECT password FROM usuarios WHERE email = ?",
			["superadmin@sistema.com"],
		);

		const nuevoHashBD = usersNew[0].password;
		const verificacion = await bcrypt.compare("12345678", nuevoHashBD);

		console.log("═══════════════════════════════════════════");
		console.log("VERIFICACIÓN FINAL:");
		console.log(
			`Contraseña "12345678" ${verificacion ? "✅ FUNCIONA" : "❌ NO funciona"}`,
		);
		console.log("═══════════════════════════════════════════\n");

		if (verificacion) {
			console.log("✅ Ahora puedes iniciar sesión con:");
			console.log("   Email:    superadmin@sistema.com");
			console.log("   Password: 12345678\n");
		}

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

probarContrasenas();
