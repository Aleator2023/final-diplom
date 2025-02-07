import { Outlet, useNavigate } from 'react-router-dom';
import * as Antd from 'antd';
import '../styles/AdminLayout.css';
const { Layout, Menu } = Antd;
const { Header, Content, Sider } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    navigate('/login');
  };

  const items = [
    {
      key: '1', // Ключ для каждого элемента меню (должен быть уникальным)
      label: 'Все гостиницы',
      onClick: () => navigate('/admin/all-hotels'),
    },
    {
      key: '2',
      label: 'Поиск номера',
      onClick: () => navigate('/admin/room-search'),
    },
    {
      key: '3',
      label: 'Добавить гостиницу',
      onClick: () => navigate('/admin/add-hotel'),
    },
    {
      key: '4',
      label: 'Пользователи',
      onClick: () => navigate('/admin/users'),
    },
  ];


  return (
    <Layout>
      <Header className="nav-header">
        <img src="/logo/logo.png" alt="Logo" className="header-logo" />

        <button
          className="nav-button"
          onClick={handleLogout}
        >
          Выйти ▼
        </button>
      </Header>

      <Layout>
        <Sider style={{ 'height': '100vh', 'backgroundColor': '#fff' }}>
          <Menu items={items} />
        </Sider>

        <Content style={{ padding: '20px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;