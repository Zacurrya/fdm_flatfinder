import React from "react";
import { Message } from "../../services/chatservice/models/message";

interface ChatMessageProps {
  message: Message;
}


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div style={styles.message}>
      <div style={styles.header}>
        <strong>User {message.senderId}</strong>
        <span style={styles.timestamp}>{formattedTime}</span>
      </div>
      <div style={styles.content}>{message.content}</div>
      {message.url && (
        <a href={message.url} style={styles.link} target="_blank" rel="noreferrer">
          {message.url}
        </a>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  message: {
    background: "#f1f1f1",
    borderRadius: "6px",
    padding: "6px 10px",
    maxWidth: "80%",
    wordBreak: "break-word",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    marginBottom: "4px",
  },
  timestamp: {
    color: "#999",
  },
  content: {
    fontSize: "1rem",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontSize: "0.85rem",
  },
};
