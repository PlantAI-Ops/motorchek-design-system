export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginApi(credentials: LoginRequest): Promise<Token> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Login failed (${res.status})`);
  }

  return res.json();
}

export function getToken(): string | null {
  return localStorage.getItem("motorchek-token");
}

export function setToken(token: Token): void {
  localStorage.setItem("motorchek-token", token.access_token);
  localStorage.setItem("motorchek-token-type", token.token_type);
}

export function clearToken(): void {
  localStorage.removeItem("motorchek-token");
  localStorage.removeItem("motorchek-token-type");
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}