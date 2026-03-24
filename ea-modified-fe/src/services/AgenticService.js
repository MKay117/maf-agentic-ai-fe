import { getAuthToken, logout } from "./AuthService";

const API_BASE = "http://localhost:8000";

// Helper: Headers with Auth
function getHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function startArchitectureReview(
  title,
  description,
  file,
  { onStage, onToken, onFinal, onError } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("review_title", title);
  formData.append("review_description", description);

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  if (res.status === 401)
    throw new Error("Session expired. Please login again.");
  if (!res.ok)
    throw new Error((await res.text()) || "Review initiation failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseEventChunk = (chunkText) => {
    const lines = chunkText.split("\n");
    let eventName = "message";
    let dataText = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        // Use replace to carefully remove ONLY the "data:" prefix and optional leading space,
        // strictly preserving formatting, newlines, and trailing spaces required for valid JSON.
        dataText += line.replace(/^data:\s?/, "");
      }
    }

    let data = null;
    if (dataText) {
      try {
        data = JSON.parse(dataText);
      } catch {
        data = { text: dataText };
      }
    }

    if (eventName === "stage_start" || eventName === "stage_complete") {
      if (onStage) onStage({ type: eventName, ...data });
    } else if (eventName === "token") {
      if (onToken) onToken(data);
    } else if (eventName === "final") {
      if (onFinal) onFinal(data);
    } else if (eventName === "error") {
      if (onError) onError(data);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sepIndex;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (rawEvent.trim()) parseEventChunk(rawEvent);
    }
  }
}

async function handleResponse(res) {
  // Handle 401 Unauthorized globally
  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please login again.");
  }

  const txt = await res.text();
  try {
    const json = txt ? JSON.parse(txt) : null;
    if (!res.ok) {
      const err = new Error(json?.detail || res.statusText || "Request failed");
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  } catch (e) {
    if (!res.ok) throw e;
    return txt;
  }
}

export async function postReview(payload) {
  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function streamReview(
  payload,
  { onStage, onFinal, onError } = {},
) {
  const res = await fetch(`${API_BASE}/review/stream`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    logout();
    return;
  }

  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText || "Streaming request failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseEventChunk = (chunkText) => {
    const lines = chunkText.split("\n").filter(Boolean);
    let eventName = "message";
    let dataText = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataText += line.slice(5).trim();
      }
    }

    let data = null;
    if (dataText) {
      try {
        data = JSON.parse(dataText);
      } catch {}
    }

    if (eventName === "stage" && onStage) onStage(data);
    if (eventName === "final" && onFinal) onFinal(data);
    if (eventName === "error" && onError) onError(data);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let sepIndex;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (rawEvent.trim()) parseEventChunk(rawEvent);
    }
  }
}

// -------------------------------------------------------------
// GET Requests (Updated with Auth Headers)
// -------------------------------------------------------------

export async function getAllSessions(
  page = 1,
  pageSize = 10,
  reviewType = null,
) {
  let url = `${API_BASE}/logs/all-sessions?page=${page}&page_size=${pageSize}`;
  if (reviewType) {
    url += `&review_type=${encodeURIComponent(reviewType)}`;
  }
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getSessions(month, page = 1, pageSize = 10) {
  const encodedMonth = encodeURIComponent(month);
  const url = `${API_BASE}/logs/sessions?month=${encodedMonth}&page=${page}&page_size=${pageSize}`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getTimeline() {
  const res = await fetch(`${API_BASE}/logs/timeline`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getSession(sessionId, month, year, date) {
  const params = new URLSearchParams();
  params.append("session_id", sessionId);
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (date) params.append("date", date);

  const url = `${API_BASE}/logs/session?${params.toString()}`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse(res);
}

// // Add this to your existing AgenticService.js

// export async function startArchitectureReview(title, description, file, { onStage, onFinal, onError } = {}) {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("review_title", title);
//   formData.append("review_description", description);

//   const token = getAuthToken();

//   const res = await fetch(`${API_BASE}/review`, {
//     method: "POST",
//     headers: {
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       // Do NOT set Content-Type, browser sets it for FormData
//     },
//     body: formData,
//   });

//   if (res.status === 401) {
//     logout();
//     throw new Error("Session expired. Please login again.");
//   }

//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(txt || "Review initiation failed");
//   }

//   // Assuming your backend returns a stream for this endpoint as well.
//   // If it returns standard JSON, replace this stream logic with a standard `await res.json()`.
//   const reader = res.body.getReader();
//   const decoder = new TextDecoder();
//   let buffer = "";

//   const parseEventChunk = (chunkText) => {
//     const lines = chunkText.split("\n").filter(Boolean);
//     let eventName = "message";
//     let dataText = "";
//     for (const line of lines) {
//       if (line.startsWith("event:")) eventName = line.slice(6).trim();
//       else if (line.startsWith("data:")) dataText += line.slice(5).trim();
//     }
//     let data = null;
//     if (dataText) {
//       try { data = JSON.parse(dataText); } catch {}
//     }

//     if (eventName === "stage" && onStage) onStage(data);
//     if (eventName === "final" && onFinal) onFinal(data);
//     if (eventName === "error" && onError) onError(data);
//   };

//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) break;
//     buffer += decoder.decode(value, { stream: true });
//     let sepIndex;
//     while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
//       const rawEvent = buffer.slice(0, sepIndex);
//       buffer = buffer.slice(sepIndex + 2);
//       if (rawEvent.trim()) parseEventChunk(rawEvent);
//     }
//   }
// }

export async function uploadReview(file, { onStage, onFinal, onError } = {}) {
  const formData = new FormData();
  formData.append("file", file); // Must match "file" in backend @router.post

  const token = getAuthToken(); // Make sure this is imported or available

  const res = await fetch(`${API_BASE}/review/upload`, {
    method: "POST",
    headers: {
      // NOTE: Do NOT set Content-Type header manually for FormData.
      // The browser sets it automatically with the boundary.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401) {
    logout();
    return;
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Upload failed");
  }

  // Reuse the exact same stream reader logic as streamReview
  // (You might want to extract the reader logic into a helper function to avoid duplication)
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseEventChunk = (chunkText) => {
    // ... (Copy the exact parsing logic from streamReview) ...
    const lines = chunkText.split("\n").filter(Boolean);
    let eventName = "message";
    let dataText = "";
    for (const line of lines) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataText += line.slice(5).trim();
    }
    let data = null;
    if (dataText)
      try {
        data = JSON.parse(dataText);
      } catch {}

    if (eventName === "stage" && onStage) onStage(data);
    if (eventName === "final" && onFinal) onFinal(data);
    if (eventName === "error" && onError) onError(data);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sepIndex;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (rawEvent.trim()) parseEventChunk(rawEvent);
    }
  }
}

// --- STANDARD (SIMPLE) STREAMING REVIEW ---

export async function streamStandardReview(
  { file, textprompt },
  { onStage, onData, onFinal, onError } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  if (textprompt) formData.append("textprompt", textprompt);

  const token = getAuthToken();

  const res = await fetch(`${API_BASE}/review/simple`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401) {
    logout();
    return;
  }

  if (!res.ok || !res.body) {
    throw new Error("Standard review streaming failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseEvent = (chunk) => {
    const lines = chunk.split("\n").filter(Boolean);
    let event = "data";
    let payload = "";

    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) payload += line.slice(5).trim();
    }

    let data;
    try {
      data = payload ? JSON.parse(payload) : null;
    } catch {
      data = { text: payload };
    }

    if (event === "stage" && onStage) onStage(data);
    if (event === "data" && onData) onData(data);
    if (event === "final" && onFinal) onFinal(data);
    if (event === "error" && onError) onError(data);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (raw.trim()) parseEvent(raw);
    }
  }
}

export default {
  postReview,
  streamReview,
  getAllSessions,
  getSessions,
  getSession,
  getTimeline,
  uploadReview,
  streamStandardReview,
  // startArchitectureReview
};
