# =============================================================================
# Agri — imagine unică (React build servit de Django, același domeniu).
# Folosită de Render (runtime: docker). Build în 2 etape.
# =============================================================================

# ---------- Etapa 1: build-ul React ----------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend

# Instalăm dependințele întâi (cache mai bun între build-uri).
# `npm ci` = install curat, strict, reproductibil din package-lock.json.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copiem restul codului și construim (rezultă frontend/build).
# CI=false → warning-urile ESLint NU opresc build-ul (react-scripts).
ENV CI=false
COPY frontend/ ./
RUN npm run build


# ---------- Etapa 2: Django + gunicorn ----------
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Dependințe de sistem minime pentru psycopg2 la runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Dependințe Python
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Codul backend + build-ul React din etapa anterioară
COPY backend/ ./backend/
COPY --from=frontend /app/frontend/build ./frontend/build

WORKDIR /app/backend

# Colectăm fișierele statice (DRF etc.) în STATIC_ROOT
RUN python manage.py collectstatic --noinput

# La pornire: migrează, (opțional) populează date demo, apoi pornește gunicorn.
# Render setează $PORT. SEED_DEMO=true doar la primul deploy (ATENȚIE: rescrie datele).
CMD ["sh", "-c", "python manage.py migrate --noinput && if [ \"$SEED_DEMO\" = \"true\" ]; then python manage.py seed_demo; fi && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3"]
