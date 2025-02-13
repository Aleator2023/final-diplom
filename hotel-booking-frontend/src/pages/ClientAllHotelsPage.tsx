import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/ClientAllHotelsPage.css'; 
import { getHotels } from '../services/api';
import * as Antd from 'antd';
const { Input, DatePicker, } = Antd;
const { Search } = Input;
import type { GetProps } from 'antd';
const { RangePicker } = DatePicker;


type SearchProps = GetProps<typeof Input.Search>;

const ClientAllHotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<{ _id: string; title: string; description: string; images?: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHotels = async (search?: string, checkIn?: Date | null, checkOut?: Date | null) => {
    try {
      const response = search || checkIn || checkOut 
        ? await getHotels(search, checkIn, checkOut) 
        : await axios.get<{ _id: string; title: string; description: string; images?: string[] }[]>('http://localhost:3000/hotels');
  
      const hotelsData = Array.isArray(response) ? response : response.data; // Проверка структуры ответа
  
      setHotels(hotelsData.map(item => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        images: item.images && item.images.length > 0 ? item.images : ['/default-hotel-image.jpg'], // Добавлена проверка
      })));
    } catch (err) {
      console.error('Ошибка при загрузке гостиниц:', err);
      setError('Ошибка при загрузке гостиниц');
    }
  };


  useEffect(() => {
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

  const handleFetchHotels = async (search?: string, checkIn?: Date | null, checkOut?: Date | null) => {
    try {
      setLoading(true);
      fetchHotels(search, checkIn, checkOut);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const onSearch: SearchProps['onSearch'] = (value: string) => {
    handleFetchHotels(value);
  };

  const changeDates = (dates: [Date | null, Date | null] | null) => {

  // const changeDates = (dates: [Date | null, Date | null] | null) => {
    if (dates) {
      handleFetchHotels(undefined, dates[0], dates[1]);
    } else {
      // Сброс фильтрации, если даты очищены
      handleFetchHotels();
    }
  };

  return (
    <div className="hotels-container">
      <div className='search-container'>
        <Search placeholder="Введите имя гостиницы" onSearch={onSearch} style={{ width: 400 }} size="large" />
        <RangePicker format="DD/MM/YYYY" placeholder={['Дата заезда', 'Дата выезда']} size='large' onChange={changeDates} />
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
                <button className="edit-button">Забронировать</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientAllHotelsPage;