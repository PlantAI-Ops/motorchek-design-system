import { API_BASE_URL, authHeaders } from "./auth";

export interface AuditLogOut {
  id: string;
  action: string;
  user_id: string;
  timestamp: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, unknown>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function listAuditLogs(resourceType?: string, userId?: string, limit = 100): Promise<AuditLogOut[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (resourceType) params.set("resource_type", resourceType);
  if (userId) params.set("user_id", userId);
  const res = await fetch(`${API_BASE_URL}/audit_logs?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}