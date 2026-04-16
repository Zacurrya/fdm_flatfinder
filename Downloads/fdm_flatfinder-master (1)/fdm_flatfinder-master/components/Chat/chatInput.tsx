import React, { useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={styles.input}
      />
      <button onClick={handleSend} style={styles.button}>
        Send
      </button>
    </div>
  );
};

// Inline styles (replace with CSS or Tailwind if you prefer)
const styles: Record<string, React.CSSProperties> = {
  container: {
    borderTop: "1px solid #ddd",
    padding: "10px",
    display: "flex",
    background: "#fafafa",
  },
  input: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    marginRight: "8px",
    fontSize: "1rem",
  },
  button: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
  },
};
