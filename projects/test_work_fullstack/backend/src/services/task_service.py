# Создаю, получаю, обновляю и удаляю задачи для пользователей
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from src.models.task import Task, TaskStatus as TaskStatusEnum
from src.schemas.task import TaskCreate, TaskUpdate, TaskStatus


# Создаю новую задачу для пользователя, сохраняю в БД
def create_task(db: Session, task_data: TaskCreate, user_id: str) -> Task:
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=TaskStatusEnum(task_data.status.value) if task_data.status else TaskStatusEnum.PENDING,
        user_id=user_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


# Получаю задачу по ID, проверяю что она принадлежит пользователю
def get_task_by_id(db: Session, task_id: str, user_id: str) -> Optional[Task]:
    return db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == user_id)
    ).first()


# Получаю список задач пользователя, можно отфильтровать по статусу, дате, группе дней или месяцу
def get_tasks(
    db: Session,
    user_id: str,
    status: Optional[TaskStatus] = None,
    date: Optional[str] = None,
    day_group: Optional[str] = None,
    month: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[list[Task], int]:
    from datetime import datetime, timedelta, date as date_class
    from sqlalchemy import func
    
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if status:
        query = query.filter(Task.status == TaskStatusEnum(status.value))
    
    # Фильтрую по конкретной дате (YYYY-MM-DD)
    if date:
        try:
            filter_date = datetime.fromisoformat(date.replace('Z', '+00:00')).date()
            query = query.filter(func.date(Task.created_at) == filter_date)
        except (ValueError, AttributeError):
            pass
    
    # Фильтрую по группе дней (today, yesterday, week, month)
    elif day_group:
        today = date_class.today()
        try:
            if day_group == 'today':
                query = query.filter(func.date(Task.created_at) == today)
            elif day_group == 'yesterday':
                yesterday = today - timedelta(days=1)
                query = query.filter(func.date(Task.created_at) == yesterday)
            elif day_group == 'week':
                week_ago = today - timedelta(days=7)
                query = query.filter(func.date(Task.created_at) >= week_ago)
            elif day_group == 'month':
                month_ago = today - timedelta(days=30)
                query = query.filter(func.date(Task.created_at) >= month_ago)
        except (ValueError, AttributeError):
            pass
    
    # Фильтрую по месяцу (YYYY-MM)
    elif month:
        try:
            year, month_num = month.split('-')
            # Фильтрую по году и месяцу
            query = query.filter(
                func.extract('year', Task.created_at) == int(year),
                func.extract('month', Task.created_at) == int(month_num)
            )
        except (ValueError, AttributeError):
            pass
    
    total = query.count()
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return tasks, total


# Обновляю задачу, меняю только те поля которые переданы
def update_task(
    db: Session,
    task_id: str,
    user_id: str,
    task_data: TaskUpdate
) -> Optional[Task]:
    task = get_task_by_id(db, task_id, user_id)
    if not task:
        return None
    
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = TaskStatusEnum(task_data.status.value)
    
    db.commit()
    db.refresh(task)
    return task


# Удаляю задачу пользователя, возвращаю True если удалил
def delete_task(db: Session, task_id: str, user_id: str) -> bool:
    task = get_task_by_id(db, task_id, user_id)
    if not task:
        return False
    
    db.delete(task)
    db.commit()
    return True

# Получаю список доступных дат для фильтрации (даты когда были созданы задачи)
def get_available_dates(db: Session, user_id: str) -> list[str]:
    from sqlalchemy import func, cast, Date
    
    # Получаю уникальные даты из created_at, сортирую по убыванию
    dates_query = db.query(
        cast(Task.created_at, Date).label('date')
    ).filter(
        Task.user_id == user_id
    ).distinct().order_by(
        cast(Task.created_at, Date).desc()
    ).all()
    
    # Форматирую даты в ISO формат (YYYY-MM-DD)
    result = []
    for row in dates_query:
        date_value = row.date if hasattr(row, 'date') else row[0]
        if date_value:
            if hasattr(date_value, 'isoformat'):
                result.append(date_value.isoformat())
            elif hasattr(date_value, 'strftime'):
                result.append(date_value.strftime('%Y-%m-%d'))
            else:
                result.append(str(date_value))
    
    return result

# Получаю список доступных месяцев для фильтрации (месяцы когда были созданы задачи)
def get_available_months(db: Session, user_id: str) -> list[str]:
    from sqlalchemy import func, extract
    
    # Получаю уникальные комбинации года и месяца используя extract для совместимости
    # Сначала получаю задачи, потом группирую по году и месяцу
    months_query = db.query(
        extract('year', Task.created_at).label('year'),
        extract('month', Task.created_at).label('month')
    ).filter(
        Task.user_id == user_id
    ).distinct().order_by(
        extract('year', Task.created_at).desc(),
        extract('month', Task.created_at).desc()
    ).all()
    
    # Форматирую в список строк формата YYYY-MM
    result = []
    seen = set()
    for row in months_query:
        year = int(row.year) if hasattr(row, 'year') and row.year else int(row[0])
        month = int(row.month) if hasattr(row, 'month') and row.month else int(row[1])
        month_str = f"{year:04d}-{month:02d}"
        if month_str not in seen:
            result.append(month_str)
            seen.add(month_str)
    
    return result

# TODO(!!! tests): unit-тесты для всех методов сервиса:
# - создание задачи
# - получение задачи по ID (с проверкой владельца)
# - получение списка с фильтрацией (статус, дата)
# - получение доступных дат
# - обновление задачи
# - удаление задачи
# - проверка изоляции данных между пользователями
