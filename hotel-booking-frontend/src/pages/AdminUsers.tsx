import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  contactPhone: string;
  role: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized access');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<User[]>('http://localhost:3000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          setError('Unauthorized access, please login again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. You are not an admin.');
        } else {
          setError('Failed to fetch users');
        }
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Список пользователей</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Роль</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.contactPhone || '—'}</td>
                <td>{user.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>Нет данных</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;