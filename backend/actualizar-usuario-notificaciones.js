/*
 * Script para actualizar el id_usuario en notificaciones existentes
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

async function actualizarNotificaciones() {
	console.log("=".repeat(60));
	console.log("ACTUALIZANDO ID_USUARIO EN NOTIFICACIONES");
	console.log("=".repeat(60));

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "saas_inventario",
	});

	try {
		// Obtener notificaciones sin usuario
		console.log("\n1. Verificando notificaciones sin usuario...");
		const [notifSinUsuario] = await connection.query(
			"SELECT * FROM notificaciones WHERE id_usuario IS NULL",
		);

		console.log(`Notificaciones sin usuario: ${notifSinUsuario.length}`);

		if (notifSinUsuario.length === 0) {
			console.log("✓ Todas las notificaciones tienen usuario asignado");
			return;
		}

		// Para cada notificación sin usuario, buscar un usuario de esa empresa
		console.log("\n2. Asignando usuarios a las notificaciones...");

		for (const notif of notifSinUsuario) {
			// Buscar un usuario de la empresa
			const [usuarios] = await connection.query(
				"SELECT id_usuario FROM usuarios WHERE id_empresa = ? LIMIT 1",
				[notif.id_empresa],
			);

			if (usuarios.length > 0) {
				const idUsuario = usuarios[0].id_usuario;

				// Actualizar la notificación
				await connection.query(
					"UPDATE notificaciones SET id_usuario = ? WHERE id_notificacion = ?",
					[idUsuario, notif.id_notificacion],
				);

				console.log(
					`  ✓ Notificación ${notif.id_notificacion} asignada al usuario ${idUsuario}`,
				);
			} else {
				console.log(
					`  ⚠ No se encontró usuario para la empresa ${notif.id_empresa}`,
				);
			}
		}

		// Verificar resultado
		console.log("\n3. Verificando resultado...");
		const [notificaciones] = await connection.query(`
			SELECT n.id_notificacion, n.tipo, n.titulo, n.id_usuario, n.id_empresa, u.nombre as usuario_nombre
			FROM notificaciones n
			LEFT JOIN usuarios u ON n.id_usuario = u.id_usuario
			ORDER BY n.fecha_creacion DESC
		`);

		console.log(`\nTotal de notificaciones: ${notificaciones.length}`);
		notificaciones.forEach((n) => {
			console.log(
				`  - ID: ${n.id_notificacion}, Tipo: ${n.tipo}, Usuario: ${n.usuario_nombre || "N/A"} (ID: ${n.id_usuario || "NULL"})`,
			);
		});

		console.log("\n" + "=".repeat(60));
		console.log("✓ ACTUALIZACIÓN COMPLETADA");
		console.log("=".repeat(60));
	} catch (error) {
		console.error("\n✗ Error:", error.message);
		throw error;
	} finally {
		await connection.end();
	}
}

// Ejecutar
actualizarNotificaciones().catch((error) => {
	console.error("Error fatal:", error);
	process.exit(1);
});
