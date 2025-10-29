# Скрипт для создания таблиц в БД
from src.core.database import engine, Base
from src.models import User, Task

if __name__ == "__main__":
    print("Создаю таблицы в БД...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно созданы!")

