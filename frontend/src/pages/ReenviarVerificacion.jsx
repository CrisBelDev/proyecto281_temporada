import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

const ReenviarVerificacion = () => {
	const [email, setEmail] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);
	const [enviado, setEnviado] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMensaje("");
		setCargando(true);

		try {
			const response = await api.post("/auth/reenviar-verificacion", { email });

			if (response.data.success) {
				setMensaje(response.data.mensaje);
				setEnviado(true);
				setEmail("");
			}
		} catch (error) {
			if (error.response?.data?.mensaje) {
				setError(error.response.data.mensaje);
			} else {
				setError(
					"Error al reenviar el email de verificación. Por favor intenta nuevamente.",
				);
			}
		} finally {
			setCargando(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2>Reenviar Verificación de Email</h2>
				<p className="auth-subtitle">
					Ingresa tu email y te enviaremos un nuevo enlace de verificación
				</p>

				{mensaje && <div className="alert alert-success">{mensaje}</div>}
				{error && <div className="alert alert-error">{error}</div>}

				{!enviado ? (
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="tu@email.com"
								required
								disabled={cargando}
							/>
						</div>

						<button type="submit" className="btn-primary" disabled={cargando}>
							{cargando ? "Enviando..." : "Reenviar Email de Verificación"}
						</button>
					</form>
				) : (
					<div className="verification-sent">
						<div className="icon-success">✓</div>
						<p>¡Email enviado exitosamente!</p>
						<p className="info-text">
							Por favor revisa tu bandeja de entrada y sigue las instrucciones.
						</p>
					</div>
				)}

				<div className="auth-links">
					<Link to="/login">Volver al inicio de sesión</Link>
				</div>
			</div>
		</div>
	);
};

export default ReenviarVerificacion;
