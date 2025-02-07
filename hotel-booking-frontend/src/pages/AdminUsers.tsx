import React, { useEffect, useState } from 'react';
import * as Antd from 'antd';
const { Table, Input, Modal, Popconfirm, Button } = Antd;
const { Search } = Input;
import type { GetProps } from 'antd';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../services/api'; 
import { DeleteOutlined } from '@ant-design/icons';

interface User {
  id: string;
  email: string;
  name: string;
  contactPhone: string;
  role: string;
}

type SearchProps = GetProps<typeof Input.Search>;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem('userId')

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      render: (text: string, record: User) => (
        <Link to={`/admin/users/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Телефон',
      dataIndex: 'contactPhone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },

    {
      title: 'Роль',
      dataIndex: 'role',
    },
    {
      title: '',
      dataIndex: 'action',
      render: (_, record: User) => {
        return userId !== record.id ?
        <Popconfirm
          title="Вы уверены, что хотите удалить пользователя?"
          onConfirm={async () => {
            try {
              await deleteUser(record.id);

              const newUsers = users.filter(user => user.id !== record.id);
              setUsers(newUsers);
            } catch (error: any) {
              console.error('Ошибка при удалении пользователя:', error);
            }
          }}
          onCancel={() => {}} // Ничего не делаем при отмене
          okText="Да"
          cancelText="Нет"
        >
          <Button type="danger" icon={<DeleteOutlined />} >
            Удалить
          </Button>
        </Popconfirm>
        :
        ''
      },
    },
  ];

  const handleFetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const fetchedUsers = await getUsers(search);
      setUsers(fetchedUsers);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    handleFetchUsers(); // Вызываем обертку
  }, []);
  
  const onSearch: SearchProps['onSearch'] = (value) => {
    handleFetchUsers(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Пользователи</h1>

      {loading && <p>Загрузка...</p>}

      <Search placeholder="Введите имя, id, телефон или почту" onSearch={onSearch} style={{ width: 400, marginBottom: 20 }} size="large" />

      <Table
        dataSource={users} 
        columns={columns}
        loading={loading}
        rowKey="id"
      />;

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminUsers;