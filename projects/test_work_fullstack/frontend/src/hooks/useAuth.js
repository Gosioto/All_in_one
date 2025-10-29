// Управляю авторизацией: проверяю токен, регистрирую, логинюсь, выхожу
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // При загрузке проверяю есть ли токен в localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // Регистрирую пользователя, потом автоматически логинюсь
  const register = async (email, password) => {
    try {
      await authAPI.register(email, password);
      await login(email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Логинюсь, сохраняю токен и email, обновляю состояние
  const login = async (email, password) => {
    try {
      await authAPI.login(email, password);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Удаляю токен и выхожу
  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, register, login, logout };
}

// TODO(!!! tests): unit-тесты для хука useAuth:
// - проверка состояния при наличии/отсутствии токена
// - успешная регистрация и вход
// - обработка ошибок при регистрации/входе
// - корректный выход

