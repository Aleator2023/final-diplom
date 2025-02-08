import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { SupportChatService } from './support-chat.service';
  import { SendMessageDto } from './support-interfaces';
  
  @WebSocketGateway({ cors: { origin: '*' } }) // Разрешаем CORS
  export class SupportChatGateway {
    @WebSocketServer() server: Server;
  
    constructor(private readonly supportChatService: SupportChatService) {}
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() data: { supportRequestId: string; message: SendMessageDto }, @ConnectedSocket() client: Socket) {
      const message = await this.supportChatService.sendMessage({
        author: data.message.author,
        text: data.message.text,
        supportRequest: data.supportRequestId,
      });
  
      // Отправляем сообщение ВСЕМ участникам чата (клиенту и менеджеру)
      this.server.emit('message', { supportRequestId: data.supportRequestId, newMessage: message });
  
      return message;
    }
  }
