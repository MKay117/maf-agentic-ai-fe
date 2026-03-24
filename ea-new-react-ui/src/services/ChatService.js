import { v4 as uuidv4 } from "uuid";

let currentSessionId = null;
let currentThreadId = null;

export function startNewLocalSession() {
  currentSessionId = uuidv4();
  currentThreadId = null;
}

export function getCurrentSessionInfo() {
  return {
    sessionId: currentSessionId,
    threadId: currentThreadId,
  };
}

export async function streamChat({
  prompt,
  files,
  sessionId,
  threadId,
  onChunk,
  onDone,
  onError,
}) {
  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("session_id", sessionId || "");
    form.append("thread_id", threadId || "");

    (files || []).forEach((f) => {
      form.append("files", f.originalFile || f.file || f);
    });

    const response = await fetch("http://127.0.0.1:8000/chat/stream", {
      method: "POST",
      body: form,
    });

    if (!response.ok) throw new Error("Network error");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      let chunk = decoder.decode(value);

      // Skip metadata chunks
      if (chunk.startsWith("[META]")) {
        const meta = JSON.parse(chunk.replace("[META]", ""));
        currentSessionId = meta.session_id;
        currentThreadId = meta.thread_id;
        continue;
      }

      fullText += chunk;
      onChunk && onChunk(chunk);
    }

    // Sanitize any accidental metadata leakage
    fullText = fullText.replace(/\[META\].*$/, "");

    onDone && onDone(fullText);
  } catch (err) {
    console.error("Stream error:", err);
    onError && onError(err);
  }
}
