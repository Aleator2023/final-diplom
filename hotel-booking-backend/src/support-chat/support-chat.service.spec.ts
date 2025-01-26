import { Test, TestingModule } from '@nestjs/testing';
import { SupportChatService } from './support-chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { SupportRequest } from '../schemas/support-request.schema';
import { Message } from '../schemas/message.schema';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Types } from 'mongoose';

const mockSupportRequest = {
  _id: new Types.ObjectId(),
  user: new Types.ObjectId(),
  createdAt: new Date(),
  messages: [],
  isActive: true,
  save: jest.fn().mockResolvedValue(true), 
};

const mockMessage = {
  _id: new Types.ObjectId(),
  author: new Types.ObjectId(),
  text: 'Test message',
  sentAt: new Date(),
  readAt: null,
};

const mockSupportRequestModel = {
  findById: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockSupportRequest),
  })),
  find: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  equals: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([mockSupportRequest]),
  create: jest.fn().mockResolvedValue(mockSupportRequest),
};

const mockMessageModel = {
  create: jest.fn().mockResolvedValue(mockMessage),
};

describe('SupportChatService', () => {
  let service: SupportChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportChatService,
        { provide: getModelToken(SupportRequest.name), useValue: mockSupportRequestModel },
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
      ],
    }).compile();

    service = module.get<SupportChatService>(SupportChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message and emit an event', async () => {
    const handler = jest.fn();
    service.subscribe(handler);

    const result = await service.sendMessage({
      author: mockMessage.author,
      supportRequest: mockSupportRequest._id,
      text: mockMessage.text,
    });

    expect(result).toEqual(mockMessage);
    expect(mockMessageModel.create).toHaveBeenCalledWith({
      author: mockMessage.author,
      text: mockMessage.text,
      sentAt: expect.any(Date),
    });
    expect(mockSupportRequest.messages).toContain(mockMessage);
    expect(mockSupportRequest.save).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(mockSupportRequest, mockMessage);
  });
});