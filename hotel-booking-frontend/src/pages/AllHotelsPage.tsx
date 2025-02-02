import React, { useEffect, useState } from 'react';

interface Hotel {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

const AllHotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('http://localhost:3000/hotels');
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        setHotels(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Все гостиницы</h1>
      
      {loading && <p style={styles.loading}>Загрузка...</p>}
      {error && <p style={styles.error}>Ошибка: {error}</p>}

      {!loading && !error && (
        <ul style={styles.hotelList}>
          {hotels.map((hotel) => (
            <li key={hotel._id} style={styles.hotelCard}>
              <h2>{hotel.title}</h2>
              <p>{hotel.description}</p>
              <small>{new Date(hotel.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 📌 Стилизация
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  hotelList: {
    listStyle: 'none',
    padding: 0,
  },
  hotelCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  },
};

export default AllHotelsPage;