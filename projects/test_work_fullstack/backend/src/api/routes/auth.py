# Роуты для регистрации и входа: POST /auth/register, POST /auth/login
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.core.database import get_db
from src.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from src.services.auth_service import create_user, authenticate_user, get_user_by_email
from src.auth.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# Регистрирую нового пользователя, проверяю что email не занят
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        existing_user = get_user_by_email(db, user_data.email)
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )
        
        user = create_user(db, user_data.email, user_data.password)
        return UserResponse(id=user.id, email=user.email)
    except HTTPException:
        raise
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    except Exception as e:
        # Если ошибка БД - скорее всего таблицы не созданы или БД недоступна
        error_msg = str(e).lower()
        if "table" in error_msg or "relation" in error_msg or "does not exist" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="База данных не настроена. Примените миграции: alembic upgrade head"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации: {str(e)}"
        )


# Проверяю email и пароль, возвращаю JWT токен если все ок
@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, login_data.email, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(subject=user.id)
        return TokenResponse(access_token=access_token)
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "table" in error_msg or "relation" in error_msg or "does not exist" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="База данных не настроена. Примените миграции: alembic upgrade head"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при входе: {str(e)}"
        )

# TODO(!!! tests): integration-тесты для эндпоинтов:
# - успешная регистрация пользователя
# - ошибка при регистрации с существующим email
# - успешный вход с правильными данными
# - ошибка при входе с неверным паролем
# - ошибка при входе с несуществующим email
# - валидация входных данных
