/**
 * Script para verificar usuarios SUPERUSER
 * Ejecutar con: node verificar-superuser.js
 */

require("dotenv").config();
const sequelize = require("./src/config/database");

const verificarSuperuser = async () => {
	try {
		console.log("🔍 Verificando usuarios SUPERUSER...\n");

		await sequelize.authenticate();
		console.log("✓ Conexión establecida\n");

		// Consulta SQL directa
		const [results] = await sequelize.query(`
			SELECT 
				u.id_usuario,
				u.nombre,
				u.apellido,
				u.email,
				u.activo,
				u.email_verificado,
				r.nombre as rol,
				r.id_rol,
				e.nombre as empresa,
				e.id_empresa
			FROM usuarios u
			JOIN roles r ON u.id_rol = r.id_rol
			JOIN empresas e ON u.id_empresa = e.id_empresa
			WHERE r.nombre = 'SUPERUSER'
			ORDER BY u.id_usuario;
		`);

		if (results.length === 0) {
			console.log("⚠️  No se encontraron usuarios SUPERUSER");
			console.log("\nEjecuta: node crear-superuser.js para crear uno\n");
		} else {
			console.log(`✅ Encontrados ${results.length} usuario(s) SUPERUSER:\n`);
			console.log("================================");

			results.forEach((user, index) => {
				console.log(`\n${index + 1}. Usuario SUPERUSER:`);
				console.log(`   ID:              ${user.id_usuario}`);
				console.log(`   Nombre:          ${user.nombre} ${user.apellido}`);
				console.log(`   Email:           ${user.email}`);
				console.log(`   Rol:             ${user.rol} (ID: ${user.id_rol})`);
				console.log(
					`   Empresa:         ${user.empresa} (ID: ${user.id_empresa})`,
				);
				console.log(`   Activo:          ${user.activo ? "✓ Sí" : "✗ No"}`);
				console.log(
					`   Email Verificado: ${user.email_verificado ? "✓ Sí" : "✗ No"}`,
				);
			});

			console.log("\n================================");

			if (results.some((u) => u.email === "superadmin@sistema.com")) {
				console.log("\n📋 CREDENCIALES POR DEFECTO:");
				console.log("   Email:    superadmin@sistema.com");
				console.log("   Password: SuperAdmin@2026");
			}
		}

		console.log("\n✅ Verificación completada\n");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		process.exit(1);
	}
};

verificarSuperuser();
