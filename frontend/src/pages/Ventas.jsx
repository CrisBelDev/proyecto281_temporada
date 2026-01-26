import { useState, useEffect } from "react";
import { ventasService } from "../services";
import { useAuth } from "../context/AuthContext";
import ModalNuevaVenta from "../components/ModalNuevaVenta";
import "../styles/Ventas.css";

function Ventas() {
	const { isAdmin, canSell } = useAuth();
	const [ventas, setVentas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalNuevaVentaAbierto, setModalNuevaVentaAbierto] = useState(false);

	useEffect(() => {
		cargarVentas();
	}, []);

	const cargarVentas = async () => {
		try {
			const response = await ventasService.obtenerTodas();
			if (response.success) {
				setVentas(response.data);
			}
		} catch (error) {
			console.error("Error al cargar ventas:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAnular = async (id) => {
		if (
			window.confirm(
				"¿Está seguro de anular esta venta? Se devolverá el stock.",
			)
		) {
			try {
				await ventasService.anular(id);
				await cargarVentas();
				alert("Venta anulada exitosamente");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al anular venta");
			}
		}
	};

	const handleDescargarFactura = async (id, numero_venta) => {
		try {
			const token = localStorage.getItem("token");

			const response = await fetch(
				`http://localhost:3000/api/ventas/${id}/factura/pdf`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.mensaje || "Error al descargar factura");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `factura-${numero_venta}.pdf`;
			document.body.appendChild(a);
			a.click();

			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			alert(error.message || "Error al descargar factura");
			console.error("Error:", error);
		}
	};

	const formatFecha = (fecha) => {
		return new Date(fecha).toLocaleString("es-BO");
	};

	if (loading) {
		return <div className="loading">Cargando ventas...</div>;
	}

	return (
		<div className="ventas-page">
			<div className="page-header">
				<h1>Ventas</h1>
				{canSell() && (
					<button
						onClick={() => setModalNuevaVentaAbierto(true)}
						className="btn btn-primary"
					>
						+ Nueva Venta
					</button>
				)}
			</div>

			<ModalNuevaVenta
				isOpen={modalNuevaVentaAbierto}
				onClose={() => setModalNuevaVentaAbierto(false)}
				onVentaCreada={cargarVentas}
			/>

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							<th>N° Venta</th>
							<th>Fecha</th>
							<th>Cliente</th>
							<th>Vendedor</th>
							<th>Subtotal</th>
							<th>Descuento</th>
							<th>Total</th>
							<th>Método Pago</th>
							<th>Estado</th>
							{isAdmin() && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{ventas.map((venta) => (
							<tr key={venta.id_venta}>
								<td>{venta.numero_venta}</td>
								<td>{formatFecha(venta.fecha_venta)}</td>
								<td>{venta.cliente?.nombre || "Sin cliente"}</td>
								<td>
									{venta.usuario?.nombre} {venta.usuario?.apellido}
								</td>
								<td>Bs. {parseFloat(venta.subtotal).toFixed(2)}</td>
								<td>Bs. {parseFloat(venta.descuento).toFixed(2)}</td>
								<td>Bs. {parseFloat(venta.total).toFixed(2)}</td>
								<td>{venta.metodo_pago}</td>
								<td>
									<span
										className={`badge ${
											venta.estado === "COMPLETADA"
												? "badge-success"
												: "badge-danger"
										}`}
									>
										{venta.estado}
									</span>
								</td>

								{isAdmin() && (
									<td>
										<div className="acciones-venta">
											{venta.estado === "COMPLETADA" && (
												<>
													<button
														onClick={() =>
															handleDescargarFactura(
																venta.id_venta,
																venta.numero_venta,
															)
														}
														className="btn-icon btn-pdf"
														title="Descargar Factura PDF"
													>
														📄
													</button>

													<button
														onClick={() => handleAnular(venta.id_venta)}
														className="btn-icon btn-danger"
														title="Anular"
													>
														❌
													</button>
												</>
											)}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Ventas;
