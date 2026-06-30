# Tech Ecommerce API - Proyecto Final Full Stack Developer

API RESTful para un ecommerce de productos tecnológicos (laptops, smartphones, accesorios, etc.) construida con Node.js, Express.js y MongoDB.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Ejecución](#-ejecución)
- [Tests](#-tests)
- [Docker](#-docker)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)

## 🚀 Características

- Catálogo de productos con filtrado por categoría, precio y búsqueda
- Autenticación JWT con roles (admin/cliente)
- Gestión completa de productos (CRUD)
- Sistema de reseñas de productos
- Validación de datos
- Tests funcionales completos (unitarios, integración, E2E)
- Dockerizado con mejores prácticas

## 📁 Estructura del Proyecto

```
/workspace/
├── src/
│   ├── config/          # Configuraciones (database.js)
│   ├── controllers/     # Controladores (product.controller.js)
│   ├── middlewares/     # Middlewares (auth, error handling)
│   ├── models/          # Modelos Mongoose (Product, User, Cart, Order)
│   ├── routes/          # Rutas de API (product.routes.js)
│   ├── services/        # Servicios de negocio (product.service.js)
│   ├── utils/           # Utilidades
│   ├── validators/      # Validadores (express-validator)
│   └── server.js        # Punto de entrada
├── tests/
│   ├── e2e/             # Tests end-to-end
│   ├── integration/     # Tests de integración
│   ├── unit/            # Tests unitarios
│   ├── fixtures/        # Datos de prueba
│   └── helpers/         # Helpers y mocks para tests
├── docs/                # Documentación
├── Dockerfile           # Configuración Docker
├── package.json
└── README.md
```

## 📦 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- MongoDB (local o Atlas)
- Docker (opcional, para contenerización)

## 🔧 Instalación

### Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd tech-ecommerce-api
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tech-ecommerce
JWT_SECRET=tu-secreto-muy-seguro-cambiar-en-produccion
NODE_ENV=development
```

## ▶️ Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

La API estará disponible en `http://localhost:3000`

### Health check

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Ecommerce API is running"
}
```

## 🧪 Tests

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests con coverage

```bash
npm test -- --coverage
```

### Ejecutar tests específicos

```bash
# Tests unitarios
npm test -- --testPathPattern=unit

# Tests de integración
npm test -- --testPathPattern=integration

# Tests E2E
npm test -- --testPathPattern=e2e
```

### Cobertura de Tests

Los tests cubren:
- ✅ **Tests Unitarios**: Service layer con mocks de dependencias
- ✅ **Tests de Integración**: Controller layer con servicios mockeados
- ✅ **Tests E2E**: Endpoints completos simulando requests HTTP reales

#### Endpoints Testeados

| Endpoint | Método | Auth | Role | Tests |
|----------|--------|------|------|-------|
| `/api/products` | GET | No | - | ✅ |
| `/api/products/:id` | GET | No | - | ✅ |
| `/api/products` | POST | Sí | Admin | ✅ |
| `/api/products/:id` | PUT | Sí | Admin | ✅ |
| `/api/products/:id` | DELETE | Sí | Admin | ✅ |
| `/api/products/:id/reviews` | POST | Sí | User | ✅ |

#### Casos de Prueba

- ✅ **Éxito**: Operaciones exitosas con datos válidos
- ✅ **Error**: Manejo de errores (404, 500, etc.)
- ✅ **Validación**: Datos inválidos (400 Bad Request)
- ✅ **Autorización**: Control de acceso por roles (403 Forbidden)
- ✅ **Autenticación**: Tokens inválidos/expirados (401 Unauthorized)

## 🐳 Docker

### Construir la imagen

```bash
docker build -t tech-ecommerce-api:latest .
```

### Ejecutar el contenedor

```bash
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/tech-ecommerce \
  -e JWT_SECRET=secret-key \
  --name tech-ecommerce \
  tech-ecommerce-api:latest
```

### Imagen en DockerHub

**Repositorio**: `<TU_USUARIO>/tech-ecommerce-api`  
**Tag**: `latest` o versión específica (ej: `v1.0.0`)

```bash
# Pull de la imagen
docker pull <TU_USUARIO>/tech-ecommerce-api:latest

# Ejecutar desde DockerHub
docker run -d -p 3000:3000 <TU_USUARIO>/tech-ecommerce-api:latest
```

### Optimizaciones del Dockerfile

1. **Multi-stage build**: Reduce el tamaño final de la imagen
2. **Node Alpine**: Imagen base mínima (~150MB vs ~900MB de node:slim)
3. **Layer caching**: Copia de package.json primero para aprovechar caché
4. **Non-root user**: Ejecución como usuario no privilegiado por seguridad
5. **Health check**: Monitoreo automático del contenedor
6. **npm cache clean**: Limpieza de caché para reducir tamaño

### Escaneo de Seguridad

```bash
# Usando Docker Scout (requiere Docker Desktop)
docker scout cve tech-ecommerce-api:latest

# O usando Trivy
trivy image tech-ecommerce-api:latest
```

## 🔌 Endpoints de la API

### Productos

#### Listar productos
```http
GET /api/products?category=laptops&minPrice=100&maxPrice=1000&page=1&limit=10
```

#### Obtener producto por ID
```http
GET /api/products/:id
```

#### Crear producto (Admin)
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMIN>

{
  "name": "MacBook Pro 16\"",
  "description": "Potente laptop para profesionales",
  "price": 2499.99,
  "category": "laptops",
  "stock": 25,
  "brand": "Apple"
}
```

#### Actualizar producto (Admin)
```http
PUT /api/products/:id
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMIN>

{
  "name": "Nombre Actualizado",
  "price": 2299.99
}
```

#### Eliminar producto (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <TOKEN_ADMIN>
```

#### Agregar reseña
```http
POST /api/products/:id/reviews
Content-Type: application/json
Authorization: Bearer <TOKEN_USER>

{
  "rating": 5,
  "comment": "Excelente producto!"
}
```

### Autenticación

Los endpoints protegidos requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

## 🛠 Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Runtime | Node.js | 20.x |
| Framework | Express.js | 5.x |
| Base de Datos | MongoDB | 6.x |
| ODM | Mongoose | 9.x |
| Testing | Jest | 29.x |
| HTTP Testing | Supertest | 6.x |
| Autenticación | JWT | 9.x |
| Validación | express-validator | 7.x |
| Contenerización | Docker | Latest |

## 📄 Licencia

ISC

## 👨‍💻 Autor

Proyecto desarrollado como entrega final de la carrera Full Stack Developer.

---

**URL del Repositorio**: `<URL_DE_TU_REPOSITORIO>`  
**URL de DockerHub**: `https://hub.docker.com/r/<TU_USUARIO>/tech-ecommerce-api`
