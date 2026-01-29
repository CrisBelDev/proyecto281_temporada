import 'package:flutter/material.dart';
import '../models/cliente.dart';
import '../services/api_service.dart';
import '../config/constants.dart';

class ClientesProvider with ChangeNotifier {
  List<Cliente> _clientes = [];
  bool _isLoading = false;
  String? _error;

  List<Cliente> get clientes => _clientes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> cargarClientes() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(AppConstants.clientesEndpoint);
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        _clientes =
            (data['data'] as List).map((c) => Cliente.fromJson(c)).toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Cliente?> obtenerClientePorId(int id) async {
    try {
      final response = await ApiService.get(
        '${AppConstants.clientesEndpoint}/$id',
      );
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        return Cliente.fromJson(data['data']);
      }
    } catch (e) {
      _error = e.toString();
    }
    return null;
  }

  Future<bool> crearCliente(Map<String, dynamic> clienteData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post(
        AppConstants.clientesEndpoint,
        clienteData,
      );

      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        await cargarClientes();
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

  Future<bool> actualizarCliente(
    int id,
    Map<String, dynamic> clienteData,
  ) async {
    try {
      final response = await ApiService.put(
        '${AppConstants.clientesEndpoint}/$id',
        clienteData,
      );

      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        await cargarClientes();
        return true;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }

    return false;
  }

  List<Cliente> buscarClientes(String query) {
    final lowerQuery = query.toLowerCase();
    return _clientes.where((c) {
      return c.nombre.toLowerCase().contains(lowerQuery) ||
          (c.documento?.toLowerCase().contains(lowerQuery) ?? false) ||
          (c.email?.toLowerCase().contains(lowerQuery) ?? false);
    }).toList();
  }
}
