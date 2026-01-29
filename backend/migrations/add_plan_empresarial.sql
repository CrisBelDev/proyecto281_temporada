-- Agregar plan EMPRESARIAL al enum de plan_suscripcion
ALTER TABLE `empresas` 
MODIFY COLUMN `plan_suscripcion` ENUM('BASICO','PREMIUM','EMPRESARIAL') DEFAULT 'BASICO';

-- Agregar plan EMPRESARIAL al enum de historial_pagos
ALTER TABLE `historial_pagos`
MODIFY COLUMN `plan_anterior` ENUM('BASICO','PREMIUM','EMPRESARIAL') DEFAULT NULL,
MODIFY COLUMN `plan_nuevo` ENUM('BASICO','PREMIUM','EMPRESARIAL') NOT NULL;
