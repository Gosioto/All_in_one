// Показываю одну задачу: заголовок, описание, статус. Можно менять статус и удалять
import { TASK_STATUS, TASK_STATUS_LABELS } from '../utils/constants';
import { ICONS } from '../utils/icons';

function TaskItem({ task, onUpdate, onDelete }) {
  // Меняю статус задачи через API
  const handleStatusChange = async (newStatus) => {
    await onUpdate(task.id, { status: newStatus });
  };

  // Удаляю задачу после подтверждения
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await onDelete(task.id);
    }
  };

  // Возвращаю нужную иконку в зависимости от статуса
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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <img 
            src={ICONS.TASK} 
            alt="Задача" 
            className="w-6 h-6"
          />
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src={getStatusIcon(task.status)} 
            alt={TASK_STATUS_LABELS[task.status]} 
            className="w-5 h-5"
          />
          <span className="text-xs font-medium text-gray-600">
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-4 ml-8">{task.description}</p>
      )}
      
      <div className="flex gap-2 flex-wrap">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={TASK_STATUS.PENDING}>{TASK_STATUS_LABELS[TASK_STATUS.PENDING]}</option>
          <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
          <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
        </select>
        
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
  );
}

export default TaskItem;

