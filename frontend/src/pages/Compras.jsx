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

	const handleMarcarRecibida = async (id) => {
		if (
			window.confirm(
				"¿Marcar productos como recibidos? Esto actualizará el stock.",
			)
		) {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					`http://localhost:3000/api/compras/${id}/recibir`,
					{
						method: "PATCH",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				const data = await response.json();
				if (data.success) {
					alert("✅ Productos recibidos y stock actualizado");
					cargarCompras();
				} else {
					alert(data.mensaje || "Error al marcar como recibida");
				}
			} catch (error) {
				alert("Error al marcar como recibida");
			}
		}
	};

	const handleDescargarPDF = async (id, numero_compra) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`http://localhost:3000/api/compras/${id}/pdf`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.mensaje || "Error al descargar PDF");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `compra-${numero_compra}.pdf`;
			document.body.appendChild(a);
			a.click();

			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			alert(error.message || "Error al descargar PDF");
			console.error("Error:", error);
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
										className={`badge ${
											compra.estado === "RECIBIDA"
												? "badge-success"
												: compra.estado === "PENDIENTE"
													? "badge-warning"
													: "badge-danger"
										}`}
									>
										{compra.estado}
									</span>
								</td>
								{isAdmin() && (
									<td>
										<div className="acciones-compra">
											<button
												onClick={() =>
													handleDescargarPDF(
														compra.id_compra,
														compra.numero_compra,
													)
												}
												className="btn-icon btn-pdf"
												title="Descargar PDF"
											>
												📄
											</button>

											{compra.estado === "PENDIENTE" && (
												<button
													onClick={() => handleMarcarRecibida(compra.id_compra)}
													className="btn-icon btn-success"
													title="Marcar productos recibidos"
												>
													📦 Recibir
												</button>
											)}

											{compra.estado !== "ANULADA" && (
												<button
													onClick={() => handleAnular(compra.id_compra)}
													className="btn-icon btn-danger"
													title="Anular"
												>
													❌
												</button>
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

export default Compras;
