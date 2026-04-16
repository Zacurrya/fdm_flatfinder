import { useEffect, useState } from "react";
import { ChatService } from "../../services/chatservice/chatServices";        
import { MessageBuilder } from "../../services/chatservice/messageBuilder";   
import { Message } from "../../services/chatservice/models/message";          
import { ChatInput } from "./chatInput";
import { ChatMessage } from "./chatMessage";
                 



export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const chatService = new ChatService();


  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat/history"); 
        const data = await res.json();
        setMessages(data.map((m: any) => chatService.parseMessage(m)));
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSend = async (text: string) => {
    const builder = new MessageBuilder()
      .setContent(text)
      .setUser(1); 
    const newMessage = builder.build();

    await chatService.sendMessage({
      senderId: newMessage.senderId,
      targetId: 2, 
      content: newMessage.content,
    });

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Chat</h2>

      <div style={styles.messages}>
        {loading
          ? <div>Loading...</div>
          : messages.map((msg) => (
              <ChatMessage key={msg.timestamp?.toISOString() || Math.random()} message={msg} />
            ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
};


const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "400px",
    height: "600px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    background: "#f3f3f3",
    padding: "10px",
    borderBottom: "1px solid #ccc",
  },
  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};
