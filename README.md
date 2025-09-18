# ebal-v2

The ebal-v2 monorepo houses the next generation of the Every Breath and Life platform, bringing together a React web app, a Spring Boot API, and shared infrastructure with reusable TypeScript configs and types to streamline cross-service development.

## Development

Install dependencies using [Yarn](https://yarnpkg.com/):

```bash
yarn install
```

Lint the repository:

```bash
yarn lint
```

## Deployment

The repository ships with a Docker Compose stack that runs PostgreSQL, the
Spring Boot API, and the static build of the web client. The fastest way to
deploy is to use the make targets that wrap the Compose commands.

### 1. Prerequisites

- [Docker](https://www.docker.com/) (20.10 or newer)
- [Docker Compose V2](https://docs.docker.com/compose/)
- [`make`](https://www.gnu.org/software/make/) (optional, but simplifies the
  commands)

### 2. Configure environment variables

Create an `.env` file in `infra/` so Compose can provision the database and API
with the correct credentials:

```dotenv
# infra/.env
POSTGRES_DB=ebal
POSTGRES_USER=ebal
POSTGRES_PASSWORD=ebal
```

Adjust the values as needed for your environment. The API service automatically
applies Flyway migrations on startup and connects to the database using these
settings.

### 3. Build and start the stack

```bash
cd infra
make build   # builds the api and web images defined in docker-compose.yaml
make up      # starts postgres, api, and web in the background
```

If you prefer to avoid `make`, run `docker compose build` followed by
`docker compose up -d` from the same directory.

### 4. Verify the deployment

- API: http://localhost:8080 (OpenAPI docs at `/v3/api-docs` once the service
  is healthy)
- Web: http://localhost:4173 (served by the `web` container)

Use `make logs` (or `docker compose logs -f`) from the `infra/` directory to
monitor the containers. To stop everything, run `make down`.

## Service calendar export

The API provides a read-only iCalendar feed of upcoming services at
`GET /api/v1/services/ical?token=...`. Tokens must exist in the
`share_tokens` table with a `type` of `service_calendar`; this allows you
to generate and distribute calendar links without granting write
permissions.

