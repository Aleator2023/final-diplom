import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRegister.css';
import axios from 'axios';

// Определение интерфейсов для данных ответа от сервера
interface AuthResponse {
  access_token: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  contactPhone?: string;
  role: 'client' | 'admin' | 'manager';
}

const LoginRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true); // Флаг для переключения формы
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Функция обработки входа
  const handleLoginClick = async () => {
    setErrorMessage('');
    try {
      const response = await axios.post<AuthResponse>('http://localhost:3000/auth/login', {
        email,
        password,
      });

      if (!response.data.access_token) {
        throw new Error('Неверный ответ сервера');
      }

      // Сохранение токена в localStorage
      localStorage.setItem('token', response.data.access_token);

      // Запрашиваем информацию о пользователе
      const userResponse = await axios.get<UserResponse>('http://localhost:3000/users/find-by-email', {
        params: { email },
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });

      if (!userResponse.data.role) {
        throw new Error('Ошибка получения данных пользователя');
      }

      // Проверяем роль пользователя и перенаправляем
      if (userResponse.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMessage('Неверный логин или пароль');
    }
  };

  // Функция обработки регистрации
  const handleRegisterSubmit = async () => {
    setErrorMessage('');
    try {
      const response = await axios.post<UserResponse>('http://localhost:3000/auth/register', {
        name,
        email,
        password,
        contactPhone: '+12341234567',
      });

      if (response.data && response.data.email) {
        alert(`Регистрация успешна! Добро пожаловать, ${response.data.name}`);
        setIsLoginForm(true); // Переключение на форму входа
      } else {
        throw new Error('Ошибка регистрации');
      }
    } catch (error) {
      setErrorMessage('Ошибка при регистрации. Возможно, email уже используется.');
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
            onClick={isLoginForm ? () => setIsLoginForm(false) : () => setIsLoginForm(true)}
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
                  <a href="#" onClick={() => setIsLoginForm(true)}>Войти</a> |{' '}
                  <a href="#" onClick={() => setIsLoginForm(false)}>Зарегистрироваться</a>
                </>
              ) : (
                <>
                  <a href="#" onClick={() => setIsLoginForm(true)}>Войти</a> |{' '}
                  <a href="#" onClick={() => setIsLoginForm(false)}>Зарегистрироваться</a>
                </>
              )}
            </h2>
            {isLoginForm ? (
              <form onSubmit={(e) => e.preventDefault()}>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
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