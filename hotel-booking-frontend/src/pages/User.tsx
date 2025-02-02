import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as Antd from 'antd';
const { Table } = Antd;
import { getUser } from '../services/api'; 

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

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: 'Отель',
    dataIndex: 'name',
    render: (text: string, record: Hotel) => (
      <Link to={`/admin/all-hotels/${record.id}`}>
        {text}
      </Link>
    ),
  },
  {
    title: 'Даты заезда',
    dataIndex: 'arrivalDates',
  },
  {
    title: 'Дата выезда',
    dataIndex: 'departureDate',
  },
];

const User: React.FC = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchUser = async () => {
    try {
      setLoading(true);
      const res = await getUser(id || '');
      setUser(res);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if(id) {
      handleFetchUser();
    }

    // !!! Only for testing. Remove it for production !!!
    setHotels([
      {
        id: '679d0e01ca5e47a7b05ae1qw',
        name: 'hotel-1',
        arrivalDates: new Date().toLocaleDateString(),
        departureDate: new Date().toLocaleDateString(),
      },
      {
        id: '679d128b37a186fbc26bdfdq',
        name: 'hotel-2',
        arrivalDates: new Date().toLocaleDateString(),
        departureDate: new Date().toLocaleDateString(),
      },
      {
        id: '679d129a37a186fbc26bdfzx',
        name: 'hotel-3',
        arrivalDates: new Date().toLocaleDateString(),
        departureDate: new Date().toLocaleDateString(),
      },
      {
        id: '679d13d837a186fbc26bdfaa',
        name: 'hotel-4',
        arrivalDates: new Date().toLocaleDateString(),
        departureDate: new Date().toLocaleDateString(),
      },
      {
        id: '679d7b690b51e96230c52bqa',
        name: 'hotel-5',
        arrivalDates: new Date().toLocaleDateString(),
        departureDate: new Date().toLocaleDateString(),
      },
    ])
  }, [id]);

  return (
    <div>
      {loading && <p>Loading...</p>}

      <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '20px'}}>
        <h1>{user?.name || 'User not found'}</h1>

        <Table
          dataSource={hotels} 
          columns={columns}
          loading={loading}
          rowKey="id"
        />;
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
};

export default User;
