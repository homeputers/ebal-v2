---
title: "Guía de despliegue en producción"
description: "Despliega los contenedores web y API de EBAL en entornos de producción."
sidebar:
  label: "Desplegar a producción"
---

# Guía de despliegue en producción

Esta guía describe cómo desplegar la aplicación Every Breath And Life (EBAL) en entornos de producción utilizando las imágenes de Docker publicadas para el front-end web y la API. Sigue las instrucciones específicas de la plataforma que coincidan con tu host de destino.

## Requisitos previos

Antes de desplegar, asegúrate de cumplir con los siguientes requisitos:

- **Docker Engine** 24.x o superior con el complemento de Docker Compose instalado.
- **Acceso al registro de contenedores** para descargar las imágenes de EBAL:
  - Web: `ghcr.io/homeputers/ebal2-web`
  - API: `ghcr.io/homeputers/ebal2-api`
- **Instancia de PostgreSQL 15+** accesible desde el contenedor de la API. Se admiten servicios administrados (por ejemplo, Amazon RDS, Cloud SQL) o un host autogestionado.
- **Usuario y base de datos** preparados para EBAL. La API necesita una base de datos codificada en UTF-8 y un usuario con privilegios completos sobre ella.
- **Terminación TLS** (proxy inverso, balanceador o controlador de ingreso) cuando expongas los contenedores públicamente.

### Preparación de la base de datos

Crea la base de datos y el usuario de EBAL antes de iniciar los contenedores. Ejemplo con `psql`:

```sql
CREATE DATABASE ebal WITH ENCODING 'UTF8';
CREATE USER ebal WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE ebal TO ebal;
```

Si usas un Postgres administrado, crea un usuario/base de datos equivalente desde la consola de tu proveedor.

## Opciones de configuración

Configura los contenedores mediante variables de entorno. Como mínimo, define los valores de conexión a la base de datos para la API y la URL de la API para la aplicación web.

### Contenedor de la API (`ghcr.io/homeputers/ebal2-api`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Sí | URL JDBC de la base de datos Postgres, p. ej. `jdbc:postgresql://db.example.com:5432/ebal`. |
| `SPRING_DATASOURCE_USERNAME` | Sí | Usuario de base de datos con acceso al esquema de EBAL. |
| `SPRING_DATASOURCE_PASSWORD` | Sí | Contraseña del usuario de base de datos. |
| `SERVER_PORT` | No | Puerto expuesto por el contenedor de la API (predeterminado `8080`). |
| `EBAL_SECURITY_ENABLED` | No | Establécela en `true` para habilitar la autenticación cuando esté configurada; por defecto es `false`. |
| `EBAL_STORAGE_ENABLED` | No | Habilita la integración de almacenamiento de adjuntos; por defecto es `false`. |
| `EBAL_OTEL_ENABLED` | No | Activa el trazado de OpenTelemetry; por defecto es `false`. |
| `EBAL_SEED_ENABLED` | No | Carga datos de demostración al iniciar cuando es `true`; en producción debe permanecer en `false`. |

### Contenedor web (`ghcr.io/homeputers/ebal2-web`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Sí | URL pública de la API de EBAL (p. ej. `https://api.example.com`). |
| `PORT` | No | Puerto expuesto por el contenedor web (predeterminado `4173` para el servidor de previsualización de Vite en producción). |

Guarda las credenciales (contraseñas, tokens) en un lugar seguro como archivos de configuración específicos por entorno o gestores de secretos.

## Flujo de despliegue

El flujo de despliegue de alto nivel es consistente en todas las plataformas:

1. Instala Docker y los paquetes de soporte para tu sistema operativo.
2. Crea un directorio de trabajo que contenga un archivo `.env` con las variables anteriores y un `docker-compose.yml` (u otro manifiesto de despliegue equivalente) que inicie los contenedores de la API, web y el Postgres opcional.
3. Descarga las imágenes Docker de EBAL desde GitHub Container Registry.
4. Inicia los contenedores y verifica que la API sea accesible antes de exponer el servicio web.
5. Configura la terminación TLS y los registros DNS.

Las secciones siguientes describen los pasos específicos por sistema operativo para instalar Docker y poner en marcha los contenedores.

## Linux basado en Debian (Debian, Ubuntu)

1. Instala Docker Engine y Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo \"$ID\") \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   ```
2. Crea un directorio de despliegue (p. ej. `/opt/ebal`) y agrega un archivo `.env`:
   ```bash
   sudo mkdir -p /opt/ebal
   sudo tee /opt/ebal/.env > /dev/null <<'ENV'
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/ebal
SPRING_DATASOURCE_USERNAME=ebal
SPRING_DATASOURCE_PASSWORD=change-me
VITE_API_URL=https://api.example.com
ENV
   ```
