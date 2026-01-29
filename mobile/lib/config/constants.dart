class AppConstants {
  // API Configuration
  // IMPORTANTE: Cambia esta IP según tu entorno:
  //
  // 1. Para emulador Android:
  //    static const String baseUrl = 'http://10.0.2.2:3000/api';
  //
  // 2. Para dispositivo físico en la misma red:
  //    - Ejecuta 'ipconfig' en Windows o 'ifconfig' en Linux/Mac
  //    - Busca tu IP local (ej: 192.168.0.11)
  //    - Usa: http://TU_IP:3000/api
  //
  // 3. Para otro desarrollador:
  //    - Debe usar la IP de SU computadora donde corre el backend
  //    - Asegurarse que el firewall permita conexiones al puerto 3000

  static const String baseUrl = 'http://192.168.0.11:3000/api';

  // Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String verificarTokenEndpoint = '/auth/verificar';
  static const String productosEndpoint = '/productos';
  static const String ventasEndpoint = '/ventas';
  static const String clientesEndpoint = '/clientes';
  static const String notificacionesEndpoint = '/notificaciones';
  static const String categoriasEndpoint = '/categorias';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String empresaKey = 'empresa_data';

  // Notifications
  static const String fcmTokenKey = 'fcm_token';

  // Paginación
  static const int itemsPerPage = 20;

  // Stock
  static const int stockBajoThreshold = 10;
}
