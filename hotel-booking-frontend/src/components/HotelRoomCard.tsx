import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/EditHotelsPage.css';

interface HotelRoomCardProps {
  room: {
    _id: string;
    description: string;
    images: string[];
    isEnabled: boolean;
  };
  onEdit: () => void;
}

const HotelRoomCard: React.FC<HotelRoomCardProps> = ({ room, onEdit }) => {
  return (
    <div className="hotel-card">
      <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
        {room.images.map((img, index) => (
          <img key={index} src={img} alt={`room-${index}`} className="hotel-image" />
        ))}
      </Slider>

      <div className="hotel-info">
        <h3>{room.description}</h3>
        <p>Доступность: {room.isEnabled ? "Да" : "Нет"}</p>
      </div>

      <div className="hotel-actions">
        <button className="edit-button" onClick={onEdit}>Редактировать</button>
      </div>
    </div>
  );
};

export default HotelRoomCard;