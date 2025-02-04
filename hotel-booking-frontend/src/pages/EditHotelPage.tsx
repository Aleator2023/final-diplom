import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditHotelsPage.css';

const EditHotelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/hotels/${id}`);
        const data = response.data as { title: string; description: string; images: string[] };
        setTitle(data.title);
        setDescription(data.description);
        
        // ✅ Преобразуем пути изображений, добавляя `/uploads/hotels/`
        setExistingImages(data.images || []);
      } catch (err) {
        setError('Ошибка при загрузке данных гостиницы');
      }
    };
    fetchHotel();
  }, [id]);

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
      formData.append('title', title.trim());
      formData.append('description', description);
      images.forEach((image) => formData.append('images', image));

      const response = await axios.put(`http://localhost:3000/hotels/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSuccess('Гостиница успешно обновлена');
        navigate('/admin/all-hotels');
      }
    } catch (err: any) {
      console.error("🔥 Ошибка при обновлении гостиницы:", err.response?.data || err);
      setError(err.response?.data?.message || 'Ошибка при обновлении гостиницы');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]);
      setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !==

index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
  };

  return (
    <div className="hotel-edit-container">
      {/* Основной блок редактирования */}
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

          {/* Блок загрузки изображений */}
          <div className="image-upload-container">
            {existingImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img} alt={`existing-preview-${index}`} />
                <button className="remove-image-btn" onClick={() => removeExistingImage(img)}>X</button>
              </div>
            ))}

            {previewImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img} alt={`preview-${index}`} />
                <button className="remove-image-btn" onClick={() => removeImage(index)}>X</button>
              </div>
            ))}

            <div className="image-upload">
              <input type="file" multiple onChange={handleImageChange} />
            </div>
          </div>

          {/* Кнопки */}
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSubmit}>Сохранить</button>
            <button className="cancel-btn" onClick={() => navigate('/admin/all-hotels')}>Отменить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHotelPage;