import React, { useState } from 'react';
import '../styles/LoginRegister.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as Antd from 'antd';
import '../styles/AdminLayout.css';
const { Layout, Menu, Spin, Button, Form, Input, Card } = Antd;
const { Header, Content, Sider } = Layout;
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const BASE_URL = 'http://localhost:3000';

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

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  contactPhone?: string;
}

const LoginRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true); // Флаг для переключения формы
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const items = [
    {
      key: '1', // Ключ для каждого элемента меню (должен быть уникальным)
      label: 'Все гостиницы',
      onClick: () => navigate('/all-hotels'),
    },
    {
      key: '2',
      label: 'Поиск номера',
      onClick: () => navigate('/room-search'),
    },
    {
      key: '3',
      label: 'Добавить гостиницу',
      onClick: () => navigate('/add-hotel'),
    },
  ];

  // Функция обработки входа
  const handleLogin = async (credentials: { email: string, password: string }) => {
    setErrorMessage('');
    setLoading(true);

    try {
      const { access_token } = await axios.post<AuthResponse>(`${BASE_URL}/auth/login`, credentials).then(res => res.data);

      if (!access_token) {
        throw new Error('Invalid server response: no access token');
      }

      localStorage.setItem('token', access_token);

      const user = await axios.get<UserResponse>(`${BASE_URL}/users/find-by-email`, {
        params: { email: credentials.email },
        headers: { Authorization: `Bearer ${access_token}` },
      }).then(res => res.data);


      if (!user.role) {
        throw new Error('Error fetching user data: no role');
      }

      navigate(user.role === 'admin' ? '/admin/users' : '/dashboard');

    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed'); // Более конкретное сообщение об ошибке или общее
    } finally {
      setLoading(false);
    }
  };

  // Функция обработки регистрации
  const handleRegister = async (credentials: RegisterCredentials) => {
    setErrorMessage('');
  
    try {
      const response = await axios.post<UserResponse>(`${BASE_URL}/auth/register`, {
        ...credentials, 
        contactPhone: credentials.contactPhone || '+12341234567', // Используем переданный номер или дефолтный
      });

      if (response.data && response.data.email) {
        setIsLoginForm(true); // Переключение на форму входа
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Registration failed.');
    }
  };
  

  const spinContentStyle: React.CSSProperties = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };
  const spinContent = <div style={spinContentStyle} />;

  const onLogin = (values: any) => {
    handleLogin({ email: values.email, password: values.password });
  };

  const onRegister = (values: any) => {
    handleRegister({ name: values.name, email: values.email, password: values.password });
  };

  return (
    <Layout>
      <Header className="nav-header">
        <img src="/logo/logo.png" alt="Logo" className="header-logo" />

        <button
          className="nav-button"
          onClick={isLoginForm ? () => setIsLoginForm(false) : () => setIsLoginForm(true)}
        >
          {isLoginForm ? 'Зарегистрироваться ▼' : 'Войти ▼'}
        </button>
      </Header>

      <Layout>
        <Sider style={{ 'height': '100vh', 'backgroundColor': '#fff' }}>
          <Menu items={items} />
        </Sider>

        <div style={{ margin: '0 auto'}}>
          { loading ?
            (
              <Spin tip="Loading" size="large">
                {spinContent}
              </Spin>
            ) :
            (
              <Content style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', }}>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                {isLoginForm ?
                  (
                    <Card style={{ width: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                      <Form
                        name="login"
                        initialValues={{ remember: true }}
                        style={{ width: '100%', }}
                        onFinish={onLogin}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'space-between', justifyContent: 'center', marginBottom: 10, }}>
                          <a href="#" onClick={() => setIsLoginForm(true)}>Войти</a> |{' '}
                          <span>или</span>
                          <a href="#" onClick={() => setIsLoginForm(false)}>Зарегистрироваться</a>
                        </div>

                        <Form.Item
                          name="email"
                          rules={[{ required: true, message: 'Пожалуйста, введите свой адрес email' }]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Введите email" />
                        </Form.Item>

                        <Form.Item
                          name="password"
                          rules={[{ required: true, message: 'Пожалуйста, введите свой пароль' }]}
                        >
                          <Input prefix={<LockOutlined />} type="password" placeholder="Введите пароль" />
                        </Form.Item>

                        <Button block type="primary" htmlType="submit">
                          Войти
                        </Button>
                      </Form>
                    </Card>
                  ) :
                  (
                    <Card style={{ width: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                      <Form
                        name="login"
                        initialValues={{ remember: true }}
                        style={{ width: '100%', }}
                        onFinish={onRegister}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'space-between', justifyContent: 'center', marginBottom: 10, }}>
                          <a href="#" onClick={() => setIsLoginForm(true)}>Войти</a> |{' '}
                          <span>или</span>
                          <a href="#" onClick={() => setIsLoginForm(false)}>Зарегистрироваться</a>
                        </div>

                        <Form.Item
                          name="name"
                          rules={[{ required: true, message: 'Пожалуйста, введите своё имя' }]}
                        >
                          <Input placeholder="Введите имя" />
                        </Form.Item>

                        <Form.Item
                          name="email"
                          rules={[{ required: true, message: 'Поле обязательно' }, { type: 'email', message: 'Пожалуйста, введите корректный адрес email' }]}
                        >
                          <Input placeholder="Введите email" />
                        </Form.Item>

                        <Form.Item
                          name="password"
                          rules={[{ required: true, message: 'Пожалуйста, введите свой пароль' }]}
                        >
                          <Input type="password" placeholder="Введите пароль" />
                        </Form.Item>

                        <Form.Item
                          name="confirm"
                          dependencies={['password']}
                          hasFeedback
                          rules={[
                            {
                              required: true,
                              message: 'Пожалуйста, подтвердите пароль',
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Пароли не соврадают!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password />
                        </Form.Item>

                        <Button block type="primary" htmlType="submit">
                          Зарегистрироваться
                        </Button>
                      </Form>
                    </Card>
                  )
                }
              </Content>
            )
          }
        </div>
      </Layout>
    </Layout>
  );
};

export default LoginRegister;