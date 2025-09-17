.PHONY: up down logs build web-build web-up web-down web-logs api-build api-up api-down api-logs

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

web-build:
	docker compose build web

web-up:
	docker compose up -d web

web-down:
	docker compose stop web

web-logs:
	docker compose logs -f web

api-build:
	docker compose build api

api-up:
	docker compose up -d api

api-down:
	docker compose stop api

api-logs:
	docker compose logs -f api
