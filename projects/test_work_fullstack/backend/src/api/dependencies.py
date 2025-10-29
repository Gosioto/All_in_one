# Получаю user_id из JWT токена, использую в защищенных роутах
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.services.auth_service import get_current_user_from_token

security = HTTPBearer()


# Вытаскиваю токен из заголовка, декодирую его, возвращаю user_id. Если токен невалидный - ошибка 401
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> str:
    token = credentials.credentials
    user_id = get_current_user_from_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен авторизации",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id

# TODO(!!! tests): unit-тесты зависимости:
# - успешное получение user_id из валидного токена
# - ошибка при отсутствии токена
# - ошибка при невалидном токене
# - ошибка при истекшем токене
