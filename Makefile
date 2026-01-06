.PHONY: help build up down logs purge restart ps shell

# Note: Requires Docker and Docker Compose to be installed and configured properly.
# Usage: Run `make <command>` to execute the desired task.
# Example: `make up` to start the services.

# Additionally, use the `COMPOSE_FILE` and `COMPOSE_PROJECT_NAME` environment variables
# defined in the .env file to customize the Docker Compose setup.

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
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

purge: down
	docker compose down --remove-orphans --rmi=all -v

logs:
	docker compose logs -f

restart: down up

ps:
	docker compose ps

shell:
	docker compose exec client sh
