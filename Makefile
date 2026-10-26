.PHONY: dev test migrate train build clean logs

# ─── Development ─────────────────────────────────────────────────────────────
dev:
	@echo "🚀 Starting PrecisionRx AI in development mode..."
	docker compose up --build -d
	@echo "✅ Services started:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  API:       http://localhost:8000/api/docs"
	@echo "  MLflow:    http://localhost:5001"
	@echo "  RabbitMQ:  http://localhost:15672"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-ml:
	cd backend && celery -A app.core.celery_app worker --loglevel=debug -Q ml_jobs

# ─── Database ─────────────────────────────────────────────────────────────────
migrate:
	@echo "🗄️  Running Alembic migrations..."
	cd backend && alembic upgrade head

migrate-create:
	@read -p "Migration name: " name; \
	cd backend && alembic revision --autogenerate -m "$$name"

migrate-down:
	cd backend && alembic downgrade -1

# ─── Testing ─────────────────────────────────────────────────────────────────
test:
	@echo "🧪 Running all tests..."
	$(MAKE) test-backend
	$(MAKE) test-ml

test-backend:
	cd backend && pytest tests/ -v --tb=short --cov=app --cov-report=term-missing

test-ml:
	cd ml && pytest tests/ -v --tb=short

test-api:
	cd backend && pytest tests/test_api/ -v --tb=short

# ─── ML Training ─────────────────────────────────────────────────────────────
train:
	@echo "🤖 Training all ML models..."
	cd ml && python training/train_all.py

train-recommender:
	cd ml && python training/train_recommender.py

train-adr:
	cd ml && python training/train_adr.py

train-fl:
	@echo "🌐 Starting federated learning server..."
	cd ml && python federated/fl_server.py server

# ─── Build ───────────────────────────────────────────────────────────────────
build:
	docker compose build --no-cache

build-frontend:
	cd frontend && npm run build

# ─── Utilities ───────────────────────────────────────────────────────────────
logs:
	docker compose logs -f api ml_worker

shell-api:
	docker compose exec api bash

shell-db:
	docker compose exec postgres psql -U precisionrx -d precisionrx

install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

clean:
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete
	cd frontend && rm -rf .next node_modules

lint:
	cd backend && ruff check . --fix
	cd frontend && npm run lint

format:
	cd backend && black . && isort .
	cd frontend && npx prettier --write .

health:
	@curl -sf http://localhost:8000/health | python3 -m json.tool || echo "❌ API not responding"
	@curl -sf http://localhost:3000 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend not responding"
