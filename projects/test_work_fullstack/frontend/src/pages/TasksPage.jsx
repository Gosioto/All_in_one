// Главная страница: сетка задач, модальные окна для создания и просмотра
import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../utils/constants';
import { ICONS } from '../utils/icons';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import ErrorModal from '../components/ErrorModal';
import DateFilter from '../components/DateFilter';

function TasksPage({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [dayGroupFilter, setDayGroupFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Получаю email пользователя из localStorage
  useEffect(() => {
    const email = localStorage.getItem('user_email') || '';
    setUserEmail(email);
  }, []);

  // Получаю первые символы email до @
  const getEmailPrefix = (email) => {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
  };

  // Загружаю задачи через API, учитываю все фильтры
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksAPI.getTasks(statusFilter, dateFilter, dayGroupFilter, monthFilter);
      setTasks(data.tasks || []);
    } catch (err) {
      setError('Ошибка загрузки задач: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Перезагружаю задачи при изменении фильтров
  useEffect(() => {
    loadTasks();
  }, [statusFilter, dateFilter, dayGroupFilter, monthFilter]);

  // Создаю задачу, потом перезагружаю список
  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.createTask(taskData);
      await loadTasks();
    } catch (err) {
      setError('Ошибка создания задачи: ' + err.message);
      throw err;
    }
  };

  // Обновляю задачу, потом перезагружаю список
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await tasksAPI.updateTask(taskId, taskData);
      await loadTasks();
      // Обновляю выбранную задачу если она была открыта
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = { ...selectedTask, ...taskData };
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      setError('Ошибка обновления задачи: ' + err.message);
      throw err;
    }
  };

  // Удаляю задачу, потом перезагружаю список
  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      await loadTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      setError('Ошибка удаления задачи: ' + err.message);
      throw err;
    }
  };

  // Открываю модальное окно с задачей при клике на карточку
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Закрываю модальное окно ошибок
  const handleErrorClose = () => {
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Шапка с заголовком, фильтром и кнопками */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Заголовок */}
            <div className="flex items-center gap-3">
              <img
                src={ICONS.TASK}
                alt="Задачи"
                className="w-10 h-10"
              />
              <h1 className="text-3xl font-bold text-gray-800">Мои задачи</h1>
            </div>

            {/* Информация пользователя и выход */}
            <div className="flex items-center gap-4">
              {userEmail && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <img
                    src={ICONS.EDIT}
                    alt="Автор"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {getEmailPrefix(userEmail)}
                  </span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Выйти из системы"
              >
                <img
                  src={ICONS.LOGOUT}
                  alt="Выйти"
                  className="w-5 h-5"
                />
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Фильтры и кнопка создания */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
              {/* Фильтр по статусу */}
              <div className="flex-1 w-full sm:w-auto">
                <label htmlFor="status-filter" className="block text-gray-700 text-sm font-bold mb-2">
                  Фильтр по статусу
                </label>
                <select
                  id="status-filter"
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="shadow appearance-none border rounded-xl w-full sm:w-auto min-w-[200px] py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 cursor-pointer hover:bg-gray-50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">Все задачи</option>
                  <option value={TASK_STATUS.PENDING}>{TASK_STATUS_LABELS[TASK_STATUS.PENDING]}</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
                  <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
                </select>
              </div>

              {/* Фильтр по дате (три типа: день, группа дней, месяц) */}
              <DateFilter
                selectedDate={dateFilter}
                selectedDayGroup={dayGroupFilter}
                selectedMonth={monthFilter}
                onDateChange={setDateFilter}
                onDayGroupChange={setDayGroupFilter}
                onMonthChange={setMonthFilter}
              />

              {/* Кнопка создания задачи */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
              >
                <img
                  src={ICONS.EDIT}
                  alt="Создать"
                  className="w-5 h-5"
                />
                <span>Создать задачу</span>
              </button>
            </div>
          </div>
        </div>

        {/* Сетка задач */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4">Загрузка задач...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <img
              src={ICONS.TASK}
              alt="Нет задач"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-600 text-lg">Нет задач. Создайте первую задачу!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра задачи */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Модальное окно для создания задачи */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Модальное окно для ошибок */}
      {error && (
        <ErrorModal
          message={error}
          onClose={handleErrorClose}
        />
      )}
    </div>
  );
}

export default TasksPage;
