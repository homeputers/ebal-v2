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

## Service calendar export

The API provides a read-only iCalendar feed of upcoming services at
`GET /api/v1/services/ical?token=...`. Tokens must exist in the
`share_tokens` table with a `type` of `service_calendar`; this allows you
to generate and distribute calendar links without granting write
permissions.

