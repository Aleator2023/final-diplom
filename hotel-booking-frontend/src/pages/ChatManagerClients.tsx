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
  
      console.log("Запрашиваемый userId:", storedUserId); // Проверяем ID перед запросом
  
      if (storedUserId && storedToken) {
        try {
          const response = await axios.get<User>(`http://localhost:3000/users/${storedUserId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
  
          console.log("Полученные данные менеджера:", response.data); // Проверяем ответ сервера
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
        console.log("Загруженные чаты:", response.data); // 🔍 Проверяем, какие userId приходят
  
        setChats(response.data);
  
        const clientData = await Promise.all(
          response.data.map(async (chat) => {
            console.log(`Запрос на имя клиента userId=${chat.user}`); // 🔍 Проверяем userId
            
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
  
        console.log("Список клиентов:", clientMap); // 🔍 Проверяем, загружены ли имена
        setClients(clientMap);
      } catch (error) {
        console.error('Ошибка загрузки списка чатов:', error);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
  
    axios.get<Message[]>(`${API_BASE_URL}/${selectedChat}/messages`).then((response) => {
      setMessages(response.data);
    });
  
    // Ищем чат по его ID
    const chat = chats.find(c => c._id === selectedChat);
    
    // Получаем имя клиента (учитываем, что `clients` может ещё не загрузиться)
    if (chat && clients[chat.user]) {
      console.log(`Менеджер ведёт чат с пользователем: ${clients[chat.user]}`); // 🔍 Логируем имя клиента
      setSelectedClientName(clients[chat.user]);
    } else {
      setSelectedClientName('Неизвестный пользователь');
    }
  }, [selectedChat, clients]);

  useEffect(() => {
    const messageHandler = (supportRequest: { _id: string }, newMessage: Message) => {
      if (supportRequest._id === selectedChat) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on('message', messageHandler);
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
          <li key={chat._id} onClick={() => {
            console.log(`Выбран чат ${chat._id}, userId клиента: ${chat.user}`); // 🔍 Логируем выбор чата
            setSelectedChat(chat._id);
          }}>
            Чат с {clients[chat.user] ? clients[chat.user] : 'Неизвестным пользователем'}
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