3. Crea `/opt/ebal/docker-compose.yml`:
   ```yaml
   services:
     api:
       image: ghcr.io/homeputers/ebal2-api:latest
       env_file: .env
       environment:
         SERVER_PORT: 8080
       ports:
         - "8080:8080"
     web:
       image: ghcr.io/homeputers/ebal2-web:latest
       env_file: .env
       ports:
         - "4173:4173"
   ```
   Ajusta los mapeos de puertos según lo requiera tu proxy inverso o balanceador.
4. Descarga e inicia los servicios:
   ```bash
   cd /opt/ebal
   sudo docker compose pull
   sudo docker compose up -d
   ```
5. Verifica el estado:
   ```bash
   curl -f http://localhost:8080/actuator/health
   curl -f http://localhost:4173/health
   ```
   Sustituye la URL de salud del sitio web por la ruta configurada si tu proxy inverso maneja los chequeos.

## Linux compatible con Red Hat (RHEL, CentOS, Rocky, Alma)

1. Instala Docker (o Podman con compatibilidad de API Docker). Para Docker CE:
   ```bash
   sudo dnf -y install dnf-plugins-core
   sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   ```
2. Prepara el directorio de despliegue (p. ej. `/srv/ebal`) y el archivo `.env` como se muestra en la sección de Debian.
3. Usa el mismo `docker-compose.yml` de la sección Debian o adáptalo a tus necesidades de red.
4. Descarga e inicia los contenedores:
   ```bash
   cd /srv/ebal
   sudo docker compose pull
   sudo docker compose up -d
   ```
5. Abre los puertos del firewall si utilizas `firewalld`:
   ```bash
   sudo firewall-cmd --add-service=http --permanent
   sudo firewall-cmd --add-service=https --permanent
   sudo firewall-cmd --add-port=8080/tcp --permanent
   sudo firewall-cmd --reload
   ```
6. Confirma que los endpoints de la API y la web sean accesibles desde tu balanceador o sistema de monitoreo.

## macOS (Intel y Apple Silicon)

1. Instala [Docker Desktop para macOS](https://www.docker.com/products/docker-desktop/) y asegúrate de que esté en ejecución. Docker Desktop incluye Docker Compose.
2. Crea un directorio de proyecto (p. ej. `~/ebal-prod`) y un archivo `.env` con las variables requeridas.
3. Guarda en ese directorio el archivo `docker-compose.yml` descrito anteriormente.
4. Ejecuta los contenedores desde una terminal:
   ```bash
   cd ~/ebal-prod
   docker compose pull
   docker compose up -d
   ```
5. Si ejecutas Postgres localmente para pruebas, expón el puerto de la API (por defecto `8080`) y actualiza `SPRING_DATASOURCE_URL` para que apunte a `host.docker.internal`.
6. Configura cualquier proxy inverso (nginx, Caddy) en la máquina host si necesitas terminación TLS.

## Windows (WSL2 o hosts con Docker nativo)

1. Instala [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) y habilita el backend de WSL2. Asegúrate de que la opción "Use Docker Compose V2" esté activa.
2. Crea un directorio de despliegue (por ejemplo, `C:\\ebal`) y agrega un archivo `.env` con los valores requeridos:
   ```powershell
   New-Item -ItemType Directory -Path C:\\ebal
   @"
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/ebal
SPRING_DATASOURCE_USERNAME=ebal
SPRING_DATASOURCE_PASSWORD=change-me
VITE_API_URL=https://api.example.com
"@ | Set-Content -Path C:\\ebal\.env
   ```
3. Crea `C:\\ebal\\docker-compose.yml` con las mismas definiciones de servicio mostradas arriba. Docker Compose acepta finales de línea LF o CRLF.
4. Descarga e inicia los contenedores desde PowerShell o Windows Terminal:
   ```powershell
   cd C:\\ebal
   docker compose pull
   docker compose up -d
   ```
5. Si la base de datos Postgres se ejecuta en el host de Windows, referencia `host.docker.internal` en `SPRING_DATASOURCE_URL`.
6. Configura Windows Firewall o tu balanceador para permitir el tráfico entrante en los puertos publicados y terminar TLS antes de reenviar a los contenedores.

## Lista de verificación posterior al despliegue

- Supervisa los registros del contenedor de la API para verificar la salida de las migraciones de Flyway en el primer arranque.
- Configura copias de seguridad para la base de datos de Postgres.
- Habilita la agregación de logs y la recolección de métricas si `EBAL_OTEL_ENABLED=true`.
- Descarga regularmente imágenes actualizadas para recibir parches de seguridad: `docker compose pull && docker compose up -d`.

Consulta las políticas de infraestructura de tu organización para requisitos adicionales de endurecimiento, gestión de secretos y observabilidad.
