import { useState, useRef } from "react";
import { Box, IconButton, InputBase } from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

const ChatInputBar = ({ onSend, placeholder, disabled }) => {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text, []);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        width: "70%",
        px: 2,
        py: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        gap: 1,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <IconButton
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <AttachFileIcon sx={{ transform: "rotate(45deg)", color: "#111" }} />
      </IconButton>

      <input type="file" hidden ref={fileInputRef} multiple />

      <InputBase
        sx={{ flex: 1, fontSize: "1rem" }}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        multiline
        maxRows={4}
        disabled={disabled}
      />

      <IconButton
        color="primary"
        disabled={disabled || !text.trim()}
        onClick={handleSend}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInputBar;
