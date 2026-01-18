import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services";
import "../styles/Auth.css";

function Registro() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		nombre_empresa: "",
		nit: "",
		telefono_empresa: "",
		direccion_empresa: "",
		email_empresa: "",
		nombre_admin: "",
		apellido_admin: "",
		email_admin: "",
		password_admin: "",
		telefono_admin: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await authService.registrarEmpresa(formData);
			if (response.success) {
				alert("Empresa registrada exitosamente. Ahora puedes iniciar sesión.");
				navigate("/login");
			} else {
				setError(response.mensaje || "Error al registrar empresa");
			}
		} catch (err) {
			setError(err.response?.data?.mensaje || "Error al registrar empresa");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card registro-card">
				<div className="auth-header">
					<h1>Registrar Nueva Empresa</h1>
					<p>Completa los datos para crear tu cuenta</p>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					{error && <div className="alert alert-error">{error}</div>}

					<div className="form-section">
						<h4>Datos de la Empresa</h4>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="nombre_empresa">Nombre de la Empresa *</label>
								<input
									type="text"
									id="nombre_empresa"
									name="nombre_empresa"
									value={formData.nombre_empresa}
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
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="email_empresa">Email de la Empresa</label>
								<input
									type="email"
									id="email_empresa"
									name="email_empresa"
									value={formData.email_empresa}
									onChange={handleChange}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="telefono_empresa">Teléfono</label>
								<input
									type="tel"
									id="telefono_empresa"
									name="telefono_empresa"
									value={formData.telefono_empresa}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="direccion_empresa">Dirección</label>
							<input
								type="text"
								id="direccion_empresa"
								name="direccion_empresa"
								value={formData.direccion_empresa}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="form-section">
						<h4>Datos del Administrador</h4>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="nombre_admin">Nombre *</label>
								<input
									type="text"
									id="nombre_admin"
									name="nombre_admin"
									value={formData.nombre_admin}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="apellido_admin">Apellido</label>
								<input
									type="text"
									id="apellido_admin"
									name="apellido_admin"
									value={formData.apellido_admin}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="email_admin">Email *</label>
								<input
									type="email"
									id="email_admin"
									name="email_admin"
									value={formData.email_admin}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="telefono_admin">Teléfono</label>
								<input
									type="tel"
									id="telefono_admin"
									name="telefono_admin"
									value={formData.telefono_admin}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="password_admin">Contraseña *</label>
							<input
								type="password"
								id="password_admin"
								name="password_admin"
								value={formData.password_admin}
								onChange={handleChange}
								required
								minLength="6"
							/>
						</div>
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? "Registrando..." : "Registrar Empresa"}
					</button>

					<div className="auth-footer">
						<p>
							¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Registro;
