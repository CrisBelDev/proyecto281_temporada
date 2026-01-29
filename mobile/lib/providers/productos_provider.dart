import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'dart:convert';
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

  /// Determinar el tipo MIME basándose en la extensión del archivo
  MediaType _getImageMediaType(String path) {
    final extension = path.toLowerCase().split('.').last;
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return MediaType('image', 'jpeg');
      case 'png':
        return MediaType('image', 'png');
      case 'gif':
        return MediaType('image', 'gif');
      case 'webp':
        return MediaType('image', 'webp');
      default:
        return MediaType('image', 'jpeg'); // Default fallback
    }
  }

  /// Crear nuevo producto con imagen opcional
  Future<void> crearProducto(
    Map<String, dynamic> datos, {
    File? imagen,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no encontrado');

      // Construir URL sin /api para multipart
      final baseUrl = AppConstants.baseUrl.replaceAll('/api', '');
      final url = Uri.parse('$baseUrl/api/productos');

      final request = http.MultipartRequest('POST', url);
      request.headers['Authorization'] = 'Bearer $token';

      // Agregar campos del producto
      datos.forEach((key, value) {
        request.fields[key] = value.toString();
      });

      // Agregar imagen si existe
      if (imagen != null) {
        final stream = http.ByteStream(imagen.openRead());
        final length = await imagen.length();
        final multipartFile = http.MultipartFile(
          'imagen',
          stream,
          length,
          filename: imagen.path.split('/').last,
          contentType: _getImageMediaType(imagen.path),
        );
        request.files.add(multipartFile);
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        await cargarProductos(); // Recargar lista
      } else {
        throw Exception('Error al crear producto: ${response.body}');
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  /// Actualizar producto existente con imagen opcional
  Future<void> actualizarProducto(
    int id,
    Map<String, dynamic> datos, {
    File? imagen,
  }) async {
    try {
      final token = await ApiService.getToken();
      if (token == null) throw Exception('Token no encontrado');

      // Construir URL sin /api para multipart
      final baseUrl = AppConstants.baseUrl.replaceAll('/api', '');
      final url = Uri.parse('$baseUrl/api/productos/$id');

      final request = http.MultipartRequest('PUT', url);
      request.headers['Authorization'] = 'Bearer $token';

      // Agregar campos del producto
      datos.forEach((key, value) {
        request.fields[key] = value.toString();
      });

      // Agregar imagen si existe
      if (imagen != null) {
        final stream = http.ByteStream(imagen.openRead());
        final length = await imagen.length();
        final multipartFile = http.MultipartFile(
          'imagen',
          stream,
          length,
          filename: imagen.path.split('/').last,
          contentType: _getImageMediaType(imagen.path),
        );
        request.files.add(multipartFile);
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        await cargarProductos(); // Recargar lista
      } else {
        throw Exception('Error al actualizar producto: ${response.body}');
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }
}
