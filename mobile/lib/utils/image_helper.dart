import 'package:flutter/material.dart';
import '../config/constants.dart';

class ImageHelper {
  // URL base sin /api para imágenes
  static const String _baseUrl = 'http://192.168.0.11:3000';

  /// Convierte una ruta relativa de imagen a URL completa
  /// Ejemplo: /uploads/productos/imagen.jpg -> http://192.168.0.11:3000/uploads/productos/imagen.jpg
  static String? getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return null;
    }

    // Si ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Si empieza con /, agregar base URL
    if (imagePath.startsWith('/')) {
      return '$_baseUrl$imagePath';
    }

    // Si no empieza con /, agregar / y base URL
    return '$_baseUrl/$imagePath';
  }

  /// Obtiene un widget de placeholder para productos sin imagen
  static Widget getPlaceholder({
    double? size,
    Color? color,
  }) {
    return Icon(
      Icons.inventory_2,
      size: size ?? 100,
      color: color ?? Colors.grey[400],
    );
  }
}
