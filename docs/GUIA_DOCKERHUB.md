# 🐳 Subida a DockerHub y Escaneo de Seguridad

## 📋 Guía Paso a Paso

---

## 🔑 1. Crear Cuenta en DockerHub

1. Ve a https://hub.docker.com/
2. Haz clic en **"Sign Up"**
3. Completa el formulario con:
   - Username: `Red9090` (ya registrado)
   - Email: tu email
   - Password: tu contraseña
4. Verifica tu email

---

## 🔐 2. Iniciar Sesión desde Terminal

```bash
# Login a DockerHub
docker login -u Red9090

# Te pedirá la contraseña (Access Token o password)
# Ingresa tu contraseña o Personal Access Token
```

**Salida esperada:**
```
Login Succeeded
```

---

## 🏷️ 3. Etiquetar la Imagen

```bash
# La imagen ya está etiquetada correctamente como:
# red9090/tech-ecommerce-api:latest

# Verificar etiqueta actual
docker images red9090/tech-ecommerce-api

# Si necesitas re-etiquetar:
docker tag tech-ecommerce-api:latest red9090/tech-ecommerce-api:latest

# Opcional: Crear versión específica
docker tag tech-ecommerce-api:latest red9090/tech-ecommerce-api:v1.0.0
```

---

## 📤 4. Subir Imagen a DockerHub

```bash
# Subir imagen latest
docker push red9090/tech-ecommerce-api:latest

# Opcional: Subir versión específica
docker push red9090/tech-ecommerce-api:v1.0.0
```

**Salida esperada:**
```
The push refers to repository [docker.io/red9090/tech-ecommerce-api]
abc123def456: Pushed
def456abc789: Pushed
...
latest: digest: sha256:abc123... size: 2345
```

---

## 🔍 5. Escaneo de Seguridad

### Opción A: Docker Hub Automatic Scanning

1. Ve a https://hub.docker.com/r/Red9090/tech-ecommerce-api
2. Haz clic en la etiqueta `latest`
3. Selecciona la pestaña **"Security"**
4. Espera a que complete el escaneo automático (gratis)

### Opción B: Trivy (Recomendado - Más detallado)

```bash
# Instalar Trivy (si no lo tienes)
# Ubuntu/Debian:
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt update && sudo apt install trivy

# Escanear imagen localmente
trivy image red9090/tech-ecommerce-api:latest

# Generar reporte en HTML
trivy image --format html --output trivy-report.html red9090/tech-ecommerce-api:latest

# Generar reporte en JSON
trivy image --format json --output trivy-report.json red9090/tech-ecommerce-api:latest
```

**Salida esperada de Trivy:**
```
2024-01-15T10:30:00.000Z    INFO    Detected OS: alpine
2024-01-15T10:30:00.000Z    INFO    Detecting Alpine vulnerabilities...

red9090/tech-ecommerce-api:latest (alpine 3.18.4)
=================================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

Node.js Packages (nodejs)
=========================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

✅ No vulnerabilities found!
```

---

## 📊 6. Verificar Imagen en DockerHub

1. Ve a: https://hub.docker.com/r/Red9090/tech-ecommerce-api
2. Verifica:
   - ✅ Imagen aparece listada
   - ✅ Etiquetas visibles (`latest`, `v1.0.0`)
   - ✅ Tamaño mostrado (~215MB)
   - ✅ Fecha de subida correcta
   - ✅ Escaneo de seguridad completado

---

## 🧪 7. Probar Imagen desde DockerHub

```bash
# Eliminar imagen local
docker rmi red9090/tech-ecommerce-api:latest

# Pull desde DockerHub
docker pull red9090/tech-ecommerce-api:latest

# Ejecutar contenedor
docker run -d \
  --name tech-ecommerce-test \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017/tech-ecommerce \
  -e JWT_SECRET=test-secret-key \
  red9090/tech-ecommerce-api:latest

# Verificar logs
docker logs -f tech-ecommerce-test

# Testear endpoint
curl http://localhost:3000/api/health
```

---

## 📝 8. Comandos para Documentación

### Para Google Docs y README:

**Nombre de la imagen:**
```
red9090/tech-ecommerce-api:latest
```

**URL pública en DockerHub:**
```
https://hub.docker.com/r/Red9090/tech-ecommerce-api
```

**Comando para ejecutar:**
```bash
docker run -d \
  --name tech-ecommerce-api \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://tu-mongo:27017/tech-ecommerce \
  -e JWT_SECRET=tu-secreto-seguro \
  red9090/tech-ecommerce-api:latest
```

**O con Docker Compose:**
```bash
docker-compose up -d
```

---

## ✅ Checklist Final

- [ ] Cuenta DockerHub creada/verificada
- [ ] Login realizado exitosamente
- [ ] Imagen etiquetada correctamente
- [ ] Imagen subida a DockerHub
- [ ] Escaneo de seguridad realizado
- [ ] Vulnerabilidades revisadas (0 críticas)
- [ ] URL pública verificada
- [ ] Imagen testeada desde DockerHub
- [ ] Documentación actualizada

---

## 🚨 Solución de Problemas

### Error: "denied: requested access to the resource is denied"
```bash
# Verificar login
docker login -u Red9090

# Verificar nombre del repositorio
# Debe ser: Red9090/nombre-repo (case-sensitive)
```

### Error: "manifest unknown"
```bash
# Verificar etiquetas disponibles
docker pull red9090/tech-ecommerce-api:latest
```

### Escaneo muestra vulnerabilidades
```bash
# Actualizar dependencias
npm audit fix

# Reconstruir imagen
docker build -t red9090/tech-ecommerce-api:latest .

# Re-subir
docker push red9090/tech-ecommerce-api:latest
```

---

## 📸 Evidencia Requerida para el Entregable

Para el Google Docs, captura:

1. **Login exitoso**: `docker login` command output
2. **Push completado**: Output del `docker push`
3. **DockerHub Web**: Screenshot de tu repositorio en hub.docker.com
4. **Escaneo de seguridad**: Results de Trivy o Docker Hub Security tab
5. **Pull exitoso**: Output de `docker pull` desde otra máquina

---

**¡Listo! Tu imagen está publicada y segura en DockerHub.**
