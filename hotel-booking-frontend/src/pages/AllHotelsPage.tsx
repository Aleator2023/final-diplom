import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/AllHotelsPage.css'; 

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <div className="hotels-container">
      <div className="hotels-header">
        <h1>Список гостиниц</h1>
        <Link to="/admin/add-hotel">
          <button className="add-button">Добавить гостиницу</button>
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="hotels-list">
        {hotels.map((hotel) => (
          <div key={hotel._id} className="hotel-card">
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
              <h3>{hotel.title}</h3>
              <p>{hotel.description}</p>
            </div>
            <div className="hotel-actions">
              <Link to={`/admin/hotels/${hotel._id}`}>
                <button className="edit-button">Редактировать</button>
              </Link>
              <button className="delete-button" onClick={() => deleteHotel(hotel._id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllHotelsPage;