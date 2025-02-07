import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/support-chat';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

const ChatClientSupport = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [userName, setUserName] = useState(''); // Имя и фамилия пользователя

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');
  
      if (storedUserId && storedToken) {
        try {
          const { data } = await axios.get(`http://localhost:3000/users/${storedUserId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          console.log("Полученные данные пользователя:", data); // Логируем ответ
          setUserName(`${data.name || ''} ${data.surname || ''}`.trim());
        } catch (error) {
          console.error("Ошибка загрузки пользователя:", error);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userName) return;

    const fetchChat = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}?user=123`);
        if (data.length > 0) {
          setChatId(data[0]._id);
          setMessages(data[0].messages);
        } else {
          const { data: newChat } = await axios.post(API_BASE_URL, { user: '123', text: 'Начало чата', userName });
          setChatId(newChat._id);
          setMessages(newChat.messages);
        }
      } catch (error) {
        console.error("Ошибка загрузки чата:", error);
      }
    };
    fetchChat();
  }, [userName]);

  useEffect(() => {
    socket.on('message', (supportRequest, newMessage) => {
      if (supportRequest._id === chatId) {
        setMessages(prev => [...prev, newMessage]);
      }
    });
    return () => socket.off('message');
  }, [chatId]);

  const sendMessage = async () => {
    if (message.trim() && chatId) {
      try {
        console.log("Отправляем сообщение от:", userName);
        const newMessage = { author: userName, text: message };
        setMessages(prev => [...prev, newMessage]); // Обновление состояния сразу
        await axios.post(`${API_BASE_URL}/${chatId}/messages`, newMessage);
        setMessage('');
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
      }
    }
  };

  const clearChat = async () => {
    if (!chatId) return;
  
    try {
      await axios.delete(`${API_BASE_URL}/${chatId}/clear`);
      setMessages([]);
    } catch (error) {
      console.error("Ошибка при очистке чата:", error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
        <h2>Здравствуйте, {userName || "Гость"}!</h2>
      </div>
      <div style={{ flex: 2, padding: '20px', borderLeft: '1px solid #ccc' }}>
        <h2>Чат с техподдержкой</h2>
        <button onClick={clearChat} style={{ marginBottom: '10px', backgroundColor: 'red', color: 'white' }}>
          Очистить чат
        </button>
        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}>
          {messages.map((msg, index) => (
            <p key={index}><strong>{msg.userName || msg.author || "Неизвестный"}</strong>: {msg.text}</p>
          ))}
        </div>
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={() => sendMessage()}>Отправить</button>
      </div>
    </div>
  );
};

export default ChatClientSupport;
