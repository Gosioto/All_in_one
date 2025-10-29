# Регистрирую пользователей, проверяю пароли, работаю с токенами
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt

from src.models.user import User
from src.auth.security import hash_password, verify_password, create_access_token
from src.core.config import JWT_SECRET, JWT_ALGORITHM


# Создаю пользователя, хеширую пароль перед сохранением
def create_user(db: Session, email: str, password: str) -> User:
    hashed_password = hash_password(password)
    user = User(email=email, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Ищу пользователя по email
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


# Проверяю email и пароль, возвращаю пользователя если все ок
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not verify_password(password, user.password):
        return None
    
    return user


# Вытаскиваю user_id из JWT токена, возвращаю None если токен невалидный
def get_current_user_from_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None

# TODO(!!! tests): unit-тесты для всех методов:
# - создание пользователя (с проверкой уникальности email)
# - получение пользователя по email
# - аутентификация с правильным паролем
# - аутентификация с неправильным паролем
# - декодирование валидного токена
# - обработка невалидного токена
