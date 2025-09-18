# Infrastructure

This directory houses the Docker Compose configuration and convenience
Makefile targets for running the full stack.

## Quick start

1. Create an `.env` file alongside this README so Docker Compose can seed the
   database credentials:

   ```dotenv
   POSTGRES_DB=ebal
   POSTGRES_USER=ebal
   POSTGRES_PASSWORD=ebal
   ```

2. Build and start the services:

   ```bash
   make build
   make up
   ```

   (You can also call `docker compose build` and `docker compose up -d`
   directly.)

3. Visit the applications:
   - API: http://localhost:8080
   - Web: http://localhost:4173

The root [`README.md`](../README.md) contains additional context, including
prerequisite tooling and tips for monitoring or shutting down the containers.
