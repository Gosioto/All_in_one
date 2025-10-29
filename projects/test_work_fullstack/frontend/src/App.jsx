// Показываю страницу входа или задач в зависимости от того, авторизован ли пользователь
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import TasksPage from './pages/TasksPage';

function App() {
  const { isAuthenticated, loading, register, login, logout } = useAuth();

  // Пробрасываю данные дальше
  const handleLogin = async (email, password) => {
    return await login(email, password);
  };

  // Пробрасываю данные дальше
  const handleRegister = async (email, password) => {
    return await register(email, password);
  };

  // Показываю загрузку пока проверяю токен
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  // Если есть токен - показываю задачи, иначе форму входа
  return (
    <div className="App">
      {isAuthenticated ? (
        <TasksPage onLogout={logout} />
      ) : (
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}

export default App;
