// Модальное окно для просмотра задачи с полным текстом, открывается поверх остальных задач
import { TASK_STATUS, TASK_STATUS_LABELS } from '../utils/constants';
import { ICONS } from '../utils/icons';

function TaskModal({ task, onClose, onUpdate, onDelete }) {
  if (!task) return null;

  // Меняю статус задачи
  const handleStatusChange = async (newStatus) => {
    await onUpdate(task.id, { status: newStatus });
  };

  // Удаляю задачу после подтверждения
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await onDelete(task.id);
      onClose();
    }
  };

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

  // Закрываю при клике на фон
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Закрываю при нажатии Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleEscape}
      tabIndex={-1}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300"
        style={{
          animation: 'scaleIn 0.2s ease-out',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Заголовок с кнопкой закрытия */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 flex-1">
              <img
                src={ICONS.TASK}
                alt="Задача"
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold ml-4"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          {/* Описание задачи */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Описание:</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Статус и дата */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={getStatusIcon(task.status)}
                alt={TASK_STATUS_LABELS[task.status]}
                className="w-6 h-6"
              />
              <span className="text-sm font-medium text-gray-600">
                {TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
            {task.createdAt && (
              <span className="text-xs text-gray-500">
                Создано: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>

          {/* Действия */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white"
            >
              <option value={TASK_STATUS.PENDING}>{TASK_STATUS_LABELS[TASK_STATUS.PENDING]}</option>
              <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
              <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
            </select>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              title="Удалить задачу"
            >
              <img
                src={ICONS.DELETE}
                alt="Удалить"
                className="w-4 h-4"
              />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default TaskModal;

