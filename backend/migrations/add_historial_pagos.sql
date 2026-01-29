-- Tabla de historial de pagos de suscripciones
CREATE TABLE `historial_pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_empresa` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL COMMENT 'Usuario que realizó el cambio',
  `plan_anterior` enum('BASICO','PREMIUM') DEFAULT NULL,
  `plan_nuevo` enum('BASICO','PREMIUM') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','QR','TARJETA','TRANSFERENCIA') DEFAULT 'QR',
  `estado_pago` enum('PENDIENTE','COMPLETADO','RECHAZADO') DEFAULT 'COMPLETADO',
  `descripcion` varchar(500) DEFAULT NULL,
  `fecha_pago` datetime NOT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL COMMENT 'Fecha de vencimiento del plan',
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_empresa` (`id_empresa`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historial_pagos_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `historial_pagos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
