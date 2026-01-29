# 📊 Historial de Suscripciones - Guía Completa

## ✅ Implementación Completada

Se ha agregado un **historial completo de cambios de suscripción** visible en la página "Mi Empresa".

---

## 🎨 Características

### 1. **Botón Toggle**

- Ubicado en la sección "Historial de Suscripciones"
- Muestra/oculta el historial con un click
- Carga los datos solo cuando se despliega (optimización)

### 2. **Tabla Detallada**

Muestra para cada cambio de plan:

| Campo             | Descripción                 | Formato                           |
| ----------------- | --------------------------- | --------------------------------- |
| **Fecha**         | Cuándo se realizó el cambio | DD MMM YYYY (ej: 28 Ene 2026)     |
| **Plan Anterior** | Plan antes del cambio       | Badge con color                   |
| **Plan Nuevo**    | Plan después del cambio     | Badge con color                   |
| **Monto**         | Cantidad pagada             | Bs. XX.XX (verde)                 |
| **Método**        | Forma de pago               | EFECTIVO/QR/TARJETA/TRANSFERENCIA |
| **Estado**        | Estado del pago             | COMPLETADO/PENDIENTE/RECHAZADO    |
| **Vencimiento**   | Fecha de expiración         | DD MMM YYYY (+30 días)            |

### 3. **Badges de Colores**

#### Planes:

