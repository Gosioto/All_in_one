// Переключаюсь между формой входа и регистрации
import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function AuthPage({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);

  // Просто пробрасываю данные дальше
  const handleLogin = async (email, password) => {
    const result = await onLogin(email, password);
    return result;
  };

  // После регистрации автоматически логинюсь
  const handleRegister = async (email, password) => {
    const result = await onRegister(email, password);
    return result;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}

export default AuthPage;

