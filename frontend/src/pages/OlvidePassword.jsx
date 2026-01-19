import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

const OlvidePassword = () => {
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
			const response = await api.post("/auth/solicitar-recuperacion", {
				email,
			});

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
					"Error al procesar la solicitud. Por favor intenta nuevamente.",
				);
			}
		} finally {
			setCargando(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2>Recuperar Contraseña</h2>
				<p className="auth-subtitle">
					Ingresa tu email y te enviaremos un enlace para restablecer tu
					contraseña
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
								autoFocus
							/>
						</div>

						<button type="submit" className="btn-primary" disabled={cargando}>
							{cargando ? "Enviando..." : "Enviar Enlace de Recuperación"}
						</button>
					</form>
				) : (
					<div className="verification-sent">
						<div className="icon-success">📧</div>
						<p>¡Solicitud enviada!</p>
						<p className="info-text">
							Si el email existe en nuestro sistema, recibirás un enlace de
							recuperación. Por favor revisa tu bandeja de entrada y la carpeta
							de spam.
						</p>
						<p className="info-text" style={{ marginTop: "1rem" }}>
							El enlace expirará en 1 hora por seguridad.
						</p>
					</div>
				)}

				<div className="auth-links">
					<Link to="/login">Volver al inicio de sesión</Link>
					{" · "}
					<Link to="/registro">Crear una cuenta</Link>
				</div>
			</div>
		</div>
	);
};

export default OlvidePassword;
