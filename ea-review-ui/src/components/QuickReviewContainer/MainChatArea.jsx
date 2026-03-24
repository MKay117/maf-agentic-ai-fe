// src/components/MainChatArea.jsx
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReplayIcon from "@mui/icons-material/Replay";

import ChatInputBar from "./ChatInputBar";
import ChatEmptyState from "./ChatEmptyState";
import { streamChat, getCurrentSessionInfo } from "@/services/ChatService";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const THINKING_MESSAGES = [
  "Thinking…",
  "Analyzing your query…",
  "Processing your request…",
];

const MainChatArea = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [currentAssistantStream, setCurrentAssistantStream] = useState("");
  const [thinkingMessage, setThinkingMessage] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAssistantStream, thinkingMessage]);

  useEffect(() => {
    setMessages([]);
    setCurrentAssistantStream("");
    setThinkingMessage("");
  }, [sessionId]);

  const handleSend = async (text, attachments) => {
    const { sessionId, threadId } = getCurrentSessionInfo();

    setMessages((prev) => [...prev, { sender: "user", text, attachments }]);

    setThinkingMessage(
      THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
    );
    setCurrentAssistantStream("");

    await streamChat({
      prompt: text,
      files: attachments,
      sessionId,
      threadId,
      onChunk: (chunk) => {
        setThinkingMessage("");
        setCurrentAssistantStream((prev) => prev + chunk);
      },
      onDone: (full) => {
        setThinkingMessage("");
        setCurrentAssistantStream("");
        setMessages((prev) => [...prev, { sender: "assistant", text: full }]);
      },
      onError: (err) => {
        setThinkingMessage("");
        setCurrentAssistantStream("");
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: "⚠️ " + err.message },
        ]);
      },
    });
  };

  const handleRegenerate = async (index) => {
    const userMsg = messages[index - 1];
    if (!userMsg) return;

    const { sessionId, threadId } = getCurrentSessionInfo();

    setThinkingMessage(
      THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
    );
    setCurrentAssistantStream("");

    await streamChat({
      prompt: userMsg.text,
      files: userMsg.attachments,
      sessionId,
      threadId,
      onChunk: (chunk) => {
        setThinkingMessage("");
        setCurrentAssistantStream((prev) => prev + chunk);
      },
      onDone: (full) => {
        const updated = [...messages];
        updated[index] = { sender: "assistant", text: full };
        setMessages(updated);
        setCurrentAssistantStream("");
      },
    });
  };

  const MessageBubble = ({ sender, text, index }) => {
    const isUser = sender === "user";
    const handleCopy = () => navigator.clipboard.writeText(text);

    const isLastAssistant =
      sender === "assistant" &&
      index === messages.length - 1 &&
      !currentAssistantStream;

    return (
      <Box sx={{ width: "100%", mb: 3 }}>
        {isUser ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #ddd" }}>
              <Typography>{text}</Typography>
            </Paper>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              "&:hover .msg-actions": { opacity: 1 },
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {text}
            </ReactMarkdown>

            {/* Hover actions */}
            <Box
              className="msg-actions"
              sx={{
                position: "absolute",
                right: 0,
                bottom: -28,
                display: "flex",
                gap: 1,
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>

              {isLastAssistant && (
                <IconButton
                  size="small"
                  onClick={() => handleRegenerate(index)}
                >
                  <ReplayIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
        {messages.length === 0 &&
          !thinkingMessage &&
          !currentAssistantStream && <ChatEmptyState />}

        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} index={i} />
        ))}

        {thinkingMessage && (
          <Typography sx={{ fontStyle: "italic", color: "#777" }}>
            {thinkingMessage}
          </Typography>
        )}

        {currentAssistantStream && (
          <MessageBubble
            sender="assistant"
            text={`${currentAssistantStream}▍`}
            index={messages.length}
          />
        )}

        <div ref={chatEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ChatInputBar
          onSend={handleSend}
          disabled={!!thinkingMessage || !!currentAssistantStream}
          placeholder="Evaluate the potential risks with changes in Architecture..."
        />
      </Box>
    </Box>
  );
};

export default MainChatArea;
