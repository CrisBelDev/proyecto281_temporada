const bcrypt = require("bcrypt");
const sequelize = require("./src/config/database");

async function actualizarPasswordSuperuser() {
	try {
		console.log("🔐 Actualizando contraseña del SUPERUSER...\n");

		const nuevaPassword = "12345678";
		const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

		const [result] = await sequelize.query(
			`
      UPDATE usuarios 
      SET password = :hashedPassword
      WHERE email = 'superadmin@sistema.com'
    `,
			{
				replacements: { hashedPassword },
			},
		);

		if (result.affectedRows > 0) {
			console.log("✅ Contraseña actualizada exitosamente\n");
			console.log("📋 Nuevas credenciales:");
			console.log("   Email:    superadmin@sistema.com");
			console.log("   Password: 12345678\n");
			console.log(
				"⚠️  IMPORTANTE: Cambiar esta contraseña después del primer login\n",
			);
		} else {
			console.log("⚠️  No se encontró el usuario SUPERUSER");
			console.log(
				"   El usuario se creará automáticamente cuando reinicies el servidor\n",
			);
		}

		await sequelize.close();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

actualizarPasswordSuperuser();
