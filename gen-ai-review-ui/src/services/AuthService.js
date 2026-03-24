const API_BASE = "http://localhost:8000"; // Ensure this matches your BE port

const TOKEN_EXPIRY_HOURS = 8;

export async function login(username, password, rememberMe = false) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, remember_me: rememberMe }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Authentication failed");
    }

    const data = await res.json();
    const expiryTime = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("token_expiry", expiryTime.toString());
    localStorage.setItem("user", JSON.stringify(data.user_info));

    return data;
  } catch (error) {
    throw error;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("token_expiry");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const expiry = localStorage.getItem("token_expiry");
  if (!expiry || Date.now() > Number(expiry)) {
    return null;
  }

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function isTokenExpired() {
  const expiry = localStorage.getItem("token_expiry");
  if (!expiry) return true;

  return Date.now() > Number(expiry);
}

export function handleSessionExpiry() {
  localStorage.removeItem("token");
  localStorage.removeItem("token_expiry");
  localStorage.removeItem("user");
}
