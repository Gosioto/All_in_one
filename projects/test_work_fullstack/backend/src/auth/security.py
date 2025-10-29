# Хеширую пароли через bcrypt и создаю JWT токены
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import bcrypt

from src.core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES_MIN

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Хеширую пароль перед сохранением в БД
# Bcrypt ограничивает длину пароля 72 байтами, обрезаю до 72 байт перед хешированием
def hash_password(plain_password: str) -> str:
    # Конвертирую пароль в байты и обрезаю строго до 72 байт
    password_bytes = plain_password.encode('utf-8')
    
    # Если больше 72 байт, обрезаю до 72 и удаляю неполные UTF-8 последовательности
    if len(password_bytes) > 72:
        truncated = password_bytes[:72]
        # Удаляю неполные UTF-8 последовательности в конце
        while truncated and (truncated[-1] & 0xC0) == 0x80:
            truncated = truncated[:-1]
        password_bytes = truncated
    
    # Использую bcrypt напрямую с байтами для гарантии обрезки
    # Генерирую соль и хеширую пароль
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Возвращаю как строку (passlib формат)
    return hashed.decode('utf-8')


# Проверяю пароль при входе
# Обрезаю пароль до 72 байт для проверки (как при хешировании)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Конвертирую пароль в байты и обрезаю строго до 72 байт (как при хешировании)
    password_bytes = plain_password.encode('utf-8')
    
    # Если больше 72 байт, обрезаю до 72 и удаляю неполные UTF-8 последовательности
    if len(password_bytes) > 72:
        truncated = password_bytes[:72]
        # Удаляю неполные UTF-8 последовательности в конце
        while truncated and (truncated[-1] & 0xC0) == 0x80:
            truncated = truncated[:-1]
        password_bytes = truncated
    
    # Использую bcrypt напрямую для проверки
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


# Создаю JWT токен с user_id внутри, токен живет JWT_EXPIRES_MIN минут
def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    expire_delta = expires_minutes if expires_minutes is not None else JWT_EXPIRES_MIN
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_delta)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
