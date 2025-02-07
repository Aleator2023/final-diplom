import { Controller, Get, Post, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';
import { CreateSupportRequestDto, SendMessageDto, GetChatListParams } from './support-interfaces';

@Controller('support-chat')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Get()
  async getSupportRequests(@Query() params: GetChatListParams) {
    return this.supportChatService.findSupportRequests(params);
  }

  @Post()
  async createSupportRequest(@Body() data: CreateSupportRequestDto) {
    return this.supportChatService.createSupportRequest(data);
  }

  @Post(':supportRequestId/messages')
  async sendMessage(@Param('supportRequestId') supportRequestId: string, @Body() data: SendMessageDto) {
    return this.supportChatService.sendMessage({ ...data, supportRequest: supportRequestId });
  }

  @Get(':supportRequestId/messages')
  async getMessages(@Param('supportRequestId') supportRequestId: string) {
    return this.supportChatService.getMessages(supportRequestId);
  }


  @Delete(':supportRequestId/clear')
  async clearChat(@Param('supportRequestId') supportRequestId: string) {
    await this.supportChatService.clearMessages(supportRequestId);
    return { message: 'Чат очищен' };
 }
}