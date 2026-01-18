import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ventasService } from "../services";
import { useAuth } from "../context/AuthContext";
import "../styles/Ventas.css";

function Ventas() {
	const { isAdmin } = useAuth();
	const [ventas, setVentas] = useState([]);
	const [loading, setLoading] = useState(true);

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
				cargarVentas();
				alert("Venta anulada exitosamente");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al anular venta");
			}
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
				<Link to="/ventas/nueva" className="btn btn-primary">
					+ Nueva Venta
				</Link>
			</div>

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
										className={`badge ${venta.estado === "COMPLETADA" ? "badge-success" : "badge-danger"}`}
									>
										{venta.estado}
									</span>
								</td>
								{isAdmin() && (
									<td>
										{venta.estado === "COMPLETADA" && (
											<button
												onClick={() => handleAnular(venta.id_venta)}
												className="btn-icon"
												title="Anular"
											>
												❌
											</button>
										)}
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
