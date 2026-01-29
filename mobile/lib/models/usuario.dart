class Usuario {
  final int id;
  final String nombre;
  final String email;
  final String rol;
  final int? idEmpresa;
  final bool activo;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    this.idEmpresa,
    required this.activo,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    print('📋 Usuario.fromJson - JSON recibido: $json');
    try {
      final id = json['id_usuario'] ?? json['id'];
      final nombre = json['nombre'] ?? '';
      final email = json['email'] ?? '';
      final rol = json['rol'] ?? '';
      final idEmpresa = json['id_empresa'];
      final activo = json['activo'] ?? true;

      print(
          '✓ Campos parseados - id: $id, nombre: $nombre, email: $email, rol: $rol');

      return Usuario(
        id: id,
        nombre: nombre,
        email: email,
        rol: rol,
        idEmpresa: idEmpresa,
        activo: activo,
      );
    } catch (e, stack) {
      print('❌ Error en Usuario.fromJson: $e');
      print('📚 Stack: $stack');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'rol': rol,
      'id_empresa': idEmpresa,
      'activo': activo,
    };
  }
}
