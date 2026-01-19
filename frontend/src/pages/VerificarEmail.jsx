import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

const VerificarEmail = () => {
	const [estado, setEstado] = useState("verificando"); // verificando, exito, error
	const [mensaje, setMensaje] = useState("");
	const { token } = useParams();
	const navigate = useNavigate();
	const verificacionIniciada = useRef(false);

	useEffect(() => {
		// Evitar doble ejecución en React Strict Mode
		if (!verificacionIniciada.current) {
			verificacionIniciada.current = true;
			verificarEmail();
		}
	}, [token]);

	const verificarEmail = async () => {
		try {
			const response = await api.get(`/auth/verificar-email/${token}`);

			if (response.data.success) {
				setEstado("exito");
				setMensaje(response.data.mensaje);
				// Redirigir al login después de 3 segundos
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			}
		} catch (error) {
			setEstado("error");
			// Si el email ya fue verificado, mostrar como éxito
			if (error.response?.data?.mensaje?.includes("ya ha sido verificado")) {
				setEstado("exito");
				setMensaje("Tu cuenta ya ha sido verificada. Puedes iniciar sesión.");
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			} else if (error.response?.data?.mensaje) {
				setMensaje(error.response.data.mensaje);
			} else {
				setMensaje(
					"Error al verificar el email. Por favor intenta nuevamente.",
				);
			}
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2>Verificación de Email</h2>

				{estado === "verificando" && (
					<div className="verification-status">
						<div className="spinner"></div>
						<p>Verificando tu email...</p>
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

				{estado === "error" && (
					<div className="verification-status error">
						<div className="icon-error">✗</div>
						<p className="error-message">{mensaje}</p>
						<div className="verification-actions">
							<Link to="/login" className="btn-secondary">
								Ir al inicio de sesión
							</Link>
							<Link to="/reenviar-verificacion" className="btn-link">
								Solicitar nuevo enlace
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default VerificarEmail;
