# Inventario SaaS - Aplicación Móvil Flutter

Aplicación móvil multiplataforma para el sistema de inventario y ventas SaaS.

## 📱 Características

### Módulos Implementados

1. **🔐 Login & Autenticación**
   - Inicio de sesión con email/password
   - Verificación de token JWT
   - Almacenamiento seguro de credenciales
   - Splash screen con validación automática

2. **🛒 Ventas**
   - Catálogo de productos con búsqueda
   - Carrito de compras
   - Gestión de cantidades
   - Registro de ventas
   - Historial de ventas

3. **👥 Clientes**
   - Lista de clientes
   - Búsqueda de clientes
   - Crear/editar clientes
   - Múltiples tipos de documento (DNI, RUC, CE, Pasaporte)

4. **📦 Inventario**
   - Vista de todos los productos
   - Filtros por stock (bajo/agotado)
   - Búsqueda de productos
   - Indicadores visuales de stock

5. **🔔 Notificaciones**
   - Notificaciones push (Firebase)
   - Stock bajo/agotado
   - Ventas registradas
   - Compras aprobadas
   - Marcar como leída
   - Eliminar notificaciones

## 🛠️ Tecnologías

- **Framework**: Flutter 3.0+
- **Lenguaje**: Dart
- **Estado**: Provider
- **Navegación**: GoRouter
- **HTTP**: Dio & HTTP
- **Notificaciones**: Firebase Cloud Messaging
- **Almacenamiento**: SharedPreferences & FlutterSecureStorage
- **UI**: Material Design 3

## 📦 Dependencias Principales

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Estado
  provider: ^6.1.1

  # Navegación
  go_router: ^13.0.1

  # Networking
  http: ^1.2.0
  dio: ^5.4.0

  # Almacenamiento
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # Firebase
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
  flutter_local_notifications: ^16.3.0

  # UI
  google_fonts: ^6.1.0
  intl: ^0.18.1
```

## 🚀 Instalación

### Prerrequisitos

1. Flutter SDK (3.0+)
2. Android Studio / Xcode
3. Dispositivo Android/iOS o emulador

### Pasos

1. **Navega al directorio mobile**

   ```bash
   cd mobile
   ```

2. **Instala las dependencias**

   ```bash
   flutter pub get
   ```

3. **Configura Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Descarga `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
   - Colócalos en:
     - Android: `android/app/google-services.json`
     - iOS: `ios/Runner/GoogleService-Info.plist`

4. **Configura la URL del backend**

   Edita `lib/config/constants.dart`:

   ```dart
   static const String baseUrl = 'http://TU_IP:3000/api';
   ```

5. **Ejecuta la aplicación**
   ```bash
   flutter run
   ```

## 📱 Configuración para Dispositivos Físicos

### Android

Asegúrate de que tu backend esté accesible desde la red:

```dart
// Si tu backend está en localhost
static const String baseUrl = 'http://10.0.2.2:3000/api'; // Emulador Android

// Si usas un dispositivo físico
static const String baseUrl = 'http://192.168.1.X:3000/api'; // Reemplaza con tu IP local
```

### iOS

Agrega permisos en `ios/Runner/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## 🏗️ Estructura del Proyecto

```
mobile/
├── lib/
│   ├── config/
│   │   ├── constants.dart          # Constantes globales
│   │   ├── routes.dart             # Configuración de rutas
│   │   └── theme.dart              # Tema de la app
│   ├── models/
│   │   ├── usuario.dart
│   │   ├── producto.dart
│   │   ├── cliente.dart
│   │   ├── venta.dart
│   │   └── notificacion.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── productos_provider.dart
│   │   ├── ventas_provider.dart
│   │   ├── clientes_provider.dart
│   │   └── notificaciones_provider.dart
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── splash_screen.dart
│   │   │   └── login_screen.dart
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── ventas/
│   │   │   ├── ventas_screen.dart
│   │   │   ├── catalogo_screen.dart
│   │   │   └── nueva_venta_screen.dart
│   │   ├── clientes/
│   │   │   ├── clientes_screen.dart
│   │   │   └── detalle_cliente_screen.dart
│   │   ├── inventario/
│   │   │   ├── inventario_screen.dart
│   │   │   └── detalle_producto_screen.dart
│   │   └── notificaciones/
│   │       └── notificaciones_screen.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   └── notification_service.dart
│   └── main.dart
├── pubspec.yaml
└── README.md
```

## 🔐 Autenticación

La app utiliza JWT (JSON Web Tokens) para la autenticación:

1. El usuario inicia sesión con email y contraseña
2. El backend retorna un token JWT
3. El token se guarda en `FlutterSecureStorage`
4. Todas las peticiones incluyen el token en el header `Authorization`

## 🔔 Notificaciones Push

### Configuración

1. **Firebase Cloud Messaging** está configurado
2. El token FCM se obtiene automáticamente al iniciar la app
3. Las notificaciones se muestran incluso cuando la app está en background

### Tipos de Notificaciones

- **STOCK_BAJO**: Productos con stock por debajo del mínimo
- **STOCK_AGOTADO**: Productos sin stock
- **VENTA_REGISTRADA**: Nueva venta realizada
- **COMPRA_APROBADA**: Compra aprobada

## 📊 Gestión de Estado

Se utiliza **Provider** para la gestión de estado:

- `AuthProvider`: Autenticación y sesión
- `ProductosProvider`: Productos e inventario
- `VentasProvider`: Ventas y carrito
- `ClientesProvider`: Gestión de clientes
- `NotificacionesProvider`: Notificaciones

## 🎨 Temas y Colores

```dart
Primary Color: #2563EB (Azul)
Secondary Color: #10B981 (Verde)
Error Color: #EF4444 (Rojo)
Warning Color: #F59E0B (Naranja)
Success Color: #10B981 (Verde)
```

## 🧪 Testing

```bash
# Ejecutar tests
flutter test

# Análisis de código
flutter analyze
```

## 📦 Build de Producción

### Android APK

```bash
flutter build apk --release
```

### Android App Bundle (para Play Store)

```bash
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

## 🔧 Troubleshooting

### Error de conexión al backend

1. Verifica que el backend esté corriendo
2. Asegúrate de usar la IP correcta (no localhost si usas dispositivo físico)
3. Verifica que no haya firewall bloqueando la conexión

### Notificaciones no llegan

1. Verifica que Firebase esté correctamente configurado
2. Asegúrate de tener los archivos `google-services.json` / `GoogleService-Info.plist`
3. Verifica permisos de notificaciones en el dispositivo

### Error al compilar

```bash
flutter clean
flutter pub get
flutter run
```

## 📝 Próximas Características

- [ ] Modo offline con sincronización
- [ ] Reportes y estadísticas
- [ ] Escáner de códigos de barras
- [ ] Cámara para fotos de productos
- [ ] Firma digital en ventas
- [ ] Multi-idioma

## 👥 Soporte

Para más información sobre el backend, consulta la documentación en el directorio `backend/`.

## 📄 Licencia

Este proyecto es parte del sistema SaaS de Inventario y Ventas.
