import { API_BASE_URL, authHeaders } from "./auth";

export interface AnalyzeRequest {
  motor_id: string;
  readings: Record<string, unknown>;
}

export interface AnalyzeResponse {
  rule_status: string;
  rule_score: number;
  ai_status: string;
  explanation: string;
  recommendations: string[];
  follow_up_questions: string[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function analyzeMotor(data: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}