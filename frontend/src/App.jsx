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
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import VerificarEmail from "./pages/VerificarEmail";
import ReenviarVerificacion from "./pages/ReenviarVerificacion";
import OlvidePassword from "./pages/OlvidePassword";
import ResetearPassword from "./pages/ResetearPassword";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import NuevaVenta from "./pages/NuevaVenta";
import Compras from "./pages/Compras";
import NuevaCompra from "./pages/NuevaCompra";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Rutas públicas */}
					<Route path="/login" element={<Login />} />
					<Route path="/registro" element={<Registro />} />
					<Route path="/verificar-email/:token" element={<VerificarEmail />} />
					<Route
						path="/reenviar-verificacion"
						element={<ReenviarVerificacion />}
					/>{" "}
					<Route path="/olvide-password" element={<OlvidePassword />} />
					<Route
						path="/resetear-password/:token"
						element={<ResetearPassword />}
					/>
					{/* Rutas privadas */}
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						<Route index element={<Navigate to="/dashboard" replace />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="productos" element={<Productos />} />
						<Route path="ventas" element={<Ventas />} />
						<Route path="ventas/nueva" element={<NuevaVenta />} />
						<Route path="compras" element={<Compras />} />
						<Route path="compras/nueva" element={<NuevaCompra />} />
						<Route path="usuarios" element={<Usuarios />} />
						<Route path="reportes" element={<Reportes />} />
					</Route>
					{/* Ruta 404 */}
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
