import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

const ResetearPassword = () => {
	const [nuevaPassword, setNuevaPassword] = useState("");
	const [confirmarPassword, setConfirmarPassword] = useState("");
	const [estado, setEstado] = useState("verificando"); // verificando, valido, invalido, exito
	const [mensaje, setMensaje] = useState("");
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);
	const { token } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		verificarToken();
	}, [token]);

	const verificarToken = async () => {
		try {
			const response = await api.get(
				`/auth/verificar-token-recuperacion/${token}`,
			);

			if (response.data.success) {
				setEstado("valido");
			}
		} catch (error) {
			setEstado("invalido");
			if (error.response?.data?.mensaje) {
				setMensaje(error.response.data.mensaje);
			} else {
				setMensaje("Token inválido o expirado");
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMensaje("");

		// Validaciones
		if (nuevaPassword.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres");
			return;
		}

		if (nuevaPassword !== confirmarPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}

		setCargando(true);

		try {
			const response = await api.post("/auth/resetear-password", {
				token,
				nuevaPassword,
			});

			if (response.data.success) {
				setEstado("exito");
				setMensaje(response.data.mensaje);
				// Redirigir al login después de 3 segundos
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			}
		} catch (error) {
			if (error.response?.data?.mensaje) {
				setError(error.response.data.mensaje);
			} else {
				setError(
					"Error al actualizar la contraseña. Por favor intenta nuevamente.",
				);
			}
		} finally {
			setCargando(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2>Restablecer Contraseña</h2>

				{estado === "verificando" && (
					<div className="verification-status">
						<div className="spinner"></div>
						<p>Verificando enlace...</p>
					</div>
				)}

				{estado === "invalido" && (
					<div className="verification-status error">
						<div className="icon-error">✗</div>
						<p className="error-message">{mensaje}</p>
						<div className="verification-actions">
							<Link to="/olvide-password" className="btn-primary">
								Solicitar nuevo enlace
							</Link>
							<Link to="/login" className="btn-secondary">
								Volver al login
							</Link>
						</div>
					</div>
				)}

				{estado === "valido" && (
					<div>
						<p className="auth-subtitle">
							Ingresa tu nueva contraseña a continuación
						</p>

						{error && <div className="alert alert-error">{error}</div>}

						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="nuevaPassword">Nueva Contraseña</label>
								<input
									type="password"
									id="nuevaPassword"
									value={nuevaPassword}
									onChange={(e) => setNuevaPassword(e.target.value)}
									placeholder="Mínimo 6 caracteres"
									required
									disabled={cargando}
									autoFocus
								/>
							</div>

							<div className="form-group">
								<label htmlFor="confirmarPassword">
									Confirmar Nueva Contraseña
								</label>
								<input
									type="password"
									id="confirmarPassword"
									value={confirmarPassword}
									onChange={(e) => setConfirmarPassword(e.target.value)}
									placeholder="Repite la contraseña"
									required
									disabled={cargando}
								/>
							</div>

							<button type="submit" className="btn-primary" disabled={cargando}>
								{cargando ? "Actualizando..." : "Restablecer Contraseña"}
							</button>
						</form>
					</div>
				)}

				{estado === "exito" && (
					<div className="verification-status success">
						<div className="icon-success">✓</div>
						<p className="success-message">{mensaje}</p>
						<p className="info-text">
							Serás redirigido al inicio de sesión en unos segundos...
						</p>
					</div>
				)}

				{(estado === "valido" || estado === "verificando") && (
					<div className="auth-links">
						<Link to="/login">Volver al inicio de sesión</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default ResetearPassword;
