import 'package:flutter/material.dart';
import '../models/producto.dart';
import '../services/api_service.dart';
import '../config/constants.dart';

class ProductosProvider with ChangeNotifier {
  List<Producto> _productos = [];
  List<Producto> _productosStockBajo = [];
  bool _isLoading = false;
  String? _error;

  List<Producto> get productos => _productos;
  List<Producto> get productosStockBajo => _productosStockBajo;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> cargarProductos({String? busqueda}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String endpoint = AppConstants.productosEndpoint;
      if (busqueda != null && busqueda.isNotEmpty) {
        endpoint += '?busqueda=$busqueda';
      }

      final response = await ApiService.get(endpoint);
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        _productos =
            (data['data'] as List).map((p) => Producto.fromJson(p)).toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> cargarProductosStockBajo() async {
    try {
      final response = await ApiService.get(
        '${AppConstants.productosEndpoint}/stock-bajo',
      );
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        _productosStockBajo = (data['data'] as List? ?? [])
            .map((p) => Producto.fromJson(p))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error cargando stock bajo: $e');
    }
  }

  Future<Producto?> obtenerProductoPorId(int id) async {
    try {
      final response = await ApiService.get(
        '${AppConstants.productosEndpoint}/$id',
      );
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        return Producto.fromJson(data['data']);
      }
    } catch (e) {
      _error = e.toString();
    }
    return null;
  }

  List<Producto> filtrarPorCategoria(int idCategoria) {
    return _productos.where((p) => p.idCategoria == idCategoria).toList();
  }

  List<Producto> buscarProductos(String query) {
    final lowerQuery = query.toLowerCase();
    return _productos.where((p) {
      return p.nombre.toLowerCase().contains(lowerQuery) ||
          p.codigo.toLowerCase().contains(lowerQuery);
    }).toList();
  }
}
