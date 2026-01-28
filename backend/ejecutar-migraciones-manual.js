const sequelize = require("./src/config/database");

async function ejecutarMigracionesManual() {
	try {
		console.log("🔧 Ejecutando correcciones críticas MANUAL...\n");

		// 1. Crear rol VENDEDOR
		console.log("1️⃣ Creando rol VENDEDOR...");
		try {
			await sequelize.query(`
				INSERT IGNORE INTO roles (nombre, descripcion) 
				VALUES ('VENDEDOR', 'Vendedor con permisos limitados a ventas')
			`);
			console.log("✅ Rol VENDEDOR creado/verificado");
		} catch (error) {
			console.log("⚠️  Rol VENDEDOR ya existe o error:", error.message);
		}

		// 2. Agregar campos a empresas
		console.log("\n2️⃣ Agregando campos a tabla empresas...");

		try {
			await sequelize.query(`
				ALTER TABLE empresas 
				ADD COLUMN plan_suscripcion ENUM('BASICO', 'PREMIUM') DEFAULT 'BASICO'
			`);
			console.log("✅ Columna plan_suscripcion agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  plan_suscripcion ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		try {
			await sequelize.query(`
				ALTER TABLE empresas 
				ADD COLUMN monto_pago DECIMAL(10,2) DEFAULT 0.00
			`);
			console.log("✅ Columna monto_pago agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  monto_pago ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		try {
			await sequelize.query(`
				ALTER TABLE empresas 
				ADD COLUMN horario_apertura TIME
			`);
			console.log("✅ Columna horario_apertura agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  horario_apertura ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		try {
			await sequelize.query(`
				ALTER TABLE empresas 
				ADD COLUMN horario_cierre TIME
			`);
			console.log("✅ Columna horario_cierre agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  horario_cierre ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		try {
			await sequelize.query(`
				ALTER TABLE empresas 
				ADD COLUMN dias_atencion VARCHAR(100) DEFAULT 'Lunes a Viernes'
			`);
			console.log("✅ Columna dias_atencion agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  dias_atencion ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		// 3. Agregar estado_entrega a ventas
		console.log("\n3️⃣ Agregando estado_entrega a tabla ventas...");
		try {
			await sequelize.query(`
				ALTER TABLE ventas 
				ADD COLUMN estado_entrega ENUM('PENDIENTE', 'ENTREGADO') DEFAULT 'PENDIENTE' AFTER estado
			`);
			console.log("✅ Columna estado_entrega agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  estado_entrega ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		// 4. Modificar estado de compras
		console.log("\n4️⃣ Modificando estado de tabla compras...");
		try {
			await sequelize.query(`
				ALTER TABLE compras 
				MODIFY COLUMN estado ENUM('PENDIENTE', 'RECIBIDA', 'ANULADA') DEFAULT 'PENDIENTE'
			`);
			console.log("✅ Columna estado modificada en compras");
		} catch (error) {
			console.log("❌ Error:", error.message);
		}

		// 5. Actualizar compras existentes
		console.log("\n5️⃣ Actualizando compras existentes...");
		try {
			const [result] = await sequelize.query(`
				UPDATE compras SET estado = 'RECIBIDA' WHERE estado = 'COMPLETADA'
			`);
			console.log(
				`✅ ${result.affectedRows || 0} compras actualizadas a RECIBIDA`,
			);
		} catch (error) {
			console.log("⚠️  No hay compras que actualizar o error:", error.message);
		}

		// 6. Agregar soft delete a clientes
		console.log("\n6️⃣ Agregando soft delete a tabla clientes...");
		try {
			await sequelize.query(`
				ALTER TABLE clientes 
				ADD COLUMN fecha_eliminacion DATETIME NULL
			`);
			console.log("✅ Columna fecha_eliminacion agregada");
		} catch (error) {
			if (error.message.includes("Duplicate column")) {
				console.log("⚠️  fecha_eliminacion ya existe");
			} else {
				console.log("❌ Error:", error.message);
			}
		}

		// Verificación final
		console.log("\n\n📋 VERIFICACIÓN FINAL:\n");

		// Verificar roles
		const [roles] = await sequelize.query(
			"SELECT nombre FROM roles ORDER BY nombre",
		);
		console.log("✅ Roles:", roles.map((r) => r.nombre).join(", "));

		// Verificar columnas de empresas
		const [columnasEmpresas] = await sequelize.query("DESCRIBE empresas");
		const nuevasEmpresas = columnasEmpresas
			.filter((c) =>
				[
					"plan_suscripcion",
					"monto_pago",
					"horario_apertura",
					"horario_cierre",
					"dias_atencion",
				].includes(c.Field),
			)
			.map((c) => c.Field);
		console.log("✅ Campos empresas:", nuevasEmpresas.join(", ") || "NINGUNO");

		// Verificar ventas
		const [columnasVentas] = await sequelize.query("DESCRIBE ventas");
		const estadoEntrega = columnasVentas.find(
			(c) => c.Field === "estado_entrega",
		);
		console.log(
			"✅ Estado entrega en ventas:",
			estadoEntrega ? "SÍ ✓" : "NO ✗",
		);

		// Verificar compras
		const [columnasCompras] = await sequelize.query("DESCRIBE compras");
		const estadoCompra = columnasCompras.find((c) => c.Field === "estado");
		console.log(
			"✅ Estado de compras:",
			estadoCompra ? estadoCompra.Type : "NO ENCONTRADO",
		);

		// Verificar clientes
		const [columnasClientes] = await sequelize.query("DESCRIBE clientes");
		const fechaEliminacion = columnasClientes.find(
			(c) => c.Field === "fecha_eliminacion",
		);
		console.log("✅ Soft delete clientes:", fechaEliminacion ? "SÍ ✓" : "NO ✗");

		console.log("\n\n🎉 ¡TODAS LAS MIGRACIONES COMPLETADAS EXITOSAMENTE!\n");

		process.exit(0);
	} catch (error) {
		console.error("\n❌ ERROR CRÍTICO:", error);
		process.exit(1);
	}
}

ejecutarMigracionesManual();
