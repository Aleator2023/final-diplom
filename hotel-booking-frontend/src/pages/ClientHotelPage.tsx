import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/AllHotelsPage.css';

interface Hotel {
  _id: string;
  title: string;
  description: string;
  images?: string[];
}

interface HotelRoom {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
}

const ClientHotelPage: React.FC = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!hotelId) return;
    
    console.log("🔍 Проверяем hotelId:", hotelId);

    const fetchHotelData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Запрашиваем отель
        const hotelResponse = await axios.get<Hotel>(`http://localhost:3000/hotels/${hotelId}`);
        setHotel(hotelResponse.data);

        // 2️⃣ Запрашиваем номера
        const roomsResponse = await axios.get(`http://localhost:3000/hotels/${hotelId}/rooms`);

        // 3️⃣ Исправляем URL изображений номеров
        const roomsWithFullImages = (roomsResponse.data as HotelRoom[]).map((room: HotelRoom) => ({
          ...room,
          images: room.images?.map(img => img.startsWith('http') ? img : `http://localhost:3000/${img}`) || [],
        }));

        setRooms(roomsWithFullImages);
      } catch (err: any) {
        console.error('❌ Ошибка при загрузке данных:', err);
        if (err.response?.status === 404) {
          setError('Данные не найдены');
        } else {
          setError(err.response?.data?.message || 'Ошибка при загрузке данных');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelId]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!hotel) return <p>Гостиница не найдена</p>;

  return (
    <div className="hotel-container">
      {/* Информация о гостинице */}
      {hotel.images && hotel.images.length > 0 && (
        <Slider {...sliderSettings} className="hotel-slider">
          {hotel.images.map((img, index) => (
            <div key={index}>
              <img src={img} alt={`Гостиница ${hotel.title}`} className="hotel-image" />
            </div>
          ))}
        </Slider>
      )}

      <div className="hotel-info">
        <h1>{hotel.title}</h1>
        <p>{hotel.description}</p>
      </div>

      {/* Список номеров */}
      {rooms.length > 0 && <h2>Доступные номера</h2>}
      <div className="hotel-rooms">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room._id} className="room-card">
              {room.images && room.images.length > 0 && (
                <Slider {...sliderSettings} className="room-slider">
                  {room.images.map((img, index) => (
                    <div key={index}>
                      <img src={img} alt={`Номер ${room.title}`} className="room-image" />
                    </div>
                  ))}
                </Slider>
              )}
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <p className="room-price">Цена: {room.price}₽</p>
              <button className="book-button">Забронировать</button>
            </div>
          ))
        ) : (
          <p>Номера отсутствуют</p>
        )}
      </div>
    </div>
  );
};

export default ClientHotelPage;