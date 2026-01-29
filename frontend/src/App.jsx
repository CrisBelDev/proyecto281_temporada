import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import VerificarEmail from "./pages/VerificarEmail";
import ReenviarVerificacion from "./pages/ReenviarVerificacion";
import OlvidePassword from "./pages/OlvidePassword";
import ResetearPassword from "./pages/ResetearPassword";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Notificaciones from "./pages/Notificaciones";
import Ventas from "./pages/Ventas";
import NuevaVenta from "./pages/NuevaVenta";
import Compras from "./pages/Compras";
import NuevaCompra from "./pages/NuevaCompra";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Clientes from "./pages/Clientes";
import Empresas from "./pages/Empresas";
import MiEmpresa from "./pages/MiEmpresa";
import PortalProductos from "./pages/PortalProductos";
import Proveedores from "./pages/Proveedores";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Página de inicio pública */}
					<Route path="/" element={<Home />} />

					{/* Portal público de productos */}
					<Route path="/portal/:empresaSlug" element={<PortalProductos />} />

					{/* Rutas de autenticación */}
					<Route path="/login" element={<Login />} />
					<Route path="/registro" element={<Registro />} />
					<Route path="/verificar-email/:token" element={<VerificarEmail />} />
					<Route
						path="/reenviar-verificacion"
						element={<ReenviarVerificacion />}
					/>
					<Route path="/olvide-password" element={<OlvidePassword />} />
					<Route
						path="/resetear-password/:token"
						element={<ResetearPassword />}
					/>

					{/* Rutas del sistema (requieren autenticación) */}
					<Route
						path="/admin"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						<Route index element={<Navigate to="/admin/dashboard" replace />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="productos" element={<Productos />} />
						<Route path="categorias" element={<Categorias />} />
						<Route path="notificaciones" element={<Notificaciones />} />
						<Route path="clientes" element={<Clientes />} />{" "}
						<Route path="mi-empresa" element={<MiEmpresa />} />
						<Route path="proveedores" element={<Proveedores />} />{" "}
						<Route path="ventas" element={<Ventas />} />
						<Route path="ventas/nueva" element={<NuevaVenta />} />
						<Route path="compras" element={<Compras />} />
						<Route path="compras/nueva" element={<NuevaCompra />} />
						<Route path="empresas" element={<Empresas />} />
						<Route path="usuarios" element={<Usuarios />} />
						<Route path="reportes" element={<Reportes />} />
					</Route>

					{/* Ruta 404 */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
