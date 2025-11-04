# ebal-v2 - Every Breath and Life Platform

## Overview
The ebal-v2 project is a monorepo housing the next generation of the Every Breath and Life platform. It consists of:

- **React Web App** (apps/web): A modern React frontend with Vite, TypeScript, and Tailwind CSS
- **Spring Boot API** (apps/api-java): A Java 21 backend API with PostgreSQL database, MyBatis, and Flyway migrations
- **Shared Infrastructure**: Reusable TypeScript configs and types

## Recent Changes
- **2025-11-04**: Successfully set up project in Replit environment
  - Configured PostgreSQL database with Flyway migrations
  - Set up Java 21 (Zulu JDK) for Spring Boot backend
  - Configured Vite to run on port 5000 with host allowance for Replit proxy
  - Both frontend and backend workflows configured and running

## Project Architecture

### Frontend (apps/web)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next (English and Spanish)
- **Accessibility**: Strong focus on WCAG compliance

**Key Features**:
- Multi-language support (English/Spanish)
- User authentication and authorization
- Admin user management
- Song and arrangement management
- Service planning with setlists
- Member and group management
- Accessibility-focused design

### Backend (apps/api-java)
- **Framework**: Spring Boot 3.2.5
- **Java Version**: 21 (Zulu JDK)
- **Database**: PostgreSQL 16 (Neon)
- **ORM**: MyBatis 3
- **Migrations**: Flyway
- **Security**: Spring Security with JWT authentication
- **API Docs**: OpenAPI/Swagger (SpringDoc)
- **Monitoring**: Spring Actuator, OpenTelemetry support

**Key Features**:
- JWT-based authentication
- Role-based access control (USER/ADMIN roles)
- RESTful API for all resources
- Database migrations with Flyway
- Email notifications support (SMTP)
- Rate limiting on authentication endpoints
- Avatar upload support
- iCalendar export for services

### Database
- **Type**: PostgreSQL 16 (managed by Replit/Neon)
- **Migrations**: Flyway (7 migrations applied)
- **Schema**: Users, Groups, Members, Services, Songs, Arrangements, Song Sets
- **Environment Variables**: Automatically configured via Replit

## Development Workflows

### Backend Workflow
- **Name**: backend
- **Command**: `bash start-backend.sh`
- **Port**: 8080
- **Status**: Configured and running
- **Environment**:
  - Java 21 (Zulu JDK)
  - Maven wrapper for dependency management
  - Flyway migrations run automatically on startup

### Frontend Workflow  
- **Name**: frontend
- **Command**: `yarn dev`
- **Port**: 5000
- **Status**: Configured and running
- **Configuration**:
  - Vite dev server bound to 0.0.0.0:5000
  - Proxies `/api` requests to backend on localhost:8080
  - Hot Module Replacement (HMR) enabled

## Environment Configuration

### Required Environment Variables
The following environment variables are automatically configured in Replit:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`: PostgreSQL credentials

### Optional Backend Configuration
The following can be configured via environment variables:
- `EBAL_SECURITY_ENABLED`: Enable/disable authentication (default: true)
- `EBAL_JWT_SECRET`: JWT signing secret (has secure default for local dev)
- `EBAL_WEB_ORIGIN_DEV`: CORS allowed origin for dev (default: http://localhost:5173)
- `EBAL_WEB_ORIGIN_PROD`: CORS allowed origin for prod
- `EBAL_SEED_ENABLED`: Enable automatic admin user creation (default: false)
- `EBAL_SEED_ADMIN_EMAIL`: Admin email for seeding
- `EBAL_SEED_ADMIN_PASSWORD`: Admin password for seeding

## Deployment
The project is configured for deployment as a VM on Replit:
- **Type**: VM (always running, maintains state)
- **Build**: Installs dependencies and builds web app
- **Run**: Starts both backend and frontend services concurrently

## Key Files
- `start-backend.sh`: Backend startup script (sets Java 21 path and database config)
- `apps/web/vite.config.ts`: Frontend dev server configuration  
- `apps/api-java/src/main/resources/application.yaml`: Backend configuration
- `apps/api-java/pom.xml`: Java dependencies and build configuration
- `apps/web/package.json`: Frontend dependencies

## Accessing the Application
- **Frontend**: Port 5000 (webview)
- **Backend API**: Port 8080 (internal)
- **API Documentation**: http://localhost:8080/v3/api-docs (when backend is running)
- **Health Check**: http://localhost:8080/api/v1/health

## Notes
- The frontend proxies all `/api` requests to the backend
- Database migrations run automatically when the backend starts
- Both workflows must be running for the application to function fully
- The project uses a monorepo structure with Yarn workspaces
