# Pydantic схемы для валидации данных задач в API
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# Статусы задачи
class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"


# Базовые поля задачи
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Заголовок задачи")
    description: Optional[str] = Field(None, max_length=1000, description="Описание задачи")
    status: TaskStatus = Field(TaskStatus.PENDING, description="Статус задачи")


# Для создания новой задачи
class TaskCreate(TaskBase):
    pass


# Для обновления задачи - все поля опциональные
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None


# Ответ API с данными задачи
class TaskResponse(TaskBase):
    id: str
    createdAt: datetime
    userId: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True  # Разрешаю использовать createdAt вместо created_at


# Ответ API со списком задач
class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int

# TODO(!!! tests): unit-тесты валидации схем (граничные значения, некорректные данные)
