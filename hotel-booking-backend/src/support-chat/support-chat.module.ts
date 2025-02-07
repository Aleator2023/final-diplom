import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestSchema } from '../schemas/support-request.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { SupportChatService } from './support-chat.service';
import { SupportChatController } from './support-chat.controller';
import { SupportChatGateway } from './support-chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SupportRequest.name, schema: SupportRequestSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [SupportChatController],
  providers: [SupportChatService, SupportChatGateway], // ✅ Добавили WebSocket-шлюз
})
export class SupportChatModule {}