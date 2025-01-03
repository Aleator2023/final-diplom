import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddHotelPage.css'; 

const AddHotelPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddHotel = async () => {
    try {
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Вы не авторизованы!');
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/hotels',
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess('Гостиница успешно добавлена');
        setTitle('');
        setDescription('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при добавлении гостиницы');
    }
  };

  return (
    <div className="container">
      <div className="hotel-card">
        <h2>Добавить гостиницу</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={(e) => e.preventDefault()} className="add-hotel-form">
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
            />
          </div>
          <button type="button" onClick={handleAddHotel} className="add-button">
            Добавить
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHotelPage;