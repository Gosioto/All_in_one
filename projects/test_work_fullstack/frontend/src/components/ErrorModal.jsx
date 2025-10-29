// Модальное окно для отображения ошибок, выплывает с краю экрана, закрывается по клику
import { useEffect } from 'react';
import { ICONS } from '../utils/icons';

function ErrorModal({ message, onClose }) {
  // Закрываю модалку при клике на любой элемент внутри
  const handleClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // Предотвращаю закрытие при клике вне модалки (только внутри)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Закрываю модалку при нажатии Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className="bg-white rounded-l-2xl shadow-2xl p-6 max-w-md w-full m-4 transform transition-all duration-300 ease-out animate-slideInRight"
        onClick={handleClick}
        style={{
          animation: 'slideInRight 0.3s ease-out',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-start gap-4">
          <img
            src={ICONS.WARNING}
            alt="Ошибка"
            className="w-8 h-8 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-600 mb-2">Ошибка</h3>
            <p className="text-gray-700 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ErrorModal;

