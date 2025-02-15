import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Booking {
  _id: string;
  hotel?: { _id: string; title: string } | null;
  room?: { _id: string; title: string } | null;
  dateStart: string;
  dateEnd: string;
}

const ClientBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Ошибка: пользователь не найден.');
        return;
      }

      const response = await axios.get<Booking[]>(`http://localhost:3000/reservations?userId=${userId}`);
      setBookings(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      setError('Не удалось загрузить бронирования.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await axios.delete(`http://localhost:3000/reservations/${bookingId}`);
      setBookings((prevBookings) => prevBookings.filter((booking) => booking._id !== bookingId));
    } catch (err) {
      console.error('Ошибка при удалении бронирования:', err);
      setError('Не удалось удалить бронирование.');
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (bookings.length === 0) return <p>У вас нет бронирований.</p>;

  return (
    <div className="bookings-container">
      <h2>Мои бронирования</h2>
      <ul className="bookings-list">
        {bookings.map((booking) => (
          <li key={booking._id} className="booking-item">
            {booking.hotel && booking.room ? (
              <>
                <h3>{booking.hotel.title} - {booking.room.title}</h3>
                <p>Дата заезда: {new Date(booking.dateStart).toLocaleDateString()}</p>
                <p>Дата выезда: {new Date(booking.dateEnd).toLocaleDateString()}</p>
                <button className="delete-button" onClick={() => handleDelete(booking._id)}>
                  Удалить
                </button>
              </>
            ) : (
              <p className="error-message">Ошибка: данные бронирования повреждены.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientBookings;