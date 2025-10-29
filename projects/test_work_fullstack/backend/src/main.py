# Главный файл приложения. Подключаю БД при старте, роуты для auth и tasks
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.core.database import connect_db, disconnect_db
from src.api.routes import auth, tasks
# Импортирую модели чтобы они были зарегистрированы в Base.metadata
from src.models import User, Task


# При старте подключаюсь к БД, при остановке отключаюсь
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="Tasks API",
    version="0.1.0",
    description="REST API для управления задачами с JWT авторизацией",
    lifespan=lifespan
)

# CORS - разрешаю все источники для Docker (в продакшене настроить правильно)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Подключение роутов
app.include_router(auth.router)
app.include_router(tasks.router)

# Подключение статических файлов фронтенда (для production)
# Путь для Docker контейнера (от backend/ до корня /app)
frontend_path_docker = Path("/app/frontend/dist")
# Путь для локальной разработки
frontend_path_local = Path(__file__).parent.parent.parent.parent / "frontend" / "dist"

# Используем путь Docker если существует, иначе локальный
frontend_path = frontend_path_docker if frontend_path_docker.exists() else frontend_path_local

if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")
    print(f"Serving static files from: {frontend_path}")
else:
    print(f"Frontend dist not found at: {frontend_path}")


# Эндпоинт для health check, используется для мониторинга
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# TODO(!!! tests): unit-тесты для health endpoint и проверка подключения БД в lifespan
