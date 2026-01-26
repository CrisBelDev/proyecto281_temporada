import { useState, useEffect } from "react";
import { proveedoresService } from "../services";
import { useAuth } from "../context/AuthContext";
import "./ModalProveedor.css";

const ModalProveedor = ({ proveedor, onClose, onSuccess, empresaId }) => {
	const { usuario } = useAuth();
	const [formData, setFormData] = useState({
		nombre: "",
		nit: "",
		email: "",
		telefono: "",
		direccion: "",
		contacto_nombre: "",
		contacto_telefono: "",
		banco: "",
		tipo_cuenta: "",
		numero_cuenta: "",
		observaciones: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (proveedor) {
			const datosPago = proveedor.datos_pago
				? typeof proveedor.datos_pago === "string"
					? JSON.parse(proveedor.datos_pago)
					: proveedor.datos_pago
				: {};

			setFormData({
				nombre: proveedor.nombre || "",
				nit: proveedor.nit || "",
				email: proveedor.email || "",
				telefono: proveedor.telefono || "",
				direccion: proveedor.direccion || "",
				contacto_nombre: proveedor.contacto_nombre || "",
				contacto_telefono: proveedor.contacto_telefono || "",
				banco: datosPago.banco || "",
				tipo_cuenta: datosPago.tipo_cuenta || "",
				numero_cuenta: datosPago.cuenta || "",
				observaciones: proveedor.observaciones || "",
			});
		}
	}, [proveedor]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.nombre.trim()) {
			alert("El nombre del proveedor es obligatorio");
			return;
		}

		setLoading(true);

		try {
			const datos_pago = {
				banco: formData.banco,
				tipo_cuenta: formData.tipo_cuenta,
				cuenta: formData.numero_cuenta,
			};

			const payload = {
				nombre: formData.nombre,
				nit: formData.nit || null,
				email: formData.email || null,
				telefono: formData.telefono || null,
				direccion: formData.direccion || null,
				contacto_nombre: formData.contacto_nombre || null,
				contacto_telefono: formData.contacto_telefono || null,
				datos_pago,
				observaciones: formData.observaciones || null,
				empresa_id: empresaId || null,
			};

			if (proveedor) {
				await proveedoresService.actualizar(proveedor.id_proveedor, payload);
				alert("Proveedor actualizado exitosamente");
			} else {
				await proveedoresService.crear(payload);
				alert("Proveedor creado exitosamente");
			}

			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error al guardar proveedor:", error);
			alert(error.response?.data?.mensaje || "Error al guardar proveedor");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content-proveedor"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>{proveedor ? "✏️ Editar Proveedor" : "➕ Nuevo Proveedor"}</h2>
					<button className="btn-close" onClick={onClose}>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="form-proveedor">
					<div className="form-section">
						<h3>📋 Información General</h3>
						<div className="form-grid">
							<div className="form-group">
								<label>Nombre *</label>
								<input
									type="text"
									name="nombre"
									value={formData.nombre}
									onChange={handleChange}
									required
									placeholder="Nombre del proveedor"
								/>
							</div>

							<div className="form-group">
								<label>NIT</label>
								<input
									type="text"
									name="nit"
									value={formData.nit}
									onChange={handleChange}
									placeholder="Número de identificación"
								/>
							</div>

							<div className="form-group">
								<label>Email</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="correo@ejemplo.com"
								/>
							</div>

							<div className="form-group">
								<label>Teléfono</label>
								<input
									type="tel"
									name="telefono"
									value={formData.telefono}
									onChange={handleChange}
									placeholder="Teléfono principal"
								/>
							</div>
						</div>

						<div className="form-group">
							<label>Dirección</label>
							<textarea
								name="direccion"
								value={formData.direccion}
								onChange={handleChange}
								placeholder="Dirección completa"
								rows="2"
							/>
						</div>
					</div>

					<div className="form-section">
						<h3>👤 Persona de Contacto</h3>
						<div className="form-grid">
							<div className="form-group">
								<label>Nombre del Contacto</label>
								<input
									type="text"
									name="contacto_nombre"
									value={formData.contacto_nombre}
									onChange={handleChange}
									placeholder="Nombre completo"
								/>
							</div>

							<div className="form-group">
								<label>Teléfono del Contacto</label>
								<input
									type="tel"
									name="contacto_telefono"
									value={formData.contacto_telefono}
									onChange={handleChange}
									placeholder="Teléfono directo"
								/>
							</div>
						</div>
					</div>

					<div className="form-section">
						<h3>💳 Datos de Pago</h3>
						<div className="form-grid">
							<div className="form-group">
								<label>Banco</label>
								<input
									type="text"
									name="banco"
									value={formData.banco}
									onChange={handleChange}
									placeholder="Nombre del banco"
								/>
							</div>

							<div className="form-group">
								<label>Tipo de Cuenta</label>
								<select
									name="tipo_cuenta"
									value={formData.tipo_cuenta}
									onChange={handleChange}
								>
									<option value="">Seleccionar...</option>
									<option value="AHORROS">Ahorros</option>
									<option value="CORRIENTE">Corriente</option>
								</select>
							</div>

							<div className="form-group">
								<label>Número de Cuenta</label>
								<input
									type="text"
									name="numero_cuenta"
									value={formData.numero_cuenta}
									onChange={handleChange}
									placeholder="Número de cuenta"
								/>
							</div>
						</div>
					</div>

					<div className="form-section">
						<h3>📝 Observaciones</h3>
						<div className="form-group">
							<textarea
								name="observaciones"
								value={formData.observaciones}
								onChange={handleChange}
								placeholder="Notas adicionales sobre el proveedor..."
								rows="3"
							/>
						</div>
					</div>

					<div className="modal-actions">
						<button
							type="button"
							className="btn-cancelar"
							onClick={onClose}
							disabled={loading}
						>
							Cancelar
						</button>
						<button type="submit" className="btn-guardar" disabled={loading}>
							{loading
								? "Guardando..."
								: proveedor
									? "Actualizar"
									: "Crear Proveedor"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ModalProveedor;
