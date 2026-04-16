import { Message } from "./message";

export interface ChatGroup {
  chatId: number;
  city: string;
  officeLocation: string;
  messageHistory: Message[];
}
