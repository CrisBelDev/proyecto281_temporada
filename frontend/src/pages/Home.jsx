import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
	const [empresas, setEmpresas] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		cargarEmpresas();
	}, []);

	const cargarEmpresas = async () => {
		try {
			const response = await fetch(
				"http://localhost:3000/api/empresas/publicas",
			);
			const data = await response.json();
			if (data.success) {
				setEmpresas(data.data);
			}
		} catch (error) {
			console.error("Error al cargar empresas:", error);
		} finally {
			setLoading(false);
		}
	};

	const irAlPortal = (slug) => {
		navigate(`/portal/${slug}`);
	};

	if (loading) {
		return (
			<div className="loading">
				<div className="spinner"></div>
				<p>Cargando catálogo...</p>
			</div>
		);
	}

	return (
		<div className="home-container">
			{/* Navbar */}
			<nav className="navbar">
				<div className="navbar-content">
					<div className="logo">
						<span className="logo-icon">🛒</span>
						<span className="logo-text">ShopHub</span>
					</div>
					<button className="btn-login" onClick={() => navigate("/login")}>
						<span className="login-icon">👤</span>
						<span>Acceso Admin</span>
					</button>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="hero">
				<div className="hero-content">
					<div className="hero-badge">✨ Catálogo en Línea</div>
					<h1 className="hero-title">
						Descubre Productos
						<br />
						<span className="gradient-text">de Calidad</span>
					</h1>
					<p className="hero-subtitle">
						Explora nuestro catálogo de productos actualizados en tiempo real.
						<br />
						Selecciona tu tienda favorita y comienza a comprar.
					</p>
					<div className="hero-stats">
						<div className="stat-item">
							<div className="stat-number">{empresas.length}+</div>
							<div className="stat-label">Tiendas</div>
						</div>
						<div className="stat-divider"></div>
						<div className="stat-item">
							<div className="stat-number">100%</div>
							<div className="stat-label">Disponible</div>
						</div>
						<div className="stat-divider"></div>
						<div className="stat-item">
							<div className="stat-number">24/7</div>
							<div className="stat-label">Acceso</div>
						</div>
					</div>
				</div>
				<div className="hero-decoration">
					<div className="floating-card card-1">🛍️</div>
					<div className="floating-card card-2">📦</div>
					<div className="floating-card card-3">🏪</div>
				</div>
			</section>

			{/* Stores Section */}
			<section className="stores-section">
				<div className="section-header">
					<h2 className="section-title">Nuestras Tiendas</h2>
					<p className="section-subtitle">
						Selecciona una tienda para ver su catálogo completo
					</p>
				</div>

				{empresas.length === 0 ? (
					<div className="no-stores">
						<div className="no-stores-icon">🏬</div>
						<h3>No hay tiendas disponibles</h3>
						<p>Estamos trabajando para traerte las mejores opciones</p>
					</div>
				) : (
					<div className="stores-grid">
						{empresas.map((empresa) => (
							<div
								key={empresa.id_empresa}
								className="store-card"
								onClick={() => irAlPortal(empresa.slug)}
							>
								<div className="store-badge">Activa</div>
								<div className="store-image">
									{empresa.logo ? (
										<img
											src={`http://localhost:3000${empresa.logo}`}
											alt={empresa.nombre}
											className="store-logo"
										/>
									) : (
										<div className="store-icon">🏪</div>
									)}
								</div>
								<div className="store-content">
									<h3 className="store-name">{empresa.nombre}</h3>
									<p className="store-description">
										Catálogo completo de productos disponibles
									</p>
									<div className="store-features">
										<span className="store-feature">
											<span className="feature-icon-small">✓</span> Stock
											actualizado
										</span>
										<span className="store-feature">
											<span className="feature-icon-small">✓</span> Disponible
											24/7
										</span>
									</div>
									<button className="store-btn">
										Ver Productos
										<span className="btn-arrow">→</span>
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Features Section */}
			<section className="features-section">
				<div className="section-header">
					<h2 className="section-title">¿Por qué elegirnos?</h2>
					<p className="section-subtitle">Beneficios que hacen la diferencia</p>
				</div>

				<div className="features-grid">
					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">⚡</span>
						</div>
						<h3>Actualización en Tiempo Real</h3>
						<p>
							Nuestro inventario se actualiza automáticamente para mostrarte
							siempre productos disponibles
						</p>
					</div>

					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">✅</span>
						</div>
						<h3>Productos Verificados</h3>
						<p>
							Todos los productos pasan por un control de calidad antes de ser
							publicados
						</p>
					</div>

					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">🔒</span>
						</div>
						<h3>Sistema Seguro</h3>
						<p>
							Plataforma protegida con las últimas tecnologías de seguridad web
						</p>
					</div>

					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">📱</span>
						</div>
						<h3>Acceso Multiplataforma</h3>
						<p>
							Accede desde cualquier dispositivo: computadora, tablet o móvil
						</p>
					</div>

					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">💼</span>
						</div>
						<h3>Gestión Profesional</h3>
						<p>
							Herramientas empresariales para gestionar tu inventario
							eficientemente
						</p>
					</div>

					<div className="feature-item">
						<div className="feature-icon-box">
							<span className="feature-emoji">🎯</span>
						</div>
						<h3>Fácil de Usar</h3>
						<p>
							Interfaz intuitiva diseñada para una experiencia de usuario
							excepcional
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta-section">
				<div className="cta-content">
					<h2>¿Tienes un negocio?</h2>
					<p>
						Únete a nuestra plataforma y lleva tu inventario al siguiente nivel
					</p>
					<button className="cta-btn" onClick={() => navigate("/login")}>
						Comenzar Ahora
						<span className="btn-shine"></span>
					</button>
				</div>
			</section>

			{/* Footer */}
			<footer className="footer">
				<div className="footer-content">
					<div className="footer-section">
						<div className="footer-logo">
							<span className="logo-icon">🛒</span>
							<span className="logo-text">ShopHub</span>
						</div>
						<p className="footer-description">
							Plataforma profesional de gestión de inventario multi-tenant.
							Simplificamos tu negocio.
						</p>
					</div>

					<div className="footer-section">
						<h4>Enlaces Rápidos</h4>
						<ul>
							<li>
								<a href="#">Sobre Nosotros</a>
							</li>
							<li>
								<a href="#">Características</a>
							</li>
							<li>
								<a href="#">Precios</a>
							</li>
							<li>
								<a href="#">Contacto</a>
							</li>
						</ul>
					</div>

					<div className="footer-section">
						<h4>Soporte</h4>
						<ul>
							<li>
								<a href="#">Centro de Ayuda</a>
							</li>
							<li>
								<a href="#">Documentación</a>
							</li>
							<li>
								<a href="#">Tutoriales</a>
							</li>
							<li>
								<a href="#">API</a>
							</li>
						</ul>
					</div>

					<div className="footer-section">
						<h4>Legal</h4>
						<ul>
							<li>
								<a href="#">Privacidad</a>
							</li>
							<li>
								<a href="#">Términos</a>
							</li>
							<li>
								<a href="#">Cookies</a>
							</li>
							<li>
								<a href="#">Licencias</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="footer-bottom">
					<p>&copy; 2026 ShopHub. Todos los derechos reservados.</p>
					<div className="footer-social">
						<a href="#" className="social-link">
							📘
						</a>
						<a href="#" className="social-link">
							🐦
						</a>
						<a href="#" className="social-link">
							📷
						</a>
						<a href="#" className="social-link">
							💼
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default Home;
