import { useState, useEffect } from "react";
import "../styles/Notificaciones.css";

function Notificaciones() {
	const [notificaciones, setNotificaciones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filtro, setFiltro] = useState("todas");
	const [noLeidas, setNoLeidas] = useState(0);

	useEffect(() => {
		cargarNotificaciones();
		const interval = setInterval(cargarNotificaciones, 30000); // Actualizar cada 30s
		return () => clearInterval(interval);
	}, [filtro]);

	const cargarNotificaciones = async () => {
		try {
			const token = localStorage.getItem("token");
			const soloNoLeidas = filtro === "no-leidas" ? "true" : "false";
			const response = await fetch(
				`http://localhost:3000/api/notificaciones?solo_no_leidas=${soloNoLeidas}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			if (data.success) {
				setNotificaciones(data.data);
				setNoLeidas(data.no_leidas);
			}
		} catch (error) {
			console.error("Error al cargar notificaciones:", error);
		} finally {
			setLoading(false);
		}
	};

	const marcarComoLeida = async (id) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`http://localhost:3000/api/notificaciones/${id}/leida`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			if (data.success) {
				cargarNotificaciones();
			}
		} catch (error) {
			console.error("Error al marcar notificación:", error);
		}
	};

	const marcarTodasLeidas = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				"http://localhost:3000/api/notificaciones/todas/leidas",
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			if (data.success) {
				alert(data.mensaje);
				cargarNotificaciones();
			}
		} catch (error) {
			console.error("Error al marcar todas:", error);
		}
	};

	const eliminarNotificacion = async (id) => {
		if (window.confirm("¿Desea eliminar esta notificación?")) {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					`http://localhost:3000/api/notificaciones/${id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				const data = await response.json();
				if (data.success) {
					cargarNotificaciones();
				}
			} catch (error) {
				console.error("Error al eliminar notificación:", error);
			}
		}
	};

	const limpiarNotificaciones = async () => {
		if (
			window.confirm(
				"¿Desea eliminar todas las notificaciones leídas antiguas (más de 30 días)?",
			)
		) {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					"http://localhost:3000/api/notificaciones?dias=30",
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				const data = await response.json();
				if (data.success) {
					alert(data.mensaje);
					cargarNotificaciones();
				}
			} catch (error) {
				console.error("Error al limpiar notificaciones:", error);
			}
		}
	};

	const getTipoColor = (tipo) => {
		const colores = {
			STOCK_BAJO: "warning",
			VENTA: "success",
			COMPRA: "info",
			SISTEMA: "primary",
		};
		return colores[tipo] || "default";
	};

	const getTipoIcono = (tipo) => {
		const iconos = {
			STOCK_BAJO: "⚠️",
			VENTA: "💰",
			COMPRA: "📦",
			SISTEMA: "🔔",
		};
		return iconos[tipo] || "📢";
	};

	const formatearFecha = (fecha) => {
		const date = new Date(fecha);
		const ahora = new Date();
		const diff = ahora - date;
		const minutos = Math.floor(diff / 60000);
		const horas = Math.floor(diff / 3600000);
		const dias = Math.floor(diff / 86400000);

		if (minutos < 1) return "Ahora";
		if (minutos < 60) return `Hace ${minutos} min`;
		if (horas < 24) return `Hace ${horas} h`;
		if (dias < 7) return `Hace ${dias} días`;
		return date.toLocaleDateString("es-ES");
	};

	if (loading) {
		return <div className="loading">Cargando notificaciones...</div>;
	}

	return (
		<div className="notificaciones-page">
			<div className="page-header">
				<h1>
					Notificaciones
					{noLeidas > 0 && <span className="badge-count">{noLeidas}</span>}
				</h1>
				<div className="header-actions">
					<select
						value={filtro}
						onChange={(e) => setFiltro(e.target.value)}
						className="filter-select"
					>
						<option value="todas">Todas</option>
						<option value="no-leidas">No leídas</option>
					</select>
					{noLeidas > 0 && (
						<button onClick={marcarTodasLeidas} className="btn btn-secondary">
							Marcar todas como leídas
						</button>
					)}
					<button onClick={limpiarNotificaciones} className="btn btn-outline">
						Limpiar antiguas
					</button>
				</div>
			</div>

			<div className="notificaciones-lista">
				{notificaciones.length === 0 ? (
					<div className="empty-state">
						<p>
							{filtro === "no-leidas"
								? "No hay notificaciones sin leer"
								: "No hay notificaciones"}
						</p>
					</div>
				) : (
					notificaciones.map((notif) => (
						<div
							key={notif.id_notificacion}
							className={`notificacion-card ${!notif.leida ? "no-leida" : ""}`}
						>
							<div className="notificacion-icon">
								{getTipoIcono(notif.tipo)}
							</div>
							<div className="notificacion-content">
								<div className="notificacion-header">
									<h3>{notif.titulo}</h3>
									<span
										className={`tipo-badge tipo-${getTipoColor(notif.tipo)}`}
									>
										{notif.tipo.replace("_", " ")}
									</span>
								</div>
								<p className="notificacion-mensaje">{notif.mensaje}</p>
								<div className="notificacion-footer">
									<span className="notificacion-fecha">
										{formatearFecha(notif.fecha_creacion)}
									</span>
									{notif.usuario && (
										<span className="notificacion-usuario">
											{notif.usuario.nombre}
										</span>
									)}
								</div>
							</div>
							<div className="notificacion-actions">
								{!notif.leida && (
									<button
										onClick={() => marcarComoLeida(notif.id_notificacion)}
										className="btn-icon"
										title="Marcar como leída"
									>
										✓
									</button>
								)}
								<button
									onClick={() => eliminarNotificacion(notif.id_notificacion)}
									className="btn-icon btn-danger"
									title="Eliminar"
								>
									🗑️
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default Notificaciones;
