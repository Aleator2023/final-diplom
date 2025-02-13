import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditHotelRoomPage.css';
import * as Antd from 'antd';

const { Checkbox } = Antd;

const EditHotelRoomPage: React.FC = () => {
  const params = useParams();
  const hotelId = params.hotelId;
  const roomId = params.roomId;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isEditMode = Boolean(roomId);

  useEffect(() => {
    if (isEditMode) {
      const fetchRoom = async () => {
        try {
          console.log("Запрос данных номера:", `http://localhost:3000/api/admin/hotel-rooms/${roomId}`);
          const response = await axios.get(`http://localhost:3000/api/admin/hotel-rooms/${roomId}`);
          const data = response.data as { title: string; description: string; isEnabled: boolean; images: string[] };
          
          setTitle(data.title);
          setDescription(data.description);
          setIsEnabled(data.isEnabled);
          setExistingImages(data.images || []);
        } catch (err) {
          setError('Ошибка при загрузке данных номера');
        }
      };
      fetchRoom();
    }
  }, [roomId, isEditMode]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);
  
      if (!hotelId) {
        setError('Ошибка: hotelId отсутствует!');
        return;
      }
  
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Вы не авторизованы!');
        return;
      }
  
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('hotelId', hotelId);
      formData.append('isEnabled', String(isEnabled));
  
      // ✅ Исправляем existingImages (преобразуем в JSON, чтобы избежать строкового представления)
      existingImages.forEach((image) => formData.append('existingImages', image));
  
      // ✅ Добавляем новые изображения
      images.forEach((image) => formData.append('images', image));
  
      console.log("📤 Отправка данных:", Object.fromEntries(formData.entries()));
  
      let response;
      if (isEditMode) {
        response = await axios.put(`http://localhost:3000/api/admin/hotel-rooms/${roomId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post(`http://localhost:3000/api/admin/hotel-rooms/${hotelId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }
  
      if (response.status === (isEditMode ? 200 : 201)) {
        setSuccess(isEditMode ? 'Номер успешно обновлён' : 'Номер успешно добавлен');
        navigate(`/admin/hotels/${hotelId}/rooms`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении номера');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]);
      setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    }
  };

  return (
    <div className="room-edit-container">
      <h2>{isEditMode ? 'Редактировать номер' : 'Добавить номер'}</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="form-group">
        <label>Название номера:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Описание:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <Checkbox checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)}>Доступность</Checkbox>

      <div className="image-upload-container">
        {existingImages.map((img, index) => (
          <div key={index} className="image-preview">
            <img src={img} alt={`existing-preview-${index}`} />
          </div>
        ))}

        {previewImages.map((img, index) => (
          <div key={index} className="image-preview">
            <img src={img} alt={`preview-${index}`} />
          </div>
        ))}

        <input type="file" multiple onChange={handleImageChange} />
      </div>

      <button className="save-btn" onClick={handleSubmit}>{isEditMode ? 'Сохранить' : 'Добавить'}</button>
    </div>
  );
};

export default EditHotelRoomPage;