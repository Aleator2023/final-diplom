import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRegister.css';

const LoginRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true); // Флаг для переключения формы
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginClick = () => {
    if (username === 'admin' && password === 'admin123') {
      navigate('/admin'); 
    } else {
      setErrorMessage('Неверный логин или пароль');
    }
  };

  const handleRegisterClick = () => {
    setIsLoginForm(false); // Переключение на форму регистрации
  };

  const handleSwitchToLogin = () => {
    setIsLoginForm(true); // Переключение на форму входа
  };

  const handleRegisterSubmit = () => {
    console.log('Регистрация пользователя');
    // Здесь можно реализовать логику регистрации
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
        <img src="/logo/logo.png" alt="Logo" className="logo-image" />
        </div>
        <nav>
          <button
            className="nav-button"
            onClick={isLoginForm ? handleRegisterClick : handleSwitchToLogin}
          >
            {isLoginForm ? 'Зарегистрироваться ▼' : 'Войти ▼'}
          </button>
        </nav>
      </header>

      <div className="content">
        <aside className="sidebar">
          <ul>
            <li>Все гостиницы</li>
            <li>Поиск номера</li>
            <li>Добавить гостиницу</li>
            <li>Пользователи</li>
          </ul>
        </aside>

        <main className="main-content">
          <div className="form-container">
            <h2>
              {isLoginForm ? (
                <>
                  <a href="#" onClick={handleSwitchToLogin}>
                    Войти
                  </a>{' '}
                  |{' '}
                  <a href="#" onClick={handleRegisterClick}>
                    Зарегистрироваться
                  </a>
                </>
              ) : (
                <>
                  <a href="#" onClick={handleSwitchToLogin}>
                    Войти
                  </a>{' '}
                  |{' '}
                  <a href="#" onClick={handleRegisterClick}>
                    Зарегистрироваться
                  </a>
                </>
              )}
            </h2>
            {isLoginForm ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Введите логин</label>
                  <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Введите пароль</label>
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <button type="button" onClick={handleLoginClick} className="login-button">
                  Войти
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Введите имя</label>
                  <input
                    type="text"
                    placeholder="Имя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Введите email</label>
                  <input
                    type="email"
                    placeholder="Email"
                  />
                </div>
                <div className="form-group">
                  <label>Введите пароль</label>
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="button" onClick={handleRegisterSubmit} className="register-button">
                  Зарегистрироваться
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginRegister;