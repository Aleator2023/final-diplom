import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../styles/HotelRoomsPage.css';

const HotelRoomsPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>(); // ID отеля из URL
  const [rooms, setRooms] = useState<{ id: string; description: string; images?: string[]; isEnabled: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get<{ id: string; description: string; images?: string[]; isEnabled: boolean }[]>(`http://localhost:3000/api/admin/hotel-rooms?hotelId=${hotelId}`);
        setRooms(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке номеров:', err);
        setError('Ошибка при загрузке номеров');
      }
    };
    fetchRooms();
  }, [hotelId]);

  return (
    <div className="hotel-rooms-container">
      <h1>Номера отеля</h1>
      {error && <p className="error-message">{error}</p>}

      <Link to={`/admin/hotels/${hotelId}/add-room`}>
        <button className="add-button">Добавить номер</button>
      </Link>

      <ul className="rooms-list">
        {rooms.map((room) => (
          <li key={room.id} className="room-item">
            {room.images && room.images.length > 0 && (
              <img src={room.images[0]} alt="Room" className="room-image" />
            )}
            <p>{room.description}</p>
            <p>Статус: {room.isEnabled ? 'Доступен' : 'Недоступен'}</p>
            <Link to={`/admin/hotels/${hotelId}/edit-room/${room.id}`}>
              <button className="edit-button">Редактировать</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotelRoomsPage;