const PDFDocument = require("pdfkit");
const Compra = require("../models/Compra");
const DetalleCompra = require("../models/DetalleCompra");
const Producto = require("../models/Producto");
const Proveedor = require("../models/Proveedor");
const Usuario = require("../models/Usuario");
const Empresa = require("../models/Empresa");

// Generar PDF de compra
exports.generarPDFCompra = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		// Obtener compra con todos los detalles
		const compra = await Compra.findOne({
			where: {
				id_compra: id,
				id_empresa,
			},
			include: [
				{ model: Proveedor, as: "proveedor" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleCompra,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
				{ model: Empresa, as: "empresa" },
			],
		});

		if (!compra) {
			return res.status(404).json({
				success: false,
				mensaje: "Compra no encontrada",
			});
		}

		// Crear documento PDF
		const doc = new PDFDocument({ margin: 50 });

		// Headers para descarga
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=compra-${compra.numero_compra}.pdf`,
		);

		// Pipe del PDF a la respuesta
		doc.pipe(res);

		// ============================================
		// ENCABEZADO
		// ============================================
		doc.fontSize(20).text("ORDEN DE COMPRA", { align: "center" });
		doc.moveDown();

		// Información de la empresa
		if (compra.empresa) {
			doc.fontSize(12).text(compra.empresa.nombre, { align: "center" });
			if (compra.empresa.nit) {
				doc
					.fontSize(10)
					.text(`NIT: ${compra.empresa.nit}`, { align: "center" });
			}
			if (compra.empresa.direccion) {
				doc.fontSize(10).text(compra.empresa.direccion, { align: "center" });
			}
		}

		doc.moveDown();
		doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
		doc.moveDown();

		// ============================================
		// INFORMACIÓN DE LA COMPRA
		// ============================================
		doc.fontSize(12).text(`N° Compra: ${compra.numero_compra}`, 50);
		doc.text(
			`Fecha: ${new Date(compra.fecha_compra).toLocaleString("es-BO")}`,
			50,
		);
		doc.text(`Estado: ${compra.estado}`, 50);
		doc.moveDown();

		// Información del proveedor
		if (compra.proveedor) {
			doc.fontSize(12).text("PROVEEDOR:", 50);
			doc.fontSize(10).text(`Nombre: ${compra.proveedor.nombre}`);
			if (compra.proveedor.nit) {
				doc.text(`NIT: ${compra.proveedor.nit}`);
			}
			if (compra.proveedor.telefono) {
				doc.text(`Teléfono: ${compra.proveedor.telefono}`);
			}
			if (compra.proveedor.email) {
				doc.text(`Email: ${compra.proveedor.email}`);
			}
		} else {
			doc.fontSize(12).text("PROVEEDOR: Sin proveedor", 50);
		}

		doc.moveDown();
		doc.text(
			`Responsable: ${compra.usuario.nombre} ${compra.usuario.apellido}`,
		);
		doc.moveDown();

		// ============================================
		// TABLA DE PRODUCTOS
		// ============================================
		doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
		doc.moveDown();

		// Encabezados de tabla
		const tableTop = doc.y;
		doc.fontSize(10).font("Helvetica-Bold");
		doc.text("Producto", 50, tableTop);
		doc.text("Cantidad", 250, tableTop);
		doc.text("P. Unitario", 330, tableTop);
		doc.text("Subtotal", 430, tableTop);

		doc.font("Helvetica");
		doc
			.moveTo(50, doc.y + 5)
			.lineTo(550, doc.y + 5)
			.stroke();

		// Productos
		let y = doc.y + 10;
		compra.detalles.forEach((detalle) => {
			if (y > 700) {
				doc.addPage();
				y = 50;
			}

			const nombreProducto = detalle.producto
				? detalle.producto.nombre
				: "Producto no encontrado";

			doc.fontSize(9).text(nombreProducto, 50, y, { width: 180 });
			doc.text(detalle.cantidad.toString(), 250, y);
			doc.text(`Bs. ${parseFloat(detalle.precio_unitario).toFixed(2)}`, 330, y);
			doc.text(`Bs. ${parseFloat(detalle.subtotal).toFixed(2)}`, 430, y);

			y += 20;
		});

		doc.y = y + 10;
		doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
		doc.moveDown();

		// ============================================
		// TOTALES
		// ============================================
		doc.fontSize(12).font("Helvetica-Bold");
		doc.text(`TOTAL: Bs. ${parseFloat(compra.total).toFixed(2)}`, 430, doc.y);

		doc.moveDown(2);
		doc.font("Helvetica").fontSize(9);

		// Estado de recepción
		if (compra.estado === "PENDIENTE") {
			doc
				.fillColor("red")
				.text("⚠️ PRODUCTOS PENDIENTES DE RECEPCIÓN", 50, doc.y, {
					align: "center",
				});
			doc
				.fillColor("black")
				.fontSize(8)
				.text("El stock NO ha sido actualizado", 50, doc.y, {
					align: "center",
				});
		} else if (compra.estado === "RECIBIDA") {
			doc
				.fillColor("green")
				.text("✅ PRODUCTOS RECIBIDOS - Stock actualizado", 50, doc.y, {
					align: "center",
				});
			doc.fillColor("black");
		} else if (compra.estado === "ANULADA") {
			doc
				.fillColor("red")
				.text("❌ COMPRA ANULADA", 50, doc.y, { align: "center" });
			doc.fillColor("black");
		}

		doc.moveDown(2);

		// Observaciones
		if (compra.observaciones) {
			doc.fontSize(9).text("Observaciones:", 50);
			doc.fontSize(8).text(compra.observaciones, 50, doc.y, { width: 500 });
		}

		// ============================================
		// PIE DE PÁGINA
		// ============================================
		doc.fontSize(8).fillColor("gray");
		doc.text(
			`Documento generado el ${new Date().toLocaleString("es-BO")}`,
			50,
			doc.page.height - 50,
			{ align: "center" },
		);

		// Finalizar PDF
		doc.end();
	} catch (error) {
		console.error("Error al generar PDF de compra:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar PDF de compra",
			error: error.message,
		});
	}
};
