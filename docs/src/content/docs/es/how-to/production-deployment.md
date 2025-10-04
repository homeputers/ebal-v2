---
title: "Guía de despliegue en producción"
description: "Despliega los contenedores web y API de EBAL en entornos de producción."
sidebar:
  label: "Desplegar a producción"
---
> TODO: translate body

# Production Deployment Guide

This guide describes how to deploy the Every Breath And Life (EBAL) application to production environments using the published Docker images for the web front-end and API. Follow the platform-specific instructions that match your target host.

## Prerequisites

Before deploying, make sure the following prerequisites are met:

- **Docker Engine** 24.x or later with the Docker Compose plugin installed.
- **Container registry access** to pull the EBAL images:
  - Web: `ghcr.io/homeputers/ebal2-web`
  - API: `ghcr.io/homeputers/ebal2-api`
- **PostgreSQL 15+** instance reachable from the API container. Managed services (e.g., Amazon RDS, Cloud SQL) or a self-managed Postgres host are both supported.
- **Database user and schema** prepared for EBAL. The API requires a database with UTF-8 encoding and a user with full privileges on that database.
- **TLS termination** (reverse proxy, load balancer, or ingress controller) when exposing the containers publicly.

### Database preparation

Create the EBAL database and user before starting the containers. Example commands using `psql`:

```sql
CREATE DATABASE ebal WITH ENCODING 'UTF8';
CREATE USER ebal WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE ebal TO ebal;
```

If you use managed Postgres, create an equivalent user/database through your provider's console.

## Configuration options

Configure the containers through environment variables. At minimum, set the database connection values for the API and the API URL for the web application.

### API container (`ghcr.io/homeputers/ebal2-api`)

| Variable | Required | Description |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL for the Postgres database, e.g., `jdbc:postgresql://db.example.com:5432/ebal`. |
| `SPRING_DATASOURCE_USERNAME` | Yes | Database username with access to the EBAL schema. |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Password for the database user. |
| `SERVER_PORT` | No | Port exposed by the API container (default `8080`). |
| `EBAL_SECURITY_ENABLED` | No | Set to `true` to enable auth once configured; defaults to `false`. |
| `EBAL_STORAGE_ENABLED` | No | Enables attachment storage integration; defaults to `false`. |
| `EBAL_OTEL_ENABLED` | No | Enables OpenTelemetry tracing; defaults to `false`. |
| `EBAL_SEED_ENABLED` | No | Seeds demo data on startup when `true`; defaults to `false` for production. |

### Web container (`ghcr.io/homeputers/ebal2-web`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Public URL for the EBAL API (e.g., `https://api.example.com`). |
| `PORT` | No | Port exposed by the web container (default `4173` for the production Vite preview server). |

Store secrets (passwords, tokens) in a secure location such as environment-specific configuration files or secret managers.

## Deployment workflow

The high-level deployment flow is consistent across all platforms:

1. Install Docker and supporting packages for your OS.
2. Create a working directory containing a `.env` file with the environment variables listed above and a `docker-compose.yml` (or equivalent deployment manifest) that starts the API, web, and optional Postgres containers.
3. Pull the EBAL Docker images from the GitHub Container Registry.
4. Start the containers and verify that the API is reachable before exposing the web service.
5. Configure your TLS termination and DNS records.

The sections below provide the OS-specific steps for setting up Docker and launching the containers.

## Debian-based Linux (Debian, Ubuntu)

1. Install Docker Engine and Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   ```
2. Create a deployment directory (e.g., `/opt/ebal`) and add a `.env` file:
   ```bash
   sudo mkdir -p /opt/ebal
   sudo tee /opt/ebal/.env > /dev/null <<'ENV'
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/ebal
SPRING_DATASOURCE_USERNAME=ebal
SPRING_DATASOURCE_PASSWORD=change-me
VITE_API_URL=https://api.example.com
ENV
   ```
3. Create `/opt/ebal/docker-compose.yml`:
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
   Adjust port mappings as needed for your ingress or load balancer.
4. Pull and start the services:
   ```bash
   cd /opt/ebal
   sudo docker compose pull
   sudo docker compose up -d
   ```
5. Verify health:
   ```bash
   curl -f http://localhost:8080/actuator/health
   curl -f http://localhost:4173/health
   ```
   Replace the web health URL with the configured path if your reverse proxy handles health checks.

## Red Hat-compatible Linux (RHEL, CentOS, Rocky, Alma)

1. Install Docker (or Podman with Docker API compatibility). For Docker CE:
   ```bash
   sudo dnf -y install dnf-plugins-core
   sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   ```
2. Prepare the deployment directory (e.g., `/srv/ebal`) and `.env` file as shown in the Debian section.
3. Use the same `docker-compose.yml` from the Debian section or adapt it to your networking requirements.
4. Pull and start the containers:
   ```bash
   cd /srv/ebal
   sudo docker compose pull
   sudo docker compose up -d
   ```
5. Open firewall ports if using `firewalld`:
   ```bash
   sudo firewall-cmd --add-service=http --permanent
   sudo firewall-cmd --add-service=https --permanent
   sudo firewall-cmd --add-port=8080/tcp --permanent
   sudo firewall-cmd --reload
   ```
6. Confirm API and web endpoints are reachable from your load balancer or monitoring system.

## macOS (Intel and Apple Silicon)

1. Install [Docker Desktop for macOS](https://www.docker.com/products/docker-desktop/) and ensure it is running. Docker Desktop includes Docker Compose.
2. Create a project directory (e.g., `~/ebal-prod`) and a `.env` file containing the required variables.
3. Save the `docker-compose.yml` file described earlier into the project directory.
4. Pull and start the services from a terminal:
   ```bash
   cd ~/ebal-prod
   docker compose pull
   docker compose up -d
   ```
5. If you are running Postgres locally for testing, expose the API port (default `8080`) and update the `SPRING_DATASOURCE_URL` to point at `host.docker.internal`.
6. Configure any reverse proxy (nginx, Caddy) on the host machine if you need TLS termination.

## Windows (Windows 10/11)

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) with the WSL2 backend enabled. Ensure the "Use Docker Compose V2" option is active.
2. Use PowerShell to create a deployment directory (e.g., `C:\ebal`) and add a `.env` file:
   ```powershell
   New-Item -ItemType Directory -Path C:\ebal
   @"
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/ebal
SPRING_DATASOURCE_USERNAME=ebal
SPRING_DATASOURCE_PASSWORD=change-me
VITE_API_URL=https://api.example.com
"@ | Set-Content -Path C:\ebal\.env
   ```
3. Create `C:\ebal\docker-compose.yml` with the same service definitions shown above. Use LF or CRLF line endings as preferred; Docker Compose accepts both.
4. Pull and start the containers from PowerShell or Windows Terminal:
   ```powershell
   cd C:\ebal
   docker compose pull
   docker compose up -d
   ```
5. If the Postgres database runs on the Windows host, reference it with `host.docker.internal` in `SPRING_DATASOURCE_URL`.
6. Configure Windows Firewall or your load balancer to allow inbound traffic on the published ports and terminate TLS before forwarding to the containers.

## Post-deployment checklist

- Monitor the API container logs for Flyway migration output on first boot to ensure the schema applies successfully.
- Configure backups for the Postgres database.
- Set up log aggregation and metrics collection if `EBAL_OTEL_ENABLED=true`.
- Regularly pull updated images to receive security patches: `docker compose pull && docker compose up -d`.

Refer to your organization’s infrastructure policies for additional hardening, secrets management, and observability requirements.
