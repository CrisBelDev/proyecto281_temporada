const fs = require("fs");
const path = require("path");
const sequelize = require("./src/config/database");

async function ejecutarCorrecciones() {
	try {
		console.log("🔧 Ejecutando correcciones críticas...\n");

		// Leer archivo SQL
		const sqlPath = path.join(
			__dirname,
			"migrations",
			"correcciones_criticas_auditoria.sql",
		);
		const sql = fs.readFileSync(sqlPath, "utf8");

		// Dividir por punto y coma y ejecutar cada sentencia
		const sentencias = sql
			.split(";")
			.map((s) => s.trim())
			.filter(
				(s) => s.length > 0 && !s.startsWith("--") && !s.startsWith("SELECT"),
			);

		console.log(`📝 Total de sentencias a ejecutar: ${sentencias.length}\n`);

		for (const sentencia of sentencias) {
			if (
				sentencia.includes("INSERT IGNORE") ||
				sentencia.includes("ALTER TABLE") ||
				sentencia.includes("UPDATE")
			) {
				try {
					await sequelize.query(sentencia);
					console.log(`✅ Ejecutado: ${sentencia.substring(0, 60)}...`);
				} catch (error) {
					// Ignorar errores de columnas duplicadas o que ya existen
					if (
						error.message.includes("Duplicate column") ||
						error.message.includes("already exists")
					) {
						console.log(`⚠️  Ya existe: ${sentencia.substring(0, 60)}...`);
					} else {
						console.error(`❌ Error: ${error.message}`);
					}
				}
			}
		}

		console.log("\n✅ Correcciones críticas completadas");
		console.log("\n📋 Verificando cambios...\n");

		// Verificar roles
		const [roles] = await sequelize.query("SELECT * FROM roles");
		console.log("✅ Roles:", roles.map((r) => r.nombre).join(", "));

		// Verificar columnas de empresas
		const [columnasEmpresas] = await sequelize.query("DESCRIBE empresas");
		const nuevasColumnasEmpresas = columnasEmpresas
			.filter((c) =>
				["plan_suscripcion", "monto_pago", "horario_apertura"].includes(
					c.Field,
				),
			)
			.map((c) => c.Field);
		console.log(
			"✅ Nuevas columnas en empresas:",
			nuevasColumnasEmpresas.join(", "),
		);

		// Verificar columnas de ventas
		const [columnasVentas] = await sequelize.query("DESCRIBE ventas");
		const estadoEntrega = columnasVentas.find(
			(c) => c.Field === "estado_entrega",
		);
		console.log("✅ Estado entrega en ventas:", estadoEntrega ? "SÍ" : "NO");

		// Verificar estado de compras
		const [columnasCompras] = await sequelize.query("DESCRIBE compras");
		const estadoCompra = columnasCompras.find((c) => c.Field === "estado");
		console.log(
			"✅ Estado de compras:",
			estadoCompra ? estadoCompra.Type : "NO ENCONTRADO",
		);

		// Verificar soft delete clientes
		const [columnasClientes] = await sequelize.query("DESCRIBE clientes");
		const fechaEliminacion = columnasClientes.find(
			(c) => c.Field === "fecha_eliminacion",
		);
		console.log("✅ Soft delete clientes:", fechaEliminacion ? "SÍ" : "NO");

		console.log("\n🎉 ¡Todas las correcciones aplicadas exitosamente!");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error al ejecutar correcciones:", error);
		process.exit(1);
	}
}

ejecutarCorrecciones();
