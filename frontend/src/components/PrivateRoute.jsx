import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
	const { usuario, loading } = useAuth();

	if (loading) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Cargando...</p>
			</div>
		);
	}

	return usuario ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
