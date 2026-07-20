# MotorChek API Integration Checklist

API Base URL: `https://motorchek.fastapicloud.dev` (from `.env`)
Authentication: Bearer token (JWT)

---

## Authentication

- [x] `POST /auth/login` — Login with email/password, receive JWT access token
  - **Implemented:** `src/lib/api/auth.ts` (`loginApi`, `getToken`, `setToken`, `clearToken`, `authHeaders`)
  - **Updated:** `src/components/AuthProvider.tsx` — calls real `/auth/login` endpoint
  - **Updated:** `src/pages/LoginPage.tsx` — removed demo account hints

---

## Motors

- [x] `POST /motors` — Create a new motor (requires auth)
- [x] `GET /motors` — List all motors with pagination (`skip`, `limit`)
- [x] `GET /motors/{motor_id}` — Get a single motor by ID
- [x] `PUT /motors/{motor_id}` — Update motor details
- [x] `DELETE /motors/{motor_id}` — Delete a motor (returns 204)
- [x] `POST /motors/{motor_id}/assign-spec` — Assign a spec to a motor

**Implemented:** `src/lib/api/motors.ts`
**Updated:** `MotorListPage`, `MotorDetailPage`, `MotorCreatePage`

---

## Specs

- [x] `POST /specs` — Create a motor spec (requires auth)
- [x] `GET /specs` — List specs with optional filters (`manufacturer`, `model`, `limit`)
- [x] `GET /specs/{spec_id}` — Get a single spec by ID

**Implemented:** `src/lib/api/specs.ts`

---

## Inspections

- [x] `POST /inspections` — Create an inspection record (requires auth)
- [x] `GET /inspections/{motor_id}` — Get inspection history for a motor with pagination (`limit`)

**Implemented:** `src/lib/api/inspections.ts`
**Updated:** `InspectionListPage`, `InspectionHistoryPage`, `NewInspectionPage`

---

## AI Analysis

- [x] `POST /ai/analyze` — Analyze motor health from readings (requires auth)

**Implemented:** `src/lib/api/ai.ts`
**Updated:** `AnalysisListPage`, `AnalysisResultPage`

---

## Documents

- [x] `POST /documents/upload` — Upload a file (multipart/form-data, requires auth)
- [x] `GET /documents/{doc_id}` — Retrieve a document by ID
- [x] `PATCH /documents/{doc_id}/metadata` — Update document metadata
- [x] `POST /documents/parse` — Parse a spec document (requires auth)
- [ ] `DELETE /documents/chunks/{doc_id}` — Delete document chunks
- [ ] `GET /documents/chunks` — Search document chunks

**Implemented:** `src/lib/api/documents.ts`
**Updated:** `DocumentUploadPage`

---

## Audit Logs

- [x] `GET /audit_logs` — List audit logs with filters (resource_type?, user_id?, limit?)

**Implemented:** `src/lib/api/audit.ts`

---

## Health / System

- [x] `GET /` — Root endpoint (no auth)
- [x] `GET /health` — Health check (no auth)
- [x] `GET /live` — Liveness probe (no auth)

**Implemented:** `src/lib/api/health.ts`

---

## Integration Progress

| Area | Status | Files |
|------|--------|-------|
| Auth | ✅ Done | `src/lib/api/auth.ts` |
| Motors | ✅ Done | `src/lib/api/motors.ts` |
| Specs | ✅ Done | `src/lib/api/specs.ts` |
| Inspections | ✅ Done | `src/lib/api/inspections.ts` |
| AI Analysis | ✅ Done | `src/lib/api/ai.ts` |
| Documents | ⚠️ Partial | `src/lib/api/documents.ts` |
| Audit Logs | ✅ Done | `src/lib/api/audit.ts` |
| Health | ✅ Done | `src/lib/api/health.ts` |

---

## Backend Gaps — Action Required

The following are needed from the backend team before certain features can be fully operational:

### 🔴 Critical

