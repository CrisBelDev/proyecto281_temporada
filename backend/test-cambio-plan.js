// Script para probar el cambio de plan
require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";

async function testCambioPlan() {
	try {
		// Primero hacer login
		console.log("1. Intentando login...");
		const loginResponse = await axios.post(`${API_URL}/auth/login`, {
			email: "superadmin@sistema.com",
			password: "12345678",
		});

		const token = loginResponse.data.data.token;
		console.log("✓ Login exitoso");

		// Obtener empresa actual
		console.log("\n2. Obteniendo empresa actual...");
		const empresaResponse = await axios.get(`${API_URL}/empresas/mi-empresa`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!empresaResponse.data.success) {
			console.log("⚠️  El usuario SUPERUSER no tiene empresa asociada");
			console.log(
				"   Necesitas crear una empresa primero o usar un usuario regular",
			);
			return;
		}

		const empresa = empresaResponse.data.data;
		console.log(`✓ Empresa: ${empresa.nombre}`);
		console.log(`  Plan actual: ${empresa.plan_suscripcion}`);
		console.log(`  Monto actual: Bs. ${empresa.monto_pago}`);

		// Intentar cambiar plan
		const planNuevo =
			empresa.plan_suscripcion === "BASICO" ? "PREMIUM" : "BASICO";
		console.log(`\n3. Cambiando plan a ${planNuevo}...`);

		const cambioResponse = await axios.post(
			`${API_URL}/empresas/mi-empresa/cambiar-plan`,
			{
				plan_nuevo: planNuevo,
				metodo_pago: "QR",
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (cambioResponse.data.success) {
			console.log("✓ Cambio de plan exitoso!");
			console.log(
				`  Nuevo plan: ${cambioResponse.data.data.empresa.plan_suscripcion}`,
			);
			console.log(`  Monto pagado: Bs. ${cambioResponse.data.data.pago.monto}`);
			console.log(
				`  Fecha vencimiento: ${cambioResponse.data.data.pago.fecha_vencimiento}`,
			);
		}
	} catch (error) {
		console.error("\n❌ Error:");
		if (error.response) {
			console.error(`  Status: ${error.response.status}`);
			console.error(
				`  Mensaje: ${error.response.data.mensaje || error.response.data}`,
			);
			console.error(
				`  Data completa:`,
				JSON.stringify(error.response.data, null, 2),
			);
		} else {
			console.error(`  ${error.message}`);
		}
	}
}

testCambioPlan();
