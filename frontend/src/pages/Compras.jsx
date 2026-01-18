import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { comprasService } from "../services";
import { useAuth } from "../context/AuthContext";
import "../styles/Compras.css";

function Compras() {
	const { isAdmin } = useAuth();
	const [compras, setCompras] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		cargarCompras();
	}, []);

	const cargarCompras = async () => {
		try {
			const response = await comprasService.obtenerTodas();
			if (response.success) {
				setCompras(response.data);
			}
		} catch (error) {
			console.error("Error al cargar compras:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAnular = async (id) => {
		if (
			window.confirm(
				"¿Está seguro de anular esta compra? Se descontará el stock.",
			)
		) {
			try {
				await comprasService.anular(id);
				cargarCompras();
				alert("Compra anulada exitosamente");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al anular compra");
			}
		}
	};

	const formatFecha = (fecha) => {
		return new Date(fecha).toLocaleString("es-BO");
	};

	if (loading) {
		return <div className="loading">Cargando compras...</div>;
	}

	return (
		<div className="compras-page">
			<div className="page-header">
				<h1>Compras</h1>
				{isAdmin() && (
					<Link to="/compras/nueva" className="btn btn-primary">
						+ Nueva Compra
					</Link>
				)}
			</div>

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							<th>N° Compra</th>
							<th>Fecha</th>
							<th>Proveedor</th>
							<th>Usuario</th>
							<th>Total</th>
							<th>Estado</th>
							{isAdmin() && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{compras.map((compra) => (
							<tr key={compra.id_compra}>
								<td>{compra.numero_compra}</td>
								<td>{formatFecha(compra.fecha_compra)}</td>
								<td>{compra.proveedor?.nombre || "Sin proveedor"}</td>
								<td>
									{compra.usuario?.nombre} {compra.usuario?.apellido}
								</td>
								<td>Bs. {parseFloat(compra.total).toFixed(2)}</td>
								<td>
									<span
										className={`badge ${compra.estado === "COMPLETADA" ? "badge-success" : "badge-danger"}`}
									>
										{compra.estado}
									</span>
								</td>
								{isAdmin() && (
									<td>
										{compra.estado === "COMPLETADA" && (
											<button
												onClick={() => handleAnular(compra.id_compra)}
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

export default Compras;
