import 'dart:convert';
import '../models/usuario.dart';
import '../config/constants.dart';
import 'api_service.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    print('🔑 AuthService.login llamado');
    try {
      final response = await ApiService.post(AppConstants.loginEndpoint, {
        'email': email,
        'password': password,
      });

      final data = ApiService.parseResponse(response);
      print('📦 Data recibida: $data');

      if (data['success'] == true) {
        // Guardar token (está dentro de data['data'])
        final responseData = data['data'];
        final token = responseData['token'];
        print('🎫 Token: ${token?.toString().substring(0, 20)}...');
        if (token == null || token.toString().isEmpty) {
          throw Exception('Token inválido recibido del servidor');
        }
        await ApiService.saveToken(token.toString());

        return {
          'usuario': Usuario.fromJson(responseData['usuario'] ?? {}),
          'empresa': responseData['usuario']['empresa'] ?? {},
        };
      } else {
        throw Exception(data['mensaje'] ?? 'Error al iniciar sesión');
      }
    } catch (e) {
      print('❌ AuthService.login error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> verificarToken() async {
    try {
      final response = await ApiService.get(
        AppConstants.verificarTokenEndpoint,
      );
      final data = ApiService.parseResponse(response);

      return {
        'usuario': Usuario.fromJson(data['usuario']),
        'empresa': data['empresa'],
      };
    } catch (e) {
      await logout();
      throw Exception('Sesión expirada');
    }
  }

  static Future<void> logout() async {
    await ApiService.deleteToken();
  }

  static Future<bool> isAuthenticated() async {
    final token = await ApiService.getToken();
    return token != null;
  }
}
