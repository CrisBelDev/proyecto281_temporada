const sequelize = require("./src/config/database");
const Usuario = require("./src/models/Usuario");

async function verificarUsuario() {
	try {
		await sequelize.authenticate();
		console.log("Conexión a BD establecida\n");

		const superuser = await Usuario.findOne({
			where: { email: "superuser@sistema.com" },
		});

		if (superuser) {
			console.log("✓ Usuario encontrado:");
			console.log("  Email:", superuser.email);
			console.log("  Nombre:", superuser.nombre);
			console.log("  Rol:", superuser.rol);
			console.log("  Activo:", superuser.activo);
			console.log("\nIntenta hacer login con:");
			console.log("  Email: superuser@sistema.com");
			console.log("  Password: Admin123!");
		} else {
			console.log("✗ Usuario no encontrado");
		}

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

verificarUsuario();
