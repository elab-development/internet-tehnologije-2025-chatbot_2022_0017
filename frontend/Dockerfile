# --- 1) Build frontend (Vite) ---
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build   # generiše frontend/dist

# --- 2) Python backend ---
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

# Napravi foldere + prava (za SQLite i static)
RUN mkdir -p /app/data /app/staticfiles /app/static_src /app/templates \
    && chmod -R 777 /app/data /app/staticfiles

# Kopiraj frontend build u backend:
# - index.html kao template
# - assets kao static
COPY --from=frontend-build /frontend/dist/index.html /app/templates/index.html
COPY --from=frontend-build /frontend/dist/assets /app/static_src/assets

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8080} --access-logfile - --error-logfile - --capture-output --log-level info"]
