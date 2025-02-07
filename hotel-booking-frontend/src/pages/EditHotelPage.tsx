import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/EditHotelsPage.css';
import EditHotelRoomPage from './EditHotelRoomPage';
import * as Antd from 'antd';
const { Popconfirm, Checkbox } = Antd;

interface Room {
  _id: string,
  description: string;
  images: string[];
  previewImages: any;
  newImages: File[];
  isEnabled: boolean;
  title: string;
}

const EditHotelPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>(); 
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [hotelRooms, setHotelRooms] = useState<Room[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/hotels/${hotelId}`);
        const data = response.data as { title: string; description: string; images: string[] };

        setTitle(data.title);
        setDescription(data.description);
        setExistingImages(data.images || []);
      } catch (err) {
        setError('Ошибка при загрузке данных гостиницы');
      }
    };

    fetchHotel();

    const fetchHotelRooms = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/hotels/${hotelId}/rooms`);

        setHotelRooms(response.data.map((room: Room) => ({...room, newImages: [], previewImages: [], images: room.images.map((img: string) => `http://localhost:3000/${img}`)})));
      } catch (err) {
        setError('Ошибка при загрузке данных номеров гостиницы');
      }
    };

    fetchHotelRooms();
  }, [hotelId]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);
  
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Вы не авторизованы!');
        return;
      }
  
      const formData = new FormData();
      if (title) formData.append('title', title.trim());
      if (description) formData.append('description', description);
  
      // ✅ Отправляем `existingImages` в формате относительных путей (без "localhost:3000")
      const sanitizedExistingImages = existingImages.map(img =>
        img.replace('http://localhost:3000/', '') // 👈 Убираем localhost
      );
      formData.append('existingImages', JSON.stringify(sanitizedExistingImages));
  
      // ✅ Передаем новые изображения, если они есть
      if (images.length > 0) {
        images.forEach((image) => formData.append('images', image));
      }
  
      console.log("📤 Данные перед отправкой:", Object.fromEntries(formData.entries()));
  
      const response = await axios.patch(`http://localhost:3000/hotels/${hotelId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        setSuccess('Гостиница успешно обновлена');
        const data = response.data as { images: string[] };
  
        // ✅ Обновляем `existingImages` после ответа сервера
        setExistingImages(data.images.map(img => `http://localhost:3000/${img}`)); // 👈 Добавляем полный путь
  
        setImages([]);
        setPreviewImages([]);
        navigate('/admin/all-hotels');
      }
    } catch (err: any) {
      console.error("🔥 Ошибка при обновлении гостиницы:", err.response?.data || err);
      setError(err.response?.data?.message || 'Ошибка при обновлении гостиницы');
    }
  };

  const saveRoom = async (index: number) => {
    try {
      setError(null);
      setSuccess(null);
  
      if (!token) {
        setError('Вы не авторизованы!');
        return;
      }
      
      const formData = new FormData();
      const sanitizedExistingImages = hotelRooms[index].images.map(img =>
        img.replace('http://localhost:3000/', '') // 👈 Убираем localhost
      );

      formData.append('existingImages', JSON.stringify(sanitizedExistingImages));
      formData.append('title', String(hotelRooms[index].title));
      formData.append('description', String(hotelRooms[index].description));
      formData.append('isEnabled', String(hotelRooms[index].isEnabled));
  
      if (hotelRooms[index].newImages?.length > 0) {
        hotelRooms[index].newImages.forEach((image: any) => formData.append('images', image));
      }
  
      console.log("📤 Данные перед отправкой:", Object.fromEntries(formData.entries()));
  
      const response = await axios.put(`http://localhost:3000/api/admin/hotel-rooms/${hotelRooms[index]._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        setSuccess('Гостиница успешно обновлена');
        // navigate('/admin/all-hotels');
      }
    } catch (err: any) {
      console.error("🔥 Ошибка при обновлении номера:", err.response?.data || err);
      setError(err.response?.data?.message || 'Ошибка при обновлении номера');
    }
  };
    
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]);
      setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    }
  };

  const handleRoomImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);

      let newHotelRooms = JSON.parse(JSON.stringify(hotelRooms));
      newHotelRooms[index].previewImages = files.map((file) => URL.createObjectURL(file));
      newHotelRooms[index].newImages = files;

      setHotelRooms(newHotelRooms);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
  };

  const showRooms = () => {
    setShowRoomForm(!showRoomForm);
  };

  const setRoom = (field: string, index: number, value: any) => {
    let newHotelRooms = JSON.parse(JSON.stringify(hotelRooms));
    newHotelRooms[index][field] = value;

    setHotelRooms(newHotelRooms);
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
    <div className="hotel-edit-container">
      <div className="hotel-edit-form">
        <h2>Редактировать гостиницу</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={(e) => e.preventDefault()} className="hotel-form">
          <div className="form-group">
            <label>Название отеля:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Описание отеля:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Слайдер изображений */}
          <div className="image-slider-container">
            {existingImages.length > 0 && (
              <Slider {...sliderSettings}>
                {existingImages.map((img, index) => (
                  <div key={index} className="image-slide">
                    <img src={img} alt={`existing-preview-${index}`} style={{ maxHeight: '300px', width: '100%' }} />
                    <button className="remove-image-btn" onClick={() => removeExistingImage(img)}>X</button>
                  </div>
                ))}
              </Slider>
            )}
          </div>

          {/* Превью загруженных изображений */}
          <div className="image-upload-container">
            <div className="image-preview-wrapper">
              {previewImages.map((img, index) => (
                <div key={index} className="image-preview">
                  <img src={img} alt={`preview-${index}`} />
                  <button className="remove-image-btn" onClick={() => removeImage(index)}>X</button>
                </div>
              ))}
            </div>

            <div className="image-upload">
              <input type="file" multiple onChange={handleImageChange} />
            </div>
          </div>

          {/* Кнопки */}
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSubmit}>Сохранить</button>
            <button className="cancel-btn" onClick={() => navigate('/admin/all-hotels')}>Отменить</button>
            <button className="add-room-btn" onClick={() => showRooms()}>
              ➕ Добавить номер
            </button>
          </div>
        </form>

        {/* Форма добавления номера */}
        {showRoomForm && (
          <div className="add-room-form">
            <h3>Добавить новый номер</h3>
            <EditHotelRoomPage />
          </div>
        )}
      </div>

      {hotelRooms.map((room: Room, index) => (
        <div key={index} className="hotel-edit-form">
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {existingImages.length > 0 && (
              room.images.map((img, imagesIndex) => (
                <div key={imagesIndex} style={{ position: 'relative' }}>
                  <img src={img} alt={`room-preview-${imagesIndex}`} style={{ maxHeight: '200px', width: '100%' }} />

                  <Popconfirm
                    title="Вы уверены, что хотите удалить изображение?"
                    onConfirm={async () => {
                      try {
                        let newHotelRooms = JSON.parse(JSON.stringify(hotelRooms));
                        newHotelRooms[index].images = newHotelRooms[index].images.filter(item => item !== img);
                        
                        setHotelRooms(newHotelRooms);
                      } catch (error: any) {
                        console.error('Ошибка при удалении изображения:', error);
                      }
                    }}
                    onCancel={() => {}}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <button style={{ position: 'absolute', right: 2, top: 2 }}>X</button>
                  </Popconfirm>
                </div>
              ))
            )}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="hotel-form">
            <div className="form-group">
              <label>Название номера</label>
              <input type="text" value={room.title} onChange={(e) => setRoom('title', index, e.target.value)} />
            </div>

            <div className="form-group">
              <label>Описание номера</label>
              <textarea value={room.description} onChange={(e) => setRoom('description', index, e.target.value)} />
            </div>

            <Checkbox checked={room.isEnabled} onChange={(e) => setRoom('isEnabled', index, Boolean(e.target.checked))} style={{ display: 'flex' }}>Доступность</Checkbox>

            {hotelRooms[index].previewImages && hotelRooms[index].previewImages.map((img: string, index: number) => (
              <div key={index} className="image-preview">
                <img src={img} alt={`preview-${index}`} />
              </div>
            ))}

            <input type="file" multiple onChange={(e) => handleRoomImageChange(e, index)} />

            <div className="action-buttons">
              <button className="save-btn" onClick={() => saveRoom(index)}>Сохранить</button>

              <Popconfirm
                title="Вы уверены, что хотите удалить номер?"
                onConfirm={async () => {
                  setHotelRooms(hotelRooms.filter((_, i) => i !== index));

                  try {
                    await axios.delete(`http://localhost:3000/api/admin/hotel-rooms/${hotelRooms[index]._id}`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
                  } catch (err: any) {
                    console.error("🔥 Ошибка при удалении номера:", err.response?.data || err);
                    setError(err.response?.data?.message || 'Ошибка при удалении номера');
                  }
                }}
                onCancel={() => {}}
                okText="Да"
                cancelText="Нет"
              >
                <button className="cancel-btn" onClick={() => {}}>Удалить</button>
              </Popconfirm>

              <button className="cancel-btn" onClick={() => navigate('/admin/all-hotels')}>Отменить</button>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
};

export default EditHotelPage;