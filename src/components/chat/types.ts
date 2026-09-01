export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  motorId?: string;
  timestamp: Date;
}
