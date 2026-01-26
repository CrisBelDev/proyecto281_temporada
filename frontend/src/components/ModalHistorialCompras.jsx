import { useState, useEffect } from "react";
import { proveedoresService } from "../services";
import "./ModalHistorialCompras.css";

const ModalHistorialCompras = ({ proveedor, onClose }) => {
	const [historial, setHistorial] = useState(null);
	const [loading, setLoading] = useState(true);
	const [filtroEstado, setFiltroEstado] = useState("TODOS");

	useEffect(() => {
		cargarHistorial();
	}, []);

	const cargarHistorial = async () => {
		try {
			setLoading(true);
			const data = await proveedoresService.obtenerHistorialCompras(
				proveedor.id_proveedor,
			);
			setHistorial(data);
		} catch (error) {
			console.error("Error al cargar historial:", error);
			alert("Error al cargar historial de compras");
		} finally {
			setLoading(false);
		}
	};

	const comprasFiltradas = historial?.compras
		? filtroEstado === "TODOS"
			? historial.compras
			: historial.compras.filter((c) => c.estado === filtroEstado)
		: [];

	const formatearFecha = (fecha) => {
		return new Date(fecha).toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const getEstadoColor = (estado) => {
		switch (estado) {
			case "COMPLETADA":
				return "estado-completada";
			case "PENDIENTE":
				return "estado-pendiente";
			case "ANULADA":
				return "estado-anulada";
			default:
				return "";
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content-historial"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>📊 Historial de Compras - {proveedor.nombre}</h2>
					<button className="btn-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="modal-body-historial">
					{loading ? (
						<div className="loading">Cargando historial...</div>
					) : !historial ? (
						<div className="no-data">Error al cargar datos</div>
					) : (
						<>
							{/* Estadísticas */}
							<div className="estadisticas-grid">
								<div className="estadistica-card">
									<div className="estadistica-icono">📦</div>
									<div className="estadistica-info">
										<div className="estadistica-valor">
											{historial.estadisticas?.total_compras || 0}
										</div>
										<div className="estadistica-label">Total Compras</div>
									</div>
								</div>

								<div className="estadistica-card">
									<div className="estadistica-icono">✅</div>
									<div className="estadistica-info">
										<div className="estadistica-valor">
											{historial.estadisticas?.compras_completadas || 0}
										</div>
										<div className="estadistica-label">Completadas</div>
									</div>
								</div>

								<div className="estadistica-card">
									<div className="estadistica-icono">💰</div>
									<div className="estadistica-info">
										<div className="estadistica-valor">
											$
											{parseFloat(
												historial.estadisticas?.monto_total || 0,
											).toFixed(2)}
										</div>
										<div className="estadistica-label">Monto Total</div>
									</div>
								</div>
							</div>

							{/* Filtros */}
							<div className="filtros-historial">
								<label>Filtrar por estado:</label>
								<div className="filtro-buttons">
									<button
										className={`filtro-btn ${filtroEstado === "TODOS" ? "active" : ""}`}
										onClick={() => setFiltroEstado("TODOS")}
									>
										Todos
									</button>
									<button
										className={`filtro-btn ${filtroEstado === "COMPLETADA" ? "active" : ""}`}
										onClick={() => setFiltroEstado("COMPLETADA")}
									>
										Completadas
									</button>
									<button
										className={`filtro-btn ${filtroEstado === "PENDIENTE" ? "active" : ""}`}
										onClick={() => setFiltroEstado("PENDIENTE")}
									>
										Pendientes
									</button>
									<button
										className={`filtro-btn ${filtroEstado === "ANULADA" ? "active" : ""}`}
										onClick={() => setFiltroEstado("ANULADA")}
									>
										Anuladas
									</button>
								</div>
							</div>

							{/* Lista de compras */}
							{comprasFiltradas.length === 0 ? (
								<div className="no-data">No hay compras registradas</div>
							) : (
								<div className="compras-list">
									{comprasFiltradas.map((compra) => (
										<div key={compra.id_compra} className="compra-item">
											<div className="compra-header-item">
												<div className="compra-numero">
													Compra #{compra.numero_compra || compra.id_compra}
												</div>
												<span
													className={`estado-badge ${getEstadoColor(compra.estado)}`}
												>
													{compra.estado}
												</span>
											</div>

											<div className="compra-info-grid">
												<div className="compra-info-item">
													<strong>📅 Fecha:</strong>{" "}
													{formatearFecha(compra.fecha_compra)}
												</div>
												<div className="compra-info-item">
													<strong>💰 Total:</strong> $
													{parseFloat(compra.total).toFixed(2)}
												</div>
												{compra.descuento > 0 && (
													<div className="compra-info-item">
														<strong>🏷️ Descuento:</strong> $
														{parseFloat(compra.descuento).toFixed(2)}
													</div>
												)}
												{compra.observaciones && (
													<div className="compra-info-item full-width">
														<strong>📝 Observaciones:</strong>{" "}
														{compra.observaciones}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>

				<div className="modal-footer">
					<button className="btn-cerrar" onClick={onClose}>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModalHistorialCompras;
