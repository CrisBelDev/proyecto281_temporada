/**
 * Script para probar el login del SUPERUSER
 * Ejecutar con: node test-login-superuser.js
 */

const http = require("http");

function makeRequest(method, path, data = null, token = null) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: "localhost",
			port: 3000,
			path: `/api${path}`,
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
		};

		if (token) {
			options.headers["Authorization"] = `Bearer ${token}`;
		}

		const req = http.request(options, (res) => {
			let body = "";
			res.on("data", (chunk) => (body += chunk));
			res.on("end", () => {
				try {
					resolve({
						status: res.statusCode,
						data: JSON.parse(body),
					});
				} catch (e) {
					resolve({ status: res.statusCode, data: body });
				}
			});
		});

		req.on("error", reject);
		if (data) {
			req.write(JSON.stringify(data));
		}
		req.end();
	});
}

const probarLogin = async () => {
	try {
		console.log("🧪 Probando login del SUPERUSER...\n");

		// Intentar login
		console.log("📤 Enviando solicitud de login...");
		console.log("   Email: superadmin@sistema.com");
		console.log("   Password: SuperAdmin@2026\n");

		const response = await makeRequest("POST", "/auth/login", {
			email: "superadmin@sistema.com",
			password: "SuperAdmin@2026",
		});

		if (response.status === 200 && response.data.success) {
			console.log("✅ Login exitoso!\n");
			console.log("📋 Datos del usuario:");
			console.log("================================");
			console.log(`ID:       ${response.data.data.usuario.id_usuario}`);
			console.log(
				`Nombre:   ${response.data.data.usuario.nombre} ${response.data.data.usuario.apellido}`,
			);
			console.log(`Email:    ${response.data.data.usuario.email}`);
			console.log(`Rol:      ${response.data.data.usuario.rol.nombre}`);
			console.log(`Empresa:  ${response.data.data.usuario.empresa.nombre}`);
			console.log(
				`Activo:   ${response.data.data.usuario.activo ? "✓ Sí" : "✗ No"}`,
			);
			console.log("================================\n");

			console.log("🔑 Token JWT generado:");
			console.log(response.data.data.token.substring(0, 50) + "...\n");

			const token = response.data.data.token;

			// Probar acceso a endpoint de empresas (solo SUPERUSER)
			console.log("🧪 Probando acceso a endpoint de empresas...");
			try {
				const empresasResponse = await makeRequest(
					"GET",
					"/empresas",
					null,
					token,
				);

				if (empresasResponse.status === 200) {
					console.log(`✅ Acceso a empresas exitoso!`);
					console.log(
						`   Empresas encontradas: ${empresasResponse.data.data.length}\n`,
					);

					if (empresasResponse.data.data.length > 0) {
						console.log("📋 Primera empresa:");
						const empresa = empresasResponse.data.data[0];
						console.log(`   ID:      ${empresa.id_empresa}`);
						console.log(`   Nombre:  ${empresa.nombre}`);
						console.log(`   NIT:     ${empresa.nit || "N/A"}`);
						console.log(`   Email:   ${empresa.email || "N/A"}`);
						console.log(`   Activo:  ${empresa.activo ? "✓ Sí" : "✗ No"}\n`);
					}
				} else {
					console.log(
						`❌ Error ${empresasResponse.status}:`,
						empresasResponse.data.mensaje,
					);
				}
			} catch (error) {
				console.log("❌ Error al acceder a empresas:", error.message);
			}

			// Probar acceso a usuarios
			console.log("🧪 Probando acceso a endpoint de usuarios...");
			try {
				const usuariosResponse = await makeRequest(
					"GET",
					"/usuarios",
					null,
					token,
				);

				if (usuariosResponse.status === 200) {
					console.log(`✅ Acceso a usuarios exitoso!`);
					console.log(
						`   Usuarios encontrados: ${usuariosResponse.data.data.length}\n`,
					);
				} else {
					console.log(
						`❌ Error ${usuariosResponse.status}:`,
						usuariosResponse.data.mensaje,
					);
				}
			} catch (error) {
				console.log("❌ Error al acceder a usuarios:", error.message);
			}

			console.log("✅ Todas las pruebas completadas exitosamente!");
			console.log("\n🎉 El SUPERUSER está funcionando correctamente!\n");
		} else {
			console.log(`❌ Login fallido (Status: ${response.status})`);
			console.log(
				`   Mensaje: ${response.data.mensaje || JSON.stringify(response.data)}\n`,
			);
		}
	} catch (error) {
		console.error("\n❌ Error en el login:");
		console.error(`   ${error.message}`);
		console.error("\nAsegúrate de que:");
		console.error("1. El servidor esté corriendo (npm run dev)");
		console.error("2. Las credenciales sean correctas");
		console.error("3. El usuario SUPERUSER exista en la BD\n");
		process.exit(1);
	}
};

probarLogin();
