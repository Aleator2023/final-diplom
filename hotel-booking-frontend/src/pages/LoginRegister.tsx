import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRegister.css';
import axios from 'axios';

const LoginRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true); // Флаг для переключения формы
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  const handleLoginClick = async () => {
    try {
      await axios.post('http://localhost:3000/auth/login', { email, password });
      
      // navigate('/admin');
    } catch (error) {
      setErrorMessage('Неверный логин или пароль');
    }
  };

  const handleRegisterClick = () => {
    setIsLoginForm(false); // Переключение на форму регистрации
  };

  const handleSwitchToLogin = () => {
    setIsLoginForm(true); // Переключение на форму входа
  };

  const handleRegisterSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/auth/register', { name: username, password, email, contactPhone: '+12341234567' });
    } catch (err: any) {
      console.error(err);
    }
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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