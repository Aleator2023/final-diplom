import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Spin } from 'antd'; 
import Typography  from 'antd/es/typography';
import { ColumnsType } from 'antd/es/table';
import { getUser } from '../services/api';

const { Title } = Typography; 
// ✅ Теперь Title корректно импортируется

interface User {
  id: string;
  email: string;
  name: string;
  contactPhone: string;
  role: string;
}

interface Hotel {
  id: string;
  name: string;
  arrivalDates: string;
  departureDate: string;
}

const columns: ColumnsType<Hotel> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Отель',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => <Link to={`/admin/hotels/${record.id}`}>{text}</Link>,
  },
  {
    title: 'Даты заезда',
    dataIndex: 'arrivalDates',
    key: 'arrivalDates',
  },
  {
    title: 'Дата выезда',
    dataIndex: 'departureDate',
    key: 'departureDate',
  },
];

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUser(id);
        setUser(res);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // !!! Только для тестов. Убрать в продакшене !!!
    setHotels([
      { id: '679d0e01', name: 'Hotel-1', arrivalDates: new Date().toLocaleDateString(), departureDate: new Date().toLocaleDateString() },
      { id: '679d128b', name: 'Hotel-2', arrivalDates: new Date().toLocaleDateString(), departureDate: new Date().toLocaleDateString() },
      { id: '679d129a', name: 'Hotel-3', arrivalDates: new Date().toLocaleDateString(), departureDate: new Date().toLocaleDateString() },
      { id: '679d13d8', name: 'Hotel-4', arrivalDates: new Date().toLocaleDateString(), departureDate: new Date().toLocaleDateString() },
      { id: '679d7b69', name: 'Hotel-5', arrivalDates: new Date().toLocaleDateString(), departureDate: new Date().toLocaleDateString() },
    ]);
  }, [id]);

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Title level={2}>{user?.name || 'Пользователь не найден'}</Title> {/* ✅ Ошибок больше нет */}

      <Table
        dataSource={hotels}
        columns={columns}
        rowKey={(record) => record.id}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UserPage;