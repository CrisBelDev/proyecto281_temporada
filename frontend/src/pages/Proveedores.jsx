import { useState, useEffect } from "react";
import {
	proveedoresService,
	productosService,
	empresasService,
} from "../services";
import { useAuth } from "../context/AuthContext";
import ModalProveedor from "../components/ModalProveedor";
import ModalProductosProveedor from "../components/ModalProductosProveedor";
import ModalHistorialCompras from "../components/ModalHistorialCompras";
import "./Proveedores.css";

const Proveedores = () => {
	const { usuario } = useAuth();
	const [proveedores, setProveedores] = useState([]);
	const [empresas, setEmpresas] = useState([]);
	const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
	const [loading, setLoading] = useState(false);
	const [modalAbierto, setModalAbierto] = useState(false);
	const [modalProductos, setModalProductos] = useState(false);
	const [modalHistorial, setModalHistorial] = useState(false);
	const [proveedorActual, setProveedorActual] = useState(null);
	const [busqueda, setBusqueda] = useState("");

	const isSuperUser = usuario?.nombre_rol === "SUPERUSER";

	useEffect(() => {
		if (isSuperUser) {
			cargarEmpresas();
		} else {
			cargarProveedores();
		}
	}, []);

	useEffect(() => {
		if (isSuperUser && empresaSeleccionada) {
			cargarProveedores();
		}
	}, [empresaSeleccionada]);

	const cargarEmpresas = async () => {
		try {
			const data = await empresasService.obtenerTodas();
			setEmpresas(data);
		} catch (error) {
			console.error("Error al cargar empresas:", error);
		}
	};

	const cargarProveedores = async () => {
		try {
			setLoading(true);
			const params =
				isSuperUser && empresaSeleccionada
					? { empresa_id: empresaSeleccionada }
					: {};
			const data = await proveedoresService.obtenerTodos(params);
			setProveedores(data);
		} catch (error) {
			console.error("Error al cargar proveedores:", error);
			alert("Error al cargar proveedores");
		} finally {
			setLoading(false);
		}
	};

	const abrirModal = (proveedor = null) => {
		setProveedorActual(proveedor);
		setModalAbierto(true);
	};

	const cerrarModal = () => {
		setProveedorActual(null);
		setModalAbierto(false);
	};

	const abrirModalProductos = (proveedor) => {
		setProveedorActual(proveedor);
		setModalProductos(true);
	};

	const cerrarModalProductos = () => {
		setProveedorActual(null);
		setModalProductos(false);
		cargarProveedores();
	};

	const abrirModalHistorial = (proveedor) => {
		setProveedorActual(proveedor);
		setModalHistorial(true);
	};

	const cerrarModalHistorial = () => {
		setProveedorActual(null);
		setModalHistorial(false);
	};

	const handleToggleActivo = async (id, activo) => {
		if (
			!confirm(
				`¿Está seguro de ${activo ? "desactivar" : "activar"} este proveedor?`,
			)
		) {
			return;
		}

		try {
			await proveedoresService.toggleActivo(id);
			cargarProveedores();
			alert(`Proveedor ${activo ? "desactivado" : "activado"} exitosamente`);
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			alert("Error al cambiar estado del proveedor");
		}
	};

	const proveedoresFiltrados = proveedores.filter(
		(p) =>
			p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			(p.nit && p.nit.toLowerCase().includes(busqueda.toLowerCase())) ||
			(p.email && p.email.toLowerCase().includes(busqueda.toLowerCase())),
	);

	const parseDatosPago = (datosPago) => {
		if (!datosPago) return null;
		try {
			return typeof datosPago === "string" ? JSON.parse(datosPago) : datosPago;
		} catch {
			return null;
		}
	};

	return (
		<div className="proveedores-container">
			<div className="proveedores-header">
				<div className="header-left">
					<h1>📦 Proveedores</h1>
					<p className="subtitle">Gestión de proveedores y suministros</p>
				</div>
				<button className="btn-nuevo-proveedor" onClick={() => abrirModal()}>
					+ Nuevo Proveedor
				</button>
			</div>

			{isSuperUser && (
				<div className="filtro-empresa">
					<label htmlFor="empresa-select">🏢 Seleccionar Empresa:</label>
					<select
						id="empresa-select"
						value={empresaSeleccionada}
						onChange={(e) => setEmpresaSeleccionada(e.target.value)}
						className="empresa-selector"
					>
						<option value="">-- Seleccione una empresa --</option>
						{empresas.map((emp) => (
							<option key={emp.id_empresa} value={emp.id_empresa}>
								{emp.nombre}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="proveedores-filters">
				<div className="search-box">
					<input
						type="text"
						placeholder="🔍 Buscar por nombre, NIT o email..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="loading">Cargando proveedores...</div>
			) : proveedoresFiltrados.length === 0 ? (
				<div className="no-data">
					{isSuperUser && !empresaSeleccionada
						? "Seleccione una empresa para ver los proveedores"
						: "No hay proveedores registrados"}
				</div>
			) : (
				<div className="proveedores-grid">
					{proveedoresFiltrados.map((proveedor) => {
						const datosPago = parseDatosPago(proveedor.datos_pago);
						return (
							<div
								key={proveedor.id_proveedor}
								className={`proveedor-card ${!proveedor.activo ? "inactivo" : ""}`}
							>
								<div className="proveedor-header-card">
									<h3>{proveedor.nombre}</h3>
									<span
										className={`badge ${proveedor.activo ? "activo" : "inactivo"}`}
									>
										{proveedor.activo ? "Activo" : "Inactivo"}
									</span>
								</div>

								<div className="proveedor-info">
									{proveedor.nit && (
										<div className="info-item">
											<strong>NIT:</strong> {proveedor.nit}
										</div>
									)}
									{proveedor.telefono && (
										<div className="info-item">
											<strong>📞 Teléfono:</strong> {proveedor.telefono}
										</div>
									)}
									{proveedor.email && (
										<div className="info-item">
											<strong>📧 Email:</strong> {proveedor.email}
										</div>
									)}
									{proveedor.direccion && (
										<div className="info-item">
											<strong>📍 Dirección:</strong> {proveedor.direccion}
										</div>
									)}

									{proveedor.contacto_nombre && (
										<div className="info-item contacto">
											<strong>👤 Contacto:</strong> {proveedor.contacto_nombre}
											{proveedor.contacto_telefono &&
												` - ${proveedor.contacto_telefono}`}
										</div>
									)}

									{datosPago && (
										<div className="info-item pago">
											<strong>💳 Datos de Pago:</strong>
											<div className="datos-pago-mini">
												{datosPago.banco && (
													<span>Banco: {datosPago.banco}</span>
												)}
												{datosPago.cuenta && (
													<span>Cuenta: {datosPago.cuenta}</span>
												)}
											</div>
										</div>
									)}

									{proveedor.productos_suministrados?.length > 0 && (
										<div className="info-item productos-count">
											<strong>📦 Productos:</strong>{" "}
											{proveedor.productos_suministrados.length} productos
										</div>
									)}
								</div>

								<div className="proveedor-actions">
									<button
										className="btn-action btn-productos"
										onClick={() => abrirModalProductos(proveedor)}
										title="Gestionar productos"
									>
										📦 Productos
									</button>
									<button
										className="btn-action btn-historial"
										onClick={() => abrirModalHistorial(proveedor)}
										title="Ver historial de compras"
									>
										📊 Historial
									</button>
									<button
										className="btn-action btn-editar"
										onClick={() => abrirModal(proveedor)}
										title="Editar proveedor"
									>
										✏️
									</button>
									<button
										className={`btn-action ${proveedor.activo ? "btn-desactivar" : "btn-activar"}`}
										onClick={() =>
											handleToggleActivo(
												proveedor.id_proveedor,
												proveedor.activo,
											)
										}
										title={proveedor.activo ? "Desactivar" : "Activar"}
									>
										{proveedor.activo ? "🔴" : "🟢"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{modalAbierto && (
				<ModalProveedor
					proveedor={proveedorActual}
					onClose={cerrarModal}
					onSuccess={cargarProveedores}
					empresaId={empresaSeleccionada}
				/>
			)}

			{modalProductos && proveedorActual && (
				<ModalProductosProveedor
					proveedor={proveedorActual}
					onClose={cerrarModalProductos}
				/>
			)}

			{modalHistorial && proveedorActual && (
				<ModalHistorialCompras
					proveedor={proveedorActual}
					onClose={cerrarModalHistorial}
				/>
			)}
		</div>
	);
};

export default Proveedores;
