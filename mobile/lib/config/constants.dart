class AppConstants {
  // API Configuration
  // IMPORTANTE: Cambia esta IP a la de tu computadora
  // Para emulador Android usa: http://10.0.2.2:3000/api
  // Para dispositivo físico usa tu IP local (ejecuta: ipconfig en cmd)
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