- **BÁSICO**: Azul claro (#e3f2fd)
- **PREMIUM**: Morado claro (#f3e5f5)
- **EMPRESARIAL**: Naranja claro (#fff3e0)

#### Estados:

- **COMPLETADO**: Verde (#d4edda)
- **PENDIENTE**: Amarillo (#fff3cd)
- **RECHAZADO**: Rojo (#f8d7da)

### 4. **Responsive Design**

- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Scroll horizontal si es necesario
- **Móvil**: Fuente más pequeña, padding reducido

---

## 🔄 Flujo de Uso

1. **Usuario hace login** con cuenta que tenga empresa
2. **Va a "Mi Empresa"** desde el menú lateral
3. **Scrollea hasta "Historial de Suscripciones"**
4. **Click en "Ver Historial"**
   - Si es la primera vez, hace petición al backend
   - Muestra tabla con todos los cambios
5. **Después de cambiar de plan**
   - El historial se recarga automáticamente
   - El nuevo cambio aparece al inicio (orden DESC)

---

## 💾 Registro en Base de Datos

Cada cambio de plan crea un registro en `historial_pagos`:

```sql
-- Ejemplo de registro
INSERT INTO historial_pagos (
  id_empresa,
  id_usuario,
  plan_anterior,
  plan_nuevo,
  monto,
  metodo_pago,
  estado_pago,
  descripcion,
  fecha_pago,
  fecha_vencimiento,
  fecha_creacion
) VALUES (
  5,                           -- ID de la empresa
  12,                          -- ID del usuario que hizo el cambio
  'BASICO',                    -- Plan que tenía
  'PREMIUM',                   -- Plan nuevo
  150.00,                      -- Monto pagado
  'QR',                        -- Método de pago
  'COMPLETADO',                -- Estado
  'Cambio de plan de BASICO a PREMIUM',
  '2026-01-28 23:30:00',      -- Ahora
  '2026-02-27 23:30:00',      -- +30 días
  '2026-01-28 23:30:00'       -- Ahora
);
```

---

## 🛠️ Archivos Modificados

### Frontend:

#### `MiEmpresa.jsx`

```javascript
// Nuevos estados
const [historialPagos, setHistorialPagos] = useState([]);
const [mostrarHistorial, setMostrarHistorial] = useState(false);

// Nueva función
const cargarHistorialPagos = async () => {
	const response = await api.get("/empresas/mi-empresa/historial-pagos");
	setHistorialPagos(response.data.data);
};

// Nuevo JSX - Sección completa del historial
```

#### `MiEmpresa.css`

```css
/* Nuevos estilos */
.historial-section {
}
.historial-header {
}
.btn-toggle-historial {
}
.tabla-historial {
}
.badge-plan {
}
.badge-estado {
}
```

### Backend:

#### `empresa.controller.js`

```javascript
// Ya existía
exports.obtenerHistorialPagos = async (req, res) => {
	// Obtiene pagos por id_empresa
	// Incluye datos del usuario que hizo el cambio
	// Ordenados por fecha descendente
};
```

#### `empresas.routes.js`

```javascript
// Ya existía
router.get(
	"/mi-empresa/historial-pagos",
	empresaController.obtenerHistorialPagos,
);
```

---

## 🧪 Cómo Probar

### Paso 1: Login

```
Email: admin1769657379956@miempresademo.com
Password: 12345678
```

### Paso 2: Cambiar de Plan

1. Ve a "Mi Empresa"
2. Scroll hasta "Gestión de Suscripción"
3. Click "Cambiar a este plan" en PREMIUM
4. Selecciona método de pago (QR)
5. Click "Confirmar Pago"
6. ✅ Se registra el cambio

### Paso 3: Ver Historial

1. Scroll hasta "Historial de Suscripciones"
2. Click "Ver Historial"
3. ✅ Verás el cambio que acabas de hacer:
   - Fecha: Hoy
   - Plan Anterior: BASICO (azul)
   - Plan Nuevo: PREMIUM (morado)
   - Monto: Bs. 150.00
   - Método: QR
   - Estado: COMPLETADO (verde)
   - Vencimiento: 30 días desde hoy

### Paso 4: Cambiar de Nuevo

1. Cambia a EMPRESARIAL (Bs. 300)
2. Click "Ver Historial" de nuevo
3. ✅ Ahora verás 2 registros:
   - **Primero**: PREMIUM → EMPRESARIAL (Bs. 300)
   - **Segundo**: BASICO → PREMIUM (Bs. 150)

---

## 📊 Ejemplo Visual del Historial

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                      HISTORIAL DE SUSCRIPCIONES                               ║
║                                                                [Ver Historial] ║
╠═══════════╦══════════════╦═════════════╦═══════╦═══════════╦═══════════╦═══════╣
║  Fecha    ║ Plan Anterior║ Plan Nuevo  ║ Monto ║  Método   ║  Estado   ║ Venc  ║
╠═══════════╬══════════════╬═════════════╬═══════╬═══════════╬═══════════╬═══════╣
║ 28 Ene    ║  [PREMIUM]   ║[EMPRESARIAL]║150.00 ║    QR     ║COMPLETADO ║27 Feb ║
║  2026     ║   morado     ║   naranja   ║verde  ║           ║  verde    ║ 2026  ║
╠═══════════╬══════════════╬═════════════╬═══════╬═══════════╬═══════════╬═══════╣
║ 28 Ene    ║   [BASICO]   ║  [PREMIUM]  ║ 50.00 ║ EFECTIVO  ║COMPLETADO ║27 Feb ║
║  2026     ║    azul      ║   morado    ║verde  ║           ║  verde    ║ 2026  ║
╚═══════════╩══════════════╩═════════════╩═══════╩═══════════╩═══════════╩═══════╝
```

---

## 🎯 Beneficios

1. **Transparencia**: Usuario ve todo su historial de pagos
2. **Auditoría**: Registro completo para contabilidad
3. **Trazabilidad**: Quién cambió el plan y cuándo
4. **Planificación**: Fecha de vencimiento visible
5. **Confianza**: Sistema profesional y claro

---

## 🔐 Seguridad

- ✅ Solo el usuario puede ver el historial de su empresa
- ✅ SUPERUSER puede ver el historial de todas las empresas
- ✅ Autenticación con token JWT
- ✅ Validación de permisos en el backend

---

## 📱 Responsive

### Desktop (≥992px)

- Tabla completa
- Todas las columnas visibles
- Fuente 0.9rem

### Tablet (768-991px)

- Tabla con scroll horizontal
- Todas las columnas
- Fuente 0.9rem

### Móvil (<768px)

- Tabla con scroll horizontal
- Padding reducido
- Fuente 0.8rem
- Botón "Ver Historial" a 100% de ancho

---

## 🚀 API Endpoint

### GET `/api/empresas/mi-empresa/historial-pagos`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
	"success": true,
	"data": [
		{
			"id_pago": 1,
			"id_empresa": 5,
			"id_usuario": 12,
			"plan_anterior": "BASICO",
			"plan_nuevo": "PREMIUM",
			"monto": "150.00",
			"metodo_pago": "QR",
			"estado_pago": "COMPLETADO",
			"descripcion": "Cambio de plan de BASICO a PREMIUM",
			"fecha_pago": "2026-01-28T23:30:00.000Z",
			"fecha_vencimiento": "2026-02-27T23:30:00.000Z",
			"fecha_creacion": "2026-01-28T23:30:00.000Z",
			"usuario": {
				"id_usuario": 12,
				"nombre": "Juan",
				"apellido": "Pérez",
				"email": "admin@miempresa.com"
			}
		}
	]
}
```

**Response (400 Bad Request):**

```json
{
	"success": false,
	"mensaje": "El usuario no tiene una empresa asociada"
}
```

---

## ✅ Checklist de Implementación

- [x] Migración de base de datos (`historial_pagos`)
- [x] Modelo `HistorialPago` con asociaciones
- [x] Controlador `obtenerHistorialPagos`
- [x] Ruta GET `/mi-empresa/historial-pagos`
- [x] Estado React para historial
- [x] Función `cargarHistorialPagos()`
- [x] Botón toggle en UI
- [x] Tabla responsive con datos
- [x] Badges de colores para planes
- [x] Badges de estados para pagos
- [x] Estilos CSS completos
- [x] Recarga automática después de cambio
- [x] Orden descendente por fecha
- [x] Formato de fechas español
- [x] Responsive para móviles

---

## 🎉 ¡Sistema Completo!

El historial de suscripciones está **100% funcional** y listo para producción. Los usuarios pueden:

1. ✅ Ver todos sus cambios de plan
2. ✅ Conocer las fechas de vencimiento
3. ✅ Revisar métodos de pago usados
4. ✅ Verificar estados de pagos
5. ✅ Tener trazabilidad completa

**El sistema registra automáticamente cada cambio de suscripción con toda la información relevante.**
