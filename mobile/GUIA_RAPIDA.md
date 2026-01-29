# GUÍA RÁPIDA - App Móvil Flutter

## 🚀 Inicio Rápido

### 1. Instalación

```bash
cd mobile
flutter pub get
```

### 2. Configuración Backend

Edita `lib/config/constants.dart`:

```dart
// Para emulador Android
static const String baseUrl = 'http://10.0.2.2:3000/api';

// Para dispositivo físico (reemplaza con tu IP local)
static const String baseUrl = 'http://192.168.1.X:3000/api';
```

### 3. Ejecutar

```bash
flutter run
```

## 📱 Credenciales de Prueba

Usa las mismas credenciales del backend:

```
Email: superuser@sistema.com
Password: Admin123!
```

## 🎯 Módulos Disponibles

| Módulo         | Ruta              | Descripción               |
| -------------- | ----------------- | ------------------------- |
| Login          | `/login`          | Autenticación de usuarios |
| Home           | `/home`           | Pantalla principal        |
| Ventas         | `/ventas`         | Historial de ventas       |
| Catálogo       | `/catalogo`       | Productos para vender     |
| Nueva Venta    | `/nueva-venta`    | Carrito y checkout        |
| Clientes       | `/clientes`       | Gestión de clientes       |
| Inventario     | `/inventario`     | Stock de productos        |
| Notificaciones | `/notificaciones` | Alertas del sistema       |

## 🔧 Comandos Útiles

```bash
# Limpiar proyecto
flutter clean

# Ver dispositivos disponibles
flutter devices

# Ejecutar en dispositivo específico
flutter run -d <device_id>

# Hot reload (en app corriendo)
r

# Hot restart (en app corriendo)
R

# Salir
q
```

## 📦 Build

```bash
# Android APK
flutter build apk --release

# iOS
flutter build ios --release
```

## 🔔 Firebase (Notificaciones)

1. Crea proyecto en [Firebase Console](https://console.firebase.google.com)
2. Descarga archivos de configuración:
   - Android: `google-services.json` → `android/app/`
   - iOS: `GoogleService-Info.plist` → `ios/Runner/`
3. Ejecuta:

```bash
flutter clean
flutter pub get
flutter run
```

## 🐛 Problemas Comunes

### Error de conexión

- Verifica que el backend esté corriendo
- Usa la IP correcta (no localhost en dispositivo físico)

### Error al compilar

```bash
flutter clean
flutter pub get
flutter run
```

### Notificaciones no funcionan

- Verifica archivos de Firebase
- Comprueba permisos en el dispositivo

## 📱 Funcionalidades Principales

### Login

- Email y contraseña
- Validación en tiempo real
- Almacenamiento seguro del token

### Ventas

- Ver catálogo de productos
- Agregar al carrito
- Seleccionar cliente
- Confirmar venta

### Clientes

- Lista con búsqueda
- Crear/editar cliente
- Diferentes tipos de documento

### Inventario

- Ver todos los productos
- Filtrar por stock bajo
- Ver productos sin stock
- Búsqueda por nombre

### Notificaciones

- Push notifications
- Stock bajo/agotado
- Ventas registradas
- Marcar como leída/eliminar

## 🎨 Personalización

### Cambiar colores

Edita `lib/config/theme.dart`:

```dart
static const Color primaryColor = Color(0xFF2563EB);
static const Color secondaryColor = Color(0xFF10B981);
```

### Cambiar logo

Reemplaza el icono en:

- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

## 📚 Recursos

- [Documentación Flutter](https://flutter.dev/docs)
- [Pub.dev](https://pub.dev) - Paquetes de Flutter
- [Firebase](https://firebase.google.com/docs/flutter/setup)
