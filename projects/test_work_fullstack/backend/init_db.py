# Скрипт для первоначальной настройки БД: создание миграций и применение их
# Запуск: python init_db.py
import subprocess
import sys
import os

def run_command(command, cwd=None):
    """Выполняю команду и вывожу результат"""
    print(f"Выполняю: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Ошибка: {e.stderr}")
        return False

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("=== Настройка базы данных ===")
    print("\n1. Генерирую Prisma клиент...")
    if not run_command("npx prisma generate", cwd=backend_dir):
        print("Ошибка генерации Prisma клиента")
        sys.exit(1)
    
    print("\n2. Создаю и применяю миграции...")
    if not run_command("npx prisma migrate dev --name init", cwd=backend_dir):
        print("Ошибка применения миграций")
        print("\nУбедитесь что:")
        print("- PostgreSQL запущен")
        print("- DATABASE_URL настроен в .env файле")
        sys.exit(1)
    
    print("\n✅ База данных настроена!")

