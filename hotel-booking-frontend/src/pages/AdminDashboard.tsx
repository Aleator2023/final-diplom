import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Выход и перенаправление на страницу входа
    navigate('/login');
  };

  const goToAllHotels = () => {
    navigate('/admin/all-hotels');
  };

  const goToAddHotel = () => {
    navigate('/admin/add-hotel');
  };

  const goToRoomSearch = () => {
    navigate('/admin/room-search'); // Страница для поиска номеров
  };

  const goToUsers = () => {
    navigate('/admin/users');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Панель администратора</h1>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Выйти</button>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Управление контентом</h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ margin: '10px 0' }}>
            <button onClick={goToAllHotels} style={{ cursor: 'pointer' }}>Все гостиницы</button>
          </li>
          <li style={{ margin: '10px 0' }}>
            <button onClick={goToRoomSearch} style={{ cursor: 'pointer' }}>Поиск номера</button>
          </li>
          <li style={{ margin: '10px 0' }}>
            <button onClick={goToAddHotel} style={{ cursor: 'pointer' }}>Добавить гостиницу</button>
          </li>
          <li style={{ margin: '10px 0' }}>
            <button onClick={goToUsers} style={{ cursor: 'pointer' }}>Пользователи</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;