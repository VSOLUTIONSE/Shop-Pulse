export interface AiReport {
  id: number;
  title: string | null;
  content: string;
  type: string | null;
  model: string | null;
  tokens: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: Date;
}
