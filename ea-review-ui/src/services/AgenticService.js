const API_BASE = "http://localhost:8000";

async function handleResponse(res) {
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function streamReview(
  payload,
  { onStage, onFinal, onError } = {}
) {
  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

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
// Helper: Handle HTTP responses properly
// -------------------------------------------------------------
async function handleRes(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  // If response is empty
  const txt = await res.text();
  if (!txt) return null;

  return JSON.parse(txt);
}

// -------------------------------------------------------------
// 1️⃣ GET ALL SESSIONS — PAGINATED, METADATA ONLY
// Backend: GET /logs/all-sessions?page=N&page_size=N
// -------------------------------------------------------------
export async function getAllSessions(page = 1, pageSize = 10) {
  const url = `${API_BASE}/logs/all-sessions?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  return handleRes(res);

  /*
    Returns:
    {
      page: 1,
      page_size: 10,
      total: 123,
      items: [
        {
          session_id,
          review_id,
          timestamp,
          path
        }
      ]
    }
  */
}

// -------------------------------------------------------------
// 2️⃣ GET MONTHLY SESSIONS — PAGINATED, METADATA ONLY
// Backend: GET /logs/sessions?month=Nov+2025&page=N&page_size=N
// -------------------------------------------------------------
export async function getSessions(month, page = 1, pageSize = 10) {
  const encodedMonth = encodeURIComponent(month);
  const url = `${API_BASE}/logs/sessions?month=${encodedMonth}&page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  return handleRes(res);
}

// -------------------------------------------------------------
// 3️⃣ GET TIMELINE — YEARS WITH MONTHS WHERE LOGS EXIST
// Backend: GET /logs/timeline
// -------------------------------------------------------------
export async function getTimeline() {
  const res = await fetch(`${API_BASE}/logs/timeline`);
  return handleRes(res);

  /*
    Returns:
    {
      timeline: {
        2025: ["Dec", "Nov", "Oct"],
        2024: ["Dec", "Nov"]
      }
    }
  */
}

// -------------------------------------------------------------
// 4️⃣ GET FULL SESSION DETAILS — only API that downloads full JSON
// Backend: GET /logs/session/{session_id}
// -------------------------------------------------------------
export async function getSession(sessionId, month, year, date) {
  const params = new URLSearchParams();
  params.append("session_id", sessionId);

  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (date) params.append("date", date);

  const url = `${API_BASE}/logs/session?${params.toString()}`;
  const res = await fetch(url);
  return handleRes(res);
}

export default {
  postReview,
  getAllSessions,
  getSessions,
  getSession,
  getTimeline,
  streamReview,
};
