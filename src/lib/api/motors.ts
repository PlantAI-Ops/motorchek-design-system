import { API_BASE_URL, authHeaders } from "./auth";

export interface MotorOut {
  id: string;
  name: string;
  facility: string;
  machine: string;
  spec_id: string | null;
  status: string;
  created_at: string;
  model: string;
  manufacturer: string;
  last_inspection_date?: string;
  last_inspection_score?: number;
  last_inspection_status?: string;
  total_inspections?: number;
}

export interface MotorCreate {
  name: string;
  facility_id: string;
  machine_id: string;
  spec_id?: string;
}

export interface MotorUpdate {
  name?: string;
  facility_id?: string;
  machine_id?: string;
  spec_id?: string;
  status?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function listMotors(skip = 0, limit = 20): Promise<MotorOut[]> {
  const res = await fetch(`${API_BASE_URL}/motors?skip=${skip}&limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getMotor(motorId: string): Promise<MotorOut> {
  const res = await fetch(`${API_BASE_URL}/motors/${motorId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createMotor(data: MotorCreate): Promise<MotorOut> {
  const res = await fetch(`${API_BASE_URL}/motors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateMotor(motorId: string, data: MotorUpdate): Promise<MotorOut> {
  const res = await fetch(`${API_BASE_URL}/motors/${motorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteMotor(motorId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/motors/${motorId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Delete failed (${res.status})`);
  }
}

export async function assignSpec(motorId: string, specId: string): Promise<MotorOut> {
  const res = await fetch(`${API_BASE_URL}/motors/${motorId}/assign-spec`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ spec_id: specId }),
  });
  return handleResponse(res);
}