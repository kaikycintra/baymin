MISE ?= mise
MAKE ?= make

.PHONY: help setup dev dev-backend dev-frontend build typecheck

# Show the available Make targets and a short description of each.
help:
	@printf "Baymin development commands:\n"
	@printf "  make setup         Install runtimes and project dependencies\n"
	@printf "  make dev           Start backend and frontend together\n"
	@printf "  make dev-backend   Start the FastAPI backend\n"
	@printf "  make dev-frontend  Start the React frontend\n"
	@printf "  make build         Build the frontend for production\n"
	@printf "  make typecheck     Run the frontend TypeScript check\n"

# Install the configured runtimes, then install backend and frontend dependencies.
setup:
	$(MISE) install
	$(MISE) run install

# Run the backend and frontend development servers concurrently.
dev:
	$(MAKE) -j2 dev-backend dev-frontend

# Start the FastAPI development server with development settings enabled.
dev-backend:
	FASTAPI_ENV=development $(MISE) run dev:backend

# Start the React frontend development server.
dev-frontend:
	$(MISE) run dev:frontend

# Create the production build of the frontend.
build:
	$(MISE) exec -- npm --prefix frontend run build

# Run the frontend TypeScript type check.
typecheck:
	$(MISE) exec -- npm --prefix frontend run typecheck