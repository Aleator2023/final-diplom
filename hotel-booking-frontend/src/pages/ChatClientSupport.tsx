import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/support-chat';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

const ChatClientSupport = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const fetchChat = async () => {
      const { data } = await axios.get(`${API_BASE_URL}?user=123`); // заменить на актуальный user ID
      if (data.length > 0) {
        setChatId(data[0]._id);
        setMessages(data[0].messages);
      } else {
        const { data: newChat } = await axios.post(API_BASE_URL, { user: '123', text: 'Начало чата' });
        setChatId(newChat._id);
        setMessages(newChat.messages);
      }
    };
    fetchChat();
  }, []);

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
      await axios.post(`${API_BASE_URL}/${chatId}/messages`, { author: '123', text: message });
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Чат с техподдержкой</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.author}</strong>: {msg.text}</p>
        ))}
      </div>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Отправить</button>
    </div>
  );
};

export default ChatClientSupport;
