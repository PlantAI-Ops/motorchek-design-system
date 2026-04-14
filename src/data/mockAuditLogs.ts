export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "UPLOAD" | "PARSE" | "ASSIGN";
export type AuditResource = "motor" | "spec" | "document" | "inspection" | "user";

export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  resource: AuditResource;
  resourceId: string;
  diff?: { before: Record<string, unknown>; after: Record<string, unknown> };
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "al-001", timestamp: "2026-04-10T14:23:01Z", action: "UPDATE", userId: "u2", userName: "Sarah Chen", userEmail: "supervisor@motorchek.io",
    resource: "motor", resourceId: "MTR-042",
    diff: { before: { status: "healthy" }, after: { status: "warning" } },
  },
  {
    id: "al-002", timestamp: "2026-04-10T13:10:45Z", action: "CREATE", userId: "u1", userName: "John Doe", userEmail: "admin@motorchek.io",
    resource: "motor", resourceId: "MTR-050",
    diff: { before: {}, after: { name: "Pump Motor #50", facility: "FAC-003", machine: "MCH-020" } },
  },
  {
    id: "al-003", timestamp: "2026-04-09T17:45:22Z", action: "UPLOAD", userId: "u2", userName: "Sarah Chen", userEmail: "supervisor@motorchek.io",
    resource: "document", resourceId: "DOC-008",
  },
  {
    id: "al-004", timestamp: "2026-04-09T17:50:10Z", action: "PARSE", userId: "u2", userName: "Sarah Chen", userEmail: "supervisor@motorchek.io",
    resource: "document", resourceId: "DOC-008",
    diff: { before: { processed: false }, after: { processed: true, specExtracted: "SPEC-012" } },
  },
  {
    id: "al-005", timestamp: "2026-04-09T11:02:33Z", action: "ASSIGN", userId: "u1", userName: "John Doe", userEmail: "admin@motorchek.io",
    resource: "motor", resourceId: "MTR-001",
    diff: { before: { specId: null }, after: { specId: "SPEC-003" } },
  },
  {
    id: "al-006", timestamp: "2026-04-08T09:30:00Z", action: "CREATE", userId: "u3", userName: "Mike Rivera", userEmail: "tech@motorchek.io",
    resource: "inspection", resourceId: "INS-120",
    diff: { before: {}, after: { motorId: "MTR-001", temperature: 78, vibration: 3.2, status: "warning" } },
  },
  {
    id: "al-007", timestamp: "2026-04-07T16:15:00Z", action: "DELETE", userId: "u1", userName: "John Doe", userEmail: "admin@motorchek.io",
    resource: "spec", resourceId: "SPEC-001",
    diff: { before: { manufacturer: "ABB", model: "OLD-100" }, after: {} },
  },
  {
    id: "al-008", timestamp: "2026-04-07T10:00:00Z", action: "UPDATE", userId: "u1", userName: "John Doe", userEmail: "admin@motorchek.io",
    resource: "user", resourceId: "u3",
    diff: { before: { role: "technician" }, after: { role: "supervisor" } },
  },
  {
    id: "al-009", timestamp: "2026-04-06T14:20:00Z", action: "CREATE", userId: "u3", userName: "Mike Rivera", userEmail: "tech@motorchek.io",
    resource: "inspection", resourceId: "INS-119",
  },
  {
    id: "al-010", timestamp: "2026-04-05T08:45:00Z", action: "UPLOAD", userId: "u1", userName: "John Doe", userEmail: "admin@motorchek.io",
    resource: "document", resourceId: "DOC-007",
  },
];
