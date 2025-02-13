import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/AllHotelsPage.css';

const ClientHotelPage: React.FC = () => {
  const { hotelId } = useParams(); // Получаем hotelId из URL
  const [hotel, setHotel] = useState<{ _id: string; title: string; description: string; images?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!hotelId) return;
    
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/hotels/${hotelId}`);
        setHotel(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке гостиницы:', err);
        setError('Ошибка при загрузке гостиницы');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
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
      {/* Слайдер изображений */}
      {hotel.images && hotel.images.length > 0 && (
        <Slider {...sliderSettings} className="hotel-slider">
          {hotel.images.map((img, index) => (
            <div key={index}>
              <img src={img} alt={`hotel-${hotel._id}-${index}`} className="hotel-image" />
            </div>
          ))}
        </Slider>
      )}

      <div className="hotel-info">
        <h1>{hotel.title}</h1>
        <p>{hotel.description}</p>
      </div>

      <div className="hotel-actions">
        <button className="edit-button">Забронировать</button>
      </div>
    </div>
  );
};

export default ClientHotelPage;