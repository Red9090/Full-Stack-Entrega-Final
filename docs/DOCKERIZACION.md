# 🐳 Dockerización - Tech Ecommerce API

## 📋 Descripción del Proceso de Construcción

Este documento detalla el proceso de construcción de la imagen Docker para la **Tech Ecommerce API**.

---

## 🔧 Archivos Docker Creados

### 1. **Dockerfile** (Multi-stage Build)

El Dockerfile utiliza un enfoque multi-stage con 3 etapas:

#### **Stage 1: Builder**
```dockerfile
FROM node:20-alpine AS builder
```
- **Propósito**: Instalar dependencias y preparar el código
- **Base**: Node.js 20 Alpine (ligera ~170MB)
- **Optimización**: Copia primero `package.json` para aprovechar cache de capas

#### **Stage 2: Production** (Imagen final)
```dockerfile
FROM node:20-alpine AS production
```
- **Propósito**: Imagen final optimizada para producción
- **Seguridad**: Usuario no root (`nodejs:1001`)
- **Tamaño reducido**: Solo incluye lo necesario para ejecutar la app

#### **Stage 3: Development** (Opcional)
```dockerfile
FROM node:20-alpine AS development
```
- **Propósito**: Entorno de desarrollo con hot-reload
- **Incluye**: Todas las devDependencies

---

## 🚀 Optimizaciones Implementadas

### ✅ Buenas Prácticas Aplicadas

| Optimización | Beneficio |
|-------------|-----------|
| **Multi-stage build** | Reduce tamaño final de ~900MB a ~200MB |
| **Alpine Linux** | Imagen base mínima, menos vulnerabilidades |
| **Layer caching** | `package.json` copiado antes del código fuente |
| **Usuario no root** | Mayor seguridad (previene escalada de privilegios) |
| **`.dockerignore`** | Excluye archivos innecesarios (node_modules, .env, tests) |
| **Health checks** | Monitoreo automático del estado del contenedor |
| **Variables de entorno** | Configuración flexible sin rebuild |

### 📊 Comparativa de Tamaño

| Enfoque | Tamaño Estimado |
|---------|-----------------|
| Dockerfile tradicional | ~900 MB |
| **Nuestro Dockerfile optimizado** | **~200 MB** |
| **Reducción** | **~78% más ligero** |

---

## 🏗️ Proceso de Construcción

### **Paso 1: Construir la imagen**

```bash
# Construir imagen de producción
docker build -t red9090/tech-ecommerce-api:latest --target production .
```

### **Paso 2: Verificar imagen construida**

```bash
# Listar imágenes locales
docker images red9090/tech-ecommerce-api
```

**Salida esperada:**
```
REPOSITORY                    TAG       IMAGE ID       CREATED         SIZE
red9090/tech-ecommerce-api    latest    abc123def456   2 minutes ago   215MB
```

### **Paso 3: Ejecutar con Docker Compose (Recomendado)**

```bash
# Iniciar MongoDB + API
docker-compose up -d
```

**Servicios iniciados:**
- 🗄️ `tech-ecommerce-mongo` (MongoDB 7.0)
- 🚀 `tech-ecommerce-api` (Node.js API)

### **Paso 4: Verificar ejecución**

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Verificar health check
docker-compose ps
```

---

## 🔍 Logs de Construcción (Simulados)

```bash
$ docker build -t red9090/tech-ecommerce-api:latest --target production .

[+] Building 45.2s (15/15) FINISHED
 => [internal] load build definition from Dockerfile                       0.0s
 => => transferring dockerfile: 1.87kB                                     0.0s
 => [internal] load .dockerignore                                          0.0s
 => => transferring context: 312B                                          0.0s
 => [internal] load metadata for docker.io/library/node:20-alpine          2.5s
 => [builder 1/4] FROM docker.io/library/node:20-alpine@sha256:abc123      3.2s
 => => resolve docker.io/library/node:20-alpine@sha256:abc123              0.0s
 => => sha256:abc123def456... 32.45MB / 32.45MB                           2.8s
 => [builder 2/4] WORKDIR /app                                             0.1s
 => [builder 3/4] COPY package*.json ./                                    0.0s
 => [builder 4/4] RUN npm ci --only=production && npm cache clean --force 15.3s
 => => npm WARN deprecated ...                                             0.0s
 => => added 245 packages in 14.8s                                         0.0s
 => [production 1/5] FROM docker.io/library/node:20-alpine@sha256:abc123   3.1s
 => [production 2/5] RUN addgroup -g 1001 -S nodejs && adduser -S nodejs   0.3s
 => [production 3/5] WORKDIR /app                                          0.0s
 => [production 4/5] COPY --from=builder --chown=nodejs:nodejs             0.2s
 => [production 5/5] COPY package*.json ./                                 0.1s
 => exporting to image                                                     1.2s
 => => exporting layers                                                    1.1s
 => => writing image sha256:def456abc789...                                0.0s
 => => naming to docker.io/red9090/tech-ecommerce-api:latest               0.0s

✅ Successfully built red9090/tech-ecommerce-api:latest
📦 Image size: 215MB
```

---

## 🎯 Variables de Entorno

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `3000` | Puerto de la API |
| `MONGODB_URI` | `mongodb://mongo:27017/tech-ecommerce` | Conexión a MongoDB |
| `JWT_SECRET` | *(requerido)* | Clave secreta para JWT |
| `JWT_EXPIRE` | `30d` | Expiración de tokens |

---

## 🔗 Redes y Volúmenes

### Red Docker
- **Nombre**: `tech-ecommerce-network`
- **Tipo**: Bridge
- **Propósito**: Aislar comunicación entre servicios

### Volúmenes
- **Nombre**: `mongo_data`
- **Propósito**: Persistencia de datos de MongoDB
- **Ubicación**: `/var/lib/docker/volumes/mongo_data`

---

## 🧪 Comandos Útiles

```bash
# Ver logs de la aplicación
docker-compose logs app

# Ver logs de MongoDB
docker-compose logs mongo

# Acceder al contenedor de la app
docker exec -it tech-ecommerce-api sh

# Acceder a MongoDB
docker exec -it tech-ecommerce-mongo mongosh -u admin -p admin123

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir desde cero
docker-compose up -d --build --force-recreate
```

---

## 📝 Notas Importantes

1. **Seguridad**: Cambia `JWT_SECRET` en producción
2. **Persistencia**: Los datos de MongoDB se guardan en volumen Docker
3. **Health Checks**: La API verifica conectividad cada 30s
4. **Puertos**: 
   - API: `http://localhost:3000`
   - MongoDB: `localhost:27017`

---

## ✅ Checklist de Verificación

- [x] Dockerfile multi-stage implementado
- [x] Usuario no root configurado
- [x] Health checks agregados
- [x] `.dockerignore` configurado
- [x] docker-compose.yml con MongoDB
- [x] Variables de entorno documentadas
- [ ] Imagen subida a DockerHub (pendiente)
- [ ] Escaneo de seguridad realizado (pendiente)

---

**Próximo paso**: Subir imagen a DockerHub y realizar escaneo de seguridad.
