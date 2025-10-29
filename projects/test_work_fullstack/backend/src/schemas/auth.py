# Pydantic схемы для валидации данных регистрации, входа и токенов
from pydantic import BaseModel, EmailStr, Field


# Данные для регистрации
class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=8, max_length=72, description="Пароль (минимум 8 символов, максимум 72 символа)")


# Данные для входа
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Ответ API с JWT токеном
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Ответ API с данными пользователя (без пароля)
class UserResponse(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True

# TODO(!!! tests): unit-тесты валидации email и пароля, граничные случаи

