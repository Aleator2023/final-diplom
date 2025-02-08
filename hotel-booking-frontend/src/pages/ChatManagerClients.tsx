import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/support-chat';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

interface User {
  _id: string;
  name?: string;
  surname?: string;
}

interface Chat {
  _id: string;
  user: string;
}

interface Message {
  author: string;
  text: string;
}

const ChatManagerClients = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [clients, setClients] = useState<Record<string, string>>({});
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  useEffect(() => {
    const fetchManager = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');
      if (storedUserId && storedToken) {
        try {
          const response = await axios.get<User>(`http://localhost:3000/users/${storedUserId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setManagerName(`${response.data.name || ''} ${response.data.surname || ''}`.trim());
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
        const response = await axios.get<Chat[]>(API_BASE_URL);
        setChats(response.data);

        const clientData = await Promise.all(
          response.data.map(async (chat) => {
            if (!chat.user) return { id: chat.user, name: 'Неизвестный пользователь' };
            try {
              const userResponse = await axios.get<User>(`http://localhost:3000/users/${chat.user}`);
              return { id: chat.user, name: `${userResponse.data.name || ''} ${userResponse.data.surname || ''}`.trim() };
            } catch (error) {
              return { id: chat.user, name: 'Неизвестный пользователь' };
            }
          })
        );

        const clientMap: Record<string, string> = {};
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
      axios.get<Message[]>(`${API_BASE_URL}/${selectedChat}/messages`).then((response) => setMessages(response.data));
      setSelectedClientName(clients[selectedChat] || 'Неизвестный пользователь');
    }
  }, [selectedChat, clients]);

  useEffect(() => {
    const messageHandler = (supportRequest: { _id: string }, newMessage: Message) => {
      if (supportRequest._id === selectedChat) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
  
    socket.on('message', messageHandler);
  
    // Возвращаем функцию очистки, чтобы убрать обработчик при размонтировании
    return () => {
      socket.off('message', messageHandler);
    };
  }, [selectedChat]);

  const sendMessage = async () => {
    if (message.trim() && selectedChat) {
      try {
        const newMessage: Message = { author: managerName, text: message };
        setMessages((prev) => [...prev, newMessage]);
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
      setChats((prev) => prev.filter(chat => chat._id !== selectedChat));
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