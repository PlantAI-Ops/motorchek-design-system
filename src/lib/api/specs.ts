import { API_BASE_URL, authHeaders } from "./auth";

export interface MotorSpecNormalized {
  temperature: { min: number; max: number };
  vibration: { min: number; max: number };
  rpm: number;
}

export interface MotorSpecOut {
  id: string;
  manufacturer: string;
  model: string;
  normalized: MotorSpecNormalized;
  raw_document_id: string | null;
  confidence: number;
  created_at: string;
}

export interface MotorSpecCreate {
  manufacturer: string;
  model: string;
  normalized: MotorSpecNormalized;
  raw_document_id?: string;
  confidence?: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function listSpecs(manufacturer?: string, model?: string, limit = 20): Promise<MotorSpecOut[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (manufacturer) params.set("manufacturer", manufacturer);
  if (model) params.set("model", model);
  const res = await fetch(`${API_BASE_URL}/specs?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getSpec(specId: string): Promise<MotorSpecOut> {
  const res = await fetch(`${API_BASE_URL}/specs/${specId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createSpec(data: MotorSpecCreate): Promise<MotorSpecOut> {
  const res = await fetch(`${API_BASE_URL}/specs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}