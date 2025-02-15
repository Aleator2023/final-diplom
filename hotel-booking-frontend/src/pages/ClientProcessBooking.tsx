import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

interface Reservation {
    dateStart: string;
    dateEnd: string;
    room?: { _id: string } | null;
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
          if (!roomId) {
            setError('Ошибка: ID номера не найден');
            return;
          }
      
          // 🟢 Запрос информации о номере
          let roomResponse;
          try {
            roomResponse = await axios.get<HotelRoom>(`http://localhost:3000/hotels/rooms/${roomId}`);
          } catch (err: any) {
            if (err.response?.status === 404) {
              setError('Ошибка: номер не найден в базе данных');
              return;
            }
            throw err;
          }
      
          setHotelId(roomResponse.data.hotel);
      
          // 🟢 Загружаем бронирования ТОЛЬКО для этого номера
          const reservationsResponse = await axios.get<Reservation[]>(`http://localhost:3000/reservations?roomId=${roomId}`);
      
          // ✅ Теперь фильтруем бронирования правильно
          const reserved = reservationsResponse.data
            .filter(reservation => reservation.room && (reservation.room as any)._id === roomId) // 🎯 Сравниваем `room._id`
            .flatMap(reservation => {
              const start = new Date(reservation.dateStart);
              const end = new Date(reservation.dateEnd);
              const days = [];
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                days.push(new Date(d));
              }
              return days;
            });
      
          setBookedDates(reserved);
        } catch (err) {
          console.error('Ошибка при загрузке данных о номере:', err);
          setError('Ошибка при загрузке данных о номере или бронированиях');
        }
      };


    fetchRoomData();
  }, [roomId]); // Запускаем useEffect при смене номера (roomId)

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
    } catch (err) {
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