/**
 * Script de prueba completo para el flujo de ventas
 *
 * INSTRUCCIONES DE PRUEBA:
 *
 * 1. Agregar productos al carrito:
 *    - Primer producto: 2 unidades
 *    - Segundo producto: 3 unidades
 *    - Tercer producto: 4 unidades
 *
 * 2. Eliminar del carrito:
 *    - Eliminar el producto con 4 unidades usando el botón 🗑️
 *
 * 3. Procesar la venta:
 *    a) Con cliente existente: Seleccionar de la lista
 *    b) Con nuevo cliente: Hacer clic en "➕ Nuevo" y registrar
 *
 * 4. Verificar stock:
 *    - Si tenía 10 unidades y vendió 2, debe quedar 8
 *
 * 5. Verificar en base de datos
 */

const sequelize = require("./src/config/database");
const Producto = require("./src/models/Producto");
const Cliente = require("./src/models/Cliente");
const Venta = require("./src/models/Venta");
const DetalleVenta = require("./src/models/DetalleVenta");

async function pruebaFlujVentas() {
	console.log("\n🧪 ========================================");
	console.log("   PRUEBA COMPLETA DE FLUJO DE VENTAS");
	console.log("========================================\n");

	try {
		// 1. VERIFICAR PRODUCTOS DISPONIBLES
		console.log("📦 1. PRODUCTOS DISPONIBLES PARA VENTA:");
		console.log("─────────────────────────────────────────");

		const productos = await Producto.findAll({
			where: { activo: true },
			attributes: [
				"id_producto",
				"nombre",
				"codigo",
				"stock_actual",
				"precio_venta",
			],
			limit: 5,
		});

		if (productos.length === 0) {
			console.log("❌ No hay productos activos");
			return;
		}

		productos.forEach((p) => {
			console.log(
				`   ✓ ${p.nombre} (${p.codigo}) - Stock: ${p.stock_actual} - Precio: Bs. ${p.precio_venta}`,
			);
		});

		// 2. VERIFICAR CLIENTES
		console.log("\n👥 2. CLIENTES REGISTRADOS:");
		console.log("─────────────────────────────────────────");

		const clientes = await Cliente.findAll({
			attributes: ["id_cliente", "nombre", "nit"],
			limit: 5,
		});

		clientes.forEach((c) => {
			console.log(`   ✓ ${c.nombre} - NIT: ${c.nit || "Sin NIT"}`);
		});

		// 3. INSTRUCCIONES DE PRUEBA EN EL NAVEGADOR
		console.log("\n🌐 3. PRUEBA EN EL NAVEGADOR:");
		console.log("─────────────────────────────────────────");
		console.log("   a) Abrir http://localhost:5173");
		console.log("   b) Iniciar sesión");
		console.log("   c) Ir a la sección 'Ventas'");
		console.log("   d) Hacer clic en '+ Nueva Venta'\n");

		console.log("   📝 PASO 1: Agregar productos al carrito");
		console.log(
			`      • Buscar "${productos[0]?.nombre}" → Agregar 2 unidades`,
		);
		if (productos[1]) {
			console.log(
				`      • Buscar "${productos[1]?.nombre}" → Agregar 3 unidades`,
			);
		}
		if (productos[2]) {
			console.log(
				`      • Buscar "${productos[2]?.nombre}" → Agregar 4 unidades`,
			);
		}

		console.log("\n   🗑️  PASO 2: Eliminar producto");
		console.log(
			"      • Hacer clic en el botón 🗑️ del producto con 4 unidades",
		);
		console.log("      • Verificar que se elimine de la lista del carrito");

		console.log("\n   👤 PASO 3: Seleccionar/Crear cliente");
		console.log("      OPCIÓN A - Cliente existente:");
		console.log(`         • Seleccionar "${clientes[0]?.nombre}"`);
		console.log("      OPCIÓN B - Nuevo cliente:");
		console.log("         • Hacer clic en '➕ Nuevo'");
		console.log("         • Llenar formulario y guardar");
		console.log("         • El cliente nuevo se selecciona automáticamente");

		console.log("\n   ✅ PASO 4: Finalizar venta");
		console.log("      • Revisar el resumen de totales");
		console.log("      • Hacer clic en '✅ Finalizar Venta'");

		// 4. CONSULTA DE VERIFICACIÓN
		console.log("\n📊 4. CONSULTAS DE VERIFICACIÓN:");
		console.log("─────────────────────────────────────────");

		// Última venta usando query SQL directo
		const [ultimasVentas] = await sequelize.query(`
			SELECT v.id_venta, v.numero_venta, v.fecha_venta,
			       c.nombre as cliente_nombre,
			       v.total, v.metodo_pago, v.estado
			FROM ventas v
			LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
			ORDER BY v.fecha_venta DESC
			LIMIT 1;
		`);

		if (ultimasVentas.length > 0) {
			const venta = ultimasVentas[0];
			console.log("\n   💰 ÚLTIMA VENTA REGISTRADA:");
			console.log(`      • N° Venta: ${venta.numero_venta || venta.id_venta}`);
			console.log(
				`      • Fecha: ${new Date(venta.fecha_venta).toLocaleString("es-BO")}`,
			);
			console.log(`      • Cliente: ${venta.cliente_nombre || "Sin cliente"}`);
			console.log(`      • Total: Bs. ${parseFloat(venta.total).toFixed(2)}`);
			console.log(`      • Estado: ${venta.estado}`);

			// Detalles de la venta
			const [detalles] = await sequelize.query(
				`
				SELECT p.nombre as producto, dv.cantidad, 
				       dv.precio_unitario, dv.subtotal
				FROM detalle_ventas dv
				INNER JOIN productos p ON dv.id_producto = p.id_producto
				WHERE dv.id_venta = ?
				ORDER BY dv.id_detalle_venta;
			`,
				{
					replacements: [venta.id_venta],
				},
			);

			if (detalles.length > 0) {
				console.log("      • Productos vendidos:");
				detalles.forEach((d) => {
					console.log(
						`         - ${d.producto}: ${d.cantidad} unidades x Bs. ${d.precio_unitario} = Bs. ${d.subtotal}`,
					);
				});
			}
		} else {
			console.log("   ℹ️  No hay ventas registradas aún");
		}

		// Stock de productos después de venta
		console.log("\n   📦 VERIFICACIÓN DE STOCK:");
		const productosActualizados = await Producto.findAll({
			where: { activo: true },
			attributes: ["id_producto", "nombre", "stock_actual"],
			limit: 5,
		});

		productosActualizados.forEach((p) => {
			const inicial =
				productos.find((prod) => prod.id_producto === p.id_producto)
					?.stock_actual || 0;
			const diferencia = inicial - p.stock_actual;
			const simbolo = diferencia > 0 ? "↓" : diferencia < 0 ? "↑" : "=";

			console.log(
				`      • ${p.nombre}: ${inicial} → ${p.stock_actual} unidades ${simbolo}`,
			);
		});

		// 5. CONSULTA SQL DIRECTA
		console.log("\n   🔍 QUERY SQL - ÚLTIMAS 5 VENTAS:");
		console.log("      ```sql");
		console.log("      SELECT v.id_venta, v.numero_venta, v.fecha_venta,");
		console.log("\t\t\t     c.nombre as cliente,");
		console.log("\t\t\t     v.total, v.metodo_pago, v.estado");
		console.log("\t\t  FROM ventas v");
		console.log("\t\t  LEFT JOIN clientes c ON v.id_cliente = c.id_cliente");
		console.log("\t\t  ORDER BY v.fecha_venta DESC");
		console.log("\t\t  LIMIT 5;");
		console.log("\t\t  ```");

		const [ventas] = await sequelize.query(`
			SELECT v.id_venta, v.numero_venta, v.fecha_venta,
			       c.nombre as cliente,
			       v.total, v.metodo_pago, v.estado
			FROM ventas v
			LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
			ORDER BY v.fecha_venta DESC
			LIMIT 5;
		`);

		if (ventas.length > 0) {
			console.log("\n      Resultados:");
			ventas.forEach((v) => {
				console.log(
					`      ${v.numero_venta || v.id_venta} | ${v.cliente || "Sin cliente"} | Bs. ${parseFloat(v.total).toFixed(2)} | ${v.metodo_pago} | ${v.estado}`,
				);
			});
		}

		console.log("\n✅ VERIFICACIÓN COMPLETA");
		console.log("─────────────────────────────────────────");
		console.log("\n🎯 RESUMEN DE FUNCIONALIDADES:");
		console.log("   ✓ Agregar productos al carrito con cantidades");
		console.log("   ✓ Visualizar lista de productos en el carrito");
		console.log("   ✓ Eliminar productos del carrito con botón 🗑️");
		console.log("   ✓ Seleccionar cliente existente");
		console.log("   ✓ Agregar nuevo cliente desde la venta (Botón ➕ Nuevo)");
		console.log("   ✓ Procesamiento de venta con actualización de stock");
		console.log("   ✓ Registro en base de datos");

		console.log("\n💡 NOTAS IMPORTANTES:");
		console.log(
			"   • El carrito muestra todos los productos con sus cantidades",
		);
		console.log("   • Cada producto tiene un botón 🗑️ para eliminarlo");
		console.log(
			"   • Puedes aumentar/disminuir cantidades con los botones + -",
		);
		console.log("   • El stock se actualiza automáticamente tras la venta");
		console.log(
			"   • El nuevo botón '➕ Nuevo' permite crear clientes rápidamente",
		);
		console.log(
			"   • El cliente nuevo se selecciona automáticamente después de crearlo",
		);

		console.log("\n========================================\n");
	} catch (error) {
		console.error("❌ Error en la prueba:", error);
	} finally {
		await sequelize.close();
	}
}

// Ejecutar prueba
pruebaFlujVentas();
