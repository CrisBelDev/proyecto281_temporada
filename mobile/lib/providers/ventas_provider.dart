import 'package:flutter/material.dart';
import '../models/venta.dart';
import '../models/producto.dart';
import '../services/api_service.dart';
import '../config/constants.dart';

class VentasProvider with ChangeNotifier {
  List<Venta> _ventas = [];
  List<ItemCarrito> _carrito = [];
  bool _isLoading = false;
  String? _error;

  List<Venta> get ventas => _ventas;
  List<ItemCarrito> get carrito => _carrito;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalItemsCarrito =>
      _carrito.fold(0, (sum, item) => sum + item.cantidad);
  double get totalCarrito =>
      _carrito.fold(0.0, (sum, item) => sum + item.subtotal);

  Future<void> cargarVentas() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(AppConstants.ventasEndpoint);
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        _ventas = (data['data'] as List).map((v) => Venta.fromJson(v)).toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Venta?> obtenerVentaPorId(int id) async {
    try {
      final response = await ApiService.get(
        '${AppConstants.ventasEndpoint}/$id',
      );
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        return Venta.fromJson(data['venta']);
      }
    } catch (e) {
      _error = e.toString();
    }
    return null;
  }

  void agregarAlCarrito(Producto producto, int cantidad) {
    final index = _carrito.indexWhere(
      (item) => item.producto.id == producto.id,
    );

    if (index >= 0) {
      _carrito[index].cantidad += cantidad;
    } else {
      _carrito.add(ItemCarrito(producto: producto, cantidad: cantidad));
    }

    notifyListeners();
  }

  void actualizarCantidad(int productoId, int nuevaCantidad) {
    final index = _carrito.indexWhere((item) => item.producto.id == productoId);

    if (index >= 0) {
      if (nuevaCantidad <= 0) {
        _carrito.removeAt(index);
      } else {
        _carrito[index].cantidad = nuevaCantidad;
      }
      notifyListeners();
    }
  }

  void eliminarDelCarrito(int productoId) {
    _carrito.removeWhere((item) => item.producto.id == productoId);
    notifyListeners();
  }

  void limpiarCarrito() {
    _carrito.clear();
    notifyListeners();
  }

  Future<bool> realizarVenta(int idCliente) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final productos = _carrito
          .map(
            (item) => {
              'id_producto': item.producto.id,
              'cantidad': item.cantidad,
            },
          )
          .toList();

      final response = await ApiService.post(AppConstants.ventasEndpoint, {
        'id_cliente': idCliente,
        'productos': productos,
      });

      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        limpiarCarrito();
        await cargarVentas();
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    return false;
  }
}

class ItemCarrito {
  final Producto producto;
  int cantidad;

  ItemCarrito({required this.producto, required this.cantidad});

  double get subtotal => producto.precioVenta * cantidad;
}
