import { API_BASE_URL, authHeaders } from "./auth";

export interface ReadingsInput {
  temperature: number;
  vibration: number;
  noise: "quiet" | "moderate" | "loud";
  condition: "clean" | "dusty" | "wet" | "corroded";
}

export interface AnalysisResult {
  status: "healthy" | "warning" | "critical";
  score: number;
  anomalies: string[];
  recommendations: string[];
}

export interface InspectionOut {
  id: string;
  motor_id: string;
  technician_id: string;
  timestamp: string;
  shift: string;
  readings: ReadingsInput;
  analysis: AnalysisResult | null;
}

export interface InspectionListItem {
  id: string;
  motor_id: string;
  motor: string;
  timestamp: string;
  shift: string;
  temperature_c: number;
  vibration: number;
  condition: string;
  status: string;
  score: number;
}

export interface InspectionCreate {
  motor_id: string;
  shift: "morning" | "afternoon" | "night";
  readings: ReadingsInput;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function listInspections(skip = 0, limit = 50): Promise<InspectionListItem[]> {
  const res = await fetch(`${API_BASE_URL}/inspections?skip=${skip}&limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getInspections(motorId: string, limit = 20): Promise<InspectionOut[]> {
  const res = await fetch(`${API_BASE_URL}/inspections/${motorId}?limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createInspection(data: InspectionCreate): Promise<InspectionOut> {
  const res = await fetch(`${API_BASE_URL}/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}