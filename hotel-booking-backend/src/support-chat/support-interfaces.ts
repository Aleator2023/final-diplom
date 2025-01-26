import { Types } from 'mongoose';
import { SupportRequest } from '../schemas/support-request.schema';
import { Message } from '../schemas/message.schema';

export type ID = string | Types.ObjectId;

export interface CreateSupportRequestDto {
  user: ID;
  text: string;
}

export interface SendMessageDto {
  author: ID;
  supportRequest: ID;
  text: string;
}

export interface MarkMessagesAsReadDto {
  user: ID;
  supportRequest: ID;
  createdBefore: Date;
}

export interface GetChatListParams {
  user: ID | null;
  isActive?: boolean;
}

export interface ISupportRequestService {
  findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]>;
  sendMessage(data: SendMessageDto): Promise<Message>;
  getMessages(supportRequest: ID): Promise<Message[]>;
  subscribe(handler: (supportRequest: SupportRequest, message: Message) => void): () => void;
}