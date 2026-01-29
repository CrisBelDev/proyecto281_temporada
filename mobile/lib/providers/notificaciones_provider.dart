import 'package:flutter/material.dart';
import '../models/notificacion.dart';
import '../services/api_service.dart';
import '../config/constants.dart';

class NotificacionesProvider with ChangeNotifier {
  List<Notificacion> _notificaciones = [];
  bool _isLoading = false;
  String? _error;

  List<Notificacion> get notificaciones => _notificaciones;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get noLeidas => _notificaciones.where((n) => !n.leida).length;
  bool get tieneNoLeidas => noLeidas > 0;

  Future<void> cargarNotificaciones() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(
        AppConstants.notificacionesEndpoint,
      );
      final data = ApiService.parseResponse(response);

      if (data['success'] == true) {
        _notificaciones = (data['notificaciones'] as List)
            .map((n) => Notificacion.fromJson(n))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> marcarComoLeida(int id) async {
    try {
      await ApiService.patch(
        '${AppConstants.notificacionesEndpoint}/$id/leida',
      );

      final index = _notificaciones.indexWhere((n) => n.id == id);
      if (index >= 0) {
        // Actualizar localmente
        await cargarNotificaciones();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> marcarTodasComoLeidas() async {
    try {
      await ApiService.patch(
        '${AppConstants.notificacionesEndpoint}/todas/leidas',
      );
      await cargarNotificaciones();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> eliminarNotificacion(int id) async {
    try {
      await ApiService.delete('${AppConstants.notificacionesEndpoint}/$id');
      _notificaciones.removeWhere((n) => n.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  List<Notificacion> get notificacionesNoLeidas {
    return _notificaciones.where((n) => !n.leida).toList();
  }

  List<Notificacion> get notificacionesStockBajo {
    return _notificaciones.where((n) => n.isStockBajo).toList();
  }
}
