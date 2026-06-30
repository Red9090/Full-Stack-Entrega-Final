# Estructura del Proyecto - Tech Ecommerce API

## Árbol de Directorios Completo

```
tech-ecommerce/
├── .gitignore                      # Archivos y carpetas ignorados por Git
├── package.json                    # Dependencias y scripts del proyecto
├── README.md                       # Documentación principal del proyecto
│
├── src/                            # Código fuente principal
│   ├── server.js                   # Punto de entrada de la aplicación
│   │
│   ├── config/                     # Configuraciones del sistema
│   │   └── db.js                   # Conexión a MongoDB
│   │
│   ├── controllers/                # Controladores (lógica de negocio)
│   │   └── product.controller.js   # Controlador de productos
│   │
│   ├── services/                   # Servicios (capa de abstracción de datos)
│   │   └── product.service.js      # Servicio de productos
│   │
│   ├── models/                     # Modelos de base de datos (Mongoose)
│   │   ├── Product.js              # Modelo de Producto
│   │   ├── User.js                 # Modelo de Usuario
│   │   ├── Cart.js                 # Modelo de Carrito
│   │   └── Order.js                # Modelo de Pedido
│   │
│   ├── routes/                     # Rutas de la API
│   │   └── product.routes.js       # Rutas de productos (ENDPOINT PRINCIPAL)
│   │
│   ├── middlewares/                # Middlewares personalizados
│   │   ├── auth.middleware.js      # Autenticación JWT y autorización
│   │   └── error.middleware.js     # Manejo global de errores
│   │
│   ├── validators/                 # Validaciones de datos
│   │   └── product.validator.js    # Validaciones para productos
│   │
│   └── utils/                      # Utilidades y helpers
│       └── .gitkeep
│
├── tests/                          # Tests automatizados
│   ├── unit/                       # Tests unitarios
│   │   └── .gitkeep
│   ├── integration/                # Tests de integración
│   │   └── .gitkeep
│   ├── e2e/                        # Tests end-to-end
│   │   └── .gitkeep
│   ├── fixtures/                   # Datos de prueba predefinidos
│   │   └── .gitkeep
│   └── helpers/                    # Helpers para tests
│       └── .gitkeep
│
├── docs/                           # Documentación adicional
│   └── .gitkeep
│
└── Dockerfile                      # Configuración de Docker (pendiente)
```

---

## Explicación Detallada de Cada Componente

### **RAÍZ DEL PROYECTO**

#### `package.json`
- **Propósito**: Define las dependencias del proyecto, scripts de ejecución y metadatos.
- **Contenido clave**:
  - Scripts: `start`, `dev`, `test`
  - Dependencias: express, mongoose, jsonwebtoken, bcryptjs, express-validator
  - DevDependencies: jest, supertest

#### `.gitignore`
- **Propósito**: Excluye archivos sensibles y generados del control de versiones.
- **Excluye**: `node_modules/`, `.env`, `*.log`, `coverage/`

---

### **CARPETA `src/` - CÓDIGO FUENTE**

#### `server.js` - Punto de Entrada Principal
- **Propósito**: Configura y lanza el servidor Express.
- **Responsabilidades**:
  - Inicializa Express
  - Configura middlewares globales (CORS, JSON parser)
  - Conecta a MongoDB
  - Registra rutas de la API
  - Configura manejo global de errores
  - Exporta la app para testing

---

### **CARPETA `config/` - CONFIGURACIONES**

#### `db.js` - Conexión a Base de Datos
- **Propósito**: Establece y gestiona la conexión a MongoDB.
- **Características**:
  - Usa Mongoose para la conexión
  - Lee URI de variables de entorno
  - Maneja errores de conexión
  - Exporta función asíncrona reutilizable

---

### **CARPETA `controllers/` - CONTROLADORES**

#### `product.controller.js` - Controlador de Productos
- **Propósito**: Maneja la lógica de negocio para operaciones con productos.
- **Métodos principales**:
  - `getAllProducts`: Obtiene lista de productos con filtros y paginación
  - `getProductById`: Obtiene un producto específico por ID
  - `createProduct`: Crea nuevo producto (admin only)
  - `updateProduct`: Actualiza producto existente (admin only)
  - `deleteProduct`: Elimina producto lógicamente (admin only)
  - `addReview`: Agrega reseña a producto (usuarios autenticados)

---

### **CARPETA `services/` - SERVICIOS**

#### `product.service.js` - Servicio de Productos
- **Propósito**: Capa de abstracción entre controladores y modelos.
- **Ventajas**:
  - Separa lógica de negocio del controller
  - Facilita testing y mantenimiento
  - Reutilizable en diferentes partes del sistema
- **Métodos**: CRUD completo + operaciones específicas (reviews, stock)

---

### **CARPETA `models/` - MODELOS DE DATOS**

#### `Product.js` - Modelo de Producto
- **Schema fields**: name, description, price, category, stock, images, brand, specifications, rating, reviewCount, isActive
- **Validaciones**: Required, enums, min/max, custom validators
- **Índices**: Búsqueda textual, filtrado por categoría y precio
- **Hooks**: Timestamps automáticos

