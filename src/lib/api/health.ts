import { API_BASE_URL } from "./auth";

export interface HealthResponse {
  status?: string;
  [key: string]: unknown;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function getLive(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/live`);
  return res.json();
}

export async function getRoot(): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/`);
  return res.json();
}