import { Message } from "./models/message";

export class MessageBuilder {
  private content = "";
  private url?: string;
  private userId!: number;
  private mentions: number[] = [];

  setContent(content: string): this {
    this.content = content;
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setUser(userId: number): this {
    this.userId = userId;
    return this;
  }

  addMention(userId: number): this {
    this.mentions.push(userId);
    return this;
  }

  build(): Message {
    if (!this.userId) {
      throw new Error("User ID must be set before building a message.");
    }

    return {
      senderId: this.userId,
      content: this.content,
      url: this.url,
      mentions: this.mentions,
      timestamp: new Date()
    };
  }
}