#### `User.js` - Modelo de Usuario
- **Schema fields**: name, email, password, role, avatar, isActive
- **Seguridad**: Hash de password con bcrypt
- **Roles**: customer, admin
- **Métodos**: `comparePassword()` para autenticación

#### `Cart.js` - Modelo de Carrito
- **Schema fields**: user, items[], totalAmount
- **Relaciones**: Referencia a User y Product
- **Hooks**: Calcula total automáticamente antes de guardar

#### `Order.js` - Modelo de Pedido
- **Schema fields**: user, items[], totalAmount, status, shippingAddress, paymentMethod, paymentStatus
- **Estados**: pending, confirmed, shipped, delivered, cancelled
- **Traza completa**: timestamps de creación y actualización

---

### **CARPETA `routes/` - RUTAS DE LA API**

#### `product.routes.js` - Router de Productos (PRINCIPAL PARA TESTS)
- **Endpoints**:
  ```
  GET    /api/products           - Listar productos (público)
  GET    /api/products/:id       - Obtener producto por ID (público)
  POST   /api/products           - Crear producto (admin)
  PUT    /api/products/:id       - Actualizar producto (admin)
  DELETE /api/products/:id       - Eliminar producto (admin)
  POST   /api/products/:id/reviews - Agregar reseña (autenticado)
  ```
- **Middlewares aplicados**: authMiddleware, isAdmin según corresponda
- **Documentación JSDoc**: Incluye descripción, acceso y parámetros

---

### **CARPETA `middlewares/` - MIDDLEWARES**

#### `auth.middleware.js` - Autenticación y Autorización
- **Funciones**:
  - `authenticate`: Verifica token JWT, decodifica y adjunta usuario al request
  - `isAdmin`: Verifica que el usuario tenga rol de administrador
- **Manejo de errores**: Token expirado, token inválido, falta de permisos

#### `error.middleware.js` - Manejo Global de Errores
- **Propósito**: Centraliza el manejo de errores en toda la aplicación.
- **Tipos de errores manejados**:
  - ValidationError (Mongoose)
  - Duplicate key errors
  - CastError (ObjectId inválido)
  - JWT errors
  - Errores personalizados con statusCode

---

### **CARPETA `validators/` - VALIDADORES**

#### `product.validator.js` - Validaciones de Productos
- **Reglas de validación** (usando express-validator):
  - `createProductRules`: Validaciones para crear producto
  - `updateProductRules`: Validaciones para actualizar producto
  - `productIdParam`: Valida formato de ObjectId en parámetros
  - `addReviewRules`: Valida rating y comentarios
  - `getProductQueryRules`: Valida query params (filtros, paginación)
- **Middleware**: `handleValidationErrors` procesa errores de validación

---

### **CARPETA `tests/` - TESTS AUTOMATIZADOS**

#### Estructura para Testing:
- `unit/`: Tests unitarios de servicios y funciones aisladas
- `integration/`: Tests de integración de endpoints (aquí irán los tests de product.routes.js)
- `e2e/`: Tests end-to-end de flujos completos
- `fixtures/`: Datos de prueba predefinidos (products, users, etc.)
- `helpers/`: Funciones auxiliares para tests (generar tokens, setup DB, etc.)

---

### **CARPETA `docs/` - DOCUMENTACIÓN**

- **Propósito**: Almacenar documentación adicional, diagramas, especificaciones.
- **Contenido futuro**:
  - Diagramas de arquitectura
  - Especificaciones de API
  - Guías de despliegue

---

## Flujo de una Petición HTTP (Ejemplo: GET /api/products)

```
1. Request llega a server.js
   ↓
2. Middleware CORS y JSON parser
   ↓
3. Router (/api/products → product.routes.js)
   ↓
4. Controller (product.controller.js - getAllProducts)
   ↓
5. Service (product.service.js - getAllProducts)
   ↓
6. Model (Product.find() con filtros)
   ↓
7. MongoDB devuelve datos
   ↓
8. Response se construye en Controller
   ↓
9. Middleware de error (si hay error)
   ↓
10. Response JSON al cliente
```

---

## Buenas Prácticas Implementadas

✅ **Separación de responsabilidades** (Controllers, Services, Models)  
✅ **Inyección de dependencias implícita** (require de módulos)  
✅ **Manejo centralizado de errores**  
✅ **Validaciones en múltiples capas** (validator + model schema)  
✅ **Soft delete** (isActive flag en lugar de borrar físicamente)  
✅ **Timestamps automáticos**  
✅ **Índices para optimización de consultas**  
✅ **Seguridad**: Password hashing, JWT authentication  
✅ **Escalabilidad**: Estructura modular y extensible  

---

## Próximos Pasos (Fases Siguientes)

- **FASE 2**: Crear tests funcionales para todos los endpoints de `product.routes.js`
- **FASE 3**: Crear Dockerfile optimizado
- **FASE 4**: Subir imagen a DockerHub y escaneo de seguridad
- **FASE 5**: Documentación final (README.md y Google Docs)

---

**¿La estructura es correcta o necesitas ajustes antes de pasar a la FASE 2?**
