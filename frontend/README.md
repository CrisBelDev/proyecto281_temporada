# Frontend React - Sistema SaaS de Inventarios y Ventas

Frontend desarrollado en React con Vite para el sistema SaaS multitenant de inventarios y ventas.

## 🚀 Características

- ✅ Interfaz moderna y responsiva
- ✅ Autenticación con JWT
- ✅ Gestión de productos (CRUD)
- ✅ Sistema de ventas con carrito
- ✅ Gestión de compras
- ✅ Dashboard con métricas
- ✅ Control de roles y permisos
- ✅ Reportes básicos
- ✅ Compatible con React Native (misma API)

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Backend corriendo en http://localhost:3000

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Editar el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📁 Estructura del Proyecto

```
frontend/
├── public/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   └── PrivateRoute.jsx
│   │
│   ├── context/          # Contextos de React
│   │   └── AuthContext.jsx
│   │
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── Registro.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Productos.jsx
│   │   ├── Ventas.jsx
│   │   ├── NuevaVenta.jsx
│   │   ├── Compras.jsx
│   │   ├── NuevaCompra.jsx
│   │   ├── Usuarios.jsx
│   │   └── Reportes.jsx
│   │
│   ├── services/         # Servicios API
│   │   ├── api.js
│   │   └── index.js
│   │
│   ├── styles/           # Estilos CSS
│   │   ├── Auth.css
│   │   ├── Layout.css
│   │   ├── Dashboard.css
│   │   ├── Modal.css
│   │   └── ...
│   │
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
│
├── .env                  # Variables de entorno
├── index.html
├── package.json
└── vite.config.js
```

## 🔐 Flujo de Autenticación

1. Usuario ingresa a `/login`
2. Ingresa email y contraseña
3. El sistema valida contra el backend
4. Si es exitoso, guarda el token JWT en localStorage
5. Redirecciona a `/dashboard`
6. Todas las rutas privadas verifican el token

## 📱 Páginas Principales

### Login (`/login`)

- Inicio de sesión
- Validación de credenciales
- Redirección automática si ya está autenticado

### Registro (`/registro`)

- Registro de nueva empresa
- Creación de usuario administrador
- Formulario con validaciones

### Dashboard (`/dashboard`)

- Métricas principales
- Ventas del día
- Stock bajo
- Valor del inventario

### Productos (`/productos`)

- Lista de productos
- Crear/Editar productos (solo ADMIN)
- Activar/Desactivar productos
- Indicador de stock bajo

### Ventas (`/ventas`)

- Historial de ventas
- Nueva venta (`/ventas/nueva`)
- Anular ventas (solo ADMIN)

### Nueva Venta (`/ventas/nueva`)

- Selección de productos
- Carrito de compra
- Cálculo automático de totales
- Métodos de pago

### Compras (`/compras`)

- Historial de compras
- Nueva compra (`/compras/nueva`)
- Anular compras (solo ADMIN)

### Nueva Compra (`/compras/nueva`)

- Selección de productos
- Definición de precios
- Incremento automático de stock

### Usuarios (`/usuarios`)

- Solo ADMIN
- Lista de usuarios
- Crear nuevos usuarios
- Activar/Desactivar usuarios

### Reportes (`/reportes`)

- Reportes de ventas
- Reportes de inventario
- Dashboard general

## 🎨 Estilos

El proyecto utiliza CSS puro con variables CSS para temas:

```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  ...
}
```

## 🔄 Servicios API

Todos los servicios están en `src/services/`:

```javascript
import {
	authService,
	productosService,
	ventasService,
	comprasService,
	usuariosService,
	reportesService,
} from "../services";
```

### Interceptores

- **Request**: Agrega token JWT automáticamente
- **Response**: Maneja errores 401 (sesión expirada)

## 🛡️ Protección de Rutas

El componente `PrivateRoute` protege rutas que requieren autenticación:

```jsx
<Route
	path="/dashboard"
	element={
		<PrivateRoute>
			<Dashboard />
		</PrivateRoute>
	}
/>
```

## 📦 Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### Preview de la build

```bash
npm run preview
```

## 🌐 Deploy

### Netlify / Vercel

1. Conectar repositorio
2. Configurar variables de entorno:
   - `VITE_API_URL=https://tu-api.com/api`
3. Build command: `npm run build`
4. Publish directory: `dist`

### Configuración de proxy (desarrollo)

El archivo `vite.config.js` incluye proxy para evitar CORS:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 🔧 Personalización

### Cambiar colores

Editar variables en `src/index.css`:

```css
:root {
	--primary-color: #tu-color;
	--primary-hover: #tu-color-hover;
}
```

### Agregar nuevas páginas

1. Crear componente en `src/pages/`
2. Agregar ruta en `App.jsx`
3. Agregar link en `Layout.jsx` (sidebar)

## 🐛 Solución de Problemas

### Error de CORS

Asegúrate de que el backend tenga configurado CORS:

```javascript
app.use(cors());
```

### Token expirado

El sistema redirige automáticamente a `/login` cuando el token expira.

### Puerto ocupado

Cambiar puerto en `vite.config.js`:

```javascript
server: {
	port: 5174;
}
```

## 📱 Compatibilidad con React Native

Este frontend está diseñado para usar los mismos servicios API que una aplicación React Native. Los servicios en `src/services/` pueden ser reutilizados.

## 📄 Licencia

MIT

---

**Desarrollado con React + Vite**
