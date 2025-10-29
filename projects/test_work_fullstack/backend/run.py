"""
Скрипт для запуска FastAPI приложения через uvicorn.
"""
import uvicorn
from src.core.config import APP_HOST, APP_PORT

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=APP_HOST,
        port=APP_PORT,
        reload=True
    )

