.PHONY: help build up down logs purge restart ps shell

help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker image"
	@echo "  make up         - Start services (detached)"
	@echo "  make down       - Stop services"
	@echo "  make purge      - Remove everything (images, volumes, orphans)"
	@echo "  make logs       - View service logs"
	@echo "  make restart    - Restart services"
	@echo "  make ps         - Show running services"
	@echo "  make shell      - Open shell in running client container"

build:
	docker compose -f docker/compose.yaml build

up:
	docker compose -f docker/compose.yaml up -d

down:
	docker compose -f docker/compose.yaml down

purge: down
	docker compose -f docker/compose.yaml down --remove-orphans --rmi=all -v

logs:
	docker compose -f docker/compose.yaml logs -f

restart: down up

ps:
	docker compose -f docker/compose.yaml ps

shell:
	docker compose -f docker/compose.yaml exec client sh
