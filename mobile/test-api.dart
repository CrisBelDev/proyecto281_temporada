import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  print('Probando conexión al backend...\n');

  // Probar endpoint raíz
  try {
    print('1. Probando http://192.168.0.11:3000/api');
    final response1 = await http.get(Uri.parse('http://192.168.0.11:3000/api'));
    print('   Status: ${response1.statusCode}');
    print('   Body: ${response1.body}\n');
  } catch (e) {
    print('   ERROR: $e\n');
  }

  // Probar login
  try {
    print('2. Probando login http://192.168.0.11:3000/api/auth/login');
    final response2 = await http.post(
      Uri.parse('http://192.168.0.11:3000/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': 'superuser@sistema.com',
        'password': 'Admin123!',
      }),
    );
    print('   Status: ${response2.statusCode}');
    print('   Body: ${response2.body}\n');
  } catch (e) {
    print('   ERROR: $e\n');
  }
}
