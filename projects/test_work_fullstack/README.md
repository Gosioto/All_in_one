# test_work_fullstack

Fullstack проект для управления задачами (Todo App) с JWT авторизацией.

**Технологический стек:**
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: FastAPI (Python) + SQLAlchemy ORM + Alembic
- **База данных**: PostgreSQL

## Быстрый запуск через Docker

### ⚠️ ВАЖНО: Запускайте из директории test_work_fullstack!

```bash
cd projects/test_work_fullstack
docker-compose up --build
```

**Примечание:** Docker контекст сборки находится в директории `test_work_fullstack`, поэтому в контейнер попадет только этот проект. Другие проекты из репозитория не будут включены.

### Результат:

Приложение будет доступно на **http://localhost:8000**

### 3. Первый запуск:

**Нет тестовых пользователей!** Нужно сначала зарегистрироваться:
1. Откройте http://localhost:8000
2. Нажмите "Зарегистрироваться"
3. Введите email и пароль (минимум 8 символов)
4. После регистрации автоматически произойдет вход

### 4. Остановка:

```bash
docker-compose down
```

Для полного удаления с данными:
```bash
docker-compose down -v
```

## Структура проекта

```
test_work_fullstack/
├── frontend/          # React фронтенд
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # API сервисы
│   │   ├── hooks/         # React хуки
│   │   ├── utils/         # Утилиты
│   │   └── styles/        # Стили
│   ├── public/        # Публичные файлы
│   └── package.json
├── backend/           # FastAPI бэкенд
│   ├── src/
│   │   ├── api/           # API роуты
│   │   ├── core/          # Конфигурация и БД
│   │   ├── auth/          # Авторизация
│   │   ├── schemas/       # Pydantic схемы
│   │   ├── services/      # Бизнес-логика
│   │   ├── models/        # SQLAlchemy модели
│   │   └── main.py        # Точка входа
│   ├── alembic/       # Миграции БД
│   └── requirements.txt
├── docker-compose.yml      # Docker Compose конфигурация
└── Dockerfile              # Docker образ приложения
```

## Локальная разработка

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Создайте .env файл:
# DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todo_db
# JWT_SECRET=your_secret_key

# Примените миграции
alembic upgrade head

# Запустите сервер
.\venv\Scripts\python.exe run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Авторизация
- `POST /auth/register` - Регистрация (email, password)
- `POST /auth/login` - Вход (email, password)

### Задачи (требуется JWT токен)
- `GET /tasks` - Список задач (query: `?status=pending&date=2024-01-15&day_group=week&month=2024-01`)
- `POST /tasks` - Создание задачи
- `GET /tasks/{id}` - Получение задачи
- `PUT /tasks/{id}` - Обновление задачи
- `DELETE /tasks/{id}` - Удаление задачи
- `GET /tasks/dates` - Список доступных дат
- `GET /tasks/months` - Список доступных месяцев

## Фильтры

### По статусу:
- `pending` - В ожидании
- `in_progress` - В работе
- `done` - Выполнено

### По дате:
- `date=YYYY-MM-DD` - Конкретная дата
- `day_group=today` - Сегодня
- `day_group=yesterday` - Вчера
- `day_group=week` - Последние 7 дней
- `day_group=month` - Последние 30 дней
- `month=YYYY-MM` - Конкретный месяц

## Docker Compose Сервисы

- **postgres**: PostgreSQL база данных (порт 5432)
- **app**: Backend + Frontend приложение (порт 8000)

## Экспорт и отправка Docker образа

### Сохранение образа в файл:

```bash
# Сохранить образ в tar файл
docker save test_work_fullstack-app:latest -o todo-app-image.tar

# Сохранить со сжатием (меньше размер)
docker save test_work_fullstack-app:latest | gzip > todo-app-image.tar.gz
```

### Загрузка образа на другой машине:

```bash
# Из tar файла
docker load -i todo-app-image.tar

# Из gzip архива
gunzip -c todo-app-image.tar.gz | docker load
```

### Отправка в Docker Hub:

```bash
# 1. Логин
docker login

# 2. Тегирование
docker tag test_work_fullstack-app:latest username/todo-app:latest

# 3. Отправка
docker push username/todo-app:latest
```

### Использование образа на другой машине:

После загрузки образа, создайте `docker-compose.yml`:

```yaml
services:
  app:
    image: test_work_fullstack-app:latest  # Используйте сохраненный образ
    # или image: username/todo-app:latest  # Или из Docker Hub
```

После загрузки запустите: `docker-compose up -d`

## Переменные окружения

Создайте `.env` файл в корне проекта или используйте переменные в docker-compose.yml:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/todo_db
JWT_SECRET=your_secret_key_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRES_MIN=1440
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
```

## Статус

✅ **Проект полностью реализован**
- Backend API готов (SQLAlchemy)
- Frontend SPA готов
- Docker конфигурация готова
- Фильтры по статусу, дате, группе дней и месяцам
- Модальные окна для создания и просмотра задач
- Сохранение данных в куки

---

**Для разработки:** Используйте локальный запуск (см. раздел "Локальная разработка")
**Для продакшена:** Используйте Docker Compose (`docker-compose up --build`)
