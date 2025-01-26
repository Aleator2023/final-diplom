import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); 
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Добро пожаловать на сайт поиска и бронирования гостиниц</h1>
      <p className="home-description">Найдите и забронируйте лучшие отели по всему миру.</p>
      <button className="home-button" onClick={handleLoginClick}>Войти / Зарегистрироваться</button>
    </div>
  );
};

export default Home;