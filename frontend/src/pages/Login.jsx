import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
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
			const response = await login(formData.email, formData.password);
			if (response.success) {
				navigate("/dashboard");
			} else {
				setError(response.mensaje || "Error al iniciar sesión");
			}
		} catch (err) {
			setError(err.response?.data?.mensaje || "Error al iniciar sesión");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h1>Sistema SaaS</h1>
					<h2>Inventarios y Ventas</h2>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					<h3>Iniciar Sesión</h3>

					{error && <div className="alert alert-error">{error}</div>}

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							autoFocus
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Contraseña</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>

					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? "Iniciando sesión..." : "Iniciar Sesión"}
					</button>

					<div className="auth-footer">
						<p>
							¿No tienes cuenta? <Link to="/registro">Registrar empresa</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Login;
