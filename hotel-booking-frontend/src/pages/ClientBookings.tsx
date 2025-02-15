import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface Booking {
  _id: string;
  hotelId?: string;
  roomId?: string;
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
    const fetchBookings = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log("🔍 userId:", userId); // Проверяем, что userId не null

        if (!userId) {
          setError('Ошибка: пользователь не найден.');
          return;
        }

        const response = await axios.get<Booking[]>(`http://localhost:3000/reservations?userId=${userId}`);
        const reservations = response.data;

        // Загружаем данные об отелях и номерах
        const hotelRequests = reservations.map((booking) =>
          booking.hotelId ? axios.get(`http://localhost:3000/hotels/${booking.hotelId}`).catch(() => null) : null
        );
        const roomRequests = reservations.map((booking) =>
          booking.roomId ? axios.get(`http://localhost:3000/hotel-rooms/${booking.roomId}`).catch(() => null) : null
        );

        const hotelResponses = await Promise.all(hotelRequests);
        const roomResponses = await Promise.all(roomRequests);

        // Формируем обновленные бронирования
        const updatedBookings = reservations.map((booking, index) => ({
          ...booking,
          hotel: hotelResponses[index]?.data ?? null,
          room: roomResponses[index]?.data ?? null,
        }));

        console.log("✅ Обновленные бронирования:", updatedBookings); // Проверяем данные перед рендерингом
        setBookings(updatedBookings);
      } catch (err) {
        console.error('Ошибка при загрузке бронирований:', err);
        setError('Не удалось загрузить бронирования.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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