# ---- Frontend build stage ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend

# Install deps
COPY "FinTrack Frontend/package*.json" ./
RUN npm ci --legacy-peer-deps

# Build
COPY "FinTrack Frontend" ./
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
RUN npm run build

# ---- Backend stage ----
FROM python:3.12-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Copy backend and install requirements
COPY "FinTrack Backend" "/app/FinTrack Backend"
WORKDIR "/app/FinTrack Backend"
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build into backend static dir (to be collected by collectstatic)
RUN mkdir -p /app/FinTrack\ Backend/static/frontend
COPY --from=frontend /app/frontend/dist /app/FinTrack\ Backend/static/frontend

# Collect static (uses WhiteNoise)
RUN python manage.py collectstatic --noinput

# Expose port (Render passes $PORT)
EXPOSE 8000

# Start: run migrations then gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn fintrack.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]


