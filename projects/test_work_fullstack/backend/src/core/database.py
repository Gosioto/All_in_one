# Работаю с БД через SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from src.core.config import DATABASE_URL

# Преобразую URL для использования psycopg3 (psycopg)
# Если URL начинается с postgresql://, заменяю на postgresql+psycopg://
db_url = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Создаю движок БД с явным указанием psycopg3 драйвера
engine = create_engine(db_url, echo=False)

# Сессии БД
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


# Получаю сессию БД для использования в роутах
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Подключаюсь к БД при старте приложения
async def connect_db():
    # Создаю таблицы если их нет
    Base.metadata.create_all(bind=engine)


# Отключаюсь от БД при остановке приложения
async def disconnect_db():
    engine.dispose()

# TODO(!!! tests): unit-тесты для подключения/отключения БД, тесты изоляции транзакций
