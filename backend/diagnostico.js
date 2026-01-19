const sequelize = require("./src/config/database");
const Usuario = require("./src/models/Usuario");

async function diagnostico() {
	try {
		console.log("=== DIAGNÓSTICO DE BASE DE DATOS ===\n");

		// Verificar conexión
		await sequelize.authenticate();
		console.log("✓ Conexión a base de datos exitosa\n");

		// Verificar estructura de la tabla
		const [results] = await sequelize.query("DESCRIBE usuarios");
		console.log("Estructura de la tabla 'usuarios':");
		console.table(results);

		// Verificar si hay usuarios
		const usuarios = await Usuario.findAll({
			attributes: [
				"id_usuario",
				"email",
				"email_verificado",
				"token_verificacion",
				"token_recuperacion",
			],
		});

		console.log("\nUsuarios en la base de datos:");
		usuarios.forEach((u) => {
			console.log(`\nID: ${u.id_usuario}`);
			console.log(`Email: ${u.email}`);
			console.log(`Email verificado: ${u.email_verificado}`);
			console.log(
				`Token verificación: ${u.token_verificacion ? u.token_verificacion.substring(0, 20) + "..." : "null"}`,
			);
			console.log(
				`Token recuperación: ${u.token_recuperacion ? u.token_recuperacion.substring(0, 20) + "..." : "null"}`,
			);
		});

		await sequelize.close();
		console.log("\n✓ Diagnóstico completado");
	} catch (error) {
		console.error("Error en diagnóstico:", error);
		process.exit(1);
	}
}

diagnostico();
