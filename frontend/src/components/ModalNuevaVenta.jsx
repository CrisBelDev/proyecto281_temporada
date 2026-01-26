import { useEffect, useState } from "react";
import { productosService, ventasService, clientesService } from "../services";
import ModalNuevoCliente from "./ModalNuevoCliente";
import "../styles/ModalNuevaVenta.css";

function ModalNuevaVenta({ isOpen, onClose, onVentaCreada }) {
	const [productos, setProductos] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [carrito, setCarrito] = useState([]);
	const [productoSeleccionado, setProductoSeleccionado] = useState("");
	const [cantidad, setCantidad] = useState(1);
	const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

	const [formData, setFormData] = useState({
		id_cliente: "",
		metodo_pago: "EFECTIVO",
	});

	useEffect(() => {
		if (isOpen) {
			cargarProductos();
			cargarClientes();
		}
	}, [isOpen]);

	const cargarProductos = async () => {
		const res = await productosService.obtenerTodos();
		if (res.success) {
			setProductos(res.data.filter((p) => p.stock_actual > 0));
		}
	};

	const cargarClientes = async () => {
		const res = await clientesService.obtenerTodos();
		if (res.success) setClientes(res.data);
	};

	const agregarAlCarrito = () => {
		const producto = productos.find(
			(p) => p.id_producto === Number(productoSeleccionado),
		);
		if (!producto) return;

		const existe = carrito.find((i) => i.id_producto === producto.id_producto);

		if (existe) {
			setCarrito(
				carrito.map((i) =>
					i.id_producto === producto.id_producto
						? { ...i, cantidad: i.cantidad + cantidad }
						: i,
				),
			);
		} else {
			setCarrito([
				...carrito,
				{
					id_producto: producto.id_producto,
					nombre: producto.nombre,
					precio: producto.precio_venta,
					cantidad,
					stock_max: producto.stock_actual,
				},
			]);
		}
		setCantidad(1);
	};

	const cambiarCantidad = (id, qty) => {
		if (qty <= 0) {
			setCarrito(carrito.filter((i) => i.id_producto !== id));
			return;
		}
		setCarrito(
			carrito.map((i) => (i.id_producto === id ? { ...i, cantidad: qty } : i)),
		);
	};

	const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

	const procesarVenta = async (e) => {
		e.preventDefault();
		if (!carrito.length) return alert("Carrito vacío");

		const data = {
			id_cliente: formData.id_cliente || null,
			metodo_pago: formData.metodo_pago,
			productos: carrito.map((i) => ({
				id_producto: i.id_producto,
				cantidad: i.cantidad,
			})),
		};

		const res = await ventasService.crear(data);
		if (res.success) {
			onVentaCreada();
			onClose();
			setCarrito([]);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="venta-overlay">
			<div className="venta-modal">
				<header className="venta-header">
					<h2>🛒 Nueva Venta</h2>
					<button onClick={onClose}>✕</button>
				</header>

				<div className="venta-body">
					{/* AGREGAR PRODUCTO */}
					<div className="venta-agregar">
						<h4>➕ Agregar producto</h4>
						<div className="agregar-row">
							<select
								value={productoSeleccionado}
								onChange={(e) => setProductoSeleccionado(e.target.value)}
							>
								<option value="">Seleccionar producto</option>
								{productos.map((p) => (
									<option key={p.id_producto} value={p.id_producto}>
										{p.nombre} (Stock: {p.stock_actual})
									</option>
								))}
							</select>

							<input
								type="number"
								min="1"
								value={cantidad}
								onChange={(e) => setCantidad(Number(e.target.value))}
							/>

							<button className="btn-primary" onClick={agregarAlCarrito}>
								Agregar
							</button>
						</div>
					</div>

					{/* CARRITO */}
					<div className="venta-carrito">
						<h4>🧺 Carrito</h4>

						{carrito.length === 0 ? (
							<p className="carrito-vacio">No hay productos</p>
						) : (
							carrito.map((item) => (
								<div key={item.id_producto} className="carrito-card">
									<div>
										<strong>{item.nombre}</strong>
										<small>Bs. {item.precio}</small>
									</div>

									<div className="qty-controls">
										<button
											onClick={() =>
												cambiarCantidad(item.id_producto, item.cantidad - 1)
											}
										>
											−
										</button>
										<span>{item.cantidad}</span>
										<button
											onClick={() =>
												cambiarCantidad(item.id_producto, item.cantidad + 1)
											}
										>
											+
										</button>
									</div>

									<div className="item-total">
										Bs. {(item.precio * item.cantidad).toFixed(2)}
									</div>
								</div>
							))
						)}
					</div>

					{/* CLIENTE */}
					<div className="venta-cliente">
						<h4>👤 Cliente</h4>
						<div className="cliente-row">
							<select
								value={formData.id_cliente}
								onChange={(e) =>
									setFormData({ ...formData, id_cliente: e.target.value })
								}
							>
								<option value="">Venta sin cliente</option>
								{clientes.map((c) => (
									<option key={c.id_cliente} value={c.id_cliente}>
										{c.nombre}
									</option>
								))}
							</select>

							<button onClick={() => setModalNuevoCliente(true)}>
								➕ Nuevo
							</button>
						</div>
					</div>

					{/* TOTAL */}
					<div className="venta-total">
						<span>Total a pagar</span>
						<strong>Bs. {total.toFixed(2)}</strong>
					</div>
				</div>

				<footer className="venta-footer">
					<button className="btn-secondary" onClick={onClose}>
						Cancelar
					</button>
					<button className="btn-success" onClick={procesarVenta}>
						✅ Finalizar Venta
					</button>
				</footer>
			</div>

			<ModalNuevoCliente
				isOpen={modalNuevoCliente}
				onClose={() => setModalNuevoCliente(false)}
				onClienteCreado={(c) => {
					setClientes([...clientes, c]);
					setFormData({ ...formData, id_cliente: c.id_cliente });
				}}
			/>
		</div>
	);
}

export default ModalNuevaVenta;
