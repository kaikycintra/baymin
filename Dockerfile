FROM python:3.12-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Expose the port FastAPI will run on
EXPOSE 8000
ENV BAYMAX_DB_PATH=/data/baymax.sqlite3
VOLUME /data

# Run FastAPI in production mode, listening on all network interfaces
CMD ["fastapi", "run", "backend/main.py", "--port", "8000", "--host", "0.0.0.0"]
