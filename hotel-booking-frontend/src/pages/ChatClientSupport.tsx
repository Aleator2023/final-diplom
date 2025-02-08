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

interface Message {
  author: string;
  text: string;
}

interface Chat {
  _id: string;
  messages: Message[];
}

const ChatClientSupport = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');
      if (storedUserId && storedToken) {
        try {
          const response = await axios.get<User>(`http://localhost:3000/users/${storedUserId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUserName(`${response.data.name || ''} ${response.data.surname || ''}`.trim());
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
        const response = await axios.get<Chat[]>(`${API_BASE_URL}?user=123`);
        if (response.data.length > 0) {
          setChatId(response.data[0]._id);
          setMessages(response.data[0].messages);
        } else {
          const newChatResponse = await axios.post<Chat>(API_BASE_URL, { user: '123', text: 'Начало чата', userName });
          setChatId(newChatResponse.data._id);
          setMessages(newChatResponse.data.messages);
        }
      } catch (error) {
        console.error("Ошибка загрузки чата:", error);
      }
    };
    fetchChat();
  }, [userName]);

  useEffect(() => {
    const messageHandler = (supportRequest: { _id: string }, newMessage: Message) => {
      if (supportRequest._id === chatId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on('message', messageHandler);
    return () => {
      socket.off('message', messageHandler);
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (message.trim() && chatId) {
      try {
        const newMessage: Message = { author: userName, text: message };
        setMessages((prev) => [...prev, newMessage]);
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
            <p key={index}><strong>{msg.author}</strong>: {msg.text}</p>
          ))}
        </div>
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default ChatClientSupport;