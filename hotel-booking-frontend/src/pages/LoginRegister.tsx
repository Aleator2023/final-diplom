import React, { useState } from 'react';
import '../styles/LoginRegister.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as Antd from 'antd';
import '../styles/Layout.css';
const { Layout, Spin, Button, Form, Input, Card } = Antd;
const { Header, Content } = Layout;
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const BASE_URL = 'http://localhost:3000';

interface AuthResponse {
  access_token: string;
  id: string;
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
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  // Функция обработки входа
  const handleLogin = async (credentials: { email: string; password: string }) => {
    setErrorMessage('');
    setLoading(true);
  
    try {
      const { access_token, id } = await axios
        .post<AuthResponse>(`${BASE_URL}/auth/login`, credentials)
        .then((res) => res.data);
  
      if (!access_token) {
        throw new Error('Invalid server response: no access token');
      }
  
      localStorage.setItem('token', access_token);
      localStorage.setItem('userId', id);
  
      const user = await axios
        .get<UserResponse>(`${BASE_URL}/users/find-by-email`, {
          params: { email: credentials.email },
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);
  
      if (!user.role) {
        throw new Error('Error fetching user data: no role');
      }
  
      localStorage.setItem('role', user.role);
  
      // 🔹 Новая логика редиректа в зависимости от роли
      switch (user.role) {
        case 'admin':
          navigate('/admin/users');
          break;
        case 'manager':
          navigate('/manager/all-hotels');
          break;
        case 'client':
          navigate('/client/all-hotels');
          break;
        default:
          navigate('/dashboard');
      }
  
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed');
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
        contactPhone: credentials.contactPhone || '+12341234567',
      });

      if (response.data && response.data.email) {
        setIsLoginForm(true);
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
        <button className="nav-button" onClick={() => setIsLoginForm(!isLoginForm)}>
          {isLoginForm ? 'Зарегистрироваться ▼' : 'Войти ▼'}
        </button>
      </Header>

      <Layout>
        <Content style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Spin tip="Loading" size="large">
              {spinContent}
            </Spin>
          ) : (
            <Card style={{ width: 350 }}>
              <Form name="login" initialValues={{ remember: true }} onFinish={isLoginForm ? onLogin : onRegister}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
                  <a href="#" onClick={() => setIsLoginForm(true)}>Войти</a> |{' '}
                  <span>или</span> |{' '}
                  <a href="#" onClick={() => setIsLoginForm(false)}>Зарегистрироваться</a>
                </div>

                {!isLoginForm && (
                  <Form.Item name="name" rules={[{ required: true, message: 'Введите имя' }]}>
                    <Input placeholder="Введите имя" />
                  </Form.Item>
                )}

                <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}>
                  <Input prefix={<UserOutlined />} placeholder="Введите email" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
                  <Input prefix={<LockOutlined />} type="password" placeholder="Введите пароль" />
                </Form.Item>

                {!isLoginForm && (
                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'Подтвердите пароль' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Пароли не совпадают!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Повторите пароль" />
                  </Form.Item>
                )}

                <Button block type="primary" htmlType="submit">
                  {isLoginForm ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              </Form>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LoginRegister;