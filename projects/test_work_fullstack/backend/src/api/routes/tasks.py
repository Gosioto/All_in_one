# Роуты для задач. Все требуют JWT токен. GET /tasks, POST /tasks, GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.api.dependencies import get_current_user_id
from src.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatus
from src.services.task_service import (
    create_task,
    get_task_by_id,
    get_tasks,
    get_available_dates,
    get_available_months,
    update_task,
    delete_task
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


# Получаю список задач пользователя, можно отфильтровать по статусу, дате, группе дней или месяцу
@router.get("", response_model=TaskListResponse)
def list_tasks(
    status_filter: Optional[TaskStatus] = Query(None, alias="status", description="Фильтр по статусу"),
    date_filter: Optional[str] = Query(None, alias="date", description="Фильтр по дате (YYYY-MM-DD)"),
    day_group: Optional[str] = Query(None, alias="day_group", description="Фильтр по группе дней (today, yesterday, week, month)"),
    month_filter: Optional[str] = Query(None, alias="month", description="Фильтр по месяцу (YYYY-MM)"),
    skip: int = Query(0, ge=0, description="Количество пропущенных записей"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    tasks, total = get_tasks(db, user_id, status_filter, date_filter, day_group, month_filter, skip, limit)
    return TaskListResponse(
        tasks=[TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=TaskStatus(task.status.value),
            createdAt=task.created_at,
            userId=task.user_id
        ) for task in tasks],
        total=total
    )


# Создаю новую задачу для текущего пользователя
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    task = create_task(db, task_data, user_id)
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=TaskStatus(task.status.value),
        createdAt=task.created_at,
        userId=task.user_id
    )


# Получаю задачу по ID, пользователь может получить только свои задачи
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    task = get_task_by_id(db, task_id, user_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=TaskStatus(task.status.value),
        createdAt=task.created_at,
        userId=task.user_id
    )


# Обновляю задачу, меняю только переданные поля
@router.put("/{task_id}", response_model=TaskResponse)
def update_task_route(
    task_id: str,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    updated_task = update_task(db, task_id, user_id, task_data)
    
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
    
    return TaskResponse(
        id=updated_task.id,
        title=updated_task.title,
        description=updated_task.description,
        status=TaskStatus(updated_task.status.value),
        createdAt=updated_task.created_at,
        userId=updated_task.user_id
    )


# Удаляю задачу пользователя
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_route(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    deleted = delete_task(db, task_id, user_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )


# Получаю список доступных дат для фильтрации (даты когда были созданы задачи)
@router.get("/dates")
def get_task_dates(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    dates = get_available_dates(db, user_id)
    return {"dates": dates}

# Получаю список доступных месяцев для фильтрации (месяцы когда были созданы задачи)
@router.get("/months")
def get_task_months(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    months = get_available_months(db, user_id)
    return {"months": months}

# TODO(!!! tests): integration-тесты для всех эндпоинтов:
# - получение списка задач (с фильтрацией и без)
# - создание задачи
# - получение задачи по ID
# - обновление задачи
# - удаление задачи
# - проверка изоляции данных между пользователями
# - проверка авторизации (доступ без токена)
