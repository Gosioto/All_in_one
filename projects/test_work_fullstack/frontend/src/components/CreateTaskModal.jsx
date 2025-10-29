// Модальное окно для создания задачи, сохраняет данные в куки при закрытии
import { useState, useEffect } from 'react';
import { saveTaskDraft, getTaskDraft, clearTaskDraft } from '../utils/cookies';
import { ICONS } from '../utils/icons';

function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Загружаю сохраненные данные из куки при открытии
  useEffect(() => {
    if (isOpen) {
      const draft = getTaskDraft();
      setTitle(draft.title || '');
      setDescription(draft.description || '');
    }
  }, [isOpen]);

  // Сохраняю данные в куки при изменении
  useEffect(() => {
    if (isOpen) {
      saveTaskDraft(title, description);
    }
  }, [title, description, isOpen]);

  // Обрабатываю отправку формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || null });
      clearTaskDraft();
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      // Ошибка обрабатывается в родительском компоненте
    } finally {
      setLoading(false);
    }
  };

  // Закрываю модалку с сохранением в куки
  const handleClose = () => {
    saveTaskDraft(title, description);
    onClose();
  };

  // Закрываю при клике на фон
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Закрываю при нажатии Escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300"
        style={{
          animation: 'scaleIn 0.2s ease-out',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src={ICONS.TASK}
                alt="Новая задача"
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-bold text-gray-800">Новая задача</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="create-title" className="block text-gray-700 text-sm font-bold mb-2">
                Заголовок *
              </label>
              <input
                id="create-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Введите заголовок задачи"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label htmlFor="create-description" className="block text-gray-700 text-sm font-bold mb-2">
                Описание
              </label>
              <textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={4}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                placeholder="Введите описание задачи (необязательно)"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </form>
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

export default CreateTaskModal;

