const http = require("http");

async function testLogin() {
	try {
		console.log("🧪 Probando login de SUPERUSER...\n");

		const postData = JSON.stringify({
			email: "superadmin@sistema.com",
			password: "SuperAdmin@2026",
		});

		const options = {
			hostname: "localhost",
			port: 3000,
			path: "/api/auth/login",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(postData),
			},
		};

		const response = await new Promise((resolve, reject) => {
			const req = http.request(options, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					try {
						resolve({ status: res.statusCode, data: JSON.parse(data) });
					} catch (e) {
						reject(e);
					}
				});
			});
			req.on("error", reject);
			req.write(postData);
			req.end();
		});

		console.log("✅ LOGIN EXITOSO!\n");
		console.log("📦 Respuesta completa:");
		console.log(JSON.stringify(response.data, null, 2));

		if (response.data.data && response.data.data.usuario) {
			const usuario = response.data.data.usuario;
			console.log("\n👤 Datos del usuario:");
			console.log(`   - ID: ${usuario.id_usuario}`);
			console.log(`   - Nombre: ${usuario.nombre} ${usuario.apellido}`);
			console.log(`   - Email: ${usuario.email}`);
			console.log(`   - Rol: ${usuario.rol}`);
			console.log(
				`   - Empresa: ${usuario.empresa ? `${usuario.empresa.nombre} (ID: ${usuario.empresa.id_empresa})` : "NULL (SUPERUSER sin empresa específica)"}`,
			);
		}
	} catch (error) {
		console.error("❌ ERROR en login:");
		console.error("Error:", error.message || error);
		console.error("Stack:", error.stack);
	}
}

testLogin();
