export interface AiChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  model: string | null;
  tokens: number | null;
  createdAt: string;
}
