import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditHotelRoomPage.css';

const EditHotelRoomPage: React.FC = () => {
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId?: string }>(); // ID отеля и комнаты
  const navigate = useNavigate();
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
          const response = await axios.get(`http://localhost:3000/api/admin/hotel-rooms/${roomId}`);
          const data = response.data as { description: string; isEnabled: boolean; images: string[] };
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

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Вы не авторизованы!');
        return;
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('hotelId', hotelId || '');
      formData.append('isEnabled', String(isEnabled));
      images.forEach((image) => formData.append('images', image));

      let response;
      if (isEditMode) {
        response = await axios.put(`http://localhost:3000/api/admin/hotel-rooms/${roomId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post(`http://localhost:3000/api/admin/hotel-rooms`, formData, {
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
        <label>Описание:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Доступность:</label>
        <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
      </div>

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