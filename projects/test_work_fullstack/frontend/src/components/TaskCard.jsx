// Карточка задачи для отображения в сетке, при клике открывается модальное окно
import { TASK_STATUS, TASK_STATUS_LABELS } from '../utils/constants';
import { ICONS } from '../utils/icons';

function TaskCard({ task, onClick }) {
  // Получаю иконку статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.DONE:
        return ICONS.DONE;
      case TASK_STATUS.IN_PROGRESS:
        return ICONS.IN_PROGRESS;
      default:
        return ICONS.PENDING;
    }
  };

  // Получаю цвет для статуса
  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.DONE:
        return 'bg-green-100 text-green-700';
      case TASK_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 cursor-pointer transform hover:scale-105"
      style={{
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Заголовок и иконка статуса */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={ICONS.TASK}
            alt="Задача"
            className="w-6 h-6 flex-shrink-0"
          />
          <h3 className="text-lg font-bold text-gray-800 truncate" title={task.title}>
            {task.title}
          </h3>
        </div>
      </div>

      {/* Описание (обрезаю если длинное) */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {task.description}
        </p>
      )}

      {/* Статус */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <img
            src={getStatusIcon(task.status)}
            alt={TASK_STATUS_LABELS[task.status]}
            className="w-5 h-5"
          />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;

