import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from "react-slick";  // ✅ Используется для отображения изображений отеля
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/EditHotelsPage.css';
import HotelRoomCard from '../components/HotelRoomCard';

const EditHotelWithRoomsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showRoomForm, setShowRoomForm] = useState(false);

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        const hotelResponse = await axios.get(`http://localhost:3000/hotels/${id}`);
        const hotelData = hotelResponse.data as { title: string; description: string; images?: string[] };

        setTitle(hotelData.title);
        setDescription(hotelData.description);
        setExistingImages(hotelData.images || []);

        const roomsResponse = await axios.get<any[]>(`http://localhost:3000/hotels/${id}/rooms`);
        setRooms(roomsResponse.data);
      } catch (err) {
        console.error("Ошибка при загрузке гостиницы и номеров:", err);
      }
    };
    fetchHotelAndRooms();
  }, [id]);

  return (
    <div className="hotels-container">
      <div className="hotel-edit-form">
        <h2>Редактировать гостиницу</h2>

        <div className="hotel-images-container">
          {existingImages.length > 0 && (
            <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
              {existingImages.map((img, index) => (
                <div key={index}>
                  <img src={img} alt={`hotel-${index}`} className="hotel-image" />
                </div>
              ))}
            </Slider>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="hotel-form">
          <div className="form-group">
            <label>Название отеля:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Описание отеля:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button className="save-btn">Сохранить</button>
          <button className="cancel-btn" onClick={() => navigate('/admin/all-hotels')}>Отменить</button>
          <button className="add-room-btn" onClick={() => setShowRoomForm(!showRoomForm)}>
            ➕ Добавить номер
          </button>
        </form>
      </div>

      <div className="hotels-list">
        {rooms.map((room) => (
          <HotelRoomCard key={room._id} room={room} onEdit={() => navigate(`/admin/hotels/${id}/rooms/${room._id}`)} />
        ))}
      </div>
    </div>
  );
};

export default EditHotelWithRoomsPage;