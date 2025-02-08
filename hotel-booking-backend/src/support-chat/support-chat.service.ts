import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter } from 'events';
import { SupportRequest } from '../schemas/support-request.schema';
import { Message } from '../schemas/message.schema';
import { 
  CreateSupportRequestDto, 
  SendMessageDto, 
  GetChatListParams, 
  ISupportRequestService,
  ID 
} from './support-interfaces';

@Injectable()
export class SupportChatService implements ISupportRequestService {
  private readonly eventEmitter = new EventEmitter();

  constructor(
    @InjectModel(SupportRequest.name) private supportRequestModel: Model<SupportRequest>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]> {
    const query = this.supportRequestModel.find();

    if (params.user) {
      query.where('user').equals(params.user);
    }
    if (params.isActive !== undefined) {
      query.where('isActive').equals(params.isActive);
    }

    return query.exec();
  }

  async createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequest> {
    const initialMessage = await this.messageModel.create({
      author: data.user,
      text: data.text,
      sentAt: new Date(),
    });

    const supportRequest = await this.supportRequestModel.create({
      user: data.user,
      messages: [initialMessage],
      isActive: true,
      createdAt: new Date(),
    });

    return supportRequest;
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const supportRequest = await this.supportRequestModel.findById(data.supportRequest).exec();

    if (!supportRequest) {
      throw new NotFoundException('Support request not found');
    }

    const message = await this.messageModel.create({
      author: data.author,
      text: data.text,
      sentAt: new Date(),
    });

    supportRequest.messages.push(message);
    await supportRequest.save();

    this.eventEmitter.emit('message', supportRequest, message);

    return message;
  }

  async getMessages(supportRequest: ID): Promise<Message[]> {
    const request = await this.supportRequestModel.findById(supportRequest).exec();
    if (!request) {
      throw new NotFoundException('Support request not found');
    }
    return request.messages;
  }

  subscribe(handler: (supportRequest: SupportRequest, message: Message) => void): () => void {
    this.eventEmitter.on('message', handler);
    return () => this.eventEmitter.off('message', handler);
  }

  async clearMessages(supportRequestId: string): Promise<void> {
    const supportRequest = await this.supportRequestModel.findById(supportRequestId);
    if (!supportRequest) {
      throw new NotFoundException('Чат не найден');
    }
  
    supportRequest.messages = []; // Очистка массива сообщений
    await supportRequest.save();
  }

  async deleteChat(supportRequestId: string): Promise<void> {
    const supportRequest = await this.supportRequestModel.findById(supportRequestId);
    if (!supportRequest) {
      throw new NotFoundException('Чат не найден');
    }
  
    await this.messageModel.deleteMany({ _id: { $in: supportRequest.messages } }); // Удаляем сообщения чата
    await this.supportRequestModel.findByIdAndDelete(supportRequestId); // Удаляем сам чат
  }

}