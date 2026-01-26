const sequelize = require("./src/config/database");
const Usuario = require("./src/models/Usuario");
const Empresa = require("./src/models/Empresa");
const Rol = require("./src/models/Rol");
const Categoria = require("./src/models/Categoria");
const Producto = require("./src/models/Producto");
const Proveedor = require("./src/models/Proveedor");
const ProveedorProducto = require("./src/models/ProveedorProducto");
const Cliente = require("./src/models/Cliente");
const Compra = require("./src/models/Compra");
const DetalleCompra = require("./src/models/DetalleCompra");
const Venta = require("./src/models/Venta");
const DetalleVenta = require("./src/models/DetalleVenta");
const Notificacion = require("./src/models/Notificacion");

// Inicializar asociaciones
const models = {
	Usuario,
	Empresa,
	Rol,
	Categoria,
	Producto,
	Proveedor,
	ProveedorProducto,
	Cliente,
	Compra,
	DetalleCompra,
	Venta,
	DetalleVenta,
	Notificacion,
};

Object.values(models).forEach((model) => {
	if (model.associate) {
		model.associate(models);
	}
});

async function llenarDatosPrueba() {
	try {
		console.log("🚀 Iniciando llenado de datos de prueba...");

		// 1. Buscar usuario juan@gmail.com
		const usuario = await Usuario.findOne({
			where: { email: "juan@gmail.com" },
			include: [{ model: Empresa, as: "empresa" }],
		});

		if (!usuario) {
			console.error("❌ Usuario juan@gmail.com no encontrado");
			return;
		}

		const empresaId = usuario.id_empresa;
		const usuarioId = usuario.id_usuario;

		console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido}`);
		console.log(`🏢 Empresa: ${usuario.empresa.nombre} (ID: ${empresaId})`);

		// Timestamp para códigos únicos
		const timestamp = Date.now().toString().slice(-4);

		// 2. Crear Categorías
		console.log("\n📑 Creando categorías...");
		const categorias = await Categoria.bulkCreate([
			{
				nombre: `Electrónica ${timestamp}`,
				descripcion: "Productos electrónicos y tecnológicos",
				id_empresa: empresaId,
			},
			{
				nombre: `Alimentos ${timestamp}`,
				descripcion: "Productos alimenticios y bebidas",
				id_empresa: empresaId,
			},
			{
				nombre: `Hogar ${timestamp}`,
				descripcion: "Artículos para el hogar",
				id_empresa: empresaId,
			},
			{
				nombre: `Oficina ${timestamp}`,
				descripcion: "Material de oficina y papelería",
				id_empresa: empresaId,
			},
			{
				nombre: `Ropa ${timestamp}`,
				descripcion: "Prendas de vestir y accesorios",
				id_empresa: empresaId,
			},
		]);
		console.log(`✅ ${categorias.length} categorías creadas`);

		// 3. Crear Productos
		console.log("\n📦 Creando productos...");
		const productos = await Producto.bulkCreate([
			// Electrónica
			{
				codigo: `ELEC001-${timestamp}`,
				nombre: "Laptop HP Pavilion",
				descripcion: "Laptop 15.6 pulgadas, Intel i5, 8GB RAM",
				precio_compra: 450.0,
				precio_venta: 650.0,
				stock_actual: 15,
				stock_minimo: 5,
				id_categoria: categorias[0].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `ELEC002-${timestamp}`,
				nombre: "Mouse Logitech",
				descripcion: "Mouse inalámbrico ergonómico",
				precio_compra: 8.5,
				precio_venta: 15.0,
				stock_actual: 50,
				stock_minimo: 10,
				id_categoria: categorias[0].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `ELEC003-${timestamp}`,
				nombre: "Teclado Mecánico",
				descripcion: "Teclado mecánico RGB",
				precio_compra: 35.0,
				precio_venta: 55.0,
				stock_actual: 25,
				stock_minimo: 8,
				id_categoria: categorias[0].id_categoria,
				id_empresa: empresaId,
			},
			// Alimentos
			{
				codigo: `ALI001-${timestamp}`,
				nombre: "Arroz Premium 1kg",
				descripcion: "Arroz de grano largo",
				precio_compra: 1.2,
				precio_venta: 2.5,
				stock_actual: 200,
				stock_minimo: 50,
				id_categoria: categorias[1].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `ALI002-${timestamp}`,
				nombre: "Aceite Vegetal 1L",
				descripcion: "Aceite vegetal refinado",
				precio_compra: 2.8,
				precio_venta: 4.5,
				stock_actual: 100,
				stock_minimo: 30,
				id_categoria: categorias[1].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `ALI003-${timestamp}`,
				nombre: "Azúcar Blanca 1kg",
				descripcion: "Azúcar refinada",
				precio_compra: 0.8,
				precio_venta: 1.5,
				stock_actual: 150,
				stock_minimo: 40,
				id_categoria: categorias[1].id_categoria,
				id_empresa: empresaId,
			},
			// Hogar
			{
				codigo: `HOG001-${timestamp}`,
				nombre: "Sábanas King Size",
				descripcion: "Juego de sábanas 100% algodón",
				precio_compra: 25.0,
				precio_venta: 45.0,
				stock_actual: 30,
				stock_minimo: 10,
				id_categoria: categorias[2].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `HOG002-${timestamp}`,
				nombre: "Toallas Premium",
				descripcion: "Set de toallas de baño",
				precio_compra: 15.0,
				precio_venta: 28.0,
				stock_actual: 40,
				stock_minimo: 15,
				id_categoria: categorias[2].id_categoria,
				id_empresa: empresaId,
			},
			// Oficina
			{
				codigo: `OFI001-${timestamp}`,
				nombre: "Resma Papel A4",
				descripcion: "500 hojas papel bond",
				precio_compra: 3.5,
				precio_venta: 6.0,
				stock_actual: 80,
				stock_minimo: 20,
				id_categoria: categorias[3].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `OFI002-${timestamp}`,
				nombre: "Marcadores Permanentes",
				descripcion: "Set de 12 marcadores",
				precio_compra: 4.0,
				precio_venta: 8.0,
				stock_actual: 60,
				stock_minimo: 15,
				id_categoria: categorias[3].id_categoria,
				id_empresa: empresaId,
			},
			// Ropa
			{
				codigo: `ROP001-${timestamp}`,
				nombre: "Camisa Formal",
				descripcion: "Camisa manga larga",
				precio_compra: 18.0,
				precio_venta: 35.0,
				stock_actual: 45,
				stock_minimo: 12,
				id_categoria: categorias[4].id_categoria,
				id_empresa: empresaId,
			},
			{
				codigo: `ROP002-${timestamp}`,
				nombre: "Jeans Classic",
				descripcion: "Pantalón jean mezclilla",
				precio_compra: 22.0,
				precio_venta: 42.0,
				stock_actual: 35,
				stock_minimo: 10,
				id_categoria: categorias[4].id_categoria,
				id_empresa: empresaId,
			},
		]);
		console.log(`✅ ${productos.length} productos creados`);

		// 4. Crear Proveedores
		console.log("\n🏪 Creando proveedores...");
		const proveedores = await Proveedor.bulkCreate([
			{
				nombre: "TechSupply S.A.",
				nit: "1234567890",
				email: "ventas@techsupply.com",
				telefono: "+591 3-3334455",
				direccion: "Av. Tecnología 123, Santa Cruz",
				contacto_nombre: "Carlos Ruiz",
				contacto_telefono: "+591 70001122",
				id_empresa: empresaId,
			},
			{
				nombre: "Distribuidora Alimentos del Sur",
				nit: "0987654321",
				email: "pedidos@alimentossur.com",
				telefono: "+591 3-3445566",
				direccion: "Calle Comercio 456, Santa Cruz",
				contacto_nombre: "María González",
				contacto_telefono: "+591 71112233",
				id_empresa: empresaId,
			},
			{
				nombre: "Hogar Confort Ltda.",
				nit: "5556667778",
				email: "info@hogarconfort.com",
				telefono: "+591 3-3556677",
				direccion: "Av. Principal 789, Santa Cruz",
				contacto_nombre: "Pedro Sánchez",
				contacto_telefono: "+591 72223344",
				id_empresa: empresaId,
			},
			{
				nombre: "Papelería Moderna",
				nit: "4445556667",
				email: "contacto@papeleriamoderna.com",
				telefono: "+591 3-3667788",
				direccion: "Calle Oficina 321, Santa Cruz",
				contacto_nombre: "Ana Martínez",
				contacto_telefono: "+591 73334455",
				id_empresa: empresaId,
			},
		]);
		console.log(`✅ ${proveedores.length} proveedores creados`);

		// 5. Asociar productos a proveedores
		console.log("\n🔗 Asociando productos a proveedores...");
		await ProveedorProducto.bulkCreate([
			// TechSupply - Electrónica
			{
				id_proveedor: proveedores[0].id_proveedor,
				id_producto: productos[0].id_producto,
				precio_compra_habitual: 450.0,
			},
			{
				id_proveedor: proveedores[0].id_proveedor,
				id_producto: productos[1].id_producto,
				precio_compra_habitual: 8.5,
			},
			{
				id_proveedor: proveedores[0].id_proveedor,
				id_producto: productos[2].id_producto,
				precio_compra_habitual: 35.0,
			},
			// Alimentos del Sur - Alimentos
			{
				id_proveedor: proveedores[1].id_proveedor,
				id_producto: productos[3].id_producto,
				precio_compra_habitual: 1.2,
			},
			{
				id_proveedor: proveedores[1].id_proveedor,
				id_producto: productos[4].id_producto,
				precio_compra_habitual: 2.8,
			},
			{
				id_proveedor: proveedores[1].id_proveedor,
				id_producto: productos[5].id_producto,
				precio_compra_habitual: 0.8,
			},
			// Hogar Confort - Hogar
			{
				id_proveedor: proveedores[2].id_proveedor,
				id_producto: productos[6].id_producto,
				precio_compra_habitual: 25.0,
			},
			{
				id_proveedor: proveedores[2].id_proveedor,
				id_producto: productos[7].id_producto,
				precio_compra_habitual: 15.0,
			},
			// Papelería Moderna - Oficina
			{
				id_proveedor: proveedores[3].id_proveedor,
				id_producto: productos[8].id_producto,
				precio_compra_habitual: 3.5,
			},
			{
				id_proveedor: proveedores[3].id_proveedor,
				id_producto: productos[9].id_producto,
				precio_compra_habitual: 4.0,
			},
		]);
		console.log("✅ Productos asociados a proveedores");

		// 6. Crear Clientes
		console.log("\n👥 Creando clientes...");
		const clientes = await Cliente.bulkCreate([
			{
				nombre: "Roberto",
				apellido: "Fernández",
				email: "roberto.fernandez@email.com",
				telefono: "+591 70112233",
				nit: "1111222233",
				direccion: "Zona Norte, Santa Cruz",
				id_empresa: empresaId,
			},
			{
				nombre: "Laura",
				apellido: "Méndez",
				email: "laura.mendez@email.com",
				telefono: "+591 71223344",
				nit: "2222333344",
				direccion: "Zona Sur, Santa Cruz",
				id_empresa: empresaId,
			},
			{
				nombre: "Diego",
				apellido: "Torres",
				email: "diego.torres@email.com",
				telefono: "+591 72334455",
				nit: "3333444455",
				direccion: "Zona Este, Santa Cruz",
				id_empresa: empresaId,
			},
			{
				nombre: "Carmen",
				apellido: "Rivas",
				email: "carmen.rivas@email.com",
				telefono: "+591 73445566",
				nit: "4444555566",
				direccion: "Zona Oeste, Santa Cruz",
				id_empresa: empresaId,
			},
			{
				nombre: "Empresa ABC S.R.L.",
				apellido: "",
				email: "ventas@empresaabc.com",
				telefono: "+591 3-3778899",
				nit: "9999888877",
				direccion: "Av. Empresarial 555, Santa Cruz",
				id_empresa: empresaId,
			},
		]);
		console.log(`✅ ${clientes.length} clientes creados`);

		// 7. Buscar últimas compras y ventas para no duplicar números
		console.log("\n🔍 Verificando últimos números de compra y venta...");
		const ultimaCompra = await Compra.findOne({
			where: { id_empresa: empresaId },
			order: [["id_compra", "DESC"]],
		});

		const ultimaVenta = await Venta.findOne({
			where: { id_empresa: empresaId },
			order: [["id_venta", "DESC"]],
		});

		const numeroCompraInicial = ultimaCompra
			? parseInt(ultimaCompra.numero_compra.split("-")[1]) + 1
			: 1;
		const numeroVentaInicial = ultimaVenta
			? parseInt(ultimaVenta.numero_venta.split("-")[1]) + 1
			: 1;

		console.log(
			`📝 Próximo número de compra: C-${String(numeroCompraInicial).padStart(6, "0")}`,
		);
		console.log(
			`📝 Próximo número de venta: V-${String(numeroVentaInicial).padStart(6, "0")}`,
		);

		// 8. Crear Compras
		console.log("\n🛒 Creando compras...");

		// Compra 1: Electrónica
		const compra1 = await Compra.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_proveedor: proveedores[0].id_proveedor,
			numero_compra: `C-${String(numeroCompraInicial).padStart(6, "0")}`,
			fecha_compra: new Date("2026-01-15"),
			total: 0,
			estado: "COMPLETADA",
			observaciones: "Compra de equipos electrónicos",
		});

		await DetalleCompra.bulkCreate([
			{
				id_compra: compra1.id_compra,
				id_producto: productos[0].id_producto,
				cantidad: 5,
				precio_unitario: 450.0,
				subtotal: 2250.0,
			},
			{
				id_compra: compra1.id_compra,
				id_producto: productos[1].id_producto,
				cantidad: 20,
				precio_unitario: 8.5,
				subtotal: 170.0,
			},
			{
				id_compra: compra1.id_compra,
				id_producto: productos[2].id_producto,
				cantidad: 10,
				precio_unitario: 35.0,
				subtotal: 350.0,
			},
		]);

		await compra1.update({ total: 2770.0 });

		// Compra 2: Alimentos
		const compra2 = await Compra.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_proveedor: proveedores[1].id_proveedor,
			numero_compra: `C-${String(numeroCompraInicial + 1).padStart(6, "0")}`,
			fecha_compra: new Date("2026-01-18"),
			total: 0,
			estado: "COMPLETADA",
			observaciones: "Abastecimiento de alimentos",
		});

		await DetalleCompra.bulkCreate([
			{
				id_compra: compra2.id_compra,
				id_producto: productos[3].id_producto,
				cantidad: 100,
				precio_unitario: 1.2,
				subtotal: 120.0,
			},
			{
				id_compra: compra2.id_compra,
				id_producto: productos[4].id_producto,
				cantidad: 50,
				precio_unitario: 2.8,
				subtotal: 140.0,
			},
			{
				id_compra: compra2.id_compra,
				id_producto: productos[5].id_producto,
				cantidad: 80,
				precio_unitario: 0.8,
				subtotal: 64.0,
			},
		]);

		await compra2.update({ total: 324.0 });

		// Compra 3: Hogar
		const compra3 = await Compra.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_proveedor: proveedores[2].id_proveedor,
			numero_compra: `C-${String(numeroCompraInicial + 2).padStart(6, "0")}`,
			fecha_compra: new Date("2026-01-20"),
			total: 0,
			estado: "COMPLETADA",
			observaciones: "Artículos para el hogar",
		});

		await DetalleCompra.bulkCreate([
			{
				id_compra: compra3.id_compra,
				id_producto: productos[6].id_producto,
				cantidad: 15,
				precio_unitario: 25.0,
				subtotal: 375.0,
			},
			{
				id_compra: compra3.id_compra,
				id_producto: productos[7].id_producto,
				cantidad: 20,
				precio_unitario: 15.0,
				subtotal: 300.0,
			},
		]);

		await compra3.update({ total: 675.0 });

		console.log("✅ 3 compras creadas con sus detalles");

		// 8. Crear Ventas
		console.log("\n💰 Creando ventas...");

		// Venta 1
		const venta1 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[0].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-16"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "EFECTIVO",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta1.id_venta,
				id_producto: productos[0].id_producto,
				cantidad: 1,
				precio_unitario: 650.0,
				subtotal: 650.0,
			},
			{
				id_venta: venta1.id_venta,
				id_producto: productos[1].id_producto,
				cantidad: 2,
				precio_unitario: 15.0,
				subtotal: 30.0,
			},
		]);

		await venta1.update({ subtotal: 680.0, total: 680.0 });

		// Venta 2
		const venta2 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[1].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial + 1).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-19"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "TARJETA",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta2.id_venta,
				id_producto: productos[3].id_producto,
				cantidad: 10,
				precio_unitario: 2.5,
				subtotal: 25.0,
			},
			{
				id_venta: venta2.id_venta,
				id_producto: productos[4].id_producto,
				cantidad: 5,
				precio_unitario: 4.5,
				subtotal: 22.5,
			},
			{
				id_venta: venta2.id_venta,
				id_producto: productos[5].id_producto,
				cantidad: 8,
				precio_unitario: 1.5,
				subtotal: 12.0,
			},
		]);

		await venta2.update({ subtotal: 59.5, total: 59.5 });

		// Venta 3
		const venta3 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[2].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial + 2).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-21"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "TRANSFERENCIA",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta3.id_venta,
				id_producto: productos[6].id_producto,
				cantidad: 2,
				precio_unitario: 45.0,
				subtotal: 90.0,
			},
			{
				id_venta: venta3.id_venta,
				id_producto: productos[7].id_producto,
				cantidad: 3,
				precio_unitario: 28.0,
				subtotal: 84.0,
			},
		]);

		await venta3.update({ subtotal: 174.0, total: 174.0 });

		// Venta 4
		const venta4 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[3].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial + 3).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-22"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "EFECTIVO",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta4.id_venta,
				id_producto: productos[8].id_producto,
				cantidad: 5,
				precio_unitario: 6.0,
				subtotal: 30.0,
			},
			{
				id_venta: venta4.id_venta,
				id_producto: productos[9].id_producto,
				cantidad: 4,
				precio_unitario: 8.0,
				subtotal: 32.0,
			},
		]);

		await venta4.update({ subtotal: 62.0, total: 62.0 });

		// Venta 5 - Empresa
		const venta5 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[4].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial + 4).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-23"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "TRANSFERENCIA",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta5.id_venta,
				id_producto: productos[0].id_producto,
				cantidad: 3,
				precio_unitario: 650.0,
				subtotal: 1950.0,
			},
			{
				id_venta: venta5.id_venta,
				id_producto: productos[2].id_producto,
				cantidad: 5,
				precio_unitario: 55.0,
				subtotal: 275.0,
			},
			{
				id_venta: venta5.id_venta,
				id_producto: productos[10].id_producto,
				cantidad: 10,
				precio_unitario: 35.0,
				subtotal: 350.0,
			},
		]);

		await venta5.update({ subtotal: 2575.0, total: 2575.0 });

		// Venta 6
		const venta6 = await Venta.create({
			id_empresa: empresaId,
			id_usuario: usuarioId,
			id_cliente: clientes[0].id_cliente,
			numero_venta: `V-${String(numeroVentaInicial + 5).padStart(6, "0")}`,
			fecha_venta: new Date("2026-01-24"),
			subtotal: 0,
			total: 0,
			estado: "COMPLETADA",
			metodo_pago: "QR",
		});

		await DetalleVenta.bulkCreate([
			{
				id_venta: venta6.id_venta,
				id_producto: productos[11].id_producto,
				cantidad: 2,
				precio_unitario: 42.0,
				subtotal: 84.0,
			},
			{
				id_venta: venta6.id_venta,
				id_producto: productos[10].id_producto,
				cantidad: 1,
				precio_unitario: 35.0,
				subtotal: 35.0,
			},
		]);

		await venta6.update({ subtotal: 119.0, total: 119.0 });

		console.log("✅ 6 ventas creadas con sus detalles");

		// Resumen final
		console.log("\n" + "=".repeat(50));
		console.log("✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE");
		console.log("=".repeat(50));
		console.log(`📑 Categorías: ${categorias.length}`);
		console.log(`📦 Productos: ${productos.length}`);
		console.log(`🏪 Proveedores: ${proveedores.length}`);
		console.log(`👥 Clientes: ${clientes.length}`);
		console.log(`🛒 Compras: 3`);
		console.log(`💰 Ventas: 6`);
		console.log("=".repeat(50));
		console.log(
			`\n🎯 Todo listo para ${usuario.nombre} ${usuario.apellido} (${usuario.email})`,
		);
		console.log(`🏢 Empresa: ${usuario.empresa.nombre}\n`);
	} catch (error) {
		console.error("❌ Error al llenar datos:", error);
		console.error(error.stack);
	} finally {
		await sequelize.close();
	}
}

// Ejecutar
llenarDatosPrueba();
