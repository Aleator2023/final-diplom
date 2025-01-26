import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';
import { Types } from 'mongoose';

export type ID = string | Types.ObjectId;

// Интерфейс для параметров поиска гостиниц
export interface SearchHotelParams {
  limit: number;       // Максимальное количество записей для возврата
  offset: number;      // Количество записей для пропуска (для постраничной загрузки)
  title?: string;      // Название гостиницы для частичного поиска
}

// Интерфейс для параметров обновления гостиницы
export interface UpdateHotelParams {
  title?: string;       // Обновленное название гостиницы
  description?: string; // Обновленное описание гостиницы
}

// Интерфейс сервиса для работы с моделью Hotel
export interface IHotelService {
  createHotel(data: Partial<Hotel>): Promise<Hotel>;               // Создание новой гостиницы
  findById(id: ID): Promise<Hotel>;                                // Поиск гостиницы по ID
  search(params: SearchHotelParams): Promise<Hotel[]>;             // Поиск гостиниц с фильтрацией
  update(id: ID, data: UpdateHotelParams): Promise<Hotel>;         // Обновление данных гостиницы
}

// Интерфейс для параметров поиска номеров гостиниц
export interface SearchRoomsParams {
  limit: number;       // Максимальное количество записей для возврата
  offset: number;      // Количество записей для пропуска (для постраничной загрузки)
  hotel: ID;           // ID гостиницы, к которой принадлежит номер
  isEnabled?: boolean; // Флаг доступности номера (true/false)
}

// Интерфейс для параметров обновления номера гостиницы
export interface UpdateHotelRoomParams {
  description?: string; // Обновленное описание номера
  images?: string[];    // Массив обновленных URL изображений
  isEnabled?: boolean;  // Обновленное состояние доступности номера
}

// Интерфейс сервиса для работы с моделью HotelRoom
export interface IHotelRoomService {
  createRoom(data: Partial<HotelRoom>): Promise<HotelRoom>;              // Создание нового номера
  findRoomById(id: ID): Promise<HotelRoom>;                              // Поиск номера по ID
  searchRooms(params: SearchRoomsParams): Promise<HotelRoom[]>;          // Поиск номеров с фильтрацией
  updateRoom(id: ID, data: UpdateHotelRoomParams): Promise<HotelRoom>;   // Обновление данных номера
}