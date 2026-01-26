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

async function diagnosticarYLimpiar() {
	try {
		console.log("🔍 DIAGNÓSTICO DE BASE DE DATOS PARA juan@gmail.com");
		console.log("=".repeat(70));

		// 1. Buscar usuario
		const usuario = await Usuario.findOne({
			where: { email: "juan@gmail.com" },
			include: [{ model: Empresa, as: "empresa" }],
		});

		if (!usuario) {
			console.error("❌ Usuario juan@gmail.com no encontrado");
			return;
		}

		const empresaId = usuario.id_empresa;
		console.log(`\n✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);
		console.log(`📧 Email: ${usuario.email}`);
		console.log(`🏢 Empresa: ${usuario.empresa.nombre} (ID: ${empresaId})`);

		// 2. CATEGORÍAS - Buscar duplicados
		console.log("\n" + "=".repeat(70));
		console.log("📑 ANÁLISIS DE CATEGORÍAS");
		console.log("=".repeat(70));

		const categorias = await Categoria.findAll({
			where: { id_empresa: empresaId },
			order: [["nombre", "ASC"]],
		});

		console.log(`Total de categorías: ${categorias.length}`);

		// Identificar categorías duplicadas por nombre base
		const categoriasMap = new Map();
		const categoriasDuplicadas = [];

		categorias.forEach((cat) => {
			const nombreBase = cat.nombre
				.replace(/\s+\d{4}$/, "")
				.trim()
				.toLowerCase();
			if (categoriasMap.has(nombreBase)) {
				categoriasMap.get(nombreBase).push(cat);
				if (!categoriasDuplicadas.includes(nombreBase)) {
					categoriasDuplicadas.push(nombreBase);
				}
			} else {
				categoriasMap.set(nombreBase, [cat]);
			}
		});

		if (categoriasDuplicadas.length > 0) {
			console.log(
				`\n⚠️  Categorías duplicadas encontradas: ${categoriasDuplicadas.length}`,
			);
			for (const nombreBase of categoriasDuplicadas) {
				const cats = categoriasMap.get(nombreBase);
				console.log(`\n  "${nombreBase}": ${cats.length} copias`);
				cats.forEach((c, idx) => {
					console.log(`    ${idx + 1}. ID ${c.id_categoria}: "${c.nombre}"`);
				});
			}
		} else {
			console.log("✅ No hay categorías duplicadas");
		}

		// 3. PRODUCTOS - Buscar duplicados y huérfanos
		console.log("\n" + "=".repeat(70));
		console.log("📦 ANÁLISIS DE PRODUCTOS");
		console.log("=".repeat(70));

		const productos = await Producto.findAll({
			where: { id_empresa: empresaId },
			include: [{ model: Categoria, as: "categoria" }],
			order: [["codigo", "ASC"]],
		});

		console.log(`Total de productos: ${productos.length}`);

		// Productos duplicados por código base
		const productosMap = new Map();
		const productosDuplicados = [];

		productos.forEach((prod) => {
			const codigoBase = prod.codigo.replace(/-\d{4}$/, "").trim();
			if (productosMap.has(codigoBase)) {
				productosMap.get(codigoBase).push(prod);
				if (!productosDuplicados.includes(codigoBase)) {
					productosDuplicados.push(codigoBase);
				}
			} else {
				productosMap.set(codigoBase, [prod]);
			}
		});

		if (productosDuplicados.length > 0) {
			console.log(
				`\n⚠️  Productos duplicados encontrados: ${productosDuplicados.length}`,
			);
			for (const codigoBase of productosDuplicados) {
				const prods = productosMap.get(codigoBase);
				console.log(`\n  Código base "${codigoBase}": ${prods.length} copias`);
				prods.forEach((p, idx) => {
					console.log(
						`    ${idx + 1}. ID ${p.id_producto}: ${p.codigo} - ${p.nombre} (Stock: ${p.stock_actual})`,
					);
				});
			}
		} else {
			console.log("✅ No hay productos duplicados");
		}

		// Productos sin categoría
		const productosSinCategoria = productos.filter((p) => !p.id_categoria);
		if (productosSinCategoria.length > 0) {
			console.log(
				`\n⚠️  Productos sin categoría: ${productosSinCategoria.length}`,
			);
			productosSinCategoria.forEach((p) => {
				console.log(`  - ID ${p.id_producto}: ${p.codigo} - ${p.nombre}`);
			});
		}

		// 4. PROVEEDORES
		console.log("\n" + "=".repeat(70));
		console.log("🏪 ANÁLISIS DE PROVEEDORES");
		console.log("=".repeat(70));

		const proveedores = await Proveedor.findAll({
			where: { id_empresa: empresaId },
			order: [["nombre", "ASC"]],
		});

		console.log(`Total de proveedores: ${proveedores.length}`);

		// Proveedores duplicados por NIT
		const proveedoresPorNit = new Map();
		proveedores.forEach((prov) => {
			if (proveedoresPorNit.has(prov.nit)) {
				proveedoresPorNit.get(prov.nit).push(prov);
			} else {
				proveedoresPorNit.set(prov.nit, [prov]);
			}
		});

		const proveedoresDuplicados = Array.from(
			proveedoresPorNit.entries(),
		).filter(([_, provs]) => provs.length > 1);

		if (proveedoresDuplicados.length > 0) {
			console.log(
				`\n⚠️  Proveedores duplicados (mismo NIT): ${proveedoresDuplicados.length}`,
			);
			proveedoresDuplicados.forEach(([nit, provs]) => {
				console.log(`\n  NIT ${nit}:`);
				provs.forEach((p, idx) => {
					console.log(`    ${idx + 1}. ID ${p.id_proveedor}: ${p.nombre}`);
				});
			});
		} else {
			console.log("✅ No hay proveedores duplicados");
		}

		// 5. CLIENTES
		console.log("\n" + "=".repeat(70));
		console.log("👥 ANÁLISIS DE CLIENTES");
		console.log("=".repeat(70));

		const clientes = await Cliente.findAll({
			where: { id_empresa: empresaId },
			order: [["nombre", "ASC"]],
		});

		console.log(`Total de clientes activos: ${clientes.length}`);

		// Clientes duplicados por NIT o email
		const clientesPorNit = new Map();
		const clientesPorEmail = new Map();

		clientes.forEach((cli) => {
			if (cli.nit) {
				if (clientesPorNit.has(cli.nit)) {
					clientesPorNit.get(cli.nit).push(cli);
				} else {
					clientesPorNit.set(cli.nit, [cli]);
				}
			}
			if (cli.email) {
				if (clientesPorEmail.has(cli.email)) {
					clientesPorEmail.get(cli.email).push(cli);
				} else {
					clientesPorEmail.set(cli.email, [cli]);
				}
			}
		});

		const clientesDuplicadosNit = Array.from(clientesPorNit.entries()).filter(
			([_, clis]) => clis.length > 1,
		);
		const clientesDuplicadosEmail = Array.from(
			clientesPorEmail.entries(),
		).filter(([_, clis]) => clis.length > 1);

		if (clientesDuplicadosNit.length > 0) {
			console.log(
				`\n⚠️  Clientes duplicados (mismo NIT): ${clientesDuplicadosNit.length}`,
			);
			clientesDuplicadosNit.forEach(([nit, clis]) => {
				console.log(`\n  NIT ${nit}:`);
				clis.forEach((c, idx) => {
					console.log(
						`    ${idx + 1}. ID ${c.id_cliente}: ${c.nombre} ${c.apellido}`,
					);
				});
			});
		}

		if (clientesDuplicadosEmail.length > 0) {
			console.log(
				`\n⚠️  Clientes duplicados (mismo email): ${clientesDuplicadosEmail.length}`,
			);
			clientesDuplicadosEmail.forEach(([email, clis]) => {
				console.log(`\n  Email ${email}:`);
				clis.forEach((c, idx) => {
					console.log(
						`    ${idx + 1}. ID ${c.id_cliente}: ${c.nombre} ${c.apellido}`,
					);
				});
			});
		}

		if (
			clientesDuplicadosNit.length === 0 &&
			clientesDuplicadosEmail.length === 0
		) {
			console.log("✅ No hay clientes duplicados");
		}

		// 6. COMPRAS Y VENTAS
		console.log("\n" + "=".repeat(70));
		console.log("🛒 ANÁLISIS DE COMPRAS");
		console.log("=".repeat(70));

		const compras = await Compra.findAll({
			where: { id_empresa: empresaId },
			include: [
				{ model: Proveedor, as: "proveedor" },
				{ model: DetalleCompra, as: "detalles" },
			],
			order: [["fecha_compra", "DESC"]],
		});

		console.log(`Total de compras: ${compras.length}`);

		const comprasSinDetalles = compras.filter(
			(c) => !c.detalles || c.detalles.length === 0,
		);
		if (comprasSinDetalles.length > 0) {
			console.log(`\n⚠️  Compras sin detalles: ${comprasSinDetalles.length}`);
			comprasSinDetalles.forEach((c) => {
				console.log(
					`  - ${c.numero_compra} (ID ${c.id_compra}) - Total: ${c.total}`,
				);
			});
		} else {
			console.log("✅ Todas las compras tienen detalles");
		}

		console.log("\n" + "=".repeat(70));
		console.log("💰 ANÁLISIS DE VENTAS");
		console.log("=".repeat(70));

		const ventas = await Venta.findAll({
			where: { id_empresa: empresaId },
			include: [
				{ model: Cliente, as: "cliente" },
				{ model: DetalleVenta, as: "detalles" },
			],
			order: [["fecha_venta", "DESC"]],
		});

		console.log(`Total de ventas: ${ventas.length}`);

		const ventasSinDetalles = ventas.filter(
			(v) => !v.detalles || v.detalles.length === 0,
		);
		if (ventasSinDetalles.length > 0) {
			console.log(`\n⚠️  Ventas sin detalles: ${ventasSinDetalles.length}`);
			ventasSinDetalles.forEach((v) => {
				console.log(
					`  - ${v.numero_venta} (ID ${v.id_venta}) - Total: ${v.total}`,
				);
			});
		} else {
			console.log("✅ Todas las ventas tienen detalles");
		}

		// RESUMEN Y OPCIÓN DE LIMPIEZA
		console.log("\n" + "=".repeat(70));
		console.log("📊 RESUMEN DE PROBLEMAS ENCONTRADOS");
		console.log("=".repeat(70));

		const problemas = [];

		if (categoriasDuplicadas.length > 0) {
			problemas.push(`${categoriasDuplicadas.length} categorías duplicadas`);
		}
		if (productosDuplicados.length > 0) {
			problemas.push(`${productosDuplicados.length} productos duplicados`);
		}
		if (productosSinCategoria.length > 0) {
			problemas.push(`${productosSinCategoria.length} productos sin categoría`);
		}
		if (proveedoresDuplicados.length > 0) {
			problemas.push(`${proveedoresDuplicados.length} proveedores duplicados`);
		}
		if (clientesDuplicadosNit.length > 0) {
			problemas.push(
				`${clientesDuplicadosNit.length} clientes con NIT duplicado`,
			);
		}
		if (clientesDuplicadosEmail.length > 0) {
			problemas.push(
				`${clientesDuplicadosEmail.length} clientes con email duplicado`,
			);
		}
		if (comprasSinDetalles.length > 0) {
			problemas.push(`${comprasSinDetalles.length} compras sin detalles`);
		}
		if (ventasSinDetalles.length > 0) {
			problemas.push(`${ventasSinDetalles.length} ventas sin detalles`);
		}

		if (problemas.length === 0) {
			console.log("\n✅ ¡Base de datos limpia! No se encontraron problemas.");
		} else {
			console.log(
				`\n⚠️  Se encontraron ${problemas.length} tipos de problemas:`,
			);
			problemas.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

			console.log("\n" + "=".repeat(70));
			console.log("🧹 INICIANDO LIMPIEZA AUTOMÁTICA");
			console.log("=".repeat(70));

			let totalEliminados = 0;

			// Limpiar categorías duplicadas (mantener la más reciente)
			if (categoriasDuplicadas.length > 0) {
				console.log("\n🗑️  Limpiando categorías duplicadas...");
				for (const nombreBase of categoriasDuplicadas) {
					const cats = categoriasMap
						.get(nombreBase)
						.sort(
							(a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion),
						);
					const mantener = cats[0];
					const eliminar = cats.slice(1);

					// Reasignar productos a la categoría que se mantiene
					for (const cat of eliminar) {
						await Producto.update(
							{ id_categoria: mantener.id_categoria },
							{ where: { id_categoria: cat.id_categoria } },
						);
						await Categoria.destroy({
							where: { id_categoria: cat.id_categoria },
						});
						console.log(
							`  ✓ Eliminada "${cat.nombre}" (ID ${cat.id_categoria}), productos reasignados a "${mantener.nombre}"`,
						);
						totalEliminados++;
					}
				}
			}

			// Limpiar productos duplicados (mantener el más reciente)
			if (productosDuplicados.length > 0) {
				console.log("\n🗑️  Limpiando productos duplicados...");
				for (const codigoBase of productosDuplicados) {
					const prods = productosMap
						.get(codigoBase)
						.sort(
							(a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion),
						);
					const mantener = prods[0];
					const eliminar = prods.slice(1);

					for (const prod of eliminar) {
						// Verificar si tiene relaciones en ventas o compras
						const tieneDetallesVenta = await DetalleVenta.count({
							where: { id_producto: prod.id_producto },
						});
						const tieneDetallesCompra = await DetalleCompra.count({
							where: { id_producto: prod.id_producto },
						});

						if (tieneDetallesVenta > 0 || tieneDetallesCompra > 0) {
							// Actualizar referencias al producto que se mantiene
							await DetalleVenta.update(
								{ id_producto: mantener.id_producto },
								{ where: { id_producto: prod.id_producto } },
							);
							await DetalleCompra.update(
								{ id_producto: mantener.id_producto },
								{ where: { id_producto: prod.id_producto } },
							);
							await ProveedorProducto.update(
								{ id_producto: mantener.id_producto },
								{ where: { id_producto: prod.id_producto } },
							);

							// Sumar el stock al producto que se mantiene
							await mantener.update({
								stock_actual: mantener.stock_actual + prod.stock_actual,
							});
						}

						await Producto.destroy({
							where: { id_producto: prod.id_producto },
						});
						console.log(
							`  ✓ Eliminado "${prod.codigo}" (ID ${prod.id_producto}), referencias actualizadas a "${mantener.codigo}"`,
						);
						totalEliminados++;
					}
				}
			}

			// Limpiar compras sin detalles
			if (comprasSinDetalles.length > 0) {
				console.log("\n🗑️  Limpiando compras sin detalles...");
				for (const compra of comprasSinDetalles) {
					await Compra.destroy({ where: { id_compra: compra.id_compra } });
					console.log(`  ✓ Eliminada compra ${compra.numero_compra}`);
					totalEliminados++;
				}
			}

			// Limpiar ventas sin detalles
			if (ventasSinDetalles.length > 0) {
				console.log("\n🗑️  Limpiando ventas sin detalles...");
				for (const venta of ventasSinDetalles) {
					await Venta.destroy({ where: { id_venta: venta.id_venta } });
					console.log(`  ✓ Eliminada venta ${venta.numero_venta}`);
					totalEliminados++;
				}
			}

			// Limpiar proveedores duplicados (mantener el más antiguo)
			if (proveedoresDuplicados.length > 0) {
				console.log("\n🗑️  Limpiando proveedores duplicados...");
				for (const [nit, provs] of proveedoresDuplicados) {
					const ordenados = provs.sort(
						(a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
					);
					const mantener = ordenados[0];
					const eliminar = ordenados.slice(1);

					for (const prov of eliminar) {
						// Reasignar compras al proveedor que se mantiene
						await Compra.update(
							{ id_proveedor: mantener.id_proveedor },
							{ where: { id_proveedor: prov.id_proveedor } },
						);

						// Reasignar relaciones proveedor-producto
						const relacionesExistentes = await ProveedorProducto.findAll({
							where: { id_proveedor: prov.id_proveedor },
						});

						for (const rel of relacionesExistentes) {
							// Verificar si ya existe la relación con el proveedor que se mantiene
							const yaExiste = await ProveedorProducto.findOne({
								where: {
									id_proveedor: mantener.id_proveedor,
									id_producto: rel.id_producto,
								},
							});

							if (!yaExiste) {
								await ProveedorProducto.update(
									{ id_proveedor: mantener.id_proveedor },
									{
										where: {
											id_proveedor: prov.id_proveedor,
											id_producto: rel.id_producto,
										},
									},
								);
							} else {
								// Si ya existe, solo eliminar la relación duplicada
								await ProveedorProducto.destroy({
									where: {
										id_proveedor: prov.id_proveedor,
										id_producto: rel.id_producto,
									},
								});
							}
						}

						await Proveedor.destroy({
							where: { id_proveedor: prov.id_proveedor },
						});
						console.log(
							`  ✓ Eliminado proveedor "${prov.nombre}" (ID ${prov.id_proveedor}), datos migrados a ID ${mantener.id_proveedor}`,
						);
						totalEliminados++;
					}
				}
			}

			// Limpiar clientes duplicados por NIT (mantener el más antiguo)
			if (clientesDuplicadosNit.length > 0) {
				console.log("\n🗑️  Limpiando clientes duplicados por NIT...");
				for (const [nit, clis] of clientesDuplicadosNit) {
					const ordenados = clis.sort(
						(a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
					);
					const mantener = ordenados[0];
					const eliminar = ordenados.slice(1);

					for (const cli of eliminar) {
						// Reasignar ventas al cliente que se mantiene
						await Venta.update(
							{ id_cliente: mantener.id_cliente },
							{ where: { id_cliente: cli.id_cliente } },
						);

						await Cliente.destroy({ where: { id_cliente: cli.id_cliente } });
						console.log(
							`  ✓ Eliminado cliente "${cli.nombre} ${cli.apellido}" (ID ${cli.id_cliente}), ventas migradas a ID ${mantener.id_cliente}`,
						);
						totalEliminados++;
					}
				}
			}

			console.log("\n" + "=".repeat(70));
			console.log(
				`✅ LIMPIEZA COMPLETADA: ${totalEliminados} registros eliminados`,
			);
			console.log("=".repeat(70));
		}
	} catch (error) {
		console.error("❌ Error:", error);
		console.error(error.stack);
	} finally {
		await sequelize.close();
	}
}

diagnosticarYLimpiar();
