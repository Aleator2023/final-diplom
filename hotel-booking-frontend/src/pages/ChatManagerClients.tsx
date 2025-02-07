import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/support-chat';
const socket = io('http://localhost:3000');

const ChatManagerClients = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await axios.get(API_BASE_URL);
      setChats(data);
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      axios.get(`${API_BASE_URL}/${selectedChat}/messages`).then(({ data }) => setMessages(data));
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message', (supportRequest, newMessage) => {
      if (supportRequest._id === selectedChat) {
        setMessages(prev => [...prev, newMessage]);
      }
    });
    return () => socket.off('message');
  }, [selectedChat]);

  const sendMessage = async () => {
    if (message.trim() && selectedChat) {
      await axios.post(`${API_BASE_URL}/${selectedChat}/messages`, { author: 'manager', text: message });
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Чат с клиентами</h2>
      <div>
        <h3>Список чатов</h3>
        <ul>
          {chats.map(chat => (
            <li key={chat._id} onClick={() => setSelectedChat(chat._id)}>
              Чат с пользователем {chat.user}
            </li>
          ))}
        </ul>
      </div>
      {selectedChat && (
        <div>
          <h3>Сообщения</h3>
          <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}>
            {messages.map((msg, index) => (
              <p key={index}><strong>{msg.author}</strong>: {msg.text}</p>
            ))}
          </div>
          <input value={message} onChange={e => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Отправить</button>
        </div>
      )}
    </div>
  );
};

export default ChatManagerClients;
