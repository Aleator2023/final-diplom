import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AllHotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<{ _id: string; title: string; description: string; images?: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get<{ _id: string; title: string; description: string; images?: string[] }[]>('http://localhost:3000/hotels');
        setHotels(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке гостиниц:', err);
        setError('Ошибка при загрузке гостиниц');
      }
    };
    fetchHotels();
  }, []);

  const deleteHotel = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту гостиницу?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels((prevHotels) => prevHotels.filter((hotel) => hotel._id !== id));
    } catch (err) {
      console.error('Ошибка при удалении гостиницы:', err);
      setError('Ошибка при удалении гостиницы');
    }
  };

  return (
    <div className="container">
      <h1>Список гостиниц</h1>
      {error && <p className="error-message">{error}</p>}
      
      <Link to="/admin/add-hotel">
        <button className="add-button">Добавить гостиницу</button>
      </Link>

      <ul className="hotel-list">
        {hotels.map((hotel) => (
          <li key={hotel._id} className="hotel-item">
            {hotel.images && hotel.images.length > 0 && <img src={hotel.images[0]} alt={hotel.title} className="hotel-image" />}
            <h3>{hotel.title}</h3>
            <p>{hotel.description}</p>
            <Link to={`/hotels/edit/${hotel._id}`}>
              <button className="edit-button">Редактировать</button>
            </Link>
            <button className="delete-button" onClick={() => deleteHotel(hotel._id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllHotelsPage;