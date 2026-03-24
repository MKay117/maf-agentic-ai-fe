import { getAuthToken, logout } from "./AuthService";

const API_BASE = "http://localhost:8000";

// The unified streaming function for the LiveReview page
export async function startReviewStream(
  { file, jsonPayload, sessionName, description },
  { onStage, onToken, onFinal, onError },
) {
  const formData = new FormData();

  if (file) formData.append("file", file);
  if (jsonPayload) formData.append("json_payload", jsonPayload);

  formData.append("session_name", sessionName || "Untitled Review");
  formData.append("description", description || "");

  const token = getAuthToken();

  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText || "Streaming request failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let sepIndex;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);

      if (!rawEvent.trim()) continue;

      const lines = rawEvent.split("\n");
      let eventName = "message";
      let dataText = "";

      lines.forEach((line) => {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) dataText += line.slice(5).trim();
      });

      if (!dataText) continue;

      let parsedData = {};
      try {
        parsedData = JSON.parse(dataText);
      } catch {
        parsedData = { text: dataText };
      }

      if (
        (eventName === "stage_start" || eventName === "stage_complete") &&
        onStage
      ) {
        onStage(eventName, parsedData);
      } else if (eventName === "token" && onToken) {
        onToken(parsedData);
      } else if (eventName === "final" && onFinal) {
        onFinal(parsedData);
      } else if (eventName === "error" && onError) {
        onError(parsedData.message || "Pipeline error");
      }
    }
  }
}
