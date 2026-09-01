const BASE = import.meta.env.VITE_API_BASE_URL;

interface ChatAPIRequest {
  message: string;
  motorId: string;
  conversationId?: string;
  history?: { role: string; content: string }[];
  token: string;
}

interface ChatAPIResponse {
  reply: string;
  conversation_id: string;
}

export async function chatAPI({
  message,
  motorId,
  conversationId,
  history,
  token,
}: ChatAPIRequest): Promise<ChatAPIResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      motor_id: motorId,
      conversation_id: conversationId,
      history,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat request failed" }));
    throw new Error(err.detail || `Chat error ${res.status}`);
  }

  return res.json();
}
