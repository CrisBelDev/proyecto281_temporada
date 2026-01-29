import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/ventas/ventas_screen.dart';
import '../screens/ventas/catalogo_screen.dart';
import '../screens/ventas/nueva_venta_screen.dart';
import '../screens/clientes/clientes_screen.dart';
import '../screens/clientes/detalle_cliente_screen.dart';
import '../screens/inventario/inventario_screen.dart';
import '../screens/inventario/detalle_producto_screen.dart';
import '../screens/inventario/producto_form_screen.dart';
import '../screens/notificaciones/notificaciones_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/ventas',
        name: 'ventas',
        builder: (context, state) => const VentasScreen(),
      ),
      GoRoute(
        path: '/catalogo',
        name: 'catalogo',
        builder: (context, state) => const CatalogoScreen(),
      ),
      GoRoute(
        path: '/nueva-venta',
        name: 'nueva-venta',
        builder: (context, state) => const NuevaVentaScreen(),
      ),
      GoRoute(
        path: '/clientes',
        name: 'clientes',
        builder: (context, state) => const ClientesScreen(),
      ),
      GoRoute(
        path: '/clientes/:id',
        name: 'detalle-cliente',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DetalleClienteScreen(clienteId: id);
        },
      ),
      GoRoute(
        path: '/inventario',
        name: 'inventario',
        builder: (context, state) => const InventarioScreen(),
      ),
      GoRoute(
        path: '/productos/nuevo',
        name: 'nuevo-producto',
        builder: (context, state) => const ProductoFormScreen(),
      ),
      GoRoute(
        path: '/productos/:id/editar',
        name: 'editar-producto',
        builder: (context, state) {
          final id = state.pathParameters['id'];
          return ProductoFormScreen(productoId: id);
        },
      ),
      GoRoute(
        path: '/productos/:id',
        name: 'detalle-producto',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DetalleProductoScreen(productoId: id);
        },
      ),
      GoRoute(
        path: '/notificaciones',
        name: 'notificaciones',
        builder: (context, state) => const NotificacionesScreen(),
      ),
    ],
  );
}
