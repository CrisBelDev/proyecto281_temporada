import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import api from "../services/api";
import "../styles/MiEmpresa.css";

function MiEmpresa() {
	const { user } = useAuth();
	const [empresa, setEmpresa] = useState(null);
	const [loading, setLoading] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [logoSeleccionado, setLogoSeleccionado] = useState(null);
	const [previsualizacion, setPrevisualizacion] = useState(null);
	const [mostrarModalPlan, setMostrarModalPlan] = useState(false);
	const [planSeleccionado, setPlanSeleccionado] = useState(null);
	const [metodoPago, setMetodoPago] = useState("QR");
	const [historialPagos, setHistorialPagos] = useState([]);
	const [mostrarHistorial, setMostrarHistorial] = useState(false);
	const [formData, setFormData] = useState({
		nombre: "",
		nit: "",
		telefono: "",
		direccion: "",
		email: "",
		horario_apertura: "",
		horario_cierre: "",
		dias_atencion: "",
	});

	useEffect(() => {
		cargarEmpresa();
	}, []);

	const cargarEmpresa = async () => {
		try {
			const response = await api.get("/empresas/mi-empresa");
			if (response.data.success) {
				const empresaData = response.data.data;
				setEmpresa(empresaData);
				setFormData({
					nombre: empresaData.nombre || "",
					nit: empresaData.nit || "",
					telefono: empresaData.telefono || "",
					direccion: empresaData.direccion || "",
					email: empresaData.email || "",
					horario_apertura: empresaData.horario_apertura || "",
					horario_cierre: empresaData.horario_cierre || "",
					dias_atencion: empresaData.dias_atencion || "",
				});
				if (empresaData.logo) {
					setPrevisualizacion(`http://localhost:3000${empresaData.logo}`);
				}
			}
		} catch (error) {
			console.error("Error al cargar empresa:", error);
			alert("Error al cargar datos de la empresa");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				alert("Por favor selecciona un archivo de imagen");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				alert("La imagen no debe superar 5MB");
				return;
			}
			setLogoSeleccionado(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPrevisualizacion(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		try {
			const formDataToSend = new FormData();

			Object.keys(formData).forEach((key) => {
				if (formData[key] !== "") {
					formDataToSend.append(key, formData[key]);
				}
			});

			if (logoSeleccionado) {
				formDataToSend.append("logo", logoSeleccionado);
			}

			await api.put("/empresas/mi-empresa", formDataToSend, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			alert("Empresa actualizada exitosamente");
			setLogoSeleccionado(null);
			cargarEmpresa();
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al actualizar empresa");
		} finally {
			setGuardando(false);
		}
	};

	const planes = {
		BASICO: {
			nombre: "Plan Básico",
			precio: 50.0,
			caracteristicas: [
				"Hasta 100 productos",
				"1 usuario adicional",
				"Reportes básicos",
				"Soporte por email",
			],
		},
		PREMIUM: {
			nombre: "Plan Premium",
			precio: 150.0,
			caracteristicas: [
				"Productos ilimitados",
				"Usuarios ilimitados",
				"Reportes avanzados",
				"Soporte prioritario 24/7",
				"Módulo de análisis",
				"API personalizada",
			],
		},
		EMPRESARIAL: {
			nombre: "Plan Empresarial",
			precio: 300.0,
			caracteristicas: [
				"Todo lo de Premium",
				"Múltiples sucursales",
				"Integración ERP",
				"Soporte dedicado",
				"Capacitación personalizada",
				"SLA garantizado",
				"Auditoría y respaldos",
			],
		},
	};

	const handleCambiarPlan = async () => {
		if (!planSeleccionado) return;

		if (
			!window.confirm(
				`¿Confirmas el cambio al ${planes[planSeleccionado].nombre}?\n\nMonto: Bs. ${planes[planSeleccionado].precio}\nMétodo: ${metodoPago}`,
			)
		) {
			return;
		}

		setGuardando(true);
		try {
			const response = await api.post("/empresas/mi-empresa/cambiar-plan", {
				plan_nuevo: planSeleccionado,
				metodo_pago: metodoPago,
			});

			if (response.data.success) {
				alert(
					`¡Plan actualizado exitosamente!\n\n` +
						`Nuevo plan: ${response.data.data.empresa.plan_suscripcion}\n` +
						`Monto pagado: Bs. ${response.data.data.pago.monto}\n` +
						`Válido hasta: ${new Date(response.data.data.pago.fecha_vencimiento).toLocaleDateString()}`,
				);
				setMostrarModalPlan(false);
				cargarEmpresa();
				cargarHistorialPagos(); // Recargar historial después del cambio
			}
		} catch (error) {
			alert(
				error.response?.data?.mensaje ||
					"Error al cambiar el plan de suscripción",
			);
		} finally {
			setGuardando(false);
		}
	};

	const cargarHistorialPagos = async () => {
		try {
			const response = await api.get("/empresas/mi-empresa/historial-pagos");
			if (response.data.success) {
				setHistorialPagos(response.data.data);
			}
		} catch (error) {
			console.error("Error al cargar historial:", error);
		}
	};

	if (loading) {
		return (
			<div className="mi-empresa-container">
				<div className="loading">Cargando...</div>
			</div>
		);
	}

	return (
		<div className="mi-empresa-container">
			<div className="mi-empresa-header">
				<h1>Mi Empresa</h1>
				<p className="subtitle">Administra la información de tu empresa</p>
			</div>

			<form onSubmit={handleSubmit} className="mi-empresa-form">
				{/* Logo Section */}
				<div className="logo-section">
					<h2>Logo de la Empresa</h2>
					<div className="logo-upload-container">
						<div className="logo-preview">
							{previsualizacion ? (
								<img src={previsualizacion} alt="Logo" />
							) : (
								<div className="logo-placeholder">
									<span className="logo-icon">🏪</span>
									<p>Sin logo</p>
								</div>
							)}
						</div>
						<div className="logo-upload-controls">
							<label htmlFor="logo-input" className="btn-upload-logo">
								{previsualizacion ? "Cambiar Logo" : "Subir Logo"}
							</label>
							<input
								id="logo-input"
								type="file"
								accept="image/*"
								onChange={handleLogoChange}
								style={{ display: "none" }}
							/>
							<p className="upload-hint">
								Formatos: JPG, PNG, GIF, WEBP. Máximo 5MB
							</p>
							{logoSeleccionado && (
								<span className="file-selected">✓ {logoSeleccionado.name}</span>
							)}
						</div>
					</div>
				</div>

				{/* Información General */}
				<div className="form-section">
					<h2>Información General</h2>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="nombre">Nombre de la Empresa *</label>
							<input
								type="text"
								id="nombre"
								name="nombre"
								value={formData.nombre}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="nit">NIT</label>
							<input
								type="text"
								id="nit"
								name="nit"
								value={formData.nit}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="telefono">Teléfono</label>
							<input
								type="tel"
								id="telefono"
								name="telefono"
								value={formData.telefono}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group full-width">
							<label htmlFor="direccion">Dirección</label>
							<input
								type="text"
								id="direccion"
								name="direccion"
								value={formData.direccion}
								onChange={handleChange}
							/>
						</div>
					</div>
				</div>

				{/* Horarios */}
				<div className="form-section">
					<h2>Horarios de Atención</h2>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="horario_apertura">Hora de Apertura</label>
							<input
								type="time"
								id="horario_apertura"
								name="horario_apertura"
								value={formData.horario_apertura}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="horario_cierre">Hora de Cierre</label>
							<input
								type="time"
								id="horario_cierre"
								name="horario_cierre"
								value={formData.horario_cierre}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group full-width">
							<label htmlFor="dias_atencion">Días de Atención</label>
							<input
								type="text"
								id="dias_atencion"
								name="dias_atencion"
								value={formData.dias_atencion}
								onChange={handleChange}
								placeholder="Ej: Lunes a Viernes"
							/>
						</div>
					</div>
				</div>

				{/* Información del Plan */}
				{empresa && (
					<div className="form-section planes-section">
						<h2>Gestión de Suscripción</h2>
						<div className="plan-actual-container">
							<div className="plan-actual-header">
								<div>
									<h3>Plan Actual</h3>
									<span className={`plan-badge ${empresa.plan_suscripcion}`}>
										{planes[empresa.plan_suscripcion]?.nombre}
									</span>
								</div>
								<div className="plan-precio">
									<span className="precio-label">Último pago:</span>
									<span className="precio-valor">Bs. {empresa.monto_pago}</span>
								</div>
							</div>

							<div className="planes-grid">
								{Object.entries(planes).map(([key, plan]) => (
									<div
										key={key}
										className={`plan-card ${empresa.plan_suscripcion === key ? "actual" : ""}`}
									>
										{empresa.plan_suscripcion === key && (
											<div className="plan-actual-badge">Plan Actual</div>
										)}
										<h4>{plan.nombre}</h4>
										<div className="plan-precio-card">
											<span className="precio-signo">Bs.</span>
											<span className="precio-monto">{plan.precio}</span>
											<span className="precio-periodo">/mes</span>
										</div>
										<ul className="plan-caracteristicas">
											{plan.caracteristicas.map((caracteristica, idx) => (
												<li key={idx}>
													<span className="check-icon">✓</span>
													{caracteristica}
												</li>
											))}
										</ul>
										{empresa.plan_suscripcion !== key && (
											<button
												type="button"
												className="btn-seleccionar-plan"
												onClick={() => {
													setPlanSeleccionado(key);
													setMostrarModalPlan(true);
												}}
											>
												Cambiar a este plan
											</button>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">Estado:</span>
								<span
									className={`status-badge ${empresa.activo ? "active" : "inactive"}`}
								>
									{empresa.activo ? "Activa" : "Inactiva"}
								</span>
							</div>
							<div className="info-item">
								<span className="info-label">Slug de Portal:</span>
								<span className="slug-value">{empresa.slug}</span>
							</div>
						</div>
					</div>
				)}

				{/* Historial de Suscripciones */}
				{empresa && (
					<div className="form-section historial-section">
						<div className="historial-header">
							<h2>Historial de Suscripciones</h2>
							<button
								type="button"
								className="btn-toggle-historial"
								onClick={() => {
									setMostrarHistorial(!mostrarHistorial);
									if (!mostrarHistorial && historialPagos.length === 0) {
										cargarHistorialPagos();
									}
								}}
							>
								{mostrarHistorial ? "Ocultar" : "Ver Historial"}
							</button>
						</div>

						{mostrarHistorial && (
							<div className="historial-content">
								{historialPagos.length === 0 ? (
									<p className="no-historial">
										No hay registros de cambios de plan
									</p>
								) : (
									<div className="tabla-historial-wrapper">
										<table className="tabla-historial">
											<thead>
												<tr>
													<th>Fecha</th>
													<th>Plan Anterior</th>
													<th>Plan Nuevo</th>
													<th>Monto</th>
													<th>Método</th>
													<th>Estado</th>
													<th>Vencimiento</th>
												</tr>
											</thead>
											<tbody>
												{historialPagos.map((pago) => (
													<tr key={pago.id_pago}>
														<td>
															{new Date(pago.fecha_pago).toLocaleDateString(
																"es-BO",
																{
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																},
															)}
														</td>
														<td>
															<span
																className={`badge-plan ${pago.plan_anterior}`}
															>
																{pago.plan_anterior || "N/A"}
															</span>
														</td>
														<td>
															<span className={`badge-plan ${pago.plan_nuevo}`}>
																{pago.plan_nuevo}
															</span>
														</td>
														<td className="monto">Bs. {pago.monto}</td>
														<td>{pago.metodo_pago}</td>
														<td>
															<span
																className={`badge-estado ${pago.estado_pago}`}
															>
																{pago.estado_pago}
															</span>
														</td>
														<td>
															{new Date(
																pago.fecha_vencimiento,
															).toLocaleDateString("es-BO", {
																year: "numeric",
																month: "short",
																day: "numeric",
															})}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Botones */}
				<div className="form-actions">
					<button type="submit" className="btn-save" disabled={guardando}>
						{guardando ? "Guardando..." : "Guardar Cambios"}
					</button>
				</div>
			</form>

			{/* Modal de Cambio de Plan */}
			<Modal
				isOpen={mostrarModalPlan}
				onClose={() => setMostrarModalPlan(false)}
				title="Confirmar Cambio de Plan"
			>
				<div className="modal-cambio-plan">
					<div className="plan-seleccionado-info">
						<h3>{planes[planSeleccionado]?.nombre}</h3>
						<div className="plan-precio-modal">
							<span>Bs. {planes[planSeleccionado]?.precio}</span>
							<span className="periodo">/mes</span>
						</div>
						<ul className="caracteristicas-modal">
							{planes[planSeleccionado]?.caracteristicas.map((car, idx) => (
								<li key={idx}>✓ {car}</li>
							))}
						</ul>
					</div>

					<div className="metodo-pago-section">
						<h4>Método de Pago</h4>
						<div className="metodos-pago">
							{["EFECTIVO", "QR", "TARJETA", "TRANSFERENCIA"].map((metodo) => (
								<label key={metodo} className="metodo-pago-option">
									<input
										type="radio"
										name="metodo_pago"
										value={metodo}
										checked={metodoPago === metodo}
										onChange={(e) => setMetodoPago(e.target.value)}
									/>
									<span>{metodo}</span>
								</label>
							))}
						</div>
					</div>

					<div className="modal-pago-info">
						<p className="info-text">
							💳 Esta es una simulación de pago. Tu plan será actualizado
							inmediatamente.
						</p>
					</div>

					<div className="modal-actions">
						<button
							className="btn-cancelar"
							onClick={() => setMostrarModalPlan(false)}
						>
							Cancelar
						</button>
						<button
							className="btn-confirmar-pago"
							onClick={handleCambiarPlan}
							disabled={guardando}
						>
							{guardando ? "Procesando..." : "Confirmar Pago"}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default MiEmpresa;
