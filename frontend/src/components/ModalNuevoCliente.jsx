import { useState } from "react";
import { clientesService } from "../services";
import "../styles/ModalNuevoCliente.css";

function ModalNuevoCliente({ isOpen, onClose, onClienteCreado }) {
	const [formData, setFormData] = useState({
		nombre: "",
		nit: "",
		telefono: "",
		email: "",
		direccion: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		setError(""); // Limpiar error al escribir
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Validaciones
		if (!formData.nombre.trim()) {
			setError("El nombre / razón social es obligatorio");
			return;
		}

		setLoading(true);
		try {
			const response = await clientesService.crear(formData);
			if (response.success) {
				// Resetear formulario
				setFormData({
					nombre: "",
					nit: "",
					telefono: "",
					email: "",
					direccion: "",
				});
				onClienteCreado(response.data); // Pasar el nuevo cliente
				onClose();
			}
		} catch (err) {
			setError(err.response?.data?.mensaje || "Error al registrar el cliente");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay-cliente" onClick={onClose}>
			<div
				className="modal-content-cliente"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header-cliente">
					<h3>➕ Nuevo Cliente</h3>
					<button className="btn-close-cliente" onClick={onClose}>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="form-cliente">
					{error && <div className="error-message">{error}</div>}

					<div className="form-group">
						<label>
							Nombre / Razón Social <span className="required">*</span>
						</label>
						<input
							type="text"
							name="nombre"
							value={formData.nombre}
							onChange={handleChange}
							placeholder="Ej: Juan Pérez o Empresa S.A."
							required
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>NIT / CI</label>
							<input
								type="text"
								name="nit"
								value={formData.nit}
								onChange={handleChange}
								placeholder="Ej: 12345678"
							/>
						</div>

						<div className="form-group">
							<label>Teléfono</label>
							<input
								type="text"
								name="telefono"
								value={formData.telefono}
								onChange={handleChange}
								placeholder="Ej: 71234567"
							/>
						</div>
					</div>

					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Ej: cliente@email.com"
						/>
					</div>

					<div className="form-group">
						<label>Dirección</label>
						<textarea
							name="direccion"
							value={formData.direccion}
							onChange={handleChange}
							placeholder="Ej: Av. Principal #123"
							rows="2"
						/>
					</div>

					<div className="form-actions">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-secondary"
							disabled={loading}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? "Guardando..." : "✅ Guardar Cliente"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ModalNuevoCliente;
