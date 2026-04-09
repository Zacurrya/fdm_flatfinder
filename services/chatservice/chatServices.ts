import { MessageDTO } from "./types/messageDTO";
import { MessageDeletionDTO } from "./types/messageDeletionDTO";
import { KickUserDTO } from "./types/kickUserDTO";
import { Message } from "./models/message";


export class ChatService {
  private readonly baseUrl = "/api/chat";

  async sendMessage(message: MessageDTO): Promise<Response> {
    return fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }

  async sendDirectMessage(message: MessageDTO): Promise<Response> {
    return fetch(`${this.baseUrl}/direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }

  async deleteMessage(request: MessageDeletionDTO): Promise<Response> {
    return fetch(`${this.baseUrl}/delete/${request.messageId}`, {
      method: "DELETE",
    });
  }

  async kickUser(request: KickUserDTO): Promise<Response> {
    return fetch(`${this.baseUrl}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }

 
  parseMessage(json: any): Message {
    return {
      messageId: json.messageId,
      senderId: json.senderId,
      content: json.content,
      chatGroup: json.chatGroup,
      timestamp: new Date(json.timestamp),
      mentions: json.mentions || [],
      url: json.url
    };
  }
}