| # | Gap | Why It's Needed | What to Add |
|---|-----|-----------------|-------------|
| 1 | **`GET /documents`** — List all documents | `DocumentListPage` shows a grid of uploaded documents. No endpoint exists to fetch this list. Currently falls back to `MOCK_DOCUMENTS`. | Add `GET /documents` returning `DocumentListItem[]` with: `id`, `filename`, `manufacturer`, `model`, `uploaded_at`, `size_bytes`, `processed`, `is_duplicate`, `spec_id` |
| 2 | **`GET /motors` — no `status` field** | Frontend's `StatusBadge` renders motor status. The backend `MotorOut` includes `status` (string), but it's not being populated from the backend. Frontend shows `"unknown"` for all motors unless the backend derives status from inspection data. | Backend should compute and return `status` on `MotorOut` based on latest inspection analysis result, or confirm the field is populated |
| 3 | **`GET /motors` — no `facility` field** | Frontend expects `facility` (not `facility_id`) and `machine` (not `machine_id`) to match existing UI labels. Currently using `facility_id` / `machine_id` directly from API. | Either rename fields in response to `facility` and `machine`, or frontend team updates field mapping |

### 🟡 Medium

| # | Gap | Why It's Needed | What to Add |
|---|-----|-----------------|-------------|
| 4 | **`POST /inspections` — no auth on spec | The backend inspection endpoint doesn't have a `security` declaration in the spec, unlike every other protected endpoint. Verify if auth is required. | Confirm whether `POST /inspections` needs Bearer token. If yes, add security scheme to spec. |
| 5 | **`POST /ai/analyze` — needs latest inspection** | `AnalysisResultPage` fetches the latest inspection via `getInspections(motorId, 1)` then passes those `readings` to `/ai/analyze`. If no inspections exist, analysis can't run. This is handled gracefully (button disabled). | Consider adding `GET /motors/{motor_id}/latest-analysis` or similar to surface cached analysis results so the page can show history without needing to re-run |
| 6 | **Chunk search results have no schema** | `GET /documents/chunks` response is `{}` in the spec. `searchChunks()` in `src/lib/api/documents.ts` returns `unknown`. Frontend can't render chunk results without knowing the shape. | Define `ChunkSearchResult` schema with fields: `content`, `score`, `document_id`, `chunk_index` |
| 7 | **`GET /documents/{doc_id}` — empty schema** | Returns `{}` in spec. Frontend can't display document details without response fields. | Define `DocumentDetail` schema with at minimum: `id`, `filename`, `url`, `size_bytes`, `uploaded_at`, `processed` |

### 🟢 Low

| # | Gap | Why It's Needed | What to Add |
|---|-----|-----------------|-------------|
| 8 | **`POST /motors` — no `status` on creation** | `MotorCreate` doesn't accept `status`. New motors default to `"unknown"`. Consider allowing initial status or auto-computing from inspection data. | Add optional `status` field to `MotorCreate` or auto-derive from assigned spec thresholds |
| 9 | **`POST /inspections` — `technician_id` not sent** | Frontend sends `motor_id`, `shift`, `readings` but backend expects `technician_id` in `InspectionOut`. Since there's no auth context for technician, this likely comes from a JWT claim. | Confirm technician ID is extracted from auth token server-side, not passed in request body |
| 10 | **`GET /health` and `GET /live` response shape** | Both return `{}` in spec. Frontend has no need to display health data, but these are useful for monitoring. | Define response schemas (e.g., `{ status: "ok", timestamp: string }`) |

---

## Confirmed API Contract Issues

The following appear to be spec inconsistencies to be aware of:

- `POST /inspections` is missing `security` declaration (unlike all other protected endpoints)
- `POST /ai/analyze` is missing `security` declaration (unlike all other protected endpoints)
- `GET /documents/chunks` has `q` as required query param but no schema for the response items
- `GET /documents/{doc_id}` response schema is empty `{}`
- Several response schemas have `additionalProperties: true` (flexible/extensible) which is fine but makes type generation harder

---

## Error Handling

All endpoints return `422` with `HTTPValidationError` on validation failure.

## Security

All endpoints except `POST /auth/login`, `GET /`, `GET /health`, `GET /live` require:
```
Authorization: Bearer <access_token>
```