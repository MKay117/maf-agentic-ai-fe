import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import AttachmentPreview from "./AttachmentPreview";

const ChatInputWithUploads = ({ onSend, disabled, allowedTypes }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  // Default if not provided
  const acceptedTypes =
    allowedTypes ||
    ".json,.txt,.pdf,.docx,.doc,.zip,.png,.jpg,.jpeg,.gif,.webp,.xml,.yaml,.yml,.xlsx,.xls";

  const readFileContent = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;
        if (file.type.includes("json")) {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed);
          } catch (err) {
            resolve(result);
          }
          return;
        }
        resolve(result);
      };

      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileSelect = async (e) => {
    console.log(e, 1234);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const processed = [];
    for (const file of files) {
      const content = await readFileContent(file);
      processed.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
        fileObj: file,
      });
    }

    setAttachments((prev) => [...prev, ...processed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (name) => {
    setAttachments((prev) => prev.filter((file) => file.name !== name));
  };

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      await onSend(message, attachments);
      setMessage("");
      setAttachments([]);
    } finally {
      setSending(false);
    }
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
        borderRadius: "1rem",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
      }}
    >
      <AttachmentPreview
        attachments={attachments}
        onRemove={handleRemoveAttachment}
      />

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, p: 1 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes} // Uses the dynamic prop
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
        >
          <AttachFileIcon sx={{ transform: "rotate(45deg)" }} />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={5}
          placeholder="Evaluate the potential risks with changes in Architecture...."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { px: 1 },
          }}
        />

        <Tooltip
          title={`Restricted to BFSI Architecture Review.\nAllowed: ${acceptedTypes
            .replace(/\./g, "")
            .split(",")
            .slice(0, 5)
            .join(", ")}...`}
          arrow
          placement="top"
        >
          <InfoOutlinedIcon
            sx={{
              color: "text.secondary",
              fontSize: 18,
              cursor: "pointer",
              mb: "10px",
            }}
          />
        </Tooltip>

        <IconButton
          color="primary"
          disabled={
            disabled || sending || (!message.trim() && attachments.length === 0)
          }
          onClick={handleSend}
        >
          {sending ? <CircularProgress size={22} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInputWithUploads;
