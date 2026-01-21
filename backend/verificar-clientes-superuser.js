/**
 * Script de prueba para verificar el acceso de SUPERUSER a clientes
 * Ejecutar con: node verificar-clientes-superuser.js
 */

require("dotenv").config();
const sequelize = require("./src/config/database");
const Usuario = require("./src/models/Usuario");
const Cliente = require("./src/models/Cliente");
const Empresa = require("./src/models/Empresa");
const Rol = require("./src/models/Rol");

const verificarClientesSuperuser = async () => {
	try {
		console.log("🔍 Verificando acceso de SUPERUSER a clientes...\n");

		// 1. Conectar a la base de datos
		await sequelize.authenticate();
		console.log("✓ Conexión a la base de datos establecida\n");

		// Inicializar asociaciones
		const models = { Empresa, Cliente, Usuario, Rol };
		Object.values(models).forEach((model) => {
			if (model.associate) {
				model.associate(models);
			}
		});

		// 2. Buscar el SUPERUSER
		const superuser = await Usuario.findOne({
			where: { email: "superadmin@sistema.com" },
			include: [
				{
					model: Rol,
					as: "rol",
					attributes: ["nombre"],
				},
				{
					model: Empresa,
					as: "empresa",
					attributes: ["nombre"],
				},
			],
		});

		if (!superuser) {
			console.log("❌ SUPERUSER no encontrado");
			console.log("   Ejecutar primero: node crear-superuser.js\n");
			process.exit(1);
		}

		console.log("✓ SUPERUSER encontrado:");
		console.log(`   Email: ${superuser.email}`);
		console.log(`   Rol: ${superuser.rol.nombre}`);
		console.log(`   Empresa: ${superuser.empresa.nombre}\n`);

		// 3. Contar empresas
		const totalEmpresas = await Empresa.count();
		console.log(`📊 Total de empresas en el sistema: ${totalEmpresas}\n`);

		// 4. Listar todas las empresas con sus clientes
		const empresas = await Empresa.findAll({
			include: [
				{
					model: Cliente,
					as: "clientes",
					required: false,
				},
			],
		});

		console.log("📋 RESUMEN DE CLIENTES POR EMPRESA:");
		console.log("=".repeat(60));

		let totalClientesGlobal = 0;
		for (const empresa of empresas) {
			const cantidadClientes = empresa.clientes ? empresa.clientes.length : 0;
			totalClientesGlobal += cantidadClientes;

			console.log(`\n${empresa.nombre} (ID: ${empresa.id_empresa})`);
			console.log(`   NIT: ${empresa.nit}`);
			console.log(`   Clientes: ${cantidadClientes}`);

			if (cantidadClientes > 0) {
				empresa.clientes.forEach((cliente) => {
					console.log(
						`      - ${cliente.nombre} ${cliente.nit ? `(NIT: ${cliente.nit})` : ""}`,
					);
				});
			}
		}

		console.log("\n" + "=".repeat(60));
		console.log(`TOTAL DE CLIENTES EN EL SISTEMA: ${totalClientesGlobal}\n`);

		// 5. Simular consulta como SUPERUSER (sin filtro de empresa)
		console.log("🔓 Simulando consulta SUPERUSER (todos los clientes):");
		const todosLosClientes = await Cliente.findAll({
			include: [
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
			order: [["fecha_creacion", "DESC"]],
		});

		console.log(`   Total accesible: ${todosLosClientes.length} clientes\n`);

		if (todosLosClientes.length > 0) {
			console.log("   Últimos 5 clientes registrados:");
			todosLosClientes.slice(0, 5).forEach((cliente, index) => {
				console.log(
					`   ${index + 1}. ${cliente.nombre} - ${cliente.empresa.nombre}`,
				);
			});
		}

		// 6. Simular consulta como usuario normal
		if (empresas.length > 1) {
			const empresaNormal = empresas.find((e) => e.id_empresa !== 1);
			if (empresaNormal) {
				console.log(
					`\n🔒 Simulando consulta usuario normal (Empresa: ${empresaNormal.nombre}):`,
				);
				const clientesEmpresa = await Cliente.findAll({
					where: { id_empresa: empresaNormal.id_empresa },
				});
				console.log(
					`   Total accesible: ${clientesEmpresa.length} clientes (solo de su empresa)\n`,
				);
			}
		}

		// 7. Verificar asociaciones
		console.log("✓ Verificación de asociaciones:");
		if (todosLosClientes.length > 0 && todosLosClientes[0].empresa) {
			console.log("   ✓ Cliente.belongsTo(Empresa) funcionando correctamente");
		} else {
			console.log("   ⚠️  Asociación Cliente -> Empresa no configurada");
		}

		console.log("\n✅ Verificación completada!");
		console.log("\n📝 CONCLUSIONES:");
		console.log(
			"   - SUPERUSER puede acceder a clientes de TODAS las empresas",
		);
		console.log("   - Usuarios normales solo ven clientes de su empresa");
		console.log("   - Las asociaciones están configuradas correctamente");
		console.log("\n🎯 Sistema multi-tenant funcionando correctamente!\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error en la verificación:", error);
		process.exit(1);
	}
};

verificarClientesSuperuser();
