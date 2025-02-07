import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import * as Antd from 'antd';
import { useEffect, useState } from 'react';
import '../styles/Layout.css';

const { Layout, Menu } = Antd;
const { Header, Content, Sider } = Layout;

const LayoutComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole || null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');

    navigate('/login');
  };

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { key: '1', label: 'Все гостиницы', path: '/admin/all-hotels' },
          { key: '2', label: 'Добавить гостиницу', path: '/admin/add-hotel' },
          { key: '3', label: 'Пользователи', path: '/admin/users' },
        ];
      case 'manager':
        return [
          { key: '1', label: 'Все гостиницы', path: '/manager/all-hotels' },
          { key: '2', label: 'Бронирования', path: '/manager/bookings' },
          { key: '3', label: 'Чат с клиентами', path: '/manager/chat' },
        ];
      case 'client':
        return [
          { key: '1', label: 'Все гостиницы', path: '/client/all-hotels' },
          { key: '2', label: 'Мои бронирования', path: '/client/my-bookings' },
          { key: '3', label: 'Чат с техподдержкой', path: '/client/chat-support' },
        ];
      default:
        return [];
    }
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="nav-header">
        <img src="/logo/logo.png" alt="Logo" className="header-logo" />
        <button className="nav-button" onClick={handleLogout}>
          Выйти ▼
        </button>
      </Header>

      <Layout>
        {role && !isLoginPage && getMenuItems().length > 0 && (
          <Sider width={250} style={{ backgroundColor: '#fff' }}>
            <Menu
              mode="vertical"
              defaultSelectedKeys={['1']}
              style={{ height: '100%', borderRight: 0 }}
            >
              {getMenuItems().map((item) => (
                <Menu.Item key={item.key} onClick={() => navigate(item.path)}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu>
          </Sider>
        )}

        <Layout style={{ padding: '20px' }}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;