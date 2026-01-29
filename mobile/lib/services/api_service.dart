import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/constants.dart';

class ApiService {
  static const _storage = FlutterSecureStorage();

  static Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: AppConstants.tokenKey);
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    print('🌐 GET: $url');
    try {
      final response = await http.get(url, headers: headers);
      print(
          '✓ Response ${response.statusCode}: ${response.body.substring(0, response.body.length > 200 ? 200 : response.body.length)}');
      return response;
    } catch (e) {
      print('❌ GET Error: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  static Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      );
      return response;
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  static Future<http.Response> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.put(
        url,
        headers: headers,
        body: jsonEncode(body),
      );
      return response;
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  static Future<http.Response> patch(
    String endpoint, [
    Map<String, dynamic>? body,
  ]) async {
    final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.patch(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return response;
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  static Future<http.Response> delete(String endpoint) async {
    final url = Uri.parse('${AppConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.delete(url, headers: headers);
      return response;
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  static Map<String, dynamic> parseResponse(http.Response response) {
    print('📥 Parsing response: ${response.statusCode}');
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      print(
          '✓ Parsed successfully: ${data.toString().substring(0, data.toString().length > 200 ? 200 : data.toString().length)}');
      return data;
    } else {
      final error = jsonDecode(response.body);
      print('❌ Parse Error: ${error['mensaje'] ?? 'Error desconocido'}');
      throw Exception(error['mensaje'] ?? 'Error desconocido');
    }
  }
}
