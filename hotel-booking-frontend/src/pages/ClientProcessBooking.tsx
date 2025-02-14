import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

interface Reservation {
  dateStart: string;
  dateEnd: string;
}

const ClientProcessBooking: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchBookedDates = async () => {
      try {
        const response = await axios.get<Reservation[]>(`http://localhost:3000/reservations?roomId=${roomId}`);
        const reserved = response.data.flatMap(reservation => {
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
        setError('Ошибка при загрузке данных о бронированиях');
      }
    };

    fetchBookedDates();
  }, [roomId]);

  const isDateDisabled = (date: Date) => bookedDates.some(d => d.toDateString() === date.toDateString());

  const handleBooking = async () => {
    if (!selectedDates[0] || !selectedDates[1]) {
      setError('Выберите даты!');
      return;
    }

    try {
      await axios.post('http://localhost:3000/reservations', {
        roomId,
        dateStart: selectedDates[0].toISOString(),
        dateEnd: selectedDates[1].toISOString(),
      });
      navigate('/success');
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