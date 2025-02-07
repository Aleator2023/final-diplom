import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/support-chat';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

const ChatManagerClients = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [managerName, setManagerName] = useState('');
  const [clients, setClients] = useState({});
  const [selectedClientName, setSelectedClientName] = useState('');

  useEffect(() => {
    const fetchManager = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');

      if (storedUserId && storedToken) {
        try {
          const { data } = await axios.get(`http://localhost:3000/users/${storedUserId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setManagerName(`${data.name || ''} ${data.surname || ''}`.trim());
        } catch (error) {
          console.error('Ошибка загрузки данных менеджера:', error);
        }
      }
    };
    fetchManager();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(API_BASE_URL);
        setChats(data);

        const clientData = await Promise.all(
          data.map(async (chat) => {
            if (!chat.user) return { id: chat.user, name: 'Неизвестный пользователь' };
            try {
              const response = await axios.get(`http://localhost:3000/users/${chat.user}`);
              return { id: chat.user, name: `${response.data.name} ${response.data.surname}`.trim() };
            } catch (error) {
              return { id: chat.user, name: 'Неизвестный пользователь' };
            }
          })
        );

        const clientMap = {};
        clientData.forEach(client => {
          if (client.id) {
            clientMap[client.id] = client.name;
          }
        });
        setClients(clientMap);
      } catch (error) {
        console.error('Ошибка загрузки списка чатов:', error);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      axios.get(`${API_BASE_URL}/${selectedChat}/messages`).then(({ data }) => setMessages(data));
      setSelectedClientName(clients[selectedChat] || 'Неизвестный пользователь');
    }
  }, [selectedChat, clients]);

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
      try {
        const newMessage = { author: managerName, text: message };
        setMessages(prev => [...prev, newMessage]);
        await axios.post(`${API_BASE_URL}/${selectedChat}/messages`, newMessage);
        setMessage('');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  };

  const deleteChat = async () => {
    if (!selectedChat) return;

    try {
      await axios.delete(`${API_BASE_URL}/${selectedChat}`);
      setChats(chats.filter(chat => chat._id !== selectedChat));
      setSelectedChat(null);
      setMessages([]);
    } catch (error) {
      console.error('Ошибка при удалении чата:', error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '20px' }}>
        <h3>Список чатов</h3>
        <ul>
          {chats.map(chat => (
            <li key={chat._id} onClick={() => setSelectedChat(chat._id)}>
              Чат с {clients[chat.user] || 'Неизвестным пользователем'}
            </li>
          ))}
        </ul>
      </div>
      {selectedChat && (
        <div style={{ flex: 2, padding: '20px', borderLeft: '1px solid #ccc' }}>
          <h3>Чат с клиентом {selectedClientName}</h3>
          <button onClick={deleteChat} style={{ marginBottom: '10px', backgroundColor: 'red', color: 'white' }}>
            Удалить чат
          </button>
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