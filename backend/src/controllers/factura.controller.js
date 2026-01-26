const PDFDocument = require("pdfkit");
const Venta = require("../models/Venta");
const DetalleVenta = require("../models/DetalleVenta");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const Empresa = require("../models/Empresa");

exports.generarFacturaPDF = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_venta: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		// Obtener la venta con todos sus detalles
		const venta = await Venta.findOne({
			where: whereClause,
			include: [
				{
					model: Cliente,
					as: "cliente",
					attributes: ["nombre", "nit", "email", "telefono"],
				},
				{
					model: Usuario,
					as: "usuario",
					attributes: ["nombre", "apellido"],
				},
				{
					model: DetalleVenta,
					as: "detalles",
					include: [
						{
							model: Producto,
							as: "producto",
							attributes: ["codigo", "nombre", "descripcion"],
						},
					],
				},
				{
					model: Empresa,
					as: "empresa",
					attributes: ["nombre", "nit", "email", "telefono", "direccion"],
				},
			],
		});

		if (!venta) {
			return res.status(404).json({
				success: false,
				mensaje: "Venta no encontrada",
			});
		}

		if (venta.estado !== "COMPLETADA") {
			return res.status(400).json({
				success: false,
				mensaje: "Solo se pueden generar facturas de ventas completadas",
			});
		}

		// Crear el documento PDF
		const doc = new PDFDocument({ margin: 50, size: "LETTER" });

		// Configurar headers para descarga
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=factura-${venta.numero_venta}.pdf`,
		);

		// Pipe del PDF a la respuesta
		doc.pipe(res);

		// ====================
		// ENCABEZADO
		// ====================
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text(venta.empresa.nombre.toUpperCase(), { align: "center" });

		doc.fontSize(10).font("Helvetica").moveDown(0.5);

		if (venta.empresa.nit) {
			doc.text(`NIT: ${venta.empresa.nit}`, { align: "center" });
		}
		if (venta.empresa.direccion) {
			doc.text(venta.empresa.direccion, { align: "center" });
		}
		if (venta.empresa.telefono) {
			doc.text(`Tel: ${venta.empresa.telefono}`, { align: "center" });
		}
		if (venta.empresa.email) {
			doc.text(venta.empresa.email, { align: "center" });
		}

		doc.moveDown(1);

		// Línea separadora
		doc
			.strokeColor("#667eea")
			.lineWidth(2)
			.moveTo(50, doc.y)
			.lineTo(562, doc.y)
			.stroke();

		doc.moveDown(1);

		// ====================
		// INFORMACIÓN DE LA FACTURA
		// ====================
		doc
			.fontSize(16)
			.font("Helvetica-Bold")
			.text("FACTURA", { align: "center" });

		doc.moveDown(0.5);

		const infoY = doc.y;
		doc.fontSize(10).font("Helvetica");

		// Columna izquierda
		doc.text(`N° Factura: ${venta.numero_venta}`, 50, infoY);
		doc.text(
			`Fecha: ${new Date(venta.fecha_venta).toLocaleDateString("es-BO", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})}`,
			50,
		);
		doc.text(`Vendedor: ${venta.usuario.nombre} ${venta.usuario.apellido}`, 50);

		// Columna derecha
		if (venta.cliente) {
			doc.text(`Cliente: ${venta.cliente.nombre}`, 300, infoY);
			if (venta.cliente.nit) {
				doc.text(`NIT/CI: ${venta.cliente.nit}`, 300);
			}
			if (venta.cliente.telefono) {
				doc.text(`Teléfono: ${venta.cliente.telefono}`, 300);
			}
		} else {
			doc.text("Cliente: VENTA SIN CLIENTE", 300, infoY);
		}

		doc.moveDown(2);

		// ====================
		// TABLA DE PRODUCTOS
		// ====================
		const tableTop = doc.y;
		const itemHeight = 25;

		// Encabezado de tabla
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fillColor("#ffffff")
			.rect(50, tableTop, 512, 20)
			.fill("#667eea");

		doc.fillColor("#ffffff");
		doc.text("Cant.", 60, tableTop + 5, { width: 40 });
		doc.text("Código", 110, tableTop + 5, { width: 70 });
		doc.text("Descripción", 190, tableTop + 5, { width: 200 });
		doc.text("P. Unit.", 400, tableTop + 5, { width: 60, align: "right" });
		doc.text("Subtotal", 480, tableTop + 5, { width: 70, align: "right" });

		// Línea debajo del encabezado
		doc.strokeColor("#667eea").lineWidth(1);
		const headerBottom = tableTop + 20;

		// Productos
		let currentY = headerBottom + 5;
		doc.fillColor("#000000").font("Helvetica");

		venta.detalles.forEach((detalle, index) => {
			if (currentY > 700) {
				// Nueva página si es necesario
				doc.addPage();
				currentY = 50;
			}

			const subtotal = parseFloat(detalle.precio_unitario) * detalle.cantidad;

			// Fondo alternado para filas
			if (index % 2 === 0) {
				doc
					.fillColor("#f8f9fa")
					.rect(50, currentY - 5, 512, itemHeight)
					.fill();
			}

			doc.fillColor("#000000");
			doc.text(detalle.cantidad, 60, currentY, { width: 40 });
			doc.text(detalle.producto.codigo || "-", 110, currentY, { width: 70 });
			doc.text(detalle.producto.nombre, 190, currentY, {
				width: 200,
				height: itemHeight,
			});
			doc.text(
				`Bs. ${parseFloat(detalle.precio_unitario).toFixed(2)}`,
				400,
				currentY,
				{
					width: 60,
					align: "right",
				},
			);
			doc.text(`Bs. ${subtotal.toFixed(2)}`, 480, currentY, {
				width: 70,
				align: "right",
			});

			currentY += itemHeight;
		});

		// Línea final de tabla
		doc
			.strokeColor("#667eea")
			.lineWidth(1)
			.moveTo(50, currentY)
			.lineTo(562, currentY)
			.stroke();

		currentY += 15;

		// ====================
		// TOTALES
		// ====================
		const totalX = 400;

		doc.fontSize(10).font("Helvetica");
		doc.text(`Subtotal:`, totalX, currentY, { width: 80 });
		doc.text(
			`Bs. ${parseFloat(venta.total).toFixed(2)}`,
			totalX + 90,
			currentY,
			{ width: 80, align: "right" },
		);

		if (venta.descuento && parseFloat(venta.descuento) > 0) {
			currentY += 20;
			doc.text(`Descuento:`, totalX, currentY, { width: 80 });
			doc.text(
				`Bs. ${parseFloat(venta.descuento).toFixed(2)}`,
				totalX + 90,
				currentY,
				{ width: 80, align: "right" },
			);
		}

		currentY += 20;

		// Total final destacado
		doc
			.fillColor("#667eea")
			.rect(totalX - 10, currentY - 5, 180, 30)
			.fill();

		doc
			.fontSize(14)
			.font("Helvetica-Bold")
			.fillColor("#ffffff")
			.text("TOTAL:", totalX, currentY + 5, { width: 80 });
		doc.text(
			`Bs. ${(parseFloat(venta.total) - parseFloat(venta.descuento || 0)).toFixed(2)}`,
			totalX + 90,
			currentY + 5,
			{ width: 80, align: "right" },
		);

		currentY += 50;

		// ====================
		// INFORMACIÓN ADICIONAL
		// ====================
		doc.fillColor("#000000").fontSize(10).font("Helvetica");

		if (venta.metodo_pago) {
			currentY += 10;
			doc.text(`Método de pago: ${venta.metodo_pago}`, 50, currentY);
		}

		if (venta.observaciones) {
			currentY += 15;
			doc.font("Helvetica-Bold").text("Observaciones:", 50, currentY);
			currentY += 15;
			doc.font("Helvetica").text(venta.observaciones, 50, currentY, {
				width: 500,
				align: "justify",
			});
		}

		// ====================
		// PIE DE PÁGINA
		// ====================
		const pageBottom = 720;
		doc
			.fontSize(8)
			.font("Helvetica-Oblique")
			.fillColor("#666666")
			.text("Gracias por su compra", 50, pageBottom, {
				align: "center",
				width: 512,
			});
		doc.text(
			`Documento generado el ${new Date().toLocaleDateString("es-BO")}`,
			50,
			pageBottom + 12,
			{ align: "center", width: 512 },
		);

		// Finalizar el documento
		doc.end();
	} catch (error) {
		console.error("Error al generar factura PDF:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar factura",
			error: error.message,
		});
	}
};
