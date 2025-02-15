import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

interface Reservation {
  dateStart: string;
  dateEnd: string;
}

interface HotelRoom {
  _id: string;
  title: string;
  hotel: string; // Здесь будет `hotelId`
}

const ClientProcessBooking: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      try {
        // 1️⃣ Получаем данные о номере, чтобы узнать hotelId
        const roomResponse = await axios.get<HotelRoom>(`http://localhost:3000/hotels/rooms/${roomId}`);
        setHotelId(roomResponse.data.hotel);

        // 2️⃣ Загружаем занятые даты
        const reservationsResponse = await axios.get<Reservation[]>(`http://localhost:3000/reservations?roomId=${roomId}`);
        
        // Преобразуем бронирования в массив занятых дат
        const reserved = reservationsResponse.data.flatMap(reservation => {
          const start = new Date(reservation.dateStart);
          const end = new Date(reservation.dateEnd);
          const days = [];
          for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
          }
          return days;
        });

        setBookedDates(reserved);
      } catch (err: any) {
        setError('Ошибка при загрузке данных о номере или бронированиях');
      }
    };

    fetchRoomData();
  }, [roomId]);

  const isDateDisabled = (date: Date) => bookedDates.some(d => d.toDateString() === date.toDateString());

  const handleBooking = async () => {
    if (!selectedDates[0] || !selectedDates[1]) {
      setError('Выберите даты!');
      return;
    }

    const userId = localStorage.getItem('userId');

    if (!userId) {
      setError('Ошибка: пользователь не найден!');
      return;
    }

    if (!hotelId) {
      setError('Ошибка: гостиница не найдена!');
      return;
    }

    try {
      await axios.post('http://localhost:3000/reservations', {
        hotelId,
        roomId,
        userId,
        dateStart: selectedDates[0].toISOString(),
        dateEnd: selectedDates[1].toISOString(),
      });

      navigate('/client/my-bookings');
    } catch (err: any) {
      setError('Ошибка при бронировании номера');
    }
  };

  return (
    <div className="booking-container">
      <h1>Выберите даты для бронирования</h1>
      {error && <p className="error-message">{error}</p>}
      <Calendar
        selectRange
        tileDisabled={({ date }) => isDateDisabled(date)}
        onChange={(dates) => setSelectedDates(dates as [Date | null, Date | null])}
      />
      <button className="book-button" onClick={handleBooking}>Забронировать</button>
    </div>
  );
};

export default ClientProcessBooking;