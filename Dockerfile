# ==========================================
# Stage 1: Build the Frontend (Node)
# ==========================================
FROM node:26-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (caches this layer)
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build the static files
COPY frontend/ ./
RUN npm run build


# ==========================================
# Stage 2: Serve the App (Python/FastAPI)
# ==========================================
FROM python:3.12-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy ONLY the built static files from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose the port FastAPI will run on
EXPOSE 8000

# Run FastAPI in production mode, listening on all network interfaces
CMD ["fastapi", "run", "backend/main.py", "--port", "8000", "--host", "0.0.0.0"]