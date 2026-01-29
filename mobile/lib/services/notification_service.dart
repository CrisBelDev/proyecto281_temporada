import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  // static final FlutterLocalNotificationsPlugin _localNotifications =
  //     FlutterLocalNotificationsPlugin();
  static FirebaseMessaging? _firebaseMessaging;

  static Future<void> initialize() async {
    try {
      // Inicializar Firebase Messaging
      _firebaseMessaging = FirebaseMessaging.instance;

      // Solicitar permisos
      await _requestPermissions();

      // Configurar Firebase Messaging
      await _setupFirebaseMessaging();

      print('NotificationService inicializado correctamente');
    } catch (e) {
      print('Error inicializando NotificationService: $e');
      print(
          'Firebase no está configurado. Las notificaciones push no estarán disponibles.');
      _firebaseMessaging = null;
    }
  }

  static Future<void> _requestPermissions() async {
    if (_firebaseMessaging == null) return;

    final settings = await _firebaseMessaging!.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    print('Permisos de notificación: ${settings.authorizationStatus}');
  }

  static Future<void> _setupFirebaseMessaging() async {
    if (_firebaseMessaging == null) return;

    // Obtener token FCM
    final token = await _firebaseMessaging!.getToken();
    print('FCM Token: $token');

    // Escuchar mensajes en primer plano
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Escuchar cuando se toca una notificación
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    print('Mensaje recibido en primer plano: ${message.notification?.title}');

    // Notificaciones locales desactivadas temporalmente
    // Firebase ya muestra las notificaciones automáticamente
    if (message.notification != null) {
      print('Título: ${message.notification!.title}');
      print('Cuerpo: ${message.notification!.body}');
    }
  }

  static void _handleBackgroundMessage(RemoteMessage message) {
    // Navegar a la pantalla correspondiente según el tipo
  }

// Método desactivado temporalmente
  // static Future<void> _showLocalNotification({
  //   required String title,
  //   required String body,
  //   String? payload,
  // }) async {
  //   const androidDetails = AndroidNotificationDetails(
  //     'default_channel',
  //     'Notificaciones generales',
  //     channelDescription: 'Canal para notificaciones de la app',
  //     importance: Importance.high,
  //     priority: Priority.high,
  //   );

  //   const iosDetails = DarwinNotificationDetails();

  //   const details = NotificationDetails(
  //     android: androidDetails,
  //     iOS: iosDetails,
  //   );

  //   await _localNotifications.show(
  //     DateTime.now().millisecond,
  //     title,
  //     body,
  //     details,
  //     payload: payload,
  //   );
  // }

  // static void _onNotificationTapped(NotificationResponse response) {
  //   print('Notificación local tocada: ${response.payload}');
  //   // Navegar según el payload
  // }

  static Future<String?> getFCMToken() async {
    if (_firebaseMessaging == null) return null;
    return await _firebaseMessaging!.getToken();
  }
}
