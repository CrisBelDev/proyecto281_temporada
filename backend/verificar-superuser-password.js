const mysql = require("mysql2/promise");

async function verificarUsuariosSuperuser() {
	let conexion;

	try {
		console.log("🔍 Verificando usuarios SUPERUSER en la BD...\n");

		conexion = await mysql.createConnection({
			host: "localhost",
			port: 3306,
			user: "root",
			password: "",
			database: "\tsaas_inventario",
		});

		console.log("✅ Conexión establecida\n");

		// Buscar todos los usuarios con rol SUPERUSER
		const [usuarios] = await conexion.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        u.password,
        r.nombre as rol,
        u.activo,
        u.email_verificado
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      WHERE r.nombre = 'SUPERUSER'
      ORDER BY u.id_usuario
    `);

		console.log(
			`📊 Total de usuarios SUPERUSER encontrados: ${usuarios.length}\n`,
		);

		if (usuarios.length === 0) {
			console.log("⚠️  No se encontraron usuarios con rol SUPERUSER");
		} else {
			usuarios.forEach((user, index) => {
				console.log(`${index + 1}. Usuario SUPERUSER:`);
				console.log(`   ID:       ${user.id_usuario}`);
				console.log(`   Nombre:   ${user.nombre} ${user.apellido}`);
				console.log(`   Email:    ${user.email}`);
				console.log(`   Password: ${user.password.substring(0, 20)}... (hash)`);
				console.log(`   Activo:   ${user.activo ? "Sí" : "No"}`);
				console.log(`   Verificado: ${user.email_verificado ? "Sí" : "No"}`);
				console.log("");
			});
		}

		// Verificar si hay usuarios con el email específico
		const [userEmail] = await conexion.query(
			"SELECT * FROM usuarios WHERE email = ?",
			["superadmin@sistema.com"],
		);

		if (userEmail.length > 0) {
			console.log("═══════════════════════════════════════════");
			console.log("📧 Usuario con email superadmin@sistema.com:");
			console.log(`   ID:       ${userEmail[0].id_usuario}`);
			console.log(`   Password: ${userEmail[0].password}`);
			console.log(`   Rol ID:   ${userEmail[0].id_rol}`);
			console.log("═══════════════════════════════════════════\n");
		}

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

verificarUsuariosSuperuser();
