// Все запросы к API проходят здесь. Добавляю токен в заголовки автоматически
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Беру токен из localStorage
function getToken() {
  return localStorage.getItem('auth_token');
}

// Делаю запрос к API, добавляю токен если есть, обрабатываю ошибки
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  
  // DELETE запросы возвращают 204 No Content без тела, сразу возвращаю null
  if (response.status === 204) {
    return null;
  }
  
  // Для других успешных ответов проверяю content-type перед парсингом
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    // Пытаюсь парсить JSON, если ошибка - возвращаю null
    try {
      return await response.json();
    } catch (e) {
      // Если тело пустое или не валидный JSON - возвращаю null
      return null;
    }
  }
  
  // Если не JSON - возвращаю null
  return null;
}

// API для авторизации
export const authAPI = {
  // Регистрирую пользователя
  async register(email, password) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Логинюсь и сохраняю токен и email в localStorage
  async login(email, password) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_email', email);
    }
    return data;
  },

  // Удаляю токен и email
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
  },
};

// API для задач
export const tasksAPI = {
  // Получаю список задач, можно отфильтровать по статусу, дате, группе дней или месяцу
  async getTasks(status = null, date = null, dayGroup = null, month = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    if (dayGroup) params.append('day_group', dayGroup);
    if (month) params.append('month', month);
    const queryString = params.toString();
    return fetchAPI(`/tasks${queryString ? '?' + queryString : ''}`);
  },

  // Создаю новую задачу
  async createTask(taskData) {
    return fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Получаю одну задачу по ID
  async getTask(taskId) {
    return fetchAPI(`/tasks/${taskId}`);
  },

  // Обновляю задачу
  async updateTask(taskId, taskData) {
    return fetchAPI(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Удаляю задачу
  async deleteTask(taskId) {
    return fetchAPI(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Получаю список доступных дат для фильтрации
  async getAvailableDates() {
    return fetchAPI('/tasks/dates');
  },

  // Получаю список доступных месяцев для фильтрации
  async getAvailableMonths() {
    return fetchAPI('/tasks/months');
  },
};

// TODO(!!! tests): unit-тесты для API методов:
// - успешные запросы
// - обработка ошибок
// - работа с токенами
// - валидация ответов
