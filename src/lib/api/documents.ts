import { API_BASE_URL, authHeaders } from "./auth";

export interface DocumentOut {
  id: string;
  filename: string;
  processed: boolean;
  chunks_count: number;
  is_duplicate: boolean;
}

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  processed: boolean;
  chunks_count: number;
  is_duplicate: boolean;
}

export interface DocumentMetadataUpdate {
  manufacturer?: string | null;
  model?: string | null;
  filename?: string | null;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function uploadDocument(file: File, manufacturer?: string, model?: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (manufacturer) formData.append("manufacturer", manufacturer);
  if (model) formData.append("model", model);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function getDocument(docId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updateDocumentMetadata(docId: string, data: DocumentMetadataUpdate): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function parseSpecDocument(documentId: string, manufacturerHint?: string, modelHint?: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/documents/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ document_id: documentId, manufacturer_hint: manufacturerHint, model_hint: modelHint }),
  });
  return handleResponse(res);
}

export async function deleteDocumentChunks(docId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/chunks/${docId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
}

export async function searchChunks(q: string, manufacturer?: string, model?: string, topK = 5): Promise<unknown> {
  const params = new URLSearchParams({ q, top_k: String(topK) });
  if (manufacturer) params.set("manufacturer", manufacturer);
  if (model) params.set("model", model);
  const res = await fetch(`${API_BASE_URL}/documents/chunks?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}