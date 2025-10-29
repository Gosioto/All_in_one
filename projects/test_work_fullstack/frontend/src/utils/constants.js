// Константы статусов задач
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

// Переводы статусов для отображения
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'В ожидании',
  [TASK_STATUS.IN_PROGRESS]: 'В работе',
  [TASK_STATUS.DONE]: 'Выполнено',
};

