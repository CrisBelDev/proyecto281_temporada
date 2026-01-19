require("dotenv").config();
const mysql = require("mysql2/promise");

async function verificarCampos() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "inventario_db",
	});

	try {
		console.log("=== VERIFICACIÓN DE CAMPOS EN TABLA USUARIOS ===\n");

		// Mostrar estructura de la tabla
		const [fields] = await connection.query("DESCRIBE usuarios");
		console.log("Campos en la tabla usuarios:");
		console.table(fields);

		// Contar usuarios
		const [count] = await connection.query(
			"SELECT COUNT(*) as total FROM usuarios",
		);
		console.log(`\nTotal de usuarios: ${count[0].total}`);

		// Mostrar últimos usuarios con sus tokens
		const [usuarios] = await connection.query(`
			SELECT 
				id_usuario, 
				email, 
				email_verificado,
				CASE 
					WHEN token_verificacion IS NULL THEN 'NULL'
					ELSE CONCAT(LEFT(token_verificacion, 20), '... (', LENGTH(token_verificacion), ' chars)')
				END as token_verificacion,
				token_verificacion_expira,
				CASE 
					WHEN token_recuperacion IS NULL THEN 'NULL'
					ELSE CONCAT(LEFT(token_recuperacion, 20), '... (', LENGTH(token_recuperacion), ' chars)')
				END as token_recuperacion
			FROM usuarios 
			ORDER BY id_usuario DESC 
			LIMIT 5
		`);

		console.log("\nÚltimos 5 usuarios:");
		console.table(usuarios);
	} catch (error) {
		console.error("Error:", error.message);
	} finally {
		await connection.end();
	}
}

verificarCampos();
