import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/usuario.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  Usuario? _usuario;
  Map<String, dynamic>? _empresa;
  bool _isLoading = false;
  String? _error;

  Usuario? get usuario => _usuario;
  Map<String, dynamic>? get empresa => _empresa;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _usuario != null;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        await verificarSesion();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    print('🔐 Iniciando login para: $email');
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await AuthService.login(email, password);
      print('✓ Login exitoso');
      _usuario = data['usuario'];
      _empresa = data['empresa'];

      // Guardar en preferencias locales
      await _saveUserData();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Error en login: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> verificarSesion() async {
    try {
      final data = await AuthService.verificarToken();
      _usuario = data['usuario'];
      _empresa = data['empresa'];
      notifyListeners();
    } catch (e) {
      await logout();
      throw e;
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _usuario = null;
    _empresa = null;
    await _clearUserData();
    notifyListeners();
  }

  Future<void> _saveUserData() async {
    final prefs = await SharedPreferences.getInstance();
    if (_usuario != null) {
      await prefs.setString('user_data', jsonEncode(_usuario!.toJson()));
    }
    if (_empresa != null) {
      await prefs.setString('empresa_data', jsonEncode(_empresa));
    }
  }

  Future<void> _clearUserData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    await prefs.remove('empresa_data');
  }
}
