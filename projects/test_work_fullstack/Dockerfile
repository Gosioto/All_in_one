# Многоэтапная сборка для оптимизации размера образа
# Собираю только проект test_work_fullstack
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Копирую файлы зависимостей фронтенда (только из test_work_fullstack)
COPY frontend/package*.json ./

# Устанавливаю зависимости фронтенда
RUN npm ci

# Копирую исходники фронтенда (только из test_work_fullstack)
COPY frontend/ ./

# Собираю фронтенд
RUN npm run build

# Финальный образ с Python для бэкенда
FROM python:3.11-slim

WORKDIR /app

# Устанавливаю системные зависимости
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирую зависимости бэкенда (только из test_work_fullstack)
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копирую исходники бэкенда (только из test_work_fullstack)
COPY backend/ ./backend/

# Копирую собранный фронтенд из builder этапа
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Копирую файлы публичных ресурсов фронтенда (иконки и т.д.)
COPY --from=frontend-builder /app/frontend/public ./frontend/public

WORKDIR /app/backend

# Устанавливаю переменные окружения
ENV PYTHONUNBUFFERED=1

# Открываю порт для API
EXPOSE 8000

# Скрипт запуска: ждем БД, выполняем миграции, запускаем сервер
CMD ["sh", "-c", "echo 'Waiting for database...' && sleep 10 && python -m alembic upgrade head && python run.py"]
